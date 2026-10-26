/**
 * Detection History Route - Permanent Historical Sessions
 * Clean agricultural dashboard redesign reading from Firebase database
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Download,
  Calendar,
  Clock,
  Search,
  RefreshCw,
  Filter,
  Sun,
  CloudRain,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
} from 'lucide-react';
import type { DetectionSession, TomatoDetectionEvent } from '../types.ts';
import { getHistoricalSessions, getRecentTomatoEvents } from '../lib/detection-sessions.ts';
import {
  getSeasonDetails,
  groupSessionsBySeason,
  exportSeasonalAggregatesToCSV,
} from '../lib/seasonal-analytics.ts';
import { SeasonalYieldAnalytics } from '../components/SeasonalYieldAnalytics.tsx';

export const HistoryRoute: React.FC = () => {
  const [sessions, setSessions] = useState<DetectionSession[]>([]);
  const [allEvents, setAllEvents] = useState<TomatoDetectionEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterSeason, setFilterSeason] = useState<string>('all');
  const [showSeasonalAnalytics, setShowSeasonalAnalytics] = useState<boolean>(false);
  const [selectedSession, setSelectedSession] = useState<DetectionSession | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const [fetchedSessions, fetchedEvents] = await Promise.all([
        getHistoricalSessions(),
        getRecentTomatoEvents(),
      ]);
      setSessions(fetchedSessions);
      setAllEvents(fetchedEvents);
    } catch (e) {
      console.error('Error fetching history:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Compute available recorded years
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    sessions.forEach((s) => {
      const details = getSeasonDetails(s.date || s.createdAt, 'agri');
      set.add(details.year);
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [sessions]);

  // Filter sessions by search term, year, and season
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        (s.id && s.id.toLowerCase().includes(term)) ||
        (s.date && s.date.toLowerCase().includes(term)) ||
        (s.startTime && s.startTime.toLowerCase().includes(term));

      if (!matchesSearch) return false;

      const details = getSeasonDetails(s.date || s.createdAt, 'agri');
      if (filterYear !== 'all' && details.year.toString() !== filterYear) {
        return false;
      }
      if (filterSeason !== 'all' && details.seasonKey !== filterSeason) {
        return false;
      }

      return true;
    });
  }, [sessions, searchTerm, filterYear, filterSeason]);

  // Export filtered sessions to CSV
  const exportFilteredSessionsToCSV = () => {
    if (filteredSessions.length === 0) return;
    const headers =
      'Session ID,Date,Year,Season,Start Time,End Time,Total Units,Ripe (Grade A),Unripe,Blight,Blight %\n';
    const rows = filteredSessions
      .map((s) => {
        const details = getSeasonDetails(s.date || s.createdAt, 'agri');
        return `"${s.id}","${s.date}",${details.year},"${details.seasonShort}","${s.startTime}","${
          s.endTime || 'N/A'
        }",${s.totalCount},${s.ripeCount},${s.unripeCount},${s.blightCount},"${
          s.blightPercentage || 0
        }%"`;
      })
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blightdetect_sessions_filtered_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export aggregated seasonal report to CSV
  const handleExportSeasonalReport = () => {
    const aggregates = groupSessionsBySeason(sessions, 'agri');
    exportSeasonalAggregatesToCSV(aggregates, 'Agri-Seasons');
  };

  const sessionEvents = selectedSession
    ? allEvents.filter((e) => e.sessionId === selectedSession.id)
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <History className="h-6 w-6 text-[#2E7D32]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#174C35] sm:text-3xl">
              Detection History & Logs
            </h1>
          </div>
          <p className="mt-1 text-sm text-[#607D8B]">
            Permanent audit record of completed conveyor detection runs, seasonal groupings, and defect incidence
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Toggle Seasonal Analytics Section */}
          <button
            id="btn-toggle-seasonal-analytics"
            onClick={() => setShowSeasonalAnalytics(!showSeasonalAnalytics)}
            className="flex items-center space-x-1.5 rounded-lg bg-white border border-[#D8E3D6] hover:bg-[#F8F9F4] px-3.5 py-2 text-xs font-semibold text-[#263238] transition-colors shadow-xs cursor-pointer"
          >
            <CalendarRange className="h-3.5 w-3.5 text-[#2E7D32]" />
            <span>Seasonal Analytics & YoY</span>
            {showSeasonalAnalytics ? (
              <ChevronUp className="h-3.5 w-3.5 ml-0.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
            )}
          </button>

          {/* Refresh Data */}
          <button
            onClick={fetchHistory}
            className="flex items-center space-x-1.5 rounded-lg bg-white border border-[#D8E3D6] hover:bg-[#F8F9F4] px-3 py-2 text-xs font-semibold text-[#263238] transition-colors shadow-xs cursor-pointer"
            title="Reload sessions from database"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#2E7D32] ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Export Filtered Sessions CSV */}
          <button
            id="btn-export-sessions-csv"
            onClick={exportFilteredSessionsToCSV}
            disabled={filteredSessions.length === 0}
            className="flex items-center space-x-1.5 rounded-lg bg-[#2E7D32] hover:bg-[#1B5E20] disabled:opacity-50 px-3.5 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
            title="Export filtered individual inspection runs to CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Sessions ({filteredSessions.length})</span>
          </button>

          {/* Export Aggregated Seasonal Report CSV - Tomato Red */}
          <button
            id="btn-export-seasonal-report-csv"
            onClick={handleExportSeasonalReport}
            disabled={sessions.length === 0}
            className="flex items-center space-x-1.5 rounded-lg bg-[#E53935] hover:bg-[#C62828] disabled:opacity-50 px-3.5 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
            title="Export aggregated yearly & seasonal yield metrics report to CSV"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Export Seasonal Report</span>
          </button>
        </div>
      </div>

      {/* Expandable Seasonal & Annual Analytics Section */}
      {showSeasonalAnalytics && (
        <div className="rounded-xl border border-[#D8E3D6] bg-white p-4 sm:p-6 transition-all agri-card-shadow">
          <SeasonalYieldAnalytics sessions={sessions} />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 rounded-xl border border-[#D8E3D6] bg-white p-3.5 shadow-xs transition-colors agri-card-shadow">
        {/* Search Input */}
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <Search className="h-4 w-4 text-[#607D8B] ml-1 shrink-0" />
          <input
            type="text"
            placeholder="Search by date (YYYY-MM-DD), session ID, or time..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-sm text-[#263238] placeholder-[#607D8B] focus:outline-none"
          />
        </div>

        {/* Year and Season Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-[#D8E3D6]">
          <div className="flex items-center space-x-1 text-xs text-[#607D8B] font-medium">
            <Filter className="h-3.5 w-3.5 text-[#2E7D32]" />
            <span>Filter:</span>
          </div>

          {/* Year Filter */}
          <select
            id="history-filter-year"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="rounded-lg border border-[#D8E3D6] bg-[#F8F9F4] px-3 py-1.5 text-xs font-semibold text-[#263238] focus:outline-none focus:ring-2 focus:ring-[#2E7D32] cursor-pointer"
          >
            <option value="all">All Years ({availableYears.length})</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr.toString()}>
                Year {yr}
              </option>
            ))}
          </select>

          {/* Season Filter */}
          <select
            id="history-filter-season"
            value={filterSeason}
            onChange={(e) => setFilterSeason(e.target.value)}
            className="rounded-lg border border-[#D8E3D6] bg-[#F8F9F4] px-3 py-1.5 text-xs font-semibold text-[#263238] focus:outline-none focus:ring-2 focus:ring-[#2E7D32] cursor-pointer"
          >
            <option value="all">All Seasons</option>
            <option value="dry">Dry / Summer Season (Nov–Apr)</option>
            <option value="wet">Wet / Rainy Season (May–Oct)</option>
          </select>

          {(filterYear !== 'all' || filterSeason !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setFilterYear('all');
                setFilterSeason('all');
                setSearchTerm('');
              }}
              className="text-xs font-semibold text-[#E53935] hover:text-[#C62828] px-2 py-1 rounded-lg hover:bg-[#FDECEC] cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Historical Sessions Table */}
      <div className="rounded-xl border border-[#D8E3D6] bg-white p-5 shadow-xs transition-colors agri-card-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#174C35]">
              Historical Detection Sessions ({filteredSessions.length})
            </h3>
            {(filterYear !== 'all' || filterSeason !== 'all') && (
              <p className="text-xs text-[#E53935] font-medium mt-0.5">
                Filtered by:{' '}
                {filterYear !== 'all' && <span className="font-bold">Year {filterYear} </span>}
                {filterSeason !== 'all' && (
                  <span className="font-bold capitalize">
                    • {filterSeason === 'dry' ? 'Dry / Summer' : 'Wet / Rainy'} Season
                  </span>
                )}
              </p>
            )}
          </div>
          <span className="text-xs text-[#607D8B]">Stored permanently in Firestore & Local DB</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-[#607D8B] text-sm">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-[#2E7D32]" />
            Loading historical sessions...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="py-12 text-center text-[#607D8B] text-sm">
            No completed sessions match your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#D8E3D6] text-[#607D8B]">
                  <th className="pb-3 font-semibold">Date & Season</th>
                  <th className="pb-3 font-semibold">Session ID</th>
                  <th className="pb-3 font-semibold">Duration</th>
                  <th className="pb-3 font-semibold text-center">Total</th>
                  <th className="pb-3 font-semibold text-[#2E7D32] text-center">Ripe</th>
                  <th className="pb-3 font-semibold text-[#607D8B] text-center">Unripe</th>
                  <th className="pb-3 font-semibold text-[#E53935] text-center">Blight</th>
                  <th className="pb-3 font-semibold text-center">Blight %</th>
                  <th className="pb-3 font-semibold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E3D6]/50">
                {filteredSessions.map((s) => {
                  const season = getSeasonDetails(s.date || s.createdAt, 'agri');
                  const isDry = season.seasonKey === 'dry';

                  return (
                    <tr key={s.id} className="hover:bg-[#F8F9F4] transition-colors">
                      <td className="py-3 font-mono text-[#263238]">
                        <div className="flex items-center space-x-2 font-bold text-[#263238]">
                          <Calendar className="h-3.5 w-3.5 text-[#2E7D32] shrink-0" />
                          <span>{s.date}</span>
                          <span
                            className={`inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              isDry
                                ? 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]'
                                : 'bg-[#E8F3E5] text-[#2E7D32] border-[#D8E3D6]'
                            }`}
                          >
                            {isDry ? (
                              <Sun className="h-2.5 w-2.5 text-[#E65100]" />
                            ) : (
                              <CloudRain className="h-2.5 w-2.5 text-[#2E7D32]" />
                            )}
                            <span>{season.seasonShort}</span>
                          </span>
                        </div>
                        <div className="text-[11px] text-[#607D8B] flex items-center space-x-1 mt-0.5">
                          <Clock className="h-3 w-3" />
                          <span>
                            {s.startTime} → {s.endTime || 'Completed'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 font-mono text-[#607D8B]">
                        {s.id.substring(0, 18)}...
                      </td>

                      <td className="py-3 text-[#607D8B] font-mono">
                        {s.durationSeconds
                          ? `${Math.round(s.durationSeconds / 60)}m ${s.durationSeconds % 60}s`
                          : 'Active'}
                      </td>

                      <td className="py-3 font-bold text-[#263238] text-center text-sm">
                        {s.totalCount}
                      </td>

                      <td className="py-3 font-semibold text-[#2E7D32] text-center">
                        {s.ripeCount}
                      </td>

                      <td className="py-3 font-semibold text-[#607D8B] text-center">
                        {s.unripeCount}
                      </td>

                      <td className="py-3 font-semibold text-[#E53935] text-center">
                        {s.blightCount}
                      </td>

                      <td className="py-3 text-center">
                        <span
                          className={`inline-block rounded-md px-2 py-0.5 font-bold border ${
                            (s.blightPercentage || 0) > 10
                              ? 'bg-[#FDECEC] text-[#E53935] border-[#E53935]/30'
                              : 'bg-[#F8F9F4] text-[#263238] border-[#D8E3D6]'
                          }`}
                        >
                          {s.blightPercentage ||
                            (s.totalCount > 0
                              ? ((s.blightCount / s.totalCount) * 100).toFixed(1)
                              : 0)}
                          %
                        </span>
                      </td>

                      <td className="py-3 text-right">
                        <button
                          onClick={() => setSelectedSession(selectedSession?.id === s.id ? null : s)}
                          className="rounded-lg bg-[#F8F9F4] hover:bg-[#E8F3E5] px-3 py-1 text-xs font-semibold text-[#263238] border border-[#D8E3D6] transition-colors cursor-pointer"
                        >
                          {selectedSession?.id === s.id ? 'Close' : 'View'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Session Detail Modal / Card */}
      {selectedSession && (
        <div className="rounded-xl border border-[#D8E3D6] bg-white p-6 shadow-sm space-y-4 transition-colors agri-card-shadow">
          <div className="flex items-center justify-between border-b border-[#D8E3D6] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#174C35]">
                Session Inspection: <span className="font-mono text-[#E53935]">{selectedSession.id}</span>
              </h3>
              <p className="text-xs text-[#607D8B] mt-0.5">
                Recorded on {selectedSession.date} from {selectedSession.startTime} to {selectedSession.endTime || 'End'}
              </p>
            </div>
            <button
              onClick={() => setSelectedSession(null)}
              className="text-[#607D8B] hover:text-[#263238] text-xs font-bold cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-lg bg-[#F8F9F4] p-3 text-center border border-[#D8E3D6]">
              <span className="text-xs text-[#607D8B] font-medium">Total Counted</span>
              <div className="text-2xl font-bold text-[#263238]">{selectedSession.totalCount}</div>
            </div>
            <div className="rounded-lg bg-[#E8F3E5] p-3 text-center border border-[#D8E3D6]">
              <span className="text-xs text-[#2E7D32] font-medium">Ripe</span>
              <div className="text-2xl font-bold text-[#2E7D32]">{selectedSession.ripeCount}</div>
            </div>
            <div className="rounded-lg bg-[#F8F9F4] p-3 text-center border border-[#D8E3D6]">
              <span className="text-xs text-[#607D8B] font-medium">Unripe</span>
              <div className="text-2xl font-bold text-[#263238]">{selectedSession.unripeCount}</div>
            </div>
            <div className="rounded-lg bg-[#FDECEC] p-3 text-center border border-[#E53935]/30">
              <span className="text-xs text-[#E53935] font-medium">Blight Culled</span>
              <div className="text-2xl font-bold text-[#E53935]">{selectedSession.blightCount}</div>
            </div>
          </div>

          {/* Session Detection Events Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#174C35] mb-2">
              Individual Unique Tomato Records ({sessionEvents.length})
            </h4>
            {sessionEvents.length === 0 ? (
              <p className="text-xs text-[#607D8B] py-3">
                No individual bounding-box events recorded for this historical session.
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto rounded-lg border border-[#D8E3D6] bg-[#F8F9F4] p-2">
                <table className="w-full text-left text-xs">
                  <thead className="text-[#607D8B] border-b border-[#D8E3D6]">
                    <tr>
                      <th className="pb-1.5 font-semibold">Time</th>
                      <th className="pb-1.5 font-semibold">Track ID</th>
                      <th className="pb-1.5 font-semibold">Class</th>
                      <th className="pb-1.5 font-semibold">Confidence</th>
                      <th className="pb-1.5 font-semibold">Est. Size</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8E3D6]/50">
                    {sessionEvents.map((e) => (
                      <tr key={e.id}>
                        <td className="py-1.5 font-mono text-[#607D8B]">{new Date(e.timestamp).toLocaleTimeString()}</td>
                        <td className="py-1.5 font-mono text-[#263238] font-semibold">#TRK-{e.trackId}</td>
                        <td className="py-1.5 text-[#263238] font-medium">{e.class}</td>
                        <td className="py-1.5 font-bold text-[#263238]">{e.confidence}%</td>
                        <td className="py-1.5">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-white text-[#263238] border border-[#D8E3D6]">
                            {e.size === 'small' ? 'Small' : e.size === 'large' ? 'Large' : 'Medium'}
                          </span>
                          <span className="text-[10px] text-[#607D8B] font-mono font-semibold ml-1">
                            ~{((e.diameterMm || 65) / 10).toFixed(1)} cm
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
