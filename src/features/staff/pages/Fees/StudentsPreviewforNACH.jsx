import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../config/api";
import {
  Search, School, Calendar, BookOpen, Loader2, 
  GraduationCap, CheckCircle2, 
  Banknote, ShieldCheck, 
  Fingerprint, Eye, ListChecks, PlusSquare, 
  UserCheck, AlertCircle, XCircle, LayoutGrid, ChevronDown
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const NACHBatchManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");

  // Selection States
  const [selections, setSelections] = useState({ 
    campusId: "", branchId: "", academicYearId: "", branchGradeId: "" 
  });
  
  const [options, setOptions] = useState({ 
    campuses: [], branches: [], academicYears: [], grades: [], allInstallments: [] 
  });

  // Functional States
  const [students, setStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedInstallmentIds, setSelectedInstallmentIds] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [finalBatchSelection, setFinalBatchSelection] = useState([]);
  const [batchName, setBatchName] = useState("");
  const [loading, setLoading] = useState({ initial: true, students: false, preview: false, creating: false });

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      const [campusRes, branchRes, yearRes, instRes] = await Promise.all([
        api.get("/api/campuses"),
        api.get("/api/branches"),
        api.get("/api/academic-years/get-all-academic-year"),
        api.get("/api/fee-installments")
      ]);
      setOptions({ 
        campuses: campusRes.data || [], 
        branches: branchRes.data || [], 
        academicYears: yearRes.data || [],
        allInstallments: instRes.data || []
      });
    } catch (error) { 
      toast.error("Data Sync Error"); 
    }
    finally { setLoading(prev => ({ ...prev, initial: false })); }
  };

  useEffect(() => {
    if (selections.branchId) {
      api.get(`/api/branches/${selections.branchId}/grades`)
        .then(res => setOptions(prev => ({ ...prev, grades: res.data || [] })))
        .catch(() => setOptions(prev => ({ ...prev, grades: [] })));
    } else {
        setOptions(prev => ({ ...prev, grades: [] }));
    }
  }, [selections.branchId]);

  const fetchStudents = async () => {
    if (!selections.branchGradeId || !selections.academicYearId) return toast.error("Select Filters First");
    setLoading(prev => ({ ...prev, students: true }));
    setPreviewData([]);
    try {
      const res = await api.get(`/api/admission/getEnrollmentsByBranchGradeAndAcademicYear/${selections.branchGradeId}/${selections.academicYearId}`);
      setStudents(res.data.content || []);
      setSelectedStudentIds([]);
    } catch (error) { toast.error("Fetch Failed"); }
    finally { setLoading(prev => ({ ...prev, students: false })); }
  };

  const handleGeneratePreview = async () => {
    if (selectedStudentIds.length === 0 || selectedInstallmentIds.length === 0) 
      return toast.error("Select Students & Installments");
    
    setLoading(prev => ({ ...prev, preview: true }));
    try {
      const payload = {
        campusId: parseInt(selections.campusId),
        studentEnrollmentIds: selectedStudentIds,
        installmentIds: selectedInstallmentIds
      };
      const res = await api.post("/api/nach/preview", payload);
      setPreviewData(res.data || []);
      const eligibleIds = res.data.filter(i => i.eligible).map(i => i.studentEnrollmentId);
      setFinalBatchSelection(eligibleIds);
      toast.success("Analysis Complete");
    } catch (error) { toast.error("Preview Failed"); }
    finally { setLoading(prev => ({ ...prev, preview: false })); }
  };

  const handleCreateBatch = async () => {
    if (!batchName) return toast.error("Please enter a Batch Name");
    if (finalBatchSelection.length === 0) return toast.error("Select records from results");

    setLoading(prev => ({ ...prev, creating: true }));
    try {
      const payload = {
        campusId: parseInt(selections.campusId),
        selectedEnrollmentIds: finalBatchSelection,
        installmentIds: selectedInstallmentIds,
        batchName: batchName
      };
      const res = await api.post("/api/nach/batches/create", payload);
      toast.success(`Batch #${res.data.id} Created!`);
      setPreviewData([]);
      setBatchName("");
      setFinalBatchSelection([]);
    } catch (error) { toast.error("Creation Failed"); }
    finally { setLoading(prev => ({ ...prev, creating: false })); }
  };

  const toggleAllStudents = () => {
    if (selectedStudentIds.length === students.length) setSelectedStudentIds([]);
    else setSelectedStudentIds(students.map(s => s.id));
  };

  const selectAllEligible = () => {
    const eligibleIds = previewData.filter(i => i.eligible).map(i => i.studentEnrollmentId);
    setFinalBatchSelection(eligibleIds.length === finalBatchSelection.length ? [] : eligibleIds);
  };

  function toggleFinalSelection(id, eligible) {
    if (!eligible) return;
    setFinalBatchSelection(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  // UI Components/Styles
  const glassPanel = `rounded-3xl border shadow-2xl backdrop-blur-xl ${isDark ? "bg-[#0A0A0A]/90 border-white/10" : "bg-white/90 border-gray-100"}`;
  
  const CustomSelect = ({ label, icon, value, onChange, options, placeholder }) => (
    <div className="space-y-2 group">
      <label className="text-[10px] font-black uppercase text-gray-500 ml-1 flex items-center gap-2 transition-colors group-focus-within:text-primary">
        {icon} {label}
      </label>
      <div className="relative">
        <select 
          value={value} 
          onChange={onChange}
          className={`w-full pl-4 pr-10 py-4 rounded-2xl border outline-none font-bold text-[11px] appearance-none cursor-pointer transition-all ${
            isDark 
            ? "bg-white/5 border-white/10 text-white focus:border-primary/50 focus:bg-white/[0.08]" 
            : "bg-gray-50 border-gray-200 text-gray-800 focus:border-primary/50 focus:bg-white"
          }`}
        >
          <option value="" className={isDark ? "bg-[#121212]" : "bg-white"}>{placeholder}</option>
          {options?.map(o => (
            <option key={o.id} value={o.id} className={isDark ? "bg-[#121212]" : "bg-white"}>
              {o.name || o.gradeName || o.campusName || o.academicYear}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen p-4 lg:p-8 max-w-[1600px] mx-auto space-y-6 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-[22px] shadow-2xl shadow-primary/40 rotate-3 group-hover:rotate-0 transition-transform">
            <ListChecks className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">NACH <span className="text-primary italic">Process Manager</span></h1>
            <p className="text-[10px] font-bold text-gray-500 tracking-[0.2em] uppercase mt-1">System Control • Batch Processing v2.0</p>
          </div>
        </div>
      </div>

      {/* Step 1: Configuration */}
      <div className={glassPanel}>
        <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CustomSelect 
            label="Campus" icon={<School size={12}/>} placeholder="Select Campus"
            value={selections.campusId} 
            options={options.campuses}
            onChange={(e) => setSelections(p => ({ ...p, campusId: e.target.value, branchId: "", branchGradeId: "" }))}
          />
          <CustomSelect 
            label="Branch" 
            icon={<GraduationCap size={12}/>} 
            placeholder="Select Branch"
            value={selections.branchId} 
            options={options.branches
              .filter(b => String(b.campusId) === String(selections.campusId))
              .map(b => ({
                ...b,
                name: `${b.boardName} (${b.mediumName})` 
              }))
            }
            onChange={(e) => setSelections(p => ({ 
              ...p, 
              branchId: e.target.value, 
              branchGradeId: ""
            }))}
          />
          <CustomSelect 
            label="Grade" icon={<BookOpen size={12}/>} placeholder="Select Grade"
            value={selections.branchGradeId} 
            options={options.grades}
            onChange={(e) => setSelections(p => ({ ...p, branchGradeId: e.target.value }))}
          />
          <CustomSelect 
            label="Academic Year" icon={<Calendar size={12}/>} placeholder="Select Year"
            value={selections.academicYearId} 
            options={options.academicYears}
            onChange={(e) => setSelections(p => ({ ...p, academicYearId: e.target.value }))}
          />
        </div>
        <div className="px-8 pb-8">
          <button 
            onClick={fetchStudents} 
            disabled={loading.students} 
            className="w-full py-5 bg-primary text-white font-black uppercase text-xs rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
          >
            {loading.students ? <Loader2 className="animate-spin" size={20}/> : <Search size={20}/>} Load Enrollment Pool
          </button>
        </div>
      </div>

      {/* Step 2: Selection Workspace */}
      {students?.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={`${glassPanel} p-6`}>
            <div className="flex items-center gap-4 mb-5">
               <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                 <Banknote size={16} className="text-primary" />
               </div>
               <span className="text-xs font-black uppercase tracking-widest">Target Installments</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
              {(options?.allInstallments || []).map(inst => (
                <button 
                  key={inst.id} 
                  onClick={() => setSelectedInstallmentIds(prev => prev.includes(inst.id) ? prev.filter(i => i !== inst.id) : [...prev, inst.id])}
                  className={`flex-shrink-0 px-8 py-4 rounded-2xl border text-[11px] font-black uppercase transition-all flex items-center gap-3 ${
                    selectedInstallmentIds.includes(inst.id) 
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/30" 
                    : isDark ? "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10" : "bg-gray-50 border-gray-200 text-gray-600"
                  }`}
                >
                  <LayoutGrid size={14}/> {inst.name}
                </button>
              ))}
            </div>
          </div>

          <div className={`${glassPanel} overflow-hidden`}>
            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <Fingerprint className="text-primary" size={20}/>
                <h3 className="text-sm font-black uppercase tracking-widest">Student Pool ({selectedStudentIds.length}/{students.length})</h3>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <button onClick={toggleAllStudents} className="flex-1 sm:flex-none px-6 py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase hover:bg-white/5 transition-colors">
                  {selectedStudentIds.length === students.length ? "Deselect All" : "Select All"}
                </button>
                <button 
                  onClick={handleGeneratePreview} 
                  disabled={loading.preview || selectedStudentIds.length === 0} 
                  className="flex-1 sm:flex-none px-8 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                >
                  {loading.preview ? <Loader2 className="animate-spin" size={16}/> : <Eye size={16}/>} Run Analysis
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-8 max-h-[500px] overflow-y-auto custom-scrollbar">
              {students.map(s => (
                <div 
                  key={s.id} 
                  onClick={() => setSelectedStudentIds(prev => prev.includes(s.id) ? prev.filter(i => i !== s.id) : [...prev, s.id])}
                  className={`p-5 rounded-2xl border flex items-center gap-5 cursor-pointer transition-all duration-300 ${
                    selectedStudentIds.includes(s.id) 
                    ? "border-primary bg-primary/10 scale-[1.02]" 
                    : isDark ? "border-white/5 bg-white/5 hover:border-white/20" : "border-gray-100 bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${selectedStudentIds.includes(s.id) ? "bg-primary scale-110" : "border-2 border-gray-600"}`}>
                    {selectedStudentIds.includes(s.id) && <CheckCircle2 size={14} className="text-white"/>}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-black truncate tracking-wide">{s.enrollmentNo}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mt-0.5">Roll: {s.rollNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Analysis Results */}
      {previewData?.length > 0 && (
        <div className={`${glassPanel} overflow-hidden border-primary/20 animate-in fade-in zoom-in-95 duration-500`}>
          <div className="p-8 border-b border-white/5 bg-primary/5 flex flex-col xl:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-green-500/20 text-green-500 rounded-2xl"><ShieldCheck size={28}/></div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-widest leading-none">Eligibility Results</h3>
                  <p className="text-xs font-bold text-gray-500 mt-2">Verified {previewData.length} enrollment mandates</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                 <input 
                    type="text" 
                    placeholder="BATCH IDENTIFIER (E.G. APR_BATCH_01)" 
                    value={batchName} 
                    onChange={(e) => setBatchName(e.target.value.toUpperCase())}
                    className="w-full sm:w-80 pl-6 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black outline-none focus:border-primary transition-all" 
                 />
                 <button 
                  onClick={handleCreateBatch} 
                  disabled={loading.creating || finalBatchSelection.length === 0}
                  className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 disabled:opacity-50 shadow-2xl shadow-primary/30"
                >
                  {loading.creating ? <Loader2 className="animate-spin" size={18}/> : <PlusSquare size={18}/>} Commit Batch ({finalBatchSelection.length})
                </button>
              </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase text-gray-500 border-b border-white/5">
                  <th className="px-8 py-6 w-12 text-center">
                    <input 
                      type="checkbox" 
                      onChange={selectAllEligible} 
                      checked={finalBatchSelection.length === previewData.filter(i => i.eligible).length && finalBatchSelection.length > 0}
                      className="accent-primary w-5 h-5 rounded cursor-pointer"
                    />
                  </th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6">Enrollment ID</th>
                  <th className="px-8 py-6">Mandate</th>
                  <th className="px-8 py-6">Installments</th>
                  <th className="px-8 py-6 text-right">Total Payable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {previewData.map((item, idx) => (
                  <tr 
                    key={idx} 
                    className={`group transition-all ${!item.eligible ? 'opacity-40' : 'hover:bg-white/[0.03] cursor-pointer'}`}
                    onClick={() => toggleFinalSelection(item.studentEnrollmentId, item.eligible)}
                  >
                    <td className="px-8 py-6 text-center">
                      <input 
                        type="checkbox" 
                        checked={finalBatchSelection.includes(item.studentEnrollmentId)} 
                        disabled={!item.eligible} 
                        className="accent-primary w-5 h-5 rounded cursor-pointer" 
                        readOnly 
                      />
                    </td>
                    <td className="px-8 py-6">
                      <div className={`flex items-center gap-2 font-black text-[11px] uppercase ${item.eligible ? 'text-green-500' : 'text-red-500'}`}>
                        {item.eligible ? <UserCheck size={14}/> : <XCircle size={14}/>} {item.eligible ? "Eligible" : "Ineligible"}
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-sm tracking-tight">#{item.studentEnrollmentId}</td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black ${item.mandateStatus === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {item.mandateStatus}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-wrap gap-2">
                        {item.installments?.map((inst, i) => (
                          <span key={i} className="px-2 py-1 bg-white/5 border border-white/5 rounded-md text-[9px] font-bold text-gray-400">ID: {inst.installmentId}</span>
                        )) || <AlertCircle size={16} className="text-amber-500"/>}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right font-black text-base text-primary">₹{item.totalAmount?.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default NACHBatchManager;