import React, { useState, useEffect, useRef } from 'react';
import {
  Search, Eye, FileText, User, Calendar, X, ChevronDown,
  Users, Loader2, FilterX, Award, Layers, RefreshCw,
  AlertCircle, CheckCircle2, Phone, MapPin, GraduationCap,
  Heart, Bus, CreditCard, Hash, BookOpen, Building2, Upload
} from 'lucide-react';
import api from '../../../../config/api';
import { useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import AutoBreadcrumb from '../../../../components/common/AutoBreadcrumb';
import BulkUploadModal from "./BulkUploadModal";

// Detect shape from the unique sentinel fields
const isRich = (obj) =>
  obj &&
  (obj.studentName !== undefined ||
    obj.enrollmentNumber !== undefined ||
    obj.admissionStatus !== undefined);

// Flatten either shape into one consistent structure
const normalize = (obj) => {
  if (isRich(obj)) {
    return {
      _shape: 'rich',
      id: obj.id,
      admissionId: obj.admissionId || obj.id,
      firstName: obj.studentName?.trim() || '',
      middleName: obj.studentMiddleName?.trim() || '',
      lastName: obj.studentLastName?.trim() || '',
      fullName: [obj.studentName, obj.studentMiddleName, obj.studentLastName]
        .map(s => s?.trim()).filter(Boolean).join(' ') || '—',
      enrollmentNumber: obj.enrollmentNumber || '—',
      dob: obj.dob || '—',
      gender: obj.gender || '—',
      gradeId: obj.gradeApplyingfor?.gradeId || '—',
      gradeLabel: obj.gradeApplyingfor?.gradeId
        ? `Grade ${obj.gradeApplyingfor.gradeId}`
        : (obj.gradeApplied || '—'),
      board: obj.board?.name || obj.board?.code || '—',
      medium: obj.medium?.name || obj.medium?.code || '—',
      stream: obj.streamApplyingFor?.name || obj.streamApplyingFor?.code || '—',
      academicYear: obj.academicYear?.name || '—',
      fatherMobile: obj.fatherMobile || '—',
      city: obj.city || '—',
      address: obj.address || '—',
      admissionStatus: obj.admissionStatus || obj.status || '—',
      admissionDate: obj.admissionDate || '—',
      paymentStatus: obj.paymentStatus || '—',
      counsellorName: obj.counsellorName || '—',
      _raw: obj,
    };
  }
  return {
    _shape: 'simple',
    id: obj.id,
    admissionId: obj.id,
    fullName: `Student ID #${obj.student || obj.id}`,
    enrollmentNumber: obj.enrollmentNo || obj.rollNumber || '—',
    dob: '—',
    gender: '—',
    gradeLabel: obj.classId ? `Class ${obj.classId}` : '—',
    board: '—',
    medium: '—',
    stream: '—',
    academicYear: `Year ID ${obj.academicYearId || '—'}`,
    fatherMobile: '—',
    city: '—',
    address: '—',
    admissionStatus: obj.status || '—',
    admissionDate: obj.admissionDate || '—',
    paymentStatus: '—',
    counsellorName: '—',
    _raw: obj,
  };
};

// ─── Status Badge ──────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    ADMISSION_CONFIRMED: 'bg-emerald-500/10 text-emerald-600 border-emerald-400/20',
    ACTIVE: 'bg-emerald-500/10 text-emerald-600 border-emerald-400/20',
    PENDING_PAYMENT: 'bg-amber-500/10  text-amber-600  border-amber-400/20',
    counselor_rejected: 'bg-red-500/10    text-red-500    border-red-400/20',
    principal_rejected: 'bg-red-500/10    text-red-500    border-red-400/20',
    DOCUMENTS_APPROVED: 'bg-primary/10    text-primary    border-primary/20',
    INACTIVE: 'bg-red-500/10    text-red-500    border-red-400/20',
  };
  const cls = map[status] || 'bg-gray-500/10 text-gray-500 border-gray-400/20';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cls}`}>
      {status?.replace(/_/g, ' ') || 'PENDING'}
    </span>
  );
};

// ─── Popup helpers ─────────────────────────────────────────────────────────
const Section = ({ title, icon: Icon, children, isDark }) => (
  <div className={`rounded-xl border p-4 ${isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
    <div className="flex items-center gap-2 mb-3">
      <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon size={11} className="text-primary" />
      </div>
      <p className="text-[10px] font-black uppercase tracking-wider text-primary">{title}</p>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">{children}</div>
  </div>
);

const Field = ({ label, value, isDark }) => (
  <div className="min-w-0">
    <p className={`text-[9px] font-black uppercase tracking-wider mb-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{label}</p>
    <p className={`text-xs font-semibold truncate ${value && value !== '—' && value !== 'null' ? (isDark ? 'text-gray-200' : 'text-gray-800') : (isDark ? 'text-gray-600' : 'text-gray-400')}`}>
      {(!value || value === 'null' || value === 'undefined') ? '—' : value}
    </p>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
const StudentList = () => {
  const { selectedCampus, campuses, superAdmin } = useSelector((s) => s.campus);
  const themeMode = useSelector((s) => s.color.mode);
  const isDark = themeMode === 'dark';

  const theme = {
    bg: isDark ? "bg-[#050505]" : "bg-[#F8FAFC]",
    panel: isDark ? "bg-[#0D0D0D] border-white/10" : "bg-white border-slate-200",
    input: isDark ? "bg-[#141414] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900",
    tableHeader: isDark ? "bg-white/[0.03]" : "bg-slate-50",
    textPrimary: isDark ? "text-white" : "text-slate-900",
    textSecondary: isDark ? "text-slate-500" : "text-slate-500",
    rowHover: isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50",
  };

  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataMode, setDataMode] = useState('none');
  const [searchTerm, setSearchTerm] = useState('');

  // Popup
  const [popupRow, setPopupRow] = useState(null);
  const [popupTab, setPopupTab] = useState('overview');
  const [docs, setDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);

  // Filters
  const [acedemicYear, setAcedemicYear] = useState([]);
  const [academicYearId, setAcademicYearId] = useState(null);
  const [branches, setBranches] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [tempCampusId, setTempCampusId] = useState('');
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const gradeRef = useRef(null);

  const [showBulkUpload, setShowBulkUpload] = useState(false);

  // ─── STYLES matching CampusManager ────────────────────────────────────
  const inp = `w-full px-3.5 py-2.5 rounded-xl border outline-none transition-all text-sm font-medium ${isDark ? 'bg-[#1A1A1A] border-white/10 text-white focus:border-primary' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-primary focus:bg-white'}`;
  const lbl = `block text-[10px] font-black uppercase mb-1 tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`;

  const getCampusId = () => superAdmin ? tempCampusId : selectedCampus;

  useEffect(() => {
    const h = (e) => { if (gradeRef.current && !gradeRef.current.contains(e.target)) setShowGradeDropdown(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ─── fetchers ────────────────────────────────────────────────────────────
  const loadDocs = async (admissionId) => {
    if (!admissionId) return;
    setDocsLoading(true);
    try {
      const r = await api.get(`/api/documents/${admissionId}`);
      setDocs(r.data || []);
    } catch { setDocs([]); }
    finally { setDocsLoading(false); }
  };

  useEffect(() => {
    api.get('/api/academic-years/get-all-academic-year').then(r => setAcedemicYear(r.data)).catch(() => { });
  }, []);

  useEffect(() => {
    const cid = getCampusId();
    if (!cid) return;
    api.get(`/api/branches/campus/${cid}`).then(r => setBranches(r.data)).catch(() => { });
  }, [selectedCampus, tempCampusId]);

  useEffect(() => {
    if (!selectedBranch) { setGrades([]); return; }
    api.get(`/api/branches/${selectedBranch}/grades`).then(r => setGrades(r.data)).catch(() => { });
  }, [selectedBranch]);

  useEffect(() => {
    if (superAdmin && campuses.length > 0 && !tempCampusId)
      setTempCampusId(campuses[0].campusId || campuses[0].id);
  }, [campuses, superAdmin]);

  const fetchData = async () => {
    const campusId = getCampusId();
    if (!campusId) { setAdmissions([]); setLoading(false); return; }
    setLoading(true);
    try {
      const hasYear = !!academicYearId;
      const hasBranch = !!selectedBranch;
      const hasGrades = selectedGrades.length > 0;
      let response;
      if (hasYear && hasBranch && hasGrades) {
        response = await api.post(`/api/admission/getEnrollmentsMultiGrade/${academicYearId}/${campusId}`, { branchGradeIds: selectedGrades.map(Number) });
        setDataMode('simple');
      } else if (hasYear && hasBranch) {
        response = await api.get(`/api/admission/getEnrollmentsByBranchGradeAndAcademicYear/${selectedBranch}/${academicYearId}/${campusId}`);
        setDataMode('simple');
      } else if (hasYear) {
        response = await api.get(`/api/admission/getEnrollmentsBy/${academicYearId}/${campusId}`);
        setDataMode('simple');
      } else {
        response = await api.get(`/api/admission/alladmission/${campusId}`);
        setDataMode('rich');
      }
      const raw = response.data?.content ?? response.data ?? [];
      setAdmissions(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch data');
      setAdmissions([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [academicYearId, selectedBranch, selectedGrades, selectedCampus, tempCampusId]);

  const handleCampusChange = (e) => { setTempCampusId(e.target.value); setSelectedBranch(''); setSelectedGrades([]); };
  const handleBranchChange = (e) => { const id = Number(e.target.value); setSelectedBranch(id); setSelectedGrades([]); };
  const toggleGrade = (g) => setSelectedGrades(prev => prev.includes(g.id) ? prev.filter(x => x !== g.id) : [...prev, g.id]);
  const selectAllGrades = () => setSelectedGrades(selectedGrades.length === grades.length ? [] : grades.map(g => g.id));

  const rows = admissions.map(normalize);
  const filtered = rows.filter(r =>
    !searchTerm ||
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.enrollmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.fatherMobile.includes(searchTerm)
  );

  const openPopup = (row) => {
    setPopupRow(row);
    setPopupTab('overview');
    setDocs([]);
    loadDocs(row.admissionId);
  };

  return (
    <div className="min-h-screen pb-24">
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: isDark ? '#1A1A1A' : '#fff', color: isDark ? '#fff' : '#000', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', fontSize: '13px', fontWeight: 600 } }} />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20">
            <Users className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-heading font-black tracking-tighter uppercase">
              Students <span className="text-primary not-italic">List</span>
            </h1>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Student Management &amp; Enrollment Records · <AutoBreadcrumb />
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 p-1.5 rounded-2xl border ${theme.panel}`}>
            <div className="px-5 py-2 border-r border-white/5 text-center">
              <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Total</p>
              <p className="text-sm font-black">{filtered.length}</p>
            </div>
            <div className="px-5 py-2 text-center">
              <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Mode</p>
              <p className="text-sm font-black text-primary">{dataMode === 'rich' ? 'Full' : dataMode === 'simple' ? 'Enroll' : '—'}</p>
            </div>
          </div>
          <button
            onClick={() => setShowBulkUpload(true)}
            className="h-14 px-6 bg-primary text-white rounded-2xl font-black uppercase text-button tracking-widest flex items-center gap-3 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            <Upload size={18} /> Bulk Upload
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        <div className="mb-2">
          <AutoBreadcrumb />
        </div>

        {/* ── Filters ──────────────────────────────────────────────────── */}
        <div className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}>
          <div className="p-6 border-b border-white/5 flex items-center gap-2 bg-primary/5">
            <Layers size={15} className="text-primary" />
            <h3 className="font-black uppercase text-title-table tracking-widest">Filter Configuration</h3>
          </div>

          <div className="p-6">
            <div className={`grid gap-4 ${superAdmin ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'}`}>

              {/* Academic Year */}
              <div>
                <label className={lbl}>Academic Year</label>
                <div className="relative">
                  <select
                    value={academicYearId || ''}
                    onChange={(e) => { setAcademicYearId(Number(e.target.value) || null); setSelectedBranch(null); setSelectedGrades([]); }}
                    className={`${inp} appearance-none`}
                  >
                    <option value="">Select Year</option>
                    {acedemicYear.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                </div>
              </div>

              {/* Campus — super admin only */}
              {superAdmin && (
                <div>
                  <label className={lbl}>Campus</label>
                  <div className="relative">
                    <select value={tempCampusId} onChange={handleCampusChange} className={`${inp} appearance-none pr-8`}>
                      <option value="">Select Campus</option>
                      {campuses.map(c => <option key={c.campusId || c.id} value={c.campusId || c.id}>{c.campusName}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                  </div>
                </div>
              )}

              {/* Branch */}
              <div>
                <label className={lbl}>Branch</label>
                <div className="relative">
                  <select value={selectedBranch || ''} onChange={handleBranchChange} className={`${inp} appearance-none pr-8`}>
                    <option value="">Select Branch</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.campusName} — {b.boardName} — {b.mediumName}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                </div>
              </div>

              {/* Grades multi-select */}
              <div ref={gradeRef} className="relative">
                <label className={lbl}>Grades</label>
                <button
                  type="button"
                  disabled={!selectedBranch}
                  onClick={() => selectedBranch && setShowGradeDropdown(v => !v)}
                  className={`${inp} flex items-center justify-between ${!selectedBranch ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <span className="truncate text-sm">
                    {selectedGrades.length === 0 ? 'Select Grades' : `${selectedGrades.length} grade${selectedGrades.length > 1 ? 's' : ''} selected`}
                  </span>
                  <ChevronDown size={13} className={`shrink-0 transition-transform ${showGradeDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showGradeDropdown && (
                  <div className={`absolute z-30 w-full mt-1 rounded-xl border shadow-2xl ${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-200'}`}>
                    <div className="p-2 space-y-0.5">
                      <label className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                        <input type="checkbox" checked={grades.length > 0 && selectedGrades.length === grades.length} onChange={selectAllGrades} className="w-4 h-4 rounded" style={{ accentColor: '#3B82F6' }} />
                        <span className="text-xs font-bold uppercase tracking-wider text-primary">Select All</span>
                      </label>
                      <div className={`h-px my-1 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                      <div className="max-h-44 overflow-y-auto space-y-0.5">
                        {grades.map(g => (
                          <label key={g.id} className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                            <input type="checkbox" checked={selectedGrades.includes(g.id)} onChange={() => toggleGrade(g)} className="w-4 h-4 rounded" style={{ accentColor: '#3B82F6' }} />
                            <span className="text-sm">{g.gradeName}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Search */}
              <div>
                <label className={lbl}>Search</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-30" />
                  <input
                    type="text"
                    placeholder="FILTER BY NAME OR ENROLLMENT..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full h-11 pl-10 pr-4 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                  />
                </div>
              </div>
            </div>

            {/* Status chips */}
            <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-dashed border-gray-200/30">
              {[{ l: 'Year', done: !!academicYearId }, { l: 'Branch', done: !!selectedBranch }, { l: 'Grade(s)', done: selectedGrades.length > 0 }].map(({ l, done }) => (
                <span key={l} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${done ? 'bg-emerald-500/10 text-emerald-600 border-emerald-400/20' : isDark ? 'bg-white/5 text-gray-500 border-white/5' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                  {done ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}{l}
                </span>
              ))}
              {dataMode === 'simple' && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-amber-500/10 text-amber-600 border-amber-400/20">
                  ⚡ Enrollment View
                </span>
              )}
              {dataMode === 'rich' && (
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-primary/10 text-primary border-primary/20">
                  📋 Full Student View
                </span>
              )}
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-primary/10 text-primary border-primary/20">
                <Users size={10} />{filtered.length} records
              </span>
            </div>
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────────────────── */}
        <div className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}>
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-primary/5">
            <div className="flex items-center gap-2 text-primary">
              <Award size={15} />
              <h3 className="font-black uppercase text-title-table tracking-widest">Enrolled Students Master List</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-primary/10 text-primary border border-primary/20">{filtered.length} records</span>
              <button
                onClick={fetchData}
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${isDark ? 'border-white/10 text-gray-400 hover:bg-white/10' : 'border-slate-200 text-gray-500 hover:bg-slate-50'}`}
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {!loading && filtered.length > 0 && (
            <div className={`px-8 py-2.5 border-b text-[10px] font-black flex items-center gap-1.5 ${isDark ? 'border-white/5 text-gray-600' : 'border-gray-100 text-gray-400'}`}>
              <Eye size={10} /> CLICK ANY ROW TO VIEW FULL STUDENT PROFILE
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                {dataMode === 'simple' ? (
                  <tr className={`${theme.tableHeader} text-heding-table font-black uppercase text-slate-500 tracking-widest`}>
                    <th className="px-8 py-5">#</th>
                    <th className="px-8 py-5">Enrollment No.</th>
                    <th className="px-8 py-5">Roll Number</th>
                    <th className="px-8 py-5">Class</th>
                    <th className="px-8 py-5">Admission Date</th>
                    <th className="px-8 py-5 text-right">View</th>
                  </tr>
                ) : (
                  <tr className={`${theme.tableHeader} text-heding-table font-black uppercase text-slate-500 tracking-widest`}>
                    <th className="px-8 py-5">#</th>
                    <th className="px-8 py-5">Student</th>
                    <th className="px-8 py-5">Enrollment No.</th>
                    <th className="px-8 py-5">Grade / Board / Medium</th>
                    <th className="px-8 py-5">Father's Contact</th>
                    <th className="px-8 py-5">Admission Date</th>
                    <th className="px-8 py-5 text-right">View</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={dataMode === 'simple' ? 6 : 7} className="py-20 text-center">
                      <Loader2 className="animate-spin mx-auto text-primary" size={32} />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={dataMode === 'simple' ? 6 : 7} className="px-8 py-20 text-center">
                      <FilterX size={36} className={`mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className={`text-sm font-black uppercase tracking-widest opacity-30 ${theme.textPrimary}`}>No students found</p>
                      <p className={`text-[10px] mt-1 opacity-30 font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Select a campus or apply filters to load data</p>
                    </td>
                  </tr>
                ) : dataMode === 'simple' ? (
                  filtered.map((row, idx) => (
                    <tr
                      key={row.id}
                      onClick={() => openPopup(row)}
                      className={`transition-colors ${theme.rowHover} cursor-pointer`}
                    >
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black text-primary/40">{String(idx + 1).padStart(2, '0')}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-mono text-small-table text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                          {row._raw.enrollmentNo || '—'}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-small-table font-mono">{row._raw.rollNumber || '—'}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-small-table uppercase tracking-tight">{row._raw.classId ? `Class ${row._raw.classId}` : '—'}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} className="opacity-40" />
                          <span className="text-small-table">{row._raw.admissionDate || '—'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-90 shadow-sm border border-primary/20 text-primary hover:bg-primary/10">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  filtered.map((row, idx) => (
                    <tr
                      key={row.id}
                      onClick={() => openPopup(row)}
                      className={`transition-colors ${theme.rowHover} cursor-pointer`}
                    >
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black text-primary/40">{String(idx + 1).padStart(2, '0')}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xs shrink-0 shadow-lg shadow-primary/20">
                            {(row._raw.studentName || 'ST').substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-small-table font-black uppercase tracking-tight">
                              {row._raw.studentName} {row._raw.studentMiddleName} {row._raw.studentLastName}
                            </p>
                            <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {row._raw.gender}{row._raw.dob ? ` · ${row._raw.dob}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-mono text-small-table text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                          {row._raw.enrollmentNumber || '—'}
                        </span>
                        <p className={`text-[10px] mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{row._raw.academicYear?.name || '—'}</p>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-small-table font-black uppercase tracking-tight">
                          {row._raw.gradeApplyingfor?.gradeId ? `${row._raw.gradeApplied}` : (row._raw.gradeApplyingfor?.gradeId || '—')}
                          {row._raw.streamApplyingFor?.name ? ` · ${row._raw.streamApplyingFor.name}` : ''}
                        </p>
                        <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {[row._raw.board?.code, row._raw.medium?.code].filter(Boolean).join(' · ') || '—'}
                        </p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <Phone size={10} className="opacity-40" />
                          <span className="text-small-table">{row._raw.fatherMobile || '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin size={10} className="opacity-40" />
                          <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{row._raw.city || '—'}, {row._raw.state || '—'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} className="opacity-40" />
                          <span className="text-small-table">{row._raw.admissionDate || '—'}</span>
                        </div>
                        <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{row._raw.counsellorName || ''}</p>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-90 shadow-sm border border-primary/20 text-primary hover:bg-primary/10">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filtered.length > 0 && (
            <div className={`flex items-center gap-4 px-8 py-4 border-t ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
              <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Summary:</span>
              <span className="text-[11px] font-black text-primary">{filtered.length} Total</span>
              {dataMode === 'rich' && (
                <span className={`text-[11px] font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  · {filtered.filter(r => ['ADMISSION_CONFIRMED', 'ACTIVE'].includes(r._raw.admissionStatus || r._raw.status)).length} Active
                </span>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ── ROW DETAIL POPUP ─────────────────────────────────────────── */}
      {popupRow && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl border shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col ${isDark ? 'bg-[#0D0D0D] border-white/10' : 'bg-white border-gray-200'}`}>

            {/* Header */}
            <div className={`px-6 py-5 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/30">
                  {popupRow._shape === 'rich'
                    ? (popupRow._raw.studentName || 'ST').substring(0, 2).toUpperCase()
                    : '#' + (popupRow._raw.student || popupRow._raw.id)}
                </div>
                <div>
                  {popupRow._shape === 'rich' ? (
                    <>
                      <p className="font-black text-sm uppercase tracking-wide">
                        {popupRow._raw.studentName} {popupRow._raw.studentMiddleName} {popupRow._raw.studentLastName}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className={`text-[10px] font-mono font-black ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>#{popupRow._raw.enrollmentNumber}</span>
                        <StatusBadge status={popupRow._raw.admissionStatus || popupRow._raw.status} />
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="font-black text-sm uppercase tracking-wide">Enrollment #{popupRow._raw.enrollmentNo || popupRow._raw.rollNumber}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <StatusBadge status={popupRow._raw.status} />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <button onClick={() => setPopupRow(null)} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className={`px-6 py-3 border-b flex gap-2 shrink-0 overflow-x-auto ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
              {(popupRow._shape === 'rich'
                ? [{ k: 'overview', l: 'Overview', I: User }, { k: 'academic', l: 'Academic', I: GraduationCap }, { k: 'family', l: 'Family', I: Users }, { k: 'documents', l: 'Documents', I: FileText }]
                : [{ k: 'overview', l: 'Enrollment Info', I: Hash }, { k: 'documents', l: 'Documents', I: FileText }]
              ).map(({ k, l, I }) => (
                <button key={k} onClick={() => setPopupTab(k)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${popupTab === k ? 'bg-primary text-white shadow-lg shadow-primary/20' : isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'}`}>
                  <I size={12} />{l}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">

              {popupRow._shape === 'simple' && popupTab === 'overview' && (
                <Section title="Enrollment Details" icon={Hash} isDark={isDark}>
                  <Field label="Enrollment No." value={popupRow._raw.enrollmentNo} isDark={isDark} />
                  <Field label="Roll Number" value={popupRow._raw.rollNumber} isDark={isDark} />
                  <Field label="Class ID" value={String(popupRow._raw.classId || '—')} isDark={isDark} />
                  <Field label="Academic Year ID" value={String(popupRow._raw.academicYearId || '—')} isDark={isDark} />
                  <Field label="Admission Date" value={popupRow._raw.admissionDate} isDark={isDark} />
                  <Field label="Status" value={popupRow._raw.status} isDark={isDark} />
                  <Field label="Admission Type ID" value={String(popupRow._raw.admissionTypeId || '—')} isDark={isDark} />
                  <Field label="Branch-Grade-Stream" value={String(popupRow._raw.branchGradeStreamId || '—')} isDark={isDark} />
                  <Field label="Campus ID" value={String(popupRow._raw.campusId || '—')} isDark={isDark} />
                  <Field label="Fee Structure ID" value={String(popupRow._raw.feeStructureTypeId || '—')} isDark={isDark} />
                  <Field label="Student ID" value={String(popupRow._raw.student || '—')} isDark={isDark} />
                  <Field label="Section ID" value={String(popupRow._raw.sectionId || '—')} isDark={isDark} />
                </Section>
              )}

              {popupRow._shape === 'rich' && popupTab === 'overview' && (() => {
                const r = popupRow._raw;
                return (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { label: 'Enrollment', value: r.enrollmentNumber, I: Hash },
                        { label: 'Admission Date', value: r.admissionDate, I: Calendar },
                        { label: 'Payment', value: r.paymentStatus, I: CreditCard },
                        { label: 'Blood Group', value: r.bloodGroup, I: Heart },
                      ].map(({ label, value, I }) => (
                        <div key={label} className={`p-3 rounded-xl border ${isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <I size={10} className="text-primary opacity-70" />
                            <p className={`text-[9px] font-black uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
                          </div>
                          <p className="text-sm font-black truncate">{value || '—'}</p>
                        </div>
                      ))}
                    </div>
                    <Section title="Personal Information" icon={User} isDark={isDark}>
                      <Field label="Full Name" value={`${r.studentName} ${r.studentMiddleName || ''} ${r.studentLastName}`} isDark={isDark} />
                      <Field label="Date of Birth" value={r.dob} isDark={isDark} />
                      <Field label="Gender" value={r.gender} isDark={isDark} />
                      <Field label="Nationality" value={r.nationality} isDark={isDark} />
                      <Field label="Religion" value={r.religion} isDark={isDark} />
                      <Field label="Caste Category" value={r.casteCategory} isDark={isDark} />
                      <Field label="Mother Tongue" value={r.motherToungue} isDark={isDark} />
                      <Field label="Aadhar Number" value={r.aadharNumber} isDark={isDark} />
                    </Section>
                    <Section title="Address" icon={MapPin} isDark={isDark}>
                      <Field label="Address" value={r.address} isDark={isDark} />
                      <Field label="Area" value={r.area} isDark={isDark} />
                      <Field label="City" value={r.city} isDark={isDark} />
                      <Field label="State" value={r.state} isDark={isDark} />
                      <Field label="Pincode" value={r.pincode} isDark={isDark} />
                      <Field label="Permanent Address" value={r.permanentAddress} isDark={isDark} />
                    </Section>
                    <Section title="Medical" icon={Heart} isDark={isDark}>
                      <Field label="Blood Group" value={r.bloodGroup} isDark={isDark} />
                      <Field label="Allergies" value={r.allergies} isDark={isDark} />
                      <Field label="Medical Conditions" value={r.medicalConditions} isDark={isDark} />
                      <Field label="Special Needs" value={r.specialNeeds} isDark={isDark} />
                      <Field label="Doctor Name" value={r.doctorName} isDark={isDark} />
                      <Field label="Doctor Contact" value={r.doctorContact} isDark={isDark} />
                    </Section>
                    <Section title="Transport & Hostel" icon={Bus} isDark={isDark}>
                      <Field label="Transport Required" value={r.transportRequired?.toString()} isDark={isDark} />
                      <Field label="Pickup Location" value={r.pickupLocation} isDark={isDark} />
                      <Field label="Route Name" value={r.routeName} isDark={isDark} />
                      <Field label="Distance (km)" value={r.distanceFromSchool} isDark={isDark} />
                      <Field label="Hostel Required" value={r.hostelRequired?.toString()} isDark={isDark} />
                      <Field label="Local Guardian" value={r.localGuardianName} isDark={isDark} />
                    </Section>
                  </>
                );
              })()}

              {popupRow._shape === 'rich' && popupTab === 'academic' && (() => {
                const r = popupRow._raw;
                return (
                  <>
                    <Section title="Current Academic Details" icon={GraduationCap} isDark={isDark}>
                      <Field label="Grade ID" value={r.gradeApplyingfor?.gradeId ? `Grade ${r.gradeApplyingfor.gradeId}` : '—'} isDark={isDark} />
                      <Field label="Academic Year" value={r.academicYear?.name} isDark={isDark} />
                      <Field label="Board" value={r.board?.name || r.board?.code} isDark={isDark} />
                      <Field label="Medium" value={r.medium?.name || r.medium?.code} isDark={isDark} />
                      <Field label="Stream" value={r.streamApplyingFor?.name || r.streamApplyingFor?.code} isDark={isDark} />
                      <Field label="Student Type" value={r.studentType?.name || r.studentType?.code} isDark={isDark} />
                      <Field label="Fee Structure" value={r.feeStuctureTypeId?.name || r.feeStuctureTypeId?.code} isDark={isDark} />
                      <Field label="Admission Date" value={r.admissionDate} isDark={isDark} />
                      <Field label="Counsellor" value={r.counsellorName} isDark={isDark} />
                    </Section>
                    <Section title="Previous School" icon={BookOpen} isDark={isDark}>
                      <Field label="Last School" value={r.lastSchool} isDark={isDark} />
                      <Field label="Last Class" value={r.lastClass} isDark={isDark} />
                      <Field label="Last Grade / %" value={r.lastGrade} isDark={isDark} />
                      <Field label="Last Board" value={r.lastBoard} isDark={isDark} />
                      <Field label="Last Medium" value={r.lastMedium} isDark={isDark} />
                      <Field label="Last Stream" value={r.lastStream} isDark={isDark} />
                    </Section>
                    <Section title="Payment & Status" icon={CreditCard} isDark={isDark}>
                      <Field label="Admission Status" value={r.admissionStatus} isDark={isDark} />
                      <Field label="Payment Status" value={r.paymentStatus} isDark={isDark} />
                      <Field label="Amount" value={r.amount} isDark={isDark} />
                      <Field label="Order ID" value={r.orderId} isDark={isDark} />
                      <Field label="Payment ID" value={r.paymentId} isDark={isDark} />
                      <Field label="Docs Verified" value={r.documentsVerified?.toString()} isDark={isDark} />
                    </Section>
                  </>
                );
              })()}

              {popupRow._shape === 'rich' && popupTab === 'family' && (() => {
                const r = popupRow._raw;
                return (
                  <>
                    <Section title="Father's Details" icon={User} isDark={isDark}>
                      <Field label="Name" value={r.fatherName} isDark={isDark} />
                      <Field label="Mobile" value={r.fatherMobile} isDark={isDark} />
                      <Field label="Email" value={r.fatherEmail} isDark={isDark} />
                      <Field label="Occupation" value={r.fatherOccupation} isDark={isDark} />
                      <Field label="Qualification" value={r.fatherQualification} isDark={isDark} />
                      <Field label="Annual Income" value={r.fatherannualIncome} isDark={isDark} />
                      <Field label="Organization" value={r.fatherorganizationName} isDark={isDark} />
                      <Field label="Aadhar" value={r.fatherAadhar} isDark={isDark} />
                    </Section>
                    <Section title="Mother's Details" icon={User} isDark={isDark}>
                      <Field label="Name" value={r.motherName} isDark={isDark} />
                      <Field label="Mobile" value={r.motherMobile} isDark={isDark} />
                      <Field label="Email" value={r.motherEmail} isDark={isDark} />
                      <Field label="Occupation" value={r.motherOccupation} isDark={isDark} />
                      <Field label="Qualification" value={r.motherQualification} isDark={isDark} />
                      <Field label="Annual Income" value={r.motherannualIncome} isDark={isDark} />
                      <Field label="Organization" value={r.motherorganizationName} isDark={isDark} />
                      <Field label="Aadhar" value={r.motherAadhar} isDark={isDark} />
                    </Section>
                    {r.guardianName && (
                      <Section title="Guardian's Details" icon={User} isDark={isDark}>
                        <Field label="Name" value={r.guardianName} isDark={isDark} />
                        <Field label="Mobile" value={r.guardianMobile} isDark={isDark} />
                        <Field label="Email" value={r.guardianEmail} isDark={isDark} />
                        <Field label="Occupation" value={r.guardianOccupation} isDark={isDark} />
                        <Field label="Qualification" value={r.guardianQualification} isDark={isDark} />
                        <Field label="Annual Income" value={r.guardianAnnualIncome} isDark={isDark} />
                        <Field label="Organization" value={r.guardianOrganizationName} isDark={isDark} />
                        <Field label="Aadhar" value={r.guardianAadhar} isDark={isDark} />
                      </Section>
                    )}
                    {r.anySibling && (
                      <Section title="Sibling" icon={Users} isDark={isDark}>
                        <Field label="Sibling Name" value={r.siblingName} isDark={isDark} />
                        <Field label="Sibling Grade" value={r.siblingGrade} isDark={isDark} />
                      </Section>
                    )}
                  </>
                );
              })()}

              {popupTab === 'documents' && (
                <div className="space-y-3">
                  <div className={`flex items-center px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider ${isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                    <span className="flex-1">Document Name</span>
                    <span className="w-28 text-center">Status</span>
                    <span className="w-20 text-center">View</span>
                  </div>
                  {docsLoading ? (
                    <div className="flex items-center justify-center py-12 gap-3">
                      <Loader2 size={18} className="animate-spin text-primary" />
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading documents…</span>
                    </div>
                  ) : docs.length > 0 ? docs.map((doc, i) => (
                    <div key={i} className={`flex items-center px-4 py-3.5 rounded-xl border transition-all hover:shadow-md ${isDark ? 'bg-[#1A1A1A] border-white/5 hover:border-primary/30' : 'bg-white border-gray-200 hover:border-primary/30'}`}>
                      <div className="flex-1 flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-primary/10' : 'bg-primary/5'}`}><FileText size={13} className="text-primary" /></div>
                        <span className="text-sm font-semibold">{doc.documentName}</span>
                      </div>
                      <div className="w-28 flex justify-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${doc.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-400/20' : 'bg-amber-500/10 text-amber-600 border-amber-400/20'}`}>{doc.status}</span>
                      </div>
                      <div className="w-20 flex justify-center">
                        <button onClick={() => window.open(doc.fileUrl, '_blank')} className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-primary/10 text-primary' : 'hover:bg-primary/5 text-primary'}`}><Eye size={14} /></button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12">
                      <FileText size={32} className={`mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className={`text-sm font-black uppercase tracking-widest opacity-30 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No documents uploaded</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Component */}
      <BulkUploadModal
        open={showBulkUpload}
        onClose={() => setShowBulkUpload(false)}
        selectedCampus={selectedCampus}
      />
    </div>
  );
};

export default StudentList;
