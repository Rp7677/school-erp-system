import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { 
  Layers, Plus, Trash2, Save, Users, Loader2, 
  Info, ShieldAlert, Fingerprint, AlertCircle, 
  CheckCircle2, X 
} from "lucide-react";
import api from "../../../../config/api"; 
import { toast, Toaster } from "react-hot-toast";

const AdmissionGradeConfig = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  const { campuses: assignedCampuses } = useSelector((state) => state.campus);
  
  const [loading, setLoading] = useState(false);
  const [cycles, setCycles] = useState([]);
  const [branchGrades, setBranchGrades] = useState([]);
  const [availableStreams, setAvailableStreams] = useState([]);
  const [showInfo, setShowInfo] = useState(true);

  const [selectedCycle, setSelectedCycle] = useState(null);
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [totalSeats, setTotalSeats] = useState("");
  const [streams, setStreams] = useState([]);

  // Modal State
  const [confirmModal, setConfirmModal] = useState({ show: false, payload: null });

  // Theme Definitions
  const theme = {
    bg: isDark ? "bg-[#050505]" : "bg-[#F8FAFC]",
    panel: isDark ? "bg-[#0D0D0D] border-white/10" : "bg-white border-slate-200",
    input: isDark ? "bg-[#141414] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900",
    textPrimary: isDark ? "text-white" : "text-slate-900",
    modalOverlay: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm",
  };

  useEffect(() => {
    api.get("/api/admission-cycles")
      .then(res => setCycles(res.data))
      .catch((err) => toast.error(err.response?.data?.message || "Could not load admission cycles"));
  }, []);

  const filteredCycles = useMemo(() => {
    if (!assignedCampuses || assignedCampuses.length === 0) return [];
    const assignedIds = assignedCampuses.map(c => c.campusId);
    return cycles.filter(cycle => assignedIds.includes(cycle.branchAcademicYear?.campus?.id));
  }, [cycles, assignedCampuses]);

  useEffect(() => {
    if (selectedCycle) {
      const branchId = selectedCycle.branchAcademicYear.branch.id;
      api.get(`/api/branches/${branchId}/grades`)
        .then(res => setBranchGrades(res.data))
        .catch(() => toast.error("Failed to fetch grades"));
      setSelectedGradeId("");
      setAvailableStreams([]);
      setStreams([]);
    }
  }, [selectedCycle]);

  useEffect(() => {
    if (selectedGradeId) {
      api.get(`/api/branch-grades/${selectedGradeId}/streams`)
        .then(res => {
          const streamData = res.data.streams || [];
          setAvailableStreams(streamData);
          setStreams(streamData.length > 0 ? [{ branchGradeStreamId: "", totalSeats: "" }] : []);
        })
        .catch(() => {
          setAvailableStreams([]);
          toast.error("Error checking for available streams");
        });
    }
  }, [selectedGradeId]);

  const handleOpenConfirm = () => {
    if (!selectedCycle) return toast.error("Please select an Admission Cycle");
    if (!selectedGradeId) return toast.error("Please select a Grade");

    if (availableStreams.length > 0) {
      const incomplete = streams.some(s => !s.branchGradeStreamId || !s.totalSeats);
      if (incomplete) return toast.error("Please fill in all Stream details");
    } else {
      if (!totalSeats || totalSeats <= 0) return toast.error("Please enter a valid number of Seats");
    }

    const payload = {
      branchGradeId: Number(selectedGradeId),
      totalSeats: availableStreams.length > 0 ? null : Number(totalSeats),
      ...(availableStreams.length > 0 && {
        streams: streams.map(s => ({
          branchGradeStreamId: Number(s.branchGradeStreamId),
          totalSeats: Number(s.totalSeats)
        }))
      })
    };

    setConfirmModal({ show: true, payload });
  };

  const executeDeployment = async () => {
    const { payload } = confirmModal;
    setConfirmModal({ show: false, payload: null });
    setLoading(true);

    try {
      await api.post(`/api/admission-cycles/${selectedCycle.id}/branch-grades`, payload);
      toast.success(`Configuration Deployed Successfully!`);
      setSelectedGradeId("");
      setTotalSeats("");
      setStreams([]);
      setAvailableStreams([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Deployment Failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-5 py-4 rounded-xl border outline-none font-bold transition-all ${theme.input} focus:border-primary`;

  return (
    <div >
    {/* <div className={`min-h-screen p-6 lg:p-10 ${theme.bg} ${theme.textPrimary} transition-all duration-300 relative`}> */}
      <Toaster position="top-right" />

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.show && (
        <div className={theme.modalOverlay}>
          <div className={`w-full max-w-md rounded-3xl border p-8 shadow-2xl animate-in zoom-in-95 duration-200 ${theme.panel}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <ShieldAlert className="text-primary" size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter italic">Confirm Deployment</h3>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Resource Allocation Check</p>
              </div>
            </div>
            
            <p className="text-sm font-medium opacity-80 mb-8 leading-relaxed">
              Are you sure you want to deploy this capacity configuration? This will finalize the available seats for 
              <span className="font-black text-primary"> {branchGrades.find(g => g.id === Number(selectedGradeId))?.gradeName} </span> 
              in the selected cycle.
            </p>

            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false, payload: null })} className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border border-white/10 hover:bg-white/5 transition-all">
                Cancel
              </button>
              <button onClick={executeDeployment} className="flex-1 h-12 rounded-xl bg-primary font-black uppercase text-[10px] tracking-widest text-white shadow-lg shadow-primary/20 transition-all active:scale-95">
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20 rotate-3">
            <Layers className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">
              Capacity <span className="text-primary not-italic">Setup</span>
            </h1>
            <div className="flex items-center gap-2 opacity-50">
              <Fingerprint size={12} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Seat Allocation Terminal</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setShowInfo(!showInfo)}
          className={`p-3 rounded-xl border transition-all ${showInfo ? 'bg-primary/10 border-primary text-primary' : theme.panel + ' opacity-50'}`}
        >
          <Info size={20} />
        </button>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- MAIN FORM AREA --- */}
        <div className={`${showInfo ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-500`}>
          <div className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}>
            <div className="p-8 border-b border-white/5 bg-primary/5">
              <h2 className="text-xl font-black italic uppercase tracking-tighter">Configuration Matrix</h2>
              <p className="text-[9px] font-bold opacity-50 uppercase tracking-widest mt-1">Define grade-wise intake capacity</p>
            </div>

            <div className="p-8 space-y-8">
              {/* Cycle Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase ml-1 tracking-widest">1. Admission Cycle</label>
                <select 
                  className={inputClass}
                  value={selectedCycle?.id || ""}
                  onChange={(e) => setSelectedCycle(filteredCycles.find(c => c.id === Number(e.target.value)))}
                >
                  <option value="">Select Cycle...</option>
                  {filteredCycles.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.branchAcademicYear.campus.name} — {c.branchAcademicYear.academicYear.name} | {c.branchAcademicYear.branch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Grade Selection */}
              {selectedCycle && (
                <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-black text-primary uppercase ml-1 tracking-widest">2. Select Grade</label>
                  <select 
                    className={inputClass}
                    value={selectedGradeId}
                    onChange={(e) => setSelectedGradeId(e.target.value)}
                  >
                    <option value="">Choose Grade...</option>
                    {branchGrades.map(g => (
                      <option key={g.id} value={g.id}>{g.gradeName}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Seats / Streams Distribution */}
              {selectedGradeId && (
                <div className="pt-8 border-t border-dashed border-white/10 animate-in fade-in duration-500">
                  {availableStreams.length === 0 ? (
                    <div className="space-y-2 max-w-xs">
                      <label className="text-[10px] font-black text-primary uppercase ml-1 tracking-widest">3. Total Seats</label>
                      <div className="relative">
                        <Users className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="number" 
                          className={`${inputClass} pl-14`} 
                          placeholder="000" 
                          value={totalSeats}
                          onChange={(e) => setTotalSeats(e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-black text-primary uppercase ml-1 tracking-widest">3. Stream Distribution</label>
                        <button 
                          onClick={() => setStreams([...streams, { branchGradeStreamId: "", totalSeats: "" }])}
                          className="h-10 bg-primary text-white px-4 rounded-xl font-black text-[10px] uppercase flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                        >
                          <Plus size={14} /> Add Stream
                        </button>
                      </div>
                      {streams.map((s, idx) => (
                        <div key={idx} className="flex gap-3 items-center animate-in slide-in-from-right-2">
                          <select 
                            className={inputClass}
                            value={s.branchGradeStreamId}
                            onChange={(e) => {
                              const newS = [...streams]; newS[idx].branchGradeStreamId = e.target.value; setStreams(newS);
                            }}
                          >
                            <option value="">Select Stream...</option>
                            {availableStreams.map(as => <option key={as.id} value={as.id}>{as.name}</option>)}
                          </select>
                          <input 
                            type="number" 
                            placeholder="Seats" 
                            className={`${inputClass} max-w-[140px] text-center`}
                            value={s.totalSeats}
                            onChange={(e) => {
                              const newS = [...streams]; newS[idx].totalSeats = e.target.value; setStreams(newS);
                            }}
                          />
                          <button 
                            onClick={() => setStreams(streams.filter((_, i) => i !== idx))} 
                            className="p-4 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                          ><Trash2 size={18}/></button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button 
                    onClick={handleOpenConfirm}
                    disabled={loading}
                    className="w-full mt-12 py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Deploy Configuration</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT INFORMATION PANEL --- */}
        {showInfo && (
          <aside className="lg:col-span-4 animate-in slide-in-from-right-4 duration-500">
            <div className={`rounded-3xl border p-8 sticky top-10 ${theme.panel}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <AlertCircle className="text-primary" size={20} />
                </div>
                <h4 className="font-black uppercase text-xs tracking-widest">Setup Guide</h4>
              </div>

              <div className="space-y-6">
                <div>
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2">What is Capacity Setup?</h5>
                  <p className="text-xs leading-relaxed opacity-60">
                    This module defines how many seats are available for a specific grade within an admission cycle. This data is critical for controlling application limits.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2 flex items-center gap-2">
                    <CheckCircle2 size={12} /> Allocation Logic
                  </h5>
                  <p className="text-[10px] leading-relaxed opacity-70">
                    <span className="font-bold">Standard Grade:</span> Enter total seats directly. <br/>
                    <span className="font-bold">Stream-Based:</span> If the grade (e.g., 11th) has streams, you must distribute seats per stream.
                  </p>
                </div>

                <ul className="space-y-3">
                    {['Assigned campuses only', 'Unique grade config', 'Deployment is final'].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-[10px] font-bold opacity-50 uppercase tracking-tight">
                            <div className="w-1 h-1 rounded-full bg-primary" /> {item}
                        </li>
                    ))}
                </ul>

                <button 
                  onClick={() => setShowInfo(false)}
                  className="w-full py-3 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
                >
                  Dismiss Panel
                </button>
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
};

export default AdmissionGradeConfig;