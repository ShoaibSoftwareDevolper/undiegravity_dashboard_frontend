import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-lg border border-border bg-surface p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-text">Sign in</h1>
          <p className="text-sm text-text-muted">Enter the admin key to manage components.</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
