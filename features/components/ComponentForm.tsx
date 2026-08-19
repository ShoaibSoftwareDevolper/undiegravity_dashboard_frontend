"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { ComponentInput, ComponentRecord, PreviewMode } from "@/lib/types";
import { createComponent, updateComponent } from "@/lib/api";
import { Button } from "@/ui/Button";
import { Field } from "@/ui/Field";
import { Input } from "@/ui/Input";
import { Textarea } from "@/ui/Textarea";
import { Checkbox } from "@/ui/Checkbox";
import { Select } from "@/ui/Select";
import { ThumbnailUploader } from "@/features/uploads/ThumbnailUploader";

interface ComponentFormProps {
  mode: "create" | "edit";
  initialData?: ComponentRecord;
}

export function ComponentForm({ mode, initialData }: ComponentFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "");
  const [isFeatured, setIsFeatured] = useState(
    initialData?.tags?.includes("featured") ?? false
  );
  const [enabled, setEnabled] = useState(initialData?.enabled ?? true);
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order ?? 0);
  const [thumbnailPublicId, setThumbnailPublicId] = useState<string | null>(
    initialData?.thumbnail_public_id ?? null
  );
  const [previewMode, setPreviewMode] = useState<PreviewMode>(
    initialData?.preview_mode ?? "image"
  );

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!name.trim() || !slug.trim() || !description.trim() || !category.trim()) {
      setError("Fill in name, slug, description, and category.");
      return;
    }

    const currentTags = (initialData?.tags ?? []).filter((t) => t !== "featured");
    if (isFeatured) {
      currentTags.push("featured");
    }

    const payload: ComponentInput = {
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      category: category.trim(),
      tags: currentTags,
      framework: initialData?.framework ?? "react",
      dependencies: initialData?.dependencies ?? [],
      usage_notes: initialData?.usage_notes ?? null,
      enabled,
      sort_order: sortOrder,
      thumbnail_public_id: thumbnailPublicId,
      preview_mode: previewMode,
    };

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createComponent(payload);
      } else if (initialData) {
        await updateComponent(initialData.id, payload);
      }
      router.push("/");
      router.refresh();
    } catch {
      setError(mode === "create" ? "Could not create the component." : "Could not save changes.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name / Title" htmlFor="name">
          <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
        </Field>
        <Field label="Slug" htmlFor="slug" hint="Lowercase, hyphen separated, e.g. glow-button">
          <Input
            id="slug"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
            required
          />
        </Field>
      </div>

      <Field label="Category" htmlFor="category" hint="e.g. Buttons, Cards, Inputs, Navbars">
        <Input
          id="category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          required
        />
      </Field>

      <Field label="Description" htmlFor="description">
        <Textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
      </Field>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-text">Thumbnail / Video Preview</span>
        <ThumbnailUploader value={thumbnailPublicId} onChange={setThumbnailPublicId} />
      </div>

      <Field
        label="Gallery card display"
        htmlFor="previewMode"
        hint="Live render only works once this component's slug is deployed in the main site's registry; it falls back to the image otherwise."
      >
        <Select
          id="previewMode"
          value={previewMode}
          onChange={(event) => setPreviewMode(event.target.value as PreviewMode)}
        >
          <option value="image">Image / video thumbnail</option>
          <option value="live">Live render (like Uiverse / Hover.dev)</option>
        </Select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-3 sm:items-center">
        <Field label="Sort order" htmlFor="sortOrder">
          <Input
            id="sortOrder"
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(Number(event.target.value))}
          />
        </Field>
        <Checkbox
          id="featured"
          label="Featured on Home"
          checked={isFeatured}
          onChange={(event) => setIsFeatured(event.target.checked)}
        />
        <Checkbox
          id="enabled"
          label="Enabled"
          checked={enabled}
          onChange={(event) => setEnabled(event.target.checked)}
        />
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving" : mode === "create" ? "Create component" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
