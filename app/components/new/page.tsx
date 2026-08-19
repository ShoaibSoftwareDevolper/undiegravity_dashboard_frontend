import type { Metadata } from "next";
import { ComponentForm } from "@/features/components/ComponentForm";

export const metadata: Metadata = {
  title: "New component",
};

export default function NewComponentPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text">New component</h1>
        <p className="text-sm text-text-muted">Create a new component metadata record.</p>
      </div>
      <div className="rounded-lg border border-border bg-surface p-6">
        <ComponentForm mode="create" />
      </div>
    </div>
  );
}
