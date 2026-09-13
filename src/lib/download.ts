/**
 * Opens a URL as a blob in a new tab, backed by a real fetch — unlike a bare
 * `<a target="_blank">`, the caller knows exactly when the file has arrived
 * and can show a loading state for it.
 *
 * The tab opens synchronously, before the fetch starts: popup blockers only
 * allow `window.open` from inside the click handler itself, not after an
 * `await`, so opening early is what keeps this from being blocked.
 */
export async function openFileInNewTab(url: string): Promise<void> {
  const tab = window.open('', '_blank')
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`تعذّر تحميل الملف (${res.status})`)
    const blob = await res.blob()
    const objectUrl = URL.createObjectURL(blob)
    if (tab) {
      tab.location.href = objectUrl
    } else {
      // Popup blocked — fall back to navigating the current tab.
      window.location.href = objectUrl
    }
  } catch (err) {
    tab?.close()
    throw err
  }
}
