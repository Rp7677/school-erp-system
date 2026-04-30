import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import {
  Plus, FileText, University, CheckCircle, X,
  CheckCircle2, XCircle, Pencil, Save, RefreshCw,
  ChevronDown, ChevronUp, AlertCircle, Layers,
  ToggleLeft, ToggleRight, Loader2, Search
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import api from '../../../../config/api';
import AutoBreadcrumb from '../../../../components/common/AutoBreadcrumb';

// ─── Small reusable status badge ───────────────────────────────────────────
const Badge = ({ type }) => {
  const cfg = {
    mandatory: 'bg-primary/10 text-primary border border-primary/20',
    optional: 'bg-gray-500/10 text-gray-500 border border-gray-400/20',
    active: 'bg-emerald-500/10 text-emerald-600 border border-emerald-400/20',
    inactive: 'bg-red-500/10 text-red-500 border border-red-400/20',
  }[type] || '';
  const label = { mandatory: 'MANDATORY', optional: 'OPTIONAL', active: 'ACTIVE', inactive: 'INACTIVE' }[type] || type;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cfg}`}>
      {label}
    </span>
  );
};

// ─── Loading spinner row ────────────────────────────────────────────────────
const LoadingRow = ({ isDark, cols = 4 }) => (
  <tr>
    <td colSpan={cols} className="py-20 text-center">
      <div className="flex items-center justify-center gap-3">
        <Loader2 size={20} className="animate-spin text-primary" />
        <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Loading documents…
        </span>
      </div>
    </td>
  </tr>
);

// ─── Empty state row ────────────────────────────────────────────────────────
const EmptyRow = ({ isDark, cols = 4, msg = 'No documents configured for this selection.' }) => (
  <tr>
    <td colSpan={cols} className="py-20 text-center">
      <FileText size={36} className={`mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
      <p className={`text-sm font-black uppercase tracking-widest opacity-30 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{msg}</p>
    </td>
  </tr>
);

// ═══════════════════════════════════════════════════════════════════════════
const DocumentConfiguration = () => {
  const { selectedCampus, campuses, superAdmin } = useSelector(s => s.campus);
  const themeMode = useSelector(s => s.color.mode);
  const isDark = themeMode === 'dark';

  // ── Filters ───────────────────────────────────────────────────────────────
  const [branches, setBranches] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedGrades, setSelectedGrades] = useState([]);
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [tempCampusId, setTempCampusId] = useState('');
  const [admissionTypes, setAdmissionTypes] = useState([]);
  const [feeCategories, setFeeCategories] = useState([]);
  const [selectedAdmissionId, setSelectedAdmissionId] = useState('');
  const [selectedFeeCategoryId, setSelectedFeeCategoryId] = useState('');

  // ── Master docs list ──────────────────────────────────────────────────────
  const [allMasterDocs, setAllMasterDocs] = useState([]);
  const [docSearch, setDocSearch] = useState('');

  // ── Per-grade data: { [gradeId]: { docs: [], loading, editing, dirty } } ──
  const [gradeData, setGradeData] = useState({});

  // ── Panel open state per grade ────────────────────────────────────────────
  const [expandedGrades, setExpandedGrades] = useState({});

  // ── Add-doc panel per grade ───────────────────────────────────────────────
  const [addDocPanel, setAddDocPanel] = useState({});

  const gradeDropdownRef = useRef(null);

  // ─── STYLES — matching StudentList ────────────────────────────────────────
  const panel = isDark ? 'bg-[#0D0D0D] border-white/10' : 'bg-white border-slate-200';
  const card = `rounded-3xl border shadow-sm transition-all ${panel}`;
  const input = `w-full px-3.5 py-2.5 rounded-xl border outline-none transition-all text-sm font-medium ${isDark ? 'bg-[#1A1A1A] border-white/10 text-white focus:border-primary' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-primary focus:bg-white'}`;
  const label = `block text-[10px] font-black uppercase mb-1 tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`;
  const thCell = `px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-400 bg-white/[0.03]' : 'text-slate-500 bg-slate-50'}`;
  const tdCell = `px-8 py-6 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const trHover = `border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/[0.02]' : 'border-gray-100 hover:bg-slate-50'}`;

  // ─── Derived ───────────────────────────────────────────────────────────────
  const activeMasterDocs = allMasterDocs.filter(d =>
    d.active === true || d.active === 'true' || d.active === 1
  );
  const allSelected = selectedGrades.length > 0 && selectedGrades.length === grades.length;

  const readyToFetch =
    selectedBranch &&
    selectedGrades.length > 0 &&
    selectedAdmissionId &&
    selectedFeeCategoryId;

  // ─── Fetches Branch ───────────────────────────────────────────────────────────────
  const fetchBranches = async (campusId) => {
    if (!campusId) return;
    try {
      const { data } = await api.get(`/api/branches/campus/${campusId}`);
      setBranches(data);
    } catch { toast.error('Failed to fetch branches'); }
  };

  // Fetch Grades
  const fetchGrades = async (branchId) => {
    if (!branchId) { setGrades([]); return; }
    try {
      const { data } = await api.get(`/api/branches/${branchId}/grades`);
      setGrades(data);
    } catch { toast.error('Failed to fetch grades'); }
  };

  // Fetch Admission Types
  const fetchAdmissionTypes = async () => {
    try {
      const { data } = await api.get('/api/admission-types');
      setAdmissionTypes(data);
    } catch { toast.error('Failed to fetch admission types'); }
  };

  // Fetch Fees Category
  const fetchFeeCategories = useCallback(async () => {
    const campusId = superAdmin ? tempCampusId : selectedCampus;
    if (!campusId) return;
    try {
      const { data } = await api.get(`api/fees/structure-types?campus_id=${campusId}`);
      setFeeCategories(data);
    } catch { console.error('Fee categories failed'); }
  }, [superAdmin, tempCampusId, selectedCampus]);

  // Fetch All documents from master
  const fetchAllMasterDocs = async () => {
    try {
      const { data } = await api.get('/api/documents-master/all');
      setAllMasterDocs(data);
    } catch { console.error('Master docs failed'); }
  };

  const normalizeGradeDocs = (payload) => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;

    if (
      Array.isArray(payload.documents) &&
      Array.isArray(payload.required) &&
      Array.isArray(payload.active) &&
      payload.documents.length === payload.required.length &&
      payload.documents.length === payload.active.length
    ) {
      return payload.documents.map((doc, index) => ({
        ...doc,
        mandatory: payload.required[index],
        active: payload.active[index],
      }));
    }

    return Array.isArray(payload.documents) ? payload.documents : [];
  };

  // ─── Fetch docs for one grade ──────────────────────────────────────────────
  const fetchGradeDocs = useCallback(async (grade) => {
    const id = grade.id;
    setGradeData(prev => ({
      ...prev,
      [id]: { ...(prev[id] || {}), loading: true, docs: [], editing: false, dirty: false }
    }));
    try {
      const { data } = await api.get(
        `/api/documents/mapping/${id}/${selectedAdmissionId}/${selectedFeeCategoryId}`
      );
      const docs = normalizeGradeDocs(data);
      const isEmpty = !docs || docs.length === 0;
      setGradeData(prev => ({
        ...prev,
        [id]: { docs, loading: false, editing: false, dirty: false, isNew: isEmpty }
      }));
      console.log();
    } catch {
      setGradeData(prev => ({
        ...prev,
        [id]: { docs: [], loading: false, editing: false, dirty: false, isNew: true }
      }));
    }
  }, [selectedAdmissionId, selectedFeeCategoryId]);

  // ─── Auto-fetch when all filters ready ────────────────────────────────────
  useEffect(() => {
    if (!readyToFetch) return;
    selectedGrades.forEach(g => fetchGradeDocs(g));
    const expanded = {};
    selectedGrades.forEach(g => { expanded[g.id] = true; });
    setExpandedGrades(expanded);
  }, [readyToFetch, selectedGrades.map(g => g.id).join(','), selectedAdmissionId, selectedFeeCategoryId]);

  // ─── Initial loads ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetchAdmissionTypes();
    fetchAllMasterDocs();
  }, []);

  useEffect(() => { fetchFeeCategories(); }, [fetchFeeCategories]);

  useEffect(() => {
    if (superAdmin) {
      return;
    }
    if (!superAdmin && selectedCampus) {
      fetchBranches(selectedCampus);
    }
  }, [superAdmin, selectedCampus]);

  // ─── Click-outside for grade dropdown ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (gradeDropdownRef.current && !gradeDropdownRef.current.contains(e.target))
        setShowGradeDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ─── Handlers: filters ────────────────────────────────────────────────────
  const handleCampusChange = (e) => {
    const id = e.target.value;
    setTempCampusId(id);
    resetSelections();
    fetchBranches(id);
  };

  const handleBranchChange = (e) => {
    const id = e.target.value;
    setSelectedBranch(id);
    setSelectedGrades([]);
    setSelectedAdmissionId('');
    setSelectedFeeCategoryId('');
    setGradeData({});
    fetchGrades(id);
  };

  const handleGradeToggle = (grade) => {
    setSelectedGrades(prev =>
      prev.some(g => g.id === grade.id)
        ? prev.filter(g => g.id !== grade.id)
        : [...prev, grade]
    );
    setGradeData(prev => {
      const next = { ...prev };
      delete next[grade.id];
      return next;
    });
  };

  const handleSelectAllGrades = () => {
    if (allSelected) { setSelectedGrades([]); setGradeData({}); }
    else setSelectedGrades(grades);
  };

  const resetSelections = () => {
    setSelectedBranch('');
    setSelectedGrades([]);
    setSelectedAdmissionId('');
    setSelectedFeeCategoryId('');
    setGradeData({});
  };

  // ─── Per-grade doc helpers ─────────────────────────────────────────────────
  const toggleEditGrade = (gradeId) => {
    const isCurrentlyEditing = gradeData[gradeId]?.editing;
    const isNew = gradeData[gradeId]?.isNew;
    setGradeData(prev => ({
      ...prev,
      [gradeId]: { ...prev[gradeId], editing: !isCurrentlyEditing }
    }));
    if (!isCurrentlyEditing && isNew) {
      setAddDocPanel(prev => ({ ...prev, [gradeId]: true }));
    }
  };

  const updateDocInGrade = (gradeId, docId, field, value) => {
    setGradeData(prev => ({
      ...prev,
      [gradeId]: {
        ...prev[gradeId],
        dirty: true,
        docs: prev[gradeId].docs.map(d => d.id === docId ? { ...d, [field]: value } : d)
      }
    }));
  };

  const removeDocFromGrade = (gradeId, docId) => {
    setGradeData(prev => ({
      ...prev,
      [gradeId]: {
        ...prev[gradeId],
        dirty: true,
        docs: prev[gradeId].docs.filter(d => d.id !== docId)
      }
    }));
  };

  const addDocToGrade = (gradeId, doc) => {
    setGradeData(prev => {
      const exists = prev[gradeId]?.docs?.some(d => d.id === doc.id);
      if (exists) return prev;
      return {
        ...prev,
        [gradeId]: {
          ...prev[gradeId],
          dirty: true,
          docs: [
            ...(prev[gradeId]?.docs || []),
            { id: doc.id, name: doc.name, mandatory: doc.mandatory, active: doc.active }
          ]
        }
      };
    });
  };

  // ─── Save / Update for one grade ──────────────────────────────────────────
  const saveGrade = async (gradeId) => {
    const entry = gradeData[gradeId];
    if (!entry) return;

    const activeDocs = entry.docs || [];

    if (activeDocs.length === 0) {
      toast.error('Add at least one document before saving');
      return;
    }

    const payload = {
      branchGradeIds: [gradeId],
      documentTypeIds: activeDocs.map(d => d.id),
      required: activeDocs.map(d => d.mandatory === true || d.mandatory === 'true'),
      active: activeDocs.map(() => true)
    };

    const updatePayload = {
      documentTypeIds: activeDocs.map(d => d.id),
      required: activeDocs.map(d => d.mandatory === true || d.mandatory === 'true'),
      active: entry.docs.map(d => d.active === true || d.active === 'true')
    };

    try {
      if (entry.isNew) {
        await api.post(
          `/api/documents/mapping/${selectedAdmissionId}/map/${selectedFeeCategoryId}`,
          payload
        );
        console.log(payload);
      } else {
        console.log('Updating with payload:', updatePayload);
        await api.put(
          `/api/documents/mapping/update/${gradeId}/${selectedAdmissionId}/${selectedFeeCategoryId}`,
          updatePayload
        );
        console.log(updatePayload);
      }
      toast.success(entry.isNew ? 'Documents configured! 🚀' : 'Updated successfully 🚀');
      setGradeData(prev => ({
        ...prev,
        [gradeId]: { ...prev[gradeId], editing: false, dirty: false, isNew: false }
      }));
      setAddDocPanel(prev => ({ ...prev, [gradeId]: false }));
    } catch {
      toast.error(entry.isNew ? 'Configuration failed' : 'Update failed');
    }
  };

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen pb-24">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? '#1A1A1A' : '#fff',
            color: isDark ? '#fff' : '#000',
            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
          },
        }}
      />

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20">
            <FileText className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-heading font-black tracking-tighter uppercase">
              Document <span className="text-primary">Configuration</span>
            </h1>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Document Management &amp; Grade Mapping · <AutoBreadcrumb />
            </p>
          </div>
        </div>
      </header>

      {/* ── Filter bar ──────────────────────────────────────────────────────── */}
      <div className={`${card} overflow-hidden mb-6`}>
        <div className="p-6 border-b border-white/5 flex items-center gap-2 bg-primary/5">
          <Layers size={15} className="text-primary" />
          <h3 className="font-black uppercase text-title-table tracking-widest">Filter Configuration</h3>
        </div>

        <div className="p-6">
          <div className={`grid gap-4 ${superAdmin ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'}`}>

            {/* Campus */}
            {superAdmin && (
              <div>
                <label className={label}>Campus</label>
                <div className="relative">
                  <select value={tempCampusId} onChange={handleCampusChange} className={`${input} appearance-none pr-8`}>
                    <option value="">Select Campus</option>
                    {campuses.map(c => (
                      <option key={c.campusId || c.id} value={c.campusId || c.id}>{c.campusName}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                </div>
              </div>
            )}

            {/* Branch */}
            <div className="col-span-2 md:col-span-1">
              <label className={label}>Branch</label>
              <div className="relative">
                <select
                  value={selectedBranch}
                  onChange={handleBranchChange}
                  className={`${input} appearance-none pr-8 ${!tempCampusId && superAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!tempCampusId && superAdmin}
                >
                  <option value="">Select Branch</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.campusName} — {b.boardName} — {b.mediumName}</option>
                  ))}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
              </div>
            </div>

            {/* Grades multi-select */}
            <div ref={gradeDropdownRef} className="relative">
              <label className={label}>Grades</label>
              <button
                type="button"
                onClick={() => selectedBranch && setShowGradeDropdown(v => !v)}
                className={`${input} flex items-center justify-between ${!selectedBranch ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                disabled={!selectedBranch}
              >
                <span className="truncate">
                  {selectedGrades.length === 0
                    ? 'Select Grades'
                    : `${selectedGrades.length} grade${selectedGrades.length > 1 ? 's' : ''} selected`}
                </span>
                <ChevronDown size={13} className={`shrink-0 transition-transform ${showGradeDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showGradeDropdown && (
                <div className={`absolute z-30 w-full mt-1 rounded-xl border shadow-2xl ${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-200'}`}>
                  <div className="p-2 space-y-0.5">
                    <label className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={handleSelectAllGrades}
                        className="w-4 h-4 rounded"
                        style={{ accentColor: '#3B82F6' }}
                      />
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">Select All</span>
                    </label>
                    <div className={`h-px my-1 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                    <div className="max-h-44 overflow-y-auto space-y-0.5">
                      {grades.map(g => (
                        <label key={g.id} className={`flex items-center gap-2.5 px-2 py-2 rounded-lg cursor-pointer ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                          <input
                            type="checkbox"
                            checked={selectedGrades.some(sg => sg.id === g.id)}
                            onChange={() => handleGradeToggle(g)}
                            className="w-4 h-4 rounded"
                            style={{ accentColor: '#3B82F6' }}
                          />
                          <span className="text-sm">{g.gradeName}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Admission Type */}
            <div>
              <label className={label}>Admission Type</label>
              <div className="relative">
                <select
                  value={selectedAdmissionId}
                  onChange={e => setSelectedAdmissionId(e.target.value)}
                  className={`${input} appearance-none pr-8 ${!selectedGrades.length ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!selectedGrades.length}
                >
                  <option value="">Select Type</option>
                  {admissionTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
              </div>
            </div>

            {/* Fee Category */}
            <div>
              <label className={label}>Fee Category</label>
              <div className="relative">
                <select
                  value={selectedFeeCategoryId}
                  onChange={e => setSelectedFeeCategoryId(e.target.value)}
                  className={`${input} appearance-none pr-8 ${!selectedGrades.length ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!selectedGrades.length}
                >
                  <option value="">Select Category</option>
                  {feeCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
              </div>
            </div>
          </div>

          {/* Progress chips */}
          {(selectedBranch || selectedGrades.length > 0 || selectedAdmissionId || selectedFeeCategoryId) && (
            <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-dashed border-gray-200/30">
              {[
                { label: 'Branch', done: !!selectedBranch },
                { label: 'Grade(s)', done: selectedGrades.length > 0 },
                { label: 'Admission', done: !!selectedAdmissionId },
                { label: 'Fee Category', done: !!selectedFeeCategoryId },
              ].map(({ label: l, done }) => (
                <div key={l} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border
                  ${done
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-400/20'
                    : isDark
                      ? 'bg-white/5 text-gray-500 border-white/5'
                      : 'bg-gray-100 text-gray-400 border-gray-200'
                  }`}>
                  {done ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                  {l}
                </div>
              ))}
              {readyToFetch && selectedGrades.some(g => !gradeData[g.id] || gradeData[g.id].loading) && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 animate-pulse">
                  <Loader2 size={10} className="animate-spin" />
                  Auto-loading per grade…
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Per-grade document tables ────────────────────────────────────────── */}
      {readyToFetch && selectedGrades.length > 0 && (
        <div className="space-y-4">
          {selectedGrades.map(grade => {
            const entry = gradeData[grade.id] || { docs: [], loading: true, editing: false, dirty: false };
            const isExpanded = expandedGrades[grade.id] !== false;
            const isEditing = entry.editing;
            const activeDocs = isEditing
              ? entry.docs || []
              : (entry.docs?.filter(d =>
                d.active === true || d.active === 'true' || d.active === 1
              ) || []);

            const mandCount = activeDocs.filter(d => d.mandatory === true || d.mandatory === 'true').length;
            const unassigned = activeMasterDocs.filter(m => !entry.docs?.some(d => d.id === m.id));
            const filtered = unassigned.filter(d =>
              !docSearch || d.name.toLowerCase().includes(docSearch.toLowerCase())
            );

            return (
              <div key={grade.id} className={`${card} overflow-hidden`}>

                {/* Card header */}
                <div
                  className={`flex items-center justify-between px-6 py-5 cursor-pointer select-none bg-primary/5
                    ${isDark ? 'border-b border-white/5' : 'border-b border-slate-200'}`}
                  onClick={() => setExpandedGrades(prev => ({ ...prev, [grade.id]: !isExpanded }))}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shadow-lg
                      ${isEditing ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-primary text-white shadow-primary/20'}`}>
                      {grade.gradeName?.[0] || 'G'}
                    </div>
                    <div>
                      <p className="text-sm font-black uppercase tracking-wide">{grade.gradeName}</p>
                      <p className={`text-[10px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {entry.loading ? 'Loading…' : `${activeDocs.length} docs · ${mandCount} mandatory`}
                      </p>
                    </div>

                    {isEditing && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-500 border border-amber-400/25">
                        EDITING
                      </span>
                    )}
                    {entry.dirty && !isEditing && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-400/15 text-orange-400 border border-orange-300/25">
                        UNSAVED
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {/* Refresh */}
                    <button
                      onClick={() => fetchGradeDocs(grade)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all
                        ${isDark ? 'border-white/10 text-gray-400 hover:bg-white/10' : 'border-slate-200 text-gray-500 hover:bg-slate-50'}`}
                      title="Refresh"
                    >
                      <RefreshCw size={14} />
                    </button>

                    {/* Edit / Cancel edit */}
                    {!entry.loading && (
                      <button
                        onClick={() => toggleEditGrade(grade.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all active:scale-95
                          ${isEditing
                            ? isDark ? 'bg-white/10 text-gray-300 hover:bg-white/15' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            : entry.isNew
                              ? 'bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border border-emerald-400/20'
                              : 'bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border border-amber-400/20'
                          }`}
                      >
                        {isEditing
                          ? <><X size={12} />Cancel</>
                          : entry.isNew
                            ? <><Plus size={12} />Configure</>
                            : <><Pencil size={12} />Edit</>
                        }
                      </button>
                    )}

                    {/* Save */}
                    {isEditing && (
                      <button
                        onClick={() => saveGrade(grade.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider bg-primary text-white hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
                      >
                        <Save size={12} />Save
                      </button>
                    )}

                    {/* Expand/collapse */}
                    <button
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all
                        ${isDark ? 'border-white/10 text-gray-400 hover:bg-white/10' : 'border-slate-200 text-gray-500 hover:bg-slate-50'}`}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Table */}
                {isExpanded && (
                  <div>
                    {/* Table header bar */}
                    <div
                      className={`px-6 py-4 flex items-center justify-between border-b
                        ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/50'}`}
                      onClick={() => setExpandedGrades(prev => ({ ...prev, [grade.id]: !isExpanded }))}
                    >
                      <div className="flex items-center gap-2 text-primary cursor-pointer select-none">
                        <FileText size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Documents</span>
                      </div>
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20`}>
                          {activeDocs.length} docs
                        </span>
                        <span className={`${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
                          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className={`${isDark ? 'bg-white/[0.03]' : 'bg-slate-50'} text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                            <th className={`${thCell} w-10`}>#</th>
                            <th className={thCell}>Document Name</th>
                            <th className={thCell}>Type</th>
                            <th className={thCell}>Status</th>
                            {isEditing && <th className={`${thCell} text-center`}>Remove</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {entry.loading && <LoadingRow isDark={isDark} cols={isEditing ? 5 : 4} />}

                          {!entry.loading && activeDocs.length === 0 && (
                            <EmptyRow
                              isDark={isDark}
                              cols={isEditing ? 5 : 4}
                              msg={entry.isNew
                                ? isEditing
                                  ? 'Use the panel below to add documents for this grade.'
                                  : 'No documents configured. Click Configure to set up.'
                                : 'No documents configured for this selection.'
                              }
                            />
                          )}

                          {!entry.loading && activeDocs.map((doc, idx) => (
                            <tr key={doc.id} className={trHover}>
                              <td className={`${tdCell} font-black text-primary/40`}>{String(idx + 1).padStart(2, '0')}</td>
                              <td className={`${tdCell} font-semibold`}>{doc.name}</td>
                              <td className={tdCell}>
                                {isEditing ? (
                                  <div className={`flex rounded-lg overflow-hidden border w-fit ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                                    <button
                                      onClick={() => updateDocInGrade(grade.id, doc.id, 'mandatory', true)}
                                      className={`px-3 py-1.5 text-[10px] font-black uppercase transition-all
                                        ${doc.mandatory === true || doc.mandatory === 'true'
                                          ? 'bg-primary text-white'
                                          : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    >
                                      Mandatory
                                    </button>
                                    <button
                                      onClick={() => updateDocInGrade(grade.id, doc.id, 'mandatory', false)}
                                      className={`px-3 py-1.5 text-[10px] font-black uppercase transition-all
                                        ${doc.mandatory === false || doc.mandatory === 'false' || !doc.mandatory
                                          ? 'bg-primary text-white'
                                          : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    >
                                      Optional
                                    </button>
                                  </div>
                                ) : (
                                  <Badge type={doc.mandatory === true || doc.mandatory === 'true' ? 'mandatory' : 'optional'} />
                                )}
                              </td>
                              <td className={tdCell}>
                                {isEditing ? (
                                  <div className={`flex rounded-lg overflow-hidden border w-fit ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                                    <button
                                      onClick={() =>
                                        updateDocInGrade(
                                          grade.id,
                                          doc.id,
                                          'active',
                                          !(doc.active === true || doc.active === 'true')
                                        )
                                      }
                                      className={`px-3 py-1.5 text-xs font-bold transition-all ${doc.active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                                    >
                                      {doc.active ? 'Active' : 'Inactive'}
                                    </button>
                                  </div>
                                ) : (
                                  <Badge type={doc.active === true || doc.active === 'true' ? 'active' : 'inactive'} />
                                )}
                              </td>
                              {isEditing && (
                                <td className={`${tdCell} text-center`}>
                                  <button
                                    onClick={() => removeDocFromGrade(grade.id, doc.id)}
                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-all"
                                  >
                                    <X size={14} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* ── Add documents panel (visible in edit mode) ─────────── */}
                    {isEditing && (
                      <div className={`border-t px-6 py-5 ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                        <button
                          onClick={() => setAddDocPanel(prev => ({ ...prev, [grade.id]: !prev[grade.id] }))}
                          className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary hover:text-primary/80 transition-colors"
                        >
                          <Plus size={14} />
                          {addDocPanel[grade.id] ? 'Hide available documents' : `Add documents (${unassigned.length} available)`}
                          <ChevronDown size={12} className={`transition-transform ${addDocPanel[grade.id] ? 'rotate-180' : ''}`} />
                        </button>

                        {addDocPanel[grade.id] && (
                          <div className="mt-3">
                            {/* Search */}
                            <div className="relative mb-3">
                              <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                              <input
                                type="text"
                                placeholder="Search documents…"
                                value={docSearch}
                                onChange={e => setDocSearch(e.target.value)}
                                className={`${input} pl-9 py-2`}
                              />
                            </div>

                            {filtered.length === 0 ? (
                              <p className={`text-xs py-3 text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                All documents are already assigned.
                              </p>
                            ) : (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                                {filtered.map(doc => (
                                  <button
                                    key={doc.id}
                                    onClick={() => addDocToGrade(grade.id, doc)}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left text-xs font-medium transition-all
                                      ${isDark
                                        ? 'bg-white/3 border-white/8 hover:border-primary/50 hover:bg-primary/10 text-gray-300'
                                        : 'bg-gray-50 border-gray-200 hover:border-primary/40 hover:bg-primary/5 text-gray-700'
                                      }`}
                                  >
                                    <Plus size={12} className="shrink-0 text-primary" />
                                    <span className="truncate">{doc.name}</span>
                                    <Badge type={doc.mandatory === true || doc.mandatory === 'true' ? 'mandatory' : 'optional'} />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Card footer stats */}
                    {!entry.loading && activeDocs.length > 0 && (
                      <div className={`flex items-center gap-4 px-6 py-4 border-t ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-slate-200 bg-slate-50/50'}`}>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                          Summary:
                        </span>
                        <span className="text-[11px] font-bold text-primary">{activeDocs.length} Total</span>
                        <span className={`text-[11px] font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          · {mandCount} Mandatory · {activeDocs.length - mandCount} Optional
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Empty state when filters not ready ──────────────────────────────── */}
      {!readyToFetch && (
        <div className={`${card} p-16 text-center`}>
          <div className={`w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <FileText size={28} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
          </div>
          <p className={`text-sm font-black uppercase tracking-widest opacity-30 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Select branch, grade(s), admission type &amp; fee category
          </p>
          <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            Documents will load automatically once all filters are set.
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentConfiguration;
