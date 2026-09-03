import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import './background-snippets-noise-effect11.css'

interface NoiseProps {
  patternSize?: number
  patternScaleX?: number
  patternScaleY?: number
  patternRefreshInterval?: number
  /** 0–255. Higher is a coarser, more visible grain. */
  patternAlpha?: number
  /** false paints a single still frame instead of a flickering loop. */
  animated?: boolean
}

/** Animated film grain painted on a canvas stretched over its parent. */
export function Noise({
  patternSize = 250, // (reserved for future scaling)
  patternScaleX = 1, // (reserved)
  patternScaleY = 1, // (reserved)
  patternRefreshInterval = 2,
  patternAlpha = 15,
  animated = true,
}: NoiseProps) {
  const grainRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = grainRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const canvasSize = 1024
    canvas.width = canvasSize
    canvas.height = canvasSize

    // Allocated once and repainted in place — reallocating 4MB of pixel data
    // every other frame is the expensive part of this effect.
    const imageData = ctx.createImageData(canvasSize, canvasSize)
    const data = imageData.data

    const drawGrain = () => {
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255
        data[i] = value
        data[i + 1] = value
        data[i + 2] = value
        data[i + 3] = patternAlpha
      }
      ctx.putImageData(imageData, 0, 0)
    }

    // Either asked for explicitly, or forced by the OS setting — a permanently
    // flickering backdrop is exactly what that setting is for. Keep the
    // texture, drop the animation.
    const stillOnly = !animated || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (stillOnly) {
      drawGrain()
      return
    }

    let frame = 0
    let animationId = 0

    const loop = () => {
      if (frame % patternRefreshInterval === 0) drawGrain()
      frame++
      animationId = window.requestAnimationFrame(loop)
    }

    loop()

    return () => {
      window.cancelAnimationFrame(animationId)
    }
  }, [patternSize, patternScaleX, patternScaleY, patternRefreshInterval, patternAlpha, animated])

  return <canvas ref={grainRef} className="bg-noise__grain" aria-hidden="true" />
}

interface BackgroundNoiseProps {
  /** Fill behind the spotlight. Pass `transparent` to sit over an existing background. */
  baseColor?: string
  spotlightColor?: string
  spotlightSize?: string
  /** false drops the radial glow, leaving a flat base under the grain. */
  spotlight?: boolean
  /** `section` fills the nearest positioned ancestor; `viewport` pins to the screen. */
  anchor?: 'section' | 'viewport'
  patternRefreshInterval?: number
  patternAlpha?: number
  animated?: boolean
}

/** Radial spotlight over a dark base, finished with grain. */
export default function BackgroundNoise({
  baseColor,
  spotlightColor,
  spotlightSize,
  spotlight = true,
  anchor = 'section',
  patternRefreshInterval = 2,
  patternAlpha = 18,
  animated = true,
}: BackgroundNoiseProps) {
  return (
    <div
      className={`bg-noise${anchor === 'viewport' ? ' bg-noise--viewport' : ''}`}
      aria-hidden="true"
      style={
        {
          '--bg-noise-base': baseColor,
          '--bg-noise-spotlight': spotlightColor,
          '--bg-noise-spotlight-size': spotlightSize,
        } as CSSProperties
      }
    >
      {spotlight && <div className="bg-noise__spotlight" />}
      <Noise
        patternRefreshInterval={patternRefreshInterval}
        patternAlpha={patternAlpha}
        animated={animated}
      />
    </div>
  )
}
