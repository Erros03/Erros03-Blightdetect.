/**
 * BlightDetect+ Tomato Vision Stream Main Application
 */
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { DashboardRoute } from './routes/index.tsx';
import { LiveStreamRoute } from './routes/live-stream.tsx';
import { HistoryRoute } from './routes/history.tsx';
import { YieldMonitoringRoute } from './routes/yield-monitoring.tsx';
import { FirebaseDatabaseModal } from './components/FirebaseDatabaseModal.tsx';
import { ThesisComplianceModal } from './components/ThesisComplianceModal.tsx';
import { useDetectionSession } from './hooks/useDetectionSession.ts';
import { ThemeProvider } from './context/ThemeContext.tsx';
import type { CameraStatus } from './types.ts';

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState<string>('dashboard');
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('off');
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState<boolean>(false);
  const [isThesisModalOpen, setIsThesisModalOpen] = useState<boolean>(false);

  const {
    session,
    counts,
    recentEvents,
    startNewSession,
    recordUniqueTomato,
    endSession,
  } = useDetectionSession();

  // Sync route with URL Hash if present
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (['dashboard', 'live-stream', 'yield-monitoring', 'history'].includes(hash)) {
        setCurrentRoute(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
    window.location.hash = route;
    // Auto-scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // If navigating to live-stream and not yet started, create session
    if (route === 'live-stream' && !session) {
      startNewSession();
    }
  };

  // Start new session when camera starts
  const handleStartCamera = () => {
    startNewSession();
  };

  const handleStopCamera = () => {
    endSession();
  };

  return (
    <div className="min-h-screen bg-[#F8F9F4] text-[#263238] flex flex-col font-sans selection:bg-[#E53935] selection:text-white">
      {/* Navigation Header */}
      <Navbar
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        cameraStatus={cameraStatus}
        sessionCounts={counts}
        onOpenThesisCompliance={() => setIsThesisModalOpen(true)}
      />

      {/* Main Content View Container */}
      <main className="flex-1 pb-16">
        {currentRoute === 'dashboard' && (
          <DashboardRoute
            currentCounts={counts}
            liveEvents={recentEvents}
            cameraStatus={cameraStatus}
            session={session}
            onNavigate={handleNavigate}
            onStartLiveSession={startNewSession}
            onOpenThesisCompliance={() => setIsThesisModalOpen(true)}
          />
        )}

        {currentRoute === 'live-stream' && (
          <LiveStreamRoute
            session={session}
            counts={counts}
            recentEvents={recentEvents}
            cameraStatus={cameraStatus}
            setCameraStatus={setCameraStatus}
            onTomatoCounted={recordUniqueTomato}
            onStopCamera={handleStopCamera}
            onStartCamera={handleStartCamera}
            onNavigate={handleNavigate}
          />
        )}

        {currentRoute === 'yield-monitoring' && (
          <YieldMonitoringRoute
            currentCounts={counts}
            liveEvents={recentEvents}
          />
        )}

        {currentRoute === 'history' && <HistoryRoute />}
      </main>

      {/* Thesis Writing 2 Completion Form & Panel Evaluation Modal */}
      <ThesisComplianceModal
        isOpen={isThesisModalOpen}
        onClose={() => setIsThesisModalOpen(false)}
      />

      {/* Firebase Realtime Database Inspector Modal */}
      <FirebaseDatabaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-[#D8E3D6] bg-white py-6 text-center text-xs text-[#607D8B]">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#174C35]">BlightDetect<span className="text-[#E53935]">+</span></span>
            <span>• Tomato Vision Stream & Conveyor Sorter</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-[#607D8B]">
            <span>Centroid Multi-Object Tracker</span>
            <span>•</span>
            <span>YOLOv11 Inference Engine</span>
            <span>•</span>
            <span>Firestore History Storage</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

