"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUser } from "@/lib/api";
import { Button } from "@/ui/Button";

interface DeleteUserButtonProps {
  id: string;
  name: string;
  disabled?: boolean;
}

export function DeleteUserButton({ id, name, disabled }: DeleteUserButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteUser(id);
      router.refresh();
    } catch {
      setIsDeleting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting || disabled}
      title={disabled ? "You cannot delete your own account" : undefined}
    >
      {isDeleting ? "Deleting" : "Delete"}
    </Button>
  );
}
