import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Image from './Image';
import './ProductCard.css';

const PRODUCT_PLACEHOLDER = 'https://placehold.co/600x400/D4AF37/1A1A1A?text=Product';

export default function ProductCard({ product }) {
    const thumbnailSrc = product.thumbnail_url || PRODUCT_PLACEHOLDER;

    return (
        <Link to={`/products/${product.id}`} className="product-card-link">
            <motion.div
                className="product-card"
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
            >
                <div className="product-thumbnail-container">
                    <div className="thumbnail-blur-bg" style={{ backgroundImage: `url(${thumbnailSrc})` }} />
                    <Image
                        src={thumbnailSrc}
                        alt={product.title}
                        className="thumbnail-main-img"
                        fallback={PRODUCT_PLACEHOLDER}
                    />
                    {product.featured && (
                        <div className="product-badge">Featured</div>
                    )}
                </div>

                <div className="product-content">
                    <h3 className="product-title">{product.title}</h3>
                    <p className="product-description">{product.description}</p>

                    <div className="product-footer">
                        <div className="product-price">
                            <span className="price-value">₹{product.price?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}