import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Check, Tag, ArrowLeft, MessageCircle } from 'lucide-react';
import { productService, settingsService } from '../services/api';
import Image from '../components/UI/Image';
import Carousel from '../components/UI/Carousel';
import PaymentModal from '../components/UI/PaymentModal';
import './ProductDetail.css';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [whatsappNumber, setWhatsappNumber] = useState('');

    useEffect(() => {
        fetchProduct();
        fetchSettings();
    }, [id]);

    const fetchSettings = async () => {
        try {
            const data = await settingsService.getContact();
            if (data && data.whatsapp) {
                setWhatsappNumber(data.whatsapp.replace(/\D/g, ''));
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        }
    };

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
                            <Carousel autoPlay={false} aspectRatio="4/5">
                                <Image
                                    src={product.thumbnail_url}
                                    alt={product.title}
                                    fallback="https://placehold.co/600x600/D4AF37/1A1A1A?text=Product"
                                />
                                {product.images?.map((img, idx) => (
                                    <Image
                                        key={idx}
                                        src={img}
                                        alt={`${product.title} - ${idx + 1}`}
                                        fallback="https://placehold.co/600x600/D4AF37/1A1A1A?text=Product"
                                    />
                                ))}
                            </Carousel>
                        </div>
                    </div>

                    <div className="product-info">
                        <span className="product-category">Product</span>
                        <h1>{product.title}</h1>
                        <div className="product-price-section">
                            <span className="product-price">₹{product.price?.toLocaleString()}</span>
                        </div>

                        <div className="detail-tabs">
                            <button 
                                className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                                onClick={() => setActiveTab('description')}
                            >
                                Description
                            </button>
                            <button 
                                className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                                onClick={() => setActiveTab('details')}
                            >
                                More Details
                            </button>
                        </div>

                        <div className="tab-content">
                            {activeTab === 'description' ? (
                                <p className="product-description">{product.description}</p>
                            ) : (
                                <div className="product-features">
                                    {product.key_features && product.key_features.length > 0 ? (
                                        <ul>
                                            {product.key_features.map((feature, index) => (
                                                <li key={index}>
                                                    <Check size={16} />
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="no-features">No additional details available.</p>
                                    )}
                                </div>
                            )}
                        </div>

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
                            <a 
                                href={`https://wa.me/${whatsappNumber || '91XXXXXXXXXX'}?text=${encodeURIComponent(`I would like to know more about ${product.title}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="whatsapp-btn"
                                title="Contact on WhatsApp"
                            >
                                <MessageCircle size={24} />
                            </a>
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
