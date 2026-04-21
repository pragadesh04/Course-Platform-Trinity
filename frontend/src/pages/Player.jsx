import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, Pause, Maximize, Minimize, CheckCircle } from 'lucide-react';
import { courseService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Player.css';

export default function Player() {
  const { courseId, sessionIndex } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const videoRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(parseInt(sessionIndex) || 0);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const [resumeTime, setResumeTime] = useState(0);

  useEffect(() => {
    fetchCourse();
    fetchProgress();
  }, [courseId, currentIndex]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const fetchCourse = async () => {
    try {
      const data = await courseService.getById(courseId);
      setCourse(data);
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('course_better_token');
      if (!token) return;
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/courses/${courseId}/progress`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (res.ok) {
        const progress = await res.json();
        const currentProgress = progress.find(p => p.session_idx === currentIndex);
        if (currentProgress && currentProgress.timestamp > 5) {
          setResumeTime(currentProgress.timestamp);
          setShowResumePrompt(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    }
  };

  const handleResume = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = resumeTime;
    }
    setShowResumePrompt(false);
  };

  const startProgressSync = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(async () => {
      if (!user || !videoRef.current) return;
      
      const currentTime = videoRef.current.currentTime;
      if (currentTime > 0) {
        try {
          const token = localStorage.getItem('course_better_token');
          if (!token) return;
          
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          await fetch(`${API_URL}/courses/${courseId}/progress`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              course_id: courseId,
              session_idx: currentIndex,
              timestamp: currentTime,
            }),
          });
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      }
    }, 120000);
  };

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      } else {
        videoRef.current.play();
        startProgressSync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleFullscreen = () => {
    const container = document.querySelector('.player-container');
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSessionClick = (index) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setCurrentIndex(index);
    setIsPlaying(false);
    setShowResumePrompt(false);
    navigate(`/course/${courseId}/play/${index}`);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      handleSessionClick(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (course && currentIndex < course.sessions_list.length - 1) {
      handleSessionClick(currentIndex + 1);
    }
  };

  if (loading) {
    return (
      <div className="player-loading">
        <div className="spinner" />
        <p>Loading player...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="player-error">
        <h2>Course not found</h2>
        <Link to="/courses" className="btn btn-primary">
          Browse Courses
        </Link>
      </div>
    );
  }

  const currentSession = course.sessions_list?.[currentIndex];

  return (
    <div className="player-container">
      <div className="player-main">
        <div className="player-header">
          <button className="back-btn" onClick={() => navigate(`/courses/${courseId}`)}>
            <ChevronLeft size={20} /> Back to Course
          </button>
          <h2>{course.title}</h2>
        </div>

        <div className="player-video-wrapper">
          {showResumePrompt && (
            <div className="resume-prompt">
              <p>Resume from {formatTime(resumeTime)}?</p>
              <div className="resume-prompt-buttons">
                <button className="btn btn-secondary btn-sm" onClick={() => setShowResumePrompt(false)}>
                  Start from Beginning
                </button>
                <button className="btn btn-primary btn-sm" onClick={handleResume}>
                  Resume
                </button>
              </div>
            </div>
          )}
          
          {currentSession?.video_url ? (
            <video
              ref={videoRef}
              className="player-video"
              src={currentSession.video_url}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onClick={handlePlay}
            />
          ) : (
            <div className="player-no-video">
              <p>Video not available</p>
            </div>
          )}
        </div>

        <div className="player-controls">
          <div className="player-progress-bar">
            <span className="player-time">{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={(e) => {
                const time = parseFloat(e.target.value);
                if (videoRef.current) {
                  videoRef.current.currentTime = time;
                }
                setCurrentTime(time);
              }}
              className="player-seek-bar"
            />
            <span className="player-time">{formatTime(duration)}</span>
          </div>

          <div className="player-buttons">
            <button 
              className="player-control-btn" 
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={24} />
            </button>

            <button className="player-control-btn play-btn" onClick={handlePlay}>
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>

            <button 
              className="player-control-btn" 
              onClick={handleNext}
              disabled={currentIndex >= course.sessions_list.length - 1}
            >
              <ChevronRight size={24} />
            </button>

            <button className="player-control-btn" onClick={handleFullscreen}>
              {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
            </button>
          </div>
        </div>
      </div>

      <aside className="player-sidebar">
        <h3>Course Sessions</h3>
        <div className="player-sessions-list">
          {course.sessions_list?.map((session, index) => (
            <button
              key={index}
              className={`player-session-item ${index === currentIndex ? 'active' : ''}`}
              onClick={() => handleSessionClick(index)}
            >
              <span className="session-number">{index + 1}</span>
              <span className="session-title">{session.title}</span>
              <span className="session-duration">
                {Math.round(session.duration)} min
              </span>
              {index === currentIndex && (
                <Play size={16} className="playing-icon" />
              )}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}