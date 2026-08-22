"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteComponent } from "@/lib/api";
import { Button } from "@/ui/Button";

interface DeleteButtonProps {
  id: string;
  name: string;
}

export function DeleteButton({ id, name }: DeleteButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);
    try {
      await deleteComponent(id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete this component.");
      setIsDeleting(false);
    }
  }

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <Button type="button" variant="danger" size="sm" onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? "Deleting" : "Delete"}
      </Button>
      {error ? <p className="text-xs text-danger max-w-48 text-right">{error}</p> : null}
    </div>
  );
}
