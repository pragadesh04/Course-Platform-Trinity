import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { API_BASE_URL } from '../../config';
import './ImageUploader.css';

export default function ImageUploader({ value = '', onChange, label = "Upload Image" }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(value);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setCurrentUrl(value);
  }, [value]);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Max size: 5MB');
      return;
    }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('course_better_token');
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      const uploadedUrl = data.url;
      
      setCurrentUrl(uploadedUrl);
      onChange(uploadedUrl);
    } catch (error) {
      console.error('Upload failed:', error);
      alert(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemove = () => {
    setCurrentUrl('');
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChangeClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  return (
    <div className="image-uploader">
      {label && <label className="uploader-label">{label}</label>}
      
      {currentUrl ? (
        <div className="image-preview">
          <img src={currentUrl} alt="Preview" />
          <div className="preview-overlay">
            <button type="button" className="btn-change" onClick={handleChangeClick}>
              Change
            </button>
            <button type="button" className="btn-remove" onClick={handleRemove}>
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`upload-area ${dragOver ? 'drag-over' : ''} ${uploading ? 'uploading' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
            style={{ display: 'none' }}
          />
          
          {uploading ? (
            <div className="upload-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span>Uploading...</span>
            </div>
          ) : (
            <>
              <Upload size={32} className="upload-icon" />
              <p>Drag & drop or click to upload</p>
              <span className="upload-hint">JPG, PNG, WebP up to 5MB</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
