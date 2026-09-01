import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login', { replace: true });
    }, 2400);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="splash-screen cursor-pointer"
      onClick={() => navigate('/login', { replace: true })}
      title="Tap to continue"
    >
      {/* Floating particles */}
      <div style={{
        position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none',
      }}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              borderRadius: '50%',
              background: `rgba(212, 168, 83, ${0.1 + Math.random() * 0.2})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="splash-logo">
        <Crown size={40} />
      </div>
      <div className="splash-title">VIP Event Intelligence</div>
      <div className="splash-subtitle">Your Private AI Event Assistant</div>

      <div style={{
        position: 'absolute',
        bottom: '60px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        animation: 'fadeIn 0.6s ease-out 1s backwards',
      }}>
        <div className="loading-spinner loading-spinner-sm" />
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Initializing...
        </span>
      </div>
    </div>
  );
}
