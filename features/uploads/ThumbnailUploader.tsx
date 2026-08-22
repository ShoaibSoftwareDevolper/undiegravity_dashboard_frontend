"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { getUploadSignature } from "@/lib/api";
import {
  getCloudinaryImageUrl,
  getCloudinaryVideoPosterUrl,
  getCloudinaryVideoUrl,
} from "@/lib/cloudinary";
import { Button } from "@/ui/Button";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];
const UPLOAD_FOLDER = "undiegravity";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

function MediaPreviewBox({ cloudName, publicId }: { cloudName: string; publicId: string }) {
  const [useVideoPoster, setUseVideoPoster] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);

  const imageUrl = getCloudinaryImageUrl(cloudName, publicId, { width: 320 });
  const videoPosterUrl = getCloudinaryVideoPosterUrl(cloudName, publicId, { width: 320 });
  const videoUrl = getCloudinaryVideoUrl(cloudName, publicId);

  if (showVideoPlayer) {
    return (
      <video
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <img
      src={useVideoPoster ? videoPosterUrl : imageUrl}
      alt="Media preview"
      className="h-full w-full object-cover"
      onError={() => {
        if (!useVideoPoster) {
          setUseVideoPoster(true);
        } else {
          setShowVideoPlayer(true);
        }
      }}
    />
  );
}

interface ThumbnailUploaderProps {
  value: string | null;
  onChange: (publicId: string) => void;
}

export function ThumbnailUploader({ value, onChange }: ThumbnailUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Please upload an image (PNG, JPEG, WebP, SVG, GIF) or video (MP4, WebM, MOV).");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("File must be 50 MB or smaller.");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const signature = await getUploadSignature({ folder: UPLOAD_FOLDER });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signature.api_key);
      formData.append("timestamp", String(signature.timestamp));
      formData.append("signature", signature.signature);
      if (signature.folder) {
        formData.append("folder", signature.folder);
      }
      if (signature.public_id) {
        formData.append("public_id", signature.public_id);
      }

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${signature.cloud_name}/auto/upload`,
        { method: "POST", body: formData }
      );

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || "Upload failed");
      }

      const result = (await response.json()) as { public_id?: string };
      if (!result.public_id) {
        throw new Error("Upload response missing public id");
      }

      onChange(result.public_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-4">
        <div className="relative flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-muted">
          {value && CLOUD_NAME ? (
            <MediaPreviewBox key={value} cloudName={CLOUD_NAME} publicId={value} />
          ) : (
            <span className="px-2 text-center text-xs text-text-muted">No media</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : value ? "Replace image or video" : "Upload image or video"}
          </Button>
          {value ? (
            <p className="max-w-56 truncate text-xs text-text-muted">{value}</p>
          ) : (
            <p className="text-xs text-text-muted">Supports MP4, WebM, PNG, JPG, WebP, GIF (up to 50MB)</p>
          )}
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
