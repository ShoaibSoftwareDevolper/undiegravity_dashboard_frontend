import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "Admin Sign in | UndieGravity",
  description: "Secure administrator login for UndieGravity dashboard.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-surface-muted">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-border bg-surface p-8 shadow-xs sm:p-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-xs p-1.5">
            <Image
              src="/logo.png"
              alt="UndieGravity Logo"
              width={56}
              height={56}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text">UndieGravity Admin</h1>
            <p className="text-xs text-text-muted mt-1">Enter your admin security key to access the dashboard.</p>
          </div>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Security Footer Note */}
        <div className="flex items-center justify-center gap-1.5 text-[0.6875rem] text-text-muted border-t border-border pt-4">
          <svg className="h-3.5 w-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>End-to-end encrypted admin authentication</span>
        </div>
      </div>
    </div>
  );
}
