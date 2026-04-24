import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Play, Pause, Maximize, Minimize, 
  Menu, X, FileText, Download, MessageCircle,
  Loader2, AlertCircle, Volume2, VolumeX, CheckCircle,
  SkipForward, PlayCircle, List
} from 'lucide-react';
import { courseService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SessionComments from '../components/UI/SessionComments';
import './Player.css';

function getVideoType(url) {
  if (!url || typeof url !== 'string') return 'none';
  const u = url.toLowerCase();
  if (u.includes('youtube.com') || u.includes('youtu.be') || u.includes('youtube') || u.includes('youtu.be/')) {
    return 'youtube';
  }
  if (u.includes('cloudinary.com')) {
    return 'cloudinary';
  }
  if (u.endsWith('.mp4') || u.includes('.mp4?') || u.includes('video')) {
    return 'video';
  }
  return 'unknown';
}

function getYouTubeId(url) {
  if (!url) return '';
  const u = url.toString();
  if (u.includes('youtube.com/shorts/')) {
    return u.split('/shorts/')[1]?.split('?')[0] || '';
  }
  if (u.includes('youtu.be/')) {
    return u.split('youtu.be/')[1]?.split('?')[0] || '';
  }
  if (u.includes('v=')) {
    return u.split('v=')[1]?.split('&')[0] || '';
  }
  if (u.includes('embed/')) {
    return u.split('embed/')[1]?.split('?')[0] || '';
  }
  return '';
}

function VideoPlayer({ url, onTimeUpdate, onDurationChange, onPlayStateChange }) {
  const videoRef = useRef(null);
  const [videoType, setVideoType] = useState('unknown');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setError(false);
    setLoading(true);
    if (url) {
      const type = getVideoType(url);
      setVideoType(type);
      console.log('[VideoPlayer] URL:', url, 'Type:', type);
    }
    setLoading(false);
  }, [url]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      onTimeUpdate?.(videoRef.current.currentTime);
    }
  }, [onTimeUpdate]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      onDurationChange?.(videoRef.current.duration);
    }
  }, [onDurationChange]);

  const handleVideoError = () => {
    console.error('[VideoPlayer] Error loading video');
    setError(true);
  };

  if (loading) {
    return (
      <div className="player-loading-state">
        <Loader2 className="spin" size={32} />
        <span>Loading video...</span>
      </div>
    );
  }

  if (!url) {
    return (
      <div className="player-error-state">
        <AlertCircle size={32} />
        <p>No video URL provided</p>
      </div>
    );
  }

  if (error || videoType === 'unknown') {
    return (
      <div className="player-error-state">
        <AlertCircle size={32} />
        <p>Unable to play video</p>
        <small>{url}</small>
      </div>
    );
  }

  if (videoType === 'youtube') {
    const youtubeId = getYouTubeId(url);
    if (!youtubeId) {
      return (
        <div className="player-error-state">
          <AlertCircle size={32} />
          <p>Invalid YouTube URL</p>
        </div>
      );
    }
    return (
      <div className="youtube-player-container">
        <iframe
          ref={videoRef}
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${youtubeId}?enablejsapi=1&modestbranding=1&rel=0&origin=${window.location.origin}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; webkit-fullscreen"
          allowFullScreen
          onError={handleVideoError}
        />
      </div>
    );
  }

  if (videoType === 'video' || videoType === 'cloudinary') {
    return (
      <video
        ref={videoRef}
        className="player-video-element"
        src={url}
        controls
        playsInline
        crossOrigin="anonymous"
        type="video/mp4"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => onPlayStateChange?.(true)}
        onPause={() => onPlayStateChange?.(false)}
        onError={handleVideoError}
        onLoadedData={() => console.log('[VideoPlayer] Video loaded successfully')}
      />
    );
  }

  return (
    <div className="player-error-state">
      <AlertCircle size={32} />
      <p>Unsupported video format</p>
    </div>
  );
}

export default function Player() {
  const { courseId, sessionIndex } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const progressIntervalRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(parseInt(sessionIndex) || 0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);
  
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [sessionProgress, setSessionProgress] = useState([]);
  const [autoPlayNext, setAutoPlayNext] = useState(true);
  const [showNextCountdown, setShowNextCountdown] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(5);
  const countdownRef = useRef(null);

  const currentSession = course?.sessions_list?.[currentIndex];
  const videoUrl = currentSession?.video_url;
  const nextSession = course?.sessions_list?.[currentIndex + 1];

  useEffect(() => {
    fetchCourse();
    fetchProgress();
  }, [courseId, currentIndex]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    } else {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  const fetchCourse = async () => {
    try {
      console.log('[Player] Fetching course:', courseId);
      const data = await courseService.getById(courseId);
      console.log('[Player] Course loaded:', data?.title, 'Sessions:', data?.sessions_list?.length);
      setCourse(data);
    } catch (error) {
      console.error('[Player] Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    if (!user) return;
    let token = null;
    try { 
      token = localStorage.getItem('course_better_token'); 
    } catch (e) {
      console.warn('[Player] localStorage not available');
    }
    if (!token) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/courses/${courseId}/progress`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const progress = await res.json();
        setSessionProgress(progress || []);
        const currentProgress = progress.find(p => p.session_idx === currentIndex);
        if (currentProgress && currentProgress.timestamp > 5) {
          setResumeTime(currentProgress.timestamp);
          setShowResumePrompt(true);
        }
      }
    } catch (error) {
      console.warn('[Player] Progress fetch failed:', error);
    }
  };

  const handleResume = () => {
    setShowResumePrompt(false);
  };

  const startProgressSync = useCallback(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    if (!currentTime) return;
    
    progressIntervalRef.current = setInterval(async () => {
      if (!user || !currentTime) return;
      let token = null;
      try { token = localStorage.getItem('course_better_token'); } catch {}
      if (!token) return;
      
      const isCompleted = duration > 0 && currentTime / duration >= 0.9;
      
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        await fetch(`${API_URL}/courses/${courseId}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ course_id: courseId, session_idx: currentIndex, timestamp: currentTime, completed: isCompleted }),
        });
        
        if (isCompleted) {
          setSessionProgress(prev => {
            const existing = prev.findIndex(p => p.session_idx === currentIndex);
            if (existing >= 0) {
              const updated = [...prev];
              updated[existing] = { ...updated[existing], completed: true, updated_at: new Date().toISOString() };
              return updated;
            }
            return [...prev, { session_idx: currentIndex, timestamp: currentTime, completed: true, updated_at: new Date().toISOString() }];
          });
          
          if (autoPlayNext && nextSession) {
            setShowNextCountdown(true);
            setCountdownSeconds(5);
            if (countdownRef.current) clearInterval(countdownRef.current);
            countdownRef.current = setInterval(() => {
              setCountdownSeconds(prev => {
                if (prev <= 1) {
                  handleSessionClick(currentIndex + 1);
                  return 0;
                }
                return prev - 1;
              });
            }, 1000);
          }
        }
      } catch (e) {
        console.warn('Progress sync failed:', e);
      }
    }, 120000);
  }, [user, currentTime, courseId, currentIndex, nextSession, autoPlayNext, duration]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (isPlaying) {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  };

  const handleFullscreen = () => {
    const container = document.querySelector('.player-container');
    if (!document.fullscreenElement) {
      container?.requestFullscreen?.().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false));
    }
  };

  const handleTheaterMode = () => setIsTheaterMode(!isTheaterMode);

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSessionClick = (index) => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    setCurrentIndex(index);
    setIsPlaying(false);
    setShowResumePrompt(false);
    setShowMobileSidebar(false);
    navigate(`/course/${courseId}/play/${index}`);
  };

  const handlePrevious = () => currentIndex > 0 && handleSessionClick(currentIndex - 1);
  const handleNext = () => course && currentIndex < course.sessions_list.length - 1 && handleSessionClick(currentIndex + 1);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'resources', label: 'Resources', icon: Download },
    { id: 'discussion', label: 'Discussion', icon: MessageCircle },
  ];

  if (loading) {
    return (
      <div className="player-loading">
        <Loader2 className="spin" size={40} />
        <p>Loading player...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="player-error">
        <h2>Course not found</h2>
        <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
      </div>
    );
  }

  return (
    <div className="player-container">
      <div className="player-header">
        <button className="back-btn" onClick={() => navigate(`/courses/${courseId}`)}>
          <ChevronLeft size={20} /> Back to Course
        </button>
      </div>
      
      <div className="player-video-container">
        <VideoPlayer
          url={videoUrl}
          onTimeUpdate={setCurrentTime}
          onDurationChange={setDuration}
          onPlayStateChange={(playing) => {
            setIsPlaying(playing);
            if (playing) startProgressSync();
          }}
        />
      </div>

      <div className="player-info">
        <h2>{currentSession?.title}</h2>
        <p>{currentSession?.description || 'No description available.'}</p>
        <div className="player-nav">
          <button onClick={handlePrevious} disabled={currentIndex === 0}>
            <ChevronLeft size={20} /> Previous
          </button>
          <span>Session {currentIndex + 1} of {course?.sessions_list?.length}</span>
          <button onClick={handleNext} disabled={!course || currentIndex >= course.sessions_list.length - 1}>
            Next <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="player-tabs">
        <button className={`player-tab ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab(activeTab === 'sessions' ? '' : 'sessions')}>
          <List size={18} /> Sessions
        </button>
        <button className={`player-tab ${activeTab === 'comments' ? 'active' : ''}`} onClick={() => setActiveTab(activeTab === 'comments' ? '' : 'comments')}>
          <MessageCircle size={18} /> Comments
        </button>
      </div>

      <div className="player-tab-content">
        {activeTab === 'sessions' && (
          <div className="sessions-list">
            {course?.sessions_list?.map((session, index) => (
              <button key={index} className={`session-item ${index === currentIndex ? 'active' : ''}`} onClick={() => handleSessionClick(index)}>
                <span className="session-num">{index + 1}</span>
                <span className="session-title">{session.title}</span>
                <span className="session-duration">{Math.round(session.duration)} min</span>
              </button>
            ))}
          </div>
        )}
        {activeTab === 'comments' && (
          <div className="player-comments">
            <SessionComments courseId={courseId} sessionIndex={currentIndex} isEnrolled={true} />
          </div>
        )}
      </div>
    </div>
  );
}