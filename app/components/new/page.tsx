import type { Metadata } from "next";
import Link from "next/link";
import { ComponentForm } from "@/features/components/ComponentForm";

export const metadata: Metadata = {
  title: "New Component | UndieGravity Admin",
};

export default function NewComponentPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-text transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-medium text-text">New Component</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Add New Component</h1>
        <p className="text-xs sm:text-sm text-text-muted">
          Fill out metadata and upload a video/thumbnail to publish a new component to the gallery.
        </p>
      </div>

      {/* Form Container */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-2xs">
        <ComponentForm mode="create" />
      </div>
    </div>
  );
}
