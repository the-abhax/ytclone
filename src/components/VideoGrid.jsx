import VideoCard from './VideoCard'

export default function VideoGrid({ videos, emptyMessage }) {
  if (videos.length === 0) {
    return (
      <div className="video-grid__empty">
        <p className="video-grid__empty-title">No matches in the archive.</p>
        <p className="video-grid__empty-sub">{emptyMessage || 'Try a different search term or browse a category instead.'}</p>
      </div>
    )
  }

  return (
    <div className="video-grid">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  )
}
