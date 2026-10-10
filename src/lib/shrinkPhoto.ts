export const MAX_PHOTO_SIDE = 1600;
const JPEG_QUALITY = 0.85;

export const PHOTO_DECODE_MESSAGE =
  "Couldn't read that photo. Use a JPG, PNG or WebP.";

export class PhotoDecodeError extends Error {
  constructor() {
    super(PHOTO_DECODE_MESSAGE);
    this.name = "PhotoDecodeError";
  }
}

export function fitWithin(
  width: number,
  height: number,
  max = MAX_PHOTO_SIDE,
): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

// Re-encoding always, even when small, also strips EXIF metadata such as GPS location.
export async function shrinkPhoto(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new PhotoDecodeError();
  }

  const { width, height } = fitWithin(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new PhotoDecodeError();
  }
  // JPEG has no alpha; transparent PNG areas would otherwise turn black.
  context.fillStyle = "#fff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
  );
  if (!blob) throw new PhotoDecodeError();

  const name = file.name.replace(/\.[^.]*$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}
