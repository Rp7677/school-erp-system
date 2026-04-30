import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../config/api"; 
import { 
  Plus, Loader2, Link as LinkIcon, 
  ArrowLeft, School, BookOpen, Calendar, 
  Layers, Tag, UserCheck, Briefcase, Check,
  ChevronLeft, ChevronRight, MousePointerSquareDashed
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const LateFeeMappingManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  
  const [mappings, setMappings] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState({ fetch: true, save: false, deps: false });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [options, setOptions] = useState({
    branches: [],
    grades: [], 
    academicYears: [],
    installments: [],
    streams: [], 
    policies: [],
    admissionTypes: [],
    feeStructureTypes: [], 
    allGradesGlobal: [],
    allStreamsGlobal: [],
    allFeeStructureTypesGlobal: [] 
  });

  const [formData, setFormData] = useState({
    branchId: "",
    branchGradeId: "",
    academicYearId: "",
    installmentIds: [], 
    branchGradeStreamId: "",
    admissionTypeId: "",
    lateFeePolicyId: "",
    feeStructureTypeId: ""
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
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

      // FIX: Fetch structure types for all branches to ensure labels resolve in the table
      const structurePromises = (branchesRes.data || []).map(b => 
        api.get(`/api/fees/structure-types?campus_id=${b.id}`).catch(() => ({ data: [] }))
      );
      const structureResults = await Promise.all(structurePromises);
      
      const flatStructures = structureResults.flatMap(r => r.data || []);

      setMappings(Array.isArray(mapsRes.data) ? mapsRes.data : []);
      setOptions(prev => ({
        ...prev,
        branches: branchesRes.data || [],
        academicYears: yearsRes.data || [],
        installments: instRes.data || [],
        policies: policiesRes.data || [],
        admissionTypes: adminTypeRes.data || [],
        allFeeStructureTypesGlobal: flatStructures 
      }));

      fetchLookupData(branchesRes.data || []);
    } catch (error) {
      toast.error("Failed to load initial data");
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

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

      setOptions(prev => ({ 
        ...prev, 
        allGradesGlobal: flatGrades,
        allStreamsGlobal: streamResults.flat()
      }));
    } catch (e) { console.error("Secondary lookup failed", e); }
  };

  useEffect(() => {
    if (formData.branchId) {
      const fetchBranchData = async () => {
        setLoading(prev => ({ ...prev, deps: true }));
        try {
          const [gradesRes, feeTypesRes] = await Promise.all([
            api.get(`/api/branches/${formData.branchId}/grades`),
            api.get(`/api/fees/structure-types?campus_id=${formData.branchId}`)
          ]);
          setOptions(prev => ({ 
            ...prev, 
            grades: gradesRes.data || [], 
            feeStructureTypes: feeTypesRes.data || [] 
          }));
        } catch (err) { toast.error("Error loading branch dependencies"); }
        finally { setLoading(prev => ({ ...prev, deps: false })); }
      };
      fetchBranchData();
    }
  }, [formData.branchId]);

  useEffect(() => {
    if (formData.branchGradeId) {
      api.get(`/api/branch-grades/${formData.branchGradeId}/streams`)
        .then(res => setOptions(prev => ({ ...prev, streams: res.data.streams || [] })))
        .catch(() => setOptions(prev => ({ ...prev, streams: [] })));
    }
  }, [formData.branchGradeId]);

  const toggleInstallment = (id) => {
    setFormData(prev => ({
      ...prev,
      installmentIds: prev.installmentIds.includes(id)
        ? prev.installmentIds.filter(i => i !== id)
        : [...prev.installmentIds, id]
    }));
  };

  const handleSelectAllInstallments = () => {
    if (formData.installmentIds.length === options.installments.length) {
      setFormData(prev => ({ ...prev, installmentIds: [] }));
    } else {
      setFormData(prev => ({ ...prev, installmentIds: options.installments.map(i => i.id) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.installmentIds.length === 0) return toast.error("Select at least one installment");
    setLoading(prev => ({ ...prev, save: true }));

    const payload = {
      branchGradeId: Number(formData.branchGradeId),
      academicYearId: Number(formData.academicYearId),
      installmentIds: formData.installmentIds.map(Number),
      lateFeePolicyId: Number(formData.lateFeePolicyId),
      branchGradeStreamId: formData.branchGradeStreamId ? Number(formData.branchGradeStreamId) : null,
      admissionTypeId: formData.admissionTypeId ? Number(formData.admissionTypeId) : null,
      feeStructureTypeId: formData.feeStructureTypeId ? Number(formData.feeStructureTypeId) : null,
    };

    try {
      await api.post("/api/late-fee-mappings", payload);
      toast.success("Mapping created successfully");
      setShowForm(false);
      setFormData({ branchId: "", branchGradeId: "", academicYearId: "", installmentIds: [], branchGradeStreamId: "", admissionTypeId: "", lateFeePolicyId: "", feeStructureTypeId: "" });
      fetchInitialData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save");
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  // --- HELPERS ---
  const resolveName = (list, id, key = "name") => {
    if (id === null || id === undefined || id === "") return null;
    if (!list || list.length === 0) return null;
    // Strict comparison after converting both to string
    const found = list.find(item => String(item.id) === String(id));
    return found ? found[key] : null;
  };

  const getBranchInfo = (gradeId) => {
    return options.allGradesGlobal.find(g => String(g.id) === String(gradeId));
  };

  const totalPages = Math.ceil(mappings.length / itemsPerPage);
  const currentMappings = mappings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const cardClass = `rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${isDark ? "bg-[#141414] border-white/5 shadow-black" : "bg-white border-gray-100 shadow-gray-200"}`;
  const inputClass = `w-full px-6 py-4 rounded-2xl border outline-none font-bold transition-all ${isDark ? "bg-[#1A1A1A] border-white/10 text-white focus:border-primary" : "bg-gray-50 border-gray-200 focus:border-primary focus:bg-white"}`;

  return (
    <div className={`min-h-screen p-6 max-w-7xl mx-auto space-y-8 pb-20 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
      <Toaster position="top-right" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">{showForm ? "New Rule" : "Late Fee Rules"}</h1>
          <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mt-2 flex items-center gap-2">
            <span className="w-4 h-[2px] bg-primary" /> {mappings.length} Configured Rules
          </p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="group flex items-center gap-3 bg-primary text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 transition-all">
            <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Add New Mapping
          </button>
        )}
      </div>

      {showForm ? (
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button onClick={() => setShowForm(false)} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft size={16}/> Back to List
          </button>

          <div className={cardClass}>
            <form onSubmit={handleSubmit} className="p-10 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><School size={14}/> 1. Campus</label>
                  <select className={inputClass} value={formData.branchId} onChange={(e) => setFormData({...formData, branchId: e.target.value})} required>
                    <option value="">Select Branch</option>
                    {options.branches.map(b => <option key={b.id} value={b.id}>{b.campusName} - {b.boardName} - {b.mediumName}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><BookOpen size={14}/> 2. Grade</label>
                  <select className={inputClass} value={formData.branchGradeId} onChange={(e) => setFormData({...formData, branchGradeId: e.target.value})} disabled={!formData.branchId} required>
                    <option value="">Select Grade</option>
                    {options.grades.map(g => <option key={g.id} value={g.id}>{g.gradeName}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={14}/> 3. Session</label>
                  <select className={inputClass} value={formData.academicYearId} onChange={(e) => setFormData({...formData, academicYearId: e.target.value})} required>
                    <option value="">Select Year</option>
                    {options.academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><UserCheck size={14}/> Admission Type</label>
                  <select className={inputClass} value={formData.admissionTypeId} onChange={(e) => setFormData({...formData, admissionTypeId: e.target.value})}>
                    <option value="">Any Admission Type</option>
                    {options.admissionTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Tag size={14}/> Stream</label>
                  <select className={inputClass} value={formData.branchGradeStreamId} onChange={(e) => setFormData({...formData, branchGradeStreamId: e.target.value})} disabled={options.streams.length === 0}>
                    <option value="">All Streams</option>
                    {options.streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2"><Briefcase size={14}/> Fee Structure</label>
                  <select className={inputClass} value={formData.feeStructureTypeId} onChange={(e) => setFormData({...formData, feeStructureTypeId: e.target.value})} disabled={!formData.branchId}>
                    <option value="">All Fee Structures</option>
                    {options.feeStructureTypes.map(ft => <option key={ft.id} value={ft.id}>{ft.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <Layers size={14}/> 4. Installments
                  </label>
                  <button type="button" onClick={handleSelectAllInstallments} className="flex items-center gap-2 text-[10px] font-black text-primary hover:underline">
                    <MousePointerSquareDashed size={14}/> {formData.installmentIds.length === options.installments.length ? "DESELECT ALL" : "SELECT ALL"}
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {options.installments.map(inst => {
                    const isSelected = formData.installmentIds.includes(inst.id);
                    return (
                      <div key={inst.id} onClick={() => toggleInstallment(inst.id)} className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${isSelected ? "border-primary bg-primary/10 text-primary" : "border-gray-100 text-gray-400"}`}>
                        <span className="text-[10px] font-black">{inst.code}</span>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-6 border-t border-dashed border-gray-500/20">
                <label className="text-[10px] font-black text-red-500 uppercase tracking-widest">5. Policy</label>
                <select className={inputClass} value={formData.lateFeePolicyId} onChange={(e) => setFormData({...formData, lateFeePolicyId: e.target.value})} required>
                  <option value="">Select a Policy</option>
                  {options.policies.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <button type="submit" disabled={loading.save} className="w-full py-6 bg-primary text-white rounded-[2rem] font-black shadow-2xl flex items-center justify-center gap-3">
                {loading.save ? <Loader2 className="animate-spin" /> : <LinkIcon size={20} />} CREATE CONFIG
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className={`${cardClass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className={isDark ? "bg-white/5" : "bg-gray-50/50"}>
                <tr className="text-[10px] font-black uppercase tracking-widest text-primary">
                  <th className="p-8">Campus / Grade</th>
                  <th className="p-8">Session / Inst.</th>
                  <th className="p-8">Criteria</th>
                  <th className="p-8">Active Policy</th>
                  <th className="p-8 text-right">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
                {currentMappings.map((m) => {
                  const branchInfo = getBranchInfo(m.branchGradeId);
                  
                  // Priority order for resolving structure name
                  const structureId = m.feeStructureTypeId || m.feeStructureId;
                  const structureName = resolveName(options.allFeeStructureTypesGlobal, structureId) || "ALL STRUCTURES";
                  
                  const streamName = resolveName(options.allStreamsGlobal, m.branchGradeStreamId) || "ALL STREAMS";
                  const admissionName = resolveName(options.admissionTypes, m.admissionTypeId) || "ANY ADMISSION";

                  return (
                    <tr key={m.id} className="group hover:bg-primary/[0.03] transition-colors">
                      <td className="p-8">
                        <p className="font-black text-sm uppercase italic">{branchInfo?.campusName || "N/A"}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {resolveName(options.allGradesGlobal, m.branchGradeId, "gradeName") || "N/A"}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${isDark ? "border-white/10 text-gray-400" : "border-gray-200 text-gray-500"}`}>
                            {streamName}
                          </span>
                        </div>
                      </td>
                      <td className="p-8">
                        <p className="font-bold text-xs">{resolveName(options.academicYears, m.academicYearId) || "-"}</p>
                        <span className="text-[9px] font-black text-white bg-gray-500 px-1.5 rounded">
                           {resolveName(options.installments, m.installmentId, "code") || "INST-"+m.installmentId}
                        </span>
                      </td>
                      <td className="p-8">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <UserCheck size={10} className="text-primary" />
                            <p className="text-[9px] font-black text-gray-500">{admissionName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Briefcase size={10} className="text-primary" />
                            <p className="text-[9px] font-black text-gray-500">{structureName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <span className="px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-red-500/10 text-red-600 border border-red-500/10">
                          {resolveName(options.policies, m.lateFeePolicyId) || "Policy ID: " + m.lateFeePolicyId}
                        </span>
                      </td>
                      <td className="p-8 text-right">
                        <span className={`text-[9px] font-black px-4 py-1.5 rounded-full ${m.isActive ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                          {m.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-8 flex justify-center gap-4 border-t border-white/5">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 disabled:opacity-30"><ChevronLeft /></button>
                <span className="font-black text-xs flex items-center">PAGE {currentPage} OF {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 disabled:opacity-30"><ChevronRight /></button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LateFeeMappingManager;