// Admins paste whatever URL they copied from the browser bar. This turns the
// common YouTube/Vimeo shapes into an embeddable player URL.

const YOUTUBE_ID = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
const VIMEO_ID = /vimeo\.com\/(?:video\/)?(\d+)/

export function toEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null

  const youtube = url.match(YOUTUBE_ID)
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`

  const vimeo = url.match(VIMEO_ID)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`

  return null
}

/** True if the URL is one we know how to embed — used to warn in the admin form. */
export function isEmbeddable(url: string): boolean {
  return toEmbedUrl(url) !== null
}
