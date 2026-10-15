"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ExternalLink,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import type { TemplateInput, TemplateRecord } from "@/lib/types";
import { createTemplate, updateTemplate, uploadMediaFile } from "@/lib/api";
import { Button } from "@/ui/Button";
import { Field } from "@/ui/Field";
import { Input } from "@/ui/Input";
import { Textarea } from "@/ui/Textarea";
import { Checkbox } from "@/ui/Checkbox";

interface TemplateFormProps {
  mode: "create" | "edit";
  initialData?: TemplateRecord;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const COMMON_CATEGORIES = [
  "SaaS and Tech",
  "Portfolio and Agency",
  "Ecommerce",
  "AI and Tools",
  "Dashboards",
  "Content and Blog",
  "Mobile and Apps",
];

export function TemplateForm({ mode, initialData }: TemplateFormProps) {
  const router = useRouter();

  const [name, setName] = useState(initialData?.name ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(Boolean(initialData?.slug));
  const [image, setImage] = useState(initialData?.image ?? "");
  const [galleryImages, setGalleryImages] = useState<string[]>(initialData?.gallery_images ?? []);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState(initialData?.github_url ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "SaaS and Tech");
  const [tagsInput, setTagsInput] = useState((initialData?.tags ?? []).join(", "));
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order ?? 0);
  const [featuredOnHome, setFeaturedOnHome] = useState(initialData?.featured_on_home ?? false);
  const [enabled, setEnabled] = useState(initialData?.enabled ?? true);

  // Uploading and validation states
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [galleryUploadError, setGalleryUploadError] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [githubUrlError, setGithubUrlError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugManuallyEdited && mode === "create") {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlug(value);
    setSlugManuallyEdited(true);
  }

  function handleAddGalleryImage() {
    const trimmed = newGalleryUrl.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      setError("Gallery image URL must start with http:// or https://");
      return;
    }
    if (galleryImages.includes(trimmed)) {
      setNewGalleryUrl("");
      return;
    }
    setGalleryImages((prev) => [...prev, trimmed]);
    setNewGalleryUrl("");
  }

  function handleRemoveGalleryImage(indexToRemove: number) {
    setGalleryImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }

  async function handleCoverFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const acceptedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "video/mp4",
      "video/webm",
    ];

    if (!acceptedTypes.includes(file.type)) {
      setCoverUploadError("Invalid file format. Supports MP4, WebM, PNG, JPG, WebP, GIF (up to 50MB).");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setCoverUploadError("File exceeds 50MB limit.");
      return;
    }

    setCoverUploadError(null);
    setIsUploadingCover(true);

    try {
      const { url } = await uploadMediaFile(file);
      setImage(url);
    } catch (err) {
      setCoverUploadError(err instanceof Error ? err.message : "Upload failed. Try again.");
    } finally {
      setIsUploadingCover(false);
    }
  }

  async function handleGalleryFilesUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    event.target.value = "";
    if (!files || files.length === 0) return;

    const acceptedTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "video/mp4",
      "video/webm",
    ];

    const fileList = Array.from(files);

    for (const file of fileList) {
      if (!acceptedTypes.includes(file.type)) {
        setGalleryUploadError(`"${file.name}" is an unsupported format. Supports MP4, WebM, PNG, JPG, WebP, GIF.`);
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setGalleryUploadError(`"${file.name}" exceeds 50MB limit.`);
        return;
      }
    }

    setGalleryUploadError(null);
    setIsUploadingGallery(true);

    try {
      const uploadedUrls: string[] = [];
      for (const file of fileList) {
        const { url } = await uploadMediaFile(file);
        uploadedUrls.push(url);
      }
      setGalleryImages((prev) => Array.from(new Set([...prev, ...uploadedUrls])));
    } catch (err) {
      setGalleryUploadError(err instanceof Error ? err.message : "Gallery upload failed.");
    } finally {
      setIsUploadingGallery(false);
    }
  }

  function validateGithubUrl(url: string): boolean {
    const clean = url.trim();
    if (!clean) {
      setGithubUrlError("GitHub Repository URL is required");
      return false;
    }
    if (!clean.startsWith("https://") && !clean.startsWith("http://")) {
      setGithubUrlError("GitHub URL must start with https://");
      return false;
    }
    if (!clean.toLowerCase().includes("github.com")) {
      setGithubUrlError("GitHub URL must point to a repository on github.com");
      return false;
    }
    setGithubUrlError(null);
    return true;
  }

  function handleTestGithubUrl() {
    if (!githubUrl.trim()) return;
    window.open(githubUrl.trim(), "_blank", "noopener,noreferrer");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanSlug = slug.trim() || slugify(cleanName);
    const cleanImage = image.trim();
    const cleanGithubUrl = githubUrl.trim();

    if (!cleanName) {
      setError("Template name is required.");
      return;
    }

    if (!cleanSlug) {
      setError("Template slug is required.");
      return;
    }

    if (!cleanImage) {
      setError("Main preview image URL is required.");
      return;
    }

    if (!validateGithubUrl(cleanGithubUrl)) {
      return;
    }

    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const payload: TemplateInput = {
      name: cleanName,
      slug: cleanSlug,
      image: cleanImage,
      gallery_images: galleryImages,
      github_url: cleanGithubUrl,
      video: null,
      description: description.trim() || null,
      category: category.trim() || null,
      tags: parsedTags,
      sort_order: Number(sortOrder) || 0,
      featured_on_home: featuredOnHome,
      enabled,
    };

    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createTemplate(payload);
      } else if (initialData) {
        await updateTemplate(initialData.id, payload);
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : mode === "create" ? "Failed to create template." : "Failed to save changes."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Top Banner Alert on Error */}
      {error ? (
        <div className="flex items-center gap-2.5 rounded-xl border border-danger/30 bg-danger-muted p-4 text-xs font-medium text-danger animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {/* Basic Info Section */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-2xs">
        <h2 className="text-sm font-semibold text-text mb-4">Template Basics</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Template Name" htmlFor="name">
            <Input
              id="name"
              placeholder="e.g. Apex SaaS Platform Landing"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </Field>

          <Field label="URL Slug" htmlFor="slug" hint="Unique URL path: /templates/[slug]">
            <Input
              id="slug"
              placeholder="e.g. apex-saas-platform-landing"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              required
            />
          </Field>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mt-4">
          <Field label="Category" htmlFor="category" hint="Select or type a category">
            <div className="flex gap-2">
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. SaaS and Tech"
              />
              <select
                aria-label="Preset categories"
                value={COMMON_CATEGORIES.includes(category) ? category : ""}
                onChange={(e) => {
                  if (e.target.value) setCategory(e.target.value);
                }}
                className="h-10 rounded-lg border border-border bg-surface px-2.5 text-xs text-text focus:outline-none cursor-pointer"
              >
                <option value="">Presets...</option>
                {COMMON_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </Field>

          <Field label="Tags" htmlFor="tags" hint="Comma-separated: Next.js, Tailwind CSS, Dark Mode">
            <Input
              id="tags"
              placeholder="Next.js, TypeScript, Tailwind CSS"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Description" htmlFor="description" hint="Detailed overview of what this template offers">
            <Textarea
              id="description"
              rows={4}
              placeholder="Describe the website template architecture, features, included pages, and technology..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
        </div>
      </div>

      {/* GitHub Source Code Repository */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-text">GitHub Repository URL</h2>
          <span className="text-[0.6875rem] text-accent font-medium">Users download source from GitHub</span>
        </div>
        <p className="text-xs text-text-muted mb-4">
          Each website template links directly to its GitHub repository. No zip files or uploads needed.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1">
            <Input
              id="github_url"
              placeholder="https://github.com/organization/template-repository"
              value={githubUrl}
              onChange={(e) => {
                setGithubUrl(e.target.value);
                if (githubUrlError) validateGithubUrl(e.target.value);
              }}
              onBlur={() => validateGithubUrl(githubUrl)}
              required
            />
          </div>
          <button
            type="button"
            onClick={handleTestGithubUrl}
            disabled={!githubUrl.trim()}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-muted/60 px-4 py-2 text-xs font-semibold text-text hover:bg-surface-muted hover:text-accent transition-colors disabled:opacity-40 cursor-pointer shrink-0"
          >
            <span>Test Link</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
        {githubUrlError ? (
          <p className="mt-1.5 text-xs text-danger font-medium flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span>{githubUrlError}</span>
          </p>
        ) : null}
      </div>

      {/* Visual Media & Screenshots */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-2xs">
        <h2 className="text-sm font-semibold text-text mb-4">Media and Visuals</h2>

        {/* Main Image / Video URL */}
        <div className="grid gap-4 sm:grid-cols-3 items-start">
          <div className="sm:col-span-2">
            <Field
              label="Main Thumbnail / Cover Media URL"
              htmlFor="image"
              hint="Supports MP4, WebM, PNG, JPG, WebP, GIF (up to 50MB)"
            >
              <div className="flex gap-2">
                <Input
                  id="image"
                  placeholder="https://images.unsplash.com/... or https://.../preview.mp4"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  required
                />
                <label className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface-muted px-3.5 py-2 text-xs font-semibold text-text hover:bg-surface-muted/80 hover:text-accent transition-colors cursor-pointer shrink-0 shadow-2xs">
                  {isUploadingCover ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,video/mp4,video/webm"
                    onChange={handleCoverFileUpload}
                    disabled={isUploadingCover}
                    className="hidden"
                  />
                </label>
              </div>
            </Field>
            {coverUploadError ? (
              <p className="mt-1 text-xs text-danger font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3 shrink-0" />
                <span>{coverUploadError}</span>
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-text-muted">Cover Preview</span>
              {image.trim() ? (
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="text-[0.625rem] text-danger hover:underline cursor-pointer"
                >
                  Clear
                </button>
              ) : null}
            </div>
            <div className="relative h-24 w-full overflow-hidden rounded-lg border border-border bg-surface-muted flex items-center justify-center">
              {isUploadingCover ? (
                <div className="flex flex-col items-center gap-1.5 text-accent">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-[0.6875rem] font-medium">Uploading media...</span>
                </div>
              ) : image.trim() ? (
                image.endsWith(".mp4") || image.endsWith(".webm") || image.includes("/video/upload/") ? (
                  <video
                    src={image.trim()}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={image.trim()}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80";
                    }}
                  />
                )
              ) : (
                <label className="flex flex-col items-center gap-1 text-text-muted cursor-pointer hover:text-text transition-colors p-2 text-center w-full h-full justify-center">
                  <ImageIcon className="h-6 w-6 opacity-40" />
                  <span className="text-[0.625rem]">No media</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,video/mp4,video/webm"
                    onChange={handleCoverFileUpload}
                    disabled={isUploadingCover}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Gallery Screenshots */}
        <div className="mt-6 border-t border-border pt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-text">Product Gallery Screenshots</span>
            <span className="text-[0.6875rem] text-text-muted">
              {galleryImages.length} {galleryImages.length === 1 ? "item" : "items"} added
            </span>
          </div>
          <p className="text-[0.6875rem] text-text-muted mb-3">
            Add extra screenshots and visuals for the Pinterest-style detail page masonry and lightbox viewer. Supports MP4, WebM, PNG, JPG, WebP, GIF (up to 50MB)
          </p>

          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Add screenshot or video URL (https://...)"
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddGalleryImage();
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddGalleryImage}
                disabled={!newGalleryUrl.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface-muted px-3 py-2 text-xs font-semibold text-text hover:bg-accent hover:text-white transition-colors disabled:opacity-40 cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>

            <label className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2 text-xs font-semibold text-accent hover:bg-accent/10 transition-colors cursor-pointer shrink-0 shadow-2xs">
              {isUploadingGallery ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Media</span>
                </>
              )}
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,video/mp4,video/webm"
                onChange={handleGalleryFilesUpload}
                disabled={isUploadingGallery}
                className="hidden"
              />
            </label>
          </div>

          {galleryUploadError ? (
            <p className="mb-3 text-xs text-danger font-medium flex items-center gap-1">
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{galleryUploadError}</span>
            </p>
          ) : null}

          {galleryImages.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {galleryImages.map((imgUrl, index) => {
                const isVideo =
                  imgUrl.endsWith(".mp4") ||
                  imgUrl.endsWith(".webm") ||
                  imgUrl.includes("/video/upload/");
                return (
                  <div
                    key={`${imgUrl}-${index}`}
                    className="group relative aspect-video overflow-hidden rounded-lg border border-border bg-surface-muted"
                  >
                    {isVideo ? (
                      <video src={imgUrl} autoPlay loop muted playsInline className="h-full w-full object-cover" />
                    ) : (
                      <img src={imgUrl} alt={`Screenshot ${index + 1}`} className="h-full w-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(index)}
                      aria-label="Remove image"
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-md bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[0.6875rem] text-text-muted italic">No extra gallery screenshots added yet.</p>
          )}
        </div>
      </div>

      {/* Visibility, Featured & Order */}
      <div className="rounded-xl border border-border bg-surface p-5 shadow-2xs">
        <h2 className="text-sm font-semibold text-text mb-4">Publishing & Positioning</h2>

        <div className="grid gap-6 sm:grid-cols-3 sm:items-center">
          <Field label="Sort Order" htmlFor="sortOrder" hint="Lower appears first (e.g. 1, 2, 3...)">
            <Input
              id="sortOrder"
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </Field>

          <div className="flex flex-col gap-2 pt-2">
            <Checkbox
              id="featuredOnHome"
              label="Featured on Home"
              checked={featuredOnHome}
              onChange={(e) => setFeaturedOnHome(e.target.checked)}
            />
            <span className="text-[0.6875rem] text-text-muted">
              Display template on homepage featured templates grid.
            </span>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Checkbox
              id="enabled"
              label="Enabled (Published)"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            <span className="text-[0.6875rem] text-text-muted">
              When disabled, template is hidden from public pages.
            </span>
          </div>
        </div>
      </div>

      {/* Submit Controls */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : mode === "create" ? "Create Template" : "Save Changes"}
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
