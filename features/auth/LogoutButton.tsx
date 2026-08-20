"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/api";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      aria-label="Log out"
      title="Log out"
      className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-danger-muted hover:text-danger disabled:opacity-50 cursor-pointer"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
