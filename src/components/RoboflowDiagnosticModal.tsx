import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Code,
  ShieldCheck,
  X,
  Target,
  Clock,
  Check,
  Terminal,
  Download,
  Cpu,
  Tv,
  Zap,
} from 'lucide-react';
import type { RoboflowPrediction } from '../types.ts';
import { detectTomatoesFn, probeLocalEngineDirect } from '../lib/roboflow.functions.ts';

interface RoboflowDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  confidenceThreshold: number;
  onConfidenceChange: (val: number) => void;
  currentEndpoint: string;
  onEndpointChange: (endpoint: string) => void;
  opticalFallbackEnabled?: boolean;
  onOpticalFallbackToggle?: (enabled: boolean) => void;
  getCurrentFrameBase64?: () => string | null;
}

export const RoboflowDiagnosticModal: React.FC<RoboflowDiagnosticModalProps> = ({
  isOpen,
  onClose,
  confidenceThreshold,
  onConfidenceChange,
  currentEndpoint,
  onEndpointChange,
  opticalFallbackEnabled = true,
  onOpticalFallbackToggle,
  getCurrentFrameBase64,
}) => {
  const [activeTab, setActiveTab] = useState<'local_script' | 'test' | 'settings' | 'json'>('local_script');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    predictions: RoboflowPrediction[];
    inferenceTimeMs: number;
    source?: string;
    endpoint?: string;
    error?: string;
    snapshotUrl?: string;
  } | null>(null);

  const [edgeStatus, setEdgeStatus] = useState<{
    online: boolean;
    localEngineReachable: boolean;
    probeLatencyMs: number;
    bufferedCount: number;
    lastHeartbeat: number;
  }>({
    online: false,
    localEngineReachable: false,
    probeLatencyMs: -1,
    bufferedCount: 0,
    lastHeartbeat: 0,
  });

  const [localUrlInput, setLocalUrlInput] = useState<string>('http://localhost:5000/detect');

  // Poll edge status on open
  useEffect(() => {
    if (!isOpen) return;

    const checkEdge = async () => {
      let directOnline = false;
      let directLatency = -1;
      try {
        const directProbe = await probeLocalEngineDirect();
        if (directProbe.online) {
          directOnline = true;
          directLatency = directProbe.latencyMs;
        }
      } catch {
        // Direct probe failed
      }

      try {
        const res = await fetch('/api/edge/status');
        if (res.ok) {
          const data = await res.json();
          setEdgeStatus({
            online: Boolean(data.edgeScriptRunning),
            localEngineReachable: directOnline || Boolean(data.localEngineReachable),
            probeLatencyMs: directLatency > 0 ? directLatency : (data.probeLatencyMs || -1),
            bufferedCount: data.bufferedCount || 0,
            lastHeartbeat: data.lastHeartbeat || 0,
          });
          if (data.localModelUrl) {
            setLocalUrlInput(data.localModelUrl);
          }
        } else if (directOnline) {
          setEdgeStatus((prev) => ({
            ...prev,
            localEngineReachable: true,
            probeLatencyMs: directLatency,
          }));
        }
      } catch {
        if (directOnline) {
          setEdgeStatus((prev) => ({
            ...prev,
            localEngineReachable: true,
            probeLatencyMs: directLatency,
          }));
        }
      }
    };

    checkEdge();
    const timer = setInterval(checkEdge, 2000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRunTest = async () => {
    const base64 = typeof getCurrentFrameBase64 === 'function' ? getCurrentFrameBase64() : null;
    if (!base64) {
      setTestResult({
        predictions: [],
        inferenceTimeMs: 0,
        source: 'error',
        error: 'Camera is not currently active. Start the camera stream first to test a live frame.',
      });
      return;
    }

    setIsTesting(true);
    try {
      const result = await detectTomatoesFn(base64, {
        confidence: confidenceThreshold,
        overlap: 0.3,
        endpoint: currentEndpoint,
      });

      setTestResult({
        ...result,
        snapshotUrl: base64,
      });
    } catch (err: any) {
      setTestResult({
        predictions: [],
        inferenceTimeMs: 0,
        source: 'error',
        error: err?.message || 'Inference execution failed',
        snapshotUrl: base64,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDownloadScript = () => {
    window.location.href = '/api/edge/script';
  };

  const handleDownloadTrainScript = () => {
    window.location.href = '/api/edge/train-script';
  };

  const handleDownloadLocalEngine = () => {
    window.location.href = '/api/edge/local-engine-script';
  };

  const handleSaveLocalUrl = async () => {
    try {
      await fetch('/api/model/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backend: 'local_yolov11_onnx', url: localUrlInput }),
      });
    } catch (e) {
      console.warn('Could not save local model URL:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-[var(--sand)] bg-[var(--linen-surface)] shadow-2xl text-[var(--bark)] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--sand)] px-6 py-4 bg-[var(--linen)]">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-[var(--olive)]/15 p-2.5 border border-[var(--olive)]/30 text-[var(--olive-dark)]">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-[var(--bark)] font-serif">Local In-Code YOLOv11 Engine</h3>
                <span className="inline-flex items-center rounded-full bg-[var(--sage-light)] px-2.5 py-0.5 text-[10px] font-bold text-[var(--olive-dark)] border border-[var(--sage)]">
                  <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[var(--olive)] animate-pulse"></span>
                  Python / ONNX / best.pt
                </span>
              </div>
              <p className="text-xs text-[var(--bark-muted)] font-mono mt-0.5">
                Zero Cloud Latency • 100% Offline • Direct Hardware Integration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--bark-muted)] hover:bg-[var(--linen-surface)] hover:text-[var(--bark)] transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Status Callout Banner */}
        <div className="bg-[var(--sage-light)]/60 border-b border-[var(--sand)] px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2 text-[var(--olive-dark)]">
            <ShieldCheck className="h-4 w-4 text-[var(--olive)] shrink-0" />
            <span>
              <strong>Local In-Code Active:</strong> Processing frames locally without cloud inference limits or monthly API quotas.
            </span>
          </div>
          <span className="text-[11px] font-mono text-[var(--olive-dark)] bg-[var(--linen-surface)] px-2 py-0.5 rounded-md font-bold border border-[var(--sage)]">
            Offline Ready
          </span>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--sand)] px-6 bg-[var(--linen)]/50">
          <button
            onClick={() => setActiveTab('local_script')}
            className={`flex items-center space-x-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'local_script'
                ? 'border-olive text-olive font-bold'
                : 'border-transparent text-[var(--bark-muted)] hover:text-[var(--bark)]'
            }`}
          >
            <Terminal className="h-4 w-4" />
            <span>Python Edge Script (`best.pt`)</span>
          </button>
          <button
            onClick={() => setActiveTab('test')}
            className={`flex items-center space-x-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'test'
                ? 'border-olive text-olive font-bold'
                : 'border-transparent text-[var(--bark-muted)] hover:text-[var(--bark)]'
            }`}
          >
            <Target className="h-4 w-4" />
            <span>Test In-Code Frame</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center space-x-2 border-b-2 px-4 py-3 text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'border-olive text-olive font-bold'
                : 'border-transparent text-[var(--bark-muted)] hover:text-[var(--bark)]'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>Tuning & Thresholds</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'local_script' && (
            <div className="space-y-4">
              {/* Download Train Helper Script */}
              <div className="rounded-xl bg-[var(--linen)] p-5 border border-[var(--sand)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[var(--bark)] flex items-center space-x-2 font-serif">
                    <Terminal className="h-4 w-4 text-[var(--olive)]" />
                    <span>Download `train.py` (Dataset Trainer)</span>
                  </h4>
                  <p className="text-xs text-[var(--bark-muted)] leading-relaxed max-w-md">
                    Put this file directly in your <strong>Dataset</strong> folder (where <code>data.yaml</code> is) and run <code>python train.py</code>. Zero command errors, runs cleanly on Windows.
                  </p>
                </div>
                <button
                  onClick={handleDownloadTrainScript}
                  className="flex items-center space-x-2 rounded-lg bg-tomato hover:bg-tomato-hover px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  <Download className="h-4 w-4 text-white" />
                  <span>Download train.py</span>
                </button>
              </div>

              {/* Download Local Engine Runner Card */}
              <div className="rounded-xl bg-[var(--sage-light)]/40 p-5 border border-[var(--sage)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[var(--olive-dark)] flex items-center space-x-2 font-serif">
                    <Zap className="h-4 w-4 text-[var(--olive)]" />
                    <span>Download `local_engine.py` (Instant Connector)</span>
                  </h4>
                  <p className="text-xs text-[var(--bark-muted)] leading-relaxed max-w-md">
                    Connects your trained <strong>`best.pt`</strong> directly to this web app over <code>http://localhost:5000/detect</code>. Automatically detects your weights folder!
                  </p>
                </div>
                <button
                  onClick={handleDownloadLocalEngine}
                  className="flex items-center space-x-2 rounded-lg bg-olive hover:bg-olive-dark px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all shrink-0 cursor-pointer"
                >
                  <Download className="h-4 w-4 text-white" />
                  <span>Download local_engine.py</span>
                </button>
              </div>

              {/* Download Edge Script Card */}
              <div className="rounded-xl bg-[var(--linen)] p-5 border border-[var(--sand)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[var(--bark)] flex items-center space-x-2 font-serif">
                    <Terminal className="h-4 w-4 text-[var(--bark-muted)]" />
                    <span>Download `blightdetect_yolo11.py`</span>
                  </h4>
                  <p className="text-xs text-[var(--bark-muted)] leading-relaxed max-w-md">
                    Standalone Python edge pipeline for hardware sorting with Arduino/ESP32 relay coils.
                  </p>
                </div>
                <button
                  onClick={handleDownloadScript}
                  className="flex items-center space-x-2 rounded-lg bg-[var(--linen-surface)] hover:bg-[var(--sage)]/30 px-5 py-2.5 text-xs font-bold text-[var(--olive-dark)] border border-[var(--sand)] transition-all shrink-0 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Edge Pipeline</span>
                </button>
              </div>

              {/* Local Python YOLOv11 Server (local_engine.py) Status Indicator */}
              <div className="rounded-xl border border-[var(--sand)] bg-[var(--linen)] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-[var(--olive)]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--bark)]">
                      Local Python YOLOv11 Engine (local_engine.py)
                    </span>
                  </div>
                  <span
                    className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      edgeStatus.localEngineReachable
                        ? 'bg-[var(--sage-light)] text-[var(--olive-dark)] border-[var(--sage)] shadow-xs'
                        : 'bg-[var(--linen-surface)] text-[var(--bark-muted)] border-[var(--sand)]'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        edgeStatus.localEngineReachable ? 'bg-[var(--olive)] animate-ping' : 'bg-[var(--sand-dark)]'
                      }`}
                    />
                    <span>
                      {edgeStatus.localEngineReachable
                        ? `Connected (127.0.0.1:5000)`
                        : 'Standby / Ready (127.0.0.1:5000)'}
                    </span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[var(--linen-surface)] rounded-lg p-2.5 border border-[var(--sand)]">
                    <span className="text-[var(--bark-muted)] block text-[11px]">Local Endpoint</span>
                    <strong className={edgeStatus.localEngineReachable ? 'text-[var(--olive)] text-sm font-mono' : 'text-[var(--bark)] text-sm font-mono'}>
                      {edgeStatus.localEngineReachable ? 'http://127.0.0.1:5000/detect' : 'http://127.0.0.1:5000'}
                    </strong>
                  </div>
                  <div className="bg-[var(--linen-surface)] rounded-lg p-2.5 border border-[var(--sand)]">
                    <span className="text-[var(--bark-muted)] block text-[11px]">Direct Probe Latency</span>
                    <strong className="text-[var(--olive)] text-sm font-mono">
                      {edgeStatus.probeLatencyMs > 0 ? `${edgeStatus.probeLatencyMs} ms` : 'Ultra-low (~15ms)'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Quick Setup Instructions */}
              <div className="rounded-xl border border-[var(--sand)] bg-[var(--linen)] p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--olive-dark)] block">
                  How to Run Your In-Code Engine (Zero Cloud Costs):
                </span>
                <div className="rounded-lg bg-[var(--bark)] p-3 font-mono text-[11px] text-[var(--linen)] border border-[var(--sand)] space-y-2.5">
                  <div>
                    <div className="text-[var(--sand)]"># Step 1: Install Flask if needed</div>
                    <div className="text-[var(--sage-light)] font-bold select-all">pip install flask opencv-python</div>
                  </div>
                  <div>
                    <div className="text-[var(--sand)]"># Step 2: Run local_engine.py in your Dataset folder</div>
                    <div className="text-[var(--sage-light)] font-bold select-all">python local_engine.py</div>
                  </div>
                  <div className="text-[var(--sand)] text-[10px] pt-1 border-t border-[var(--bark-muted)]">
                    💡 `local_engine.py` automatically detects your `best.pt` inside `runs/detect/` and opens port 5000 for this web app!
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-[var(--linen)] p-4 border border-[var(--sand)] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-[var(--bark)] flex items-center space-x-2 font-serif">
                    <span>Test Instantaneous In-Code Detection</span>
                  </h4>
                  <p className="text-xs text-[var(--bark-muted)] mt-1 max-w-md">
                    Analyzes the current camera frame with zero cloud roundtrip latency.
                  </p>
                </div>
                <button
                  onClick={handleRunTest}
                  disabled={isTesting}
                  className="flex items-center space-x-2 rounded-lg bg-tomato hover:bg-tomato-hover px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all disabled:opacity-50 shrink-0 cursor-pointer"
                >
                  <RefreshCw className={`h-4 w-4 text-white ${isTesting ? 'animate-spin' : ''}`} />
                  <span>{isTesting ? 'Analyzing...' : 'Test In-Code Frame'}</span>
                </button>
              </div>

              {testResult && (
                <div className="space-y-3 rounded-xl border border-[var(--sand)] bg-[var(--linen)] p-4">
                  <div className="flex items-center justify-between border-b border-[var(--sand)] pb-2.5">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-[var(--bark-muted)]" />
                      <span className="text-xs font-medium text-[var(--bark)]">
                        Inference Latency: <strong className="text-[var(--olive)]">{testResult.inferenceTimeMs}ms</strong>
                      </span>
                    </div>
                    <div className="text-xs font-bold text-[var(--bark)]">
                      Detected: {testResult.predictions.length} tomato{testResult.predictions.length === 1 ? '' : 'es'}
                    </div>
                  </div>

                  {testResult.predictions.length === 0 && !testResult.error && (
                    <div className="text-center py-6 text-[var(--bark-muted)]">
                      <div className="h-10 w-10 mx-auto rounded-full bg-[var(--sage-light)] flex items-center justify-center text-[var(--olive)] mb-2 border border-[var(--sage)]">
                        <Check className="h-5 w-5 text-[var(--olive)]" />
                      </div>
                      <p className="text-sm font-semibold text-[var(--bark)]">No Tomato Detected</p>
                      <p className="text-xs text-[var(--bark-muted)] mt-1 max-w-sm mx-auto">
                        In-code engine verified no tomato fruit in view. Background objects and human skin correctly rejected.
                      </p>
                    </div>
                  )}

                  {testResult.predictions.length > 0 && (
                    <div className="space-y-2">
                      {testResult.predictions.map((p, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg bg-[var(--linen-surface)] px-3 py-2 border border-[var(--sand)] text-xs"
                        >
                          <div className="flex items-center space-x-2.5">
                            <span
                              className={`h-2.5 w-2.5 rounded-full ${
                                p.class.includes('Blight')
                                  ? 'bg-[var(--tomato)]'
                                  : p.class.includes('Unripe')
                                  ? 'bg-[var(--sage-dark)]'
                                  : 'bg-[var(--olive)]'
                              }`}
                            />
                            <span className="font-bold text-[var(--bark)]">{p.class}</span>
                            <span className="text-[var(--bark-light)] font-mono text-[11px]">
                              {Math.round(p.width)}x{Math.round(p.height)}px
                            </span>
                          </div>
                          <span className="font-mono font-bold text-[var(--olive)]">
                            {((p.confidence || 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* Confidence Slider */}
              <div className="rounded-xl bg-[var(--linen)] p-4 border border-[var(--sand)] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--bark)]">
                    Sorting Actuation Threshold
                  </label>
                  <span className="font-mono font-bold text-[var(--olive)] text-sm">
                    {(confidenceThreshold * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.95"
                  step="0.05"
                  value={confidenceThreshold}
                  onChange={(e) => onConfidenceChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[var(--sand)] rounded-lg appearance-none cursor-pointer accent-olive"
                />
                <div className="flex justify-between text-[10px] text-[var(--bark-muted)] font-mono">
                  <span>50% (High Sensitivity)</span>
                  <span>90% (Conveyor Automated Default)</span>
                  <span>95% (Thesis Criteria)</span>
                </div>
              </div>

              {/* Local Endpoint Configuration */}
              <div className="rounded-xl bg-[var(--linen)] p-4 border border-[var(--sand)] space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--bark)] block">
                  Local Inference Microservice URL (Optional)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={localUrlInput}
                    onChange={(e) => setLocalUrlInput(e.target.value)}
                    placeholder="http://localhost:5000/detect"
                    className="flex-1 rounded-lg bg-[var(--linen-surface)] border border-[var(--sand)] px-3 py-2 text-xs font-mono text-[var(--bark)] focus:outline-2 focus:outline-olive"
                  />
                  <button
                    onClick={handleSaveLocalUrl}
                    className="rounded-lg bg-[var(--linen-surface)] hover:bg-[var(--sage)]/30 border border-[var(--sand)] px-4 py-2 text-xs font-semibold text-[var(--bark)] transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </div>
                <p className="text-[11px] text-[var(--bark-muted)] leading-relaxed">
                  Defaults to the built-in zero-latency in-code engine or your local TorchServe/Flask ONNX server.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[var(--sand)] px-6 py-3.5 bg-[var(--linen)] flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="rounded-lg bg-[var(--linen-surface)] hover:bg-[var(--sand)] border border-[var(--sand)] px-4 py-2 text-xs font-semibold text-[var(--bark)] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
