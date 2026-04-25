import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, ShoppingBag, BookOpen, LogOut, LayoutDashboard, ShoppingCart, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationPanel from '../UI/NotificationPanel';
import './Navbar.css';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    };
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, []);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('course_better_token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/notifications/unread-count`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/courses', label: 'Courses' },
    { to: '/products', label: 'Products' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Trinity</span>
        </Link>

        <div className="navbar-links">
<AnimatePresence>
            {navLinks.map((link, index) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  {isActive && (
                    <motion.div
                      className="nav-indicator"
                      layoutId="nav-indicator"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  {link.label}
                </Link>
              );
            })}
          </AnimatePresence>
        </div>

        <div className="navbar-actions">
          {user && (
            <button 
              className="nav-icon-btn notification-btn" 
              title="Notifications"
              onClick={() => setShowNotifications(prev => !prev)}
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
            </button>
          )}
          <Link to="/cart" className="nav-icon-btn cart-btn" title="Cart">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
          {user ? (
            <>
              <Link to="/orders" className="nav-icon-btn" title="My Orders">
                <ShoppingBag size={20} />
              </Link>
              <Link to="/profile" className="nav-icon-btn" title="Profile">
                <User size={20} />
              </Link>
              {isAdmin && (
                <Link to="/admin" className="btn btn-outline btn-sm">
                  <LayoutDashboard size={16} />
                  Admin
                </Link>
              )}
              <button onClick={logout} className="nav-icon-btn" title="Logout">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </>
          )}
        </div>

        {user && (
          <button 
            className="mobile-notification-btn"
            onClick={() => setShowNotifications(prev => !prev)}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="mobile-notification-badge">{unreadCount}</span>}
          </button>
        )}

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mobileOpen && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="mobile-nav-link"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mobile-nav-actions">
              <Link to="/cart" onClick={() => setMobileOpen(false)}>
                Cart {cartCount > 0 && `(${cartCount})`}
              </Link>
              {user ? (
                <>
                  <Link to="/orders" onClick={() => setMobileOpen(false)}>My Orders</Link>
                  <Link to="/profile" onClick={() => setMobileOpen(false)}>Profile</Link>
                  {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)}>Admin</Link>}
                  <button onClick={() => { logout(); setMobileOpen(false); }}>Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NotificationPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </nav>
  );
}
