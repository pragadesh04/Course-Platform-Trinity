import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import Image from '../components/UI/Image';
import PaymentModal from '../components/UI/PaymentModal';
import { API_BASE_URL } from '../config';
import './Cart.css';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    loadCart();
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  };

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity = (newCart[index].quantity || 1) + delta;
    if (newCart[index].quantity < 1) {
      newCart.splice(index, 1);
    }
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setApplyingCoupon(true);
    setCouponError('');
    
    try {
      const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setCouponDiscount(data.discount);
      } else {
        setCouponError(data.detail || 'Invalid coupon code');
      }
    } catch (error) {
      setCouponError('Failed to apply coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const discount = couponDiscount?.type === 'percentage' 
    ? (subtotal * (couponDiscount?.value || 0)) / 100 
    : (couponDiscount?.value || 0);
  const total = Math.max(0, subtotal - discount);

  const handleCheckout = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cartUpdated'));
    navigate('/orders');
  };

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <ShoppingBag size={64} />
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything to your cart yet.</p>
        <Link to="/products" className="btn btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Continue Shopping
        </button>

        <h1>Shopping Cart ({cart.length} items)</h1>

        <div className="cart-grid">
          <div className="cart-items">
            {cart.map((item, index) => (
              <div key={`${item.item_id}-${index}`} className="cart-item">
                <div className="item-image">
                  <Image 
                    src={item.thumbnail_url} 
                    alt={item.title}
                    fallback="https://placehold.co/100x100/D4AF37/1A1A1A?text=Item"
                  />
                </div>
                <div className="item-details">
                  <Link to={item.item_type === 'product' ? `/products/${item.item_id}` : `/courses/${item.item_id}`}>
                    <h3>{item.title}</h3>
                  </Link>
                  <p className="item-type">{item.item_type === 'product' ? 'Product' : 'Course'}</p>
                  <p className="item-price">₹{item.price.toLocaleString()}</p>
                </div>
                <div className="item-quantity">
                  <button onClick={() => updateQuantity(index, -1)}>
                    <Minus size={16} />
                  </button>
                  <span>{item.quantity || 1}</span>
                  <button onClick={() => updateQuantity(index, 1)}>
                    <Plus size={16} />
                  </button>
                </div>
                <div className="item-total">
                  ₹{(item.price * (item.quantity || 1)).toLocaleString()}
                </div>
                <button className="remove-btn" onClick={() => removeItem(index)}>
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString()}</span>
            </div>
            
            {discount > 0 && (
              <div className="summary-row discount">
                <span>Discount ({couponCode})</span>
                <span>-₹{discount.toLocaleString()}</span>
              </div>
            )}

            <div className="coupon-section">
              <input
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="input"
              />
              <button 
                className="btn btn-outline" 
                onClick={applyCoupon}
                disabled={applyingCoupon}
              >
                {applyingCoupon ? 'Applying...' : 'Apply'}
              </button>
            </div>
            {couponError && <p className="coupon-error">{couponError}</p>}

            <div className="summary-row total">
              <span>Total</span>
              <span>₹{total.toLocaleString()}</span>
            </div>

            <button className="btn btn-primary btn-lg checkout-btn" onClick={handleCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        items={cart.map(item => ({
          item_id: item.item_id,
          item_type: item.item_type,
          title: item.title,
          price: item.price,
        }))}
        total={total}
        couponCode={couponCode || null}
        couponDiscount={discount}
        onSuccess={handlePaymentSuccess}
        title="Complete Your Purchase"
      />
    </div>
  );
}
