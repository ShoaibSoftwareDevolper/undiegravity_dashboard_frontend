"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { UserRecord } from "@/lib/types";
import { updateMe } from "@/lib/api";
import { Button } from "@/ui/Button";
import { Field } from "@/ui/Field";
import { Input } from "@/ui/Input";

interface ProfileFormProps {
  user: UserRecord;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState(user.username);
  const [name, setName] = useState(user.name);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!username.trim() || !name.trim()) {
      setError("Name and username cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMe({ username: username.trim(), name: name.trim() });
      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Could not save changes.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" htmlFor="profileName">
          <Input id="profileName" value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field label="Username" htmlFor="profileUsername">
          <Input
            id="profileUsername"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="off"
            required
          />
        </Field>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {success ? <p className="text-sm text-success">Profile updated.</p> : null}

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving" : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
