import { useMemo, useState } from 'react'

// Deterministic pseudo-random generator seeded from a string, so the
// fallback thumbnail (used when no real YouTube thumbnail is available,
// or it fails to load) is stable per video rather than re-randomizing on
// every render.
function seededRandom(seed) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i)
    h |= 0
  }
  return function () {
    h = (h * 1103515245 + 12345) & 0x7fffffff
    return (h % 1000) / 1000
  }
}

// A small fixed palette so generated accents stay consistent with the
// archive's overall color language instead of drifting random hues.
const ACCENT_PALETTE = ['#3E8E7E', '#B5562B', '#3B6FA0', '#A33B3B', '#C9A24B', '#6B5B95', '#5C5C5C']

export function accentForId(id) {
  const rand = seededRandom(id)
  return ACCENT_PALETTE[Math.floor(rand() * ACCENT_PALETTE.length)]
}

function GeneratedArt({ video, accent }) {
  const bars = useMemo(() => {
    const rand = seededRandom(video.id)
    const count = 24
    return Array.from({ length: count }, (_, i) => {
      const height = 20 + rand() * 70
      return { x: i * (100 / count), height }
    })
  }, [video.id])

  return (
    <svg viewBox="0 0 100 56" preserveAspectRatio="none" className="thumb-svg">
      <rect width="100" height="56" className="thumb-bg" />
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={bar.x}
          y={56 - bar.height * 0.56}
          width={100 / bars.length - 0.6}
          height={bar.height * 0.56}
          className="thumb-bar"
          style={{ fill: accent, animationDelay: `${i * 0.02}s` }}
        />
      ))}
    </svg>
  )
}

export default function VideoThumb({ video, size = 'normal' }) {
  const [imgFailed, setImgFailed] = useState(false)
  const accent = video.accent || accentForId(video.id)
  const useRealThumb = Boolean(video.thumbnailUrl) && !imgFailed

  return (
    <div
      className={`thumb-art thumb-art--${size}`}
      style={{ '--thumb-accent': accent }}
      aria-hidden="true"
    >
      {useRealThumb ? (
        <img
          src={video.thumbnailUrl}
          alt=""
          className="thumb-img"
          loading="lazy"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <GeneratedArt video={video} accent={accent} />
      )}
      {video.duration && <span className="thumb-duration">{video.duration}</span>}
    </div>
  )
}
