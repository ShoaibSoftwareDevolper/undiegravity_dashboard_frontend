"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api";
import { Button } from "@/ui/Button";

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
    <Button type="button" variant="ghost" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
      {isLoggingOut ? "Logging out" : "Log out"}
    </Button>
  );
}
