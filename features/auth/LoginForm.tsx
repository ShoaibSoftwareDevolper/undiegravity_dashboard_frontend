"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { loginWithAdminKey } from "@/lib/api";
import { Button } from "@/ui/Button";
import { Field } from "@/ui/Field";
import { Input } from "@/ui/Input";

export function LoginForm() {
  const router = useRouter();
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!adminKey.trim()) {
      setError("Enter the admin key.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await loginWithAdminKey(adminKey.trim());
      router.push("/");
      router.refresh();
    } catch {
      setError("Invalid admin key.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <Field label="Admin key" htmlFor="adminKey" error={error ?? undefined}>
        <Input
          id="adminKey"
          type="password"
          autoComplete="off"
          autoFocus
          value={adminKey}
          onChange={(event) => setAdminKey(event.target.value)}
          disabled={isSubmitting}
        />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in" : "Sign in"}
      </Button>
    </form>
  );
}
