/** First output URL from generations.output_images (JSONB array of strings or { url }). */
export function firstOutputImageUrl(outputImages: unknown): string | null {
  if (!Array.isArray(outputImages) || outputImages.length === 0) return null
  const first = outputImages[0]
  if (typeof first === 'string') return first
  if (first && typeof first === 'object' && 'url' in first) {
    const u = (first as { url?: unknown }).url
    return typeof u === 'string' ? u : null
  }
  return null
}
