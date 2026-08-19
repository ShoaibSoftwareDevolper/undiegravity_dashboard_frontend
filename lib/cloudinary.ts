interface CloudinaryPreviewOptions {
  width?: number;
}

/** Builds an image delivery URL from a Cloudinary public id and cloud name. */
export function getCloudinaryImageUrl(
  cloudName: string,
  publicId: string,
  { width = 320 }: CloudinaryPreviewOptions = {}
): string {
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${width}/${publicId}`;
}

/** Builds a video poster frame URL from a Cloudinary public id and cloud name. */
export function getCloudinaryVideoPosterUrl(
  cloudName: string,
  publicId: string,
  { width = 320 }: CloudinaryPreviewOptions = {}
): string {
  return `https://res.cloudinary.com/${cloudName}/video/upload/f_auto,q_auto,w_${width},so_auto/${publicId}.jpg`;
}

/** Backward compatible preview URL */
export function getCloudinaryPreviewUrl(
  cloudName: string,
  publicId: string,
  options: CloudinaryPreviewOptions = {}
): string {
  return getCloudinaryImageUrl(cloudName, publicId, options);
}

/** Builds a video MP4 delivery URL from a Cloudinary public id and cloud name. */
export function getCloudinaryVideoUrl(cloudName: string, publicId: string): string {
  return `https://res.cloudinary.com/${cloudName}/video/upload/q_auto/${publicId}.mp4`;
}
