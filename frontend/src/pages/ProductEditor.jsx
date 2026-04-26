import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Plus, Image, Sparkles, Loader2 } from 'lucide-react';
import { productService, categoryService } from '../services/api';
import ImageUploader from '../components/UI/ImageUploader';
import './ProductEditor.css';

export default function ProductEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const [loading, setLoading] = useState(isEditing);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [aiLoadingTitle, setAiLoadingTitle] = useState(false);
    const [aiLoadingDescription, setAiLoadingDescription] = useState(false);
    const [aiLoadingFeatures, setAiLoadingFeatures] = useState(false);
    const [aiLoadingTags, setAiLoadingTags] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: 0,
        thumbnail_url: '',
        images: [],
        key_features: '',
        tags: '',
        featured: false,
        category_ids: [],
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const cats = await categoryService.getAll('product');
                setCategories(cats);

                if (id) {
                    const product = await productService.getById(id);
                    setFormData({
                        title: product.title || '',
                        description: product.description || '',
                        price: product.price || 0,
                        thumbnail_url: product.thumbnail_url || '',
                        images: product.images || [],
                        key_features: product.key_features?.join('\n') || '',
                        tags: product.tags?.join(', ') || '',
                        featured: product.featured || false,
                        category_ids: product.category_ids || [],
                    });
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const productData = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price) || 0,
                thumbnail_url: formData.thumbnail_url,
                images: formData.images.filter(img => img.trim()),
                key_features: formData.key_features.split('\n').filter(f => f.trim()),
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
                featured: formData.featured,
                category_ids: formData.category_ids,
            };

            if (isEditing) {
                await productService.update(id, productData);
            } else {
                await productService.create(productData);
            }
            navigate('/admin?tab=products');
        } catch (error) {
            console.error('Failed to save product:', error);
            alert('Failed to save product. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddImage = () => {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, '']
        }));
    };

    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handleImageChange = (index, url) => {
        const newImages = [...formData.images];
        newImages[index] = url;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const handleGenerateTitle = async () => {
        if (!formData.title) {
            alert('Please enter a product title first.');
            return;
        }
        setAiLoadingTitle(true);
        try {
            const data = await productService.generateTitle(formData.title);
            setFormData(prev => ({ ...prev, title: data.title }));
        } catch (error) {
            console.error('AI Title failed:', error);
            alert('Failed to enhance title.');
        } finally {
            setAiLoadingTitle(false);
        }
    };

    const handleGenerateDescription = async () => {
        if (!formData.title) {
            alert('Please enter a product title first.');
            return;
        }
        setAiLoadingDescription(true);
        try {
            const data = await productService.generateDescription(formData.title);
            setFormData(prev => ({ ...prev, description: data.description }));
        } catch (error) {
            console.error('AI Description failed:', error);
            alert('Failed to generate description.');
        } finally {
            setAiLoadingDescription(false);
        }
    };

    const handleGenerateFeatures = async () => {
        if (!formData.title || !formData.description) {
            alert('Please enter a title and description first.');
            return;
        }
        setAiLoadingFeatures(true);
        try {
            const data = await productService.generateFeatures(formData.title, formData.description);
            const currentFeatures = formData.key_features.split('\n').filter(f => f.trim());
            const combined = [...new Set([...currentFeatures, ...data.features])];
            setFormData(prev => ({ ...prev, key_features: combined.join('\n') }));
        } catch (error) {
            console.error('AI Features failed:', error);
            alert('Failed to generate features.');
        } finally {
            setAiLoadingFeatures(false);
        }
    };

    const handleGenerateTags = async () => {
        if (!formData.title || !formData.description) {
            alert('Please enter a title and description first.');
            return;
        }
        setAiLoadingTags(true);
        try {
            const data = await productService.generateTags(formData.title, formData.description);
            const currentTags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
            const combined = [...new Set([...currentTags, ...data.tags])];
            setFormData(prev => ({ ...prev, tags: combined.join(', ') }));
        } catch (error) {
            console.error('AI Tags failed:', error);
            alert('Failed to generate tags.');
        } finally {
            setAiLoadingTags(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await productService.delete(id);
            navigate('/admin?tab=products');
        } catch (error) {
            console.error('Failed to delete product:', error);
            alert('Failed to delete product.');
        }
    };

    if (loading) {
        return (
            <div className="product-editor loading">
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div className="product-editor">
            <div className="editor-header">
                <button className="btn btn-secondary" onClick={() => navigate('/admin?tab=products')}>
                    <ArrowLeft size={18} />
                    Back to Products
                </button>
                <h1>{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
                <div className="header-actions">
                    {isEditing && (
                        <button className="btn btn-danger" onClick={handleDelete}>
                            <Trash2 size={18} />
                            Delete
                        </button>
                    )}
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="editor-form">
                <div className="form-section">
                    <h2>Basic Information</h2>
                    <div className="form-group">
                        <div className="label-with-ai">
                            <label>Product Title *</label>
                            <button
                                type="button"
                                className="btn-ai-assist"
                                onClick={handleGenerateTitle}
                                disabled={aiLoadingTitle}
                            >
                                {aiLoadingTitle ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                                Enhance Title
                            </button>
                        </div>
                        <input
                            type="text"
                            className="input"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <div className="label-with-ai">
                            <label>Description</label>
                            <button
                                type="button"
                                className="btn-ai-assist"
                                onClick={handleGenerateDescription}
                                disabled={aiLoadingDescription}
                            >
                                {aiLoadingDescription ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                                Generate with AI
                            </button>
                        </div>
                        <textarea
                            className="input"
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Price (₹) *</label>
                            <input
                                type="number"
                                className="input"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                required
                                min="0"
                                step="0.01"
                            />
                        </div>
                        <div className="form-group">
                            <label>Thumbnail Image</label>
                            <ImageUploader
                                value={formData.thumbnail_url}
                                onChange={(url) => setFormData({ ...formData, thumbnail_url: url })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label><Image size={18} /> Gallery Images (for carousel)</label>
                        <p className="form-hint">Add additional images to show in the product carousel</p>
                        <div className="gallery-images">
                            {formData.images.map((img, index) => (
                                <div key={index} className="gallery-image-item">
                                    <ImageUploader
                                        value={img}
                                        onChange={(url) => handleImageChange(index, url)}
                                    />
                                    <button
                                        type="button"
                                        className="btn-remove"
                                        onClick={() => handleRemoveImage(index)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleAddImage}
                            >
                                <Plus size={16} /> Add Image
                            </button>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Features & Tags</h2>
                    <div className="form-group">
                        <div className="label-with-ai">
                            <label>Key Features (one per line)</label>
                            <button
                                type="button"
                                className="btn-ai-assist"
                                onClick={handleGenerateFeatures}
                                disabled={aiLoadingFeatures}
                            >
                                {aiLoadingFeatures ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                                Suggest Features
                            </button>
                        </div>
                        <textarea
                            className="input"
                            rows={6}
                            placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                            value={formData.key_features}
                            onChange={(e) => setFormData({ ...formData, key_features: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <div className="label-with-ai">
                            <label>Tags (comma separated)</label>
                            <button
                                type="button"
                                className="btn-ai-assist"
                                onClick={handleGenerateTags}
                                disabled={aiLoadingTags}
                            >
                                {aiLoadingTags ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
                                Generate Tags
                            </button>
                        </div>
                        <input
                            type="text"
                            className="input"
                            placeholder="tools, fabric, scissors"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-section">
                    <h2>Categories</h2>
                    <div className="category-chips">
                        {categories.map(cat => (
                            <label key={cat.id} className={`category-chip ${formData.category_ids.includes(cat.id) ? 'selected' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={formData.category_ids.includes(cat.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setFormData({ ...formData, category_ids: [...formData.category_ids, cat.id] });
                                        } else {
                                            setFormData({ ...formData, category_ids: formData.category_ids.filter(cId => cId !== cat.id) });
                                        }
                                    }}
                                />
                                {cat.name}
                            </label>
                        ))}
                    </div>
                </div>

                <div className="form-section">
                    <h2>Settings</h2>
                    <div className="form-group checkbox">
                        <label>
                            <input
                                type="checkbox"
                                checked={formData.featured}
                                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                            />
                            Featured Product
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin?tab=products')}>
                        Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </form>
        </div>
    );
}