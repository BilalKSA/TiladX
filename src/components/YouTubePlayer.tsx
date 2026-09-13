import { useEffect, useRef, useState } from 'react'
import Spinner from './Spinner'
import { loadYouTubeApi } from '../lib/youtubeApi'
import './YouTubePlayer.css'

interface YouTubePlayerProps {
  videoId: string
  title?: string
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Our own controls over YouTube's IFrame Player API, instead of their default
// embed chrome — no Share button, no related-video grid, no YouTube branding
// in the control bar. The video itself is still served from YouTube; this
// only replaces the UI around it (see the note in lib/video.ts).
function YouTubePlayer({ videoId, title }: YouTubePlayerProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YT.Player | null>(null)
  const seekTrackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    let cancelled = false

    loadYouTubeApi().then((YT) => {
      if (cancelled || !hostRef.current) return

      const player = new YT.Player(hostRef.current, {
        videoId,
        playerVars: { controls: 0, rel: 0, modestbranding: 1, playsinline: 1 },
        events: {
          onReady: (event) => {
            const iframe = event.target.getIframe()
            // The API sizes its iframe with fixed width/height attributes —
            // stretch it to fill the 16:9 wrapper instead.
            iframe.style.position = 'absolute'
            iframe.style.inset = '0'
            iframe.style.inlineSize = '100%'
            iframe.style.blockSize = '100%'
            setDuration(event.target.getDuration())
            setReady(true)
          },
          onStateChange: (event) => {
            setPlaying(event.data === YT.PlayerState.PLAYING)
            setBuffering(event.data === YT.PlayerState.BUFFERING)
            if (event.data === YT.PlayerState.PLAYING) {
              setDuration(event.target.getDuration())
            }
          },
        },
      })

      playerRef.current = player
    })

    return () => {
      cancelled = true
      playerRef.current?.destroy()
      playerRef.current = null
    }
    // videoId change remounts this component from the caller (key={videoId}),
    // so this effect is mount/unmount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Polls playback position while playing — the API has no time-update event.
  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => {
      if (!draggingRef.current && playerRef.current) {
        setCurrentTime(playerRef.current.getCurrentTime())
      }
    }, 250)
    return () => window.clearInterval(id)
  }, [playing])

  function togglePlay() {
    const player = playerRef.current
    if (!player) return
    if (playing) player.pauseVideo()
    else player.playVideo()
  }

  function toggleMute() {
    const player = playerRef.current
    if (!player) return
    if (muted) {
      player.unMute()
      setMuted(false)
    } else {
      player.mute()
      setMuted(true)
    }
  }

  function toggleFullscreen() {
    playerRef.current?.getIframe().requestFullscreen()
  }

  function seekToClientX(clientX: number) {
    const track = seekTrackRef.current
    const player = playerRef.current
    if (!track || !player || duration <= 0) return
    const rect = track.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    const target = ratio * duration
    setCurrentTime(target)
    player.seekTo(target, true)
  }

  function handleSeekPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    draggingRef.current = true
    event.currentTarget.setPointerCapture(event.pointerId)
    seekToClientX(event.clientX)
  }

  function handleSeekPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return
    seekToClientX(event.clientX)
  }

  function handleSeekPointerUp() {
    draggingRef.current = false
  }

  // The seek bar is forced LTR (see .tld-yt-player__seek in the CSS) — a
  // video timeline reads left-to-right by convention regardless of page
  // direction, same reasoning as the timestamp's forced `direction: ltr`.
  // So unlike the app's usual RTL arrow-key inversion, ArrowRight here means
  // forward in time (physical right), not "back" through a list.
  function handleSeekKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const player = playerRef.current
    if (!player || duration <= 0) return

    const step = 5
    let target: number | null = null
    if (event.key === 'ArrowRight') target = Math.min(duration, currentTime + step)
    else if (event.key === 'ArrowLeft') target = Math.max(0, currentTime - step)
    else if (event.key === 'Home') target = 0
    else if (event.key === 'End') target = duration
    if (target === null) return

    event.preventDefault()
    setCurrentTime(target)
    player.seekTo(target, true)
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="tld-yt-player" role="region" aria-label={title}>
      <div className="tld-yt-player__frame" ref={hostRef} />

      {(!ready || buffering) && (
        <div className="tld-yt-player__loading">
          <Spinner size={28} />
        </div>
      )}

      {ready && (
        <button
          type="button"
          className="tld-yt-player__tap"
          tabIndex={-1}
          aria-hidden="true"
          onClick={togglePlay}
        />
      )}

      {ready && (
        <div className="tld-yt-player__controls">
          <button type="button" className="tld-yt-player__btn" onClick={togglePlay} aria-label={playing ? 'إيقاف' : 'تشغيل'}>
            {playing ? (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 5.5v13a1 1 0 0 0 1.53.85l10.5-6.5a1 1 0 0 0 0-1.7l-10.5-6.5A1 1 0 0 0 7 5.5Z" />
              </svg>
            )}
          </button>

          <div
            className="tld-yt-player__seek"
            ref={seekTrackRef}
            onPointerDown={handleSeekPointerDown}
            onPointerMove={handleSeekPointerMove}
            onPointerUp={handleSeekPointerUp}
            onKeyDown={handleSeekKeyDown}
            tabIndex={0}
            role="slider"
            aria-label="موضع الفيديو"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(currentTime)}
          >
            <div className="tld-yt-player__seek-fill" style={{ inlineSize: `${progress}%` }} />
          </div>

          <span className="tld-yt-player__time">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>

          <button type="button" className="tld-yt-player__btn" onClick={toggleMute} aria-label={muted ? 'تفعيل الصوت' : 'كتم الصوت'}>
            {muted ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                <path d="m16 9 5 6M21 9l-5 6" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11" />
              </svg>
            )}
          </button>

          <button type="button" className="tld-yt-player__btn" onClick={toggleFullscreen} aria-label="ملء الشاشة">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default YouTubePlayer
