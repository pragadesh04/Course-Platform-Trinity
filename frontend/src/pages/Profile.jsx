import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile_number: user?.mobile_number || '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const response = await authService.register({
        name: formData.name,
        mobile_number: formData.mobile_number,
        password: 'unchanged',
      });
      localStorage.setItem('course_better_user', JSON.stringify(response.user));
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <motion.div
        className="profile-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={48} />
          </div>
          <h1>My Profile</h1>
          <p>Manage your account information</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          {message && (
            <div className={`profile-message ${message.includes('success') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="form-group">
            <label>Full Name</label>
            <div className="input-icon">
              <User size={18} />
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mobile Number</label>
            <div className="input-icon">
              <Phone size={18} />
              <input
                type="tel"
                className="input"
                value={formData.mobile_number}
                onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Account Type</label>
            <div className="account-type">
              <span className={`type-badge ${user.role}`}>{user.role}</span>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            <Save size={18} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
