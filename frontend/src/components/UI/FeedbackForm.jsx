import { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './FeedbackForm.css';

export default function FeedbackForm({ courseId, isEnrolled, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('course_better_token');
      const response = await fetch(`${API_BASE_URL}/feedbacks/${courseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ rating, text }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to submit');
      }

      const data = await response.json();
      setSuccess(data.auto_added_to_testimonials 
        ? '✨ Your review has been featured on our homepage!' 
        : 'Thank you! Your feedback has been submitted.');
      setRating(0);
      setText('');
      onSubmit?.(data.feedback);
    } catch (error) {
      alert(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isEnrolled) {
    return (
      <div className="feedback-disabled">
        <p>Enroll in this course to submit feedback</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="feedback-success">
        <p>{success}</p>
        <button onClick={() => setSuccess(null)} className="btn btn-outline btn-sm">
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="feedback-form">
      <h4>Rate this Course</h4>
      
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
          >
            <Star size={28} fill={star <= (hoverRating || rating) ? '#D4AF37' : 'none'} />
          </button>
        ))}
        <span className="rating-label">
          {rating === 1 && 'Poor'}
          {rating === 2 && 'Fair'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Very Good'}
          {rating === 5 && 'Excellent'}
        </span>
      </div>

      <textarea
        className="input"
        rows={4}
        placeholder="Share your experience with this course."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button type="submit" className="btn btn-primary" disabled={submitting || rating === 0}>
        <Send size={16} />
        {submitting ? 'Submitting.' : 'Submit Feedback'}
      </button>
    </form>
  );
}
