/**
 * Live Stream Route - Continuous Real-Time Tomato & Blight Detector
 */
import React, { useState, useEffect } from 'react';
import { RoboflowDetector } from '../components/RoboflowDetector.tsx';
import type {
  CameraStatus,
  TomatoSessionCounts,
  TomatoDetectionEvent,
  DetectionSession,
  LowLightFilterConfig,
} from '../types.ts';
import {
  Activity,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  Award,
  Usb,
  Send,
  AlertCircle,
  ExternalLink,
  Terminal,
  ChevronDown,
  ChevronUp,
  Trash2,
  HelpCircle,
  Play,
  Square,
  Pause,
  RotateCcw,
  Sliders,
  Eye,
  Zap,
} from 'lucide-react';
import {
  connectSerial,
  disconnectSerial,
  subscribeSerial,
  sendCommand,
  enableSimulationMode,
  isSerialSupported,
  isRunningInIframe,
  clearSerialLogs,
  startConveyor,
  stopConveyor,
  pauseConveyor,
  resumeConveyor,
  resetSystem,
  testServo,
  toggleMotorInversion,
  testMotorFwd,
  testMotorRev,
  type SerialStatus,
} from '../lib/arduino.ts';

interface LiveStreamRouteProps {
  session: DetectionSession | null;
  counts: TomatoSessionCounts;
  recentEvents: TomatoDetectionEvent[];
  cameraStatus: CameraStatus;
  setCameraStatus: (status: CameraStatus) => void;
  onTomatoCounted: (event: TomatoDetectionEvent) => void;
  onStopCamera: () => void;
  onStartCamera: () => void;
  onNavigate: (route: string) => void;
}

export const LiveStreamRoute: React.FC<LiveStreamRouteProps> = ({
  session,
  counts,
  recentEvents,
  cameraStatus,
  setCameraStatus,
  onTomatoCounted,
  onStopCamera,
  onStartCamera,
  onNavigate,
}) => {
  const [lowLightConfig, setLowLightConfig] = useState<LowLightFilterConfig>({
    enabled: false,
    brightness: 145,
    contrast: 135,
    saturation: 120,
    preset: 'standard',
    autoGain: false,
  });

  const [serialStatus, setSerialStatus] = useState<SerialStatus>({
    isConnected: false,
    isSimulated: false,
    lastCommand: null,
    error: null,
    logs: [],
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [testSent, setTestSent] = useState<string | null>(null);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  const isInIframe = typeof window !== 'undefined' && window.self !== window.top;
  const supported = isSerialSupported();

  useEffect(() => {
    return subscribeSerial((status) => {
      setSerialStatus(status);
      if (status.isConnected && status.logs.length > 0) {
        setIsTerminalOpen(true);
      }
    });
  }, []);

  const handleToggleConnect = async () => {
    if (serialStatus.isConnected) {
      await disconnectSerial();
    } else {
      setIsConnecting(true);
      await connectSerial();
      setIsConnecting(false);
    }
  };

  const handleManualTest = async (cmd: string) => {
    setTestSent(cmd);
    await sendCommand(cmd);
    setTimeout(() => setTestSent(null), 1200);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Arduino Web Serial Status & Connection Toolbar */}
      <div className="rounded-xl border border-[#D8E3D6] bg-white p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors agri-card-shadow">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2.5 rounded-lg ${
              serialStatus.isConnected
                ? 'bg-[#E8F3E5] text-[#2E7D32]'
                : 'bg-[#F8F9F4] text-[#607D8B] border border-[#D8E3D6]'
            }`}
          >
            <Usb className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-[#174C35]">
                Arduino USB Serial
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                  serialStatus.isConnected
                    ? 'bg-[#E8F3E5] text-[#2E7D32] border border-[#D8E3D6]'
                    : 'bg-[#F8F9F4] text-[#607D8B] border border-[#D8E3D6]'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                    serialStatus.isConnected ? 'bg-[#2E7D32] animate-pulse' : 'bg-[#607D8B]'
                  }`}
                />
                {serialStatus.isConnected
                  ? serialStatus.isSimulated
                    ? 'Simulated Serial'
                    : 'USB Connected (9600 Baud)'
                  : 'Disconnected'}
              </span>

              {/* Conveyor State Badge */}
              {serialStatus.isConnected && (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                    serialStatus.conveyorState === 'RUNNING'
                      ? 'bg-[#E8F3E5] text-[#2E7D32] border-[#D8E3D6]'
                      : serialStatus.conveyorState === 'SORTING_ACTIVE'
                      ? 'bg-[#FDECEC] text-[#E53935] border-[#E53935]/40 animate-pulse'
                      : serialStatus.conveyorState === 'WAITING_POSITION'
                      ? 'bg-[#E8F3E5] text-[#174C35] border-[#D8E3D6]'
                      : serialStatus.conveyorState === 'PAUSED'
                      ? 'bg-[#F8F9F4] text-[#263238] border-[#D8E3D6]'
                      : 'bg-[#F8F9F4] text-[#607D8B] border-[#D8E3D6]'
                  }`}
                >
                  Conveyor: {serialStatus.conveyorState}
                  {serialStatus.activeSortingArm && ` (${serialStatus.activeSortingArm})`}
                </span>
              )}

              {/* IR Sensor Trigger indicator */}
              {serialStatus.lastIrDetectedTime && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono bg-[#E8F3E5] text-[#174C35] border border-[#D8E3D6]">
                  IR Beam: {serialStatus.lastIrDetectedTime}
                </span>
              )}
            </div>

            <div className="text-xs text-[#607D8B] mt-1 flex flex-wrap items-center gap-x-2">
              <span>Conveyor Rig:</span>
              <span className="font-mono text-[11px] text-[#263238]">
                12V Motor (D5 PWM) • 6 Servos (D9/10/11/6/7/12) • IR (D2)
              </span>
              {serialStatus.lastCommand && (
                <span className="font-mono text-[11px] text-[#2E7D32] font-bold">
                  (TX: &apos;{serialStatus.lastCommand}&apos;)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons & Manual Triggers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Master Conveyor Motor Controls when connected */}
          {serialStatus.isConnected && (
            <div className="flex items-center space-x-1.5 border-r border-[#D8E3D6] pr-2 mr-1">
              <span className="text-[11px] text-[#607D8B] font-bold mr-0.5">Motor:</span>
              <button
                onClick={() => startConveyor()}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center space-x-1 transition-all cursor-pointer ${
                  serialStatus.conveyorState === 'RUNNING'
                    ? 'bg-[#2E7D32] text-white shadow-xs'
                    : 'bg-[#E8F3E5] text-[#2E7D32] hover:bg-[#2E7D32]/20 border border-[#D8E3D6]'
                }`}
                title="Start 12V Conveyor Motor (START command)"
              >
                <Play className="h-3 w-3 fill-current" />
                <span>Start</span>
              </button>
              <button
                onClick={() => stopConveyor()}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center space-x-1 transition-all cursor-pointer ${
                  serialStatus.conveyorState === 'STOPPED'
                    ? 'bg-[#E53935] text-white shadow-xs'
                    : 'bg-[#FDECEC] text-[#E53935] hover:bg-[#E53935]/20 border border-[#E53935]/30'
                }`}
                title="Stop Conveyor Motor (STOP command)"
              >
                <Square className="h-3 w-3 fill-current" />
                <span>Stop</span>
              </button>
              <button
                onClick={() => (serialStatus.conveyorState === 'PAUSED' ? resumeConveyor() : pauseConveyor())}
                className="px-2 py-1 text-xs rounded-lg bg-white hover:bg-[#F8F9F4] text-[#263238] border border-[#D8E3D6] transition-all cursor-pointer"
                title="Pause/Resume Conveyor Motor"
              >
                <Pause className="h-3 w-3" />
              </button>
              <button
                onClick={() => resetSystem()}
                className="px-2 py-1 text-xs rounded-lg bg-white hover:bg-[#F8F9F4] text-[#263238] border border-[#D8E3D6] transition-all cursor-pointer"
                title="Reset Conveyor and Servos to Home (RESET command)"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
              <button
                onClick={() => toggleMotorInversion()}
                className={`px-2 py-1 text-[11px] font-mono rounded-lg border transition-all cursor-pointer flex items-center space-x-1 ${
                  serialStatus.isMotorInverted
                    ? 'bg-[#FDECEC] text-[#E53935] border-[#E53935]/30 font-bold'
                    : 'bg-white text-[#607D8B] border-[#D8E3D6]'
                }`}
                title="Toggle Motor Inversion"
              >
                <Zap className="h-3 w-3" />
                <span>{serialStatus.isMotorInverted ? 'Inverted' : 'Normal'}</span>
              </button>
              <button
                onClick={() => testMotorFwd()}
                className="px-2 py-1 text-[11px] font-mono rounded-lg bg-[#E8F3E5] text-[#174C35] border border-[#D8E3D6] hover:bg-[#2E7D32]/20 transition-all cursor-pointer font-bold"
                title="Force Motor Forward at PWM 160 speed"
              >
                Fwd 160
              </button>
              <button
                onClick={() => testMotorRev()}
                className="px-2 py-1 text-[11px] font-mono rounded-lg bg-[#E8F3E5] text-[#174C35] border border-[#D8E3D6] hover:bg-[#2E7D32]/20 transition-all cursor-pointer font-bold"
                title="Force Motor Reverse at PWM 160 speed"
              >
                Rev 160
              </button>
            </div>
          )}

          {/* Quick Manual Test Triggers for 4 Servos */}
          {serialStatus.isConnected && (
            <div className="flex items-center space-x-1 border-r border-[#D8E3D6] pr-2 mr-1">
              <span className="text-[11px] text-[#607D8B] mr-1">Servos:</span>
              {[
                { label: 'S1: Unripe (D9)', cmd: 'UNRIPE' },
                { label: 'S2: Small (D10)', cmd: 'SMALL' },
                { label: 'S3: Med (D11)', cmd: 'MEDIUM' },
                { label: 'S4: Large (D6)', cmd: 'LARGE' },
              ].map(({ label, cmd }) => (
                <button
                  key={cmd}
                  onClick={() => testServo(cmd)}
                  className={`px-1.5 py-1 text-[11px] font-mono rounded-md border transition-all cursor-pointer ${
                    serialStatus.activeSortingArm?.includes(cmd)
                      ? 'bg-[#2E7D32] text-white border-[#2E7D32] scale-95 animate-pulse'
                      : 'bg-white text-[#263238] border-[#D8E3D6] hover:bg-[#E8F3E5]'
                  }`}
                  title={`Test ${label} servo arm diverter (TEST_${cmd} command)`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Toggle Live Terminal */}
          <button
            onClick={() => setIsTerminalOpen(!isTerminalOpen)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer border ${
              isTerminalOpen
                ? 'bg-[#174C35] text-white border-transparent'
                : 'bg-white text-[#263238] border-[#D8E3D6] hover:bg-[#F8F9F4]'
            }`}
            title="Toggle Live Serial RX/TX terminal feed"
          >
            <Terminal className="h-3.5 w-3.5 text-[#2E7D32]" />
            <span>Terminal</span>
            {serialStatus.logs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-[#E8F3E5] text-[#2E7D32] font-mono font-bold">
                {serialStatus.logs.length}
              </span>
            )}
            {isTerminalOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {/* If in iframe, offer 1-click standalone launch for USB permission */}
          {isInIframe && !serialStatus.isConnected && (
            <button
              onClick={() => window.open(window.location.href, '_blank')}
              className="px-3.5 py-2 rounded-lg text-xs font-bold bg-[#E53935] hover:bg-[#C62828] text-white flex items-center space-x-1.5 shadow-xs transition-all cursor-pointer"
              title="Open app in a top-level browser tab so Chrome grants full USB serial access"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Launch Standalone Tab</span>
            </button>
          )}

          {/* Connect / Disconnect Button */}
          <button
            id="btn-connect-serial"
            onClick={handleToggleConnect}
            disabled={isConnecting}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 ${
              serialStatus.isConnected
                ? 'bg-[#FDECEC] text-[#E53935] hover:bg-[#E53935]/20 border border-[#E53935]/30'
                : 'bg-[#E53935] hover:bg-[#C62828] text-white shadow-xs'
            }`}
          >
            <Usb className="h-4 w-4" />
            <span>
              {isConnecting
                ? 'Requesting Port...'
                : serialStatus.isConnected
                ? serialStatus.isSimulated
                  ? 'Exit Simulation'
                  : 'Disconnect Arduino'
                : 'Connect Arduino (USB)'}
            </span>
          </button>
        </div>
      </div>

      {/* Collapsible Live Serial Monitor */}
      {isTerminalOpen && (
        <div className="rounded-xl border border-[#D8E3D6] bg-white p-4 shadow-xs font-mono text-xs text-[#263238] animate-fadeIn agri-card-shadow">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D8E3D6]">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-[#2E7D32] animate-pulse" />
              <span className="font-bold text-[#174C35] text-xs">Live Serial Monitor (9600 Baud)</span>
              <span className="text-[11px] text-[#607D8B]">
                {serialStatus.isConnected ? (serialStatus.isSimulated ? '(Simulation Mode)' : '(Live USB Port)') : '(Offline)'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => clearSerialLogs()}
                className="px-2.5 py-1 rounded-md bg-[#F8F9F4] hover:bg-[#E8F3E5] text-[#607D8B] hover:text-[#263238] border border-[#D8E3D6] text-[11px] flex items-center space-x-1 transition-colors cursor-pointer"
                title="Clear terminal log"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1 text-[11px] scrollbar-thin">
            {serialStatus.logs.length === 0 ? (
              <div className="text-[#607D8B] py-3 text-center italic">
                No serial events logged yet. Click &apos;Connect Arduino&apos; or press test buttons above.
              </div>
            ) : (
              serialStatus.logs.map((log) => (
                <div key={log.id} className="flex items-start space-x-2 font-mono leading-relaxed">
                  <span className="text-[#607D8B] text-[10px] select-none shrink-0">{log.timestamp}</span>
                  <span
                    className={`px-1 rounded text-[10px] font-bold shrink-0 ${
                      log.type === 'tx'
                        ? 'bg-[#F8F9F4] text-[#263238] border border-[#D8E3D6]'
                        : log.type === 'rx'
                        ? 'bg-[#E8F3E5] text-[#2E7D32] border border-[#D8E3D6]'
                        : log.type === 'err'
                        ? 'bg-[#FDECEC] text-[#E53935] border border-[#E53935]/30'
                        : 'bg-[#F8F9F4] text-[#607D8B]'
                    }`}
                  >
                    {log.type.toUpperCase()}
                  </span>
                  <span
                    className={`${
                      log.type === 'tx'
                        ? 'text-[#263238] font-semibold'
                        : log.type === 'rx'
                        ? 'text-[#2E7D32] font-bold'
                        : log.type === 'err'
                        ? 'text-[#E53935] font-bold'
                        : 'text-[#607D8B]'
                    }`}
                  >
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Security or Connection Notice if needed */}
      {serialStatus.error && (
        <div className="p-4 rounded-xl bg-[#FDECEC] border border-[#E53935]/30 text-[#263238] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start space-x-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-[#E53935] mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold text-[#C62828]">{serialStatus.error}</p>
              <p className="text-[11px] text-[#607D8B]">
                Opening in a standalone browser tab bypasses iframe restrictions and gives Chrome direct access to your USB port.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => enableSimulationMode()}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#F8F9F4] text-[#263238] font-semibold text-xs border border-[#D8E3D6] transition-colors cursor-pointer"
            >
              Use Simulation Mode
            </button>
            <button
              onClick={() => window.open(window.location.href, '_blank')}
              className="px-3.5 py-1.5 rounded-lg bg-[#E53935] hover:bg-[#C62828] text-white font-semibold text-xs flex items-center space-x-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Open in Full Tab for Real USB</span>
            </button>
          </div>
        </div>
      )}

      {/* Real-time Detector Main Component */}
      <RoboflowDetector
        sessionId={session?.id || 'default-session'}
        sessionCounts={counts}
        onTomatoCounted={onTomatoCounted}
        onStopCamera={onStopCamera}
        onStartCamera={onStartCamera}
        cameraStatus={cameraStatus}
        setCameraStatus={setCameraStatus}
        lowLightConfig={lowLightConfig}
        onLowLightConfigChange={setLowLightConfig}
      />

      {/* Real-Time Unique Tomato Event Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Event Stream Table */}
        <div className="lg:col-span-2 rounded-xl border border-[#D8E3D6] bg-white p-5 shadow-xs transition-colors agri-card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-[#2E7D32]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#174C35]">
                Live Detection Stream
              </h3>
            </div>
            <span className="text-xs text-[#607D8B]">
              {recentEvents.length} items logged
            </span>
          </div>

          {recentEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-[#607D8B]">
              <div className="h-10 w-10 rounded-lg bg-[#E8F3E5] flex items-center justify-center mb-3 text-[#2E7D32]">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-[#263238]">No tomatoes detected yet in this session</p>
              <p className="text-xs text-[#607D8B] mt-1 max-w-sm">
                Start camera or simulation to begin continuous detection and sorting.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#D8E3D6] text-[#607D8B]">
                    <th className="pb-2 font-semibold">Time</th>
                    <th className="pb-2 font-semibold">Track ID</th>
                    <th className="pb-2 font-semibold">Classification & Pathology</th>
                    <th className="pb-2 font-semibold">Est. Size</th>
                    <th className="pb-2 font-semibold">Confidence</th>
                    <th className="pb-2 font-semibold">Grade</th>
                    <th className="pb-2 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D8E3D6]/50">
                  {recentEvents.slice(0, 10).map((evt) => {
                    const isBlight = evt.ripeness === 'blight';
                    const action = evt.sortingAction || (evt.confidence < 95 ? 'MANUAL_REVIEW' : isBlight ? 'REJECT_QUARANTINE' : 'ACCEPT');
                    const grade = evt.qualityGrade || (isBlight ? 'Grade C' : evt.confidence >= 95 ? 'Grade A' : 'Grade B');

                    return (
                      <tr key={evt.id} className="hover:bg-[#F8F9F4] transition-colors">
                        <td className="py-2.5 font-mono text-[#607D8B]">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2.5 font-mono font-bold text-[#263238]">
                          #TRK-{evt.trackId}
                        </td>
                        <td className="py-2.5">
                          <div className="flex flex-col">
                            <span
                              className={`inline-flex items-center space-x-1 rounded-md px-2 py-0.5 font-semibold w-fit ${
                                evt.ripeness === 'ripe'
                                  ? 'bg-[#E8F3E5] text-[#2E7D32] border border-[#D8E3D6]'
                                  : evt.ripeness === 'unripe'
                                  ? 'bg-[#F8F9F4] text-[#263238] border border-[#D8E3D6]'
                                  : 'bg-[#FDECEC] text-[#E53935] border border-[#E53935]/30'
                              }`}
                            >
                              <span>{evt.class}</span>
                            </span>
                            {evt.blightType && evt.blightType !== 'none' && (
                              <span className="text-[10px] text-[#E53935] font-mono mt-0.5">
                                {evt.blightType === 'late_blight' ? 'Late Blight' : 'Early Blight'} • {evt.severity || 'mild'}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5">
                          <div className="flex flex-col">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold w-fit bg-[#F8F9F4] text-[#263238] border border-[#D8E3D6]">
                              {evt.size === 'small' ? 'Small' : evt.size === 'large' ? 'Large' : 'Medium'}
                            </span>
                            <span className="text-[10px] text-[#607D8B] font-mono mt-0.5">
                              ~{((evt.diameterMm || 65) / 10).toFixed(1)} cm
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5">
                          <span className={`font-semibold ${evt.confidence >= 95 ? 'text-[#2E7D32]' : 'text-[#E65100]'}`}>
                            {evt.confidence}%
                          </span>
                        </td>
                        <td className="py-2.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-[#F8F9F4] text-[#263238] border border-[#D8E3D6]">
                            {grade}
                          </span>
                        </td>
                        <td className="py-2.5">
                          {action === 'ACCEPT' ? (
                            <span className="inline-flex items-center gap-1 font-bold text-[#2E7D32] bg-[#E8F3E5] px-2 py-0.5 rounded-md border border-[#D8E3D6]">
                              <CheckCircle2 className="h-3 w-3" /> ACCEPT
                            </span>
                          ) : action === 'REJECT_QUARANTINE' ? (
                            <span className="inline-flex items-center gap-1 font-bold text-[#E53935] bg-[#FDECEC] px-2 py-0.5 rounded-md border border-[#E53935]/30">
                              <ShieldAlert className="h-3 w-3" /> REJECT
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-bold text-[#E65100] bg-[#FFF3E0] px-2 py-0.5 rounded-md border border-[#FFE0B2]">
                              <AlertTriangle className="h-3 w-3" /> REVIEW
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Col: Conveyor Quality Summary */}
        <div className="space-y-4">
          <div className="rounded-xl border border-[#D8E3D6] bg-white p-5 shadow-xs transition-colors agri-card-shadow">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#174C35]">
                Automated Sorter Routing
              </h3>
              <span className="text-[10px] font-mono text-[#607D8B]">95% Criteria</span>
            </div>
            
            {/* Tally Metrics */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="p-2.5 rounded-lg bg-[#E8F3E5] border border-[#D8E3D6] text-center">
                <div className="text-[10px] font-bold uppercase text-[#2E7D32]">Accepted</div>
                <div className="text-base font-bold text-[#174C35]">
                  {counts.accepted ?? (counts.ripe + counts.unripe)}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#FDECEC] border border-[#E53935]/30 text-center">
                <div className="text-[10px] font-bold uppercase text-[#E53935]">Quarantine</div>
                <div className="text-base font-bold text-[#E53935]">
                  {counts.rejected ?? counts.blight}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#F8F9F4] border border-[#D8E3D6] text-center">
                <div className="text-[10px] font-bold uppercase text-[#607D8B]">Manual</div>
                <div className="text-base font-bold text-[#263238]">
                  {counts.manualReview ?? 0}
                </div>
              </div>
            </div>

            {/* Quality Grade breakdown */}
            <h4 className="text-xs font-bold text-[#174C35] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <Award className="h-3.5 w-3.5 text-[#2E7D32]" />
              <span>Commercial Grade Breakdown</span>
            </h4>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#607D8B] flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#2E7D32]" />
                  <span>Grade A (Market)</span>
                </span>
                <span className="font-mono font-bold text-[#263238]">
                  {counts.gradeA ?? counts.ripe} ({counts.total > 0 ? Math.round(((counts.gradeA ?? counts.ripe) / counts.total) * 100) : 0}%)
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#607D8B] flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#81C784]" />
                  <span>Grade B (Processing)</span>
                </span>
                <span className="font-mono font-bold text-[#263238]">
                  {counts.gradeB ?? counts.unripe} ({counts.total > 0 ? Math.round(((counts.gradeB ?? counts.unripe) / counts.total) * 100) : 0}%)
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[#607D8B] flex items-center space-x-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#E53935]" />
                  <span>Grade C (Culled)</span>
                </span>
                <span className="font-mono font-bold text-[#E53935]">
                  {counts.gradeC ?? counts.blight} ({counts.total > 0 ? Math.round(((counts.gradeC ?? counts.blight) / counts.total) * 100) : 0}%)
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#D8E3D6] flex items-center justify-between">
              <button
                onClick={() => onNavigate('yield-monitoring')}
                className="flex items-center space-x-1.5 text-xs font-semibold text-[#2E7D32] hover:underline cursor-pointer"
              >
                <span>View Analytics</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

