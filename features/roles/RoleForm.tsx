"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ALL_PERMISSIONS, PERMISSION_INFO, type Permission, type RoleRecord } from "@/lib/types";
import { createRole, updateRole } from "@/lib/api";
import { Button } from "@/ui/Button";
import { Field } from "@/ui/Field";
import { Input } from "@/ui/Input";

interface RoleFormProps {
  mode: "create" | "edit";
  initialData?: RoleRecord;
}

export function RoleForm({ mode, initialData }: RoleFormProps) {
  const router = useRouter();
  const readOnly = initialData?.is_system ?? false;

  const [name, setName] = useState(initialData?.name ?? "");
  const [permissions, setPermissions] = useState<Set<Permission>>(
    new Set(initialData?.permissions ?? [])
  );

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function togglePermission(permission: Permission) {
    setPermissions((current) => {
      const next = new Set(current);
      if (next.has(permission)) {
        next.delete(permission);
      } else {
        next.add(permission);
      }
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Give this role a name.");
      return;
    }

    const payload = { name: name.trim(), permissions: Array.from(permissions) };

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createRole(payload);
      } else if (initialData) {
        await updateRole(initialData.id, payload);
      }
      router.push("/roles");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error && err.message
          ? err.message
          : mode === "create"
            ? "Could not create the role."
            : "Could not save changes."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {readOnly ? (
        <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs font-medium text-accent">
          This is a built-in role. It always has every permission and cannot be renamed or changed.
        </p>
      ) : null}

      <Field label="Role name" htmlFor="name">
        <Input
          id="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={readOnly}
          required
        />
      </Field>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-text">Permissions</span>
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {ALL_PERMISSIONS.map((permission) => {
            const info = PERMISSION_INFO[permission];
            const checked = readOnly || permissions.has(permission);
            return (
              <label
                key={permission}
                className="flex items-start gap-3 px-3 py-2.5 text-sm cursor-pointer has-disabled:cursor-not-allowed"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={readOnly}
                  onChange={() => togglePermission(permission)}
                  className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent/40"
                />
                <span className="flex flex-col">
                  <span className="font-medium text-text">{info.label}</span>
                  <span className="text-xs text-text-muted">{info.description}</span>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex gap-3">
        {!readOnly ? (
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving" : mode === "create" ? "Create role" : "Save changes"}
          </Button>
        ) : null}
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/roles")}
          disabled={isSubmitting}
        >
          {readOnly ? "Back" : "Cancel"}
        </Button>
      </div>
    </form>
  );
}
