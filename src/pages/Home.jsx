import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import VideoGrid from '../components/VideoGrid'
import { searchVideosWithDetails, ApiKeyMissingError, YoutubeApiError } from '../api/youtube'
import { getCategory } from '../data/categories'

// Search-as-you-type would burn API quota on every keystroke, so input
// is debounced before it triggers a request.
const SEARCH_DEBOUNCE_MS = 500

export default function Home({ query, onResultCount }) {
  const { categoryId } = useParams()
  const activeCategory = getCategory(categoryId)

  const [videos, setVideos] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null)
  const debounceRef = useRef(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    clearTimeout(debounceRef.current)

    const effectiveQuery = query.trim() || activeCategory.query
    const isLiveTyping = query.trim().length > 0

    debounceRef.current = setTimeout(
      () => {
        const requestId = ++requestIdRef.current
        setStatus('loading')
        setError(null)
        onResultCount(null)

        searchVideosWithDetails(effectiveQuery, { maxResults: 24 })
          .then((results) => {
            if (requestId !== requestIdRef.current) return // stale response, a newer search superseded it
            setVideos(results)
            setStatus('ready')
            if (isLiveTyping) onResultCount(results.length)
          })
          .catch((err) => {
            if (requestId !== requestIdRef.current) return
            setError(err)
            setStatus('error')
            onResultCount(null)
          })
      },
      isLiveTyping ? SEARCH_DEBOUNCE_MS : 0
    )

    return () => clearTimeout(debounceRef.current)
  }, [query, activeCategory.query, onResultCount])

  const headerTitle = query.trim() ? 'Search results' : activeCategory.label
  const headerSubtitle = query.trim()
    ? `Showing live YouTube results for "${query.trim()}"`
    : activeCategory.id === 'all'
      ? 'A live feed pulled from YouTube, refreshed each time you search or switch categories.'
      : `Live YouTube results for ${activeCategory.label.toLowerCase()}.`

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">{headerTitle}</h1>
        <p className="page__subtitle">{headerSubtitle}</p>
      </div>

      {status === 'loading' && <LoadingState />}
      {status === 'error' && <ErrorState error={error} />}
      {status === 'ready' && (
        <VideoGrid
          videos={videos}
          emptyMessage="Try a different search term, or browse a category from the sidebar instead."
        />
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="video-grid">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="video-card-skeleton" aria-hidden="true">
          <div className="video-card-skeleton__thumb" />
          <div className="video-card-skeleton__line video-card-skeleton__line--title" />
          <div className="video-card-skeleton__line video-card-skeleton__line--short" />
        </div>
      ))}
    </div>
  )
}

function ErrorState({ error }) {
  if (error instanceof ApiKeyMissingError) {
    return (
      <div className="video-grid__empty">
        <p className="video-grid__empty-title">No YouTube API key found.</p>
        <p className="video-grid__empty-sub">
          Copy .env.example to .env at the project root, paste your YouTube Data API v3 key
          into VITE_YOUTUBE_API_KEY, then restart the dev server.
        </p>
      </div>
    )
  }

  if (error instanceof YoutubeApiError && error.status === 403) {
    return (
      <div className="video-grid__empty">
        <p className="video-grid__empty-title">YouTube API quota exceeded or key rejected.</p>
        <p className="video-grid__empty-sub">
          The Data API has a daily quota, and search requests are the most expensive call.
          Check your usage in Google Cloud Console, or confirm the key is unrestricted for
          local testing and has the YouTube Data API v3 enabled.
        </p>
      </div>
    )
  }

  return (
    <div className="video-grid__empty">
      <p className="video-grid__empty-title">Couldn&rsquo;t reach YouTube.</p>
      <p className="video-grid__empty-sub">{error?.message || 'Something went wrong fetching results. Try again.'}</p>
    </div>
  )
}
