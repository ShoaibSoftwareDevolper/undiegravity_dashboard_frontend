"use client";

import Image from "next/image";
import Link from "next/link";
import type { ComponentRecord } from "@/lib/types";
import {
  getCloudinaryImageUrl,
  getCloudinaryVideoPosterUrl,
  getCloudinaryVideoUrl,
} from "@/lib/cloudinary";
import { useState } from "react";
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
  if (components.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-surface p-10 text-center text-sm text-text-muted">
        No components yet. Create the first one to get started.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs font-medium tracking-wide text-text-muted uppercase">
            <th className="px-4 py-3 font-medium">Thumbnail</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Slug</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Enabled</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {components.map((component) => (
            <tr key={component.id} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3">
                  <div className="relative h-10 w-14 overflow-hidden rounded-sm bg-surface-muted">
                    {component.thumbnail_public_id && CLOUD_NAME ? (
                      <TableThumbnail publicId={component.thumbnail_public_id} cloudName={CLOUD_NAME} />
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-text">
                  <div className="flex items-center gap-2">
                    <span>{component.name}</span>
                    {component.tags?.includes("featured") ? (
                      <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[0.6875rem] font-semibold text-accent uppercase">
                        Featured
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-text-muted">{component.slug}</td>
                <td className="px-4 py-3 text-text-muted">{component.category}</td>
                <td className="px-4 py-3 text-text-muted">{component.sort_order}</td>
                <td className="px-4 py-3">
                  <EnableToggle id={component.id} enabled={component.enabled} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/components/${component.id}/edit`}
                      className="text-sm font-medium text-accent hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={component.id} name={component.name} />
                  </div>
                </td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
