import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Send, MessageCircle, Camera, Link } from 'lucide-react';
import { API_BASE_URL } from '../config';
import './Contact.css';

export default function Contact() {
  const [contact, setContact] = useState({
    phone: '',
    email: '',
    address: '',
    whatsapp: '',
    instagram: '',
    facebook: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContact() {
      try {
        const res = await fetch(`${API_BASE_URL}/settings/contact`);
        const data = await res.json();
        setContact(data);
      } catch (error) {
        console.error('Failed to fetch contact info:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchContact();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/contact/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to send message');

      setSent(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (error) {
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="contact-page">
      <section className="contact-hero">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="section-label">Contact Us</span>
            <h1>Get in Touch</h1>
            <p>Have questions? We'd love to hear from you.</p>
          </motion.div>
        </div>
      </section>

      <section className="contact-content section">
        <div className="container">
          <div className="contact-grid">
            <motion.div
              className="contact-info"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2>Contact Information</h2>
              <p>Fill out the form and our team will get back to you within 24 hours.</p>

              <div className="info-items">
                {contact.phone && (
                  <div className="info-item">
                    <Phone size={24} />
                    <div>
                      <span>Phone</span>
                      <p>{contact.phone}</p>
                    </div>
                  </div>
                )}
                {contact.email && (
                  <div className="info-item">
                    <Mail size={24} />
                    <div>
                      <span>Email</span>
                      <p>{contact.email}</p>
                    </div>
                  </div>
                )}
                {contact.address && (
                  <div className="info-item">
                    <MapPin size={24} />
                    <div>
                      <span>Address</span>
                      <p>{contact.address}</p>
                    </div>
                  </div>
                )}
                {contact.whatsapp && (
                  <div className="info-item">
                    <MessageCircle size={24} />
                    <div>
                      <span>WhatsApp</span>
                      <p>{contact.whatsapp}</p>
                    </div>
                  </div>
                )}
                {contact.instagram && (
                  <div className="info-item">
                    <Camera size={24} />
                    <div>
                      <span>Instagram</span>
                      <p>{contact.instagram}</p>
                    </div>
                  </div>
                )}
                {contact.facebook && (
                  <div className="info-item">
                    <Link size={24} />
                    <div>
                      <span>Facebook</span>
                      <p>{contact.facebook}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              className="contact-form-wrapper"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <form onSubmit={handleSubmit} className="contact-form">
                {sent && (
                  <div className="form-success">
                    Thank you! Your message has been sent.
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      type="text"
                      className="input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      className="input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    className="input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    className="input"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-full" disabled={sending}>
                  <Send size={18} />
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
