import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getComponentById } from "@/lib/backend";
import { ComponentForm } from "@/features/components/ComponentForm";

export const metadata: Metadata = {
  title: "Edit component",
};

export default async function EditComponentPage(props: PageProps<"/components/[id]/edit">) {
  const { id } = await props.params;
  const component = await getComponentById(id);

  if (!component) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-text">Edit component</h1>
        <p className="text-sm text-text-muted">{component.name}</p>
      </div>
      <div className="rounded-lg border border-border bg-surface p-6">
        <ComponentForm mode="edit" initialData={component} />
      </div>
    </div>
  );
}
