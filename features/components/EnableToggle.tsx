"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateComponent } from "@/lib/api";

interface EnableToggleProps {
  id: string;
  enabled: boolean;
}

export function EnableToggle({ id, enabled }: EnableToggleProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  async function handleChange(next: boolean) {
    setIsSaving(true);
    try {
      await updateComponent(id, { enabled: next });
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <label className="inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        checked={enabled}
        disabled={isSaving}
        onChange={(event) => handleChange(event.target.checked)}
        className="peer sr-only"
      />
      <span className="relative h-5 w-9 rounded-full bg-border transition-colors peer-checked:bg-success peer-disabled:opacity-50">
        <span className="absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
      </span>
      <span className="sr-only">{enabled ? "Enabled" : "Disabled"}</span>
    </label>
  );
}
