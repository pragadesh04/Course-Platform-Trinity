import { useState, useEffect } from 'react';

export default function YouTubePlayer({ url, onComplete }) {
  const [videoId, setVideoId] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return;
    
    let id = '';
    if (url.includes('youtube.com/shorts/')) {
      id = url.split('/shorts/')[1]?.split('?')[0];
    } else if (url.includes('youtu.be/')) {
      id = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('v=')) {
      id = url.split('v=')[1]?.split('&')[0];
    } else if (url.includes('embed/')) {
      id = url.split('embed/')[1]?.split('?')[0];
    }
    
    setVideoId(id || '');
    setError(!id);
  }, [url]);

  if (error || !videoId) {
    return (
      <div className="player-no-video">
        <p>Invalid video URL</p>
      </div>
    );
  }

  return (
    <div className="youtube-player-wrapper">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}