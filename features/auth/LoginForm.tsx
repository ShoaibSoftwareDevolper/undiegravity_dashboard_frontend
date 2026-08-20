"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { Button } from "@/ui/Button";
import { Field } from "@/ui/Field";
import { Input } from "@/ui/Input";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim() || !password) {
      setError("Enter your username and password.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login(username.trim(), password);
      router.push("/");
      router.refresh();
    } catch {
      setError("Invalid username or password.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <Field label="Username" htmlFor="username">
        <Input
          id="username"
          type="text"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          disabled={isSubmitting}
        />
      </Field>
      <Field label="Password" htmlFor="password" error={error ?? undefined}>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
        />
      </Field>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing in" : "Sign in"}
      </Button>
    </form>
  );
}
