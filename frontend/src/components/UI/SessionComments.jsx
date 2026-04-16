import { useState, useEffect } from 'react';
import { MessageCircle, Send, Reply, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useAuth } from '../../context/AuthContext';
import './SessionComments.css';

export default function SessionComments({ courseId, sessionIndex, isEnrolled }) {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [courseId, sessionIndex]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/comments/${courseId}/${sessionIndex}`);
      const data = await response.json();
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('course_better_token');
      const response = await fetch(`${API_BASE_URL}/comments/${courseId}/${sessionIndex}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });

      if (!response.ok) throw new Error('Failed to post comment');
      
      setNewComment('');
      fetchComments();
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (commentId) => {
    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('course_better_token');
      const response = await fetch(`${API_BASE_URL}/comments/${commentId}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: replyText }),
      });

      if (!response.ok) throw new Error('Failed to reply');
      
      setReplyText('');
      setReplyingTo(null);
      fetchComments();
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return;

    try {
      const token = localStorage.getItem('course_better_token');
      await fetch(`${API_BASE_URL}/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchComments();
    } catch (error) {
      alert(error.message);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="session-comments">
      <h4><MessageCircle size={20} /> Comments ({comments.length})</h4>

      {loading ? (
        <p className="comments-loading">Loading comments...</p>
      ) : (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{comment.user_name}</span>
                <span className="comment-date">{formatDate(comment.created_at)}</span>
              </div>
              <p className="comment-text">{comment.text}</p>
              
              {comment.replies?.length > 0 && (
                <div className="replies-list">
                  {comment.replies.map((reply, i) => (
                    <div key={i} className="reply-item admin-reply">
                      <span className="reply-author">Admin</span>
                      <p className="reply-text">{reply.text}</p>
                      <span className="reply-date">{formatDate(reply.replied_at)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="comment-actions">
                {isAdmin && (
                  <>
                    <button onClick={() => setReplyingTo(comment.id)} className="action-btn">
                      <Reply size={14} /> Reply
                    </button>
                    <button onClick={() => handleDelete(comment.id)} className="action-btn delete">
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>

              {replyingTo === comment.id && (
                <div className="reply-form">
                  <input
                    type="text"
                    className="input"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <button onClick={() => handleReply(comment.id)} disabled={submitting}>
                    <Send size={14} />
                  </button>
                  <button onClick={() => setReplyingTo(null)} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {user && isEnrolled && (
        <form onSubmit={handleSubmit} className="comment-form">
          <input
            type="text"
            className="input"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button type="submit" disabled={submitting || !newComment.trim()}>
            <Send size={16} />
          </button>
        </form>
      )}

      {!user && (
        <p className="comments-login">Login to post comments</p>
      )}

      {user && !isEnrolled && (
        <p className="comments-enroll">Enroll to post comments</p>
      )}
    </div>
  );
}
