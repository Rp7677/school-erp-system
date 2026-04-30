import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { 
  Building2, Landmark, Fingerprint, CreditCard, Plus, 
  Search, Loader2, Power, PowerOff, Wallet, 
  ShieldCheck, Banknote, List, LayoutGrid, ArrowLeft,
  Filter, ChevronDown, CheckCircle2
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import api from "../../../../config/api"; 
import AutoBreadcrumb from "../../../../components/common/AutoBreadcrumb";

const BankManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");

  // --- STATE MANAGEMENT ---
  const [viewMode, setViewMode] = useState("table"); 
  const [isCreating, setIsCreating] = useState(false);
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState({ fetch: false, process: false });

  const [formData, setFormData] = useState({
    accountName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: ""
  });

  // --- STYLING CONSTANTS ---
  const cardClass = `rounded-[2.5rem] border shadow-2xl transition-all duration-300 ${isDark ? "bg-[#1A1A1A] border-white/5 shadow-black/40" : "bg-white border-gray-100 shadow-gray-200/50"}`;
  const inputClass = `w-full px-6 py-4 rounded-2xl border outline-none transition-all font-semibold ${isDark ? "bg-[#242424] border-white/10 text-white focus:border-primary/50" : "bg-gray-50 border-gray-200 focus:border-primary"}`;

  // --- API LOGIC ---

  const fetchBranches = useCallback(async () => {
    try {
      const res = await api.get("/api/branches");
      setBranches(res.data || []);
    } catch (err) {
      toast.error("Failed to load branches");
    }
  }, []);

  const fetchAccounts = useCallback(async (branchId) => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      // If branchId is provided, filter; otherwise, fetch a default or handle accordingly
      const url = branchId 
        ? `/api/fees/bank-accounts/branch/${branchId}`
        : `/api/fees/bank-accounts/branch/${branches[0]?.id}`; // Default to first branch if exists
      
      if(!branchId && branches.length === 0) return;

      const res = await api.get(url);
      setAccounts(res.data || []);
    } catch (err) {
      console.error("Fetch error", err);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, [branches]);

  useEffect(() => { fetchBranches(); }, [fetchBranches]);

  useEffect(() => {
    if (branches.length > 0 && !selectedBranchId) {
        setSelectedBranchId(branches[0].id.toString());
        fetchAccounts(branches[0].id);
    }
  }, [branches, selectedBranchId, fetchAccounts]);

  const handleBranchChange = (e) => {
    const id = e.target.value;
    setSelectedBranchId(id);
    fetchAccounts(id);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    if (!selectedBranchId) return toast.error("Please select a branch context");
    
    setLoading(prev => ({ ...prev, process: true }));
    try {
      const payload = { ...formData, branchId: parseInt(selectedBranchId) };
      await api.post("/api/fees/bank-accounts", payload);
      toast.success("Bank Account Registered!");
      setFormData({ accountName: "", accountNumber: "", ifscCode: "", bankName: "" });
      setIsCreating(false);
      fetchAccounts(selectedBranchId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Creation failed");
    } finally {
      setLoading(prev => ({ ...prev, process: false }));
    }
  };

  const toggleStatus = async (accountId, currentStatus) => {
    setLoading(prev => ({ ...prev, process: true }));
    try {
      await api.patch(`/api/fees/bank-accounts/${accountId}/status`, {
        active: !currentStatus
      });
      toast.success("Status Updated");
      fetchAccounts(selectedBranchId);
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setLoading(prev => ({ ...prev, process: false }));
    }
  };

  return (
    <div className={`min-h-screen p-6 max-w-7xl mx-auto space-y-8 pb-20 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
      <Toaster position="top-right" />

      {isCreating ? (
        /* --- CREATION UI --- */
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <button onClick={() => setIsCreating(false)} className="group flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary mb-8 ml-4 transition-all">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Registry
          </button>
          
          <div className={`${cardClass} p-12 max-w-3xl mx-auto border-t-4 border-t-primary`}>
            <div className="flex items-center gap-6 mb-12">
              <div className="p-5 bg-primary/10 rounded-[2rem] text-primary shadow-inner"><Landmark size={38} /></div>
              <div>
                <h2 className="text-3xl font-black tracking-tight">Add Bank Account</h2>
                <p className="text-gray-500 font-medium">Link a new financial gateway for this branch</p>
              </div>
            </div>

            <form onSubmit={handleCreateAccount} className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="md:col-span-2 space-y-3">
                <label className="text-[11px] font-black text-primary uppercase tracking-[0.2em] ml-2">Context Branch</label>
                <select className={inputClass} value={selectedBranchId} onChange={handleBranchChange}>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.campusName} — {b.mediumName}</option>)}
                </select>
              </div>

              {[
                { label: "Account Holder Name", icon: Wallet, key: "accountName", placeholder: "PPSU KNOWLEDGE CENTER" },
                { label: "Bank Name", icon: Building2, key: "bankName", placeholder: "Bank of Baroda" },
                { label: "Account Number", icon: CreditCard, key: "accountNumber", placeholder: "BOB123456" },
                { label: "IFSC Code", icon: ShieldCheck, key: "ifscCode", placeholder: "BOB0000123" }
              ].map((input) => (
                <div key={input.key} className="space-y-3">
                  <label className="text-[11px] font-black text-primary uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <input.icon size={12}/> {input.label}
                  </label>
                  <input
                    required
                    className={inputClass}
                    placeholder={input.placeholder}
                    value={formData[input.key]}
                    onChange={(e) => setFormData({...formData, [input.key]: e.target.value.toUpperCase()})}
                  />
                </div>
              ))}

              <div className="md:col-span-2 mt-8 flex flex-col sm:flex-row gap-4">
                <button type="submit" disabled={loading.process} className="flex-[2] py-5 rounded-[1.5rem] bg-primary text-white font-black shadow-lg shadow-primary/40 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  {loading.process ? <Loader2 className="animate-spin" /> : <><Plus size={22}/> Save Account</>}
                </button>
                <button type="button" onClick={() => setIsCreating(false)} className={`flex-1 py-5 rounded-[1.5rem] font-bold transition-all ${isDark ? "bg-white/5 text-gray-400 hover:bg-white/10" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* --- LISTING UI --- */
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
            <div>
              <h1 className="text-4xl font-black tracking-tighter">Bank Accounts</h1>
              <p className="text-gray-500 font-bold uppercase tracking-[0.15em] text-[10px] mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Financial Node Management • {accounts.length} Accounts
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Branch Filter Dropdown */}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200"}`}>
                <Filter size={16} className="text-primary" />
                <select 
                  value={selectedBranchId} 
                  onChange={handleBranchChange}
                  className="bg-transparent font-black text-[11px] uppercase tracking-wider outline-none cursor-pointer min-w-[150px]"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id} className={isDark ? "bg-[#1A1A1A]" : "bg-white"}>
                      {b.campusName} — {b.mediumName}
                    </option>
                  ))}
                </select>
              </div>

              <div className={`flex p-1 rounded-2xl ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-primary text-white shadow-md" : "text-gray-400"}`}><LayoutGrid size={20} /></button>
                <button onClick={() => setViewMode("table")} className={`p-2.5 rounded-xl transition-all ${viewMode === "table" ? "bg-primary text-white shadow-md" : "text-gray-400"}`}><List size={20} /></button>
              </div>

              <button onClick={() => setIsCreating(true)} className="group bg-primary text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-3 shadow-2xl shadow-primary/40 hover:scale-[1.03] active:scale-95 transition-all">
                <Plus size={20} /> <span>Add Account</span>
              </button>
            </div>
          </div>

          {loading.fetch ? (
            <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-primary" size={60} /></div>
          ) : accounts.length > 0 ? (
            viewMode === "grid" ? (
              /* GRID VIEW */
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {accounts.map((acc) => (
                  <div key={acc.id} className={`${cardClass} overflow-hidden group hover:border-primary/30`}>
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-primary/10 rounded-2xl text-primary"><Landmark size={24}/></div>
                        <button 
                          onClick={() => toggleStatus(acc.id, acc.active)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black transition-all ${acc.active ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                        >
                          {acc.active ? <><CheckCircle2 size={12}/> ACTIVE</> : <><PowerOff size={12}/> INACTIVE</>}
                        </button>
                      </div>
                      
                      <div className="space-y-1 mb-6">
                        <h3 className="font-black text-xl tracking-tight uppercase truncate">{acc.accountName}</h3>
                        <p className="text-gray-500 font-bold text-xs flex items-center gap-2 tracking-wider">
                          {acc.bankName}
                        </p>
                      </div>

                      <div className={`p-5 rounded-2xl border border-dashed ${isDark ? "border-white/10 bg-white/[0.02]" : "border-gray-200 bg-gray-50"}`}>
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-[9px] font-black opacity-40 uppercase">Acc Number</span>
                           <span className="text-xs font-bold tracking-widest">{acc.accountNumber}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-[9px] font-black opacity-40 uppercase">IFSC Code</span>
                           <span className="text-xs font-bold tracking-widest">{acc.ifscCode}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* TABLE VIEW */
              <div className={`${cardClass} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className={`${isDark ? "bg-white/5" : "bg-gray-50"} border-b border-white/5`}>
                      <tr>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-primary">Bank & Account Name</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-primary">Account Details</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-primary">IFSC</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-primary text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {accounts.map((acc) => (
                        <tr key={acc.id} className="hover:bg-primary/[0.02] transition-colors group">
                          <td className="p-8">
                            <p className="font-black text-sm uppercase">{acc.accountName}</p>
                            <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1 mt-1">{acc.bankName}</p>
                          </td>
                          <td className="p-8 font-mono text-sm font-bold tracking-tighter">
                            {acc.accountNumber}
                          </td>
                          <td className="p-8">
                            <span className={`px-3 py-1 rounded-md text-[10px] font-black tracking-widest ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                                {acc.ifscCode}
                            </span>
                          </td>
                          <td className="p-8 text-center">
                            <button 
                                onClick={() => toggleStatus(acc.id, acc.active)}
                                className={`group/btn relative inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all 
                                    ${acc.active 
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white" 
                                        : "bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white"}`}
                            >
                                {acc.active ? "Active" : "Inactive"}
                                {acc.active ? <Power size={14}/> : <PowerOff size={14}/>}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          ) : (
            /* EMPTY STATE */
            <div className="py-32 flex flex-col items-center justify-center text-center opacity-30">
              <Fingerprint size={80} strokeWidth={1} />
              <h3 className="text-xl font-black mt-4 uppercase tracking-[0.3em]">No Registry Found</h3>
              <p className="font-medium text-sm">Initialize your first bank account for this branch context.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BankManager;