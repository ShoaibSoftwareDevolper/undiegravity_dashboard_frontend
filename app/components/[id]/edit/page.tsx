import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getComponentById, getCurrentUser } from "@/lib/backend";
import { hasPermission } from "@/lib/permissions";
import { ComponentForm } from "@/features/components/ComponentForm";

export const metadata: Metadata = {
  title: "Edit Component | UndieGravity Admin",
};

export default async function EditComponentPage(props: PageProps<"/components/[id]/edit">) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !hasPermission(currentUser, "components.manage")) {
    redirect("/");
  }

  const { id } = await props.params;
  const component = await getComponentById(id);

  if (!component) {
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
          <span className="font-medium text-text">Edit Component</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-text">Edit: {component.name}</h1>
          <span className="font-mono text-xs text-text-muted bg-surface-muted px-2 py-0.5 rounded border border-border">
            {component.slug}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-text-muted">
          Modify metadata, category, sort order, and thumbnail media for this component.
        </p>
      </div>

      {/* Form Container */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-2xs">
        <ComponentForm mode="edit" initialData={component} />
      </div>
    </div>
  );
}
