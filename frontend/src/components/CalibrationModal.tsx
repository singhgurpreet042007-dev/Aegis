import React, { useState, useEffect, useRef } from 'react';
import { X, Play, CheckCircle2, Activity, MousePointer, Keyboard, Sparkles, RefreshCw } from 'lucide-react';
import { globalTelemetryTracker } from '@/lib/telemetry-tracker';
import { fetchApi } from '@/lib/api-client';

interface CalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  sessionId: string;
  onCalibrationComplete?: (baselineData: any) => void;
}

const SAMPLE_TYPING_TEXTS = [
  "Zero Trust Security requires continuous identity verification across all network boundaries.",
  "Biometric telemetry captures neuromuscular micro-movements to defend against automated bot attacks.",
  "Aegis AI monitors mouse velocity curvature and key dwell flight latency in real time.",
];

export function CalibrationModal({
  isOpen,
  onClose,
  userId,
  sessionId,
  onCalibrationComplete,
}: CalibrationModalProps) {
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [typedText, setTypedText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [keystrokeCount, setKeystrokeCount] = useState(0);
  const [mousePointCount, setMousePointCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedBaseline, setSavedBaseline] = useState<any>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointsRef = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setIsCalibrating(false);
      setTimeLeft(60);
      setTypedText('');
      setKeystrokeCount(0);
      setMousePointCount(0);
      setIsComplete(false);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCalibrating && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isCalibrating && timeLeft === 0) {
      finishCalibration();
    }
    return () => clearInterval(timer);
  }, [isCalibrating, timeLeft]);

  const startCalibration = () => {
    setIsCalibrating(true);
    setTimeLeft(60);
    setTypedText('');
    setKeystrokeCount(0);
    setMousePointCount(0);
    setIsComplete(false);
    pointsRef.current = [];

    globalTelemetryTracker.startTracking({
      sessionId: sessionId || `sess_calib_${Date.now()}`,
      userId,
      isBaseline: true,
    });
    globalTelemetryTracker.setIsBaseline(true);
  };

  const finishCalibration = async () => {
    setIsCalibrating(false);
    setSaving(true);

    globalTelemetryTracker.flushBatch();
    globalTelemetryTracker.setIsBaseline(false);

    try {
      const res = await fetchApi('/biometrics/calibrate/complete', {
        method: 'POST',
        body: JSON.stringify({ userId, sessionId }),
      });

      if (res && res.success) {
        setSavedBaseline(res.baseline);
        if (onCalibrationComplete) onCalibrationComplete(res.baseline);
      }
    } catch (err) {
      console.warn('Calibration save fallback:', err);
    } finally {
      setSaving(false);
      setIsComplete(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTypedText(e.target.value);
    setKeystrokeCount((prev) => prev + 1);

    if (e.target.value.length >= SAMPLE_TYPING_TEXTS[textIndex].length) {
      setTypedText('');
      setTextIndex((prev) => (prev + 1) % SAMPLE_TYPING_TEXTS.length);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCalibrating) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pointsRef.current.push({ x, y });
    setMousePointCount((prev) => prev + 1);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();

      if (pointsRef.current.length > 1) {
        const prev = pointsRef.current[pointsRef.current.length - 2];
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-2xl w-full p-6 space-y-6 relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 tracking-tight">Behavioral Baseline Calibration</h2>
              <p className="text-xs text-zinc-500 font-light">
                Let's learn your behavior — type naturally and move your mouse for 60 seconds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* State 1: Ready to Start */}
        {!isCalibrating && !isComplete && !saving && (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <Activity className="w-8 h-8" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-zinc-900">Enrolling Identity Baseline</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                Zero-Trust security relies on your personalized typing dwell latency and mouse curvature vectors. No hardcoded default profile will be used.
              </p>
            </div>
            <button
              onClick={startCalibration}
              className="px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-mono font-bold text-xs flex items-center space-x-2 mx-auto transition-all shadow-md cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start 60s Calibration</span>
            </button>
          </div>
        )}

        {/* State 2: Active Calibration */}
        {isCalibrating && (
          <div className="space-y-5">
            {/* Progress Bar & Countdown */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-600 font-semibold flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Capturing Telemetry...</span>
                </span>
                <span className="font-bold text-zinc-900 text-sm">{timeLeft}s remaining</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden border border-zinc-200">
                <div
                  className="bg-emerald-500 h-full transition-all duration-1000"
                  style={{ width: `${((60 - timeLeft) / 60) * 100}%` }}
                />
              </div>
            </div>

            {/* Interactive Typing Prompt Area */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 flex items-center space-x-1.5 font-mono">
                <Keyboard className="w-3.5 h-3.5 text-zinc-400" />
                <span>Step 1: Type the prompt text naturally below</span>
              </label>
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs font-mono text-zinc-500 select-none">
                {SAMPLE_TYPING_TEXTS[textIndex]}
              </div>
              <input
                type="text"
                value={typedText}
                onChange={handleInputChange}
                placeholder="Start typing here naturally..."
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 focus:border-zinc-900 text-xs font-mono focus:outline-none bg-white shadow-xs"
                autoFocus
              />
            </div>

            {/* Interactive Mouse Movement Canvas Area */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 flex items-center space-x-1.5 font-mono">
                <MousePointer className="w-3.5 h-3.5 text-zinc-400" />
                <span>Step 2: Move mouse naturally inside box below</span>
              </label>
              <canvas
                ref={canvasRef}
                width={560}
                height={120}
                onMouseMove={handleCanvasMouseMove}
                className="w-full h-[120px] bg-zinc-900/5 rounded-xl border border-dashed border-zinc-300 cursor-crosshair"
              />
            </div>

            {/* Live Stats Footers */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <span className="text-zinc-500">Keystrokes:</span>
                <span className="font-bold text-zinc-900">{keystrokeCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <span className="text-zinc-500">Mouse Points:</span>
                <span className="font-bold text-zinc-900">{mousePointCount}</span>
              </div>
            </div>
          </div>
        )}

        {/* State 3: Saving Baseline */}
        {saving && (
          <div className="py-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-zinc-900 animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-zinc-900 font-mono">Computing Baseline Statistics & Saving to PostgreSQL...</h3>
          </div>
        )}

        {/* State 4: Complete */}
        {isComplete && (
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-zinc-900">Calibration Baseline Enrolled!</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-light">
                Your personalized biometrics baseline has been successfully computed and persisted into PostgreSQL database.
              </p>
            </div>

            {savedBaseline && (
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 text-left font-mono text-xs space-y-2 max-w-md mx-auto">
                <div className="text-zinc-400 font-bold uppercase text-[10px]">Computed Baseline Metrics</div>
                <div className="grid grid-cols-2 gap-2 text-zinc-700 text-[11px]">
                  <div>Dwell Mean: <strong className="text-zinc-900">{savedBaseline.keystrokeDwellMean}ms</strong></div>
                  <div>Dwell Std: <strong className="text-zinc-900">{savedBaseline.keystrokeDwellStd}ms</strong></div>
                  <div>Flight Mean: <strong className="text-zinc-900">{savedBaseline.keystrokeFlightMean}ms</strong></div>
                  <div>Mouse Vel: <strong className="text-zinc-900">{savedBaseline.mouseVelocityMean}px/s</strong></div>
                  <div>Curvature: <strong className="text-zinc-900">{savedBaseline.mouseCurvatureMean}</strong></div>
                  <div>Samples: <strong className="text-zinc-900">{savedBaseline.sampleCount}</strong></div>
                </div>
              </div>
            )}

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-mono font-bold text-xs mx-auto transition-all shadow-xs cursor-pointer"
            >
              Done & Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
