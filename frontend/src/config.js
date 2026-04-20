const envApiUrl = import.meta.env.VITE_API_BASE_URL;
console.log('[Config] VITE_API_BASE_URL:', envApiUrl || '(not set)');

export const API_BASE_URL = envApiUrl || 'http://localhost:8000';

export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

export const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400/D4AF37/1A1A1A?text=Course+Better';

export const COLORS = {
  charcoal: '#1A1A1A',
  gold: '#D4AF37',
  cream: '#F5F5DC',
  creamDark: '#E8E8D0',
  white: '#FFFFFF',
};

export const FONTS = {
  heading: "'Playfair Display', Georgia, serif",
  body: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
};

export const STORAGE_KEYS = {
  TOKEN: 'course_better_token',
  USER: 'course_better_user',
};
