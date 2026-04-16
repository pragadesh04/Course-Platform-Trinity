import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Clock, Users, BookOpen, CheckCircle, ChevronDown, ChevronUp, ShoppingCart } from 'lucide-react';
import { courseService, orderService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Image from '../components/UI/Image';
import SessionComments from '../components/UI/SessionComments';
import FeedbackForm from '../components/UI/FeedbackForm';
import './CourseDetail.css';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [expandedSessions, setExpandedSessions] = useState({});
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    fetchCourse();
    if (user) fetchEnrolledCourses();
  }, [id, user]);

  const fetchCourse = async () => {
    try {
      const data = await courseService.getById(id);
      setCourse(data);
      if (data.prices?.m3) setSelectedPlan('m3');
      else if (data.prices?.m6) setSelectedPlan('m6');
      else if (data.prices?.lifetime) setSelectedPlan('lifetime');
    } catch (error) {
      console.error('Failed to fetch course:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const orders = await orderService.getMyOrders();
      const enrolled = orders
        .filter((o) => o.status === 'delivered')
        .flatMap((o) => o.items)
        .filter((item) => item.type === 'course')
        .map((item) => item.item_id);
      setEnrolledCourses(enrolled);
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
    }
  };

  const isEnrolled = enrolledCourses.includes(id);

  const toggleSession = (index) => {
    setExpandedSessions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }
    if (!selectedPlan) {
      alert('Please select a plan');
      return;
    }

    setOrdering(true);
    try {
      const price = course.prices[selectedPlan];
      await orderService.create({
        items: [{ type: 'course', item_id: id }],
        total_amount: price,
        plan_type: selectedPlan,
      });
      alert('Order placed successfully! Your course will be activated once payment is confirmed.');
      fetchEnrolledCourses();
    } catch (error) {
      alert(error.message);
    } finally {
      setOrdering(false);
    }
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Free';
    return `₹${price.toLocaleString()}`;
  };

  const getPlanLabel = (plan) => {
    const labels = {
      m3: '3 Months',
      m6: '6 Months',
      lifetime: 'Lifetime Access',
    };
    return labels[plan] || plan;
  };

  if (loading) {
    return (
      <div className="course-detail-loading">
        <div className="spinner" />
        <p>Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail-error">
        <h2>Course not found</h2>
        <Link to="/courses" className="btn btn-primary">
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="course-detail-page">
      <div className="course-hero">
        <div className="container">
          <div className="course-hero-content">
            <div className="course-hero-info">
              <span className="course-category">{course.category_name}</span>
              <h1>{course.title}</h1>
              <p className="course-description">{course.description}</p>
              
              <div className="course-meta">
                <span><Play size={16} /> {course.sessions || 0} Sessions</span>
                <span><Clock size={16} /> {course.duration || 0} mins</span>
                {isEnrolled && (
                  <span className="enrolled-badge">
                    <CheckCircle size={16} /> Enrolled
                  </span>
                )}
              </div>
            </div>

            <div className="course-hero-thumbnail">
              <Image 
                src={course.thumbnail_url} 
                alt={course.title}
                fallback="https://placehold.co/400x250/D4AF37/1A1A1A?text=Course"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="course-content-grid">
          <div className="course-main">
            <section className="course-section">
              <h2><BookOpen size={20} /> Course Sessions</h2>
              <div className="sessions-list">
                {course.sessions_list?.map((session, index) => (
                  <div key={index} className="session-item">
                    <button 
                      className="session-header"
                      onClick={() => toggleSession(index)}
                    >
                      <span className="session-number">Session {index + 1}</span>
                      <span className="session-title">{session.title}</span>
                      {expandedSessions[index] ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </button>
                    {expandedSessions[index] && (
                      <div className="session-content">
                        <p>{session.description}</p>
                        {isEnrolled ? (
                          <div className="session-video">
                            <video controls src={session.video_url}>
                              Your browser does not support video.
                            </video>
                          </div>
                        ) : (
                          <div className="session-locked">
                            <p>Enroll to access this video</p>
                          </div>
                        )}
                        <div className="session-comments-section">
                          <SessionComments 
                            courseId={id} 
                            sessionIndex={index}
                            isEnrolled={isEnrolled}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="course-section">
              <h2>Student Feedback</h2>
              <FeedbackForm courseId={id} isEnrolled={isEnrolled} />
            </section>
          </div>

          <aside className="course-sidebar">
            <div className="enrollment-card">
              <h3>Enroll in this Course</h3>
              
              {isEnrolled ? (
                <div className="enrolled-info">
                  <CheckCircle size={48} />
                  <p>You have access to all course content</p>
                </div>
              ) : (
                <>
                  <div className="pricing-options">
                    {course.prices?.m3 && (
                      <label className={`pricing-option ${selectedPlan === 'm3' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="plan"
                          value="m3"
                          checked={selectedPlan === 'm3'}
                          onChange={() => setSelectedPlan('m3')}
                        />
                        <span className="plan-name">{getPlanLabel('m3')}</span>
                        <span className="plan-price">{formatPrice(course.prices.m3)}</span>
                      </label>
                    )}
                    {course.prices?.m6 && (
                      <label className={`pricing-option ${selectedPlan === 'm6' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="plan"
                          value="m6"
                          checked={selectedPlan === 'm6'}
                          onChange={() => setSelectedPlan('m6')}
                        />
                        <span className="plan-name">{getPlanLabel('m6')}</span>
                        <span className="plan-price">{formatPrice(course.prices.m6)}</span>
                      </label>
                    )}
                    {course.prices?.lifetime && (
                      <label className={`pricing-option ${selectedPlan === 'lifetime' ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="plan"
                          value="lifetime"
                          checked={selectedPlan === 'lifetime'}
                          onChange={() => setSelectedPlan('lifetime')}
                        />
                        <span className="plan-name">{getPlanLabel('lifetime')}</span>
                        <span className="plan-price">{formatPrice(course.prices.lifetime)}</span>
                      </label>
                    )}
                  </div>

                  {selectedPlan && (
                    <div className="total-price">
                      Total: <strong>{formatPrice(course.prices[selectedPlan])}</strong>
                    </div>
                  )}

                  <button
                    onClick={handleEnroll}
                    disabled={ordering || !selectedPlan}
                    className="btn btn-primary btn-lg"
                  >
                    <ShoppingCart size={18} />
                    {ordering ? 'Processing...' : 'Enroll Now'}
                  </button>
                </>
              )}
            </div>

            <div className="course-info-card">
              <h4>This course includes:</h4>
              <ul>
                <li><Play size={16} /> {course.sessions || 0} video sessions</li>
                <li><Clock size={16} /> {course.duration || 0} minutes of content</li>
                <li><Users size={16} /> Access on mobile and desktop</li>
                <li><BookOpen size={16} /> Downloadable resources</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
