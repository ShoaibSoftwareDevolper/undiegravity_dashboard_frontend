"use client";

import { useState, type FormEvent } from "react";
import { changePassword } from "@/lib/api";
import { Button } from "@/ui/Button";
import { Field } from "@/ui/Field";
import { Input } from "@/ui/Input";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (!currentPassword) {
      setError("Enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "Could not change password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Current password" htmlFor="currentPassword">
        <Input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          required
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="New password" htmlFor="newPassword" hint="At least 8 characters.">
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
        </Field>
        <Field label="Confirm new password" htmlFor="confirmPassword">
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </Field>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {success ? (
        <p className="text-sm text-success">
          Password changed. You&apos;ve been signed out everywhere else.
        </p>
      ) : null}

      <div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving" : "Change password"}
        </Button>
      </div>
    </form>
  );
}
