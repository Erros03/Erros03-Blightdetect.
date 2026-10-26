import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Plus,
  Radio,
  ChevronDown,
  ChevronRight,
  X,
  Server,
  Activity,
  Layers,
  Wrench,
  Tag,
} from 'lucide-react';
import {
  FIREBASE_RTDB_CONFIG,
  fetchRecentFirebaseDetections,
  sendDetectionToFirebaseRtdb,
  testFirebaseRtdbConnection,
  fixAllMissingFirebaseIds,
  type FirebaseRtdbRecord,
} from '../lib/firebase-rtdb.ts';

interface FirebaseDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseDatabaseModal: React.FC<FirebaseDatabaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [records, setRecords] = useState<FirebaseRtdbRecord[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [isFixingIds, setIsFixingIds] = useState<boolean>(false);
  const [idFormat, setIdFormat] = useState<'structured' | 'push'>('structured');
  const [lastTestResult, setLastTestResult] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<'console' | 'table'>('console');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [conn, recent] = await Promise.all([
        testFirebaseRtdbConnection(),
        fetchRecentFirebaseDetections(25),
      ]);

      setIsConnected(conn.connected);
      setLatencyMs(conn.latencyMs);
      setTotalCount(conn.itemCount);

      if (recent.success && recent.records.length > 0) {
        setRecords(recent.records);
        // Default expand first 3 records in console tree
        const defaultExpanded: Record<string, boolean> = { root: true };
        recent.records.slice(0, 3).forEach((r) => {
          if (r.id) defaultExpanded[r.id] = true;
        });
        setExpandedNodes((prev) => ({ ...defaultExpanded, ...prev }));
      }
    } catch (err) {
      console.error('Error loading Firebase DB data:', err);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  if (!isOpen) return null;

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleSendTest = async (ripeness: 'Ripe' | 'Blight') => {
    setIsSendingTest(true);
    setLastTestResult(null);

    const isHealthy = ripeness === 'Ripe';
    const testRecord: FirebaseRtdbRecord = {
      action: isHealthy ? 'Accepted' : 'Rejected',
      confidence: Math.floor(Math.random() * 8) + 91,
      diameterMm: Math.floor(Math.random() * 20) + 52,
      label: isHealthy ? 'Healthy' : 'Defective',
      ripeness,
      size: 'Medium',
      className: isHealthy ? 'ripe_tomato' : 'blighted_tomato',
      timestamp: Date.now(),
      createdAt: Date.now(),
    };

    const res = await sendDetectionToFirebaseRtdb(
      testRecord,
      undefined,
      idFormat === 'structured'
    );
    setIsSendingTest(false);

    if (res.success) {
      setLastTestResult(`Record saved to Firebase! ID: ${res.id}`);
      // Refresh list to show newly pushed record
      await loadData();
    } else {
      setLastTestResult(`Write failed: ${res.error}`);
    }
  };

  const handleFixDatabaseIds = async () => {
    setIsFixingIds(true);
    setLastTestResult(null);
    try {
      const result = await fixAllMissingFirebaseIds();
      setLastTestResult(
        `Database audit complete: ${result.scanned} records scanned, ${result.fixed} missing IDs patched! All records now have matching keys.`
      );
      await loadData();
    } catch (e: any) {
      setLastTestResult(`Error auditing IDs: ${e?.message || 'Failed'}`);
    } finally {
      setIsFixingIds(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-xl bg-[var(--linen-surface)] border border-[var(--sand)] shadow-2xl text-[var(--bark)] overflow-hidden my-8">
        {/* Header matching Firebase Realtime Database banner */}
        <div className="flex items-center justify-between border-b border-[var(--sand)] bg-[var(--linen)] px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-[var(--terracotta)]/15 p-2 text-[var(--terracotta)] border border-[var(--terracotta)]/30">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-[var(--bark)] tracking-tight font-serif">
                  Firebase Realtime Database
                </h2>
                <span className="rounded-full bg-[var(--sage-light)] border border-[var(--sage)] px-2 py-0.5 text-[10px] font-bold text-[var(--olive-dark)] uppercase tracking-wider flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--olive)] animate-pulse"></span>
                  Live Connected
                </span>
              </div>
              <p className="text-xs text-[var(--bark-muted)] font-mono mt-0.5 truncate max-w-md">
                {FIREBASE_RTDB_CONFIG.databaseUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <a
              href="https://console.firebase.google.com/u/0/project/blightdetect-4b3a6/database/blightdetect-4b3a6-default-rtdb/data/~2F"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 rounded-lg bg-[var(--linen-surface)] hover:bg-[var(--sand)] px-3 py-1.5 text-xs font-semibold text-[var(--bark)] transition-colors border border-[var(--sand)] cursor-pointer"
            >
              <span>Firebase Console</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--bark-muted)] hover:text-[var(--bark)] hover:bg-[var(--sand)]/50 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[var(--linen)]/60 border-b border-[var(--sand)] px-6 py-3 text-xs">
          <div className="flex items-center space-x-2">
            <Server className="h-3.5 w-3.5 text-[var(--bark-muted)]" />
            <span className="text-[var(--bark-muted)]">Project:</span>
            <span className="font-semibold text-[var(--bark)] font-mono">{FIREBASE_RTDB_CONFIG.projectId}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Layers className="h-3.5 w-3.5 text-[var(--bark-muted)]" />
            <span className="text-[var(--bark-muted)]">Total Records:</span>
            <span className="font-semibold text-[var(--olive)] font-mono">{totalCount} items</span>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-3.5 w-3.5 text-[var(--bark-muted)]" />
            <span className="text-[var(--bark-muted)]">Latency:</span>
            <span className="font-semibold text-[var(--bark)] font-mono">{latencyMs}ms</span>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="flex items-center space-x-1 rounded-lg bg-[var(--linen-surface)] hover:bg-[var(--sand)] border border-[var(--sand)] px-2.5 py-1 text-[11px] font-semibold text-[var(--bark)] transition-colors cursor-pointer"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-[var(--linen)]/40 border-b border-[var(--sand)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[var(--bark-muted)]">Quick Test Write:</span>
            <button
              onClick={() => handleSendTest('Ripe')}
              disabled={isSendingTest}
              className="flex items-center space-x-1 rounded-lg bg-olive hover:bg-olive-dark disabled:opacity-50 px-2.5 py-1 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>+ Push Ripe (Accepted)</span>
            </button>
            <button
              onClick={() => handleSendTest('Blight')}
              disabled={isSendingTest}
              className="flex items-center space-x-1 rounded-lg bg-tomato hover:bg-tomato-hover disabled:opacity-50 px-2.5 py-1 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="h-3 w-3" />
              <span>+ Push Blight (Rejected)</span>
            </button>
            
            {/* Audit / Fix Database IDs Button */}
            <button
              onClick={handleFixDatabaseIds}
              disabled={isFixingIds}
              className="flex items-center space-x-1 rounded-lg bg-[var(--linen-surface)] hover:bg-[var(--sage)]/30 border border-[var(--sand)] px-2.5 py-1 text-xs font-semibold text-[var(--bark)] transition-colors cursor-pointer"
              title="Ensures every single item in the Firebase Realtime Database has an 'id' property matching its key"
            >
              <Wrench className={`h-3 w-3 ${isFixingIds ? 'animate-spin' : ''}`} />
              <span>{isFixingIds ? 'Fixing IDs...' : 'Audit & Fix Database IDs'}</span>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            {/* ID Scheme Selector */}
            <div className="flex items-center space-x-1 text-xs bg-[var(--linen-surface)] border border-[var(--sand)] rounded-lg p-1">
              <span className="text-[11px] text-[var(--bark-muted)] px-1 flex items-center gap-1">
                <Tag className="h-3 w-3 text-[var(--terracotta)]" />
                ID:
              </span>
              <button
                onClick={() => setIdFormat('structured')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  idFormat === 'structured'
                    ? 'bg-olive text-white shadow-xs'
                    : 'text-[var(--bark-muted)] hover:text-[var(--bark)]'
                }`}
                title="Format: -O1Healthy01, -O2Healthy02 (Clean sequential pattern matching your console)"
              >
                -O1Healthy01
              </button>
              <button
                onClick={() => setIdFormat('push')}
                className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                  idFormat === 'push'
                    ? 'bg-olive text-white shadow-xs'
                    : 'text-[var(--bark-muted)] hover:text-[var(--bark)]'
                }`}
                title="Standard Firebase Push ID format (-P0...)"
              >
                Push ID
              </button>
            </div>

            <div className="flex items-center space-x-1 rounded-lg bg-[var(--linen-surface)] p-0.5 border border-[var(--sand)]">
              <button
                onClick={() => setViewMode('console')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'console'
                    ? 'bg-olive text-white shadow-xs'
                    : 'text-[var(--bark-muted)] hover:text-[var(--bark)]'
                }`}
              >
                Console Tree View
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-olive text-white shadow-xs'
                    : 'text-[var(--bark-muted)] hover:text-[var(--bark)]'
                }`}
              >
                Table View
              </button>
            </div>
          </div>
        </div>

        {lastTestResult && (
          <div className="bg-[var(--sage-light)]/60 border-b border-[var(--sage)] px-6 py-2 text-xs text-[var(--olive-dark)] flex items-center space-x-2 font-mono">
            <CheckCircle2 className="h-3.5 w-3.5 text-[var(--olive)] shrink-0" />
            <span>{lastTestResult}</span>
          </div>
        )}

        {/* Database Content Area */}
        <div className="p-6 max-h-[500px] overflow-y-auto font-mono text-xs">
          {viewMode === 'console' ? (
            /* Firebase Console Tree View replica */
            <div className="rounded-xl border border-[var(--sand)] bg-[var(--bark)] text-[var(--linen)] p-4 font-mono text-xs shadow-inner">
              {/* Root URL Node */}
              <div className="flex items-center space-x-1.5 text-[var(--sand)] select-none pb-1">
                <span>https://blightdetect-4b3a6-default-rtdb.firebaseio.com/</span>
              </div>

              {/* detections/ path */}
              <div className="ml-3 pl-2 border-l border-[var(--bark-muted)] my-1">
                <div
                  onClick={() => toggleNode('root')}
                  className="flex items-center space-x-1 text-[var(--sage-light)] hover:text-white cursor-pointer py-1 select-none font-bold"
                >
                  {expandedNodes['root'] ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                  <span>detections</span>
                  <span className="text-[10px] text-[var(--sand)] font-normal">
                    ({records.length} recent shown of {totalCount})
                  </span>
                </div>

                {expandedNodes['root'] && (
                  <div className="ml-4 space-y-1.5 border-l border-[var(--bark-muted)]/60 pl-3 pt-1">
                    {records.map((rec) => {
                      const isExpanded = Boolean(expandedNodes[rec.id || '']);
                      return (
                        <div key={rec.id} className="py-0.5">
                          <div
                            onClick={() => rec.id && toggleNode(rec.id)}
                            className="flex items-center space-x-1.5 text-[var(--linen)] hover:text-white cursor-pointer select-none"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3 text-[var(--sand)]" />
                            ) : (
                              <ChevronRight className="h-3 w-3 text-[var(--sand)]" />
                            )}
                            <span className="text-[var(--sage-light)] font-bold">{rec.id}</span>
                            <span
                              className={`ml-2 text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                rec.action === 'Rejected' || rec.ripeness === 'Blight'
                                  ? 'bg-[var(--tomato)]/30 text-[var(--tomato)] border border-[var(--tomato)]/50'
                                  : 'bg-[var(--olive)]/30 text-[var(--sage-light)] border border-[var(--olive)]/50'
                              }`}
                            >
                              {rec.action || (rec.ripeness === 'Blight' ? 'Rejected' : 'Accepted')}
                            </span>
                            <span className="text-[var(--sand)] text-[11px]">
                              {rec.ripeness} • {rec.confidence}%
                            </span>
                          </div>

                          {isExpanded && (
                            <div className="ml-6 mt-1 space-y-1 border-l border-[var(--bark-muted)] pl-3 py-1 bg-black/25 rounded-r-md">
                              <div className="flex items-center space-x-2">
                                <span className="text-[var(--sand)]">id:</span>
                                <span className="text-[var(--sage-light)] font-bold">"{rec.id}"</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[var(--sand)]">action:</span>
                                <span className={rec.action === 'Rejected' ? 'text-[var(--tomato)]' : 'text-[var(--sage-light)]'}>
                                  "{rec.action}"
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[var(--sand)]">confidence:</span>
                                <span className="text-[var(--terracotta)]">{rec.confidence}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[var(--sand)]">diameterMm:</span>
                                <span className="text-[var(--sage-light)]">{rec.diameterMm || 60}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[var(--sand)]">label:</span>
                                <span className="text-[var(--sage-light)]">"{rec.label || 'Healthy'}"</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[var(--sand)]">ripeness:</span>
                                <span className={rec.ripeness === 'Blight' ? 'text-[var(--tomato)] font-bold' : 'text-[var(--linen)]'}>
                                  "{rec.ripeness}"
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[var(--sand)]">size:</span>
                                <span className="text-[var(--linen)]">"{rec.size || 'Medium'}"</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="text-[var(--sand)]">timestamp:</span>
                                <span className="text-[var(--sand)]">{rec.timestamp}</span>
                                <span className="text-[10px] text-[var(--sand-dark)]">
                                  ({new Date(rec.timestamp).toLocaleTimeString()})
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Table View */
            <div className="overflow-x-auto rounded-xl border border-[var(--sand)]">
              <table className="w-full text-left">
                <thead className="bg-[var(--linen)] text-[11px] font-bold text-[var(--bark-muted)] uppercase tracking-wider border-b border-[var(--sand)]">
                  <tr>
                    <th className="px-3 py-2.5">Key / Node</th>
                    <th className="px-3 py-2.5">Action</th>
                    <th className="px-3 py-2.5">Ripeness</th>
                    <th className="px-3 py-2.5">Confidence</th>
                    <th className="px-3 py-2.5">Diameter</th>
                    <th className="px-3 py-2.5">Size</th>
                    <th className="px-3 py-2.5">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--sand)] bg-[var(--linen-surface)]">
                  {records.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[var(--sage)]/15">
                      <td className="px-3 py-2 text-[var(--olive-dark)] font-bold">{rec.id}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rec.action === 'Rejected' || rec.ripeness === 'Blight'
                              ? 'bg-[var(--tomato)]/15 text-[var(--tomato)]'
                              : 'bg-[var(--olive)]/15 text-[var(--olive-dark)]'
                          }`}
                        >
                          {rec.action || (rec.ripeness === 'Blight' ? 'Rejected' : 'Accepted')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[var(--bark)]">{rec.ripeness}</td>
                      <td className="px-3 py-2 text-[var(--terracotta)] font-bold">{rec.confidence}%</td>
                      <td className="px-3 py-2 text-[var(--bark-muted)]">{((rec.diameterMm || 60) / 10).toFixed(1)} cm</td>
                      <td className="px-3 py-2 text-[var(--bark-muted)]">{rec.size || 'Medium'}</td>
                      <td className="px-3 py-2 text-[var(--bark-light)]">
                        {new Date(rec.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between border-t border-[var(--sand)] bg-[var(--linen)] px-6 py-3 text-xs text-[var(--bark-muted)]">
          <div className="flex items-center space-x-2">
            <Radio className="h-3.5 w-3.5 text-[var(--olive)] animate-pulse" />
            <span>Real-time Sync Active: Camera detections automatically stream to this database</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-[var(--linen-surface)] hover:bg-[var(--sand)] border border-[var(--sand)] px-4 py-1.5 text-xs font-semibold text-[var(--bark)] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
