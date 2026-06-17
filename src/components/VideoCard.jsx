import { Link } from 'react-router-dom'
import VideoThumb from './VideoThumb'
import { formatViews, formatDate } from '../api/youtube'

export default function VideoCard({ video }) {
  return (
    <Link to={`/watch/${video.id}`} className="video-card">
      <VideoThumb video={video} />
      <div className="video-card__body">
        <h3 className="video-card__title">{video.title}</h3>
        <p className="video-card__creator">{video.creator}</p>
        <p className="video-card__meta">
          <span>{formatViews(video.views)}</span>
          <span className="video-card__dot">&middot;</span>
          <span>{formatDate(video.published)}</span>
        </p>
      </div>
    </Link>
  )
}
