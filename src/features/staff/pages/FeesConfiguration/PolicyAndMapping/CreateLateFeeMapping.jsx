import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import api from "../../../../../config/api"; 
import { 
  Plus, Loader2, Link as LinkIcon, 
  ArrowLeft, School, BookOpen, Calendar, 
  Layers, Tag, UserCheck, Briefcase, Check,
  ChevronLeft, ChevronRight, MousePointerSquareDashed, 
  Info, HelpCircle, ShieldAlert, Save, Fingerprint, 
  ShieldCheck, ChevronDown
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import AutoBreadcrumb from "../../../../../components/common/AutoBreadcrumb";

const LateFeeMappingManager = () => {
  const isDark = useSelector((state) => state.theme?.mode === "dark" || state.color?.mode === "dark");
  const { campuses, superAdmin } = useSelector((state) => state.campus);
  
  // --- STATE ---
  const [mappings, setMappings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [loading, setLoading] = useState({ fetch: true, save: false, deps: false });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  
  const [options, setOptions] = useState({
    branches: [], grades: [], academicYears: [], installments: [],
    streams: [], policies: [], admissionTypes: [], feeStructureTypes: [], 
    allGradesGlobal: [], allStreamsGlobal: [], allFeeStructureTypesGlobal: [] 
  });

  const [formData, setFormData] = useState({
    branchId: "", branchGradeId: "", academicYearId: "",
    installmentIds: [], branchGradeStreamId: "", admissionTypeId: "",
    lateFeePolicyId: "", feeStructureTypeId: ""
  });

  const [confirmModal, setConfirmModal] = useState({ show: false, data: null });

  // --- STYLES ---
  const theme = {
    panel: isDark ? "bg-[#0D0D0D] border-white/10" : "bg-white border-slate-200",
    tableHeader: isDark ? "bg-white/[0.03]" : "bg-slate-50",
    rowHover: isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50",
    modalOverlay: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm",
    select: isDark 
      ? "bg-[#141414] border-white/10 text-white appearance-none cursor-pointer focus:border-primary/50" 
      : "bg-white border-slate-200 text-slate-900 appearance-none cursor-pointer focus:border-primary",
  };

  const cardClass = `rounded-3xl border shadow-sm overflow-hidden transition-all duration-300 ${theme.panel}`;

  // --- FUNCTIONALITY: DATA FETCHING (OLD LOGIC) ---
  const fetchInitialData = useCallback(async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const [mapsRes, branchesRes, yearsRes, instRes, policiesRes, adminTypeRes] = await Promise.all([
        api.get("/api/late-fee-mappings"),
        api.get("/api/branches"),
        api.get("/api/academic-years/get-all-academic-year"),
        api.get("/api/fee-installments"),
        api.get("/api/late-fee-policies"),
        api.get("/api/admission-types")
      ]);

      let filteredBranches = branchesRes.data || [];
      if (!superAdmin && campuses?.length > 0) {
        const allowedCampusIds = campuses.map(c => c.campusId);
        filteredBranches = filteredBranches.filter(b => allowedCampusIds.includes(b.campusId));
      }

      setOptions(prev => ({
        ...prev,
        branches: filteredBranches,
        academicYears: yearsRes.data || [],
        installments: instRes.data || [],
        policies: policiesRes.data || [],
        admissionTypes: adminTypeRes.data || [],
      }));

      setMappings(Array.isArray(mapsRes.data) ? mapsRes.data : []);
      fetchLookupData(filteredBranches);
    } catch (error) {
      toast.error("Data synchronization failed");
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, [superAdmin, campuses]);

  const fetchLookupData = async (branches) => {
    try {
      const gradePromises = branches.map(b => 
        api.get(`/api/branches/${b.id}/grades`).then(res => 
          res.data.map(grade => ({ ...grade, branchId: b.id, campusName: b.campusName }))
        )
      );
      const gradeResults = await Promise.all(gradePromises);
      const flatGrades = gradeResults.flat();

      const streamPromises = flatGrades.map(g => 
        api.get(`/api/branch-grades/${g.id}/streams`).then(res => res.data.streams || [])
      );
      const streamResults = await Promise.all(streamPromises);
      
      const structurePromises = branches.map(b => 
        api.get(`/api/fees/structure-types?campus_id=${b.id}`).catch(() => ({ data: [] }))
      );
      const structureResults = await Promise.all(structurePromises);

      setOptions(prev => ({ 
        ...prev, 
        allGradesGlobal: flatGrades,
        allStreamsGlobal: streamResults.flat(),
        allFeeStructureTypesGlobal: structureResults.flatMap(r => r.data || [])
      }));

      // Mapping Filter Logic from Old Code
      const allowedBranchIds = branches.map(b => b.id);
      setMappings(prev => prev.filter(m => {
        const grade = flatGrades.find(g => String(g.id) === String(m.branchGradeId));
        return grade ? allowedBranchIds.includes(grade.branchId) : false;
      }));
    } catch (e) { console.error("Secondary lookup failed", e); }
  };

  useEffect(() => { fetchInitialData(); }, [fetchInitialData]);

  // Branch & Grade Dependencies (Old Logic)
  useEffect(() => {
    if (formData.branchId) {
      setLoading(prev => ({ ...prev, deps: true }));
      Promise.all([
        api.get(`/api/branches/${formData.branchId}/grades`),
        api.get(`/api/fees/structure-types?campus_id=${formData.branchId}`)
      ]).then(([g, s]) => {
        setOptions(prev => ({ ...prev, grades: g.data || [], feeStructureTypes: s.data || [] }));
      }).finally(() => setLoading(prev => ({ ...prev, deps: false })));
    }
  }, [formData.branchId]);

  useEffect(() => {
    if (formData.branchGradeId) {
      api.get(`/api/branch-grades/${formData.branchGradeId}/streams`)
        .then(res => setOptions(prev => ({ ...prev, streams: res.data.streams || [] })))
        .catch(() => setOptions(prev => ({ ...prev, streams: [] })));
    }
  }, [formData.branchGradeId]);

  // --- ACTIONS ---
  const toggleInstallment = (id) => {
    setFormData(prev => ({
      ...prev,
      installmentIds: prev.installmentIds.includes(id)
        ? prev.installmentIds.filter(i => i !== id)
        : [...prev.installmentIds, id]
    }));
  };

  const handleTriggerSubmit = (e) => {
    e.preventDefault();
    if (formData.installmentIds.length === 0) return toast.error("Select installments");
    setConfirmModal({ show: true, data: formData });
  };

  const executeMapping = async () => {
    const data = confirmModal.data;
    setConfirmModal({ show: false, data: null });
    setLoading(prev => ({ ...prev, save: true }));

    const payload = {
      branchGradeId: Number(data.branchGradeId),
      academicYearId: Number(data.academicYearId),
      installmentIds: data.installmentIds.map(Number),
      lateFeePolicyId: Number(data.lateFeePolicyId),
      branchGradeStreamId: data.branchGradeStreamId ? Number(data.branchGradeStreamId) : null,
      admissionTypeId: data.admissionTypeId ? Number(data.admissionTypeId) : null,
      feeStructureTypeId: data.feeStructureTypeId ? Number(data.feeStructureTypeId) : null,
    };

    try {
      await api.post("/api/late-fee-mappings", payload);
      toast.success("Late Fee Bridge Established");
      setShowForm(false);
      setFormData({ branchId: "", branchGradeId: "", academicYearId: "", installmentIds: [], branchGradeStreamId: "", admissionTypeId: "", lateFeePolicyId: "", feeStructureTypeId: "" });
      fetchInitialData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to bridge mapping");
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const resolveName = (list, id, key = "name") => {
    if (!id || !list) return null;
    const found = list.find(item => String(item.id) === String(id));
    return found ? found[key] : null;
  };

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return mappings.slice(start, start + itemsPerPage);
  }, [mappings, currentPage]);

  const totalPages = Math.ceil(mappings.length / itemsPerPage);

  return (
    <div className={`min-h-screen${isDark ? "text-white" : "text-slate-900"}`}>
      <Toaster position="top-right" />

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.show && (
        <div className={theme.modalOverlay}>
          <div className={`w-full max-w-md rounded-3xl border p-8 shadow-2xl animate-in zoom-in-95 duration-200 ${theme.panel}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-primary/10"><ShieldAlert className="text-primary" size={28} /></div>
              <div>
                <h3 className="text-lg font-black uppercase italic">Confirm Bridge</h3>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Protocol Protocol</p>
              </div>
            </div>
            <p className="text-sm opacity-80 mb-8 leading-relaxed">Confirm mapping this policy? Penalties will apply to overdue installments immediately.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false })} className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] border border-white/10">Cancel</button>
              <button onClick={executeMapping} className="flex-1 h-12 rounded-xl text-white font-black uppercase text-[10px] bg-primary">Proceed</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20 rotate-3"><LinkIcon className="text-white" size={28} /></div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">Fee <span className="text-primary not-italic">Mapping</span></h1>
            <div className="flex items-center gap-2 opacity-50"><Fingerprint size={12} /><span className="text-[9px] font-bold uppercase tracking-widest">Late Fee Policy Linker</span></div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {showForm ? (
            <button onClick={() => setShowForm(false)} className={`px-6 py-3 rounded-xl border font-black text-[10px] uppercase tracking-widest ${theme.panel}`}><ArrowLeft size={16} className="inline mr-2" /> Back</button>
          ) : (
            <button onClick={() => setShowForm(true)} className="bg-primary text-white px-8 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20"><Plus size={18} /> New Mapping</button>
          )}
          <button onClick={() => setShowInfo(!showInfo)} className={`p-3 rounded-xl border transition-all ${showInfo ? 'bg-primary/10 border-primary text-primary' : 'opacity-50 ' + theme.panel}`}><Info size={20} /></button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`${showInfo ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-500 space-y-8`}>
          <AutoBreadcrumb />

          {showForm ? (
            <div className={`${cardClass} animate-in slide-in-from-top-4`}>
              <div className="p-8 border-b border-white/5 bg-primary/5"><h2 className="text-xl font-black italic uppercase">Bridge Configuration</h2></div>
              
              <form onSubmit={handleTriggerSubmit} className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Campus */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-primary ml-1">1. Campus</label>
                    <div className="relative">
                      <select required value={formData.branchId} onChange={(e) => setFormData({...formData, branchId: e.target.value})} className={`w-full h-12 px-4 rounded-xl font-black text-xs border outline-none ${theme.select}`}>
                        <option value="">Select Branch...</option>
                        {options.branches.map(b => <option key={b.id} value={b.id}>{b.campusName} - {b.boardName}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={16} />
                    </div>
                  </div>

                  {/* Grade */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-primary ml-1">2. Grade</label>
                    <div className="relative">
                      <select required disabled={!formData.branchId} value={formData.branchGradeId} onChange={(e) => setFormData({...formData, branchGradeId: e.target.value})} className={`w-full h-12 px-4 rounded-xl font-black text-xs border outline-none ${theme.select}`}>
                        <option value="">Select Grade...</option>
                        {options.grades.map(g => <option key={g.id} value={g.id}>{g.gradeName}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={16} />
                    </div>
                  </div>

                  {/* Session */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-primary ml-1">3. Session</label>
                    <div className="relative">
                      <select required value={formData.academicYearId} onChange={(e) => setFormData({...formData, academicYearId: e.target.value})} className={`w-full h-12 px-4 rounded-xl font-black text-xs border outline-none ${theme.select}`}>
                        <option value="">Select Session...</option>
                        {options.academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={16} />
                    </div>
                  </div>

                  {/* Admission Type (Restored) */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-primary ml-1">Admission Type</label>
                    <div className="relative">
                      <select value={formData.admissionTypeId} onChange={(e) => setFormData({...formData, admissionTypeId: e.target.value})} className={`w-full h-12 px-4 rounded-xl font-black text-xs border outline-none ${theme.select}`}>
                        <option value="">Any Admission Type</option>
                        {options.admissionTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={16} />
                    </div>
                  </div>

                  {/* Stream (Restored) */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-primary ml-1">Stream Context</label>
                    <div className="relative">
                      <select disabled={options.streams.length === 0} value={formData.branchGradeStreamId} onChange={(e) => setFormData({...formData, branchGradeStreamId: e.target.value})} className={`w-full h-12 px-4 rounded-xl font-black text-xs border outline-none ${theme.select}`}>
                        <option value="">All Streams</option>
                        {options.streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={16} />
                    </div>
                  </div>

                  {/* Fee Structure (Restored) */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-primary ml-1">Fee Structure</label>
                    <div className="relative">
                      <select disabled={!formData.branchId} value={formData.feeStructureTypeId} onChange={(e) => setFormData({...formData, feeStructureTypeId: e.target.value})} className={`w-full h-12 px-4 rounded-xl font-black text-xs border outline-none ${theme.select}`}>
                        <option value="">All Fee Structures</option>
                        {options.feeStructureTypes.map(ft => <option key={ft.id} value={ft.id}>{ft.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={16} />
                    </div>
                  </div>
                </div>

                {/* Installments */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[9px] font-black uppercase text-primary flex items-center gap-2"><Layers size={14}/> 4. Installments</label>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, installmentIds: options.installments.map(i => i.id) }))} className="text-[9px] font-black text-primary uppercase hover:underline">Select All</button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {options.installments.map(inst => (
                      <button key={inst.id} type="button" onClick={() => toggleInstallment(inst.id)} className={`h-12 rounded-xl border-2 font-black text-[10px] transition-all flex items-center justify-center gap-2 ${formData.installmentIds.includes(inst.id) ? "border-primary bg-primary/10 text-primary" : "border-white/5 opacity-40"}`}>
                        {inst.code} {formData.installmentIds.includes(inst.id) && <Check size={12} strokeWidth={4}/>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Policy */}
                <div className="space-y-1 border-t border-white/5 pt-6">
                  <label className="text-[9px] font-black uppercase text-red-500 ml-1">5. Late Fee Policy</label>
                  <div className="relative">
                    <select required value={formData.lateFeePolicyId} onChange={(e) => setFormData({...formData, lateFeePolicyId: e.target.value})} className={`w-full h-12 px-4 rounded-xl font-black text-xs border outline-none ${theme.select} !border-red-500/20`}>
                      <option value="">Select Policy Bridge...</option>
                      {options.policies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-red-500" size={16} />
                  </div>
                </div>

                <button type="submit" disabled={loading.save} className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-3">
                  {loading.save ? <Loader2 className="animate-spin" /> : <Save size={18} />} Finalize Mapping Bridge
                </button>
              </form>
            </div>
          ) : (
            <div className={cardClass}>
              <div className="p-6 border-b border-white/5 bg-primary/5"><h3 className="font-black uppercase text-[10px] tracking-widest opacity-70 italic">Linkage Registry</h3></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`${theme.tableHeader} text-[9px] font-black uppercase text-slate-500 tracking-widest`}>
                      <th className="px-8 py-5">Campus / Grade / Context</th>
                      <th className="px-8 py-5">Installment / Year</th>
                      <th className="px-8 py-5">Active Policy</th>
                      <th className="px-8 py-5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading.fetch ? (
                      <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin inline-block text-primary" size={32} /></td></tr>
                    ) : paginatedData.map((m) => {
                      const branchGrade = options.allGradesGlobal.find(g => String(g.id) === String(m.branchGradeId));
                      const structureName = resolveName(options.allFeeStructureTypesGlobal, m.feeStructureTypeId || m.feeStructureId) || "ALL STRUCTURES";
                      const streamName = resolveName(options.allStreamsGlobal, m.branchGradeStreamId) || "ALL STREAMS";
                      const admissionName = resolveName(options.admissionTypes, m.admissionTypeId) || "ANY ADMISSION";

                      return (
                        <tr key={m.id} className={`transition-colors group ${theme.rowHover}`}>
                          <td className="px-8 py-6">
                            <p className="font-black text-[11px] uppercase">{branchGrade?.campusName || "N/A"}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded italic">{branchGrade?.gradeName || "N/A"}</span>
                              <span className="text-[9px] font-bold opacity-40 border border-white/10 px-2 py-0.5 rounded">{streamName}</span>
                              <span className="text-[9px] font-bold opacity-40 border border-white/10 px-2 py-0.5 rounded">{admissionName}</span>
                            </div>
                            <p className="text-[8px] font-bold opacity-30 mt-1 uppercase italic">{structureName}</p>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-[10px] font-black opacity-50 uppercase">{resolveName(options.academicYears, m.academicYearId)}</p>
                            <span className="text-[9px] font-black text-white bg-slate-500 px-2 py-0.5 rounded mt-1 inline-block uppercase">
                              {resolveName(options.installments, m.installmentId, "code") || `INST-${m.installmentId}`}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase bg-red-500/10 text-red-600 border border-red-500/10 italic">
                              {resolveName(options.policies, m.lateFeePolicyId) || `ID: ${m.lateFeePolicyId}`}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${m.isActive ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : "border-rose-500/20 text-rose-500 bg-rose-500/5"}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${m.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                              {m.isActive ? "Active" : "Locked"}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

{/* --- PAGINATION CONTROLS --- */}
{mappings.length > itemsPerPage && (
  <div className="p-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
    {/* Record Count Indicator */}
    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">
      Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, mappings.length)} of {mappings.length}
    </p>

    {/* Navigation Buttons */}
    <div className="flex items-center gap-2">
      {/* Previous Page */}
      <button 
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
        disabled={currentPage === 1} 
        className="p-2 rounded-lg border border-white/5 hover:bg-primary/10 disabled:opacity-20 transition-all"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Numbered Page List */}
      <div className="flex items-center gap-1 mx-2">
        {[...Array(totalPages)].map((_, i) => (
          <button 
            key={i} 
            onClick={() => setCurrentPage(i + 1)} 
            className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
              currentPage === i + 1 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'hover:bg-white/5 opacity-50'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Next Page */}
      <button 
        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
        disabled={currentPage === totalPages} 
        className="p-2 rounded-lg border border-white/5 hover:bg-primary/10 disabled:opacity-20 transition-all"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  </div>
)}
              
            </div>
          )}
        </div>

        {/* --- INFO PANEL (NEW UI FEATURE) --- */}
        {showInfo && (
          <aside className="lg:col-span-4 animate-in slide-in-from-right-4 duration-500">
            <div className={`${cardClass} p-8 sticky top-10 shadow-2xl`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg"><HelpCircle className="text-primary" size={20} /></div>
                <h4 className="font-black uppercase text-xs tracking-widest italic">Mapping Terminal</h4>
              </div>
              <div className="space-y-6">
                <div>
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2 italic">Bridge Engine</h5>
                  <p className="text-xs leading-relaxed opacity-60">Bind penalties to installments with granular control over Grade, Stream, and Admission Type.</p>
                </div>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                   <h5 className="text-[10px] font-black uppercase text-primary mb-2 flex items-center gap-2"><ShieldCheck size={12} /> Data Persistence</h5>
                   <p className="text-[10px] leading-relaxed opacity-70 italic">Mappings are unique to each academic session.</p>
                </div>
                <button onClick={() => setShowInfo(false)} className="w-full py-3 rounded-xl border border-white/5 text-[9px] font-black uppercase opacity-40 hover:opacity-100 transition-all">Dismiss Panel</button>
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
};

export default LateFeeMappingManager;