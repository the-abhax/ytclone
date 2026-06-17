import { useState } from 'react'
import VideoThumb from './VideoThumb'

// Renders a poster (real thumbnail or generated fallback) until the
// person clicks play, then swaps in the actual YouTube iframe embed.
// The Data API only returns metadata, not playable video, so embedding
// youtube.com's own player is the correct and only way to play the video.
export default function Player({ video }) {
  const [activated, setActivated] = useState(false)

  if (activated) {
    return (
      <div className="player">
        <div className="player__embed-wrap">
          <iframe
            className="player__embed"
            src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    )
  }

  return (
    <div className="player">
      <button
        className="player__stage"
        style={{ '--thumb-accent': video.accent }}
        onClick={() => setActivated(true)}
        aria-label={`Play ${video.title}`}
        type="button"
      >
        <VideoThumb video={video} size="large" />
        <span className="player__play-overlay">
          <span className="player__play-icon">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M7 4.5v15l13-7.5z" />
            </svg>
          </span>
        </span>
      </button>
    </div>
  )
}
