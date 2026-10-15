import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTemplateById, getCurrentUser } from "@/lib/backend";
import { hasPermission } from "@/lib/permissions";
import { TemplateForm } from "@/features/templates/TemplateForm";

export const metadata: Metadata = {
  title: "Edit Website Template | UndieGravity Admin",
};

interface EditTemplatePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !hasPermission(currentUser, "templates.manage")) {
    redirect("/");
  }

  const { id } = await params;
  const template = await getTemplateById(id);

  if (!template) {
    notFound();
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
          <span className="font-medium text-text">Edit Template</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-text">Edit: {template.name}</h1>
          <span className="font-mono text-xs text-text-muted bg-surface-muted px-2 py-0.5 rounded border border-border">
            /{template.slug}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-text-muted">
          Modify template details, screenshots, GitHub repository URL, and visibility status.
        </p>
      </div>

      {/* Form Container */}
      <TemplateForm mode="edit" initialData={template} />
    </div>
  );
}
