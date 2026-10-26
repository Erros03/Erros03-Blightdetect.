/**
 * Dashboard Route - BlightDetect+ Agricultural AI Dashboard
 * Clean, professional agricultural design system
 */
import React from 'react';
import {
  Camera,
  ShieldAlert,
  CheckCircle2,
  Activity,
  History,
  ArrowRight,
  AlertTriangle,
  Package,
  Leaf,
  Layers,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import type {
  TomatoSessionCounts,
  TomatoDetectionEvent,
  CameraStatus,
  DetectionSession,
} from '../types.ts';
import { useDashboardData } from '../hooks/useDashboardData.ts';
import { BrandLogo } from '../components/BrandLogo.tsx';


interface DashboardRouteProps {
  currentCounts: TomatoSessionCounts;
  liveEvents: TomatoDetectionEvent[];
  cameraStatus: CameraStatus;
  session: DetectionSession | null;
  onNavigate: (route: string) => void;
  onStartLiveSession: () => void;
  onOpenThesisCompliance?: () => void;
}

export const DashboardRoute: React.FC<DashboardRouteProps> = ({
  currentCounts,
  liveEvents,
  cameraStatus,
  session,
  onNavigate,
  onStartLiveSession,
  onOpenThesisCompliance,
}) => {
  const { metrics, historicalSessions, recentDetections } = useDashboardData(
    currentCounts,
    liveEvents
  );

  const ripePercent =
    currentCounts.total > 0
      ? Math.round((currentCounts.ripe / currentCounts.total) * 100)
      : 0;

  const unripePercent =
    currentCounts.total > 0
      ? Math.round((currentCounts.unripe / currentCounts.total) * 100)
      : 0;

  // SVG Circular progress params
  const circleRadius = 18;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (ripePercent / 100) * circumference;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* 3. Dashboard Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-[#D8E3D6] p-6 sm:p-8 shadow-xs agri-card-shadow">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start space-x-4 max-w-2xl">
            <BrandLogo size="lg" className="hidden sm:flex mt-1 shrink-0" />
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 rounded-lg bg-[#E8F3E5] px-3 py-1 text-xs font-semibold text-[#2E7D32] border border-[#D8E3D6]">
                <span className="h-2 w-2 rounded-full bg-[#2E7D32] animate-pulse"></span>
                <span>Autonomous Vision Stream Active</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-[#174C35] sm:text-4xl font-sans">
                BlightDetect<span className="text-[#E53935] font-black">+</span>
              </h1>
              <p className="text-sm text-[#607D8B] leading-relaxed">
                Real-time tomato ripening classification, automated conveyor tracking, and early blight disease detection powered by continuous YOLOv11 computer vision.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="btn-dash-open-camera"
              onClick={() => {
                onStartLiveSession();
                onNavigate('live-stream');
              }}
              className="flex items-center space-x-2 rounded-lg bg-[#E53935] hover:bg-[#C62828] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all cursor-pointer"
            >
              <Camera className="h-4 w-4" />
              <span>Launch Live Camera</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              id="btn-dash-view-history"
              onClick={() => onNavigate('history')}
              className="flex items-center space-x-2 rounded-lg bg-white hover:bg-[#F8F9F4] px-4 py-2.5 text-sm font-medium text-[#263238] border border-[#D8E3D6] transition-all cursor-pointer"
            >
              <History className="h-4 w-4 text-[#607D8B]" />
              <span>Past Sessions ({historicalSessions.length})</span>
            </button>


          </div>
        </div>

        {/* Subtle decorative leaf watermark in background */}
        <div className="absolute -bottom-8 -right-8 pointer-events-none opacity-5 text-[#174C35]">
          <svg width="220" height="220" viewBox="0 0 100 100" fill="currentColor">
            <path d="M50 0 C65 25 90 35 100 50 C90 65 65 75 50 100 C35 75 10 65 0 50 C10 35 35 25 50 0 Z" />
          </svg>
        </div>
      </div>

      {/* 4. Blight Detection Warning Banner */}
      {metrics.blightRatePercent > 10 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#E53935]/40 bg-[#FDECEC] p-4 text-[#263238] shadow-xs">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="rounded-lg bg-[#E53935]/15 p-2 text-[#E53935] shrink-0">
              <AlertTriangle className="h-5 w-5 text-[#E53935]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#C62828]">
                Elevated Blight Infection Rate Warning
              </h4>
              <p className="text-xs text-[#607D8B] mt-0.5">
                Current session blight rate is <strong className="text-[#C62828] font-bold">{metrics.blightRatePercent}%</strong> (Threshold: 10%). Immediate culling recommended.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('live-stream')}
            className="rounded-lg bg-[#E53935] hover:bg-[#C62828] px-4 py-2 text-xs font-semibold text-white transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            Inspect Feed
          </button>
        </div>
      )}

      {/* 5. Active Detection Session Metrics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2E7D32] opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#2E7D32]"></span>
            </span>
            <Activity className="h-4 w-4 text-[#2E7D32]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#174C35]">
              ACTIVE DETECTION SESSION METRICS
            </h2>
          </div>
          {session ? (
            <span className="text-xs text-[#607D8B] font-mono bg-white px-2.5 py-1 rounded-lg border border-[#D8E3D6]">
              Session: {session.id.substring(0, 14)}...
            </span>
          ) : (
            <span className="text-xs text-[#607D8B]">Standby</span>
          )}
        </div>

        {/* Responsive Grid of Metric Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Card 1: Session Total */}
          <div className="rounded-xl border border-[#D8E3D6] bg-white p-5 shadow-xs agri-card-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#607D8B]">
                SESSION TOTAL
              </span>
              <div className="flex items-center space-x-1.5">
                <span className="rounded-md bg-[#F8F9F4] px-1.5 py-0.5 text-[#263238] font-mono text-[10px] font-bold border border-[#D8E3D6]">
                  ALL
                </span>
                <div className="rounded-lg bg-[#F8F9F4] p-1.5 text-[#607D8B]">
                  <Package className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#263238] tracking-tight">
                {currentCounts.total}
              </span>
              <span className="text-xs text-[#607D8B]">unique tomatoes</span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#D8E3D6]/60 text-xs text-[#607D8B] flex items-center justify-between">
              <span>Status:</span>
              <span className={`font-semibold ${cameraStatus === 'live' ? 'text-[#2E7D32]' : 'text-[#607D8B]'}`}>
                {cameraStatus === 'live' ? 'Scanning live' : 'Standby'}
              </span>
            </div>
          </div>

          {/* Card 2: Ripe / Grade A */}
          <div className="rounded-xl border border-[#D8E3D6] bg-white p-5 shadow-xs agri-card-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32]">
                RIPE / GRADE A
              </span>
              <div className="rounded-lg bg-[#E8F3E5] p-1.5 text-[#2E7D32]">
                <Leaf className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#2E7D32] tracking-tight">
                {currentCounts.ripe}
              </span>

              {/* Green Circular Progress Indicator */}
              <div className="relative flex items-center justify-center">
                <svg className="w-11 h-11 transform -rotate-90">
                  <circle
                    cx="22"
                    cy="22"
                    r={circleRadius}
                    stroke="#E8F3E5"
                    strokeWidth="3.5"
                    fill="transparent"
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r={circleRadius}
                    stroke="#2E7D32"
                    strokeWidth="3.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-[#2E7D32]">
                  {ripePercent}%
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#D8E3D6]/60 text-xs text-[#2E7D32] flex items-center space-x-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Passed to packaging</span>
            </div>
          </div>

          {/* Card 3: Unripe / Green */}
          <div className="rounded-xl border border-[#D8E3D6] bg-white p-5 shadow-xs agri-card-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#607D8B]">
                UNRIPE / GREEN
              </span>
              <span className="h-3 w-3 rounded-full bg-[#A5D6A7] block border border-[#81C784]"></span>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#263238] tracking-tight">
                {currentCounts.unripe}
              </span>
              <span className="text-xs font-bold text-[#607D8B]">
                {unripePercent}%
              </span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#D8E3D6]/60 text-xs text-[#607D8B]">
              Diverted to ripening room
            </div>
          </div>

          {/* Card 4: Blight Detected */}
          <div className="rounded-xl border border-[#D8E3D6] bg-white p-5 shadow-xs agri-card-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E53935]">
                BLIGHT DETECTED
              </span>
              <div className="rounded-lg bg-[#FDECEC] p-1.5 text-[#E53935]">
                <ShieldAlert className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#E53935] tracking-tight">
                {currentCounts.blight}
              </span>
              <span className="text-xs font-bold text-[#E53935] bg-[#FDECEC] px-2 py-0.5 rounded-full border border-[#E53935]/20">
                {metrics.blightRatePercent}%
              </span>
            </div>
            <div className="mt-3 pt-2.5 border-t border-[#D8E3D6]/60 text-xs text-[#E53935]">
              Auto-culled from conveyor
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Detection Stream Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-[#D8E3D6] bg-white p-5 shadow-xs agri-card-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#174C35] tracking-tight">
                  Recent Unique Tomato Detections
                </h3>
                <p className="text-xs text-[#607D8B] mt-0.5">
                  Centroid-tracked unique items with bounding-box metrics
                </p>
              </div>
              <button
                onClick={() => onNavigate('live-stream')}
                className="text-xs font-semibold text-[#2E7D32] hover:underline flex items-center space-x-1 cursor-pointer"
              >
                <span>Live Feed</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {recentDetections.length === 0 ? (
              <div className="py-10 text-center text-[#607D8B] text-xs">
                No detection events logged in current session. Launch the camera to begin.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#D8E3D6] text-[#607D8B]">
                      <th className="pb-2.5 font-semibold">Time</th>
                      <th className="pb-2.5 font-semibold">Track ID</th>
                      <th className="pb-2.5 font-semibold">Class</th>
                      <th className="pb-2.5 font-semibold">Confidence</th>
                      <th className="pb-2.5 font-semibold">Est. Size</th>
                      <th className="pb-2.5 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8E3D6]/50">
                    {recentDetections.slice(0, 6).map((evt) => (
                      <tr key={evt.id} className="hover:bg-[#F8F9F4] transition-colors">
                        <td className="py-2.5 font-mono text-[#607D8B]">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2.5 font-mono font-bold text-[#263238]">
                          #TRK-{evt.trackId}
                        </td>
                        <td className="py-2.5">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[11px] font-semibold border ${
                              evt.ripeness === 'ripe'
                                ? 'bg-[#E8F3E5] text-[#2E7D32] border-[#D8E3D6]'
                                : evt.ripeness === 'unripe'
                                ? 'bg-[#F8F9F4] text-[#607D8B] border-[#D8E3D6]'
                                : 'bg-[#FDECEC] text-[#E53935] border-[#E53935]/30'
                            }`}
                          >
                            {evt.class}
                          </span>
                        </td>
                        <td className="py-2.5 font-semibold text-[#263238]">{evt.confidence}%</td>
                        <td className="py-2.5">
                          <div className="flex items-center space-x-1.5">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#F8F9F4] text-[#263238] border border-[#D8E3D6]">
                              {evt.size === 'small' ? 'Small' : evt.size === 'large' ? 'Large' : 'Medium'}
                            </span>
                            <span className="text-[10px] text-[#607D8B] font-mono">
                              ~{((evt.diameterMm || 65) / 10).toFixed(1)} cm
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5">
                          {evt.ripeness === 'blight' ? (
                            <span className="text-[#E53935] font-bold inline-flex items-center gap-1">
                              <ShieldAlert className="h-3 w-3" /> Cull
                            </span>
                          ) : (
                            <span className="text-[#2E7D32] font-bold inline-flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Accept
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Historical Sessions */}
        <div className="space-y-6">
          <div className="rounded-xl border border-[#D8E3D6] bg-white p-5 shadow-xs agri-card-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <History className="h-4 w-4 text-[#2E7D32]" />
                <h3 className="text-sm font-bold text-[#174C35] tracking-tight">
                  Completed Sessions History
                </h3>
              </div>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-semibold text-[#2E7D32] hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            {historicalSessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#607D8B]">
                No completed sessions stored yet.
              </div>
            ) : (
              <div className="space-y-3">
                {historicalSessions.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-lg bg-[#F8F9F4] border border-[#D8E3D6] text-xs space-y-1.5 hover:border-[#2E7D32]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#263238]">{s.date}</span>
                      <span className="font-mono text-[#607D8B] text-[11px]">{s.startTime} - {s.endTime || 'Ended'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#607D8B] text-[11px]">
                      <span>Total: <strong className="text-[#263238]">{s.totalCount}</strong></span>
                      <span className="text-[#2E7D32] font-semibold">{s.ripeCount} Ripe</span>
                      <span className="text-[#607D8B]">{s.unripeCount} Unripe</span>
                      <span className="text-[#E53935] font-semibold">{s.blightCount} Blight</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
