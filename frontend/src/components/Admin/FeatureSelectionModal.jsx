import { useState } from 'react';
import { X, Check, Sparkles, Loader2 } from 'lucide-react';
import './FeatureSelectionModal.css';

export default function FeatureSelectionModal({ isOpen, onClose, features, onConfirm, isLoading }) {
    const [selectedFeatures, setSelectedFeatures] = useState([]);

    if (!isOpen) return null;

    const toggleFeature = (feature) => {
        if (selectedFeatures.includes(feature)) {
            setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
        } else {
            setSelectedFeatures([...selectedFeatures, feature]);
        }
    };

    const handleSelectAll = () => {
        if (selectedFeatures.length === features.length) {
            setSelectedFeatures([]);
        } else {
            setSelectedFeatures([...features]);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content selection-modal">
                <div className="modal-header">
                    <h2>
                        <Sparkles size={20} className="ai-icon" />
                        AI Feature Suggestions
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {isLoading ? (
                        <div className="ai-loading">
                            <Loader2 size={40} className="spinner" />
                            <p>Mistral is brainstorming features...</p>
                        </div>
                    ) : (
                        <>
                            <p className="selection-hint">Select the features you want to add to your product:</p>
                            <div className="selection-actions">
                                <button className="btn-text" onClick={handleSelectAll}>
                                    {selectedFeatures.length === features.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                            <div className="features-checklist">
                                {features.map((feature, index) => (
                                    <label key={index} className={`feature-item ${selectedFeatures.includes(feature) ? 'active' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={selectedFeatures.includes(feature)}
                                            onChange={() => toggleFeature(feature)}
                                        />
                                        <div className="checkbox-custom">
                                            {selectedFeatures.includes(feature) && <Check size={14} />}
                                        </div>
                                        <span className="feature-text">{feature}</span>
                                    </label>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    <button 
                        className="btn btn-primary" 
                        onClick={() => onConfirm(selectedFeatures)}
                        disabled={selectedFeatures.length === 0 || isLoading}
                    >
                        Add Selected Features ({selectedFeatures.length})
                    </button>
                </div>
            </div>
        </div>
    );
}
