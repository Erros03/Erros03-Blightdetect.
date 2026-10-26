/**
 * Seasonal & Annual Yield Analytics Component
 * Yearly & Seasonal data grouping, peak season insights, YoY charts, and CSV report export
 */
import React, { useState, useMemo } from 'react';
import {
  CalendarRange,
  TrendingUp,
  Award,
  ShieldCheck,
  Download,
  Filter,
  Sun,
  CloudRain,
  ChevronDown,
  Sparkles,
  BarChart2,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { DetectionSession } from '../types.ts';
import {
  type SeasonGroupingMode,
  type SeasonalAggregate,
  groupSessionsBySeason,
  computePeakSeasonInsights,
  generateYoYComparisonData,
  exportSeasonalAggregatesToCSV,
} from '../lib/seasonal-analytics.ts';
import { useTheme } from '../context/ThemeContext.tsx';

interface SeasonalYieldAnalyticsProps {
  sessions: DetectionSession[];
}

export const SeasonalYieldAnalytics: React.FC<SeasonalYieldAnalyticsProps> = ({
  sessions,
}) => {
  const { resolvedTheme } = useTheme();

  const [groupingMode, setGroupingMode] = useState<SeasonGroupingMode>('agri');
  const [selectedMetric, setSelectedMetric] = useState<
    'totalCount' | 'ripeCount' | 'estimatedWeightKg' | 'blightRatePercent'
  >('totalCount');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterSeason, setFilterSeason] = useState<string>('all');

  // Compute seasonal aggregates based on current grouping mode
  const aggregates = useMemo(() => {
    return groupSessionsBySeason(sessions, groupingMode);
  }, [sessions, groupingMode]);

  // Compute peak insights across all recorded seasons
  const insights = useMemo(() => {
    return computePeakSeasonInsights(aggregates);
  }, [aggregates]);

  // Generate Year-over-Year comparison data for Recharts
  const { chartData, years, metricLabel } = useMemo(() => {
    return generateYoYComparisonData(aggregates, selectedMetric, groupingMode);
  }, [aggregates, selectedMetric, groupingMode]);

  // Unique years for filtering
  const availableYears = useMemo(() => {
    const set = new Set<number>();
    aggregates.forEach((a) => set.add(a.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [aggregates]);

  // Filtered seasonal aggregates for the summary table
  const filteredAggregates = useMemo(() => {
    return aggregates.filter((a) => {
      const matchYear = filterYear === 'all' || a.year.toString() === filterYear;
      const matchSeason = filterSeason === 'all' || a.seasonKey === filterSeason;
      return matchYear && matchSeason;
    });
  }, [aggregates, filterYear, filterSeason]);

  // Harmonious agricultural palette colors for multiple years in YoY chart
  const yearColors = ['#2E7D32', '#174C35', '#81C784', '#607D8B', '#E53935'];

  const tooltipStyle = {
    backgroundColor: '#FFFFFF',
    borderColor: '#D8E3D6',
    borderRadius: '8px',
    color: '#263238',
    boxShadow: '0 4px 12px rgba(23, 76, 53, 0.08)',
  };

  const gridStroke = '#D8E3D6';
  const axisStroke = '#607D8B';

  return (
    <div className="space-y-6">
      {/* Analytics Sub-Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-xl border border-[#D8E3D6] bg-white p-5 shadow-xs transition-colors agri-card-shadow">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[#E8F3E5] text-[#2E7D32]">
              <CalendarRange className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#174C35] flex items-center gap-2">
                Seasonal & Annual Yield Analytics
                <span className="text-[11px] font-semibold uppercase px-2 py-0.5 rounded-md bg-[#E8F3E5] text-[#174C35] border border-[#D8E3D6]">
                  YoY Intelligence
                </span>
              </h2>
              <p className="text-xs text-[#607D8B] mt-0.5">
                Multi-year climate grouping, peak throughput windows, and seasonal defect trends
              </p>
            </div>
          </div>
        </div>

        {/* Grouping Mode Toggle & CSV Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Grouping Mode Pill Toggle */}
          <div className="inline-flex rounded-lg bg-[#F8F9F4] border border-[#D8E3D6] p-1 text-xs font-semibold">
            <button
              id="btn-group-mode-agri"
              onClick={() => {
                setGroupingMode('agri');
                setFilterSeason('all');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                groupingMode === 'agri'
                  ? 'bg-[#E8F3E5] text-[#174C35] shadow-xs font-bold'
                  : 'text-[#607D8B] hover:text-[#263238]'
              }`}
            >
              <Sun className="h-3.5 w-3.5 text-[var(--terracotta)]" />
              <span>Dry / Wet Season</span>
            </button>
            <button
              id="btn-group-mode-quarterly"
              onClick={() => {
                setGroupingMode('quarterly');
                setFilterSeason('all');
              }}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                groupingMode === 'quarterly'
                  ? 'bg-[var(--sage)]/50 text-[var(--bark)] shadow-xs font-bold'
                  : 'text-[var(--bark-muted)] hover:text-[var(--bark)]'
              }`}
            >
              <Calendar className="h-3.5 w-3.5 text-[var(--olive)]" />
              <span>Quarterly (Q1–Q4)</span>
            </button>
          </div>

          {/* Export Aggregated Seasonal CSV */}
          <button
            id="btn-export-seasonal-csv"
            onClick={() => exportSeasonalAggregatesToCSV(aggregates, groupingMode === 'agri' ? 'Dry-Wet-Seasons' : 'Quarterly')}
            disabled={aggregates.length === 0}
            className="flex items-center space-x-1.5 rounded-lg bg-[var(--tomato)] hover:bg-[var(--tomato-hover)] disabled:opacity-50 px-3.5 py-2 text-xs font-semibold text-white transition-colors shadow-xs cursor-pointer"
            title="Export Aggregated Seasonal & Annual Report to CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Seasonal Report (CSV)</span>
          </button>
        </div>
      </div>

      {/* Peak Season Insights Banners */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Peak Production Season */}
        <div className="rounded-xl border border-[var(--sand)] bg-[var(--sage)]/20 p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--olive-dark)] flex items-center gap-1.5 font-serif">
              <Award className="h-4 w-4 text-[var(--olive)]" />
              Peak Production Season
            </span>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[var(--sage)]/40 text-[var(--olive-dark)] border border-[var(--sand)]">
              Highest Yield
            </span>
          </div>

          {insights.peakProduction ? (
            <div className="mt-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold font-serif text-[var(--bark)]">
                  {insights.peakProduction.seasonShort} {insights.peakProduction.year}
                </span>
              </div>
              <div className="mt-2 text-xs text-[var(--bark-muted)] space-y-1">
                <p>
                  <strong className="text-[var(--olive-dark)] font-bold">
                    {insights.peakProduction.totalCount.toLocaleString()}
                  </strong>{' '}
                  tomatoes processed (~{insights.peakProduction.estimatedWeightKg.toLocaleString()} kg)
                </p>
                <p className="text-[11px] text-[var(--bark-muted)]">
                  Across {insights.peakProduction.sessionCount} inspection runs • {insights.peakProduction.ripeRatePercent}% Grade-A Ripe
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-xs text-[var(--bark-muted)]">No session data recorded yet.</div>
          )}
        </div>

        {/* Lowest Defect Season */}
        <div className="rounded-xl border border-[var(--sand)] bg-[var(--sand)]/25 p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--bark)] flex items-center gap-1.5 font-serif">
              <ShieldCheck className="h-4 w-4 text-[var(--olive)]" />
              Lowest Defect Season
            </span>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[var(--sand)]/40 text-[var(--bark)] border border-[var(--sand)]">
              Min Blight
            </span>
          </div>

          {insights.lowestDefect ? (
            <div className="mt-3">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold font-serif text-[var(--bark)]">
                  {insights.lowestDefect.seasonShort} {insights.lowestDefect.year}
                </span>
              </div>
              <div className="mt-2 text-xs text-[var(--bark-muted)] space-y-1">
                <p>
                  Only{' '}
                  <strong className="text-[var(--bark)] font-bold">
                    {insights.lowestDefect.blightRatePercent}%
                  </strong>{' '}
                  blight defect incidence ({insights.lowestDefect.blightCount} rejected)
                </p>
                <p className="text-[11px] text-[var(--bark-muted)]">
                  Market Quality Index: <strong className="text-[var(--bark)]">{insights.lowestDefect.qualityScore}/100</strong>
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-xs text-[var(--bark-muted)]">No session data recorded yet.</div>
          )}
        </div>

        {/* All-Time Volume & YoY Growth */}
        <div className="rounded-xl border border-[var(--sand)] bg-[var(--terracotta)]/10 p-5 shadow-xs transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--terracotta)] flex items-center gap-1.5 font-serif">
              <TrendingUp className="h-4 w-4 text-[var(--terracotta)]" />
              Annual Multi-Year Growth
            </span>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[var(--terracotta)]/15 text-[var(--terracotta)] border border-[var(--terracotta)]/30">
              {insights.yearsTracked.length} Years Logged
            </span>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold font-serif text-[var(--bark)]">
                {insights.totalVolumeAllTime.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-[var(--terracotta)]">
                {insights.totalWeightAllTimeKg.toLocaleString()} kg total
              </span>
            </div>
            <div className="mt-2 text-xs text-[var(--bark-muted)] space-y-1">
              {insights.yoyVolumeGrowth ? (
                <p>
                  <strong className={insights.yoyVolumeGrowth.growthPercent >= 0 ? 'text-[var(--olive)]' : 'text-[var(--tomato)]'}>
                    {insights.yoyVolumeGrowth.growthPercent >= 0 ? '+' : ''}
                    {insights.yoyVolumeGrowth.growthPercent}% YoY Growth
                  </strong>{' '}
                  ({insights.yoyVolumeGrowth.currentYear} vs {insights.yoyVolumeGrowth.prevYear})
                </p>
              ) : (
                <p>Recorded across {insights.totalSessionsCount} total conveyor inspection runs</p>
              )}
              <p className="text-[11px] text-[var(--bark-muted)]">
                All-time average defect incidence: {insights.overallBlightRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Year-over-Year (YoY) Comparison Chart */}
      <div className="rounded-xl border border-[var(--sand)] bg-[var(--linen-surface)] p-5 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center space-x-2">
              <BarChart2 className="h-4 w-4 text-[var(--olive)]" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--bark)] font-serif">
                Year-over-Year (YoY) Seasonal Yield Comparison
              </h3>
            </div>
            <p className="text-xs text-[var(--bark-muted)] mt-0.5">
              Compare harvest throughput, grade yields, and blight rates across recorded calendar years
            </p>
          </div>

          {/* Metric Selector for YoY Chart */}
          <div className="flex items-center space-x-1.5 bg-[var(--linen)] border border-[var(--sand)] p-1 rounded-lg text-xs font-semibold">
            <button
              id="btn-yoy-metric-total"
              onClick={() => setSelectedMetric('totalCount')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedMetric === 'totalCount'
                  ? 'bg-[var(--sage)]/50 text-[var(--bark)] shadow-xs font-bold'
                  : 'text-[var(--bark-muted)] hover:text-[var(--bark)]'
              }`}
            >
              Total Volume
            </button>
            <button
              id="btn-yoy-metric-ripe"
              onClick={() => setSelectedMetric('ripeCount')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedMetric === 'ripeCount'
                  ? 'bg-[var(--sage)]/50 text-[var(--bark)] shadow-xs font-bold'
                  : 'text-[var(--bark-muted)] hover:text-[var(--bark)]'
              }`}
            >
              Ripe (Grade A)
            </button>
            <button
              id="btn-yoy-metric-weight"
              onClick={() => setSelectedMetric('estimatedWeightKg')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedMetric === 'estimatedWeightKg'
                  ? 'bg-[var(--sage)]/50 text-[var(--bark)] shadow-xs font-bold'
                  : 'text-[var(--bark-muted)] hover:text-[var(--bark)]'
              }`}
            >
              Est. Weight (kg)
            </button>
            <button
              id="btn-yoy-metric-blight"
              onClick={() => setSelectedMetric('blightRatePercent')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedMetric === 'blightRatePercent'
                  ? 'bg-[var(--tomato)]/15 text-[var(--tomato)] shadow-xs font-bold'
                  : 'text-[var(--bark-muted)] hover:text-[var(--bark)]'
              }`}
            >
              Blight Rate %
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="h-72 w-full">
          {chartData.length === 0 || years.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-[var(--bark-muted)]">
              No historical data available to plot YoY comparison.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 25, left: -5, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="season" stroke={axisStroke} fontSize={12} fontStyle="bold" />
                <YAxis stroke={axisStroke} fontSize={11} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value: any) => [
                    selectedMetric === 'blightRatePercent'
                      ? `${value}%`
                      : selectedMetric === 'estimatedWeightKg'
                      ? `${value} kg`
                      : Number(value).toLocaleString(),
                    metricLabel,
                  ]}
                />
                <Legend />
                {years.map((yr, idx) => (
                  <Bar
                    key={yr}
                    dataKey={`${yr}`}
                    name={`Year ${yr}`}
                    fill={yearColors[idx % yearColors.length]}
                    radius={[8, 8, 0, 0]}
                    maxBarSize={45}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Aggregated Seasonal Breakdown Table with Year & Season Filter */}
      <div className="rounded-xl border border-[var(--sand)] bg-[var(--linen-surface)] shadow-xs overflow-hidden transition-colors">
        {/* Table Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-[var(--sand)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--bark)] font-serif flex items-center gap-2">
              <Layers className="h-4 w-4 text-[var(--olive)]" />
              Seasonal Metrics Audit Table
            </h3>
            <p className="text-xs text-[var(--bark-muted)] mt-0.5">
              Aggregated volume, sorting classifications, and market grade index by season
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1 text-xs text-[var(--bark-muted)]">
              <Filter className="h-3.5 w-3.5 text-[var(--olive)]" />
              <span>Filter:</span>
            </div>

            {/* Year Dropdown */}
            <select
              id="select-filter-year"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="rounded-lg border border-[var(--sand)] bg-[var(--linen)] px-3 py-1.5 text-xs font-semibold text-[var(--bark)] focus:outline-none focus:ring-2 focus:ring-[var(--olive)] cursor-pointer"
            >
              <option value="all">All Recorded Years</option>
              {availableYears.map((yr) => (
                <option key={yr} value={yr.toString()}>
                  Year {yr}
                </option>
              ))}
            </select>

            {/* Season Dropdown */}
            <select
              id="select-filter-season"
              value={filterSeason}
              onChange={(e) => setFilterSeason(e.target.value)}
              className="rounded-lg border border-[var(--sand)] bg-[var(--linen)] px-3 py-1.5 text-xs font-semibold text-[var(--bark)] focus:outline-none focus:ring-2 focus:ring-[var(--olive)] cursor-pointer"
            >
              <option value="all">All Seasons</option>
              {groupingMode === 'agri' ? (
                <>
                  <option value="dry">Dry / Summer Season</option>
                  <option value="wet">Wet / Rainy Season</option>
                </>
              ) : (
                <>
                  <option value="Q1">Q1 (Jan–Mar)</option>
                  <option value="Q2">Q2 (Apr–Jun)</option>
                  <option value="Q3">Q3 (Jul–Sep)</option>
                  <option value="Q4">Q4 (Oct–Dec)</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[var(--linen)] text-[var(--bark-muted)] uppercase font-bold text-[11px] border-b border-[var(--sand)] font-serif">
              <tr>
                <th className="px-5 py-3.5">Year</th>
                <th className="px-5 py-3.5">Season Window</th>
                <th className="px-5 py-3.5 text-center">Inspection Runs</th>
                <th className="px-5 py-3.5 text-right">Total Volume</th>
                <th className="px-5 py-3.5 text-right">Est. Weight</th>
                <th className="px-5 py-3.5 text-right">Ripe (Grade A)</th>
                <th className="px-5 py-3.5 text-right">Unripe</th>
                <th className="px-5 py-3.5 text-right">Blight Count</th>
                <th className="px-5 py-3.5 text-right">Blight Rate</th>
                <th className="px-5 py-3.5 text-center">Market Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--sand)]/50 font-medium">
              {filteredAggregates.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-5 py-8 text-center text-[var(--bark-muted)]">
                    No seasonal aggregates match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAggregates.map((agg) => {
                  const isPeak = insights.peakProduction?.id === agg.id;
                  const isMinDefect = insights.lowestDefect?.id === agg.id;

                  return (
                    <tr
                      key={agg.id}
                      className="hover:bg-[var(--sage)]/15 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-bold font-serif text-[var(--bark)]">
                        {agg.year}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-2">
                          {agg.seasonKey === 'dry' ? (
                            <Sun className="h-4 w-4 text-[var(--terracotta)] shrink-0" />
                          ) : agg.seasonKey === 'wet' ? (
                            <CloudRain className="h-4 w-4 text-[var(--olive)] shrink-0" />
                          ) : (
                            <Calendar className="h-4 w-4 text-[var(--olive)] shrink-0" />
                          )}
                          <div>
                            <span className="font-bold text-[var(--bark)]">
                              {agg.seasonName}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {isPeak && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-lg text-[10px] font-bold bg-[var(--sage)]/30 text-[var(--olive-dark)] border border-[var(--sand)]">
                                  ★ Peak Volume
                                </span>
                              )}
                              {isMinDefect && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-lg text-[10px] font-bold bg-[var(--sand)]/40 text-[var(--bark)] border border-[var(--sand)]">
                                  ✓ Lowest Blight
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono text-[var(--bark-muted)]">
                        {agg.sessionCount} runs
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold font-serif text-[var(--bark)]">
                        {agg.totalCount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-[var(--olive)] font-bold">
                        {agg.estimatedWeightKg.toLocaleString()} kg
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="font-bold text-[var(--olive)]">
                          {agg.ripeCount.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[var(--bark-muted)] ml-1">
                          ({agg.ripeRatePercent}%)
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right text-[var(--bark-muted)] font-mono">
                        {agg.unripeCount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right text-[var(--tomato)] font-mono font-bold">
                        {agg.blightCount.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded-lg ${
                            agg.blightRatePercent > 10
                              ? 'bg-[var(--tomato)]/15 text-[var(--tomato)] border border-[var(--tomato)]/30'
                              : agg.blightRatePercent > 5
                              ? 'bg-[var(--terracotta)]/15 text-[var(--terracotta)] border border-[var(--terracotta)]/30'
                              : 'bg-[var(--sage)]/30 text-[var(--olive-dark)] border border-[var(--sand)]'
                          }`}
                        >
                          {agg.blightRatePercent}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold ${
                            agg.qualityScore >= 80
                              ? 'bg-[var(--sage)]/30 text-[var(--olive-dark)] border border-[var(--sand)]'
                              : agg.qualityScore >= 60
                              ? 'bg-[var(--terracotta)]/15 text-[var(--terracotta)] border border-[var(--terracotta)]/30'
                              : 'bg-[var(--tomato)]/15 text-[var(--tomato)] border border-[var(--tomato)]/30'
                          }`}
                        >
                          {agg.qualityScore} / 100
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
