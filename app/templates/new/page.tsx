import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/backend";
import { hasPermission } from "@/lib/permissions";
import { TemplateForm } from "@/features/templates/TemplateForm";

export const metadata: Metadata = {
  title: "New Website Template | UndieGravity Admin",
};

export default async function NewTemplatePage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || !hasPermission(currentUser, "templates.manage")) {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-border pb-4">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Link href="/" className="hover:text-text transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="font-medium text-text">New Template</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-text">Add Website Template</h1>
        <p className="text-xs sm:text-sm text-text-muted">
          Fill out template details, preview image, gallery screenshots, and GitHub source repository URL.
        </p>
      </div>

      {/* Form Container */}
      <TemplateForm mode="create" />
    </div>
  );
}
