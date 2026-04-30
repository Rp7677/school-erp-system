import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import api from '../../../../config/api';
import { toast, Toaster } from 'react-hot-toast';
import AutoBreadcrumb from '../../../../components/common/AutoBreadcrumb';
import {
  Users, GraduationCap, CheckCircle2, Clock, AlertCircle, XCircle,
  FileText, Eye, Download, Search, RefreshCw, Filter, ChevronDown,
  ChevronRight, BookOpen, Award, Target, TrendingUp, BarChart3,
  PieChart, Activity, Layers, Loader2, FilterX, CreditCard, Calendar,
  Phone, MapPin, User, X, Heart, Bus, Hash, Building2, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Zap, Star, DollarSign, CheckCircle
} from 'lucide-react';

// ─── Status helpers ────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  ADMISSION_CONFIRMED: { label: 'Confirmed', color: 'emerald', group: 'confirmed' },
  ACTIVE: { label: 'Active', color: 'emerald', group: 'confirmed' },
  PENDING_PAYMENT: { label: 'Pending Payment', color: 'amber', group: 'pending' },
  DOCUMENTS_APPROVED: { label: 'Docs Approved', color: 'blue', group: 'pending' },
  counselor_rejected: { label: 'Counselor Rej.', color: 'red', group: 'rejected' },
  principal_rejected: { label: 'Principal Rej.', color: 'red', group: 'rejected' },
  INACTIVE: { label: 'Inactive', color: 'gray', group: 'rejected' },
};

const getStatusCls = (status) => {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-400/20',
    amber: 'bg-amber-500/10  text-amber-600  border-amber-400/20',
    blue: 'bg-blue-500/10   text-blue-600   border-blue-400/20',
    red: 'bg-red-500/10    text-red-500    border-red-400/20',
    gray: 'bg-gray-500/10   text-gray-500   border-gray-400/20',
  };
  const cfg = STATUS_CONFIG[status];
  return colorMap[cfg?.color || 'gray'];
};

const StatusBadge = ({ status }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusCls(status)}`}>
    {STATUS_CONFIG[status]?.label || (status?.replace(/_/g, ' ') || 'PENDING')}
  </span>
);

// ─── Aggregate admissions by grade ────────────────────────────────────────
const aggregateByGrade = (admissions) => {
  const map = {};
  admissions.forEach((a) => {
    const gradeId = a.gradeApplyingfor?.gradeId ?? a.classId ?? 'Unknown';
    const label = gradeId !== 'Unknown' ? `Grade ${gradeId}` : 'Unknown';
    const status = a.admissionStatus || a.status || '';
    const group = STATUS_CONFIG[status]?.group || 'pending';
    const amount = Number(a.amount) || 0;
    const paid = a.paymentStatus === 'PAID' || a.paymentStatus === 'SUCCESS' ? amount : 0;

    if (!map[gradeId]) {
      map[gradeId] = {
        gradeId, label,
        total: 0, confirmed: 0, pending: 0, rejected: 0,
        totalFees: 0, paidFees: 0, statusBreakdown: {}
      };
    }
    const g = map[gradeId];
    g.total++;
    if (group === 'confirmed') g.confirmed++;
    else if (group === 'pending') g.pending++;
    else g.rejected++;
    g.totalFees += amount;
    g.paidFees += paid;
    g.statusBreakdown[status] = (g.statusBreakdown[status] || 0) + 1;
  });

  return Object.values(map).sort((a, b) => {
    const n1 = parseInt(a.gradeId), n2 = parseInt(b.gradeId);
    if (!isNaN(n1) && !isNaN(n2)) return n1 - n2;
    return String(a.gradeId).localeCompare(String(b.gradeId));
  });
};

// ─── Donut Chart ──────────────────────────────────────────────────────────
const DonutChart = ({ data, size = 160, strokeWidth = 22 }) => {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      {data.map((d, i) => {
        const pct = d.value / total;
        const dash = pct * circ;
        const gap = circ - dash;
        const el = (
          <motion.circle
            key={i}
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={d.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset * circ}
            strokeLinecap="butt"
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${dash} ${gap}` }}
            transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }}
          />
        );
        offset += pct;
        return el;
      })}
    </svg>
  );
};

// ─── Mini Bar Chart (SVG) ─────────────────────────────────────────────────
const MiniBarChart = ({ data, isDark }) => {
  const max = Math.max(...data.map(d => d.total), 1);
  const W = 420, H = 180, padL = 30, padB = 28, padR = 10, padT = 10;
  const chartW = W - padL - padR;
  const chartH = H - padB - padT;
  const bw = Math.max((chartW / data.length) - 6, 4);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {/* Y gridlines */}
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <line key={i}
          x1={padL} y1={padT + chartH * (1 - f)}
          x2={W - padR} y2={padT + chartH * (1 - f)}
          stroke={isDark ? '#2a2a2a' : '#f0f0f0'} strokeWidth="1"
        />
      ))}
      {data.map((d, i) => {
        const x = padL + (i / data.length) * chartW + ((chartW / data.length) - bw) / 2;
        const confirmedH = (d.confirmed / max) * chartH;
        const pendingH = (d.pending / max) * chartH;
        const rejectedH = (d.rejected / max) * chartH;
        const stackH = confirmedH + pendingH + rejectedH;
        const y0 = padT + chartH;
        const bwSeg = bw / 3;

        return (
          <g key={i}>
            {/* Confirmed (emerald) */}
            <motion.rect x={x} y={y0 - confirmedH} width={bw} height={confirmedH}
              fill="#10b981" rx="2"
              initial={{ height: 0, y: y0 }} animate={{ height: confirmedH, y: y0 - confirmedH }}
              transition={{ duration: 0.7, delay: i * 0.05 }}
            />
            {/* Pending (amber) — stacked */}
            <motion.rect x={x} y={y0 - confirmedH - pendingH} width={bw} height={pendingH}
              fill="#f59e0b" rx="2"
              initial={{ height: 0, y: y0 - confirmedH }} animate={{ height: pendingH, y: y0 - confirmedH - pendingH }}
              transition={{ duration: 0.7, delay: i * 0.05 + 0.1 }}
            />
            {/* Rejected (red) — stacked */}
            <motion.rect x={x} y={y0 - confirmedH - pendingH - rejectedH} width={bw} height={rejectedH}
              fill="#ef4444" rx="2"
              initial={{ height: 0, y: y0 - confirmedH - pendingH }} animate={{ height: rejectedH, y: y0 - confirmedH - pendingH - rejectedH }}
              transition={{ duration: 0.7, delay: i * 0.05 + 0.2 }}
            />
            {/* X label */}
            <text x={x + bw / 2} y={H - 6} textAnchor="middle"
              fontSize="8" fill={isDark ? '#555' : '#9ca3af'}
              className="font-medium"
            >
              {String(d.label).replace('Grade ', 'G')}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

// ─── Line Trend Chart (SVG) ───────────────────────────────────────────────
const TrendLine = ({ data, isDark }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data.map(d => d.value), 1);
  const W = 420, H = 100;
  const pts = data.map((d, i) => {
    const x = 20 + (i / (data.length - 1)) * (W - 40);
    const y = 10 + (1 - d.value / max) * (H - 30);
    return { x, y, ...d };
  });
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${path} L ${pts[pts.length - 1].x} ${H} L ${pts[0].x} ${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <defs>
        <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#tg)" />
      <motion.path d={path} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: 'easeOut' }}
      />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#3b82f6" />
          <text x={p.x} y={H - 2} textAnchor="middle" fontSize="8" fill={isDark ? '#555' : '#9ca3af'}>{p.label}</text>
        </g>
      ))}
    </svg>
  );
};

// ══════════════════════════════════════════════════════════════════════════
const AdmissionDashboard = () => {
  const { selectedCampus, campuses, superAdmin } = useSelector((s) => s.campus);
  const themeMode = useSelector((s) => s.color.mode);
  const isDark = themeMode === 'dark';

  // ── Data State ──────────────────────────────────────────────────────────
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartTab, setChartTab] = useState('status'); // 'status' | 'grade' | 'trends'
  const [searchQuery, setSearchQuery] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState('all');

  // ── Filters ─────────────────────────────────────────────────────────────
  const [academicYears, setAcademicYears] = useState([]);
  const [academicYearId, setAcademicYearId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [grades, setGrades] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [tempCampusId, setTempCampusId] = useState('');
  const [showGradeDD, setShowGradeDD] = useState(false);
  const gradeRef = useRef(null);

  // ── Styles ───────────────────────────────────────────────────────────────
  const bg = isDark ? 'bg-[#0c0c0c]' : 'bg-[#f4f6fb]';
  const card = `rounded-2xl border transition-all ${isDark ? 'bg-[#141414] border-white/[0.06] shadow-black/40' : 'bg-white border-gray-200/80 shadow-sm shadow-gray-200/60'}`;
  const inp = `w-full px-3.5 py-2.5 rounded-xl border outline-none transition-all text-sm font-medium ${isDark ? 'bg-[#1c1c1c] border-white/10 text-white focus:border-primary' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-primary focus:bg-white'}`;
  const lbl = `block text-[10px] font-black uppercase mb-1.5 tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`;
  const thC = `px-4 py-3.5 text-left text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-gray-400 bg-[#1a1a1a]' : 'text-gray-500 bg-gray-50/80'}`;
  const tdC = `px-4 py-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const trH = `border-b transition-all ${isDark ? 'border-white/[0.04] hover:bg-white/[0.03]' : 'border-gray-100 hover:bg-primary/[0.02]'}`;
  const txt1 = isDark ? 'text-white' : 'text-gray-900';
  const txt2 = isDark ? 'text-gray-400' : 'text-gray-500';
  const txt3 = isDark ? 'text-gray-600' : 'text-gray-400';

  const getCampusId = () => superAdmin ? tempCampusId : selectedCampus;

  // ── Click-outside grade dropdown ─────────────────────────────────────────
  useEffect(() => {
    const h = (e) => { if (gradeRef.current && !gradeRef.current.contains(e.target)) setShowGradeDD(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Load academic years ───────────────────────────────────────────────────
  useEffect(() => {
    api.get('/api/academic-years/get-all-academic-year')
      .then(r => setAcademicYears(r.data || []))
      .catch(() => { });
  }, []);

  // ── Load branches when campus changes ────────────────────────────────────
  useEffect(() => {
    const cid = getCampusId();
    if (!cid) return;
    api.get(`/api/branches/campus/${cid}`)
      .then(r => setBranches(r.data || []))
      .catch(() => { });
  }, [selectedCampus, tempCampusId]);

  // ── Load grades when branch changes ──────────────────────────────────────
  useEffect(() => {
    if (!selectedBranch) { setGrades([]); return; }
    api.get(`/api/branches/${selectedBranch}/grades`)
      .then(r => setGrades(r.data || []))
      .catch(() => { });
  }, [selectedBranch]);

  // ── Default campus for super admin ───────────────────────────────────────
  useEffect(() => {
    if (superAdmin && campuses?.length > 0 && !tempCampusId)
      setTempCampusId(campuses[0].campusId || campuses[0].id);
  }, [campuses, superAdmin]);

  // ── Main data fetch ───────────────────────────────────────────────────────
  const fetchData = async () => {
    const campusId = getCampusId();
    if (!campusId) { setAdmissions([]); return; }
    setLoading(true);
    try {
      let response;
      if (academicYearId && selectedBranch && selectedGrades.length > 0) {
        response = await api.post(
          `/api/admission/getEnrollmentsMultiGrade/${academicYearId}`,
          { branchGradeIds: selectedGrades.map(Number) }
        );
      } else if (academicYearId && selectedBranch) {
        response = await api.get(
          `/api/admission/getEnrollmentsByBranchGradeAndAcademicYear/${selectedBranch}/${academicYearId}`
        );
      } else if (academicYearId) {
        response = await api.get(`/api/admission/getEnrollmentsBy/${academicYearId}`);
      } else {
        response = await api.get(`/api/admission/alladmission/${campusId}`);
      }
      const raw = response.data?.content || response.data || [];
      setAdmissions(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch admissions');
      setAdmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [academicYearId, selectedBranch, selectedGrades, selectedCampus, tempCampusId]);

  // ── Computed analytics from real data ────────────────────────────────────
  const gradeData = useMemo(() => aggregateByGrade(admissions), [admissions]);

  const stats = useMemo(() => {
    let confirmed = 0, pending = 0, rejected = 0, totalFees = 0, paidFees = 0;
    admissions.forEach(a => {
      const status = a.admissionStatus || a.status || '';
      const group = STATUS_CONFIG[status]?.group || 'pending';
      if (group === 'confirmed') confirmed++;
      else if (group === 'pending') pending++;
      else rejected++;
      totalFees += Number(a.amount) || 0;
      if (a.paymentStatus === 'PAID' || a.paymentStatus === 'SUCCESS')
        paidFees += Number(a.amount) || 0;
    });
    return { total: admissions.length, confirmed, pending, rejected, totalFees, paidFees };
  }, [admissions]);

  // Status breakdown for pie chart
  const statusBreakdown = useMemo(() => {
    const map = {};
    admissions.forEach(a => {
      const s = a.admissionStatus || a.status || 'UNKNOWN';
      map[s] = (map[s] || 0) + 1;
    });
    const COLOR_MAP = {
      ADMISSION_CONFIRMED: '#10b981', ACTIVE: '#10b981',
      PENDING_PAYMENT: '#f59e0b', DOCUMENTS_APPROVED: '#3b82f6',
      counselor_rejected: '#ef4444', principal_rejected: '#ef4444',
      INACTIVE: '#6b7280',
    };
    return Object.entries(map).map(([k, v]) => ({
      label: STATUS_CONFIG[k]?.label || k.replace(/_/g, ' '),
      value: v,
      color: COLOR_MAP[k] || '#6b7280',
    }));
  }, [admissions]);

  // Grade trend data for line chart
  const gradeTrend = useMemo(() =>
    gradeData.slice(0, 10).map(g => ({ label: g.label.replace('Grade ', 'G'), value: g.total })),
    [gradeData]
  );

  // ── Table filter ─────────────────────────────────────────────────────────
  const filteredGrades = useMemo(() => {
    let rows = gradeData;
    if (searchQuery) {
      rows = rows.filter(g => g.label.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (tableStatusFilter !== 'all') {
      rows = rows.filter(g => {
        if (tableStatusFilter === 'confirmed') return g.confirmed > 0;
        if (tableStatusFilter === 'pending') return g.pending > 0;
        if (tableStatusFilter === 'rejected') return g.rejected > 0;
        return true;
      });
    }
    return rows;
  }, [gradeData, searchQuery, tableStatusFilter]);

  const formatCurrency = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const handleReset = () => {
    setAcademicYearId(null);
    setSelectedBranch(null);
    setSelectedGrades([]);
    setSearchQuery('');
    setTableStatusFilter('all');
    if (superAdmin && campuses?.length > 0)
      setTempCampusId(campuses[0].campusId || campuses[0].id);
  };

  // ── Stat cards config ─────────────────────────────────────────────────────
  const statCards = [
    {
      label: 'Total Applications', value: stats.total, icon: Users,
      color: 'text-primary', bg: 'bg-primary/10', badge: 'bg-primary/10 text-primary',
      badgeText: 'All', delay: 0,
    },
    {
      label: 'Confirmed / Active', value: stats.confirmed, icon: CheckCircle2,
      color: 'text-emerald-500', bg: 'bg-emerald-500/10', badge: 'bg-emerald-500/10 text-emerald-600',
      badgeText: `${stats.total ? Math.round((stats.confirmed / stats.total) * 100) : 0}%`, delay: 0.08,
    },
    {
      label: 'Pending / In Progress', value: stats.pending, icon: Clock,
      color: 'text-amber-500', bg: 'bg-amber-500/10', badge: 'bg-amber-500/10 text-amber-600',
      badgeText: `${stats.total ? Math.round((stats.pending / stats.total) * 100) : 0}%`, delay: 0.16,
    },
    {
      label: 'Rejected / Inactive', value: stats.rejected, icon: XCircle,
      color: 'text-red-500', bg: 'bg-red-500/10', badge: 'bg-red-500/10 text-red-500',
      badgeText: `${stats.total ? Math.round((stats.rejected / stats.total) * 100) : 0}%`, delay: 0.24,
    },
  ];

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen md:p-1 lg:p-2 ${bg}`}>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: isDark ? '#1a1a1a' : '#fff',
          color: isDark ? '#fff' : '#111',
          border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
          borderRadius: '12px', fontSize: '13px', fontWeight: 600,
        }
      }} />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="mb-2 md:mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <h1 className={`text-2xl md:text-3xl font-black uppercase tracking-tight ${txt1}`}>
                Admission <span className="text-primary">Dashboard</span>
              </h1>
              {loading && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest ml-0.5 ${txt3}`}>
              Enrollment Management & Analytics · <AutoBreadcrumb />
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${isDark ? 'bg-white/8 hover:bg-white/12 text-gray-300' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm'}`}
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
        </div>

        {/* ── Filter Bar ──────────────────────────────────────────────── */}
        <div className={`${card} p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-primary" />
            <span className={`text-[10px] font-black uppercase tracking-widest text-primary`}>Filter Configuration</span>
          </div>
          <div className={`grid gap-3 ${superAdmin ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'}`}>
            {/* Academic Year */}
            <div>
              <label className={lbl}>Academic Year</label>
              <div className="relative">
                <select
                  value={academicYearId || ''}
                  onChange={e => { setAcademicYearId(Number(e.target.value) || null); setSelectedBranch(null); setSelectedGrades([]); }}
                  className={`${inp} appearance-none`}
                >
                  <option value="">All Years</option>
                  {academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-40" />
              </div>
            </div>

            {/* Campus — super admin only */}
            {superAdmin && (
              <div>
                <label className={lbl}>Campus</label>
                <div className="relative">
                  <select
                    value={tempCampusId}
                    onChange={e => { setTempCampusId(e.target.value); setSelectedBranch(null); setSelectedGrades([]); }}
                    className={`${inp} appearance-none`}
                  >
                    <option value="">Select Campus</option>
                    {campuses?.map(c => (
                      <option key={c.campusId || c.id} value={c.campusId || c.id}>{c.campusName}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-40" />
                </div>
              </div>
            )}

            {/* Branch */}
            <div>
              <label className={lbl}>Branch</label>
              <div className="relative">
                <select
                  value={selectedBranch || ''}
                  onChange={e => { setSelectedBranch(Number(e.target.value) || null); setSelectedGrades([]); }}
                  className={`${inp} appearance-none`}
                >
                  <option value="">All Branches</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.campusName} — {b.boardName} — {b.mediumName}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-40" />
              </div>
            </div>

            {/* Grades multi-select */}
            <div ref={gradeRef} className="relative">
              <label className={lbl}>Grades</label>
              <button
                type="button"
                disabled={!selectedBranch}
                onClick={() => selectedBranch && setShowGradeDD(v => !v)}
                className={`${inp} flex items-center justify-between ${!selectedBranch ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="truncate text-sm">
                  {selectedGrades.length === 0 ? 'All Grades' : `${selectedGrades.length} grade${selectedGrades.length > 1 ? 's' : ''} selected`}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${showGradeDD ? 'rotate-180' : ''}`} />
              </button>
              {showGradeDD && (
                <div className={`absolute z-30 w-full mt-1 rounded-xl border shadow-2xl ${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-200'}`}>
                  <div className="p-2 space-y-0.5">
                    <label className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                      <input
                        type="checkbox"
                        checked={grades.length > 0 && selectedGrades.length === grades.length}
                        onChange={() => setSelectedGrades(selectedGrades.length === grades.length ? [] : grades.map(g => g.id))}
                        className="w-4 h-4 rounded" style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <span className="text-xs font-black uppercase tracking-wider text-primary">Select All</span>
                    </label>
                    <div className={`h-px my-1 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                    <div className="max-h-44 overflow-y-auto space-y-0.5">
                      {grades.map(g => (
                        <label key={g.id} className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                          <input
                            type="checkbox"
                            checked={selectedGrades.includes(g.id)}
                            onChange={() => setSelectedGrades(prev =>
                              prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id]
                            )}
                            className="w-4 h-4 rounded" style={{ accentColor: 'var(--color-primary)' }}
                          />
                          <span className="text-sm">{g.gradeName}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={handleReset}
                className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${isDark ? 'border-white/10 bg-white/5 hover:bg-white/10 text-gray-300' : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-sm'}`}
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Status chips */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-dashed border-gray-200/30">
            {[
              { l: 'Year', done: !!academicYearId },
              { l: 'Branch', done: !!selectedBranch },
              { l: 'Grade(s)', done: selectedGrades.length > 0 },
            ].map(({ l, done }) => (
              <span key={l} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${done ? 'bg-emerald-500/10 text-emerald-600 border-emerald-400/20' : isDark ? 'bg-white/5 text-gray-500 border-white/5' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                {done ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}{l}
              </span>
            ))}
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-primary/10 text-primary border-primary/20">
              <Users className="w-2.5 h-2.5" />{admissions.length} admissions loaded
            </span>
          </div>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: s.delay, duration: 0.4 }}
            className={`${card} p-5 hover:scale-[1.02] transition-transform cursor-default`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${s.badge}`}>
                {s.badgeText}
              </span>
            </div>
            <p className={`text-2xl md:text-3xl font-black ${txt1} mb-0.5`}>
              {loading ? '—' : s.value.toLocaleString('en-IN')}
            </p>
            <p className={`text-xs font-semibold ${txt2}`}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Summary Card */}
      {(stats.totalFees > 0) && (
        <div className={`${card} p-5 mb-6`}>
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-wider ${txt3}`}>Total Fee Collection</p>
                <p className={`text-xl font-black ${txt1}`}>{formatCurrency(stats.totalFees)}</p>
              </div>
            </div>
            <div className={`h-8 w-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
            <div>
              <p className={`text-[10px] font-black uppercase tracking-wider ${txt3}`}>Collected</p>
              <p className="text-xl font-black text-emerald-500">{formatCurrency(stats.paidFees)}</p>
            </div>
            <div className={`h-8 w-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
            <div>
              <p className={`text-[10px] font-black uppercase tracking-wider ${txt3}`}>Outstanding</p>
              <p className="text-xl font-black text-amber-500">{formatCurrency(stats.totalFees - stats.paidFees)}</p>
            </div>
            <div className="flex-1 min-w-48">
              <div className="flex justify-between mb-1">
                <p className={`text-[10px] font-bold ${txt3}`}>Collection Rate</p>
                <p className={`text-[10px] font-black text-primary`}>
                  {stats.totalFees ? Math.round((stats.paidFees / stats.totalFees) * 100) : 0}%
                </p>
              </div>
              <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'} overflow-hidden`}>
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.totalFees ? (stats.paidFees / stats.totalFees) * 100 : 0}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Charts Row ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Analytics Card (2 cols wide) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`${card} lg:col-span-2 p-5`}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className={`text-sm font-black uppercase tracking-wider ${txt1}`}>Admission Analytics</span>
            </div>
            <div className="flex gap-1.5">
              {[
                { k: 'status', l: 'Status' },
                { k: 'grade', l: 'Grade' },
                { k: 'trends', l: 'Trends' },
              ].map(({ k, l }) => (
                <button
                  key={k}
                  onClick={() => setChartTab(k)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${chartTab === k ? 'bg-primary text-white shadow-lg shadow-primary/20' : isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">

            {chartTab === 'grade' && (
              <motion.div key="grade"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                {gradeData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <BarChart3 className={`w-10 h-10 ${txt3}`} />
                    <p className={`text-sm font-bold ${txt2}`}>No grade data available</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-3">
                      <MiniBarChart data={gradeData} isDark={isDark} />
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />Confirmed</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />Pending</span>
                      <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />Rejected</span>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {chartTab === 'status' && (
              <motion.div key="status"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="space-y-4"
              >
                {admissions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <PieChart className={`w-10 h-10 ${txt3}`} />
                    <p className={`text-sm font-bold ${txt2}`}>No admission data loaded</p>
                    <p className={`text-xs ${txt3}`}>Apply filters above to load data</p>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Donut */}
                    <div className="relative shrink-0">
                      <DonutChart data={statusBreakdown} size={160} strokeWidth={22} />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <p className={`text-xl font-black ${txt1}`}>{stats.total}</p>
                          <p className={`text-[10px] font-bold ${txt3}`}>Total</p>
                        </div>
                      </div>
                    </div>
                    {/* Legend */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                      {statusBreakdown.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.06 }}
                          className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'bg-white/[0.03] border-white/5' : 'bg-gray-50 border-gray-100'}`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: s.color }} />
                            <span className={`text-xs font-semibold truncate ${txt1}`}>{s.label}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-xs font-black ${txt2}`}>{s.value}</span>
                            <span className={`text-[10px] font-bold ${txt3}`}>
                              ({stats.total ? Math.round((s.value / stats.total) * 100) : 0}%)
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {chartTab === 'trends' && (
              <motion.div key="trends"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                {gradeTrend.length < 2 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Activity className={`w-10 h-10 ${txt3}`} />
                    <p className={`text-sm font-bold ${txt2}`}>Need 2+ grades for trend view</p>
                  </div>
                ) : (
                  <>
                    <p className={`text-xs font-bold ${txt3} mb-3`}>Applications per grade (top 10)</p>
                    <TrendLine data={gradeTrend} isDark={isDark} />
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Insights Card (1 col) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`${card} p-5`}
        >
          <div className="flex items-center gap-2 mb-5">
            <Target className="w-4 h-4 text-primary" />
            <span className={`text-sm font-black uppercase tracking-wider ${txt1}`}>Key Insights</span>
          </div>

          <div className="space-y-4">
            {/* Confirmation rate */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold text-emerald-600`}>Confirmation Rate</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600">
                {stats.total ? Math.round((stats.confirmed / stats.total) * 100) : 0}%
              </p>
              <p className={`text-[11px] ${txt3} mt-1`}>{stats.confirmed} of {stats.total} applications</p>
            </div>

            {/* Top grade by volume */}
            {gradeData.length > 0 && (() => {
              const top = [...gradeData].sort((a, b) => b.total - a.total)[0];
              return (
                <div className={`p-4 rounded-xl ${isDark ? 'bg-white/[0.03] border border-white/5' : 'bg-gray-50 border border-gray-100'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span className={`text-[10px] font-black uppercase tracking-wider ${txt3}`}>Highest Applications</span>
                  </div>
                  <p className={`text-lg font-black ${txt1}`}>{top.label}</p>
                  <p className={`text-xs ${txt2}`}>{top.total} applications · {Math.round((top.confirmed / top.total) * 100)}% confirmed</p>
                </div>
              );
            })()}

            {/* Grade breakdown mini list */}
            <div>
              <p className={`text-[10px] font-black uppercase tracking-wider ${txt3} mb-3`}>Grade Overview</p>
              <div className="space-y-2.5">
                {gradeData.slice(0, 6).map((g, i) => (
                  <div key={g.gradeId} className="flex items-center gap-2">
                    <span className={`text-xs font-semibold ${txt2} w-16 shrink-0`}>{g.label}</span>
                    <div className={`flex-1 h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'} overflow-hidden`}>
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${gradeData[0]?.total ? (g.total / gradeData[0].total) * 100 : 0}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                      />
                    </div>
                    <span className={`text-[10px] font-black ${txt3} w-5 text-right`}>{g.total}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending alert */}
            {stats.pending > 0 && (
              <div className={`p-3.5 rounded-xl flex items-center gap-3 ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-100'}`}>
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <p className="text-xs font-black text-amber-600">{stats.pending} applications pending</p>
                  <p className={`text-[10px] ${txt3}`}>Require review or payment</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Grade-wise Table ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className={`${card} overflow-hidden`}
      >
        {/* Table Header */}
        <div className={`px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b ${isDark ? 'border-white/5 bg-white/[0.015]' : 'border-gray-100 bg-gray-50/60'}`}>
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary" />
            <span className={`text-[10px] font-black uppercase tracking-widest ${txt1}`}>Grade-wise Admission Summary</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20">
              {filteredGrades.length} grades
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${txt3}`} />
              <input
                type="text"
                placeholder="Search grade..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={`${inp} pl-9 py-2 text-sm w-full sm:w-44`}
              />
            </div>
            {/* Status filter */}
            <div className="relative">
              <select
                value={tableStatusFilter}
                onChange={e => setTableStatusFilter(e.target.value)}
                className={`${inp} py-2 text-sm pr-8 appearance-none`}
              >
                <option value="all">All Status</option>
                <option value="confirmed">Has Confirmed</option>
                <option value="pending">Has Pending</option>
                <option value="rejected">Has Rejected</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-40" />
            </div>
            <button
              onClick={fetchData}
              className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              title="Refresh"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!loading && filteredGrades.length > 0 && (
          <div className={`px-5 py-2 border-b text-[10px] font-medium flex items-center gap-1.5 ${isDark ? 'border-white/5 text-gray-600' : 'border-gray-100 text-gray-400'}`}>
            <Eye className="w-2.5 h-2.5" /> Showing admission counts aggregated by grade
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                <th className={`${thC} w-10`}>#</th>
                <th className={thC}>Grade</th>
                <th className={thC}>Total</th>
                <th className={thC}>Confirmed</th>
                <th className={thC}>Pending</th>
                <th className={thC}>Rejected</th>
                <th className={thC}>Confirm Rate</th>
                <th className={thC}>Total Fees</th>
                <th className={thC}>Fee Collection</th>
                <th className={`${thC} text-center`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className={`text-sm font-semibold ${txt2}`}>Loading admissions…</span>
                    </div>
                  </td>
                </tr>
              ) : filteredGrades.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-16 text-center">
                    <FilterX className={`w-9 h-9 mx-auto mb-3 ${txt3}`} />
                    <p className={`text-sm font-bold ${txt2}`}>No grade data found</p>
                    <p className={`text-xs mt-1 ${txt3}`}>
                      {admissions.length === 0 ? 'Select filters above to load admission data' : 'Try adjusting your search or filters'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredGrades.map((g, idx) => {
                  const confirmRate = g.total ? Math.round((g.confirmed / g.total) * 100) : 0;
                  const feeRate = g.totalFees ? Math.round((g.paidFees / g.totalFees) * 100) : 0;
                  return (
                    <motion.tr
                      key={g.gradeId}
                      className={`${trH} group`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      {/* # */}
                      <td className={`${tdC} text-[10px] font-black text-primary/40`}>
                        {String(idx + 1).padStart(2, '0')}
                      </td>

                      {/* Grade */}
                      <td className={tdC}>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xs shrink-0 shadow-lg shadow-primary/20 group-hover:rotate-6 transition-transform">
                            {String(g.gradeId).substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-black text-xs tracking-tight">{g.label}</p>
                            <p className={`text-[10px] ${txt3}`}>{Object.keys(g.statusBreakdown).length} status types</p>
                          </div>
                        </div>
                      </td>

                      {/* Total */}
                      <td className={tdC}>
                        <span className={`font-black text-sm ${txt1}`}>{g.total}</span>
                      </td>

                      {/* Confirmed */}
                      <td className={tdC}>
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="text-emerald-500 font-black text-sm">{g.confirmed}</span>
                        </div>
                      </td>

                      {/* Pending */}
                      <td className={tdC}>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span className="text-amber-500 font-black text-sm">{g.pending}</span>
                        </div>
                      </td>

                      {/* Rejected */}
                      <td className={tdC}>
                        <div className="flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-red-500" />
                          <span className="text-red-500 font-black text-sm">{g.rejected}</span>
                        </div>
                      </td>

                      {/* Confirmation Rate */}
                      <td className={tdC}>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className={`w-16 h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'} overflow-hidden`}>
                              <motion.div
                                className={`h-full rounded-full ${confirmRate >= 75 ? 'bg-emerald-500' : confirmRate >= 50 ? 'bg-blue-500' : confirmRate >= 25 ? 'bg-amber-500' : 'bg-red-500'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${confirmRate}%` }}
                                transition={{ duration: 0.8, delay: idx * 0.04 }}
                              />
                            </div>
                            <span className={`text-xs font-black ${txt1}`}>{confirmRate}%</span>
                          </div>
                        </div>
                      </td>

                      {/* Total Fees */}
                      <td className={tdC}>
                        {g.totalFees > 0 ? (
                          <div>
                            <p className={`font-black text-xs ${txt1}`}>{formatCurrency(g.totalFees)}</p>
                            <p className={`text-[10px] text-emerald-500`}>{formatCurrency(g.paidFees)} paid</p>
                          </div>
                        ) : (
                          <span className={`text-xs ${txt3}`}>—</span>
                        )}
                      </td>

                      {/* Fee Collection progress */}
                      <td className={tdC}>
                        {g.totalFees > 0 ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-16 h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'} overflow-hidden`}>
                                <motion.div
                                  className={`h-full rounded-full ${feeRate === 100 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : feeRate >= 50 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-gradient-to-r from-amber-500 to-orange-400'}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${feeRate}%` }}
                                  transition={{ duration: 0.8, delay: idx * 0.04 }}
                                />
                              </div>
                              <span className={`text-xs font-black ${txt1}`}>{feeRate}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {feeRate === 100 ? (
                                <><CheckCircle2 className="w-3 h-3 text-emerald-500" /><span className="text-[10px] font-black text-emerald-500">Complete</span></>
                              ) : feeRate > 0 ? (
                                <><Clock className="w-3 h-3 text-amber-500" /><span className="text-[10px] font-black text-amber-500">Partial</span></>
                              ) : (
                                <><AlertCircle className="w-3 h-3 text-red-400" /><span className="text-[10px] font-black text-red-400">Unpaid</span></>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className={`text-xs ${txt3}`}>N/A</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className={`${tdC} text-center`}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all group-hover:bg-primary group-hover:text-white ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}
                            title="View details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                            title="Export"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        {!loading && filteredGrades.length > 0 && (
          <div className={`flex flex-wrap items-center gap-4 px-5 py-3.5 border-t ${isDark ? 'border-white/5 bg-white/[0.015]' : 'border-gray-100 bg-gray-50/60'}`}>
            <span className={`text-[10px] font-black uppercase tracking-wider ${txt3}`}>Totals:</span>
            <span className="text-[11px] font-black text-primary">{filteredGrades.reduce((s, g) => s + g.total, 0)} Applications</span>
            <span className="text-[11px] font-black text-emerald-500">· {filteredGrades.reduce((s, g) => s + g.confirmed, 0)} Confirmed</span>
            <span className="text-[11px] font-black text-amber-500">· {filteredGrades.reduce((s, g) => s + g.pending, 0)} Pending</span>
            <span className="text-[11px] font-black text-red-500">· {filteredGrades.reduce((s, g) => s + g.rejected, 0)} Rejected</span>
            {filteredGrades.some(g => g.totalFees > 0) && (
              <span className={`text-[11px] font-bold ${txt3}`}>
                · {formatCurrency(filteredGrades.reduce((s, g) => s + g.totalFees, 0))} Total Fees
              </span>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdmissionDashboard;
