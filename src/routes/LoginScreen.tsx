import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Delete, Fingerprint } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function LoginScreen() {
  const navigate = useNavigate();
  const { hasSetup, login, setupVIP } = useAppStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSetupMode, setIsSetupMode] = useState(!hasSetup);
  const [setupName, setSetupName] = useState('');
  const [setupStep, setSetupStep] = useState<'name' | 'pin' | 'confirm'>('name');
  const [confirmPin, setConfirmPin] = useState('');

  const handleKeyPress = (key: string) => {
    setError('');
    if (isSetupMode) {
      if (setupStep === 'pin') {
        if (pin.length < 4) {
          const newPin = pin + key;
          setPin(newPin);
          if (newPin.length === 4) {
            setTimeout(() => {
              setSetupStep('confirm');
              setConfirmPin('');
            }, 200);
          }
        }
      } else if (setupStep === 'confirm') {
        if (confirmPin.length < 4) {
          const newConfirm = confirmPin + key;
          setConfirmPin(newConfirm);
          if (newConfirm.length === 4) {
            setTimeout(() => {
              if (newConfirm === pin) {
                setupVIP(setupName, pin);
                navigate('/dashboard', { replace: true });
              } else {
                setError('PINs do not match. Try again.');
                setPin('');
                setConfirmPin('');
                setSetupStep('pin');
              }
            }, 200);
          }
        }
      }
    } else {
      if (pin.length < 4) {
        const newPin = pin + key;
        setPin(newPin);
        if (newPin.length === 4) {
          setTimeout(() => {
            const success = login(newPin);
            if (success) {
              navigate('/dashboard', { replace: true });
            } else {
              setError('Incorrect PIN. Please try again.');
              setPin('');
            }
          }, 200);
        }
      }
    }
  };

  const handleDelete = () => {
    setError('');
    if (isSetupMode && setupStep === 'confirm') {
      setConfirmPin(confirmPin.slice(0, -1));
    } else {
      setPin(pin.slice(0, -1));
    }
  };

  const currentPin = isSetupMode && setupStep === 'confirm' ? confirmPin : pin;

  if (isSetupMode && setupStep === 'name') {
    return (
      <div className="screen-no-nav flex flex-col items-center justify-center" style={{ minHeight: '100dvh' }}>
        <div className="animate-scale-in text-center" style={{ width: '100%', maxWidth: '340px', padding: '0 var(--space-4)' }}>
          <div className="splash-logo" style={{ margin: '0 auto var(--space-6)' }}>
            <Crown size={36} />
          </div>
          <h2 style={{ marginBottom: 'var(--space-2)' }}>Welcome</h2>
          <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-8)' }}>
            Set up your VIP profile to get started
          </p>

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label className="label">Your Name</label>
            <input
              className="input"
              type="text"
              placeholder="Enter your name"
              value={setupName}
              onChange={(e) => setSetupName(e.target.value)}
              autoFocus
            />
          </div>

          <button
            className="btn btn-gold w-full"
            disabled={!setupName.trim()}
            onClick={() => setSetupStep('pin')}
          >
            Continue
          </button>

          {hasSetup && (
            <button
              className="btn btn-ghost w-full mt-4"
              onClick={() => { setIsSetupMode(false); setPin(''); }}
            >
              Already have an account? Login
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="screen-no-nav flex flex-col items-center justify-center" style={{ minHeight: '100dvh' }}>
      <div className="animate-scale-in text-center" style={{ width: '100%', maxWidth: '340px', padding: '0 var(--space-4)' }}>
        <div className="splash-logo" style={{ margin: '0 auto var(--space-5)' }}>
          <Crown size={36} />
        </div>

        {isSetupMode ? (
          <>
            <h3 style={{ marginBottom: 'var(--space-1)' }}>
              {setupStep === 'pin' ? 'Create Your PIN' : 'Confirm Your PIN'}
            </h3>
            <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-6)' }}>
              {setupStep === 'pin'
                ? 'Choose a 4-digit secure PIN'
                : 'Enter the same PIN again'}
            </p>
          </>
        ) : (
          <>
            <h3 style={{ marginBottom: 'var(--space-1)' }}>Welcome Back</h3>
            <p className="text-secondary text-sm" style={{ marginBottom: 'var(--space-6)' }}>
              Enter your PIN to continue
            </p>
          </>
        )}

        {/* PIN Dots */}
        <div className="pin-dots">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`pin-dot ${i < currentPin.length ? 'filled' : ''}`} />
          ))}
        </div>

        {error && (
          <div style={{
            color: 'var(--color-danger)',
            fontSize: 'var(--text-sm)',
            marginBottom: 'var(--space-4)',
            animation: 'slideUp 0.3s ease-out',
          }}>
            {error}
          </div>
        )}

        {/* PIN Keypad */}
        <div className="pin-grid">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              className="pin-key"
              onClick={() => handleKeyPress(num.toString())}
            >
              {num}
            </button>
          ))}
          <button className="pin-key" style={{ opacity: 0.5, cursor: 'default' }}>
            <Fingerprint size={22} />
          </button>
          <button className="pin-key" onClick={() => handleKeyPress('0')}>
            0
          </button>
          <button className="pin-key" onClick={handleDelete}>
            <Delete size={22} />
          </button>
        </div>

        {!isSetupMode && (
          <p style={{
            marginTop: 'var(--space-6)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
          }}>
            Demo VIP PIN: <span className="text-gold">0000</span> &nbsp;|&nbsp; PA: <span className="text-gold">1111</span>
          </p>
        )}
      </div>
    </div>
  );
}
