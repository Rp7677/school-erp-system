import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { 
  Link2, Landmark, Building2, Tag, Plus, Search, 
  Loader2, Power, PowerOff, ArrowLeft, LayoutGrid, 
  List, Filter, CheckCircle2, AlertCircle, RefreshCcw
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import api from "../../../../config/api"; 
import AutoBreadcrumb from "../../../../components/common/AutoBreadcrumb";

const FeeBankMapping = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");

  // --- STATE ---
  const [viewMode, setViewMode] = useState("table");
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState({ fetch: false, process: false });

  const [branches, setBranches] = useState([]);
  const [feeHeads, setFeeHeads] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [mappings, setMappings] = useState([]);

  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [formData, setFormData] = useState({
    feeHeadId: "",
    bankAccountId: ""
  });

  // --- STYLING ---
  const cardClass = `rounded-[2.5rem] border shadow-2xl transition-all duration-300 ${isDark ? "bg-[#1A1A1A] border-white/5 shadow-black/40" : "bg-white border-gray-100 shadow-gray-200/50"}`;
  const inputClass = `w-full px-6 py-4 rounded-2xl border outline-none transition-all font-semibold ${isDark ? "bg-[#242424] border-white/10 text-white focus:border-primary/50" : "bg-gray-50 border-gray-200 focus:border-primary"}`;

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
      
      if (branchRes.data?.length > 0) {
        setSelectedBranchId(branchRes.data[0].id.toString());
      }
    } catch (err) {
      toast.error("Error initializing configuration data");
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, []);

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
      console.error("Context fetch error", err);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, []);

  useEffect(() => { initData(); }, [initData]);

  useEffect(() => {
    if (selectedBranchId) fetchBranchContextData(selectedBranchId);
  }, [selectedBranchId, fetchBranchContextData]);

  // --- ACTIONS ---

  const handleCreateMapping = async (e) => {
    e.preventDefault();
    if (!selectedBranchId || !formData.feeHeadId || !formData.bankAccountId) {
      return toast.error("Complete all selection fields");
    }

    setLoading(prev => ({ ...prev, process: true }));
    try {
      const payload = {
        branchId: parseInt(selectedBranchId),
        feeHeadId: parseInt(formData.feeHeadId),
        bankAccountId: parseInt(formData.bankAccountId)
      };
      await api.post("/api/fees/branch-fee-head-mapping", payload);
      toast.success("Fee Head Mapped Successfully");
      setIsCreating(false);
      fetchBranchContextData(selectedBranchId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Mapping failed (Check if already exists)");
    } finally {
      setLoading(prev => ({ ...prev, process: false }));
    }
  };

  const toggleMappingStatus = async (id, currentStatus) => {
    setLoading(prev => ({ ...prev, process: true }));
    try {
      await api.patch(`/api/fees/branch-fee-head-mapping/${id}/status`, {
        active: !currentStatus
      });
      toast.success("Mapping status updated");
      fetchBranchContextData(selectedBranchId);
    } catch (err) {
      toast.error("Toggle failed");
    } finally {
      setLoading(prev => ({ ...prev, process: false }));
    }
  };

  // Helper to find names from IDs
  const getFeeHeadName = (id) => feeHeads.find(f => f.id === id)?.name || `ID: ${id}`;
  const getBankName = (id) => bankAccounts.find(b => b.id === id)?.accountName || `Bank ID: ${id}`;

  return (
    <div className={`min-h-screen p-6 max-w-7xl mx-auto space-y-8 pb-20 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
      <Toaster position="top-right" />

      {isCreating ? (
        /* --- CREATE MAPPING --- */
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <button onClick={() => setIsCreating(false)} className="group flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary mb-8 ml-4 transition-all">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Mapping List
          </button>
          
          <div className={`${cardClass} p-12 max-w-3xl mx-auto border-t-4 border-t-primary`}>
            <div className="flex items-center gap-6 mb-12">
              <div className="p-5 bg-primary/10 rounded-[2rem] text-primary shadow-inner"><Link2 size={38} /></div>
              <div>
                <h2 className="text-3xl font-black tracking-tight">New Fee Mapping</h2>
                <p className="text-gray-500 font-medium">Link specific fees to destination bank accounts</p>
              </div>
            </div>

            <form onSubmit={handleCreateMapping} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-primary uppercase tracking-[0.2em] ml-2">Context Branch</label>
                <select className={inputClass} value={selectedBranchId} onChange={(e) => setSelectedBranchId(e.target.value)}>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.campusName} — {b.mediumName}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-primary uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <Tag size={12}/> Select Fee Head
                  </label>
                  <select 
                    className={inputClass} 
                    value={formData.feeHeadId} 
                    onChange={(e) => setFormData({...formData, feeHeadId: e.target.value})}
                  >
                    <option value="">Choose Head...</option>
                    {feeHeads.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-primary uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <Landmark size={12}/> Target Bank Account
                  </label>
                  <select 
                    className={inputClass} 
                    value={formData.bankAccountId}
                    disabled={bankAccounts.length === 0}
                    onChange={(e) => setFormData({...formData, bankAccountId: e.target.value})}
                  >
                    <option value="">{bankAccounts.length > 0 ? "Choose Account..." : "No Accounts Found"}</option>
                    {bankAccounts.map(b => <option key={b.id} value={b.id}>{b.accountName} ({b.accountNumber})</option>)}
                  </select>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button type="submit" disabled={loading.process} className="flex-[2] py-5 rounded-[1.5rem] bg-primary text-white font-black shadow-lg shadow-primary/40 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  {loading.process ? <Loader2 className="animate-spin" /> : <><Plus size={22}/> Establish Mapping</>}
                </button>
                <button type="button" onClick={() => setIsCreating(false)} className={`flex-1 py-5 rounded-[1.5rem] font-bold transition-all ${isDark ? "bg-white/5 text-gray-400 hover:bg-white/10" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* --- LISTING --- */
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
            <div>
              <h1 className="text-4xl font-black tracking-tighter">Branch Mappings</h1>
              <p className="text-gray-500 font-bold uppercase tracking-[0.15em] text-[10px] mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Fee-to-Bank Bridge • {mappings.length} Active Mappings
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200"}`}>
                <Filter size={16} className="text-primary" />
                <select 
                  value={selectedBranchId} 
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="bg-transparent font-black text-[11px] uppercase tracking-wider outline-none cursor-pointer"
                >
                  {branches.map(b => <option key={b.id} value={b.id} className={isDark ? "bg-[#1A1A1A]" : "bg-white"}>{b.campusName} — {b.mediumName}</option>)}
                </select>
              </div>

              <div className={`flex p-1 rounded-2xl ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-primary text-white shadow-md" : "text-gray-400"}`}><LayoutGrid size={20} /></button>
                <button onClick={() => setViewMode("table")} className={`p-2.5 rounded-xl transition-all ${viewMode === "table" ? "bg-primary text-white shadow-md" : "text-gray-400"}`}><List size={20} /></button>
              </div>

              <button onClick={() => setIsCreating(true)} className="group bg-primary text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-3 shadow-2xl shadow-primary/40 hover:scale-[1.03] active:scale-95 transition-all">
                <Plus size={20} /> <span>New Mapping</span>
              </button>
            </div>
          </div>

          {loading.fetch ? (
            <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-primary" size={60} /></div>
          ) : mappings.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {mappings.map((map) => (
                  <div key={map.id} className={`${cardClass} overflow-hidden group`}>
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-primary/10 rounded-2xl text-primary"><Tag size={24}/></div>
                        <button 
                          onClick={() => toggleMappingStatus(map.id, map.active)}
                          className={`p-2.5 rounded-xl transition-all ${map.active ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}
                        >
                          {map.active ? <Power size={20} /> : <PowerOff size={20} />}
                        </button>
                      </div>
                      
                      <div className="space-y-2 mb-8">
                        <h3 className="font-black text-xl tracking-tight uppercase line-clamp-1">{getFeeHeadName(map.feeHeadId)}</h3>
                        <p className="text-gray-500 font-bold text-xs flex items-center gap-2 uppercase tracking-widest">
                          <Landmark size={14} className="text-primary"/> {getBankName(map.bankAccountId)}
                        </p>
                      </div>

                      <div className={`p-4 rounded-2xl flex items-center justify-between ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                        <span className="text-[10px] font-black opacity-40 uppercase">Mapping ID</span>
                        <span className="text-xs font-black">#00{map.id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`${cardClass} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className={`${isDark ? "bg-white/5" : "bg-gray-50"} border-b border-white/5`}>
                      <tr>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-primary">Fee Head Component</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-primary">Destination Bank Account</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-primary">Status</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-primary text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {mappings.map((map) => (
                        <tr key={map.id} className="hover:bg-primary/[0.02] transition-colors group">
                          <td className="p-8">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-primary/10 rounded-xl text-primary"><Tag size={16}/></div>
                              <span className="font-black text-sm uppercase">{getFeeHeadName(map.feeHeadId)}</span>
                            </div>
                          </td>
                          <td className="p-8">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-primary/10 rounded-xl text-primary"><Landmark size={16}/></div>
                              <span className="font-bold text-sm">{getBankName(map.bankAccountId)}</span>
                            </div>
                          </td>
                          <td className="p-8">
                            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${map.active ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${map.active ? "bg-emerald-500" : "bg-rose-500"} shadow-[0_0_8px_currentColor]`}/>
                              {map.active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-8 text-right">
                            <button 
                              onClick={() => toggleMappingStatus(map.id, map.active)}
                              className={`p-3 rounded-xl transition-all ${isDark ? "hover:bg-white/10" : "hover:bg-gray-100"}`}
                            >
                              {map.active ? <Power className="text-emerald-500" size={18}/> : <PowerOff className="text-rose-500" size={18}/>}
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
            <div className="py-32 flex flex-col items-center justify-center text-center opacity-30">
              <RefreshCcw size={80} strokeWidth={1} className="animate-spin-slow" />
              <h3 className="text-xl font-black mt-4 uppercase tracking-[0.3em]">No Mappings Active</h3>
              <p className="font-medium text-sm mt-2 italic">Select a different branch or establish a new bridge.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeeBankMapping;