"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteRole } from "@/lib/api";
import { Button } from "@/ui/Button";

interface DeleteRoleButtonProps {
  id: string;
  name: string;
  disabled?: boolean;
}

export function DeleteRoleButton({ id, name, disabled }: DeleteRoleButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete the "${name}" role? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      await deleteRole(id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this role.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="danger"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting || disabled}
        title={disabled ? "Built-in roles cannot be deleted" : undefined}
      >
        {isDeleting ? "Deleting" : "Delete"}
      </Button>
      {error ? <p className="text-xs text-danger max-w-48 text-right">{error}</p> : null}
    </div>
  );
}
