import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../config/api";
import { 
  Search, Loader2, CheckCircle2, XCircle, ChevronDown, Wallet, 
  ShieldCheck, Filter, LayoutGrid, Info, Landmark, GraduationCap, 
  History, Fingerprint, TrendingUp, User, Hash, CreditCard,
  AlertCircle, ArrowUpRight, ArrowDownLeft, Calendar
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const PaymentPreferenceManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  const { campuses } = useSelector((state) => state.campus);

  const [selections, setSelections] = useState({ 
    campusId: "", branchId: "", academicYearId: "", branchGradeId: "" 
  });
  
  const [options, setOptions] = useState({ branches: [], academicYears: [], grades: [] });
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState({ initial: true, students: false, ledger: false });

  const [showLedgerModal, setShowLedgerModal] = useState(null);
  const [studentLedger, setStudentLedger] = useState(null);
  const [dueDetails, setDueDetails] = useState(null);
  const [activeTab, setActiveTab] = useState("ledger");

  // --- Unified Theme Logic ---
  const theme = {
    bg: isDark ? "bg-[#050505]" : "bg-[#F8FAFC]",
    panel: isDark ? "bg-[#0D0D0D] border-white/10" : "bg-white border-slate-200",
    input: isDark ? "bg-[#141414] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900",
    tableHeader: isDark ? "bg-white/[0.03]" : "bg-slate-50",
    textPrimary: isDark ? "text-white" : "text-slate-900",
    textSecondary: isDark ? "text-slate-500" : "text-slate-500",
  };

  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const [branchRes, yearRes] = await Promise.all([
          api.get("/api/branches"),
          api.get("/api/academic-years/get-all-academic-year")
        ]);
        setOptions(prev => ({ ...prev, branches: branchRes.data || [], academicYears: yearRes.data || [] }));
      } catch (error) { toast.error("System Sync Failed"); }
      finally { setLoading(prev => ({ ...prev, initial: false })); }
    };
    fetchBaseData();
  }, []);

  useEffect(() => {
    if (selections.branchId) {
      api.get(`/api/branches/${selections.branchId}/grades`)
        .then(res => setOptions(prev => ({ ...prev, grades: res.data || [] })))
        .catch(() => toast.error("Grades unavailable"));
    }
  }, [selections.branchId]);

  const fetchStudentsList = async () => {
    if (!selections.branchGradeId || !selections.academicYearId) return toast.error("Configuration Required");
    setLoading(prev => ({ ...prev, students: true }));
    try {
      const res = await api.get(`/api/admission/getEnrollmentsByBranchGradeAndAcademicYear/${selections.branchGradeId}/${selections.academicYearId}`);
      setStudents(res.data.content || []);
    } catch (error) { toast.error("Registry lookup failed"); }
    finally { setLoading(prev => ({ ...prev, students: false })); }
  };

  const openDetailedView = async (student) => {
    setShowLedgerModal(student);
    setLoading(p => ({ ...p, ledger: true }));
    try {
      const [ledgerRes, duesRes] = await Promise.all([
        api.get(`/api/fees/ledger/${student.id}`),
        api.get(`/api/fees/dues/${student.id}`)
      ]);
      setStudentLedger(ledgerRes.data);
      setDueDetails(duesRes.data);
    } catch (e) {
      toast.error("Records unreachable");
      setShowLedgerModal(null);
    } finally { setLoading(p => ({ ...p, ledger: false })); }
  };

  if (loading.initial) return <div className={`h-screen flex items-center justify-center ${theme.bg}`}><Loader2 className="animate-spin text-primary" size={40}/></div>;

  return (
    <div className={`min-h-screen p-6 lg:p-10 ${theme.bg} ${theme.textPrimary} transition-all duration-300`}>
      <Toaster position="top-right" />

      {/* Professional Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20 rotate-3">
            <ShieldCheck className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">
              Financial <span className="text-primary not-italic">Terminal</span>
            </h1>
            <div className="flex items-center gap-2 opacity-50">
              <Fingerprint size={12}/>
              <span className="text-[9px] font-bold uppercase tracking-widest">Authorized Access Only</span>
            </div>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 p-1.5 rounded-2xl border ${theme.panel}`}>
          <div className="px-5 py-2 border-r border-white/5 text-center">
            <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Status</p>
            <div className="flex items-center gap-1.5 text-green-500 text-[10px] font-bold">LIVE <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div></div>
          </div>
          <div className="px-5 py-2 text-center">
            <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Records</p>
            <p className="text-sm font-black">{students.length}</p>
          </div>
        </div>
      </header>

      {/* Configuration Panel */}
      <section className={`max-w-7xl mx-auto rounded-3xl border shadow-sm mb-8 overflow-hidden ${theme.panel}`}>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FilterSelect label="Campus" icon={<Landmark size={14}/>} value={selections.campusId} options={campuses?.map(c => ({ id: c.campusId, name: c.campusName }))} onChange={(e) => setSelections({ ...selections, campusId: e.target.value, branchId: "", branchGradeId: "" })} isDark={isDark} theme={theme} />
          <FilterSelect label="Branch" icon={<GraduationCap size={14}/>} value={selections.branchId} options={options.branches.filter(b => String(b.campusId) === String(selections.campusId)).map(b => ({ id: b.id, name: `${b.boardName} - ${b.mediumName}` }))} onChange={(e) => setSelections({ ...selections, branchId: e.target.value, branchGradeId: "" })} isDark={isDark} theme={theme} />
          <FilterSelect label="Grade" icon={<Filter size={14}/>} value={selections.branchGradeId} options={options.grades.map(g => ({ id: g.id, name: g.gradeName }))} onChange={(e) => setSelections({ ...selections, branchGradeId: e.target.value })} isDark={isDark} theme={theme} />
          <FilterSelect label="Session" icon={<Info size={14}/>} value={selections.academicYearId} options={options.academicYears.map(y => ({ id: y.id, name: y.name }))} onChange={(e) => setSelections({ ...selections, academicYearId: e.target.value })} isDark={isDark} theme={theme} />
        </div>
        <div className="px-8 pb-8">
          <button onClick={fetchStudentsList} disabled={loading.students} className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.99] shadow-lg shadow-primary/20">
            {loading.students ? <Loader2 className="animate-spin" size={20}/> : <Search size={20}/>} Sync Central Registry
          </button>
        </div>
      </section>

      {/* Table Registry */}
      <div className={`max-w-7xl mx-auto rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}>
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-primary/5">
          <div className="flex items-center gap-3">
            <LayoutGrid className="text-primary" size={18}/>
            <h3 className="font-black uppercase text-xs tracking-widest">Enrollment Registry</h3>
          </div>
          <div className="relative w-full sm:w-80">
            <input type="text" placeholder="FILTER BY REFERENCE..." className={`w-full h-10 pl-10 pr-4 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`} onChange={(e) => setSearchTerm(e.target.value)}/>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={14}/>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`${theme.tableHeader} text-[9px] font-black uppercase text-slate-500 tracking-widest`}>
                <th className="px-8 py-5">Reference No</th>
                <th className="px-8 py-5">Academic Profile</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {students.filter(s => s.enrollmentNo?.toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                <tr key={s.id} className="group hover:bg-primary/[0.02] transition-colors">
                  <td className="px-8 py-6"><span className="font-mono text-xs font-black text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">{s.enrollmentNo}</span></td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-[11px] uppercase">ID: {s.student}</span>
                      <span className="text-[9px] font-bold opacity-50 uppercase mt-1">Roll: {s.rollNumber}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${s.status === 'ACTIVE' ? 'border-green-500/30 text-green-500 bg-green-500/5' : 'border-red-500/30 text-red-500 bg-red-500/5'}`}>{s.status}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button onClick={() => openDetailedView(s)} className="bg-primary text-white w-9 h-9 rounded-xl flex items-center justify-center hover:shadow-lg transition-all active:scale-90"><History size={16}/></button>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center opacity-30 font-black uppercase text-[10px] tracking-widest">No active records synced</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal View */}
      {showLedgerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className={`w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl ${isDark ? "bg-[#0A0A0A]" : "bg-white"}`}>
            
            <div className="p-8 bg-primary relative flex justify-between items-center text-white">
              <div className="flex items-center gap-6 z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20"><User size={28} /></div>
                <div>
                  <h2 className="text-2xl font-black italic uppercase leading-none tracking-tighter">Detailed Statement</h2>
                  <div className="flex gap-4 mt-2">
                    <span className="text-[9px] font-black uppercase bg-black/20 px-3 py-1 rounded-lg border border-white/10">{showLedgerModal.enrollmentNo}</span>
                    <span className="text-[9px] font-black uppercase bg-black/20 px-3 py-1 rounded-lg border border-white/10">ROLL: {showLedgerModal.rollNumber}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowLedgerModal(null)} className="z-10 bg-white/10 hover:bg-red-500 p-3 rounded-2xl transition-all"><XCircle size={24} /></button>
            </div>

            <div className={`flex p-2 gap-2 border-b border-white/5 ${isDark ? "bg-[#111]" : "bg-slate-50"}`}>
              {[{ id: "ledger", label: "Financial Ledger", icon: <History size={14}/> }, { id: "dues", label: "Outstanding Dues", icon: <Wallet size={14}/> }].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${activeTab === tab.id ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:bg-primary/5"}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {loading.ledger ? (
                <div className="h-full flex flex-col items-center justify-center gap-4 opacity-40">
                  <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-[9px] font-black uppercase tracking-widest">Accessing Ledger</p>
                </div>
              ) : (
                <div className="animate-in slide-in-from-bottom-4 duration-500">
                  {activeTab === "ledger" ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <ModernMetric label="Total Billing" value={studentLedger?.summary?.totalDebit} color="blue" icon={<ArrowUpRight size={20}/>} />
                        <ModernMetric label="Receipted" value={studentLedger?.summary?.totalCredit} color="green" icon={<CheckCircle2 size={20}/>} />
                        <ModernMetric label="Current Due" value={studentLedger?.summary?.totalDue} color="red" icon={<AlertCircle size={20}/>} />
                      </div>
                      <div className={`rounded-2xl border overflow-hidden ${theme.panel}`}>
                        <table className="w-full text-left">
                          <thead>
                            <tr className={`${theme.tableHeader} text-[9px] font-black uppercase text-slate-500 tracking-widest`}>
                              <th className="px-6 py-4">Transaction Details</th>
                              <th className="px-6 py-4 text-right">Debit</th>
                              <th className="px-6 py-4 text-right">Credit</th>
                              <th className="px-6 py-4 text-right">Balance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {studentLedger?.entries?.map((entry, idx) => (
                              <tr key={idx} className="hover:bg-primary/[0.01]">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${entry.creditAmount > 0 ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"}`}>
                                      {entry.creditAmount > 0 ? <ArrowDownLeft size={14}/> : <ArrowUpRight size={14}/>}
                                    </div>
                                    <div>
                                      <p className="font-black text-[10px] uppercase">{entry.installmentName}</p>
                                      <p className="text-[8px] font-bold opacity-40 uppercase">{entry.feeHeadName}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right font-mono text-xs font-black">{entry.debitAmount > 0 ? `₹${entry.debitAmount.toLocaleString()}` : "—"}</td>
                                <td className="px-6 py-4 text-right font-mono text-xs font-black text-green-500">{entry.creditAmount > 0 ? `₹${entry.creditAmount.toLocaleString()}` : "—"}</td>
                                <td className="px-6 py-4 text-right">
                                  <span className="font-mono text-xs font-black text-primary">₹{entry.runningBalance.toLocaleString()}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {dueDetails?.installments?.map((inst, idx) => (
                        <div key={idx} className={`p-8 rounded-[2rem] border transition-all ${inst.isOverdue ? 'border-red-500/30 bg-red-500/[0.02]' : 'border-white/5 bg-white/5'}`}>
                          <div className="flex justify-between items-start mb-6">
                            <div>
                              <h4 className="text-lg font-black uppercase italic">{inst.installmentName}</h4>
                              <p className="text-[9px] font-bold opacity-40 mt-1">INSTALLMENT ID: {inst.installmentId}</p>
                            </div>
                            {inst.isOverdue && <div className="bg-red-500 text-white text-[8px] font-black px-3 py-1.5 rounded-lg animate-pulse">OVERDUE</div>}
                          </div>
                          <div className="space-y-2 mb-6">
                            {inst.feeHeadBreakdown.map((head, hidx) => (
                              <div key={hidx} className="flex justify-between items-center bg-white/[0.03] p-3 rounded-xl border border-white/5">
                                <span className="text-[9px] font-black opacity-60 uppercase">{head.feeHeadName}</span>
                                <span className="font-mono font-black text-xs">₹{head.amount.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-end pt-4 border-t border-white/5">
                            <div>
                              <p className="text-[8px] font-black text-orange-500 uppercase tracking-widest">Penalties</p>
                              <p className="font-mono text-sm font-black text-orange-500">₹{inst.lateFee}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-black opacity-40 uppercase mb-1">Total Payable</p>
                              <p className="text-2xl font-black text-primary italic leading-none">₹{inst.total.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Modular Design Sub-Components ---

const FilterSelect = ({ label, icon, value, options, onChange, isDark, theme }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">{icon} {label}</label>
    <div className="relative group">
      <select 
        className={`appearance-none w-full h-12 px-4 rounded-xl border outline-none font-bold text-[10px] transition-all cursor-pointer ${theme.input} focus:border-primary`} 
        value={value} 
        onChange={onChange}
      >
        <option value="" className={isDark ? "bg-black" : "bg-white"}>SELECT {label.toUpperCase()}</option>
        {options?.map(o => <option key={o.id} value={o.id} className={isDark ? "bg-black" : "bg-white"}>{o.name}</option>)}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40 group-hover:text-primary transition-colors" size={16} />
    </div>
  </div>
);

const ModernMetric = ({ label, value, color, icon }) => {
  const styles = {
    blue: "from-primary/20 via-primary/5 border-primary/20 text-primary shadow-primary/5",
    green: "from-green-500/20 via-green-500/5 border-green-500/20 text-green-500 shadow-green-500/5",
    red: "from-red-500/20 via-red-500/5 border-red-500/20 text-red-500 shadow-red-500/5"
  };
  return (
    <div className={`p-6 rounded-[2rem] border bg-gradient-to-br shadow-xl transition-all hover:-translate-y-1 ${styles[color]}`}>
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-60">{label}</p>
          <h3 className="text-2xl font-black italic tracking-tighter leading-none">₹{value?.toLocaleString() || '0'}</h3>
        </div>
        <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20">{icon}</div>
      </div>
    </div>
  );
};

export default PaymentPreferenceManager;