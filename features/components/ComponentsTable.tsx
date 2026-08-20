"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PackageSearch, Search, Star } from "lucide-react";
import type { ComponentRecord } from "@/lib/types";
import {
  getCloudinaryImageUrl,
  getCloudinaryVideoPosterUrl,
  getCloudinaryVideoUrl,
} from "@/lib/cloudinary";
import { EnableToggle } from "./EnableToggle";
import { DeleteButton } from "./DeleteButton";

interface ComponentsTableProps {
  components: ComponentRecord[];
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

function TableThumbnail({ publicId, cloudName }: { publicId: string; cloudName: string }) {
  const [useFallbackImg, setUseFallbackImg] = useState(false);
  const imageUrl = getCloudinaryImageUrl(cloudName, publicId, { width: 120 });
  const videoPosterUrl = getCloudinaryVideoPosterUrl(cloudName, publicId, { width: 120 });
  const videoUrl = getCloudinaryVideoUrl(cloudName, publicId);

  if (useFallbackImg) {
    return <img src={imageUrl} alt="" className="h-full w-full object-cover" />;
  }

  return (
    <video
      src={videoUrl}
      poster={videoPosterUrl}
      autoPlay
      loop
      muted
      playsInline
      className="h-full w-full object-cover"
      onError={() => {
        setUseFallbackImg(true);
      }}
    />
  );
}

export function ComponentsTable({ components }: ComponentsTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "featured">("all");

  const categories = useMemo(() => {
    const set = new Set(components.map((c) => c.category));
    return Array.from(set);
  }, [components]);

  const filteredComponents = useMemo(() => {
    return components.filter((item) => {
      // Search text match
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);

      // Category match
      const matchCategory = selectedCategory === "all" || item.category === selectedCategory;

      // Status match
      let matchStatus = true;
      if (statusFilter === "active") matchStatus = item.enabled === true;
      if (statusFilter === "inactive") matchStatus = item.enabled === false;
      if (statusFilter === "featured") matchStatus = item.tags?.includes("featured") === true;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [components, searchQuery, selectedCategory, statusFilter]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-border bg-surface p-3.5 shadow-2xs">
        {/* Search Field */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search components by name, slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-surface-muted/50 pl-9 pr-3 text-xs text-text placeholder:text-text-muted focus:border-accent focus:bg-surface focus:outline-none"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-9 rounded-lg border border-border bg-surface px-2.5 text-xs text-text focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          {/* Status Tabs */}
          <div className="inline-flex rounded-lg border border-border bg-surface-muted p-0.5 text-xs">
            {(["all", "active", "featured", "inactive"] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setStatusFilter(filter)}
                className={`rounded-md px-2.5 py-1 font-medium capitalize transition-all cursor-pointer ${
                  statusFilter === filter
                    ? "bg-surface text-text font-semibold shadow-2xs"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-muted/40 text-[0.6875rem] font-semibold tracking-wider text-text-muted uppercase">
                <th className="px-4 py-3">Component</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Featured</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredComponents.length > 0 ? (
                filteredComponents.map((component) => (
                  <tr key={component.id} className="transition-colors hover:bg-surface-muted/30">
                    {/* Thumbnail & Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md border border-border/80 bg-surface-muted">
                          {component.thumbnail_public_id && CLOUD_NAME ? (
                            <TableThumbnail publicId={component.thumbnail_public_id} cloudName={CLOUD_NAME} />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[0.625rem] text-text-muted">
                              No Media
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-text truncate">{component.name}</span>
                          <span className="text-[0.6875rem] text-text-muted truncate max-w-xs">
                            {component.description || "No description provided"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-4 py-3 font-mono text-xs text-text-muted">
                      {component.slug}
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center rounded-md border border-border bg-surface-muted px-2 py-0.5 text-xs font-medium text-text capitalize">
                          {component.category}
                        </span>
                        {component.preview_mode === "live" ? (
                          <span className="inline-flex items-center rounded-md border border-accent/30 bg-accent/10 px-2 py-0.5 text-[0.6875rem] font-medium text-accent">
                            Live
                          </span>
                        ) : null}
                      </div>
                    </td>

                    {/* Enabled Toggle */}
                    <td className="px-4 py-3">
                      <EnableToggle id={component.id} enabled={component.enabled} />
                    </td>

                    {/* Featured Status */}
                    <td className="px-4 py-3 text-center">
                      {component.tags?.includes("featured") ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[0.6875rem] font-semibold text-accent">
                          <Star className="h-3 w-3 fill-current" />
                          Featured
                        </span>
                      ) : (
                        <span className="text-xs text-text-muted">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/components/${component.id}/edit`}
                          className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-text transition-colors hover:bg-surface-muted hover:text-accent cursor-pointer shadow-2xs"
                        >
                          Edit
                        </Link>
                        <DeleteButton id={component.id} name={component.name} />
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-text-muted">
                        <PackageSearch className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-semibold text-text">No components found</p>
                      <p className="text-xs text-text-muted max-w-sm">
                        {searchQuery || selectedCategory !== "all" || statusFilter !== "all"
                          ? "Try adjusting your search query or filter settings."
                          : "Get started by creating your first component."}
                      </p>
                      {components.length === 0 ? (
                        <Link
                          href="/components/new"
                          className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 cursor-pointer shadow-xs"
                        >
                          Create Component
                        </Link>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Stats */}
        <div className="flex items-center justify-between border-t border-border bg-surface-muted/30 px-4 py-3 text-xs text-text-muted">
          <span>
            Showing <strong className="text-text">{filteredComponents.length}</strong> of{" "}
            <strong className="text-text">{components.length}</strong> components
          </span>
          <div className="flex items-center gap-2">
            <span>Filter: {statusFilter.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
