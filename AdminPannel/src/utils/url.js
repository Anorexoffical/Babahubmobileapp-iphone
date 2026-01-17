export function resolveImageUrl(image) {
  if (!image) return '';
  // Already absolute
  if (/^https?:\/\//i.test(image)) return image;
  const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
  const path = image.startsWith('/') ? image : `/${image}`;
  return base ? `${base}${path}` : image;
}
