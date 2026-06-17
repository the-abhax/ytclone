// Thin client around the YouTube Data API v3.
//
// The key is read from an env var injected at build time by Vite, never
// hardcoded here. Create a .env file (see .env.example) with:
//   VITE_YOUTUBE_API_KEY=your-real-key
// .env is gitignored, so the real key never lands in source control.

const API_BASE = 'https://www.googleapis.com/youtube/v3'

function getApiKey() {
  const key = import.meta.env.VITE_YOUTUBE_API_KEY
  if (!key) {
    throw new ApiKeyMissingError()
  }
  return key
}

export class ApiKeyMissingError extends Error {
  constructor() {
    super(
      'No YouTube API key found. Add VITE_YOUTUBE_API_KEY to a .env file at the project root, then restart the dev server.'
    )
    this.name = 'ApiKeyMissingError'
  }
}

export class YoutubeApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'YoutubeApiError'
    this.status = status
  }
}

async function request(path, params) {
  const key = getApiKey()
  const url = new URL(`${API_BASE}/${path}`)
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v)
  })
  url.searchParams.set('key', key)

  const res = await fetch(url.toString())
  if (!res.ok) {
    let message = `YouTube API request failed (${res.status})`
    try {
      const body = await res.json()
      message = body?.error?.message || message
    } catch {
      // response body wasn't JSON, fall back to the generic message
    }
    throw new YoutubeApiError(message, res.status)
  }
  return res.json()
}

function parseDuration(iso8601) {
  // Parses ISO 8601 durations like PT1H2M10S into total seconds and a
  // HH:MM:SS timecode string, matching the format the rest of the app uses.
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso8601 || '')
  if (!match) return { seconds: 0, timecode: '00:00:00' }
  const hours = parseInt(match[1] || '0', 10)
  const minutes = parseInt(match[2] || '0', 10)
  const seconds = parseInt(match[3] || '0', 10)
  const totalSeconds = hours * 3600 + minutes * 60 + seconds
  const timecode = [hours, minutes, seconds]
    .map((n) => String(n).padStart(2, '0'))
    .join(':')
  return { seconds: totalSeconds, timecode }
}

function mapSearchItemToStub(item) {
  // search.list does not return duration or view count, so this is a
  // partial shape used only until videos.list fills in the rest.
  return {
    id: item.id.videoId,
    title: item.snippet.title,
    creator: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    published: item.snippet.publishedAt,
    thumbnailUrl:
      item.snippet.thumbnails?.high?.url ||
      item.snippet.thumbnails?.medium?.url ||
      item.snippet.thumbnails?.default?.url,
    description: item.snippet.description,
  }
}

function mapVideoResource(item) {
  const { seconds, timecode } = parseDuration(item.contentDetails?.duration)
  return {
    id: item.id,
    title: item.snippet.title,
    creator: item.snippet.channelTitle,
    channelId: item.snippet.channelId,
    published: item.snippet.publishedAt,
    thumbnailUrl:
      item.snippet.thumbnails?.high?.url ||
      item.snippet.thumbnails?.medium?.url ||
      item.snippet.thumbnails?.default?.url,
    description: item.snippet.description,
    tags: item.snippet.tags || [],
    categoryId: item.snippet.categoryId,
    duration: timecode,
    durationSeconds: seconds,
    views: parseInt(item.statistics?.viewCount || '0', 10),
    likes: parseInt(item.statistics?.likeCount || '0', 10),
  }
}

/**
 * Searches videos by free-text query. Returns lightweight stubs (no
 * duration/view count yet — call hydrateVideoDetails to fill those in).
 */
export async function searchVideos(query, { maxResults = 24 } = {}) {
  const data = await request('search', {
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults,
    safeSearch: 'strict',
  })
  return (data.items || []).map(mapSearchItemToStub)
}

/**
 * Given an array of video IDs, fetches full details (duration, stats,
 * tags) in a single request. The Data API allows up to 50 IDs per call.
 */
export async function hydrateVideoDetails(videoIds) {
  if (videoIds.length === 0) return []
  const data = await request('videos', {
    part: 'snippet,contentDetails,statistics',
    id: videoIds.slice(0, 50).join(','),
  })
  return (data.items || []).map(mapVideoResource)
}

/**
 * Convenience wrapper: search, then hydrate in one round trip pair, so
 * callers get fully-formed video objects with durations and view counts.
 */
export async function searchVideosWithDetails(query, opts) {
  const stubs = await searchVideos(query, opts)
  const details = await hydrateVideoDetails(stubs.map((s) => s.id))
  // videos.list can omit results for region-restricted or deleted videos,
  // so reorder by the original search ranking and drop anything missing.
  const byId = new Map(details.map((d) => [d.id, d]))
  return stubs.map((s) => byId.get(s.id)).filter(Boolean)
}

export async function getVideoDetails(videoId) {
  const results = await hydrateVideoDetails([videoId])
  return results[0] || null
}

/**
 * Fetches "related" videos by reusing the source video's title as a
 * search query. The Data API removed its dedicated relatedToVideoId
 * parameter, so a title/tag-based search is the closest stable substitute.
 */
export async function getRelatedVideos(video, { maxResults = 8 } = {}) {
  if (!video) return []
  const seedTerms = video.tags?.length ? video.tags.slice(0, 3).join(' ') : video.title
  const results = await searchVideosWithDetails(seedTerms, { maxResults: maxResults + 1 })
  return results.filter((v) => v.id !== video.id).slice(0, maxResults)
}

export function formatViews(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M views`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K views`
  return `${n} views`
}

export function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
