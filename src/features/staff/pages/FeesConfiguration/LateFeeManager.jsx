import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../config/api";
import {
  Search, Loader2, CheckCircle2, XCircle, ChevronDown, 
  Landmark, GraduationCap, History, Fingerprint, 
  User, Gavel, Trash2, Filter, Info, AlertCircle, 
  ArrowDownLeft, Calendar, ShieldCheck
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const LateFeeManagement = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  const { campuses } = useSelector((state) => state.campus);

  const [selections, setSelections] = useState({
    campusId: "",
    branchId: "",
    branchGradeId: "",
    academicYearId: ""
  });

  const [options, setOptions] = useState({
    branches: [],
    grades: [],
    academicYears: []
  });

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeStudent, setActiveStudent] = useState(null);
  const [dueData, setDueData] = useState(null);
  const [loading, setLoading] = useState({
    init: true,
    students: false,
    dues: false,
    action: false
  });

  const [modal, setModal] = useState({ type: null, data: { ids: [], selectedLateFee: 0 } });

  // Mode-aware styling logic
  const theme = {
    bg: isDark ? "bg-[#050505]" : "bg-[#F8FAFC]",
    panel: isDark ? "bg-[#0D0D0D] border-white/10" : "bg-white border-slate-200",
    textPrimary: isDark ? "text-white" : "text-slate-900",
    textSecondary: isDark ? "text-slate-400" : "text-slate-500",
    tableRow: isDark ? "hover:bg-white/[0.03] border-white/5" : "hover:bg-slate-50 border-slate-100",
    input: isDark ? "bg-[#141414] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900",
    dropdown: isDark ? "bg-[#1A1A1A] text-white" : "bg-white text-slate-900"
  };

  useEffect(() => {
    const fetchInfrastructure = async () => {
      try {
        const [branchRes, yearRes] = await Promise.all([
          api.get("/api/branches"),
          api.get("/api/academic-years/get-all-academic-year")
        ]);
        setOptions(prev => ({
          ...prev,
          branches: branchRes.data || [],
          academicYears: yearRes.data || []
        }));
      } catch (err) {
        toast.error("Infrastructure synchronization failed");
      } finally {
        setLoading(p => ({ ...p, init: false }));
      }
    };
    fetchInfrastructure();
  }, []);

  useEffect(() => {
    if (selections.branchId) {
      api.get(`/api/branches/${selections.branchId}/grades`)
        .then(res => setOptions(prev => ({ ...prev, grades: res.data || [] })))
        .catch(() => toast.error("Grades unavailable for this branch"));
    }
  }, [selections.branchId]);

  const fetchStudents = async () => {
    if (!selections.branchGradeId || !selections.academicYearId) {
      return toast.error("Grade and Session are required");
    }
    setLoading(p => ({ ...p, students: true }));
    try {
      const res = await api.get(`/api/admission/getEnrollmentsByBranchGradeAndAcademicYear/${selections.branchGradeId}/${selections.academicYearId}`);
      setStudents(res.data.content || []);
    } catch (err) {
      toast.error("Registry lookup failed");
    } finally {
      setLoading(p => ({ ...p, students: false }));
    }
  };

  const loadStudentDues = async (student) => {
    setLoading(p => ({ ...p, dues: true }));
    try {
      const res = await api.get(`/api/fees/dues/${student.id}`);
      setDueData(res.data);
      setActiveStudent(student);
    } catch (err) {
      toast.error("Financial records unreachable");
    } finally {
      setLoading(p => ({ ...p, dues: false }));
    }
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      studentEnrollmentId: activeStudent.id,
      installmentId: parseInt(formData.get("installmentId")),
      amount: parseFloat(formData.get("amount")),
      performedBy: 1,
      reason: formData.get("reason")
    };

    setLoading(p => ({ ...p, action: true }));
    try {
      await api.post("/api/fees/late-fee/adjust", payload);
      toast.success("Penalty adjusted successfully");
      setModal({ type: null, data: { ids: [] } });
      loadStudentDues(activeStudent);
    } catch (err) {
      toast.error("Adjustment failed");
    } finally {
      setLoading(p => ({ ...p, action: false }));
    }
  };

  const handleWaiverSubmit = async () => {
    if (!modal.data?.ids?.length) return toast.error("Select installments to waive");
    const payload = {
      studentEnrollmentId: activeStudent.id,
      academicYearId: parseInt(selections.academicYearId),
      installmentIds: modal.data.ids
    };

    setLoading(p => ({ ...p, action: true }));
    try {
      await api.post("/api/fees/late-fee/waiver", payload);
      toast.success("Late fee waiver processed");
      setModal({ type: null, data: { ids: [] } });
      loadStudentDues(activeStudent);
    } catch (err) {
      toast.error("Waiver processing failed");
    } finally {
      setLoading(p => ({ ...p, action: false }));
    }
  };

  if (loading.init) return (
    <div className={`h-screen flex flex-col items-center justify-center gap-4 ${theme.bg}`}>
      <Loader2 className="animate-spin text-primary" size={40}/>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Initializing Terminal</p>
    </div>
  );

  return (
    <div className={`min-h-screen p-6 lg:p-10 ${theme.bg} ${theme.textPrimary} transition-colors duration-300`}>
      <Toaster position="top-right" />

      {/* Header Section */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-lg shadow-primary/20">
            <ShieldCheck className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase italic">
              Late Fee <span className="text-primary not-italic">Control</span>
            </h1>
            <div className="flex items-center gap-2 mt-1 opacity-50">
              <Fingerprint size={12}/>
              <span className="text-[9px] font-bold uppercase tracking-widest">Authorized Terminal</span>
            </div>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 p-1.5 rounded-2xl border ${theme.panel}`}>
          <div className="px-5 py-2 border-r border-white/5">
            <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Total Records</p>
            <p className="text-sm font-black">{students.length}</p>
          </div>
          <div className="px-5 py-2">
            <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Status</p>
            <div className="flex items-center gap-2 text-green-500 text-[10px] font-bold">
              LIVE <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {!activeStudent ? (
          <>
            {/* Filter Panel */}
            <section className={`rounded-3xl border shadow-sm mb-8 overflow-hidden ${theme.panel}`}>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FilterSelect label="Campus" icon={<Landmark size={14}/>} value={selections.campusId} options={campuses?.map(c => ({ id: c.campusId, name: c.campusName }))} onChange={(e) => setSelections({ ...selections, campusId: e.target.value, branchId: "", branchGradeId: "" })} theme={theme} />
                <FilterSelect label="Branch" icon={<GraduationCap size={14}/>} value={selections.branchId} options={options.branches.filter(b => String(b.campusId) === String(selections.campusId)).map(b => ({ id: b.id, name: `${b.boardName} - ${b.mediumName}` }))} onChange={(e) => setSelections({ ...selections, branchId: e.target.value, branchGradeId: "" })} theme={theme} />
                <FilterSelect label="Grade" icon={<Filter size={14}/>} value={selections.branchGradeId} options={options.grades.map(g => ({ id: g.id, name: g.gradeName }))} onChange={(e) => setSelections({ ...selections, branchGradeId: e.target.value })} theme={theme} />
                <FilterSelect label="Session" icon={<Info size={14}/>} value={selections.academicYearId} options={options.academicYears.map(y => ({ id: y.id, name: y.name }))} onChange={(e) => setSelections({ ...selections, academicYearId: e.target.value })} theme={theme} />
              </div>
              <div className="px-8 pb-8">
                <button onClick={fetchStudents} disabled={loading.students} className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.99] shadow-lg shadow-primary/20">
                  {loading.students ? <Loader2 className="animate-spin" size={18}/> : <Search size={18}/>}
                  Retrieve Registry
                </button>
              </div>
            </section>

            {/* Student Table */}
            <div className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}>
              <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-primary/5">
                <h3 className="font-black uppercase text-xs tracking-widest">Enrollment Registry</h3>
                <div className="relative w-full sm:w-72">
                  <input type="text" placeholder="Search Enrollment No..." className={`w-full h-11 pl-10 pr-4 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`} onChange={(e) => setSearchTerm(e.target.value)}/>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={14}/>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-primary/5 text-[9px] font-black uppercase text-slate-500 tracking-widest">
                      <th className="px-8 py-5">Enrollment No</th>
                      <th className="px-8 py-5">Roll Number</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {students.filter(s => s.enrollmentNo?.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                      <tr key={s.id} className={`transition-colors ${theme.tableRow}`}>
                        <td className="px-8 py-5">
                          <span className="font-mono text-xs font-black text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">{s.enrollmentNo}</span>
                        </td>
                        <td className="px-8 py-5 text-[11px] font-bold opacity-70 uppercase">{s.rollNumber}</td>
                        <td className="px-8 py-5">
                          <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${s.status === 'ACTIVE' ? 'border-green-500/30 text-green-500 bg-green-500/5' : 'border-red-500/30 text-red-500 bg-red-500/5'}`}>{s.status}</span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <button onClick={() => loadStudentDues(s)} className="inline-flex items-center justify-center bg-primary text-white w-10 h-10 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-90">
                            <History size={18}/>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-8 py-20 text-center opacity-30 font-black uppercase text-[10px] tracking-[0.3em]">No records found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button onClick={() => setActiveStudent(null)} className={`mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${theme.textSecondary} hover:text-primary`}>
              <ArrowDownLeft className="rotate-90" size={14}/> Back to Student Registry
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-4 space-y-6">
                <div className={`p-8 rounded-3xl border shadow-sm ${theme.panel}`}>
                  <div className="flex items-center gap-5 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20"><User size={30}/></div>
                    <div>
                      <h2 className="text-xl font-black italic uppercase leading-tight">{activeStudent.enrollmentNo}</h2>
                      <p className={`text-[9px] font-bold uppercase tracking-widest ${theme.textSecondary}`}>Roll: {activeStudent.rollNumber}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <ActionButton icon={<Gavel size={16}/>} label="Adjust Penalty" onClick={() => setModal({ type: 'adjust', data: { ids: [] } })} />
                    <ActionButton icon={<Trash2 size={16}/>} label="Waive Late Fees" onClick={() => setModal({ type: 'waiver', data: { ids: [] } })} color="bg-red-500" />
                  </div>
                </div>
                
                <div className={`p-8 rounded-3xl border border-red-500/20 bg-gradient-to-br from-red-500/[0.05] to-transparent`}>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-red-500/60 mb-2">Total Outstanding</p>
                  <div className="flex justify-between items-end">
                    <h3 className="text-3xl font-black italic text-red-500 tracking-tighter">₹{dueData?.totalDue?.toLocaleString()}</h3>
                    <AlertCircle className="text-red-500/30" size={24}/>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-8">
                <div className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}>
                  <div className="p-6 border-b border-white/5 bg-primary/5">
                    <h4 className="font-black uppercase text-xs tracking-widest">Fee Installments Breakdown</h4>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-primary/5 text-[9px] font-black uppercase text-slate-500 tracking-widest">
                          <th className="px-8 py-4">Installment</th>
                          <th className="px-8 py-4">Breakdown</th>
                          <th className="px-8 py-4">Penalty</th>
                          <th className="px-8 py-4 text-right">Total Payable</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {dueData?.installments?.map((inst, idx) => (
                          <tr key={idx} className={`${inst.isOverdue ? 'bg-red-500/[0.02]' : ''} ${theme.tableRow}`}>
                            <td className="px-8 py-6">
                              <div className="font-black text-sm italic uppercase">{inst.installmentName}</div>
                              <div className={`text-[8px] font-bold uppercase mt-1 opacity-40`}>ID: {inst.installmentId}</div>
                              {inst.isOverdue && <span className="text-[7px] font-black bg-red-500 text-white px-2 py-0.5 rounded mt-2 inline-block uppercase animate-pulse">Overdue</span>}
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex flex-col gap-1.5">
                                {inst.feeHeadBreakdown.map((head, hidx) => (
                                  <div key={hidx} className="flex justify-between w-48 text-[10px]">
                                    <span className={`opacity-60 font-bold uppercase`}>{head.feeHeadName}</span>
                                    <span className="font-mono font-black">₹{head.amount}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className={`text-sm font-black italic ${inst.lateFee > 0 ? 'text-orange-500' : 'opacity-20'}`}>
                                ₹{inst.lateFee}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <span className="text-lg font-black text-primary italic">₹{inst.total.toLocaleString()}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Unified Modal System */}
      {modal.type && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden ${theme.panel}`}>
            <div className="p-6 bg-primary text-white flex justify-between items-center">
              <h2 className="font-black italic uppercase tracking-tight">
                {modal.type === 'adjust' ? 'Penalty Adjustment' : 'Late Fee Waiver'}
              </h2>
              <button onClick={() => setModal({ type: null, data: { ids: [] } })} className="hover:rotate-90 transition-all">
                <XCircle size={22}/>
              </button>
            </div>
            
            <div className="p-8">
              {modal.type === 'adjust' ? (
                <form onSubmit={handleAdjustSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase ml-1 ${theme.textSecondary}`}>Installment Target</label>
                    <select 
                      name="installmentId" 
                      required 
                      className={`w-full h-12 px-4 rounded-xl outline-none font-bold text-xs border ${theme.input}`}
                      onChange={(e) => {
                        const inst = dueData.installments.find(i => i.installmentId === parseInt(e.target.value));
                        setModal(prev => ({ ...prev, data: { ...prev.data, selectedLateFee: inst?.lateFee || 0 } }));
                      }}
                    >
                      <option value="" className={theme.dropdown}>Select target installment...</option>
                      {dueData?.installments?.filter(i => i.isOverdue).map(i => (
                        <option key={i.installmentId} value={i.installmentId} className={theme.dropdown}>
                          {i.installmentName} (Penalty: ₹{i.lateFee})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase ml-1 ${theme.textSecondary}`}>New Penalty Amount (₹)</label>
                    <input name="amount" type="number" step="0.01" required defaultValue={modal.data.selectedLateFee} className={`w-full h-12 px-4 rounded-xl outline-none font-black text-lg border ${theme.input}`} />
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-black uppercase ml-1 ${theme.textSecondary}`}>Reason for override</label>
                    <textarea name="reason" rows="3" required className={`w-full p-4 rounded-xl outline-none font-bold text-xs border ${theme.input}`} placeholder="Enter justification..."></textarea>
                  </div>
                  <button type="submit" disabled={loading.action} className="w-full h-14 bg-primary text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95">
                    {loading.action ? <Loader2 className="animate-spin mx-auto" size={20}/> : "Execute Adjustment"}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${theme.textSecondary}`}>Select installments to clear late fees:</p>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {dueData?.installments?.filter(i => i.lateFee > 0).map(i => {
                      const isSelected = modal.data?.ids?.includes(i.installmentId);
                      return (
                        <div key={i.installmentId} onClick={() => {
                          const ids = isSelected ? modal.data.ids.filter(id => id !== i.installmentId) : [...modal.data.ids, i.installmentId];
                          setModal({ ...modal, data: { ids } });
                        }} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex justify-between items-center ${isSelected ? "border-red-500 bg-red-500/5" : "border-white/5 bg-white/5 hover:border-white/10"}`}>
                          <div>
                            <p className="font-black uppercase text-[10px]">{i.installmentName}</p>
                            <p className="text-sm font-black text-red-500 italic">₹{i.lateFee}</p>
                          </div>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-red-500 text-white' : 'bg-white/5 text-transparent'}`}>
                            <CheckCircle2 size={16}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={handleWaiverSubmit} disabled={!modal.data?.ids?.length || loading.action} className="w-full h-14 bg-red-500 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-red-500/20 transition-all active:scale-95 disabled:opacity-30">
                    {loading.action ? <Loader2 className="animate-spin mx-auto" size={20}/> : `Confirm Waiver (${modal.data?.ids?.length})`}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* --- Sub-Components --- */

const FilterSelect = ({ label, icon, value, options, onChange, theme }) => (
  <div className="space-y-2">
    <label className={`text-[9px] font-black uppercase tracking-widest ml-1 flex items-center gap-2 ${theme.textSecondary}`}>
      {icon} {label}
    </label>
    <div className="relative">
      <select 
        className={`appearance-none w-full h-12 px-4 rounded-xl border outline-none font-bold text-[11px] transition-all cursor-pointer ${theme.input} focus:border-primary`} 
        value={value} 
        onChange={onChange}
      >
        <option value="" className={theme.dropdown}>SELECT {label.toUpperCase()}</option>
        {options?.map(o => <option key={o.id} value={o.id} className={theme.dropdown}>{o.name}</option>)}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={16} />
    </div>
  </div>
);

const ActionButton = ({ icon, label, onClick, color = "bg-primary" }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-4 rounded-2xl text-white font-black uppercase text-[10px] tracking-widest transition-all hover:-translate-y-1 shadow-md active:scale-95 ${color}`}>
    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">{icon}</div>
    {label}
  </button>
);

export default LateFeeManagement;