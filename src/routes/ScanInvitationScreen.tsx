import { useState, useRef, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, Image, ArrowLeft, Sparkles, PenLine } from 'lucide-react';

export default function ScanInvitationScreen() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleAnalyze = () => {
    if (preview) {
      // Store the image in sessionStorage and navigate to AI processing
      sessionStorage.setItem('scan-image', preview);
      navigate('/ai-processing');
    }
  };

  return (
    <div className="screen flex flex-col" style={{ minHeight: '100dvh' }}>
      {/* Header */}
      <div className="top-bar">
        <button className="top-bar-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
        </button>
        <span className="top-bar-title">Scan Invitation</span>
        <div style={{ width: '36px' }} />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6" style={{ padding: '0 var(--space-4)' }}>
        {!preview ? (
          <>
            {/* Upload Area */}
            <div
              className="glass-card glass-card-gold glass-card-interactive text-center animate-scale-in"
              style={{
                width: '100%',
                maxWidth: '340px',
                padding: 'var(--space-10) var(--space-6)',
                border: '2px dashed rgba(212, 168, 83, 0.3)',
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={{
                width: '64px', height: '64px', borderRadius: 'var(--radius-xl)',
                background: 'var(--color-gold-muted)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                margin: '0 auto var(--space-4)', color: 'var(--color-gold)',
              }}>
                <Image size={28} />
              </div>
              <h3 style={{ marginBottom: 'var(--space-2)' }}>Upload Invitation</h3>
              <p className="text-secondary text-sm">
                Tap to select an invitation image from your gallery
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full" style={{ maxWidth: '340px' }}>
              <button
                className="btn btn-gold flex-1"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera size={18} />
                Take Photo
              </button>
              <button
                className="btn btn-outline flex-1"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={18} />
                Upload
              </button>
            </div>

            {/* Manual Entry Option */}
            <div className="w-full" style={{ maxWidth: '340px', marginTop: 'var(--space-1)' }}>
              <button
                type="button"
                className="btn btn-outline w-full"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  borderColor: 'rgba(212, 168, 83, 0.35)',
                  background: 'rgba(15, 23, 42, 0.4)',
                  padding: '12px',
                }}
                onClick={() => navigate('/add-invitation')}
              >
                <PenLine size={16} className="text-gold" />
                <span>Add Invitation Manually</span>
              </button>
            </div>

            <p className="text-muted text-xs text-center" style={{ maxWidth: '280px', marginTop: 'var(--space-2)' }}>
              AI can automatically extract details from photos, or you can enter event details manually.
            </p>
          </>
        ) : (
          <>
            {/* Preview */}
            <div className="scan-overlay animate-scale-in" style={{ width: '100%', maxWidth: '340px' }}>
              <img
                src={preview}
                alt="Invitation preview"
                style={{
                  width: '100%',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--glass-border)',
                }}
              />
            </div>

            <div className="flex gap-3 w-full" style={{ maxWidth: '340px' }}>
              <button
                className="btn btn-ghost flex-1"
                onClick={() => setPreview(null)}
              >
                Retake
              </button>
              <button
                className="btn btn-gold flex-1"
                onClick={handleAnalyze}
              >
                <Sparkles size={18} />
                Analyze
              </button>
            </div>
          </>
        )}
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileInput}
        style={{ display: 'none' }}
      />
    </div>
  );
}
