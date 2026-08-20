"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { RoleRecord, UserRecord } from "@/lib/types";
import { createUser, updateUser } from "@/lib/api";
import { Button } from "@/ui/Button";
import { Field } from "@/ui/Field";
import { Input } from "@/ui/Input";
import { Select } from "@/ui/Select";

interface UserFormProps {
  mode: "create" | "edit";
  roles: RoleRecord[];
  initialData?: UserRecord;
}

export function UserForm({ mode, roles, initialData }: UserFormProps) {
  const router = useRouter();

  const [username, setUsername] = useState(initialData?.username ?? "");
  const [name, setName] = useState(initialData?.name ?? "");
  const [roleId, setRoleId] = useState(initialData?.role.id ?? roles[0]?.id ?? "");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !name.trim() || !roleId) {
      setError("Fill in username, name, and role.");
      return;
    }
    if (mode === "create" && password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (mode === "edit" && password && password.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createUser({ username: username.trim(), name: name.trim(), password, role_id: roleId });
      } else if (initialData) {
        await updateUser(initialData.id, {
          username: username.trim(),
          name: name.trim(),
          role_id: roleId,
          ...(password ? { password } : {}),
        });
      }
      router.push("/users");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : mode === "create"
            ? "Could not create the user."
            : "Could not save changes."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="name">
          <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field label="Username" htmlFor="username" hint="Lowercase letters, numbers, dots, underscores, hyphens">
          <Input
            id="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="off"
            required
          />
        </Field>
      </div>

      <Field label="Role" htmlFor="roleId" hint="Decides which pages and actions this user can access">
        <Select id="roleId" value={roleId} onChange={(event) => setRoleId(event.target.value)} required>
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label={mode === "create" ? "Password" : "New password"}
        htmlFor="password"
        hint={mode === "edit" ? "Leave blank to keep the current password." : "At least 8 characters."}
      >
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required={mode === "create"}
        />
      </Field>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving" : mode === "create" ? "Create user" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/users")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
