import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { 
  Building2, Landmark, Fingerprint, CreditCard, Plus, 
  Search, Loader2, Power, PowerOff, Wallet, 
  ShieldCheck, ArrowLeft, Filter, MapPin, Info,
  HelpCircle, ShieldAlert, Save, XCircle, ChevronDown
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import api from "../../../../../config/api"; 
import AutoBreadcrumb from "../../../../../components/common/AutoBreadcrumb";

const BankManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  const { campuses } = useSelector((state) => state.campus);

  // --- STATE MANAGEMENT ---
  const [isCreating, setIsCreating] = useState(false);
  const [branches, setBranches] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState({ fetch: false, process: false });
  const [showInfo, setShowInfo] = useState(false);

  const [formData, setFormData] = useState({
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: ""
  });

  const [confirmModal, setConfirmModal] = useState({ 
    show: false, 
    actionType: "", 
    data: null 
  });

  // --- THEME & STYLES ---
  const theme = {
    panel: isDark ? "bg-[#0D0D0D] border-white/10" : "bg-white border-slate-200",
    input: isDark ? "bg-[#141414] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900",
    tableHeader: isDark ? "bg-white/[0.03]" : "bg-slate-50",
    rowHover: isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50",
    modalOverlay: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm",
    select: isDark 
      ? "bg-[#141414] border-white/10 text-white appearance-none cursor-pointer focus:border-primary/50" 
      : "bg-white border-slate-200 text-slate-900 appearance-none cursor-pointer focus:border-primary",
  };

  const cardClass = `rounded-3xl border shadow-sm overflow-hidden transition-all duration-300 ${theme.panel}`;

  // --- API LOGIC ---
  const fetchBranches = useCallback(async () => {
    try {
      const res = await api.get("/api/branches");
      setBranches(res.data || []);
      if (campuses?.length > 0) setSelectedCampusId(campuses[0].campusId.toString());
    } catch (err) {
      toast.error("Failed to load branches");
    }
  }, [campuses]);

  const fetchAccounts = useCallback(async (branchId) => {
    if (!branchId) return;
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const res = await api.get(`/api/fees/bank-accounts/branch/${branchId}`);
      setAccounts(res.data || []);
    } catch (err) {
      setAccounts([]);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, []);

  useEffect(() => { fetchBranches(); }, [fetchBranches]);

  const filteredBranches = useMemo(() => {
    if (!selectedCampusId) return [];
    return branches.filter(b => b.campusId.toString() === selectedCampusId.toString());
  }, [branches, selectedCampusId]);

  useEffect(() => {
    if (filteredBranches.length > 0) {
      const firstBranchId = filteredBranches[0].id.toString();
      setSelectedBranchId(firstBranchId);
      fetchAccounts(firstBranchId);
    } else {
      setSelectedBranchId("");
      setAccounts([]);
    }
  }, [filteredBranches, fetchAccounts]);

  // --- CRUD HANDLERS ---
  const handleCreateClick = (e) => {
    e.preventDefault();
    if (!selectedBranchId) return toast.error("Select a branch context");
    setConfirmModal({ show: true, actionType: "CREATE", data: formData });
  };

  const handleToggleClick = (acc) => {
    setConfirmModal({ show: true, actionType: "TOGGLE_STATUS", data: acc });
  };

  const executeOperation = async () => {
    const { actionType, data } = confirmModal;
    setConfirmModal({ show: false, actionType: "", data: null });
    setLoading(prev => ({ ...prev, process: true }));

    try {
      if (actionType === "CREATE") {
        await api.post("/api/fees/bank-accounts", { ...data, branchId: parseInt(selectedBranchId) });
        toast.success("Account Registered");
        setFormData({ accountName: "", accountNumber: "", ifscCode: "", bankName: "" });
        setIsCreating(false);
      } else {
        await api.patch(`/api/fees/bank-accounts/${data.id}/status`, { active: !data.active });
        toast.success("Status Updated");
      }
      fetchAccounts(selectedBranchId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(prev => ({ ...prev, process: false }));
    }
  };

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.show && (
        <div className={theme.modalOverlay}>
          <div className={`w-full max-w-md rounded-3xl border p-8 shadow-2xl animate-in zoom-in-95 duration-200 ${theme.panel}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-2xl bg-primary/10">
                <ShieldAlert className="text-primary" size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter italic">Confirm {confirmModal.actionType}</h3>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Financial Protocol</p>
              </div>
            </div>
            <p className="text-sm font-medium opacity-80 mb-8 leading-relaxed">
              Are you sure you want to proceed with <span className="text-primary font-black">{confirmModal.actionType}</span> for 
              <span className="font-bold"> {confirmModal.data?.accountName || "this account"}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false })} className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={executeOperation} className="flex-1 h-12 rounded-xl text-white font-black uppercase text-[10px] bg-primary shadow-lg shadow-primary/20 transition-all">Proceed</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className=" mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20 rotate-3">
            <Landmark className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Bank <span className="text-primary not-italic">Accounts</span></h1>
            <div className="flex items-center gap-2 opacity-50">
              <Fingerprint size={12} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Financial Registry Terminal</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowInfo(!showInfo)} className={`p-3 rounded-xl border transition-all ${showInfo ? 'bg-primary/10 border-primary text-primary' : 'opacity-50 ' + theme.panel}`}>
            <Info size={20} />
          </button>
          <div className={`px-6 py-3 rounded-2xl border text-center ${theme.panel}`}>
            <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Total Records</p>
            <p className="text-sm font-black">{accounts.length}</p>
          </div>
        </div>
      </header>

      <main className=" mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`${showInfo ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-500 space-y-8`}>
          <AutoBreadcrumb />

          {isCreating ? (
            <div className={`${cardClass} animate-in slide-in-from-top-4`}>
              <div className="p-8 border-b border-white/5 bg-primary/5 flex justify-between items-center">
                <h2 className="text-xl font-black italic uppercase tracking-tighter">Register New Account</h2>
                <button onClick={() => setIsCreating(false)} className="opacity-40 hover:opacity-100 transition-transform active:scale-90"><XCircle size={20}/></button>
              </div>
              <form onSubmit={handleCreateClick} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Campus</label>
                  <div className="relative">
                    <select className={`w-full h-14 px-4 rounded-xl font-black text-xs border outline-none ${theme.select}`} value={selectedCampusId} onChange={(e) => setSelectedCampusId(e.target.value)}>
                      {campuses.map(c => <option key={c.campusId} value={c.campusId} className="bg-[#0D0D0D]">{c.campusName}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={16} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Branch Context</label>
                  <div className="relative">
                    <select className={`w-full h-14 px-4 rounded-xl font-black text-xs border outline-none ${theme.select}`} value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value)}>
                      {filteredBranches.map(b => <option key={b.id} value={b.id} className="bg-[#0D0D0D]">{b.boardName} — {b.mediumName}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={16} />
                  </div>
                </div>
                {[
                  { label: "Account Holder", icon: Wallet, key: "accountName" },
                  { label: "Bank Name", icon: Building2, key: "bankName" },
                  { label: "Account Number", icon: CreditCard, key: "accountNumber" },
                  { label: "IFSC Code", icon: ShieldCheck, key: "ifscCode" }
                ].map((input) => (
                  <div key={input.key} className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 ml-1"><input.icon size={10}/> {input.label}</label>
                    <input required className={`w-full h-14 px-4 rounded-xl font-black text-xs border outline-none transition-all focus:border-primary ${theme.input}`} value={formData[input.key]} onChange={(e) => setFormData({...formData, [input.key]: e.target.value.toUpperCase()})} />
                  </div>
                ))}
                <div className="md:col-span-2 flex gap-3 mt-4">
                  <button type="submit" disabled={loading.process} className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                    {loading.process ? <Loader2 className="animate-spin" /> : <Save size={18} />} Finalize Registration
                  </button>
                  <button type="button" onClick={() => setIsCreating(false)} className="px-8 h-14 rounded-2xl font-black uppercase text-xs tracking-widest border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* --- CONTROL BAR --- */}
              <div className={`${cardClass} p-4 flex flex-wrap items-center justify-between gap-4`}>
                <div className="flex flex-wrap items-center gap-3">
                  <div className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border ${theme.input}`}>
                    <MapPin size={14} className="text-primary shrink-0" />
                    <select value={selectedCampusId} onChange={(e) => setSelectedCampusId(e.target.value)} className="bg-transparent font-black text-[10px] uppercase outline-none cursor-pointer pr-6 appearance-none">
                      {campuses.map(c => <option key={c.campusId} value={c.campusId} className="bg-[#0D0D0D]">{c.campusName}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-30" size={12} />
                  </div>
                  <div className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border ${theme.input}`}>
                    <Filter size={14} className="text-primary shrink-0" />
                    <select value={selectedBranchId} onChange={(e) => { setSelectedBranchId(e.target.value); fetchAccounts(e.target.value); }} className="bg-transparent font-black text-[10px] uppercase outline-none cursor-pointer pr-6 appearance-none">
                      {filteredBranches.map(b => <option key={b.id} value={b.id} className="bg-[#0D0D0D]">{b.boardName} ({b.mediumName})</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-30" size={12} />
                  </div>
                </div>
                <button onClick={() => setIsCreating(true)} className="bg-primary text-white px-8 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                  <Plus size={18} /> Add Account
                </button>
              </div>

              {/* --- TABLE REGISTRY --- */}
              <div className={cardClass}>
                <div className="p-6 border-b border-white/5 bg-primary/5 flex justify-between items-center">
                  <h3 className="font-black uppercase text-[10px] tracking-widest opacity-70 italic">Financial Registry</h3>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                     <span className="text-[8px] font-black uppercase opacity-40 tracking-[0.2em]">Live Stream</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`${theme.tableHeader} text-[9px] font-black uppercase text-slate-500 tracking-widest`}>
                        <th className="px-8 py-6">Identity & Bank</th>
                        <th className="px-8 py-6">Account Details</th>
                        <th className="px-8 py-6">IFSC Code</th>
                        <th className="px-8 py-6 text-right">Status Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading.fetch ? (
                        <tr><td colSpan={4} className="py-24 text-center"><Loader2 className="animate-spin inline-block text-primary" size={40} /></td></tr>
                      ) : accounts.length === 0 ? (
                        <tr><td colSpan={4} className="py-24 text-center opacity-30 font-black uppercase text-[10px] tracking-widest italic">No matching registry found in terminal</td></tr>
                      ) : (
                        accounts.map((acc) => (
                          <tr key={acc.id} className={`transition-colors group ${theme.rowHover}`}>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-inner group-hover:rotate-6 transition-transform"><Landmark size={20} /></div>
                                <div>
                                  <p className="font-black text-[11px] uppercase tracking-tight">{acc.accountName}</p>
                                  <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-0.5">{acc.bankName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="font-mono text-[11px] font-black tracking-tighter text-primary bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10 italic">
                                {acc.accountNumber}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest border border-white/5 ${isDark ? "bg-white/5" : "bg-slate-100"}`}>
                                {acc.ifscCode}
                              </span>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <button onClick={() => handleToggleClick(acc)} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all active:scale-95 ${acc.active ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10" : "border-rose-500/20 text-rose-500 bg-rose-500/5 hover:bg-rose-500/10"}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${acc.active ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                                {acc.active ? "Active" : "Inactive"}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- INFORMATION PANEL --- */}
        {showInfo && (
          <aside className="lg:col-span-4 animate-in slide-in-from-right-4 duration-500">
            <div className={`${cardClass} p-8 sticky top-10`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg"><HelpCircle className="text-primary" size={20} /></div>
                <h4 className="font-black uppercase text-xs tracking-widest italic">Treasury Guide</h4>
              </div>
              <div className="space-y-6">
                <div>
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2">Banking Framework</h5>
                  <p className="text-xs leading-relaxed opacity-60">Manage your institution's collection points. Accounts registered here are used for **Fee Collection** and **Bank Reconciliation**.</p>
                </div>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2 flex items-center gap-2"><ShieldCheck size={12} /> Verification</h5>
                  <p className="text-[10px] leading-relaxed opacity-70 italic">Always verify the **IFSC Code** and **Account Number** to prevent settlement failures.</p>
                </div>
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase opacity-40 px-1 italic">Protocol Checklist</h5>
                  {[
                    { t: 'Branch Context', d: 'Associate accounts with specific Boards/Mediums for clean accounting.' },
                    { t: 'Status Control', d: 'Disable old accounts to prevent new collections while keeping history.' }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-tight">{item.t}</p>
                        <p className="text-[10px] opacity-40 leading-tight">{item.d}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowInfo(false)} className="w-full py-3 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all hover:bg-white/5">Dismiss Panel</button>
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
};

export default BankManager;