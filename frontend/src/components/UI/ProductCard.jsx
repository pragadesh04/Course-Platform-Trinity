import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingBag, Tag } from 'lucide-react';
import Image from './Image';
import './ProductCard.css';

const PRODUCT_PLACEHOLDER = 'https://placehold.co/600x400/D4AF37/1A1A1A?text=Product';

export default function ProductCard({ product }) {
  const thumbnailSrc = product.thumbnail_url || PRODUCT_PLACEHOLDER;

  return (
    <motion.div
      className="product-card"
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="product-thumbnail">
        <Image 
          src={thumbnailSrc} 
          alt={product.title}
          fallback={PRODUCT_PLACEHOLDER}
        />
        {product.featured && (
          <div className="product-badge">Featured</div>
        )}
      </div>

      <div className="product-content">
        <h3 className="product-title">{product.title}</h3>
        <p className="product-description">{product.description}</p>

        {product.key_features && product.key_features.length > 0 && (
          <ul className="product-features">
            {product.key_features.slice(0, 3).map((feature, index) => (
              <li key={index}>
                <Tag size={12} />
                {feature}
              </li>
            ))}
          </ul>
        )}

        <div className="product-footer">
          <div className="product-price">
            <span className="price-value">₹{product.price?.toLocaleString()}</span>
          </div>
          <Link to={`/products/${product.id}`} className="btn btn-secondary btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
