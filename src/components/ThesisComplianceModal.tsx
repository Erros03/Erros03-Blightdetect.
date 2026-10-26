/**
 * Thesis Writing 2 Completion Form & Panel Evaluation Modal
 * Renders the full 24-point compliance audit for:
 * "BlightDetect+: An AI and IoT-Based System for Tomato Sorting, Classification, and Yield Monitoring"
 * Respondent: Department of Agriculture (DA-CVRC), Baligatan, Ilagan, Isabela
 */

import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Cpu,
  Layers,
  BookOpen,
  Download,
  Copy,
  Check,
  Search,
  ExternalLink,
  ShieldCheck,
  Building2,
  Users,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  THESIS_COMPLIANCE_ITEMS,
  BILL_OF_MATERIALS_COSTING,
  TOTAL_PROJECT_COST_PHP,
  TOTAL_PROJECT_COST_USD,
  APA_CITATIONS,
  type ComplianceItem,
} from '../data/thesis_compliance_data.ts';

interface ThesisComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThesisComplianceModal: React.FC<ThesisComplianceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'costing' | 'framework' | 'pathology' | 'apa'>('checklist');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const categories = ['All', 'Methodology & Client', 'AI & YOLOv11', 'Hardware & IoT', 'Academic & Costing'];

  const filteredItems = THESIS_COMPLIANCE_ITEMS.filter((item) => {
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    const matchesSearch =
      item.recommendation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.implementedFeature.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.technicalEvidence.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toString() === searchQuery.trim();
    return matchesCategory && matchesSearch;
  });

  const handleCopyCitation = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleExportJSON = () => {
    const exportData = {
      title: 'BlightDetect+: An AI and IoT-Based System for Tomato Sorting, Classification, and Yield Monitoring',
      institution: 'Department of Agriculture – Cagayan Valley Research Center (DA-CVRC)',
      address: 'Baligatan, Ilagan, Isabela',
      researchers: [
        'Erros Maverick F. Furigay',
        'Francis C. Lagua',
        'Angel Roxan M. Villanueva',
      ],
      course: 'Bachelor of Science in Computer Science',
      date: '10/15/2026',
      totalRecommendations: 24,
      totalCompleted: 24,
      compliancePercentage: 100,
      panelMembers: [
        'Vince Gilbert M. Cadauas (Panel Member 1)',
        'Sherwin M. Chacon (Panel Chairman)',
        'Gladys B. Amaleta (Panel Member 2)',
        'Charmie S. Calvo (Adviser & Dean)',
        'Yssandrea Knerre Del Castillo (Program Coordinator)',
      ],
      complianceItems: THESIS_COMPLIANCE_ITEMS,
      costingBOM: {
        totalPHP: TOTAL_PROJECT_COST_PHP,
        totalUSD: TOTAL_PROJECT_COST_USD,
        items: BILL_OF_MATERIALS_COSTING,
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blightdetect_thesis_completion_verified_24_items.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-5xl rounded-2xl border border-[#D8E3D6] bg-white shadow-2xl text-[#263238] flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#174C35] px-6 py-4 text-white flex items-start justify-between border-b border-[#0F3323]">
          <div>
            <div className="flex items-center space-x-2 text-xs text-[#E8F3E5] font-semibold mb-1">
              <ShieldCheck className="h-4 w-4 text-[#4CAF50]" />
              <span className="uppercase tracking-wider">THESIS WRITING 2 COMPLETION FORM COMPLIANCE</span>
              <span>•</span>
              <span className="bg-[#2E7D32] px-2 py-0.5 rounded text-[11px] font-bold text-white">
                24/24 Verified
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              BlightDetect+ Panel Evaluation & Compliance Verification
            </h2>
            <p className="text-xs text-[#D8E3D6] mt-0.5 max-w-2xl">
              Official verification for Department of Agriculture (DA-CVRC), Baligatan, Ilagan, Isabela.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#D8E3D6] hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Academic Meta Banner */}
        <div className="bg-[#F8F9F4] px-6 py-3 border-b border-[#D8E3D6] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[11px] text-[#607D8B] block">Client / Respondent</span>
            <span className="font-bold text-[#174C35] flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-[#2E7D32]" /> DA-CVRC, Baligatan
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#607D8B] block">Researchers</span>
            <span className="font-semibold text-[#263238] truncate block" title="Erros Furigay, Francis Lagua, Angel Villanueva">
              Furigay, Lagua, Villanueva
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#607D8B] block">Program & Date</span>
            <span className="font-semibold text-[#263238] flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-[#607D8B]" /> BSCS | 10/15/2026
            </span>
          </div>
          <div>
            <span className="text-[11px] text-[#607D8B] block">Adviser & Dean</span>
            <span className="font-semibold text-[#263238] truncate block" title="Charmie S. Calvo">
              Charmie S. Calvo
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#D8E3D6] bg-white px-6 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'checklist'
                ? 'border-[#2E7D32] text-[#174C35]'
                : 'border-transparent text-[#607D8B] hover:text-[#263238]'
            }`}
          >
            <CheckCircle2 className="h-4 w-4 text-[#2E7D32]" />
            <span>24 Panel Recommendations (100% Done)</span>
          </button>

          <button
            onClick={() => setActiveTab('costing')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'costing'
                ? 'border-[#2E7D32] text-[#174C35]'
                : 'border-transparent text-[#607D8B] hover:text-[#263238]'
            }`}
          >
            <DollarSign className="h-4 w-4 text-[#2E7D32]" />
            <span>Costing & BOM (Item 19)</span>
          </button>

          <button
            onClick={() => setActiveTab('framework')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'framework'
                ? 'border-[#2E7D32] text-[#174C35]'
                : 'border-transparent text-[#607D8B] hover:text-[#263238]'
            }`}
          >
            <Cpu className="h-4 w-4 text-[#2E7D32]" />
            <span>Conceptual Framework (Item 8)</span>
          </button>

          <button
            onClick={() => setActiveTab('pathology')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'pathology'
                ? 'border-[#2E7D32] text-[#174C35]'
                : 'border-transparent text-[#607D8B] hover:text-[#263238]'
            }`}
          >
            <Layers className="h-4 w-4 text-[#2E7D32]" />
            <span>Blight Criteria & Seasons (Items 15 & 20)</span>
          </button>

          <button
            onClick={() => setActiveTab('apa')}
            className={`py-3 px-4 border-b-2 flex items-center space-x-2 whitespace-nowrap cursor-pointer transition-colors ${
              activeTab === 'apa'
                ? 'border-[#2E7D32] text-[#174C35]'
                : 'border-transparent text-[#607D8B] hover:text-[#263238]'
            }`}
          >
            <BookOpen className="h-4 w-4 text-[#2E7D32]" />
            <span>APA 7th References (Item 18)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: 24 RECOMMENDATIONS CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                        categoryFilter === cat
                          ? 'bg-[#174C35] text-white shadow-xs'
                          : 'bg-[#E8F3E5] text-[#174C35] hover:bg-[#D8E3D6]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#607D8B]" />
                    <input
                      type="text"
                      placeholder="Search items, keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-[#D8E3D6] bg-white focus:outline-hidden focus:ring-1 focus:ring-[#2E7D32]"
                    />
                  </div>

                  <button
                    onClick={handleExportJSON}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#E8F3E5] text-[#174C35] border border-[#D8E3D6] rounded-lg text-xs font-semibold hover:bg-[#D8E3D6] transition-colors cursor-pointer"
                    title="Export Verification Report"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Export Audit</span>
                  </button>
                </div>
              </div>

              {/* Items Table / Cards */}
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-[#D8E3D6] bg-[#F8F9F4] hover:bg-white transition-all shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#2E7D32] text-white font-bold text-xs mt-0.5">
                          {item.id}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="text-xs font-bold text-[#174C35]">
                              {item.implementedFeature}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#E8F3E5] text-[#174C35] border border-[#D8E3D6]">
                              {item.category}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8F3E5] text-[#2E7D32] flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> {item.status}
                            </span>
                          </div>
                          
                          <p className="text-xs font-semibold text-[#263238] mt-1 italic">
                            Panel Remark: “{item.recommendation}”
                          </p>

                          <div className="mt-2 text-xs text-[#263238] space-y-1">
                            <div className="bg-white p-2.5 rounded-lg border border-[#D8E3D6]/70">
                              <span className="font-semibold text-[#174C35] block mb-0.5">
                                Technical Implementation & Evidence:
                              </span>
                              <span className="text-[#263238]">{item.technicalEvidence}</span>
                            </div>
                            <div className="text-[11px] text-[#607D8B] pl-1">
                              <span className="font-semibold text-[#607D8B]">Verification Location:</span> {item.verificationDetails}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: COSTING & BILL OF MATERIALS (Item 19) */}
          {activeTab === 'costing' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#D8E3D6] gap-2">
                <div>
                  <h3 className="text-sm font-bold text-[#174C35]">
                    Item 19: Comprehensive Bill of Materials (BOM) & Costing
                  </h3>
                  <p className="text-xs text-[#607D8B]">
                    Full financial costing for hardware fabrication, electrical regulation, and IoT actuation.
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="bg-[#E8F3E5] px-3 py-1.5 rounded-lg border border-[#D8E3D6] text-right">
                    <span className="text-[10px] text-[#607D8B] block">Total Cost (PHP)</span>
                    <span className="text-sm font-black text-[#174C35]">
                      ₱{TOTAL_PROJECT_COST_PHP.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="bg-[#F8F9F4] px-3 py-1.5 rounded-lg border border-[#D8E3D6] text-right">
                    <span className="text-[10px] text-[#607D8B] block">Total Cost (USD)</span>
                    <span className="text-sm font-bold text-[#263238]">
                      ${TOTAL_PROJECT_COST_USD.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#D8E3D6]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#174C35] text-white text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Component / Description</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price (₱)</th>
                      <th className="p-3 text-right">Total (₱)</th>
                      <th className="p-3 text-right">USD ($)</th>
                      <th className="p-3">Function / Objective</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D8E3D6] bg-white">
                    {BILL_OF_MATERIALS_COSTING.map((c, i) => (
                      <tr key={i} className="hover:bg-[#F8F9F4]">
                        <td className="p-3 font-semibold text-[#263238]">{c.item}</td>
                        <td className="p-3 text-center text-[#607D8B]">{c.qty}</td>
                        <td className="p-3 text-right text-[#607D8B]">
                          ₱{c.unitPricePHP.toLocaleString()}
                        </td>
                        <td className="p-3 text-right font-bold text-[#174C35]">
                          ₱{c.totalPHP.toLocaleString()}
                        </td>
                        <td className="p-3 text-right text-[#607D8B]">${c.usd.toFixed(2)}</td>
                        <td className="p-3 text-[11px] text-[#607D8B]">{c.purpose}</td>
                      </tr>
                    ))}
                    <tr className="bg-[#E8F3E5] font-black text-[#174C35]">
                      <td colSpan={3} className="p-3 uppercase">Total Prototype Budget</td>
                      <td className="p-3 text-right text-sm">
                        ₱{TOTAL_PROJECT_COST_PHP.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3 text-right text-sm">
                        ${TOTAL_PROJECT_COST_USD.toFixed(2)}
                      </td>
                      <td className="p-3 text-[11px]">100% Commercial Feasibility for DA-CVRC</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CONCEPTUAL FRAMEWORK (Item 8) */}
          {activeTab === 'framework' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#174C35]">
                  Item 8: Input-Process-Output (IPO) Conceptual Framework for YOLOv11
                </h3>
                <p className="text-xs text-[#607D8B]">
                  System flow model governing continuous conveyor image acquisition, botanical disease classification, and mechatronic servo actuation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Input Card */}
                <div className="p-4 rounded-xl border border-[#D8E3D6] bg-[#F8F9F4] space-y-3">
                  <div className="flex items-center space-x-2 text-[#174C35] font-bold text-xs uppercase tracking-wider pb-2 border-b border-[#D8E3D6]">
                    <span className="flex h-5 w-5 rounded-full bg-[#174C35] text-white items-center justify-center text-[10px]">1</span>
                    <span>INPUT STAGE</span>
                  </div>
                  <ul className="text-xs text-[#263238] space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D32] mt-1.5 shrink-0"></span>
                      <span>1080p Full HD video stream from overhead 28cm camera</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D32] mt-1.5 shrink-0"></span>
                      <span>Diffuse 5500K LED studio ring illuminance (850 lux)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D32] mt-1.5 shrink-0"></span>
                      <span>Continuous tomato fruit flow on matte black conveyor belt</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D32] mt-1.5 shrink-0"></span>
                      <span>Serial port handshake from Arduino controller (9600 baud)</span>
                    </li>
                  </ul>
                </div>

                {/* Process Card */}
                <div className="p-4 rounded-xl border border-[#2E7D32]/30 bg-[#E8F3E5]/50 space-y-3">
                  <div className="flex items-center space-x-2 text-[#174C35] font-bold text-xs uppercase tracking-wider pb-2 border-b border-[#D8E3D6]">
                    <span className="flex h-5 w-5 rounded-full bg-[#2E7D32] text-white items-center justify-center text-[10px]">2</span>
                    <span>PROCESS STAGE</span>
                  </div>
                  <ul className="text-xs text-[#263238] space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#174C35] mt-1.5 shrink-0"></span>
                      <span><strong>YOLOv11 Inference:</strong> C3k2 spatial feature pyramid backbone</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#174C35] mt-1.5 shrink-0"></span>
                      <span><strong>Confidence Gating:</strong> Strict 95.0% threshold check</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#174C35] mt-1.5 shrink-0"></span>
                      <span><strong>Centroid Tracking:</strong> Euclidean distance track IDs across frames</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#174C35] mt-1.5 shrink-0"></span>
                      <span><strong>Metric Estimation:</strong> 0.035 cm/px optical scale diameter computation</span>
                    </li>
                  </ul>
                </div>

                {/* Output Card */}
                <div className="p-4 rounded-xl border border-[#D8E3D6] bg-[#F8F9F4] space-y-3">
                  <div className="flex items-center space-x-2 text-[#174C35] font-bold text-xs uppercase tracking-wider pb-2 border-b border-[#D8E3D6]">
                    <span className="flex h-5 w-5 rounded-full bg-[#E53935] text-white items-center justify-center text-[10px]">3</span>
                    <span>OUTPUT STAGE</span>
                  </div>
                  <ul className="text-xs text-[#263238] space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E53935] mt-1.5 shrink-0"></span>
                      <span><strong>Servo Actuation:</strong> 4-bin diverters (S1: Unripe, S2: Small, S3: Med, S4: Large)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E53935] mt-1.5 shrink-0"></span>
                      <span><strong>Blight Quarantine:</strong> Defective fruit passes straight to cull bin</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E53935] mt-1.5 shrink-0"></span>
                      <span><strong>Telemetry Sync:</strong> Firestore session logs and yield analytics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#E53935] mt-1.5 shrink-0"></span>
                      <span><strong>DA-CVRC Advisory:</strong> Fine-tuned LLM culling action recommendations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BLIGHT CRITERIA & SEASONS (Items 15 & 20) */}
          {activeTab === 'pathology' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#174C35]">
                  Items 15 & 20: Botanical Blight Criteria & Isabela Seasonal Calendar
                </h3>
                <p className="text-xs text-[#607D8B]">
                  Specific plant pathology diagnostics and local agro-climatic disease vulnerability schedule for Baligatan, Ilagan.
                </p>
              </div>

              {/* Blight Criteria Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-[#E53935]/40 bg-[#FDECEC]/50 space-y-2">
                  <div className="text-xs font-bold text-[#C62828] uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Early Blight (Alternaria solani)</span>
                  </div>
                  <p className="text-xs text-[#263238] leading-relaxed">
                    <strong>Lesion Appearance:</strong> Dark brown to black concentric target rings (“bullseye” pattern). Typically sunken, firm, and leathery texture.
                  </p>
                  <p className="text-xs text-[#263238] leading-relaxed">
                    <strong>Infection Location:</strong> Usually initiates near the calyx/stem attachment or micro-cracks on mature fruit surface.
                  </p>
                  <div className="text-[11px] font-semibold text-[#C62828] bg-white p-2 rounded-lg border border-[#E53935]/30">
                    Action: Straight conveyor pass-through to Quarantine Cull Bin. Prohibit packing into Grade A or Grade B crates.
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-[#C62828]/40 bg-[#FDECEC]/80 space-y-2">
                  <div className="text-xs font-bold text-[#C62828] uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Late Blight (Phytophthora infestans)</span>
                  </div>
                  <p className="text-xs text-[#263238] leading-relaxed">
                    <strong>Lesion Appearance:</strong> Large, irregular water-soaked greasy olive-green to black blotches that rapidly expand and turn soft/foul.
                  </p>
                  <p className="text-xs text-[#263238] leading-relaxed">
                    <strong>Fungal Bloom:</strong> Under relative humidity &gt;85%, white downy cotton-like sporulation forms on lesion margins.
                  </p>
                  <div className="text-[11px] font-semibold text-[#C62828] bg-white p-2 rounded-lg border border-[#C62828]/30">
                    Action: Immediate destruction & culling. Trigger 0.1% sodium hypochlorite belt decontamination protocol.
                  </div>
                </div>
              </div>

              {/* Seasonal Calendar Table */}
              <div className="rounded-xl border border-[#D8E3D6] overflow-hidden">
                <div className="bg-[#174C35] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider">
                  DA-CVRC Isabela Seasonal Blight Vulnerability Schedule
                </div>
                <div className="p-4 bg-white text-xs space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg border border-[#E53935]/40 bg-[#FDECEC] text-[#C62828]">
                      <div className="font-bold text-xs">HIGH RISK: Wet Season</div>
                      <div className="text-[11px] font-semibold mt-0.5">October to January (Amihan)</div>
                      <div className="text-[11px] text-[#263238] mt-1">
                        High rainfall, RH 85–95%, temps 22–27°C. Critical peak for Alternaria and Phytophthora spores. 95% automated sorting mandatory.
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-[#D8E3D6] bg-[#F8F9F4] text-[#607D8B]">
                      <div className="font-bold text-xs text-[#174C35]">MODERATE RISK: Transition</div>
                      <div className="text-[11px] font-semibold mt-0.5">February to March</div>
                      <div className="text-[11px] text-[#263238] mt-1">
                        Intermittent rains, morning dew. Monitor post-harvest shelf life; store ripe fruit at 12–15°C.
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-[#2E7D32]/30 bg-[#E8F3E5] text-[#2E7D32]">
                      <div className="font-bold text-xs text-[#174C35]">LOW RISK: Dry Season</div>
                      <div className="text-[11px] font-semibold mt-0.5">April to June</div>
                      <div className="text-[11px] text-[#263238] mt-1">
                        High ambient temperature (34–38°C) and low humidity naturally inhibit fungal germination. Focus on size grading.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: APA 7TH REFERENCES (Item 18) */}
          {activeTab === 'apa' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#D8E3D6]">
                <div>
                  <h3 className="text-sm font-bold text-[#174C35]">
                    Item 18: APA 7th Edition Academic Reference Bibliography
                  </h3>
                  <p className="text-xs text-[#607D8B]">
                    Properly formatted academic citations supporting the YOLOv11 model, pathology, and DA-CVRC protocols.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {APA_CITATIONS.map((cite, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl border border-[#D8E3D6] bg-[#F8F9F4] text-xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-serif text-[#263238] leading-relaxed pl-6 -indent-6">
                        {cite.citation}
                      </p>
                      <button
                        onClick={() => handleCopyCitation(cite.citation, index)}
                        className="p-1.5 rounded-lg bg-white border border-[#D8E3D6] hover:bg-[#E8F3E5] text-[#174C35] transition-colors cursor-pointer shrink-0"
                        title="Copy APA Citation"
                      >
                        {copiedIndex === index ? (
                          <Check className="h-4 w-4 text-[#2E7D32]" />
                        ) : (
                          <Copy className="h-4 w-4 text-[#607D8B]" />
                        )}
                      </button>
                    </div>
                    <div className="text-[11px] text-[#607D8B] bg-white p-2 rounded-lg border border-[#D8E3D6]/70">
                      <strong>Relevance to Thesis:</strong> {cite.annotation}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#F8F9F4] px-6 py-3 border-t border-[#D8E3D6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-[#607D8B]">
            Verified for Thesis Completion • SY 2026–2027 • BSCS Capstone Defense
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportJSON}
              className="px-4 py-2 bg-[#E8F3E5] text-[#174C35] font-semibold rounded-lg border border-[#D8E3D6] hover:bg-[#D8E3D6] transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Download Official Audit (.json)</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#174C35] text-white font-semibold rounded-lg hover:bg-[#0F3323] transition-colors cursor-pointer"
            >
              Close Verification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
