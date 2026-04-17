import { useState } from 'react';
import { CheckCircle, XCircle, Loader, CreditCard } from 'lucide-react';
import Modal from './Modal';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import './Modal.css';
import './PaymentModal.css';

export default function PaymentModal({
  isOpen,
  onClose,
  items,
  total,
  couponCode = null,
  couponDiscount = null,
  onSuccess,
  title = 'Complete Payment',
}) {
  const { user } = useAuth();
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setStatus('loading');
    setError(null);

    try {
      const orderData = await paymentService.createOrder(items, couponCode, couponDiscount);

      const paymentResponse = await paymentService.openCheckout({
        key: orderData.key,
        amount: orderData.amount * 100,
        currency: orderData.currency,
        order_id: orderData.razorpay_order_id,
        name: 'Trinity',
        description: items.map(i => i.title).join(', '),
        customerName: user?.name || '',
        customerEmail: user?.email || '',
        customerPhone: user?.phone || '',
      });

      const verification = await paymentService.verifyPayment(
        paymentResponse.razorpay_order_id,
        paymentResponse.razorpay_payment_id,
        paymentResponse.razorpay_signature
      );

      setStatus('success');
      if (onSuccess) {
        setTimeout(() => {
          onSuccess(verification);
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Payment failed');
      setStatus('error');
    }
  };

  const handleRetry = () => {
    setStatus('idle');
    setError(null);
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="payment-status">
            <Loader className="spinner" size={48} />
            <p>Processing payment...</p>
          </div>
        );

      case 'success':
        return (
          <div className="payment-status payment-success">
            <CheckCircle size={64} color="#22c55e" />
            <h3>Payment Successful!</h3>
            <p>Your order has been confirmed.</p>
          </div>
        );

      case 'error':
        return (
          <div className="payment-status payment-error">
            <XCircle size={64} color="#ef4444" />
            <h3>Payment Failed</h3>
            <p>{error}</p>
            <div className="payment-actions">
              <button className="btn btn-outline" onClick={onClose}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleRetry}>
                Try Again
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="payment-summary">
            <div className="payment-items">
              <h4>Order Summary</h4>
              {items.map((item, index) => (
                <div key={index} className="payment-item">
                  <span>{item.title}</span>
                  <span>₹{item.price.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {couponDiscount > 0 && (
              <div className="payment-discount">
                <span>Coupon Discount</span>
                <span>-₹{couponDiscount.toLocaleString()}</span>
              </div>
            )}

            <div className="payment-total">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>

            <button className="btn btn-primary btn-lg payment-btn" onClick={handlePayment}>
              <CreditCard size={18} />
              Pay ₹{total.toLocaleString()}
            </button>

            <p className="payment-note">
              You will be redirected to Razorpay's secure payment page
            </p>
          </div>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {renderContent()}
    </Modal>
  );
}
