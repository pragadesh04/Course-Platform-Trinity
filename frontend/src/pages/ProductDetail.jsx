import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Check, Tag, ArrowLeft } from 'lucide-react';
import { productService } from '../services/api';
import Image from '../components/UI/Image';
import PaymentModal from '../components/UI/PaymentModal';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const data = await productService.getById(id);
      setProduct(data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = () => {
    navigate('/orders');
  };

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingIndex = cart.findIndex(item => item.item_id === product.id);
    
    if (existingIndex >= 0) {
      alert('Product already in cart');
      return;
    }
    
    cart.push({
      item_id: product.id,
      item_type: 'product',
      title: product.title,
      price: product.price,
      thumbnail_url: product.thumbnail_url,
    });
    
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
    window.dispatchEvent(new Event('cartUpdated'));
  };

  if (loading) {
    return (
      <div className="product-detail-loading">
        <div className="spinner" />
        <p>Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-error">
        <h2>Product not found</h2>
        <Link to="/products" className="btn btn-primary">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="container">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} /> Back to Products
        </button>

        <div className="product-detail-grid">
          <div className="product-gallery">
            <div className="product-main-image">
              <Image 
                src={product.thumbnail_url} 
                alt={product.title}
                fallback="https://placehold.co/600x600/D4AF37/1A1A1A?text=Product"
              />
            </div>
          </div>

          <div className="product-info">
            <span className="product-category">Product</span>
            <h1>{product.title}</h1>
            <p className="product-description">{product.description}</p>

            <div className="product-price-section">
              <span className="product-price">₹{product.price?.toLocaleString()}</span>
            </div>

            {product.key_features && product.key_features.length > 0 && (
              <div className="product-features">
                <h3><Check size={20} /> Key Features</h3>
                <ul>
                  {product.key_features.map((feature, index) => (
                    <li key={index}>
                      <Check size={16} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.tags && product.tags.length > 0 && (
              <div className="product-tags">
                <Tag size={16} />
                {product.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            )}

            <div className="product-actions">
              <button 
                className="btn btn-primary btn-lg"
                onClick={handleBuyNow}
              >
                <ShoppingBag size={18} />
                Buy Now
              </button>
              <button 
                className="btn btn-outline btn-lg"
                onClick={handleAddToCart}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        items={[{
          item_id: product.id,
          item_type: 'product',
          title: product.title,
          price: product.price,
        }]}
        total={product.price}
        onSuccess={handlePaymentSuccess}
        title="Complete Your Purchase"
      />
    </div>
  );
}
