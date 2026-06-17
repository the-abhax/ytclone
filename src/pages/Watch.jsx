import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import Player from '../components/Player'
import VideoCard from '../components/VideoCard'
import { accentForId } from '../components/VideoThumb'
import {
  getVideoDetails,
  getRelatedVideos,
  formatViews,
  formatDate,
  ApiKeyMissingError,
} from '../api/youtube'

const DESCRIPTION_PREVIEW_LENGTH = 280

export default function Watch() {
  const { videoId } = useParams()
  const navigate = useNavigate()

  const [video, setVideo] = useState(null)
  const [related, setRelated] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'not-found' | 'error'
  const [error, setError] = useState(null)
  const [descExpanded, setDescExpanded] = useState(false)
  const requestIdRef = useRef(0)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setDescExpanded(false)

    const requestId = ++requestIdRef.current
    setStatus('loading')
    setError(null)

    getVideoDetails(videoId)
      .then((result) => {
        if (requestId !== requestIdRef.current) return
        if (!result) {
          setStatus('not-found')
          return
        }
        setVideo(result)
        setStatus('ready')
        // Related videos are fetched separately so a slow related-search
        // never blocks the main video and player from showing first.
        getRelatedVideos(result, { maxResults: 6 })
          .then((rel) => {
            if (requestId === requestIdRef.current) setRelated(rel)
          })
          .catch(() => {
            // Related videos are a nice-to-have; fail silently and just
            // leave the rail showing its empty state.
          })
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return
        setError(err)
        setStatus('error')
      })
  }, [videoId])

  if (status === 'loading') {
    return (
      <div className="page page--watch">
        <div className="watch__main">
          <div className="player-skeleton" aria-hidden="true" />
        </div>
      </div>
    )
  }

  if (status === 'not-found') {
    return (
      <div className="page">
        <div className="video-grid__empty">
          <p className="video-grid__empty-title">This reel isn&rsquo;t in the archive.</p>
          <p className="video-grid__empty-sub">It may have been removed, made private, or the link is incorrect.</p>
          <button className="watch__back-btn" onClick={() => navigate('/')} type="button">
            Back to archive
          </button>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    const isKeyMissing = error instanceof ApiKeyMissingError
    return (
      <div className="page">
        <div className="video-grid__empty">
          <p className="video-grid__empty-title">
            {isKeyMissing ? 'No YouTube API key found.' : 'Couldn\u2019t load this video.'}
          </p>
          <p className="video-grid__empty-sub">
            {isKeyMissing
              ? 'Copy .env.example to .env and add your VITE_YOUTUBE_API_KEY, then restart the dev server.'
              : error?.message || 'Something went wrong. Try again.'}
          </p>
        </div>
      </div>
    )
  }

  const accent = accentForId(video.id)
  const description = video.description || 'No description provided.'
  const isLongDescription = description.length > DESCRIPTION_PREVIEW_LENGTH
  const visibleDescription =
    descExpanded || !isLongDescription
      ? description
      : `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH).trimEnd()}\u2026`

  return (
    <div className="page page--watch">
      <div className="watch__main">
        <Player video={video} />

        <div className="watch__info">
          <h1 className="watch__title">{video.title}</h1>
          <div className="watch__meta-row">
            <span>{formatViews(video.views)}</span>
            <span className="video-card__dot">&middot;</span>
            <span>Published {formatDate(video.published)}</span>
            <span className="video-card__dot">&middot;</span>
            <span className="watch__duration">{video.duration}</span>
          </div>

          <div className="watch__creator-row">
            <span className="watch__creator-avatar" style={{ background: accent }}>
              {video.creator.charAt(0)}
            </span>
            <div className="watch__creator-info">
              <span className="watch__creator-name">{video.creator}</span>
              <span className="watch__creator-label">YouTube channel</span>
            </div>
          </div>

          <p className="watch__description">
            {visibleDescription}
            {isLongDescription && (
              <button
                className="watch__description-toggle"
                onClick={() => setDescExpanded((v) => !v)}
                type="button"
              >
                {descExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </p>

          {video.tags.length > 0 && (
            <div className="watch__tags">
              {video.tags.slice(0, 8).map((tag) => (
                <span key={tag} className="watch__tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <aside className="watch__related">
        <h2 className="watch__related-heading">More like this</h2>
        {related.length === 0 ? (
          <p className="video-grid__empty-sub">No related reels found yet.</p>
        ) : (
          <div className="watch__related-list">
            {related.map((v) => (
              <VideoCard key={v.id} video={v} />
            ))}
          </div>
        )}
        <Link to="/" className="watch__back-link">
          &larr; Back to full archive
        </Link>
      </aside>
    </div>
  )
}
