/**
 * Yield Monitoring Route - Real-time Tomato Quality & Harvest Estimation
 * Clean agricultural dashboard styling with real session data
 */
import React, { useState } from 'react';
import {
  BarChart3,
  Percent,
  TrendingUp,
  PieChart as PieIcon,
  Layers,
  CalendarRange,
  Snowflake,
  Warehouse,
  ShieldCheck,
  Scale,
  Clock,
  AlertOctagon,
  PackageCheck,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { TomatoSessionCounts, TomatoDetectionEvent } from '../types.ts';
import { useDashboardData } from '../hooks/useDashboardData.ts';
import { getSizeDistribution } from '../lib/dashboard-data.ts';
import { SeasonalYieldAnalytics } from '../components/SeasonalYieldAnalytics.tsx';

interface YieldMonitoringRouteProps {
  currentCounts: TomatoSessionCounts;
  liveEvents: TomatoDetectionEvent[];
}

export const YieldMonitoringRoute: React.FC<YieldMonitoringRouteProps> = ({
  currentCounts,
  liveEvents,
}) => {
  const [activeTab, setActiveTab] = useState<'batch' | 'seasonal'>('batch');

  const { metrics, historicalSessions, recentDetections } = useDashboardData(
    currentCounts,
    liveEvents
  );

  const rawSizeData = getSizeDistribution(recentDetections);
  const sizeData = rawSizeData.map((s) => ({
    ...s,
    color: s.name.includes('Small') ? '#607D8B' : s.name.includes('Medium') ? '#2E7D32' : '#174C35',
  }));

  // Ripeness Distribution Data using Agricultural Palette tokens
  const ripenessData = [
    { name: 'Ripe / Grade A', value: currentCounts.ripe, color: '#2E7D32' }, // Agri Green
    { name: 'Unripe / Green', value: currentCounts.unripe, color: '#81C784' }, // Light Sage Green
    { name: 'Blight / Defect', value: currentCounts.blight, color: '#E53935' }, // Tomato Red
  ].filter((d) => d.value > 0);

  // Historical batch yield comparison
  const sessionYieldData = historicalSessions.slice(0, 7).reverse().map((s) => ({
    name: `Run ${s.startTime.substring(0, 5)}`,
    date: s.date,
    Ripe: s.ripeCount,
    Unripe: s.unripeCount,
    Blight: s.blightCount,
    Total: s.totalCount,
  }));

  // Calculate average diameter
  const avgDiameter = recentDetections.length > 0
    ? Math.round(
        recentDetections.reduce((sum, e) => sum + (e.diameterMm || 65), 0) /
          recentDetections.length
      )
    : 65;

  // Post-Harvest Cold-Chain & Storage Analytics (DA-CVRC Protocol)
  const totalAnalyzed = currentCounts.total;
  const blightRate = totalAnalyzed > 0 ? (currentCounts.blight / totalAnalyzed) * 100 : 0;
  const ripeRate = totalAnalyzed > 0 ? (currentCounts.ripe / totalAnalyzed) * 100 : 0;
  
  // Shelf life estimation:
  // Grade A ripe: 7-10 days cold (12-15°C), 3-5 days ambient (25°C)
  // Grade B unripe/mature green: 14-21 days cold, 7-10 days ambient
  // Accelerated latent rot risk penalizes batch shelf life if blight rate > 10%
  const blightRiskPenalty = blightRate > 10 ? 0.65 : 1.0;
  const avgColdShelfLifeDays = totalAnalyzed > 0
    ? Math.max(1, Math.round(((ripeRate * 8 + (100 - ripeRate) * 16) / 100) * blightRiskPenalty))
    : 12;
  const avgAmbientShelfLifeDays = totalAnalyzed > 0
    ? Math.max(1, Math.round(((ripeRate * 4 + (100 - ripeRate) * 8) / 100) * blightRiskPenalty))
    : 5;
  const marketableKg = totalAnalyzed > 0
    ? Number((((currentCounts.ripe + currentCounts.unripe) / totalAnalyzed) * metrics.estimatedYieldKg).toFixed(1))
    : 0;

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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Route Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-[#2E7D32]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#174C35] sm:text-3xl">
              Yield & Quality Monitoring
            </h1>
          </div>
          <p className="mt-1 text-sm text-[#607D8B]">
            Real-time harvest statistics, sizing distribution, and automated sorting results
          </p>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center bg-white border border-[#D8E3D6] p-1 rounded-xl text-xs font-semibold shadow-xs">
          <button
            id="tab-btn-batch-metrics"
            onClick={() => setActiveTab('batch')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'batch'
                ? 'bg-[#E8F3E5] text-[#174C35] shadow-xs font-bold'
                : 'text-[#607D8B] hover:text-[#263238]'
            }`}
          >
            <Layers className="h-4 w-4 text-[#2E7D32]" />
            <span>Active Batch</span>
          </button>

          <button
            id="tab-btn-seasonal-analytics"
            onClick={() => setActiveTab('seasonal')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg transition-all cursor-pointer ${
              activeTab === 'seasonal'
                ? 'bg-[#E8F3E5] text-[#174C35] shadow-xs font-bold'
                : 'text-[#607D8B] hover:text-[#263238]'
            }`}
          >
            <CalendarRange className="h-4 w-4 text-[#2E7D32]" />
            <span>Seasonal Analytics</span>
          </button>
        </div>
      </div>

      {activeTab === 'seasonal' ? (
        <SeasonalYieldAnalytics sessions={historicalSessions} />
      ) : (
        <div className="space-y-6">
          {/* Yield Metrics Top Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#D8E3D6] bg-white p-5 shadow-xs agri-card-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#607D8B]">Total Analyzed</span>
                <Layers className="h-4 w-4 text-[#2E7D32]" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#263238]">{currentCounts.total}</span>
                <span className="text-xs text-[#607D8B]">unique tomatoes</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#D8E3D6] bg-white p-5 shadow-xs agri-card-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2E7D32]">Marketable Rate</span>
                <TrendingUp className="h-4 w-4 text-[#2E7D32]" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#2E7D32]">
                  {currentCounts.total > 0
                    ? Math.round(((currentCounts.ripe + currentCounts.unripe) / currentCounts.total) * 100)
                    : 100}%
                </span>
                <span className="text-xs font-bold text-[#2E7D32]">passed sorting</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#D8E3D6] bg-white p-5 shadow-xs agri-card-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#607D8B]">Avg. Diameter</span>
                <span className="text-xs font-mono text-[#607D8B]">Ø cm</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#263238]">{(avgDiameter / 10).toFixed(1)}</span>
                <span className="text-xs text-[#607D8B]">cm</span>
              </div>
            </div>

            <div className="rounded-xl border border-[#D8E3D6] bg-white p-5 shadow-xs agri-card-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#607D8B]">Quality Index</span>
                <Percent className="h-4 w-4 text-[#E53935]" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#263238]">{metrics.qualityScore}</span>
                <span className="text-xs font-bold text-[#607D8B]">/ 100</span>
              </div>
            </div>
          </div>

          {/* Post-Harvest Grading & Conveyor Sorting Matrix */}
          <div className="rounded-xl border border-[#D8E3D6] bg-white p-5 shadow-xs agri-card-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#174C35]">
                  Post-Harvest Grading & Sorting
                </h3>
                <p className="text-xs text-[#607D8B] mt-0.5">
                  Current batch breakdown by quality grade and automated conveyor routing
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#E8F3E5] text-[#174C35] border border-[#D8E3D6] font-semibold">
                95% Threshold
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-[#D8E3D6] bg-[#E8F3E5]/60">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#174C35]">
                    Grade A (Table Market)
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-[#E8F3E5] text-[#2E7D32] border border-[#D8E3D6]">
                    ACCEPT
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-[#2E7D32] mb-1">
                  {currentCounts.gradeA ?? currentCounts.ripe}
                </div>
                <p className="text-xs text-[#607D8B]">
                  Ripe, defect-free tomatoes approved for commercial market.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#D8E3D6] bg-[#F8F9F4]">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#263238]">
                    Grade B (Ripening)
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-white text-[#263238] border border-[#D8E3D6]">
                    SERVO 1
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-[#263238] mb-1">
                  {currentCounts.gradeB ?? currentCounts.unripe}
                </div>
                <p className="text-xs text-[#607D8B]">
                  Unripe green fruit sorted into the ripening container.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[#E53935]/30 bg-[#FDECEC]">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#E53935]">
                    Grade C (Defect / Blight)
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-[#FDECEC] text-[#E53935] border border-[#E53935]/30">
                    CULLED
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-[#E53935] mb-1">
                  {currentCounts.gradeC ?? currentCounts.blight}
                </div>
                <p className="text-xs text-[#607D8B]">
                  Blight or diseased fruit routed straight through to quarantine.
                </p>
              </div>
            </div>
          </div>

          {/* Post-Harvest Cold-Chain & Storage Life Analytics */}
          <div className="rounded-xl border border-[#D8E3D6] bg-white p-5 shadow-xs agri-card-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-[#D8E3D6]">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-[#E8F3E5] text-[#2E7D32]">
                  <Snowflake className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#174C35] flex items-center gap-2">
                    Post-Harvest Storage & Cold Chain Analytics
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E8F3E5] text-[#2E7D32] border border-[#D8E3D6] font-bold">
                      DA-CVRC Protocol
                    </span>
                  </h3>
                  <p className="text-xs text-[#607D8B] mt-0.5">
                    Scientific shelf-life modeling, packhouse storage directives, and cross-contamination mitigation
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-[#607D8B]">Target RH:</span>
                <span className="font-mono text-xs font-bold text-[#174C35] px-2 py-0.5 rounded bg-[#F8F9F4] border border-[#D8E3D6]">
                  85% - 90%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Cold Chain Shelf-Life */}
              <div className="p-4 rounded-xl border border-[#D8E3D6] bg-[#F8F9F4]">
                <div className="flex items-center justify-between text-[#2E7D32] mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Cold Storage</span>
                  <Snowflake className="h-4 w-4" />
                </div>
                <div className="flex items-baseline space-x-1.5 mb-1">
                  <span className="text-2xl font-extrabold text-[#174C35]">~{avgColdShelfLifeDays}</span>
                  <span className="text-xs text-[#607D8B] font-semibold">Days</span>
                </div>
                <div className="text-[11px] text-[#2E7D32] font-semibold">12°C – 15°C Cold Chain</div>
                <p className="text-[11px] text-[#607D8B] mt-1 leading-snug">
                  Prevents chilling injury while retarding Alternaria fungal growth.
                </p>
              </div>

              {/* Ambient Packhouse Shelf-Life */}
              <div className="p-4 rounded-xl border border-[#D8E3D6] bg-[#F8F9F4]">
                <div className="flex items-center justify-between text-[#607D8B] mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Ambient Shelf</span>
                  <Warehouse className="h-4 w-4" />
                </div>
                <div className="flex items-baseline space-x-1.5 mb-1">
                  <span className="text-2xl font-extrabold text-[#263238]">~{avgAmbientShelfLifeDays}</span>
                  <span className="text-xs text-[#607D8B] font-semibold">Days</span>
                </div>
                <div className="text-[11px] text-[#607D8B] font-semibold">25°C Tropical Ambient</div>
                <p className="text-[11px] text-[#607D8B] mt-1 leading-snug">
                  Optimal for local retail distribution or processing within 72–96h.
                </p>
              </div>

              {/* Quarantine & Spore Security */}
              <div className="p-4 rounded-xl border border-[#D8E3D6] bg-[#F8F9F4]">
                <div className="flex items-center justify-between text-[#E53935] mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Quarantine Status</span>
                  {blightRate > 10 ? <AlertOctagon className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4 text-[#2E7D32]" />}
                </div>
                <div className="flex items-baseline space-x-1.5 mb-1">
                  <span className={`text-2xl font-extrabold ${blightRate > 10 ? 'text-[#E53935]' : 'text-[#2E7D32]'}`}>
                    {blightRate > 10 ? 'CULL ACTIVE' : blightRate > 0 ? 'MONITORED' : 'CLEAN'}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-[#607D8B]">
                  Blight: <span className="font-mono text-[#E53935] font-bold">{blightRate.toFixed(1)}%</span>
                </div>
                <p className="text-[11px] text-[#607D8B] mt-1 leading-snug">
                  {currentCounts.blight > 0
                    ? `${currentCounts.blight} culled items isolated to prevent crate cross-contamination.`
                    : 'Zero pathogen lesions detected in current lot.'}
                </p>
              </div>

              {/* Commercial Marketable Yield */}
              <div className="p-4 rounded-xl border border-[#D8E3D6] bg-[#E8F3E5]/50">
                <div className="flex items-center justify-between text-[#2E7D32] mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Marketable Biomass</span>
                  <PackageCheck className="h-4 w-4" />
                </div>
                <div className="flex items-baseline space-x-1.5 mb-1">
                  <span className="text-2xl font-extrabold text-[#2E7D32]">{marketableKg}</span>
                  <span className="text-xs text-[#607D8B] font-semibold">kg</span>
                </div>
                <div className="text-[11px] font-semibold text-[#174C35]">
                  Total Batch: {metrics.estimatedYieldKg} kg
                </div>
                <p className="text-[11px] text-[#607D8B] mt-1 leading-snug">
                  Calibrated USDA Table No. 1 / No. 2 commercial sizing compliance.
                </p>
              </div>
            </div>
          </div>

          {/* Chart Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ripeness Breakdown Donut Chart */}
            <div className="rounded-xl border border-[#D8E3D6] bg-white p-5 shadow-xs flex flex-col justify-between transition-colors agri-card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#174C35]">
                  Ripeness Distribution
                </h3>
                <PieIcon className="h-4 w-4 text-[#2E7D32]" />
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                {ripenessData.length === 0 ? (
                  <div className="text-center text-[#607D8B] text-xs">
                    No detections recorded in this session.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ripenessData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {ripenessData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#D8E3D6] pt-3 text-center text-xs">
                <div>
                  <span className="text-[#2E7D32] font-bold block">{currentCounts.ripe}</span>
                  <span className="text-[#607D8B] text-[10px]">Ripe</span>
                </div>
                <div>
                  <span className="text-[#607D8B] font-bold block">{currentCounts.unripe}</span>
                  <span className="text-[#607D8B] text-[10px]">Unripe</span>
                </div>
                <div>
                  <span className="text-[#E53935] font-bold block">{currentCounts.blight}</span>
                  <span className="text-[#E53935] text-[10px]">Blight</span>
                </div>
              </div>
            </div>

            {/* Size Distribution Bar Chart */}
            <div className="rounded-xl border border-[#D8E3D6] bg-white p-5 shadow-xs flex flex-col justify-between transition-colors agri-card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#174C35]">
                  Size Breakdown (cm)
                </h3>
                <BarChart3 className="h-4 w-4 text-[#2E7D32]" />
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sizeData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="name" stroke={axisStroke} fontSize={11} />
                    <YAxis stroke={axisStroke} fontSize={11} allowDecimals={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" fill="#2E7D32" radius={[8, 8, 0, 0]}>
                      {sizeData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#D8E3D6] pt-3 text-center text-xs">
                <div>
                  <span className="text-[#607D8B] font-bold block">
                    {sizeData.find((s) => s.name.includes('Small'))?.count ?? 0}
                  </span>
                  <span className="text-[#607D8B] text-[10px]">Small (&lt;6.0 cm)</span>
                </div>
                <div>
                  <span className="text-[#2E7D32] font-bold block">
                    {sizeData.find((s) => s.name.includes('Medium'))?.count ?? 0}
                  </span>
                  <span className="text-[#607D8B] text-[10px]">Medium (6.0 - 7.5 cm)</span>
                </div>
                <div>
                  <span className="text-[#174C35] font-bold block">
                    {sizeData.find((s) => s.name.includes('Large'))?.count ?? 0}
                  </span>
                  <span className="text-[#607D8B] text-[10px]">Large (&gt;7.5 cm)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Yield Runs Chart */}
          {sessionYieldData.length > 0 && (
            <div className="rounded-xl border border-[#D8E3D6] bg-white p-5 shadow-xs transition-colors agri-card-shadow">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#174C35]">
                    Historical Session Trends
                  </h3>
                  <p className="text-xs text-[#607D8B] mt-0.5">
                    Throughput and classification counts from previous runs
                  </p>
                </div>
                <TrendingUp className="h-4 w-4 text-[#2E7D32]" />
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionYieldData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="name" stroke={axisStroke} fontSize={11} />
                    <YAxis stroke={axisStroke} fontSize={11} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Bar dataKey="Ripe" stackId="a" fill="#2E7D32" />
                    <Bar dataKey="Unripe" stackId="a" fill="#81C784" />
                    <Bar dataKey="Blight" stackId="a" fill="#E53935" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
