"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Star } from "lucide-react";
import type { TemplateRecord } from "@/lib/types";
import {
  deleteTemplate,
  toggleTemplateEnabled,
  toggleTemplateFeatured,
} from "@/lib/api";

interface TemplatesTableProps {
  initialTemplates: TemplateRecord[];
  canManage?: boolean;
}

function TemplateThumbnail({ image, name }: { image?: string; name: string }) {
  const [hasError, setHasError] = useState(false);

  if (!image || hasError) {
    return (
      <div className="h-10 w-14 shrink-0 rounded-md border border-border/80 bg-surface-muted flex items-center justify-center text-[0.625rem] font-medium text-text-muted select-none">
        No Media
      </div>
    );
  }

  const isVideo =
    image.endsWith(".mp4") || image.endsWith(".webm") || image.includes("/video/upload/");

  if (isVideo) {
    return (
      <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md border border-border/80 bg-surface-muted">
        <video
          src={image}
          autoPlay
          loop
          muted
          playsInline
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md border border-border/80 bg-surface-muted">
      <img
        src={image}
        alt={name}
        className="h-full w-full object-cover"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export function TemplatesTable({ initialTemplates, canManage = true }: TemplatesTableProps) {
  const [templates, setTemplates] = useState<TemplateRecord[]>(initialTemplates);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "featured" | "inactive">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Deletion modal state
  const [deletingTemplate, setDeletingTemplate] = useState<TemplateRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const categories = useMemo(() => {
    const set = new Set(
      templates
        .map((t) => t.category)
        .filter((c): c is string => typeof c === "string" && c.trim().length > 0)
    );
    return Array.from(set).sort();
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q)) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));

      const matchCategory =
        selectedCategory === "all" || item.category?.toLowerCase() === selectedCategory.toLowerCase();

      let matchStatus = true;
      if (statusFilter === "active") matchStatus = item.enabled === true;
      if (statusFilter === "inactive") matchStatus = item.enabled === false;
      if (statusFilter === "featured") matchStatus = item.featured_on_home === true;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [templates, searchQuery, selectedCategory, statusFilter]);

  async function handleToggleEnabled(template: TemplateRecord) {
    if (!canManage) return;
    const previous = [...templates];
    setTemplates((prev) =>
      prev.map((t) => (t.id === template.id ? { ...t, enabled: !t.enabled } : t))
    );

    try {
      await toggleTemplateEnabled(template.id);
      showToast(`Template "${template.name}" ${!template.enabled ? "enabled" : "hidden"}.`);
    } catch {
      setTemplates(previous);
      showToast("Failed to update template visibility status.", "error");
    }
  }

  async function handleToggleFeatured(template: TemplateRecord) {
    if (!canManage) return;
    const previous = [...templates];
    setTemplates((prev) =>
      prev.map((t) => (t.id === template.id ? { ...t, featured_on_home: !t.featured_on_home } : t))
    );

    try {
      await toggleTemplateFeatured(template.id);
      showToast(
        `Template "${template.name}" ${
          !template.featured_on_home ? "featured on home" : "removed from featured"
        }.`
      );
    } catch {
      setTemplates(previous);
      showToast("Failed to update featured status.", "error");
    }
  }

  async function confirmDelete() {
    if (!deletingTemplate) return;
    setIsDeleting(true);
    try {
      await deleteTemplate(deletingTemplate.id);
      setTemplates((prev) => prev.filter((t) => t.id !== deletingTemplate.id));
      showToast(`Template "${deletingTemplate.name}" deleted successfully.`);
      setDeletingTemplate(null);
    } catch {
      showToast("Failed to delete template.", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toast Feedback */}
      {toastMessage ? (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-lg px-4 py-3 text-xs font-medium text-white shadow-lg transition-all animate-in fade-in slide-in-from-bottom-2 ${
            toastType === "success" ? "bg-emerald-600" : "bg-rose-600"
          }`}
        >
          <span>{toastMessage}</span>
        </div>
      ) : null}

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search templates by name, slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-full border border-border bg-surface pl-10 pr-4 text-xs text-text placeholder:text-text-muted focus:border-accent focus:bg-surface focus:outline-none transition-colors"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label="Filter by category"
            className="h-8 rounded-lg border border-border bg-surface px-3 pr-7 text-xs text-text focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Status Tabs */}
          <div className="inline-flex rounded-lg border border-border bg-surface-muted/60 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`rounded-md px-3 py-1 font-medium transition-all cursor-pointer ${
                statusFilter === "all"
                  ? "bg-surface text-text font-semibold shadow-2xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`rounded-md px-3 py-1 font-medium transition-all cursor-pointer ${
                statusFilter === "active"
                  ? "bg-surface text-text font-semibold shadow-2xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("featured")}
              className={`rounded-md px-3 py-1 font-medium transition-all cursor-pointer ${
                statusFilter === "featured"
                  ? "bg-surface text-text font-semibold shadow-2xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Featured
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("inactive")}
              className={`rounded-md px-3 py-1 font-medium transition-all cursor-pointer ${
                statusFilter === "inactive"
                  ? "bg-surface text-text font-semibold shadow-2xs"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Templates Table Container */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface text-[0.6875rem] font-semibold uppercase tracking-wider text-text-muted">
                <th className="py-3 px-4">Template</th>
                <th className="py-3 px-3">Slug</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Featured</th>
                <th className="py-3 pr-4 pl-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTemplates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    <p className="text-sm font-medium">No templates found matching your filter.</p>
                    <p className="text-xs text-text-muted mt-1">
                      Try adjusting your search query or reset the filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTemplates.map((template) => (
                  <tr
                    key={template.id}
                    className="group transition-colors hover:bg-surface-muted/30"
                  >
                    {/* Template Thumbnail, Name, and Description */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <TemplateThumbnail image={template.image} name={template.name} />
                        <div className="flex flex-col min-w-0">
                          <Link
                            href={`/templates/${template.id}/edit`}
                            className="font-semibold text-sm text-text hover:text-accent truncate max-w-xs sm:max-w-sm transition-colors"
                          >
                            {template.name}
                          </Link>
                          <span className="text-[0.6875rem] text-text-muted truncate max-w-xs sm:max-w-sm">
                            {template.description || "A clean and modern website template for UndieGravity gallery."}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3 px-3">
                      <span className="font-mono text-xs text-text-muted">
                        {template.slug}
                      </span>
                    </td>

                    {/* Category & Live Badge */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-text">
                          {template.category || "General"}
                        </span>
                        {template.enabled ? (
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[0.625rem] font-semibold text-indigo-600 border border-indigo-200/50">
                            Live
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Status Toggle Switch */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={template.enabled}
                        disabled={!canManage}
                        onClick={() => handleToggleEnabled(template)}
                        aria-label={`Toggle enabled status for ${template.name}`}
                        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          template.enabled ? "bg-emerald-600" : "bg-gray-300 dark:bg-gray-600"
                        } ${!canManage ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                            template.enabled ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </td>

                    {/* Featured on Home Toggle */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(template)}
                        disabled={!canManage}
                        aria-label={`Toggle featured status for ${template.name}`}
                        title={
                          template.featured_on_home
                            ? "Featured on home (click to remove)"
                            : "Not featured (click to feature)"
                        }
                        className="group inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-surface-muted transition-colors cursor-pointer"
                      >
                        {template.featured_on_home ? (
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        ) : (
                          <>
                            <span className="text-text-muted text-sm group-hover:hidden">—</span>
                            <Star className="h-4 w-4 text-text-muted/60 hidden group-hover:block" />
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions: Edit & Delete Buttons */}
                    <td className="py-3 pr-4 pl-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/templates/${template.id}/edit`}
                          className="rounded-md border border-border bg-surface px-3 py-1 text-xs font-medium text-text hover:bg-surface-muted hover:border-border/80 transition-colors shadow-2xs"
                        >
                          Edit
                        </Link>
                        {canManage ? (
                          <button
                            type="button"
                            onClick={() => setDeletingTemplate(template)}
                            className="rounded-md bg-rose-600 px-3 py-1 text-xs font-medium text-white hover:bg-rose-700 transition-colors shadow-2xs cursor-pointer"
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-[0.6875rem] text-text-muted bg-surface-muted/20">
          <span>
            Showing {filteredTemplates.length} of {templates.length} templates
          </span>
          <span className="font-medium uppercase">
            Filter: {statusFilter}
          </span>
        </div>
      </div>

      {/* Confirmation Dialog before Delete */}
      {deletingTemplate ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-xl border border-border bg-surface p-5 shadow-xl">
            <h3 className="text-base font-bold text-text">Delete Website Template?</h3>
            <p className="mt-2 text-xs text-text-muted leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-text font-semibold">{deletingTemplate.name}</strong>?
              This action drops the template record from the database and removes it from the public
              catalog immediately. This cannot be undone.
            </p>

            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingTemplate(null)}
                disabled={isDeleting}
                className="rounded-lg border border-border px-3.5 py-2 text-xs font-medium text-text hover:bg-surface-muted transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="rounded-lg bg-danger px-3.5 py-2 text-xs font-semibold text-white hover:bg-danger-hover transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete Template"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
