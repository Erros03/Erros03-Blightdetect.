/**
 * Navbar component for BlightDetect+ Agricultural AI Dashboard
 * Forest Green #174C35 navigation bar with Light Sage #E8F3E5 active states
 */
import React from 'react';
import {
  Camera,
  LayoutDashboard,
  History,
  BarChart3,
  Activity,
} from 'lucide-react';
import type { CameraStatus, TomatoSessionCounts } from '../types.ts';
import { BrandLogo } from './BrandLogo.tsx';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  cameraStatus: CameraStatus;
  sessionCounts: TomatoSessionCounts;
  onOpenThesisCompliance?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  cameraStatus,
  onOpenThesisCompliance,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#174C35] border-b border-[#0F3323] text-white shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand identity */}
        <div 
          className="flex cursor-pointer items-center space-x-3 select-none" 
          onClick={() => onNavigate('dashboard')}
          id="brand-logo-btn"
        >
          <BrandLogo size="md" />
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-base sm:text-lg font-bold tracking-tight text-white font-sans">
                BlightDetect<span className="text-[#E53935] font-black">+</span>
              </span>
            </div>
            <p className="text-[11px] text-[#D8E3D6] font-medium leading-tight">
              Tomato Sorting & Blight Detection
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 rounded-xl bg-[#0F3323]/50 p-1 border border-white/10">
          <button
            id="nav-dashboard-tab"
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              currentRoute === 'dashboard'
                ? 'bg-[#E8F3E5] text-[#174C35] shadow-xs'
                : 'text-[#D8E3D6] hover:text-white hover:bg-white/10'
            }`}
          >
            <LayoutDashboard className={`h-3.5 w-3.5 ${currentRoute === 'dashboard' ? 'text-[#174C35]' : 'text-[#D8E3D6]'}`} />
            <span>Dashboard</span>
          </button>

          <button
            id="nav-live-tab"
            onClick={() => onNavigate('live-stream')}
            className={`relative flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              currentRoute === 'live-stream'
                ? 'bg-[#E8F3E5] text-[#174C35] shadow-xs'
                : 'text-[#D8E3D6] hover:text-white hover:bg-white/10'
            }`}
          >
            <Camera className={`h-3.5 w-3.5 ${currentRoute === 'live-stream' ? 'text-[#174C35]' : 'text-[#D8E3D6]'}`} />
            <span>Live Stream</span>
            {cameraStatus === 'live' && (
              <span className="relative flex h-2 w-2 ml-0.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2E7D32] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2E7D32]"></span>
              </span>
            )}
          </button>

          <button
            id="nav-yield-tab"
            onClick={() => onNavigate('yield-monitoring')}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              currentRoute === 'yield-monitoring'
                ? 'bg-[#E8F3E5] text-[#174C35] shadow-xs'
                : 'text-[#D8E3D6] hover:text-white hover:bg-white/10'
            }`}
          >
            <BarChart3 className={`h-3.5 w-3.5 ${currentRoute === 'yield-monitoring' ? 'text-[#174C35]' : 'text-[#D8E3D6]'}`} />
            <span>Yield Monitoring</span>
          </button>

          <button
            id="nav-history-tab"
            onClick={() => onNavigate('history')}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              currentRoute === 'history'
                ? 'bg-[#E8F3E5] text-[#174C35] shadow-xs'
                : 'text-[#D8E3D6] hover:text-white hover:bg-white/10'
            }`}
          >
            <History className={`h-3.5 w-3.5 ${currentRoute === 'history' ? 'text-[#174C35]' : 'text-[#D8E3D6]'}`} />
            <span>History</span>
          </button>
        </nav>

        {/* Right System Status Badge */}
        <div className="flex items-center space-x-3">
          {cameraStatus === 'live' ? (
            <div className="flex items-center space-x-2 rounded-lg bg-[#2E7D32]/35 px-3 py-1.5 border border-[#4CAF50]/40 text-xs font-semibold text-white shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4CAF50] opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#4CAF50]"></span>
              </span>
              <span className="tracking-wide">STREAMING</span>
            </div>
          ) : cameraStatus === 'requesting' ? (
            <div className="flex items-center space-x-2 rounded-lg bg-[#E53935]/25 px-3 py-1.5 border border-[#E53935]/40 text-xs font-semibold text-white">
              <Activity className="h-3.5 w-3.5 animate-spin text-[#E8F3E5]" />
              <span className="tracking-wide">CONNECTING</span>
            </div>
          ) : cameraStatus === 'blocked' ? (
            <div className="flex items-center space-x-2 rounded-lg bg-[#C62828]/40 px-3 py-1.5 border border-[#E53935]/50 text-xs font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-[#E53935]"></span>
              <span className="tracking-wide">BLOCKED</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 rounded-lg bg-[#0F3323]/60 px-3 py-1.5 border border-white/15 text-xs font-semibold text-[#D8E3D6]">
              <span className="h-2 w-2 rounded-full bg-[#D8E3D6]/70"></span>
              <span className="tracking-wide">STANDBY</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="flex md:hidden border-t border-[#0F3323] bg-[#123E2B] px-2 py-1.5 justify-around text-xs">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
            currentRoute === 'dashboard' ? 'bg-[#E8F3E5] text-[#174C35] font-bold' : 'text-[#D8E3D6]'
          }`}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Dashboard</span>
        </button>
        <button
          onClick={() => onNavigate('live-stream')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
            currentRoute === 'live-stream' ? 'bg-[#E8F3E5] text-[#174C35] font-bold' : 'text-[#D8E3D6]'
          }`}
        >
          <Camera className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Live Stream</span>
        </button>
        <button
          onClick={() => onNavigate('yield-monitoring')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
            currentRoute === 'yield-monitoring' ? 'bg-[#E8F3E5] text-[#174C35] font-bold' : 'text-[#D8E3D6]'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">Yield</span>
        </button>
        <button
          onClick={() => onNavigate('history')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg transition-colors ${
            currentRoute === 'history' ? 'bg-[#E8F3E5] text-[#174C35] font-bold' : 'text-[#D8E3D6]'
          }`}
        >
          <History className="h-4 w-4" />
          <span className="text-[10px] mt-0.5">History</span>
        </button>
      </div>
    </header>
  );
};
