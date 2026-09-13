// Admins paste whatever URL they copied from the YouTube address bar. This
// pulls the 11-character video ID out of the common URL shapes.

const YOUTUBE_ID = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/

export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null
  return url.match(YOUTUBE_ID)?.[1] ?? null
}

/** True if the URL is one we know how to play — used to warn in the admin form. */
export function isEmbeddable(url: string): boolean {
  return getYouTubeId(url) !== null
}
