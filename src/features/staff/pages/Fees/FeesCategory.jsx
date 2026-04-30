import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../config/api"; 
import { 
  Wallet, Plus, Search, 
  Bus, GraduationCap, Home, Coffee, 
  Edit3, ShieldCheck,
  Loader2, XCircle, Filter
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const FeesCategoryManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState({ fetch: true, save: false });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'active', 'inactive'
  
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: "", code: "" });

  const ENDPOINT = "/api/fee-categories";
  const getAllCategories = "/api/fee-categories/all";

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const response = await api.get(getAllCategories);
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, save: true }));
    
    const payload = {
      code: formData.code.toUpperCase().trim(),
      name: formData.name.trim()
    };

    try {
      if (editId) {
        const res = await api.put(`${ENDPOINT}/${editId}`, payload);
        toast.success("Updated successfully");
        setCategories(prev => prev.map(cat => cat.id === editId ? res.data : cat));
      } else {
        const res = await api.post(ENDPOINT, payload);
        toast.success("Created successfully");
        setCategories(prev => [res.data, ...prev]);
      }
      
      setFormData({ name: "", code: "" });
      setEditId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    setCategories(prev => prev.map(cat => 
      cat.id === id ? { ...cat, isActive: newStatus } : cat
    ));

    try {
      await api.patch(`${ENDPOINT}/${id}/status?isActive=${newStatus}`);
      toast.success(`Marked as ${newStatus ? 'Active' : 'Inactive'}`);
    } catch (error) {
      toast.error("Status update failed");
      setCategories(prev => prev.map(cat => 
        cat.id === id ? { ...cat, isActive: currentStatus } : cat
      ));
    }
  };

  const handleEdit = (cat) => {
    setEditId(cat.id);
    setFormData({ name: cat.name, code: cat.code });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getIcon = (code) => {
    const c = code?.toUpperCase() || "";
    if (c.includes("TUT") || c.includes("EDU")) return <GraduationCap size={20}/>;
    if (c.includes("TRA")) return <Bus size={20}/>;
    if (c.includes("HOS")) return <Home size={20}/>;
    if (c.includes("MES") || c.includes("CAF")) return <Coffee size={20}/>;
    return <Wallet size={20}/>;
  };

  // Improved filtering logic
  const filteredCategories = categories.filter(cat => {
    const matchesSearch = 
      cat.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      cat.code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && cat.isActive) || 
      (statusFilter === "inactive" && !cat.isActive);

    return matchesSearch && matchesStatus;
  });

  const cardClass = `rounded-[2.5rem] border shadow-2xl transition-all duration-300 ${isDark ? "bg-[#1A1A1A] border-white/5 shadow-black/40" : "bg-white border-gray-100 shadow-gray-200/50"}`;
  const inputClass = `w-full px-6 py-4 rounded-2xl border outline-none transition-all font-semibold ${isDark ? "bg-[#242424] border-white/10 text-white focus:border-primary/50" : "bg-gray-50 border-gray-200 focus:border-primary"}`;

  return (
    <div className={`min-h-screen p-6 max-w-7xl mx-auto space-y-8 pb-20 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 px-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Fees Categories</h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.15em] text-[10px] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Live System Financials • {categories.length} Records
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          {/* Status Filter Toggle */}
          <div className={`flex p-1.5 rounded-2xl ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
            {['all', 'active', 'inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  statusFilter === status 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-gray-500 hover:text-primary"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-grow md:flex-grow-0 md:w-72 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
                type="text" 
                placeholder="Search code/name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-14 pr-6 py-4 rounded-2xl border border-transparent bg-primary/5 focus:bg-primary/10 outline-none w-full font-bold transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Form Side */}
        <div className="lg:col-span-4">
          <div className={`${cardClass} p-8 border-t-4 border-t-primary sticky top-6`}>
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary"><Plus size={24}/></div>
              <h2 className="text-xl font-black">{editId ? "Update Type" : "New Category"}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Display Name</label>
                <input 
                  placeholder="e.g. Monthly Tuition" 
                  className={inputClass}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Unique Code</label>
                <input 
                  placeholder="e.g. TUITION_FEE" 
                  className={inputClass}
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value})}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={loading.save}
                className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading.save ? <Loader2 className="animate-spin" /> : (editId ? <Edit3 size={20}/> : <Plus size={20}/>)}
                {editId ? "UPDATE" : "SAVE"}
              </button>

              {editId && (
                <button 
                  type="button" 
                  onClick={() => {setEditId(null); setFormData({name:"", code:""})}} 
                  className="w-full py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Table Side */}
        <div className="lg:col-span-8">
          <div className={`${cardClass} overflow-hidden`}>
            {loading.fetch ? (
              <div className="py-24 flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-xs font-black uppercase tracking-widest text-gray-500">Syncing...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="py-24 text-center">
                <div className="inline-flex p-6 rounded-full bg-gray-500/5 text-gray-400 mb-4">
                  <Filter size={32} />
                </div>
                <h3 className="text-lg font-black italic">No records found</h3>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Try adjusting your filters or search term</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className={`${isDark ? "bg-white/5" : "bg-gray-50"} border-b border-white/5`}>
                    <tr>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary">Identity</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary text-center">Status</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary text-right pr-10">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredCategories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-primary/[0.02] transition-colors">
                        <td className="p-6">
                          <div className="flex items-center gap-5">
                            <div className={`p-4 rounded-2xl ${isDark ? "bg-white/5 text-primary" : "bg-primary/10 text-primary"}`}>
                              {getIcon(cat.code)}
                            </div>
                            <div>
                              <p className="font-black text-base leading-tight">{cat.name}</p>
                              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mt-1">{cat.code}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <button 
                            onClick={() => toggleStatus(cat.id, cat.isActive)}
                            className={`flex items-center justify-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm ${
                              cat.isActive 
                                ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}
                          >
                             {cat.isActive ? <ShieldCheck size={14} strokeWidth={3} /> : <XCircle size={14} strokeWidth={3} />}
                             {cat.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td className="p-6 text-right pr-10">
                          <button 
                            onClick={() => handleEdit(cat)} 
                            className={`p-3 rounded-xl transition-all ${isDark ? "hover:bg-white/10 text-gray-400 hover:text-white" : "hover:bg-primary/10 text-gray-500 hover:text-primary"}`}
                            title="Edit Category"
                          >
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
        </div>
      </div>
    </div>
  );
};

export default FeesCategoryManager;