import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './WhatsAppButton.css';

export default function WhatsAppButton() {
  const [settings, setSettings] = useState({ whatsapp: '' });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/settings/contact`);
      const data = await res.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const whatsappNumber = settings.whatsapp || '919876543210';
  const message = encodeURIComponent('Hi! I need help with Trinity');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

  if (!visible) return null;

  return (
    <div className="whatsapp-button-container">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float-btn"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle size={28} />
      </a>
      <button 
        className="whatsapp-close-btn"
        onClick={() => setVisible(false)}
        aria-label="Close WhatsApp button"
      >
        <X size={16} />
      </button>
    </div>
  );
}
