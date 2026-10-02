export type SizedImage = { src: string; srcSet?: string };

const CLOUDINARY_ORIGIN = "https://res.cloudinary.com/";
const IMAGE_UPLOAD_SEGMENT = "/image/upload/";

function isCloudinaryImage(url: string): boolean {
  return (
    url.startsWith(CLOUDINARY_ORIGIN) && url.includes(IMAGE_UPLOAD_SEGMENT)
  );
}

function transform(url: string, transformation: string): string {
  const insertAt =
    url.indexOf(IMAGE_UPLOAD_SEGMENT) + IMAGE_UPLOAD_SEGMENT.length;
  return `${url.slice(0, insertAt)}f_auto,q_auto,${transformation}/${url.slice(insertAt)}`;
}

export function fillImage(
  url: string,
  width: number,
  height: number,
): SizedImage {
  if (!isCloudinaryImage(url)) return { src: url };
  const fill = (scale: number) =>
    transform(url, `c_fill,g_auto,w_${width * scale},h_${height * scale}`);
  return { src: fill(1), srcSet: `${fill(1)} 1x, ${fill(2)} 2x` };
}

export function limitImage(url: string, widths: number[]): SizedImage {
  if (!isCloudinaryImage(url)) return { src: url };
  const limit = (width: number) => transform(url, `c_limit,w_${width}`);
  return {
    src: limit(Math.max(...widths)),
    srcSet: widths.map((width) => `${limit(width)} ${width}w`).join(", "),
  };
}
