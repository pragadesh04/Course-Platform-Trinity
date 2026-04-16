import { Link } from 'react-router-dom';
import { Heart, Phone, Mail } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import { useState, useEffect } from 'react';
import './Footer.css';

export default function Footer() {
  const [contact, setContact] = useState({ phone: '', email: '' });

  useEffect(() => {
    async function fetchContact() {
      try {
        const res = await fetch(`${API_BASE_URL}/settings/contact`);
        const data = await res.json();
        setContact({
          phone: data.phone || '',
          email: data.email || ''
        });
      } catch (error) {
        console.error('Failed to fetch contact:', error);
      }
    }
    fetchContact();
  }, []);

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <span className="logo-text">Course</span>
              <span className="logo-accent">Better</span>
            </Link>
            <p className="footer-tagline">
              Master the art of tailoring with our premium courses and quality products.
            </p>
            {(contact.phone || contact.email) && (
              <div className="footer-contact">
                {contact.phone && (
                  <a href={`tel:${contact.phone}`}>
                    <Phone size={16} /> {contact.phone}
                  </a>
                )}
                {contact.email && (
                  <a href={`mailto:${contact.email}`}>
                    <Mail size={16} /> {contact.email}
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>Quick Links</h4>
              <Link to="/courses">Courses</Link>
              <Link to="/products">Products</Link>
              <Link to="/about">About Us</Link>
              <Link to="/contact">Contact</Link>
            </div>

            <div className="footer-col">
              <h4>Support</h4>
              <Link to="/faq">FAQ</Link>
              <Link to="/shipping">Shipping Info</Link>
              <Link to="/returns">Returns</Link>
              <Link to="/privacy">Privacy Policy</Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>Made with <Heart size={14} className="heart-icon" /> for tailors everywhere</p>
          <p className="copyright">&copy; {new Date().getFullYear()} Trinity. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
