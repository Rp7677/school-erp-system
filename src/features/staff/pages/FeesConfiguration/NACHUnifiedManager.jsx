import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import api from "../../../../config/api";
import { 
  Search, School, Calendar, BookOpen, Loader2, GraduationCap, CheckCircle2, 
  Banknote, ShieldCheck, Fingerprint, Eye, ListChecks, PlusSquare, 
  UserCheck, AlertCircle, XCircle, LayoutGrid, ChevronDown, FileStack, 
  RefreshCw, FileSpreadsheet, Upload, X, Info, History, ArrowRightCircle 
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const IntegratedNACHManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  
  // REDUX CAMPUS INTEGRATION
  const { campuses, selectedCampus, superAdmin } = useSelector((state) => state.campus);

  // Navigation State
  const [activeTab, setActiveTab] = useState("manager");

  // (1) NACHBatchManager STATES
  const [selections, setSelections] = useState({ 
    campusId: "", 
    branchId: "", 
    academicYearId: "", 
    branchGradeId: "" 
  });
  
  const [options, setOptions] = useState({ 
    campuses: [], // Will be synced with Redux
    branches: [], 
    academicYears: [], 
    grades: [], 
    allInstallments: [] 
  });

  const [students, setStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedInstallmentIds, setSelectedInstallmentIds] = useState([]);
  const [previewData, setPreviewData] = useState([]);
  const [finalBatchSelection, setFinalBatchSelection] = useState([]);
  const [batchName, setBatchName] = useState("");
  const [loading, setLoading] = useState({ initial: true, students: false, preview: false, creating: false });

  // (2) NACHBatchList STATES
  const [batches, setBatches] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [uploadingId, setUploadingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const fileInputRef = useRef(null);
  const [activeBatchForUpload, setActiveBatchForUpload] = useState(null);

  // Detail Modal States
  const [selectedBatchDetails, setSelectedBatchDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Sync Redux Campuses to options when campuses change
  useEffect(() => {
    if (campuses) {
      setOptions(prev => ({ ...prev, campuses: campuses }));
    }
  }, [campuses]);

  useEffect(() => {
    fetchInitialData();
    fetchBatches();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Removed /api/campuses call as we use Redux
      const [branchRes, yearRes, instRes] = await Promise.all([
        api.get("/api/branches"),
        api.get("/api/academic-years/get-all-academic-year"),
        api.get("/api/fee-installments")
      ]);

      setOptions(prev => ({
        ...prev,
        branches: branchRes.data || [],
        academicYears: yearRes.data || [],
        allInstallments: instRes.data || []
      }));
    } catch (error) {
      toast.error("Data Sync Error");
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
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
    } catch (error) {
      toast.error("Fetch Failed");
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  };

  const handleGeneratePreview = async () => {
    if (selectedStudentIds.length === 0 || selectedInstallmentIds.length === 0) return toast.error("Select Students & Installments");
    setLoading(prev => ({ ...prev, preview: true }));
    try {
      const payload = { 
        campusId: parseInt(selections.campusId), 
        studentEnrollmentIds: selectedStudentIds, 
        installmentIds: selectedInstallmentIds 
      };
      const res = await api.post("/api/nach/preview", payload);
      setPreviewData(res.data || []);
      setFinalBatchSelection(res.data.filter(i => i.eligible).map(i => i.studentEnrollmentId));
      toast.success("Analysis Complete");
    } catch (error) {
      toast.error("Preview Failed");
    } finally {
      setLoading(prev => ({ ...prev, preview: false }));
    }
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
      await api.post("/api/nach/batches/create", payload);
      toast.success(`Batch Created!`);
      setPreviewData([]);
      setBatchName("");
      setFinalBatchSelection([]);
      await fetchBatches();
      setActiveTab("repository");
    } catch (error) {
      toast.error("Creation Failed");
    } finally {
      setLoading(prev => ({ ...prev, creating: false }));
    }
  };

  const fetchBatches = async () => {
    setListLoading(true);
    try {
      const res = await api.get("/api/nach/batches");
      setBatches((res.data || []).sort((a, b) => b.batchId - a.batchId));
    } catch (error) {
      toast.error("Database Connection Error");
    } finally {
      setListLoading(false);
    }
  };

  const fetchBatchDetails = async (batchId) => {
    setDetailLoading(true);
    try {
      const res = await api.get(`/api/nach/batches/${batchId}`);
      setSelectedBatchDetails(res.data);
    } catch (error) {
      toast.error("Could not load batch details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleGenerateBatchFile = async (batchId) => {
    setProcessingId(batchId);
    const loadingToast = toast.loading(`Initializing Batch Processing #${batchId}...`);
    try {
      await api.post(`/api/nach/files/generate/${batchId}`);
      toast.success("Batch File Generated & Ready", { id: loadingToast });
      fetchBatches();
    } catch (error) {
      toast.error(error.response?.data?.message || "Generation Failed", { id: loadingToast });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDownloadFile = async (fileId, batchName) => {
    if (!fileId) return toast.error("File record not found.");
    setDownloadingId(fileId);
    const loadingToast = toast.loading("Downloading file...");
    try {
      const response = await api.get(`/api/nach/files/download/${fileId}`, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${batchName.replace(/[^a-z0-9]/gi, '_')}_Batch_${fileId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Download complete", { id: loadingToast });
    } catch (error) {
      toast.error("Could not download file.", { id: loadingToast });
    } finally {
      setDownloadingId(null);
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !activeBatchForUpload) return;
    const formData = new FormData();
    formData.append("file", file);
    setUploadingId(activeBatchForUpload);
    const uploadToast = toast.loading(`Uploading Response for Batch #${activeBatchForUpload}...`);
    try {
      await api.post(`/api/nach/files/upload-response/${activeBatchForUpload}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Response Uploaded Successfully", { id: uploadToast });
      fetchBatches();
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload Failed", { id: uploadToast });
    } finally {
      setUploadingId(null);
      setActiveBatchForUpload(null);
      event.target.value = null;
    }
  };

  // Styles
  const glassPanel = `rounded-[2.5rem] border shadow-2xl backdrop-blur-xl ${isDark ? "bg-[#0A0A0A]/90 border-white/10" : "bg-white/90 border-gray-100"}`;
  const inputStyle = `px-5 py-4 rounded-2xl border outline-none font-bold text-xs transition-all ${isDark ? "bg-white/5 border-white/10 text-white focus:border-primary" : "bg-gray-50 border-gray-200 text-gray-800 focus:border-primary"}`;

  const CustomSelect = ({ label, icon, value, onChange, options, placeholder }) => (
    <div className="space-y-2 group">
      <label className="text-[10px] font-black uppercase text-gray-500 ml-1 flex items-center gap-2 transition-colors group-focus-within:text-primary">
        {icon} {label}
      </label>
      <div className="relative">
        <select 
          value={value} 
          onChange={onChange} 
          className={`w-full pl-4 pr-10 py-4 rounded-2xl border outline-none font-bold text-[11px] appearance-none cursor-pointer transition-all ${isDark ? "bg-white/5 border-white/10 text-white focus:border-primary/50 focus:bg-white/[0.08]" : "bg-gray-50 border-gray-200 text-gray-800 focus:border-primary/50 focus:bg-white"}`}
        >
          <option value="" className={isDark ? "bg-[#121212]" : "bg-white"}>{placeholder}</option>
          {options?.map(o => (
            <option key={o.id || o.campusId} value={o.id || o.campusId} className={isDark ? "bg-[#121212]" : "bg-white"}>
              {/* FIX: Prioritize o.name which contains your formatted string */}
              {o.name || o.campusName || o.gradeName || o.academicYear}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen p-4 lg:p-10 max-w-[1700px] mx-auto space-y-8 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
      <Toaster position="top-right" />
      <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xls,.xlsx" onChange={handleFileChange} />

      {/* DETAIL MODAL */}
      {selectedBatchDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedBatchDetails(null)}></div>
          <div className={`${glassPanel} relative w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300`}>
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-primary/5">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary rounded-2xl text-white"><Info size={24}/></div>
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tighter italic">{selectedBatchDetails.batchName}</h2>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">System Batch ID: #{selectedBatchDetails.batchId}</p>
                </div>
              </div>
              <button onClick={() => setSelectedBatchDetails(null)} className="p-3 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
            </div>
            <div className="overflow-y-auto custom-scrollbar p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
                  <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Total Volume</p>
                  <p className="text-2xl font-black text-primary">{selectedBatchDetails.totalRecords} <span className="text-xs text-gray-500">Items</span></p>
                </div>
                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
                  <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Settlement Amount</p>
                  <p className="text-2xl font-black text-primary">₹{selectedBatchDetails.totalAmount.toLocaleString('en-IN')}</p>
                </div>
                <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
                  <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Batch Status</p>
                  <p className="text-xl font-black uppercase tracking-tighter text-amber-500">{selectedBatchDetails.status.replace('_', ' ')}</p>
                </div>
              </div>
              {/* Files Log */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2"><History size={14} className="text-primary"/> File Logs</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedBatchDetails.files.map(file => (
                    <div key={file.fileId} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${file.fileType === 'DEBIT' ? 'bg-indigo-500/20 text-indigo-500' : 'bg-emerald-500/20 text-emerald-500'}`}><FileSpreadsheet size={18}/></div>
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-tight">{file.fileType} FILE</p>
                          <p className="text-[9px] text-gray-500 font-bold">{new Date(file.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-black px-2 py-1 rounded bg-white/10">{file.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/10 pb-8">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-3xl shadow-2xl shadow-primary/40 rotate-3">
            {activeTab === "manager" ? <ListChecks className="text-white" size={32} /> : <FileStack className="text-white" size={32} />}
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic"> NACH <span className="text-primary not-italic">{activeTab === "manager" ? "Process Manager" : "Repository"}</span> </h1>
            <p className="text-[10px] font-bold text-gray-500 tracking-[0.4em] uppercase mt-1"> System Control • Batch Processing v2.0 </p>
          </div>
        </div>
        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
          <button onClick={() => setActiveTab("manager")} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'manager' ? "bg-primary text-white shadow-lg" : "text-gray-500"}`}><PlusSquare size={14}/> Batch Creation</button>
          <button onClick={() => setActiveTab("repository")} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'repository' ? "bg-primary text-white shadow-lg" : "text-gray-500"}`}><FileStack size={14}/> Settlement History</button>
        </div>
      </div>

      {/* VIEW: MANAGER */}
      {activeTab === "manager" && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className={glassPanel}>
            <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <CustomSelect 
                label="Campus" 
                icon={<School size={12}/>} 
                placeholder="Select Campus" 
                value={selections.campusId} 
                options={options.campuses} 
                onChange={(e) => setSelections(p => ({ ...p, campusId: e.target.value, branchId: "", branchGradeId: "" }))} 
              />
              <CustomSelect 
                label="Branch" 
                icon={<GraduationCap size={12}/>} 
                placeholder="Select Branch" 
                value={selections.branchId} 
                options={options.branches.filter(b => String(b.campusId) === String(selections.campusId)).map(b => ({ ...b, name: `${b.boardName} (${b.mediumName})` }))} 
                onChange={(e) => setSelections(p => ({ ...p, branchId: e.target.value, branchGradeId: "" }))} 
              />
              <CustomSelect label="Grade" icon={<BookOpen size={12}/>} placeholder="Select Grade" value={selections.branchGradeId} options={options.grades} onChange={(e) => setSelections(p => ({ ...p, branchGradeId: e.target.value }))} />
              <CustomSelect label="Academic Year" icon={<Calendar size={12}/>} placeholder="Select Year" value={selections.academicYearId} options={options.academicYears} onChange={(e) => setSelections(p => ({ ...p, academicYearId: e.target.value }))} />
            </div>
            <div className="px-8 pb-8">
              <button onClick={fetchStudents} disabled={loading.students} className="w-full py-5 bg-primary text-white font-black uppercase text-xs rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50">
                {loading.students ? <Loader2 className="animate-spin" size={20}/> : <Search size={20}/>} Load Enrollment Pool
              </button>
            </div>
          </div>

          {students.length > 0 && (
            <div className="space-y-6">
              <div className={`${glassPanel} p-6`}>
                <div className="flex items-center gap-4 mb-5"><div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Banknote size={16} className="text-primary" /></div><span className="text-xs font-black uppercase tracking-widest">Target Installments</span></div>
                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                  {options.allInstallments.map(inst => (
                    <button key={inst.id} onClick={() => setSelectedInstallmentIds(prev => prev.includes(inst.id) ? prev.filter(i => i !== inst.id) : [...prev, inst.id])} className={`flex-shrink-0 px-8 py-4 rounded-2xl border text-[11px] font-black uppercase transition-all flex items-center gap-3 ${selectedInstallmentIds.includes(inst.id) ? "bg-primary border-primary text-white" : isDark ? "bg-white/5 border-white/10 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-600"}`}><LayoutGrid size={14}/> {inst.name}</button>
                  ))}
                </div>
              </div>
              <div className={`${glassPanel} overflow-hidden`}>
                <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3"><Fingerprint className="text-primary" size={20}/><h3 className="text-sm font-black uppercase tracking-widest">Student Pool ({selectedStudentIds.length}/{students.length})</h3></div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button onClick={() => setSelectedStudentIds(selectedStudentIds.length === students.length ? [] : students.map(s => s.id))} className="flex-1 sm:flex-none px-6 py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase"> {selectedStudentIds.length === students.length ? "Deselect All" : "Select All"} </button>
                    <button onClick={handleGeneratePreview} disabled={loading.preview || selectedStudentIds.length === 0} className="flex-1 sm:flex-none px-8 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-indigo-500 disabled:opacity-50"> {loading.preview ? <Loader2 className="animate-spin" size={16}/> : <Eye size={16}/>} Run Analysis </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-8 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {students.map(s => (
                    <div key={s.id} onClick={() => setSelectedStudentIds(prev => prev.includes(s.id) ? prev.filter(i => i !== s.id) : [...prev, s.id])} className={`p-5 rounded-2xl border flex items-center gap-5 cursor-pointer transition-all duration-300 ${selectedStudentIds.includes(s.id) ? "border-primary bg-primary/10 scale-[1.02]" : isDark ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50"}`}>
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${selectedStudentIds.includes(s.id) ? "bg-primary scale-110" : "border-2 border-gray-600"}`}>{selectedStudentIds.includes(s.id) && <CheckCircle2 size={14} className="text-white"/>}</div>
                      <div className="overflow-hidden"><p className="text-xs font-black truncate tracking-wide">{s.enrollmentNo}</p><p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mt-0.5">Roll: {s.rollNumber}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {previewData.length > 0 && (
            <div className={`${glassPanel} overflow-hidden border-primary/20 animate-in fade-in zoom-in-95 duration-500`}>
              <div className="p-8 border-b border-white/5 bg-primary/5 flex flex-col xl:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-5"><div className="p-4 bg-green-500/20 text-green-500 rounded-2xl"><ShieldCheck size={28}/></div><div><h3 className="text-lg font-black uppercase tracking-widest leading-none">Eligibility Results</h3><p className="text-xs font-bold text-gray-500 mt-2">Verified {previewData.length} enrollment mandates</p></div></div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                  <input type="text" placeholder="BATCH IDENTIFIER" value={batchName} onChange={(e) => setBatchName(e.target.value.toUpperCase())} className="w-full sm:w-80 pl-6 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black outline-none focus:border-primary" />
                  <button onClick={handleCreateBatch} disabled={loading.creating || finalBatchSelection.length === 0} className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 disabled:opacity-50 shadow-2xl shadow-primary/30">
                    {loading.creating ? <Loader2 className="animate-spin" size={18}/> : <PlusSquare size={18}/>} Commit Batch ({finalBatchSelection.length})
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead><tr className="text-[10px] font-black uppercase text-gray-500 border-b border-white/5"><th className="px-8 py-6 w-12 text-center">Select</th><th className="px-8 py-6">Status</th><th className="px-8 py-6">Enrollment ID</th><th className="px-8 py-6">Mandate</th><th className="px-8 py-6">Installments</th><th className="px-8 py-6 text-right">Total Payable</th></tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {previewData.map((item, idx) => (
                      <tr key={idx} className={`group transition-all ${!item.eligible ? 'opacity-40' : 'hover:bg-white/[0.03] cursor-pointer'}`} onClick={() => item.eligible && setFinalBatchSelection(prev => prev.includes(item.studentEnrollmentId) ? prev.filter(i => i !== item.studentEnrollmentId) : [...prev, item.studentEnrollmentId])}>
                        <td className="px-8 py-6 text-center"><input type="checkbox" checked={finalBatchSelection.includes(item.studentEnrollmentId)} disabled={!item.eligible} className="accent-primary w-5 h-5 rounded" readOnly /></td>
                        <td className="px-8 py-6"><div className={`flex items-center gap-2 font-black text-[11px] uppercase ${item.eligible ? 'text-green-500' : 'text-red-500'}`}>{item.eligible ? <UserCheck size={14}/> : <XCircle size={14}/>} {item.eligible ? "Eligible" : "Ineligible"}</div></td>
                        <td className="px-8 py-6 font-black text-sm tracking-tight">#{item.studentEnrollmentId}</td>
                        <td className="px-8 py-6"><span className={`px-3 py-1.5 rounded-lg text-[10px] font-black ${item.mandateStatus === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{item.mandateStatus}</span></td>
                        <td className="px-8 py-6"><div className="flex flex-wrap gap-2">{item.installments?.map((inst, i) => (<span key={i} className="px-2 py-1 bg-white/5 border border-white/5 rounded-md text-[9px] font-bold text-gray-400">ID: {inst.installmentId}</span>)) || <AlertCircle size={16} className="text-amber-500"/>}</div></td>
                        <td className="px-8 py-6 text-right font-black text-base text-primary">₹{item.totalAmount?.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW: REPOSITORY */}
      {activeTab === "repository" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-end items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
              <input type="text" placeholder="SEARCH BATCH ID OR NAME..." className={`${inputStyle} pl-12 w-80 shadow-inner`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <button onClick={fetchBatches} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-primary/50 transition-all active:scale-90">
              <RefreshCw size={22} className={`${listLoading ? "animate-spin text-primary" : "text-gray-400"}`} />
            </button>
          </div>
          <div className={glassPanel}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-separate border-spacing-0">
                <thead>
                  <tr className="text-[11px] font-black uppercase text-gray-500 border-b border-white/5">
                    <th className="px-10 py-8">Batch Identification</th>
                    <th className="px-6 py-8">Execution Date</th>
                    <th className="px-6 py-8">Volume</th>
                    <th className="px-6 py-8 text-center">Status</th>
                    <th className="px-6 py-8">Net Amount</th>
                    <th className="px-10 py-8 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {listLoading ? (
                    <tr><td colSpan="6" className="py-32 text-center"><Loader2 className="animate-spin text-primary mx-auto" size={48}/></td></tr>
                  ) : batches.filter(b => b.batchName?.toLowerCase().includes(searchTerm.toLowerCase()) || b.batchId.toString().includes(searchTerm)).map((batch) => (
                    <tr key={batch.batchId} className="group hover:bg-primary/[0.03] transition-all">
                      <td className="px-10 py-7">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary font-black text-sm border border-white/10 group-hover:border-primary/50 transition-all">{batch.batchId}</div>
                          <div><p className="font-black text-base tracking-tighter leading-none">{batch.batchName}</p><p className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.2em] mt-1">Campus ID: {batch.campusId}</p></div>
                        </div>
                      </td>
                      <td className="px-6 py-7 text-xs font-black tracking-tight"><div className="flex items-center gap-2"><Calendar size={14} className="text-primary opacity-50" /> {new Date(batch.batchDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div></td>
                      <td className="px-6 py-7"><div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5"><span className="text-[12px] font-black text-primary">{batch.totalRecords}</span><span className="text-[9px] font-bold text-gray-500 uppercase">Entries</span></div></td>
                      <td className="px-6 py-7 text-center">
                        <span className={`px-5 py-2 rounded-xl border text-[9px] font-black tracking-[0.15em] uppercase flex items-center gap-2 shadow-sm ${batch.status === 'FILE_GENERATED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : batch.status === 'PROCESSING' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${batch.status === 'FILE_GENERATED' ? 'bg-green-500' : batch.status === 'PROCESSING' ? 'bg-blue-500' : 'bg-primary'} animate-pulse`}></div> {batch.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-7"><p className="text-sm font-black tracking-tighter"><span className="text-primary mr-1 italic">₹</span>{batch.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p></td>
                      <td className="px-10 py-7 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => fetchBatchDetails(batch.batchId)} className="p-3 bg-white/5 border border-white/10 rounded-xl text-primary hover:bg-primary hover:text-white transition-all shadow-lg">
                            {detailLoading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                          </button>
                          {batch.status === "CREATED" ? (
                            <button onClick={() => handleGenerateBatchFile(batch.batchId)} disabled={processingId === batch.batchId} className="px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-primary/30 hover:scale-105 transition-all disabled:opacity-50">{processingId === batch.batchId ? <Loader2 size={16} className="animate-spin" /> : <PlusSquare size={16} />} Generate File</button>
                          ) : (
                            <>
                              <button onClick={() => handleDownloadFile(batch.file?.fileId, batch.batchName)} disabled={!batch.file?.fileId || downloadingId === batch.file?.fileId} className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl transition-all ${(!batch.file?.fileId || downloadingId === batch.file?.fileId) ? "bg-gray-400 opacity-50" : "bg-[#1D6F42] text-white hover:bg-[#248a52]"}`}>
                                {downloadingId === batch.file?.fileId ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />} Download
                              </button>
                              <button onClick={() => { setActiveBatchForUpload(batch.batchId); fileInputRef.current.click(); }} disabled={uploadingId === batch.batchId} className="px-5 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl hover:bg-blue-500 disabled:opacity-50">{uploadingId === batch.batchId ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegratedNACHManager;

// // select multiple grade
// import React, { useState, useEffect, useRef } from "react";
// import { useSelector } from "react-redux";
// import api from "../../../../config/api";
// import { Search, School, Calendar, BookOpen, Loader2, GraduationCap, CheckCircle2, Banknote, ShieldCheck, Fingerprint, Eye, ListChecks, PlusSquare, UserCheck, AlertCircle, XCircle, LayoutGrid, ChevronDown, FileStack, RefreshCw, FileSpreadsheet, Upload, X, Info, History } from "lucide-react";
// import { Toaster, toast } from "react-hot-toast";

// const IntegratedNACHManager = () => {
//   const isDark = useSelector((state) => state.color.mode === "dark");
//   const { campuses, selectedCampus, superAdmin } = useSelector((state) => state.campus);

//   const [activeTab, setActiveTab] = useState("manager");

//   // UPDATED: branchGradeIds is now an array
//   const [selections, setSelections] = useState({
//     campusId: "",
//     branchId: "",
//     academicYearId: "",
//     branchGradeIds: [], 
//   });

//   const [options, setOptions] = useState({
//     campuses: [],
//     branches: [],
//     academicYears: [],
//     grades: [],
//     allInstallments: []
//   });

//   const [students, setStudents] = useState([]);
//   const [selectedStudentIds, setSelectedStudentIds] = useState([]);
//   const [selectedInstallmentIds, setSelectedInstallmentIds] = useState([]);
//   const [previewData, setPreviewData] = useState([]);
//   const [finalBatchSelection, setFinalBatchSelection] = useState([]);
//   const [batchName, setBatchName] = useState("");
//   const [loading, setLoading] = useState({ initial: true, students: false, preview: false, creating: false });

//   const [batches, setBatches] = useState([]);
//   const [listLoading, setListLoading] = useState(true);
//   const [processingId, setProcessingId] = useState(null);
//   const [uploadingId, setUploadingId] = useState(null);
//   const [downloadingId, setDownloadingId] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const fileInputRef = useRef(null);
//   const [activeBatchForUpload, setActiveBatchForUpload] = useState(null);
//   const [selectedBatchDetails, setSelectedBatchDetails] = useState(null);
//   const [detailLoading, setDetailLoading] = useState(false);

//   useEffect(() => {
//     if (campuses) {
//       setOptions(prev => ({ ...prev, campuses: campuses }));
//     }
//   }, [campuses]);

//   useEffect(() => {
//     fetchInitialData();
//     fetchBatches();
//   }, []);

//   const fetchInitialData = async () => {
//     try {
//       const [branchRes, yearRes, instRes] = await Promise.all([
//         api.get("/api/branches"),
//         api.get("/api/academic-years/get-all-academic-year"),
//         api.get("/api/fee-installments")
//       ]);
//       setOptions(prev => ({
//         ...prev,
//         branches: branchRes.data || [],
//         academicYears: yearRes.data || [],
//         allInstallments: instRes.data || []
//       }));
//     } catch (error) {
//       toast.error("Data Sync Error");
//     } finally {
//       setLoading(prev => ({ ...prev, initial: false }));
//     }
//   };

//   useEffect(() => {
//     if (selections.branchId) {
//       api.get(`/api/branches/${selections.branchId}/grades`)
//         .then(res => setOptions(prev => ({ ...prev, grades: res.data || [] })))
//         .catch(() => setOptions(prev => ({ ...prev, grades: [] })));
//     } else {
//       setOptions(prev => ({ ...prev, grades: [] }));
//     }
//   }, [selections.branchId]);

//   // UPDATED: Logic to fetch students for multiple grades
//   const fetchStudents = async () => {
//     if (selections.branchGradeIds.length === 0 || !selections.academicYearId) 
//       return toast.error("Select Grades & Year First");
    
//     setLoading(prev => ({ ...prev, students: true }));
//     setPreviewData([]);
    
//     try {
//       // Fetching all selected grades concurrently
//       const requests = selections.branchGradeIds.map(gradeId => 
//         api.get(`/api/admission/getEnrollmentsByBranchGradeAndAcademicYear/${gradeId}/${selections.academicYearId}`)
//       );
      
//       const responses = await Promise.all(requests);
//       const allStudents = responses.flatMap(res => res.data.content || []);
      
//       setStudents(allStudents);
//       setSelectedStudentIds([]);
//       if (allStudents.length === 0) toast.error("No students found for selected grades");
//     } catch (error) {
//       toast.error("Fetch Failed");
//     } finally {
//       setLoading(prev => ({ ...prev, students: false }));
//     }
//   };

//   const handleGeneratePreview = async () => {
//     if (selectedStudentIds.length === 0 || selectedInstallmentIds.length === 0) return toast.error("Select Students & Installments");
//     setLoading(prev => ({ ...prev, preview: true }));
//     try {
//       const payload = {
//         campusId: parseInt(selections.campusId),
//         studentEnrollmentIds: selectedStudentIds,
//         installmentIds: selectedInstallmentIds
//       };
//       const res = await api.post("/api/nach/preview", payload);
//       setPreviewData(res.data || []);
//       setFinalBatchSelection(res.data.filter(i => i.eligible).map(i => i.studentEnrollmentId));
//       toast.success("Analysis Complete");
//     } catch (error) {
//       toast.error("Preview Failed");
//     } finally {
//       setLoading(prev => ({ ...prev, preview: false }));
//     }
//   };

//   const handleCreateBatch = async () => {
//     if (!batchName) return toast.error("Please enter a Batch Name");
//     if (finalBatchSelection.length === 0) return toast.error("Select records from results");
//     setLoading(prev => ({ ...prev, creating: true }));
//     try {
//       const payload = {
//         campusId: parseInt(selections.campusId),
//         selectedEnrollmentIds: finalBatchSelection,
//         installmentIds: selectedInstallmentIds,
//         batchName: batchName
//       };
//       await api.post("/api/nach/batches/create", payload);
//       toast.success(`Batch Created!`);
//       setPreviewData([]);
//       setBatchName("");
//       setFinalBatchSelection([]);
//       await fetchBatches();
//       setActiveTab("repository");
//     } catch (error) {
//       toast.error("Creation Failed");
//     } finally {
//       setLoading(prev => ({ ...prev, creating: false }));
//     }
//   };

//   const fetchBatches = async () => {
//     setListLoading(true);
//     try {
//       const res = await api.get("/api/nach/batches");
//       setBatches((res.data || []).sort((a, b) => b.batchId - a.batchId));
//     } catch (error) {
//       toast.error("Database Connection Error");
//     } finally {
//       setListLoading(false);
//     }
//   };

//   const fetchBatchDetails = async (batchId) => {
//     setDetailLoading(true);
//     try {
//       const res = await api.get(`/api/nach/batches/${batchId}`);
//       setSelectedBatchDetails(res.data);
//     } catch (error) {
//       toast.error("Could not load batch details");
//     } finally {
//       setDetailLoading(false);
//     }
//   };

//   const handleGenerateBatchFile = async (batchId) => {
//     setProcessingId(batchId);
//     const loadingToast = toast.loading(`Initializing Batch Processing #${batchId}...`);
//     try {
//       await api.post(`/api/nach/files/generate/${batchId}`);
//       toast.success("Batch File Generated & Ready", { id: loadingToast });
//       fetchBatches();
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Generation Failed", { id: loadingToast });
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   const handleDownloadFile = async (fileId, batchName) => {
//     if (!fileId) return toast.error("File record not found.");
//     setDownloadingId(fileId);
//     const loadingToast = toast.loading("Downloading file...");
//     try {
//       const response = await api.get(`/api/nach/files/download/${fileId}`, { responseType: 'blob' });
//       const blob = new Blob([response.data], { type: 'text/csv' });
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `${batchName.replace(/[^a-z0-9]/gi, '_')}_Batch_${fileId}.csv`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
//       toast.success("Download complete", { id: loadingToast });
//     } catch (error) {
//       toast.error("Could not download file.", { id: loadingToast });
//     } finally {
//       setDownloadingId(null);
//     }
//   };

//   const handleFileChange = async (event) => {
//     const file = event.target.files[0];
//     if (!file || !activeBatchForUpload) return;
//     const formData = new FormData();
//     formData.append("file", file);
//     setUploadingId(activeBatchForUpload);
//     const uploadToast = toast.loading(`Uploading Response for Batch #${activeBatchForUpload}...`);
//     try {
//       await api.post(`/api/nach/files/upload-response/${activeBatchForUpload}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
//       toast.success("Response Uploaded Successfully", { id: uploadToast });
//       fetchBatches();
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Upload Failed", { id: uploadToast });
//     } finally {
//       setUploadingId(null);
//       setActiveBatchForUpload(null);
//       event.target.value = null;
//     }
//   };

//   const glassPanel = `rounded-[2.5rem] border shadow-2xl backdrop-blur-xl ${isDark ? "bg-[#0A0A0A]/90 border-white/10" : "bg-white/90 border-gray-100"}`;
//   const inputStyle = `px-5 py-4 rounded-2xl border outline-none font-bold text-xs transition-all ${isDark ? "bg-white/5 border-white/10 text-white focus:border-primary" : "bg-gray-50 border-gray-200 text-gray-800 focus:border-primary"}`;

//   const CustomSelect = ({ label, icon, value, onChange, options, placeholder }) => (
//     <div className="space-y-2 group">
//       <label className="text-[10px] font-black uppercase text-gray-500 ml-1 flex items-center gap-2">
//         {icon} {label}
//       </label>
//       <div className="relative">
//         <select value={value} onChange={onChange} className={`w-full pl-4 pr-10 py-4 rounded-2xl border outline-none font-bold text-[11px] appearance-none cursor-pointer transition-all ${isDark ? "bg-white/5 border-white/10 text-white focus:border-primary/50" : "bg-gray-50 border-gray-200 text-gray-800 focus:border-primary/50"}`} >
//           <option value="" className={isDark ? "bg-[#121212]" : "bg-white"}>{placeholder}</option>
//           {options?.map(o => (
//             <option key={o.id || o.campusId} value={o.id || o.campusId} className={isDark ? "bg-[#121212]" : "bg-white"}>
//               {o.name || o.campusName || o.gradeName || o.academicYear}
//             </option>
//           ))}
//         </select>
//         <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500" />
//       </div>
//     </div>
//   );

//   return (
//     <div className={`min-h-screen p-4 lg:p-10 max-w-[1700px] mx-auto space-y-8 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
//       <Toaster position="top-right" />
//       <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.xls,.xlsx" onChange={handleFileChange} />

//       {/* DETAIL MODAL */}
//       {selectedBatchDetails && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10">
//           <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedBatchDetails(null)}></div>
//           <div className={`${glassPanel} relative w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300`}>
//             <div className="p-8 border-b border-white/10 flex justify-between items-center bg-primary/5">
//               <div className="flex items-center gap-4">
//                 <div className="p-3 bg-primary rounded-2xl text-white"><Info size={24}/></div>
//                 <div>
//                   <h2 className="text-xl font-black uppercase tracking-tighter italic">{selectedBatchDetails.batchName}</h2>
//                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">System Batch ID: #{selectedBatchDetails.batchId}</p>
//                 </div>
//               </div>
//               <button onClick={() => setSelectedBatchDetails(null)} className="p-3 hover:bg-white/10 rounded-full transition-colors"><X size={24}/></button>
//             </div>
//             <div className="overflow-y-auto custom-scrollbar p-8 space-y-8">
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//                 <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
//                   <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Total Volume</p>
//                   <p className="text-2xl font-black text-primary">{selectedBatchDetails.totalRecords} <span className="text-xs text-gray-500">Items</span></p>
//                 </div>
//                 <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
//                   <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Settlement Amount</p>
//                   <p className="text-2xl font-black text-primary">₹{selectedBatchDetails.totalAmount.toLocaleString('en-IN')}</p>
//                 </div>
//                 <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10">
//                   <p className="text-[9px] font-black text-gray-500 uppercase mb-1">Batch Status</p>
//                   <p className="text-xl font-black uppercase tracking-tighter text-amber-500">{selectedBatchDetails.status.replace('_', ' ')}</p>
//                 </div>
//               </div>
//               <div className="space-y-4">
//                 <h4 className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2"><History size={14} className="text-primary"/> File Logs</h4>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   {selectedBatchDetails.files.map(file => (
//                     <div key={file.fileId} className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
//                       <div className="flex items-center gap-4">
//                         <div className={`p-3 rounded-xl ${file.fileType === 'DEBIT' ? 'bg-indigo-500/20 text-indigo-500' : 'bg-emerald-500/20 text-emerald-500'}`}><FileSpreadsheet size={18}/></div>
//                         <div>
//                           <p className="text-[11px] font-black uppercase tracking-tight">{file.fileType} FILE</p>
//                           <p className="text-[9px] text-gray-500 font-bold">{new Date(file.createdAt).toLocaleString()}</p>
//                         </div>
//                       </div>
//                       <span className="text-[9px] font-black px-2 py-1 rounded bg-white/10">{file.status}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* HEADER SECTION */}
//       <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/10 pb-8">
//         <div className="flex items-center gap-5">
//           <div className="p-4 bg-primary rounded-3xl shadow-2xl shadow-primary/40 rotate-3">
//             {activeTab === "manager" ? <ListChecks className="text-white" size={32} /> : <FileStack className="text-white" size={32} />}
//           </div>
//           <div>
//             <h1 className="text-3xl font-black tracking-tighter uppercase italic"> NACH <span className="text-primary not-italic">{activeTab === "manager" ? "Process Manager" : "Repository"}</span> </h1>
//             <p className="text-[10px] font-bold text-gray-500 tracking-[0.4em] uppercase mt-1"> System Control • Batch Processing v2.0 </p>
//           </div>
//         </div>
//         <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
//           <button onClick={() => setActiveTab("manager")} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'manager' ? "bg-primary text-white shadow-lg" : "text-gray-500"}`}><PlusSquare size={14}/> Batch Creation</button>
//           <button onClick={() => setActiveTab("repository")} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'repository' ? "bg-primary text-white shadow-lg" : "text-gray-500"}`}><FileStack size={14}/> Settlement History</button>
//         </div>
//       </div>

//       {/* VIEW: MANAGER */}
//       {activeTab === "manager" && (
//         <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
//           <div className={glassPanel}>
//             <div className="p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//               <CustomSelect label="Campus" icon={<School size={12}/>} placeholder="Select Campus" value={selections.campusId} options={options.campuses} onChange={(e) => setSelections(p => ({ ...p, campusId: e.target.value, branchId: "", branchGradeIds: [] }))} />
//               <CustomSelect label="Branch" icon={<GraduationCap size={12}/>} placeholder="Select Branch" value={selections.branchId} options={options.branches.filter(b => String(b.campusId) === String(selections.campusId)).map(b => ({ ...b, name: `${b.boardName} (${b.mediumName})` }))} onChange={(e) => setSelections(p => ({ ...p, branchId: e.target.value, branchGradeIds: [] }))} />
//               <CustomSelect label="Academic Year" icon={<Calendar size={12}/>} placeholder="Select Year" value={selections.academicYearId} options={options.academicYears} onChange={(e) => setSelections(p => ({ ...p, academicYearId: e.target.value }))} />
//             </div>

//             {/* NEW: GRADE MULTI-SELECT UI */}
//             {options.grades.length > 0 && (
//               <div className="px-8 pb-6 space-y-3">
//                 <label className="text-[10px] font-black uppercase text-gray-500 ml-1 flex items-center gap-2"><BookOpen size={12}/> Target Grades</label>
//                 <div className="flex flex-wrap gap-3">
//                   {options.grades.map(grade => (
//                     <button 
//                       key={grade.id} 
//                       onClick={() => setSelections(p => ({
//                         ...p, 
//                         branchGradeIds: p.branchGradeIds.includes(grade.id) 
//                           ? p.branchGradeIds.filter(id => id !== grade.id) 
//                           : [...p.branchGradeIds, grade.id]
//                       }))}
//                       className={`px-5 py-3 rounded-xl border text-[10px] font-black uppercase transition-all flex items-center gap-2 ${selections.branchGradeIds.includes(grade.id) ? "bg-primary border-primary text-white" : isDark ? "bg-white/5 border-white/10 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-600"}`}
//                     >
//                       {selections.branchGradeIds.includes(grade.id) ? <CheckCircle2 size={12}/> : <div className="w-3 h-3 border border-current rounded-sm"/>}
//                       {grade.gradeName}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="px-8 pb-8">
//               <button onClick={fetchStudents} disabled={loading.students} className="w-full py-5 bg-primary text-white font-black uppercase text-xs rounded-2xl flex items-center justify-center gap-3 hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-primary/20 disabled:opacity-50">
//                 {loading.students ? <Loader2 className="animate-spin" size={20}/> : <Search size={20}/>} Load Enrollment Pool
//               </button>
//             </div>
//           </div>

//           {students.length > 0 && (
//             <div className="space-y-6">
//               <div className={`${glassPanel} p-6`}>
//                 <div className="flex items-center gap-4 mb-5"><div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Banknote size={16} className="text-primary" /></div><span className="text-xs font-black uppercase tracking-widest">Target Installments</span></div>
//                 <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
//                   {options.allInstallments.map(inst => (
//                     <button key={inst.id} onClick={() => setSelectedInstallmentIds(prev => prev.includes(inst.id) ? prev.filter(i => i !== inst.id) : [...prev, inst.id])} className={`flex-shrink-0 px-8 py-4 rounded-2xl border text-[11px] font-black uppercase transition-all flex items-center gap-3 ${selectedInstallmentIds.includes(inst.id) ? "bg-primary border-primary text-white" : isDark ? "bg-white/5 border-white/10 text-gray-400" : "bg-gray-50 border-gray-200 text-gray-600"}`}><LayoutGrid size={14}/> {inst.name}</button>
//                   ))}
//                 </div>
//               </div>
//               <div className={`${glassPanel} overflow-hidden`}>
//                 <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
//                   <div className="flex items-center gap-3"><Fingerprint className="text-primary" size={20}/><h3 className="text-sm font-black uppercase tracking-widest">Student Pool ({selectedStudentIds.length}/{students.length})</h3></div>
//                   <div className="flex gap-3 w-full sm:w-auto">
//                     <button onClick={() => setSelectedStudentIds(selectedStudentIds.length === students.length ? [] : students.map(s => s.id))} className="flex-1 sm:flex-none px-6 py-3 border border-white/10 rounded-xl text-[10px] font-black uppercase">
//                       {selectedStudentIds.length === students.length ? "Deselect All" : "Select All"}
//                     </button>
//                     <button onClick={handleGeneratePreview} disabled={loading.preview || selectedStudentIds.length === 0} className="flex-1 sm:flex-none px-8 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 hover:bg-indigo-500 disabled:opacity-50">
//                       {loading.preview ? <Loader2 className="animate-spin" size={16}/> : <Eye size={16}/>} Run Analysis
//                     </button>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-8 max-h-[500px] overflow-y-auto custom-scrollbar">
//                   {students.map(s => (
//                     <div key={s.id} onClick={() => setSelectedStudentIds(prev => prev.includes(s.id) ? prev.filter(i => i !== s.id) : [...prev, s.id])} className={`p-5 rounded-2xl border flex items-center gap-5 cursor-pointer transition-all duration-300 ${selectedStudentIds.includes(s.id) ? "border-primary bg-primary/10 scale-[1.02]" : isDark ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50"}`}>
//                       <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${selectedStudentIds.includes(s.id) ? "bg-primary scale-110" : "border-2 border-gray-600"}`}>{selectedStudentIds.includes(s.id) && <CheckCircle2 size={14} className="text-white"/>}</div>
//                       <div className="overflow-hidden"><p className="text-xs font-black truncate tracking-wide">{s.enrollmentNo}</p><p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mt-0.5">Roll: {s.rollNumber}</p></div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {previewData.length > 0 && (
//             <div className={`${glassPanel} overflow-hidden border-primary/20 animate-in fade-in zoom-in-95 duration-500`}>
//               <div className="p-8 border-b border-white/5 bg-primary/5 flex flex-col xl:flex-row justify-between items-center gap-6">
//                 <div className="flex items-center gap-5"><div className="p-4 bg-green-500/20 text-green-500 rounded-2xl"><ShieldCheck size={28}/></div><div><h3 className="text-lg font-black uppercase tracking-widest leading-none">Eligibility Results</h3><p className="text-xs font-bold text-gray-500 mt-2">Verified {previewData.length} enrollment mandates</p></div></div>
//                 <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
//                   <input type="text" placeholder="BATCH IDENTIFIER" value={batchName} onChange={(e) => setBatchName(e.target.value.toUpperCase())} className="w-full sm:w-80 pl-6 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-xs font-black outline-none focus:border-primary" />
//                   <button onClick={handleCreateBatch} disabled={loading.creating || finalBatchSelection.length === 0} className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 disabled:opacity-50 shadow-2xl shadow-primary/30">
//                     {loading.creating ? <Loader2 className="animate-spin" size={18}/> : <PlusSquare size={18}/>} Commit Batch ({finalBatchSelection.length})
//                   </button>
//                 </div>
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-left">
//                   <thead><tr className="text-[10px] font-black uppercase text-gray-500 border-b border-white/5"><th className="px-8 py-6 w-12 text-center">Select</th><th className="px-8 py-6">Status</th><th className="px-8 py-6">Enrollment ID</th><th className="px-8 py-6">Mandate</th><th className="px-8 py-6">Installments</th><th className="px-8 py-6 text-right">Total Payable</th></tr></thead>
//                   <tbody className="divide-y divide-white/5">
//                     {previewData.map((item, idx) => (
//                       <tr key={idx} className={`group transition-all ${!item.eligible ? 'opacity-40' : 'hover:bg-white/[0.03] cursor-pointer'}`} onClick={() => item.eligible && setFinalBatchSelection(prev => prev.includes(item.studentEnrollmentId) ? prev.filter(i => i !== item.studentEnrollmentId) : [...prev, item.studentEnrollmentId])}>
//                         <td className="px-8 py-6 text-center"><input type="checkbox" checked={finalBatchSelection.includes(item.studentEnrollmentId)} disabled={!item.eligible} className="accent-primary w-5 h-5 rounded" readOnly /></td>
//                         <td className="px-8 py-6"><div className={`flex items-center gap-2 font-black text-[11px] uppercase ${item.eligible ? 'text-green-500' : 'text-red-500'}`}>{item.eligible ? <UserCheck size={14}/> : <XCircle size={14}/>} {item.eligible ? "Eligible" : "Ineligible"}</div></td>
//                         <td className="px-8 py-6 font-black text-sm tracking-tight">#{item.studentEnrollmentId}</td>
//                         <td className="px-8 py-6"><span className={`px-3 py-1.5 rounded-lg text-[10px] font-black ${item.mandateStatus === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>{item.mandateStatus}</span></td>
//                         <td className="px-8 py-6"><div className="flex flex-wrap gap-2">{item.installments?.map((inst, i) => (<span key={i} className="px-2 py-1 bg-white/5 border border-white/5 rounded-md text-[9px] font-bold text-gray-400">ID: {inst.installmentId}</span>)) || <AlertCircle size={16} className="text-amber-500"/>}</div></td>
//                         <td className="px-8 py-6 text-right font-black text-base text-primary">₹{item.totalAmount?.toLocaleString('en-IN')}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>
//       )}

//       {/* VIEW: REPOSITORY */}
//       {activeTab === "repository" && (
//         <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
//           <div className="flex justify-end items-center gap-4">
//             <div className="relative group">
//               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
//               <input type="text" placeholder="SEARCH BATCH ID OR NAME..." className={`${inputStyle} pl-12 w-80 shadow-inner`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
//             </div>
//             <button onClick={fetchBatches} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-primary/50 transition-all active:scale-90">
//               <RefreshCw size={22} className={`${listLoading ? "animate-spin text-primary" : "text-gray-400"}`} />
//             </button>
//           </div>
//           <div className={glassPanel}>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left border-separate border-spacing-0">
//                 <thead>
//                   <tr className="text-[11px] font-black uppercase text-gray-500 border-b border-white/5">
//                     <th className="px-10 py-8">Batch Identification</th>
//                     <th className="px-6 py-8">Execution Date</th>
//                     <th className="px-6 py-8">Volume</th>
//                     <th className="px-6 py-8 text-center">Status</th>
//                     <th className="px-6 py-8">Net Amount</th>
//                     <th className="px-10 py-8 text-right">Operations</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-white/5">
//                   {listLoading ? (
//                     <tr><td colSpan="6" className="py-32 text-center"><Loader2 className="animate-spin text-primary mx-auto" size={48}/></td></tr>
//                   ) : batches.filter(b => b.batchName?.toLowerCase().includes(searchTerm.toLowerCase()) || b.batchId.toString().includes(searchTerm)).map((batch) => (
//                     <tr key={batch.batchId} className="group hover:bg-primary/[0.03] transition-all">
//                       <td className="px-10 py-7">
//                         <div className="flex items-center gap-5">
//                           <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary font-black text-sm border border-white/10 group-hover:border-primary/50 transition-all">{batch.batchId}</div>
//                           <div><p className="font-black text-base tracking-tighter leading-none">{batch.batchName}</p><p className="text-[9px] text-gray-500 uppercase font-bold tracking-[0.2em] mt-1">Campus ID: {batch.campusId}</p></div>
//                         </div>
//                       </td>
//                       <td className="px-6 py-7 text-xs font-black tracking-tight"><div className="flex items-center gap-2"><Calendar size={14} className="text-primary opacity-50" /> {new Date(batch.batchDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div></td>
//                       <td className="px-6 py-7"><div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5"><span className="text-[12px] font-black text-primary">{batch.totalRecords}</span><span className="text-[9px] font-bold text-gray-500 uppercase">Entries</span></div></td>
//                       <td className="px-6 py-7 text-center">
//                         <span className={`px-5 py-2 rounded-xl border text-[9px] font-black tracking-[0.15em] uppercase flex items-center gap-2 shadow-sm ${batch.status === 'FILE_GENERATED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : batch.status === 'PROCESSING' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
//                           <div className={`w-1.5 h-1.5 rounded-full ${batch.status === 'FILE_GENERATED' ? 'bg-green-500' : batch.status === 'PROCESSING' ? 'bg-blue-500' : 'bg-primary'} animate-pulse`}></div>
//                           {batch.status.replace('_', ' ')}
//                         </span>
//                       </td>
//                       <td className="px-6 py-7"><p className="text-sm font-black tracking-tighter"><span className="text-primary mr-1 italic">₹</span>{batch.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p></td>
//                       <td className="px-10 py-7 text-right">
//                         <div className="flex items-center justify-end gap-2">
//                           <button onClick={() => fetchBatchDetails(batch.batchId)} className="p-3 bg-white/5 border border-white/10 rounded-xl text-primary hover:bg-primary hover:text-white transition-all shadow-lg">
//                             {detailLoading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
//                           </button>
//                           {batch.status === "CREATED" ? (
//                             <button onClick={() => handleGenerateBatchFile(batch.batchId)} disabled={processingId === batch.batchId} className="px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-primary/30 hover:scale-105 transition-all disabled:opacity-50">{processingId === batch.batchId ? <Loader2 size={16} className="animate-spin" /> : <PlusSquare size={16} />} Generate File</button>
//                           ) : (
//                             <>
//                               <button onClick={() => handleDownloadFile(batch.file?.fileId, batch.batchName)} disabled={!batch.file?.fileId || downloadingId === batch.file?.fileId} className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl transition-all ${(!batch.file?.fileId || downloadingId === batch.file?.fileId) ? "bg-gray-400 opacity-50" : "bg-[#1D6F42] text-white hover:bg-[#248a52]"}`}>
//                                 {downloadingId === batch.file?.fileId ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />} Download
//                               </button>
//                               <button onClick={() => { setActiveBatchForUpload(batch.batchId); fileInputRef.current.click(); }} disabled={uploadingId === batch.batchId} className="px-5 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl hover:bg-blue-500 disabled:opacity-50">{uploadingId === batch.batchId ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload</button>
//                             </>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default IntegratedNACHManager;