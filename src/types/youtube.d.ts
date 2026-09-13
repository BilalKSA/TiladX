// Minimal surface of the YouTube IFrame Player API — just what YouTubePlayer.tsx
// uses. Full reference: https://developers.google.com/youtube/iframe_api_reference

declare namespace YT {
  enum PlayerState {
    UNSTARTED = -1,
    ENDED = 0,
    PLAYING = 1,
    PAUSED = 2,
    BUFFERING = 3,
    CUED = 5,
  }

  interface PlayerEvent {
    target: Player
  }

  interface OnStateChangeEvent extends PlayerEvent {
    data: PlayerState
  }

  interface PlayerVars {
    autoplay?: 0 | 1
    controls?: 0 | 1
    disablekb?: 0 | 1
    fs?: 0 | 1
    iv_load_policy?: 1 | 3
    modestbranding?: 0 | 1
    playsinline?: 0 | 1
    rel?: 0 | 1
  }

  interface PlayerOptions {
    videoId?: string
    playerVars?: PlayerVars
    events?: {
      onReady?: (event: PlayerEvent) => void
      onStateChange?: (event: OnStateChangeEvent) => void
      onError?: (event: PlayerEvent & { data: number }) => void
    }
  }

  class Player {
    constructor(element: HTMLElement, options: PlayerOptions)
    playVideo(): void
    pauseVideo(): void
    seekTo(seconds: number, allowSeekAhead: boolean): void
    mute(): void
    unMute(): void
    isMuted(): boolean
    getCurrentTime(): number
    getDuration(): number
    getPlayerState(): PlayerState
    getIframe(): HTMLIFrameElement
    destroy(): void
  }
}

interface Window {
  YT?: typeof YT
  onYouTubeIframeAPIReady?: () => void
}
