import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Clock, Users, BookOpen, CheckCircle, ChevronDown, ChevronUp, ShoppingCart, Zap, Award, DollarSign, Calendar, MessageCircle } from 'lucide-react';
import { courseService, orderService, settingsService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import Image from '../components/UI/Image';
import FeedbackForm from '../components/UI/FeedbackForm';
import PaymentModal from '../components/UI/PaymentModal';
import Certificate from '../components/UI/Certificate';
import './CourseDetail.css';

function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '0 min';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs === 0) return `${mins} min`;
  if (mins === 0) return `${hrs} hr`;
  return `${hrs} hr ${mins} min`;
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [ordering, setOrdering] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [courseProgress, setCourseProgress] = useState([]);
  const [stats, setStats] = useState({ students: 0, courses: 0, experience_years: 10 });
  const [showCertificate, setShowCertificate] = useState(false);
  const [expandedSession, setExpandedSession] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    fetchCourse();
    fetchStats();
    fetchSettings();
    if (user) fetchEnrolledCourses();
  }, [id, user]);

  const fetchSettings = async () => {
    try {
      const data = await settingsService.getContact();
      if (data && data.whatsapp) {
        setWhatsappNumber(data.whatsapp.replace(/\D/g, ''));
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await settingsService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const isEnrolled = enrolledCourses.includes(id);

  useEffect(() => {
    if (isEnrolled && user) {
      fetchCourseProgress();
    }
  }, [isEnrolled, user]);

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
        .filter((o) => o.status === 'completed')
        .flatMap((o) => o.items)
        .filter((item) => item.item_type === 'course')
        .map((item) => item.item_id);
      setEnrolledCourses(enrolled);
    } catch (error) {
      console.error('Failed to fetch enrolled courses:', error);
    }
  };

  const fetchCourseProgress = async () => {
    if (!user) return;
    try {
      const progress = await courseService.getProgress(id);
      setCourseProgress(progress || []);
    } catch (error) {
      console.error('Failed to fetch course progress:', error);
    }
  };

  const getOverallProgress = () => {
    if (!courseProgress.length || !course?.sessions_list?.length) return 0;
    const completedSessions = courseProgress.filter(p => p.completed).length;
    return Math.round((completedSessions / course.sessions_list.length) * 100);
  };

  const getLastWatchedIndex = () => {
    if (!courseProgress.length) return 0;
    const sorted = [...courseProgress].sort((a, b) => b.updated_at.localeCompare(a.updated_at));
    return sorted[0]?.session_idx ?? 0;
  };

  const handleEnroll = () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${id}` } });
      return;
    }
    if (!course) return;
    if (course.is_free) {
      enrollForFree();
      return;
    }
    if (!selectedPlan) {
      alert('Please select a plan');
      return;
    }
    setShowPaymentModal(true);
  };

  const enrollForFree = async () => {
    setOrdering(true);
    try {
      const token = localStorage.getItem('course_better_token');
      
      const res = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({
          items: [{
            item_id: id,
            item_type: 'course',
            title: course.title,
            price: 0,
            plan: 'lifetime',
          }],
        }),
      });
      
      if (res.ok) {
        fetchEnrolledCourses();
        navigate(`/course/${id}/play/0`);
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData?.detail || JSON.stringify(errData) || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Failed to enroll:', error);
      alert('Failed to enroll: ' + (error?.message || error?.toString() || 'Unknown error'));
    } finally {
      setOrdering(false);
    }
  };

  const handleWatchFree = (sessionIndex) => {
    navigate(`/course/${id}/play/${sessionIndex}`);
  };

  const handlePaymentSuccess = () => {
    fetchEnrolledCourses();
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return 'Free';
    if (price === 0) return 'Free';
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
      <div 
        className="course-hero"
        style={course.thumbnail_url ? { backgroundImage: `url(${course.thumbnail_url})` } : {}}
      >
        <div className="course-hero-overlay" />
        <div className="container">
          <div className="course-hero-content">
            <div className="course-hero-info">
              <span className="course-category">{course.category_name}</span>
              <h1>{course.title}</h1>
              
              <div className="course-meta">
                <span><Play size={16} /> {course.sessions || 0} Sessions</span>
                <span><Clock size={16} /> {formatDuration(course.duration)} total</span>
                {isEnrolled && (
                  <>
                    <span className="progress-badge">
                      {getOverallProgress()}% Complete
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="course-content-grid">
          <div className="course-main">
            <div className="detail-tabs">
              <button 
                className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Course Details
              </button>
            </div>

            <div className="tab-content">
              {activeTab === 'description' ? (
                <section className="course-section">
                  <p className="course-description-full">{course.description}</p>
                </section>
              ) : (
                <>
                  {course.what_you_will_learn?.length > 0 && (
                    <section className="course-section">
                      <h2><Award size={20} /> What You'll Learn</h2>
                      <ul className="what-you-will-learn-list">
                        {course.what_you_will_learn.map((item, index) => (
                          <li key={index}>
                            <CheckCircle size={18} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {course.prerequisites?.length > 0 && (
                    <section className="course-section">
                      <h2><DollarSign size={20} /> Prerequisites</h2>
                      <ul className="prerequisites-list">
                        {course.prerequisites.map((item, index) => (
                          <li key={index}>
                            <CheckCircle size={18} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </>
              )}
            </div>

            {course.instructor_info?.name && (
              <section className="course-section">
                <h2><Users size={20} /> Meet Your Instructor</h2>
                <div className="instructor-card">
                  {course.instructor_info.photo_url ? (
                    <img 
                      src={course.instructor_info.photo_url} 
                      alt={course.instructor_info.name}
                      className="instructor-photo"
                    />
                  ) : (
                    <div className="instructor-photo-placeholder">
                      <Users size={40} />
                    </div>
                  )}
                  <div className="instructor-details">
                    <h3>{course.instructor_info.name}</h3>
                    <p className="instructor-bio">{course.instructor_info.bio}</p>
                    {Object.keys(course.instructor_info.social_links || {}).length > 0 && (
                      <div className="instructor-social-links">
                        {course.instructor_info.social_links.instagram && (
                          <a href={course.instructor_info.social_links.instagram} target="_blank" rel="noopener noreferrer">
                            <Users size={20} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            )}

            <section className="course-section">
              <h2><BookOpen size={20} /> Course Sessions ({course.sessions_list?.length || 0})</h2>
              <div className="sessions-list">
                {course.sessions_list?.map((session, index) => {
                  const canAccess = isEnrolled || session.is_free;
                  const progressEntry = courseProgress.find(p => p.session_idx === index);
                  const isCompleted = progressEntry?.completed;
                  const isExpanded = expandedSession === index;
                  return (
                    <div key={index} className={`session-item ${isCompleted ? 'completed' : ''} ${isExpanded ? 'expanded' : ''}`}>
                      <button 
                        className="session-header"
                        onClick={() => setExpandedSession(isExpanded ? null : index)}
                      >
                        <span className="session-number">{isCompleted ? <CheckCircle size={14} /> : index + 1}</span>
                        <span className="session-title">{session.title}</span>
                        <span className="session-duration">{formatDuration(session.duration)}</span>
                      </button>
                      {isExpanded && (
                        <div className="session-content">
                          <p>{session.description}</p>
                          {session.is_free ? (
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleWatchFree(index)}
                            >
                              <Play size={16} /> Watch Preview
                            </button>
                          ) : canAccess ? (
                            <button 
                              className="btn btn-primary btn-sm"
                              onClick={() => handleWatchFree(index)}
                            >
                              <Play size={16} /> Watch Video
                            </button>
                          ) : (
                            <div className="session-locked">
                              <p>Enroll to access this video</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {isEnrolled && (
                <div className="enrolled-cta-buttons">
                  <button
                    onClick={() => navigate(`/course/${id}/play/${getLastWatchedIndex()}`)}
                    className="btn btn-primary btn-lg start-learning-btn"
                  >
                    <Zap size={18} />
                    {getLastWatchedIndex() > 0 ? 'Resume Learning' : 'Start Learning'}
                  </button>
                  {getOverallProgress() === 100 && (
                    <button
                      onClick={() => setShowCertificate(true)}
                      className="btn btn-primary btn-lg certificate-btn"
                    >
                      <Award size={18} />
                      Download Certificate
                    </button>
                  )}
                </div>
              )}
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
              ) : course.is_free ? (
                <div className="free-enrollment">
                  <p className="free-label">Free Course</p>
                  <button
                    onClick={handleEnroll}
                    disabled={ordering}
                    className="btn btn-primary btn-lg"
                  >
                    <Zap size={18} />
                    {ordering ? 'Enrolling...' : 'Enroll for Free'}
                  </button>
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
                    className="btn btn-primary btn-lg"
                  >
                    <ShoppingCart size={18} />
                    Enroll Now
                  </button>

                  <a 
                    href={`https://wa.me/${whatsappNumber || '91XXXXXXXXXX'}?text=${encodeURIComponent(`I would like to know more about ${course.title}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="whatsapp-btn-full"
                  >
                    <MessageCircle size={20} />
                    Contact on WhatsApp
                  </a>
                </>
              )}
            </div>

            <div className="course-info-card">
              <h4>This course includes:</h4>
              <ul>
                <li><Play size={16} /> {course.sessions || 0} video sessions</li>
                <li><Clock size={16} /> {formatDuration(course.duration)} total</li>
                <li><Users size={16} /> Access on mobile and desktop</li>
                <li><BookOpen size={16} /> Downloadable resources</li>
              </ul>
            </div>

            <div className="course-info-card">
              <h4>Course Stats</h4>
              <div className="dynamic-stats">
                <span><Users size={16} /> {stats.students_display || '0'} students</span>
                <span><BookOpen size={16} /> {stats.experience_years}+ years</span>
                <span><Calendar size={16} /> Updated recently</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          items={[{
            item_id: id,
            item_type: 'course',
            title: course.title,
            price: course.prices[selectedPlan],
            plan: selectedPlan === 'm3' ? '3m' : selectedPlan === 'm6' ? '6m' : 'lifetime',
          }]}
          total={course.prices[selectedPlan]}
          onSuccess={handlePaymentSuccess}
          title="Enroll in Course"
        />
      )}

      {showCertificate && user && (
        <Certificate
          userName={user.name}
          courseName={course.title}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
}
