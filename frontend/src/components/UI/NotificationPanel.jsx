import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Play, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function NotificationItem({ notification, onHover, onClick, onVanish }) {
  const itemRef = useRef(null);
  const [coords, setCoords] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (itemRef.current) {
      const rect = itemRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setCoords({ x, y });
      onHover({ x, y });
    }
  };

  return (
    <motion.div
      ref={itemRef}
      className={`notification-item ${notification.is_read ? 'read' : 'unread'}`}
      onClick={() => onClick(notification)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => onHover({ x: 50, y: 50 })}
      style={{ '--mouse-x': `${coords.x}%`, '--mouse-y': `${coords.y}%` }}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      layout
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="notification-icon"
        whileHover={{ scale: 1.15 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <Play size={16} />
      </motion.div>
      <div className="notification-content">
        <p className="notification-message">{notification.message}</p>
        <span className="notification-time">
          <Clock size={12} />
          {timeAgo(notification.created_at)}
        </span>
      </div>
      {!notification.is_read && <div className="unread-dot" />}
    </motion.div>
  );
}

export default function NotificationPanel({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('course_better_token');
      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('course_better_token');
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('course_better_token');
      await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id);
    }
    navigate(`/course/${notification.course_id}/play/0`);
    onClose();
  };

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const readCount = notifications.filter(n => n.is_read).length;
  const unreadCount = unreadNotifications.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="notification-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="notification-panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 200, damping: 30 }}
          >
            <div className="notification-header">
              <div className="notification-title">
                <Bell size={20} />
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <span className="notification-count">{unreadCount}</span>
                )}
              </div>
              <div className="notification-actions">
                {unreadCount > 0 && (
                  <button className="mark-all-btn" onClick={markAllAsRead}>
                    <Check size={16} />
                    Mark all read
                  </button>
                )}
              </div>
            </div>

            <div className="notification-list">
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <div className="notification-loading">
                    <div className="spinner" />
                  </div>
                ) : unreadNotifications.length === 0 ? (
                  <motion.div
                    className="notification-empty"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  >
                    <CheckCircle size={64} strokeWidth={1} />
                    <p>You're all caught up!</p>
                  </motion.div>
                ) : (
                  unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onHover={() => {}}
                      onClick={handleNotificationClick}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}