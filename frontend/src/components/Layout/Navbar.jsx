import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, ShoppingBag, LogOut, LayoutDashboard, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
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
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-logo">
            <span className="logo-text">Trinity</span>
          </Link>

          <div className="navbar-links">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="navbar-actions">
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
                    <span className="btn-text">Admin</span>
                  </Link>
                )}
                <button onClick={logout} className="nav-icon-btn" title="Logout">
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-sm">
                  <span className="btn-text">Login</span>
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <span className="btn-text">Register</span>
                </Link>
              </>
            )}
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="mobile-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="drawer-header">
                <Link to="/" className="drawer-logo" onClick={() => setMobileOpen(false)}>
                  Trinity
                </Link>
                <button
                  className="drawer-close"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>
              <nav className="drawer-nav">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`drawer-link ${location.pathname === link.to ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="drawer-actions">
                <Link to="/cart" className="drawer-link" onClick={() => setMobileOpen(false)}>
                  <ShoppingCart size={20} />
                  Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
                {user ? (
                  <>
                    <Link to="/orders" className="drawer-link" onClick={() => setMobileOpen(false)}>
                      <ShoppingBag size={20} /> My Orders
                    </Link>
                    <Link to="/profile" className="drawer-link" onClick={() => setMobileOpen(false)}>
                      <User size={20} /> Profile
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="drawer-link" onClick={() => setMobileOpen(false)}>
                        <LayoutDashboard size={20} /> Admin Panel
                      </Link>
                    )}
                    <button
                      className="drawer-link drawer-logout"
                      onClick={() => { logout(); setMobileOpen(false); }}
                    >
                      <LogOut size={20} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="drawer-link" onClick={() => setMobileOpen(false)}>
                      Login
                    </Link>
                    <Link to="/register" className="drawer-link drawer-register" onClick={() => setMobileOpen(false)}>
                      Register
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
