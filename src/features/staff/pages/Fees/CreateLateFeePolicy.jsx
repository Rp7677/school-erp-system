import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import api from "../../../../config/api"; 
import { 
  Plus, Search, Edit3, Loader2, Filter, Percent, 
  CalendarClock, Banknote, AlertCircle, ChevronDown, 
  ChevronLeft, ChevronRight, ArrowLeft
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const LateFeePolicyManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState({ fetch: true, save: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false); // Toggle between List and Form
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const selectRef = useRef(null);
  
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    calculationType: "PER_DAY", 
    value: "", 
    graceDays: "", 
    maxCap: "" 
  });

  const ENDPOINT = "/api/late-fee-policies";

  const calcOptions = [
    { id: "PER_DAY", label: "PER DAY (Fixed)", icon: <CalendarClock size={18}/> },
    { id: "PERCENTAGE", label: "PERCENTAGE (%)", icon: <Percent size={18}/> },
    { id: "FIXED", label: "ONE TIME FIXED", icon: <Banknote size={18}/> },
  ];

  useEffect(() => {
    fetchPolicies();
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) setIsSelectOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPolicies = async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const response = await api.get(ENDPOINT);
      setPolicies(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Failed to load policies");
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, save: true }));
    
    const payload = {
      ...formData,
      name: formData.name.toUpperCase().trim(),
      value: parseFloat(formData.value),
      graceDays: parseInt(formData.graceDays),
      maxCap: formData.maxCap && formData.maxCap > 0 ? parseFloat(formData.maxCap) : null
    };

    try {
      if (editId) {
        const res = await api.put(`${ENDPOINT}/${editId}`, payload);
        toast.success("Policy updated");
        setPolicies(prev => prev.map(p => p.id === editId ? res.data : p));
      } else {
        const res = await api.post(ENDPOINT, payload);
        toast.success("Policy created");
        setPolicies(prev => [res.data, ...prev]);
      }
      handleBackToList();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const handleBackToList = () => {
    setFormData({ name: "", calculationType: "PER_DAY", value: "", graceDays: "", maxCap: "" });
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (policy) => {
    setEditId(policy.id);
    setFormData({
      name: policy.name,
      calculationType: policy.calculationType,
      value: policy.value,
      graceDays: policy.graceDays,
      maxCap: policy.maxCap || ""
    });
    setShowForm(true);
  };

  const getCalcIcon = (type) => {
    switch(type) {
      case "PERCENTAGE": return <Percent size={20}/>;
      case "PER_DAY": return <CalendarClock size={20}/>;
      default: return <Banknote size={20}/>;
    }
  };

  // Search & Pagination Logic
  const filteredPolicies = policies.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPolicies.length / itemsPerPage);
  const paginatedData = filteredPolicies.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Theme Constants
  const cardClass = `rounded-[2.5rem] border shadow-2xl transition-all duration-300 ${isDark ? "bg-[#1A1A1A] border-white/5 shadow-black/40" : "bg-white border-gray-100 shadow-gray-200/50"}`;
  const inputClass = `w-full px-6 py-4 rounded-2xl border outline-none transition-all font-semibold ${isDark ? "bg-[#242424] border-white/10 text-white focus:border-primary/50" : "bg-gray-50 border-gray-200 focus:border-primary"}`;
  const customSelectBtn = `w-full px-6 py-4 rounded-2xl border outline-none transition-all font-black flex items-center justify-between ${isDark ? "bg-[#242424] border-white/10 text-white" : "bg-gray-50 border-gray-200 text-gray-800"}`;

  return (
    <div className={`min-h-screen p-6 max-w-7xl mx-auto space-y-8 pb-20 transition-colors duration-500 ${isDark ? "bg-[#0F0F0F] text-gray-100" : "bg-gray-50/50 text-gray-800"}`}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">
            {showForm ? (editId ? "Edit Policy" : "New Policy") : "Late Fee Policies"}
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.15em] text-[10px] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {showForm ? "Configure penalty rules" : `Managing ${policies.length} Active Rules`}
          </p>
        </div>

        {!showForm && (
          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:w-64 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
                className={`pl-12 pr-4 py-3 rounded-xl border border-transparent outline-none w-full font-bold transition-all ${isDark ? "bg-white/5 focus:bg-white/10 text-white" : "bg-white shadow-sm ring-1 ring-gray-200 text-gray-800"}`} />
            </div>
            <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform">
              <Plus size={18} /> Create Policy
            </button>
          </div>
        )}
      </div>

      {showForm ? (
        /* FORM VIEW */
        <div className="max-w-2xl mx-auto">
           <button onClick={handleBackToList} className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors">
            <ArrowLeft size={16}/> Back to List
          </button>
          
          <div className={`${cardClass} p-10 border-t-8 border-t-primary`}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1 mb-2 block">Policy Name</label>
                <input placeholder="e.g. OVERDUE_LEVEL_1" className={inputClass} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>

              <div className="relative" ref={selectRef}>
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1 mb-2 block">Calculation Method</label>
                <button type="button" onClick={() => setIsSelectOpen(!isSelectOpen)} className={customSelectBtn}>
                  <div className="flex items-center gap-3">
                    <span className="text-primary">{calcOptions.find(o => o.id === formData.calculationType)?.icon}</span>
                    <span>{calcOptions.find(o => o.id === formData.calculationType)?.label}</span>
                  </div>
                  <ChevronDown size={18} className={`transition-transform ${isSelectOpen ? "rotate-180" : ""}`} />
                </button>
                {isSelectOpen && (
                  <div className={`absolute z-50 w-full mt-2 p-2 rounded-2xl shadow-2xl border ${isDark ? "bg-[#242424] border-white/10" : "bg-white border-gray-100"}`}>
                    {calcOptions.map((opt) => (
                      <button key={opt.id} type="button" 
                        onClick={() => { setFormData({...formData, calculationType: opt.id}); setIsSelectOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors ${formData.calculationType === opt.id ? "bg-primary text-white" : isDark ? "hover:bg-white/5 text-gray-300" : "hover:bg-gray-50 text-gray-700"}`}>
                        {opt.icon} {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1 mb-2 block">Fee Value</label>
                  <input type="number" step="0.01" className={inputClass} value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} required />
                </div>
                <div>
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1 mb-2 block">Grace Period (Days)</label>
                  <input type="number" className={inputClass} value={formData.graceDays} onChange={(e) => setFormData({...formData, graceDays: e.target.value})} required />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1 mb-2 block">Maximum Cap (Optional)</label>
                <input type="number" placeholder="Unlimited" className={inputClass} value={formData.maxCap} onChange={(e) => setFormData({...formData, maxCap: e.target.value})} />
              </div>

              <button type="submit" disabled={loading.save} className="w-full py-5 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/30 hover:brightness-110 transition-all flex items-center justify-center gap-3">
                {loading.save ? <Loader2 className="animate-spin" /> : (editId ? "UPDATE POLICY" : "SAVE NEW POLICY")}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-6">
          <div className={`${cardClass} overflow-hidden`}>
            {loading.fetch ? (
               <div className="py-32 flex flex-col items-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
            ) : paginatedData.length === 0 ? (
               <div className="py-32 text-center opacity-40">
                 <Filter size={48} className="mx-auto mb-4" />
                 <h3 className="text-xl font-black italic uppercase">No Policies Found</h3>
               </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className={`${isDark ? "bg-white/5" : "bg-gray-50/80"}`}>
                    <tr>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary">Policy Name</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary">Calculation</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary">Limit/Cap</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
                    {paginatedData.map((p) => (
                      <tr key={p.id} className="hover:bg-primary/[0.02] transition-colors group">
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-primary/5"} text-primary`}>
                              {getCalcIcon(p.calculationType)}
                            </div>
                            <div>
                              <p className="font-black text-sm uppercase">{p.name}</p>
                              <p className="text-[10px] font-bold text-gray-500 uppercase mt-0.5">Grace: {p.graceDays} Days</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase ${isDark ? "bg-white/5 text-gray-300" : "bg-gray-100 text-gray-600"}`}>
                            {p.value} {p.calculationType === 'PERCENTAGE' ? '%' : 'Fixed'} / {p.calculationType.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-6">
                           <p className="text-xs font-black tracking-tight">{p.maxCap ? `₹${p.maxCap}` : "∞ NO LIMIT"}</p>
                        </td>
                        <td className="p-6 text-right">
                          <button onClick={() => handleEdit(p)} className="p-2 hover:text-primary transition-colors">
                            <Edit3 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                  className={`p-2 rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} disabled:opacity-30`}>
                  <ChevronLeft size={20}/>
                </button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                  className={`p-2 rounded-lg border ${isDark ? "border-white/10" : "border-gray-200"} disabled:opacity-30`}>
                  <ChevronRight size={20}/>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LateFeePolicyManager;