import { api } from './api';
import { RAZORPAY_KEY_ID } from '../config';

export const paymentService = {
  createOrder: async (items, couponCode = null, couponDiscount = null) => {
    const data = {
      items,
      ...(couponCode && { coupon_code: couponCode }),
      ...(couponDiscount && { coupon_discount: couponDiscount }),
    };
    return api.post('/payments/create', data);
  },

  verifyPayment: async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    const data = {
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
    };
    return api.post('/payments/verify', data);
  },

  loadRazorpayScript: () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load payment gateway'));
      document.head.appendChild(script);
    });
  },

  openCheckout: async (options) => {
    await paymentService.loadRazorpayScript();
    
    return new Promise((resolve, reject) => {
      try {
        const razorpayKey = options.key || RAZORPAY_KEY_ID;
        
        if (!razorpayKey || razorpayKey === 'rzp_test_xxxxxx') {
          reject(new Error('Payment gateway not configured. Please add your Razorpay key.'));
          return;
        }

        const rzp = new window.Razorpay({
          key: razorpayKey,
          amount: options.amount,
          currency: options.currency || 'INR',
          name: options.name || 'Trinity',
          description: options.description || 'Course Purchase',
          order_id: options.order_id,
          handler: (response) => {
            resolve({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
          },
          prefill: {
            name: options.customerName || '',
            email: options.customerEmail || '',
            contact: options.customerPhone || '',
          },
          notes: options.notes || {},
          theme: {
            color: '#D4AF37',
          },
        });

        rzp.on('payment.failed', (response) => {
          reject(new Error(response.error.description || 'Payment failed'));
        });

        try {
          rzp.open();
        } catch (openError) {
          if (openError.message?.includes('disconnected port')) {
            reject(new Error('Payment window was blocked. Please disable ad blockers and try again.'));
          } else {
            reject(openError);
          }
        }
      } catch (err) {
        reject(err);
      }
    });
  },
};
