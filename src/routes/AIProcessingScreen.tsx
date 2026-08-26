import { useState, useEffect, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { runAIAnalysis, DEMO_OCR_TEXTS } from '../services/aiService';
import {
  ScanText, Users, CalendarSearch, Brain, Check, Loader,
} from 'lucide-react';

interface Step {
  label: string;
  icon: ReactNode;
  status: 'pending' | 'active' | 'completed';
}

export default function AIProcessingScreen() {
  const navigate = useNavigate();
  const { people, familyEvents, schedule, invitations, setScanResult } = useAppStore();
  const [steps, setSteps] = useState<Step[]>([
    { label: 'Reading invitation...', icon: <ScanText size={16} />, status: 'pending' },
    { label: 'Extracting details...', icon: <Loader size={16} />, status: 'pending' },
    { label: 'Checking relationships...', icon: <Users size={16} />, status: 'pending' },
    { label: 'Analyzing schedule...', icon: <CalendarSearch size={16} />, status: 'pending' },
    { label: 'Generating recommendation...', icon: <Brain size={16} />, status: 'pending' },
  ]);

  useEffect(() => {
    const imageData = sessionStorage.getItem('scan-image');
    if (!imageData) {
      navigate('/scan', { replace: true });
      return;
    }

    const isDemo = imageData === 'demo';
    processInvitation(isDemo, imageData);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processInvitation = async (isDemo: boolean, imageDataUrl: string) => {
    // Step 1: Reading invitation
    updateStep(0, 'active');
    await delay(800);

    let ocrText: string;
    if (isDemo) {
      // Use a random demo OCR text
      ocrText = DEMO_OCR_TEXTS[Math.floor(Math.random() * DEMO_OCR_TEXTS.length)];
    } else {
      // Try Tesseract.js OCR
      try {
        const { createWorker } = await import('tesseract.js');
        const worker = await createWorker('eng');
        const { data } = await worker.recognize(imageDataUrl);
        ocrText = data.text;
        await worker.terminate();
      } catch {
        // Fallback to demo text if OCR fails
        ocrText = DEMO_OCR_TEXTS[0];
      }
    }

    updateStep(0, 'completed');

    // Step 2: Extracting details
    updateStep(1, 'active');
    await delay(600);
    updateStep(1, 'completed');

    // Step 3: Checking relationships
    updateStep(2, 'active');
    await delay(700);
    updateStep(2, 'completed');

    // Step 4: Analyzing schedule
    updateStep(3, 'active');
    await delay(500);
    updateStep(3, 'completed');

    // Step 5: Generating recommendation
    updateStep(4, 'active');
    await delay(600);

    // Run the full AI analysis
    const analysis = runAIAnalysis(ocrText, people, familyEvents, schedule, invitations);

    updateStep(4, 'completed');

    // Store result and navigate
    setScanResult({
      imageDataUrl: isDemo ? '' : imageDataUrl,
      ocrText,
      extractedFields: analysis.extractedFields,
      analysis,
    });

    await delay(400);
    navigate('/extracted-details', { replace: true });
  };

  const updateStep = (index: number, status: Step['status']) => {
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, status } : step))
    );
  };

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  return (
    <div className="screen-no-nav flex flex-col items-center justify-center" style={{ minHeight: '100dvh' }}>
      <div className="animate-scale-in" style={{ width: '100%', maxWidth: '340px', padding: '0 var(--space-4)' }}>
        {/* Scanning animation */}
        <div style={{
          width: '80px', height: '80px', borderRadius: 'var(--radius-xl)',
          background: 'var(--color-gold-muted)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          margin: '0 auto var(--space-6)', color: 'var(--color-gold)',
        }} className="animate-pulse-glow">
          <Brain size={36} />
        </div>

        <h2 className="text-center" style={{ marginBottom: 'var(--space-2)' }}>
          AI Analysis
        </h2>
        <p className="text-center text-secondary text-sm" style={{ marginBottom: 'var(--space-8)' }}>
          Processing your invitation...
        </p>

        {/* Steps */}
        <div className="flex flex-col gap-1">
          {steps.map((step, i) => (
            <div key={i} className={`ai-step ${step.status}`}>
              <div className="ai-step-icon">
                {step.status === 'completed' ? (
                  <Check size={16} />
                ) : (
                  step.icon
                )}
              </div>
              <span className="ai-step-text">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
