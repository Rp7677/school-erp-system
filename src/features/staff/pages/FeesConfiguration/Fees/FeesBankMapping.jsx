import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { 
  Link2, Landmark, Building2, Tag, Plus, Search, 
  Loader2, Power, PowerOff, ArrowLeft, LayoutGrid, 
  List, Filter, CheckCircle2, AlertCircle, RefreshCcw, 
  MapPin, Info, HelpCircle, ShieldAlert, Save, XCircle,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  Fingerprint, ShieldCheck, ChevronDown
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import api from "../../../../../config/api"; 
import AutoBreadcrumb from "../../../../../components/common/AutoBreadcrumb";

const FeeBankMapping = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  const { campuses } = useSelector((state) => state.campus);

  // --- STATE ---
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState({ fetch: false, process: false });
  const [showInfo, setShowInfo] = useState(false);

  const [branches, setBranches] = useState([]);
  const [feeHeads, setFeeHeads] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [mappings, setMappings] = useState([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Hierarchical Selection State
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  
  const [formData, setFormData] = useState({
    feeHeadId: "",
    bankAccountId: ""
  });

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({ 
    show: false, 
    actionType: "", // CREATE, TOGGLE_STATUS
    data: null 
  });

  // --- THEME ---
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

  // --- DATA FETCHING ---
  const initData = useCallback(async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const [branchRes, feeHeadRes] = await Promise.all([
        api.get("/api/branches"),
        api.get("/api/fees/heads")
      ]);
      setBranches(branchRes.data || []);
      setFeeHeads(feeHeadRes.data || []);
      if (campuses?.length > 0) setSelectedCampusId(campuses[0].campusId.toString());
    } catch (err) {
      toast.error("Error initializing configuration data");
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, [campuses]);

  const fetchBranchContextData = useCallback(async (branchId) => {
    if (!branchId) return;
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const [bankRes, mappingRes] = await Promise.all([
        api.get(`/api/fees/bank-accounts/branch/${branchId}`),
        api.get(`/api/fees/branch-fee-head-mapping/branch/${branchId}`)
      ]);
      setBankAccounts(bankRes.data || []);
      setMappings(mappingRes.data || []);
    } catch (err) {
      setMappings([]);
      setBankAccounts([]);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, []);

  useEffect(() => { initData(); }, [initData]);

  const filteredBranches = useMemo(() => {
    if (!selectedCampusId) return [];
    return branches.filter(b => b.campusId.toString() === selectedCampusId.toString());
  }, [branches, selectedCampusId]);

  useEffect(() => {
    if (filteredBranches.length > 0) {
      const firstBranchId = filteredBranches[0].id.toString();
      setSelectedBranchId(firstBranchId);
    } else {
      setSelectedBranchId("");
      setMappings([]);
      setBankAccounts([]);
    }
  }, [filteredBranches]);

  useEffect(() => {
    if (selectedBranchId) fetchBranchContextData(selectedBranchId);
  }, [selectedBranchId, fetchBranchContextData]);

  // --- PAGINATION LOGIC ---
  const totalPages = Math.ceil(mappings.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return mappings.slice(start, start + itemsPerPage);
  }, [mappings, currentPage]);

  // --- CRUD TRIGGERS ---
  const handleCreateTrigger = (e) => {
    e.preventDefault();
    if (!selectedBranchId || !formData.feeHeadId || !formData.bankAccountId) return toast.error("Complete all fields");
    setConfirmModal({ show: true, actionType: "CREATE", data: formData });
  };

  const handleToggleTrigger = (map) => {
    setConfirmModal({ show: true, actionType: "TOGGLE_STATUS", data: map });
  };

  const executeOperation = async () => {
    const { actionType, data } = confirmModal;
    setConfirmModal({ show: false, actionType: "", data: null });
    setLoading(prev => ({ ...prev, process: true }));

    try {
      if (actionType === "CREATE") {
        const payload = {
          branchId: parseInt(selectedBranchId),
          feeHeadId: parseInt(data.feeHeadId),
          bankAccountId: parseInt(data.bankAccountId)
        };
        await api.post("/api/fees/branch-fee-head-mapping", payload);
        toast.success("Mapping Established Successfully");
        setIsCreating(false);
        setFormData({ feeHeadId: "", bankAccountId: "" });
      } 
      else if (actionType === "TOGGLE_STATUS") {
        await api.patch(`/api/fees/branch-fee-head-mapping/${data.id}/status`, { active: !data.active });
        toast.success("Mapping Status Updated");
      }
      fetchBranchContextData(selectedBranchId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(prev => ({ ...prev, process: false }));
    }
  };

  const getFeeHeadName = (id) => feeHeads.find(f => f.id === id)?.name || `ID: ${id}`;
  const getBankName = (id) => bankAccounts.find(b => b.id === id)?.accountName || `Bank ID: ${id}`;

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
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Financial Mapping Protocol</p>
              </div>
            </div>
            <p className="text-sm font-medium opacity-80 mb-8 leading-relaxed">
              Are you sure you want to proceed with <span className="text-primary font-black">{confirmModal.actionType}</span>? 
              This will update the global fee distribution ledger for this branch.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal({ show: false })} className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={executeOperation} className="flex-1 h-12 rounded-xl text-white font-black uppercase text-[10px] bg-primary shadow-lg shadow-primary/20 transition-all">Proceed</button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20 rotate-3">
            <Link2 className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase">Fee <span className="text-primary not-italic">Mapping</span></h1>
            <div className="flex items-center gap-2 opacity-50">
              <Fingerprint size={12} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Branch-Bank Bridging Terminal</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowInfo(!showInfo)} className={`p-3 rounded-xl border transition-all ${showInfo ? 'bg-primary/10 border-primary text-primary' : 'opacity-50 ' + theme.panel}`}>
            <Info size={20} />
          </button>
          <div className={`px-6 py-3 rounded-2xl border text-center ${theme.panel}`}>
            <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Total Bridges</p>
            <p className="text-sm font-black">{mappings.length}</p>
          </div>
        </div>
      </header>

      {/* remove form main class max-w-7xl */}
      <main className="mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`${showInfo ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-500 space-y-8`}>
          <AutoBreadcrumb />

          {isCreating ? (
            <div className={`${cardClass} animate-in slide-in-from-top-4`}>
              <div className="p-8 border-b border-white/5 bg-primary/5 flex justify-between items-center">
                <h2 className="text-xl font-black italic uppercase tracking-tighter">New Mapping Bridge</h2>
                <button onClick={() => setIsCreating(false)} className="opacity-40 hover:opacity-100 transition-transform active:scale-90"><XCircle size={20}/></button>
              </div>
              
              <form onSubmit={handleCreateTrigger} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Campus Context</label>
                  <div className="relative">
                    <select className={`w-full h-14 px-4 rounded-xl font-black text-xs border outline-none ${theme.select}`} value={selectedCampusId} onChange={(e) => setSelectedCampusId(e.target.value)}>
                      {campuses.map(c => <option key={c.campusId} value={c.campusId} className="bg-[#0D0D0D]">{c.campusName}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={16} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Branch Target</label>
                  <div className="relative">
                    <select className={`w-full h-14 px-4 rounded-xl font-black text-xs border outline-none ${theme.select}`} value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value)}>
                      {filteredBranches.map(b => <option key={b.id} value={b.id} className="bg-[#0D0D0D]">{b.boardName} — {b.mediumName}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={16} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2"><Tag size={10}/> Fee Component</label>
                  <div className="relative">
                    <select required className={`w-full h-14 px-4 rounded-xl font-black text-xs border outline-none ${theme.select}`} value={formData.feeHeadId} onChange={(e) => setFormData({...formData, feeHeadId: e.target.value})}>
                      <option value="" className="bg-[#0D0D0D]">Choose Fee Head...</option>
                      {feeHeads.map(h => <option key={h.id} value={h.id} className="bg-[#0D0D0D]">{h.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={16} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2"><Landmark size={10}/> Destination Bank</label>
                  <div className="relative">
                    <select required disabled={bankAccounts.length === 0} className={`w-full h-14 px-4 rounded-xl font-black text-xs border outline-none ${theme.select}`} value={formData.bankAccountId} onChange={(e) => setFormData({...formData, bankAccountId: e.target.value})}>
                      <option value="" className="bg-[#0D0D0D]">{bankAccounts.length > 0 ? "Choose Target Account..." : "No Banks in this Branch"}</option>
                      {bankAccounts.map(b => <option key={b.id} value={b.id} className="bg-[#0D0D0D]">{b.accountName} — {b.accountNumber}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" size={16} />
                  </div>
                </div>

                <div className="md:col-span-2 flex gap-3 mt-4">
                  <button type="submit" disabled={loading.process || !selectedBranchId} className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                    {loading.process ? <Loader2 className="animate-spin" /> : <Save size={18} />} Finalize Bridge
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
                    <select value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value)} className="bg-transparent font-black text-[10px] uppercase outline-none cursor-pointer pr-6 appearance-none">
                      {filteredBranches.map(b => <option key={b.id} value={b.id} className="bg-[#0D0D0D]">{b.boardName} ({b.mediumName})</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-30" size={12} />
                  </div>
                </div>
                <button onClick={() => setIsCreating(true)} className="bg-primary text-white px-8 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                  <Plus size={18} /> New Bridge
                </button>
              </div>

              {/* --- REGISTRY TABLE --- */}
              <div className={cardClass}>
                <div className="p-6 border-b border-white/5 bg-primary/5 flex justify-between items-center">
                  <h3 className="font-black uppercase text-[10px] tracking-widest opacity-70 italic">Mapping Registry</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className={`${theme.tableHeader} text-[9px] font-black uppercase text-slate-500 tracking-widest`}>
                        <th className="px-8 py-6">Fee Component</th>
                        <th className="px-8 py-6">Destination Bank</th>
                        <th className="px-8 py-6">Status</th>
                        <th className="px-8 py-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {loading.fetch ? (
                        <tr><td colSpan={4} className="py-24 text-center"><Loader2 className="animate-spin inline-block text-primary" size={40} /></td></tr>
                      ) : paginatedData.length === 0 ? (
                        <tr><td colSpan={4} className="py-24 text-center opacity-30 font-black uppercase text-[10px] tracking-widest italic">No mapping bridges found for this branch</td></tr>
                      ) : (
                        paginatedData.map((map) => (
                          <tr key={map.id} className={`transition-colors group ${theme.rowHover}`}>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-xl text-primary shadow-inner"><Tag size={18} /></div>
                                <span className="font-black text-[11px] uppercase tracking-tight">{getFeeHeadName(map.feeHeadId)}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/5 rounded-xl text-slate-500"><Landmark size={18} /></div>
                                <span className="font-bold text-[11px] uppercase opacity-80">{getBankName(map.bankAccountId)}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <button onClick={() => handleToggleTrigger(map)} className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all active:scale-95 ${map.active ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : "border-rose-500/20 text-rose-500 bg-rose-500/5"}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${map.active ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                                {map.active ? "Active" : "Inactive"}
                              </button>
                            </td>
                            <td className="px-8 py-6 text-right">
                              <span className="text-[10px] font-black opacity-20 uppercase tracking-widest">#{map.id}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* --- PAGINATION --- */}
                {mappings.length > 0 && (
                  <div className="p-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] font-black uppercase opacity-40 tracking-widest">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, mappings.length)} of {mappings.length}
                    </p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded-lg border border-white/5 hover:bg-primary/10 disabled:opacity-20 transition-all"><ChevronsLeft size={16} /></button>
                      <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-white/5 hover:bg-primary/10 disabled:opacity-20 transition-all"><ChevronLeft size={16} /></button>
                      <div className="flex items-center gap-1 mx-2">
                        {[...Array(totalPages)].map((_, i) => (
                          <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-primary text-white' : 'hover:bg-white/5 opacity-50'}`}>{i + 1}</button>
                        ))}
                      </div>
                      <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-white/5 hover:bg-primary/10 disabled:opacity-20 transition-all"><ChevronRight size={16} /></button>
                      <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-white/5 hover:bg-primary/10 disabled:opacity-20 transition-all"><ChevronsRight size={16} /></button>
                    </div>
                  </div>
                )}
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
                <h4 className="font-black uppercase text-xs tracking-widest italic">Mapping Terminal</h4>
              </div>
              <div className="space-y-6">
                <div>
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2">Bridge Logic</h5>
                  <p className="text-xs leading-relaxed opacity-60">
                    Establishing a mapping creates a bridge between a specific **Fee Head** and a **Bank Account**. All funds collected under that head for this branch will flow into the selected bank.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2 flex items-center gap-2"><ShieldCheck size={12} /> Compliance</h5>
                  <p className="text-[10px] leading-relaxed opacity-70 italic">Mappings ensure correct accounting entries during automatic bank reconciliation.</p>
                </div>
                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase opacity-40 px-1 italic">Protocol Checklist</h5>
                  {[
                    { t: 'Head Selection', d: 'Only heads mapped here will be available for fee structure generation.' },
                    { t: 'Target Bank', d: 'Ensure the selected bank is active and valid for the branch context.' }
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

export default FeeBankMapping;