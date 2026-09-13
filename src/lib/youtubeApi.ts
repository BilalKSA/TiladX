// Loads the IFrame Player API script once and resolves every caller against
// the same promise — YouTubePlayer instances can mount/unmount freely (a
// lesson switch remounts one) without re-fetching or re-registering the
// global ready callback.
let apiPromise: Promise<typeof YT> | null = null

export function loadYouTubeApi(): Promise<typeof YT> {
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT)
      return
    }

    const previous = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previous?.()
      resolve(window.YT as typeof YT)
    }

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  })

  return apiPromise
}
