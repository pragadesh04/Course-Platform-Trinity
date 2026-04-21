import { Edit2, Trash2 } from 'lucide-react';
import './AdminCard.css';

export default function AdminCard({ 
  image, 
  title, 
  subtitle, 
  details = [], 
  prices, 
  featured, 
  onEdit, 
  onDelete,
  type = 'default'
}) {
  return (
    <div className={`admin-card admin-card-${type}`}>
      <div className="admin-card-header">
        {image && (
          <div className="admin-card-image">
            <img src={image} alt={title} />
          </div>
        )}
        <div className="admin-card-title-group">
          <h3 className="admin-card-title">{title}</h3>
          {subtitle && <span className="admin-card-subtitle">{subtitle}</span>}
        </div>
      </div>

      {details.length > 0 && (
        <div className="admin-card-details">
          {details.map((detail, index) => (
            <div key={index} className="admin-card-detail">
              <span className="detail-label">{detail.label}</span>
              <span className="detail-value">{detail.value}</span>
            </div>
          ))}
        </div>
      )}

      {prices && (
        <div className="admin-card-prices">
          {prices.map((price, index) => (
            <div key={index} className="price-item">
              <span className="price-label">{price.label}</span>
              <span className="price-value">{price.value}</span>
            </div>
          ))}
        </div>
      )}

      {featured !== undefined && (
        <div className="admin-card-featured">
          <span className="featured-badge">{featured ? 'Featured' : 'Not Featured'}</span>
        </div>
      )}

      <div className="admin-card-actions">
        <button className="admin-card-btn edit" onClick={onEdit}>
          <Edit2 size={18} />
          <span>Edit</span>
        </button>
        <button className="admin-card-btn delete" onClick={onDelete}>
          <Trash2 size={18} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}