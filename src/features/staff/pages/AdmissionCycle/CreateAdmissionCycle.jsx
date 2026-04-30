import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { 
  Rocket, Calendar, Loader2, 
  MapPin, Plus, ArrowLeft,
  ChevronDown, List,
  BookOpen, Globe, Info, ShieldAlert,
  Fingerprint, CheckCircle2, AlertCircle
} from "lucide-react";
import api from "../../../../config/api";
import { Toaster, toast } from "react-hot-toast";

const AdmissionCycleManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  const { campuses, superAdmin } = useSelector((state) => state.campus);
  
  const [isCreating, setIsCreating] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [branches, setBranches] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedYearId, setSelectedYearId] = useState("");
  const [loading, setLoading] = useState({ fetch: true, create: false, status: null });
  const [fetchingYears, setFetchingYears] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, cycle: null, nextStatus: "" });

  const STATUS_OPTIONS = [
    { label: "DRAFT", dot: "bg-blue-500" },
    { label: "OPEN", dot: "bg-green-500" },
    { label: "PAUSE", dot: "bg-amber-500" },
    { label: "CLOSE", dot: "bg-red-500" }
  ];

  const theme = {
    bg: isDark ? "bg-[#050505]" : "bg-[#F8FAFC]",
    panel: isDark ? "bg-[#0D0D0D] border-white/10" : "bg-white border-slate-200",
    input: isDark ? "bg-[#141414] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900",
    textPrimary: isDark ? "text-white" : "text-slate-900",
    tableHeader: isDark ? "bg-white/[0.03]" : "bg-slate-50",
    modalOverlay: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm",
  };

  const authorizedIds = useMemo(() => (campuses || []).map(c => Number(c.campusId)), [campuses]);

  const authorizedCycles = useMemo(() => {
    if (superAdmin === true && authorizedIds.length === 0) return cycles;
    return cycles.filter(c => {
      const cId = Number(c.branchAcademicYear?.branch?.campusId || c.branchAcademicYear?.campus?.id);
      return authorizedIds.includes(cId);
    });
  }, [cycles, authorizedIds, superAdmin]);

  const filteredBranches = useMemo(() => {
    if (superAdmin === true && authorizedIds.length === 0) return branches;
    return branches.filter(b => authorizedIds.includes(Number(b.campusId)));
  }, [branches, authorizedIds, superAdmin]);

  useEffect(() => { loadCycles(); fetchBranches(); }, []);

  const loadCycles = async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const res = await api.get("/api/admission-cycles");
      setCycles(res.data || []);
    } catch (err) { toast.error("Error loading cycles"); }
    finally { setLoading(prev => ({ ...prev, fetch: false })); }
  };

  const fetchBranches = async () => {
    try {
      const res = await api.get("/api/branches");
      setBranches(res.data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (!selectedBranch) return;
    const fetchYears = async () => {
      setFetchingYears(true);
      try {
        const res = await api.get(`/api/branches/${selectedBranch}/academic-years`);
        setAcademicYears(res.data || []);
      } catch (err) { toast.error("Failed to load years"); }
      finally { setFetchingYears(false); }
    };
    fetchYears();
  }, [selectedBranch]);

  const handleCreateCycle = async () => {
    if (!selectedYearId) return;
    setLoading(prev => ({ ...prev, create: true }));
    try {
      await api.post(`/api/admission-cycles/branch-academic-years/${selectedYearId}`);
      toast.success("Cycle Created!");
      setIsCreating(false);
      loadCycles();
    } catch (err) { toast.error("Cycle already exists"); }
    finally { setLoading(prev => ({ ...prev, create: false })); }
  };

  const triggerStatusConfirm = (cycle, nextStatus) => {
    setConfirmModal({ show: true, cycle, nextStatus });
  };

  const proceedStatusChange = async () => {
    const { cycle, nextStatus } = confirmModal;
    setConfirmModal({ show: false, cycle: null, nextStatus: "" });
    setLoading(prev => ({ ...prev, status: cycle.id }));
    try {
      await api.patch(`/api/admission-cycles/${cycle.id}/status?status=${nextStatus}`);
      toast.success(`Status updated to ${nextStatus}`);
      loadCycles();
    } catch (err) { toast.error("Update failed"); }
    finally { setLoading(prev => ({ ...prev, status: null })); }
  };

  const StatusSelector = ({ cycle }) => {
    const current = STATUS_OPTIONS.find(o => o.label === cycle.status) || STATUS_OPTIONS[0];
    return (
      <div className="relative group w-full max-w-[140px]">
        <select 
          value={cycle.status}
          onChange={(e) => triggerStatusConfirm(cycle, e.target.value)}
          disabled={loading.status === cycle.id}
          className={`w-full appearance-none cursor-pointer pl-8 pr-8 py-2 rounded-lg text-small-table uppercase tracking-widest border transition-all focus:ring-1 focus:ring-primary/50 outline-none
            ${isDark ? "bg-[#141414] border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-700"}`}
        >
          {STATUS_OPTIONS.map(opt => (
            <option key={opt.label} value={opt.label} className={isDark ? "bg-[#0D0D0D]" : "bg-white"}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${current.dot} shadow-[0_0_8px_rgba(0,0,0,0.3)]`} />
        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
      </div>
    );
  };

  return (
    <div>
    {/* <div className={`min-h-screen p-6 lg:p-10 ${theme.bg} ${theme.textPrimary} transition-all duration-300 relative`}> */}
      <Toaster position="top-right" />

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.show && (
        <div className={theme.modalOverlay}>
          <div className={`w-full max-w-md rounded-3xl border p-8 shadow-2xl animate-in zoom-in-95 duration-200 ${theme.panel}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-2xl"><ShieldAlert className="text-primary" size={28} /></div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter italic">Status Override</h3>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">System Security Check</p>
              </div>
            </div>
            <p className="text-sm font-medium opacity-80 mb-8 leading-relaxed">
              Transition branch <span className="font-bold text-primary">{confirmModal.cycle?.branchAcademicYear?.branch?.name}</span> to <span className="font-black underline underline-offset-4">{confirmModal.nextStatus}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false })} className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={proceedStatusChange} className="flex-1 h-12 rounded-xl bg-primary font-black uppercase text-[10px] tracking-widest text-white shadow-lg shadow-primary/20 transition-all active:scale-95">Confirm Change</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20"><Rocket className="text-white" size={28} /></div>
          <div>
            <h1 className="text-heading font-black tracking-tighter uppercase">Admission <span className="text-primary not-italic">Cycles</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={() => setShowInfo(!showInfo)} className={`p-3 rounded-xl border transition-all ${showInfo ? 'bg-primary/10 border-primary text-primary' : theme.panel + ' opacity-50'}`}><Info size={20} /></button>
          {!isCreating && (
            <button onClick={() => setIsCreating(true)} className="h-14 px-8 bg-primary text-white rounded-2xl font-black uppercase text-button tracking-widest flex items-center gap-3 hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95">
              <Plus size={18} /> Create Cycle
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`${showInfo ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-500`}>
          {isCreating ? (
            <div className="animate-in slide-in-from-bottom-4 duration-500">
              <button onClick={() => setIsCreating(false)} className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all opacity-50 hover:text-primary"><ArrowLeft size={14} /> Back to Registry</button>
              <div className={`max-w-2xl mx-auto rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}>
                <div className="p-8 border-b border-white/5 bg-primary/5">
                  <h2 className="text-xl font-black italic uppercase tracking-tighter">New Enrollment Window</h2>
                  <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest mt-1">Configure admission parameters</p>
                </div>
                <div className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">Branch</label>
                    <select className={`w-full h-14 px-4 rounded-xl outline-none font-black text-xs border transition-all focus:border-primary ${theme.input}`} value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                      <option value="">Select Target Branch...</option>
                      {filteredBranches.map(b => <option key={b.id} value={b.id}>{b.campusName} — {b.mediumName} ({b.boardName})</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">Academic Year</label>
                    <select disabled={!selectedBranch || fetchingYears} className={`w-full h-14 px-4 rounded-xl outline-none font-black text-xs border transition-all focus:border-primary ${theme.input}`} value={selectedYearId} onChange={(e) => setSelectedYearId(e.target.value)}>
                      <option value="">{fetchingYears ? "Querying..." : "Choose Session..."}</option>
                      {academicYears.map(y => <option key={y.id} value={y.id}>{y.academicYear?.name}</option>)}
                    </select>
                  </div>
                  <button onClick={handleCreateCycle} disabled={!selectedYearId || loading.create} className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                    {loading.create ? <Loader2 className="animate-spin" /> : <Rocket size={18} />} Initialize Cycle
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}>
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-primary/5">
                <div className="flex items-center gap-3">
                  <List size={16} className="text-primary" />
                  <h3 className="font-black uppercase text-title-table tracking-widest">Active Cycle Registry</h3>
                </div>
                <span className="text-[10px] font-black opacity-40 uppercase">Total: {authorizedCycles.length}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`${theme.tableHeader} text-heding-table font-black uppercase text-slate-500 tracking-widest`}>
                      <th className="px-8 py-5">Branch & Campus</th>
                      <th className="px-8 py-5">Academic Session</th>
                      <th className="px-8 py-5 text-right">Status Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {loading.fetch ? (
                      <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={32} /></td></tr>
                    ) : authorizedCycles.length === 0 ? (
                      <tr><td colSpan={3} className="px-8 py-20 text-center opacity-30 font-black uppercase text-[10px] tracking-widest">No enrollment records found</td></tr>
                    ) : (
                      authorizedCycles.map((cycle) => (
                        <tr key={cycle.id} className="transition-colors hover:bg-white/[0.02]">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg"><BookOpen size={14} className="text-primary" /></div>
                              <div>
                                <p className="text-small-table uppercase leading-none">{cycle.branchAcademicYear?.branch?.name}</p>
                                {/* <div className="flex items-center gap-2 mt-2 opacity-50 text-[9px] font-bold uppercase tracking-tighter">
                                  <MapPin size={10} /> {cycle.branchAcademicYear?.campus?.name} 
                                  <span className="mx-1">•</span>
                                  <Globe size={10} /> {cycle.branchAcademicYear?.branch?.mediumName}
                                </div> */}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                              <Calendar size={12} className="text-primary" />
                              <span className="text-small-table text-primary">{cycle.branchAcademicYear?.academicYear?.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right flex justify-end">
                            <StatusSelector cycle={cycle} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {showInfo && (
          <aside className="lg:col-span-4 animate-in slide-in-from-right-4 duration-500">
            <div className={`rounded-3xl border p-8 sticky top-10 ${theme.panel}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg"><AlertCircle className="text-primary" size={20} /></div>
                <h4 className="font-black uppercase text-xs tracking-widest">Terminal Information</h4>
              </div>
              <div className="space-y-6">
                <div>
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2">Cycle Purpose</h5>
                  <p className="text-xs leading-relaxed opacity-60">Admission cycles govern the specific branch-session window. Updating the status immediately reflects on the enrollment portal.</p>
                </div>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2 flex items-center gap-2"><CheckCircle2 size={12} /> Status Protocol</h5>
                  <div className="space-y-2 text-[9px] leading-relaxed opacity-70 font-bold uppercase tracking-tight">
                    <p><span className="text-blue-500">Draft:</span> Setup phase. Not public.</p>
                    <p><span className="text-green-500">Open:</span> Publicly accepting apps.</p>
                    <p><span className="text-amber-500">Pause:</span> Viewable but locked.</p>
                    <p><span className="text-red-500">Close:</span> Admissions terminated.</p>
                  </div>
                </div>
                <button onClick={() => setShowInfo(false)} className="w-full py-3 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all">Dismiss Panel</button>
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
};

export default AdmissionCycleManager;