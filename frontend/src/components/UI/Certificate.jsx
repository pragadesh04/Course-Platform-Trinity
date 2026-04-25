import { useRef } from 'react';
import { X, Download, Award } from 'lucide-react';
import html2canvas from 'html2canvas';
import './Certificate.css';

export default function Certificate({ userName, courseName, onClose }) {
  const certificateRef = useRef(null);

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    const certificateElement = certificateRef.current;
    const originalWidth = certificateElement.style.width;
    const originalMaxWidth = certificateElement.style.maxWidth;

    certificateElement.style.width = '1200px';
    certificateElement.style.maxWidth = '1200px';

    const canvas = await html2canvas(certificateElement);
    const link = document.createElement('a');
    link.download = `Certificate - ${courseName}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    certificateElement.style.width = originalWidth;
    certificateElement.style.maxWidth = originalMaxWidth;
  };

  return (
    <div className="certificate-overlay" onClick={onClose}>
      <div className="certificate-modal" onClick={e => e.stopPropagation()}>
        <div className="certificate-header">
          <h2><Award size={24} /> Certificate of Completion</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="certificate-preview">
          <div ref={certificateRef} className="certificate">
            <div className="certificate-border">
              <div className="certificate-inner">
                <div className="certificate-corner top-left"></div>
                <div className="certificate-corner top-right"></div>
                <div className="certificate-corner bottom-left"></div>
                <div className="certificate-corner bottom-right"></div>
                
                <div className="certificate-header-section">
                  <div className="certificate-logo">TC</div>
                  <h1>Certificate of Completion</h1>
                </div>
                
                <div className="certificate-body">
                  <p className="certificate-present">This is to certify that</p>
                  <h2 className="certificate-name">{userName}</h2>
                  <p className="certificate-completion">has successfully completed the course</p>
                  <h3 className="certificate-course">{courseName}</h3>
                </div>
                
                <div className="certificate-footer">
                  <div className="certificate-date">
                    <span>Date of Completion</span>
                    <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                  <div className="certificate-seal">
                    <div className="seal-inner">
                      <Award size={32} />
                    </div>
                  </div>
                  <div className="certificate-signature">
                    <span>Instructor</span>
                    <div className="signature-line"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="certificate-actions">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary" onClick={handleDownload}>
            <Download size={18} />
            Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
}