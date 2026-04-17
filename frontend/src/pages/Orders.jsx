import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, BookOpen, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderService, courseService } from '../services/api';
import './Orders.css';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const ordersData = await orderService.getMyOrders();
      setOrders(ordersData);
      
      const courseIds = [];
      ordersData.forEach(order => {
        if (order.status === 'completed') {
          order.items.forEach(item => {
            if (item.item_type === 'course' && !courseIds.includes(item.item_id)) {
              courseIds.push(item.item_id);
            }
          });
        }
      });
      
      const courses = await Promise.all(
        courseIds.map(id => courseService.getById(id).catch(() => null))
      );
      setEnrolledCourses(courses.filter(Boolean));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div className="container">
          <h1>My Dashboard</h1>
          <p>Welcome back, {user.name}!</p>
        </div>
      </div>

      <div className="container">
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            <BookOpen size={18} /> My Courses
          </button>
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={18} /> Order History
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading...</div>
        ) : activeTab === 'courses' ? (
          <div className="enrolled-courses">
            {enrolledCourses.length > 0 ? (
              <div className="courses-grid">
                {enrolledCourses.map((course, index) => (
                  <motion.div
                    key={course.id}
                    className="enrolled-course-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="course-thumbnail">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} />
                      ) : (
                        <div className="placeholder">
                          <Play size={40} />
                        </div>
                      )}
                      <div className="course-sessions-badge">
                        {course.sessions || 0} Sessions
                      </div>
                    </div>
                    <div className="course-info">
                      <h3>{course.title}</h3>
                      <p>{course.description?.substring(0, 100)}...</p>
                      <Link to={`/courses/${course.id}`} className="btn btn-primary">
                        <Play size={16} /> Continue Learning
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <BookOpen size={64} />
                <h2>No Courses Yet</h2>
                <p>Enroll in courses to start learning</p>
                <Link to="/courses" className="btn btn-primary">
                  Browse Courses
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="orders-list">
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  className="order-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="order-header">
                    <div className="order-id">
                      <ShoppingBag size={20} />
                      Order #{order.id.slice(-8)}
                    </div>
                    <span className={`order-status ${order.status}`}>{order.status}</span>
                  </div>

                  <div className="order-items">
                    {order.items.map((item, i) => (
                      <div key={i} className="order-item">
                        <span className="item-type">{item.item_type}</span>
                        <span className="item-title">
                          {item.item_type === 'course' ? (
                            <Link to={`/courses/${item.item_id}`}>{item.title}</Link>
                          ) : item.title}
                        </span>
                        {item.plan && <span className="item-plan">{item.plan}</span>}
                        <span className="item-price">₹{item.price}</span>
                      </div>
                    ))}
                  </div>

                  <div className="order-footer">
                    <div className="order-meta">
                      <span>
                        <Clock size={14} />
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                      {order.razorpay_payment_id && (
                        <span className="payment-id">Razorpay: {order.razorpay_payment_id.slice(-6)}</span>
                      )}
                    </div>
                    <div className="order-total">
                      Total: <strong>₹{order.total}</strong>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="empty-state">
                <ShoppingBag size={64} />
                <h2>No Orders Yet</h2>
                <p>Start shopping to see your orders here</p>
                <Link to="/products" className="btn btn-primary">
                  Browse Products
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
