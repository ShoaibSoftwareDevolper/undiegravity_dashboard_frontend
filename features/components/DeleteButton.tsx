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

  async function handleDelete() {
    const confirmed = window.confirm(`Delete "${name}"? This cannot be undone.`);
    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteComponent(id);
      router.refresh();
    } catch {
      setIsDeleting(false);
    }
  }

  return (
    <Button type="button" variant="danger" size="sm" onClick={handleDelete} disabled={isDeleting}>
      {isDeleting ? "Deleting" : "Delete"}
    </Button>
  );
}
