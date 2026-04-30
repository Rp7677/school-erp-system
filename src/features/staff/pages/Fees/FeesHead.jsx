  import React, { useState, useEffect } from "react";
  import { useSelector } from "react-redux";
  import api from "../../../../config/api"; 
  import { 
    Plus, Search, Edit3, ShieldCheck, 
    Loader2, XCircle, Globe, Building2, 
    Tag, Fingerprint, Layers
  } from "lucide-react";
  import { Toaster, toast } from "react-hot-toast";

  const FeesHeadManager = () => {
    const isDark = useSelector((state) => state.color.mode === "dark");
    
    // Data States
    const [heads, setHeads] = useState([]);
    const [categories, setCategories] = useState([]);
    const [campuses, setCampuses] = useState([]);
    
    // UI States
    const [loading, setLoading] = useState({ fetch: true, save: false });
    const [searchTerm, setSearchTerm] = useState("");
    const [editId, setEditId] = useState(null);

    
    // Form State
    const [formData, setFormData] = useState({
      name: "",
      code: "",
      categoryId: "",
      global: true,
      campusId: "",
      ledgerCode: ""
    });

    const ENDPOINT = "/api/fees/heads";

    useEffect(() => {
      fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
      setLoading(prev => ({ ...prev, fetch: true }));
      try {
        const [headsRes, catRes, campusRes] = await Promise.all([
          api.get(ENDPOINT),
          api.get("/api/fee-categories"),
          api.get("/api/campuses")
        ]);
        setHeads(Array.isArray(headsRes.data) ? headsRes.data : []);
        setCategories(catRes.data || []);
        setCampuses(campusRes.data || []);
      } catch (error) {
        toast.error("Failed to sync system data");
      } finally {
        setLoading(prev => ({ ...prev, fetch: false }));
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(prev => ({ ...prev, save: true }));
      
      // Logic: If global is true, campusId must be null
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
        campusId: formData.global ? null : parseInt(formData.campusId),
        categoryId: parseInt(formData.categoryId)
      };

      try {
        if (editId) {
          // Note: Assuming PUT for full update, or handle as per your backend
          await api.put(`${ENDPOINT}/${editId}`, payload);
          toast.success("Fees Head updated");
        } else {
          await api.post(ENDPOINT, payload);
          toast.success("New Fees Head created");
        }
        resetForm();
        fetchInitialData(); // Refresh list to get joined category names
      } catch (error) {
        toast.error(error.response?.data?.message || "Operation failed");
      } finally {
        setLoading(prev => ({ ...prev, save: false }));
      }
    };

    const toggleStatus = async (id, currentStatus) => {
      const newStatus = !currentStatus;
      // Optimistic UI
      setHeads(prev => prev.map(h => h.id === id ? { ...h, active: newStatus } : h));

      try {
        await api.patch(`${ENDPOINT}/${id}/status`, { active: newStatus });
        toast.success(`Head marked as ${newStatus ? 'Active' : 'Inactive'}`);
      } catch (error) {
        toast.error("Status update failed");
        fetchInitialData();
      }
    };

    const resetForm = () => {
      setFormData({
        name: "",
        code: "",
        categoryId: "",
        global: true,
        campusId: "",
        ledgerCode: ""
      });
      setEditId(null);
    };

    const handleEdit = (head) => {
      setEditId(head.id);
      setFormData({
        name: head.name,
        code: head.code,
        categoryId: head.categoryId,
        global: head.global,
        campusId: head.campusId || "",
        ledgerCode: head.ledgerCode || ""
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredHeads = heads.filter(h => 
      h.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      h.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Styles
    const cardClass = `rounded-[2.5rem] border shadow-2xl transition-all duration-300 ${isDark ? "bg-[#1A1A1A] border-white/5 shadow-black/40" : "bg-white border-gray-100 shadow-gray-200/50"}`;
    const inputClass = `w-full px-6 py-4 rounded-2xl border outline-none transition-all font-semibold ${isDark ? "bg-[#242424] border-white/10 text-white focus:border-primary/50" : "bg-gray-50 border-gray-200 focus:border-primary"}`;
    const labelClass = "text-[10px] font-black text-primary uppercase tracking-widest ml-1 mb-2 block";

    return (
      <div className={`min-h-screen p-6 max-w-7xl mx-auto space-y-8 pb-20 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
        <Toaster position="top-right" />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
          <div>
            <h1 className="text-4xl font-black tracking-tighter">Fees Heads</h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.15em] text-[10px] mt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Financial Configuration • {heads.length} Units
            </p>
          </div>

          <div className="relative w-full md:w-72 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search heads..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-14 pr-6 py-4 rounded-2xl border border-transparent bg-primary/5 focus:bg-primary/10 outline-none w-full font-bold transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Form */}
          <div className="lg:col-span-5">
            <div className={`${cardClass} p-8 border-t-4 border-t-primary sticky top-6`}>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  {editId ? <Edit3 size={24}/> : <Plus size={24}/>}
                </div>
                <h2 className="text-xl font-black">{editId ? "Update Fees Head" : "New Fees Head"}</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Head Name</label>
                    <input 
                      placeholder="e.g. ERP Fee" 
                      className={inputClass}
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Unique Code</label>
                    <input 
                      placeholder="ERP_FEES" 
                      className={inputClass}
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Category</label>
                  <select 
                    className={inputClass}
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Visibility Type</label>
                    <select 
                      className={inputClass}
                      value={formData.global}
                      onChange={(e) => setFormData({...formData, global: e.target.value === "true"})}
                    >
                      <option value="true">Global Head</option>
                      <option value="false">Campus Specific</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Ledger Code (Tally)</label>
                    <input 
                      placeholder="LEDGER_01" 
                      className={inputClass}
                      value={formData.ledgerCode}
                      onChange={(e) => setFormData({...formData, ledgerCode: e.target.value})}
                    />
                  </div>
                </div>

                {!formData.global && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className={labelClass}>Select Campus</label>
                    <select 
                      className={inputClass}
                      value={formData.campusId}
                      onChange={(e) => setFormData({...formData, campusId: e.target.value})}
                      required
                    >
                      <option value="">Choose Campus</option>
                      {campuses.map(cam => (
                        <option key={cam.id} value={cam.id}>{cam.name} ({cam.code})</option>
                      ))}
                    </select>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading.save}
                  className="w-full py-5 bg-primary text-white rounded-[1.5rem] font-black shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
                >
                  {loading.save ? <Loader2 className="animate-spin" /> : (editId ? "UPDATE HEAD" : "SAVE HEAD")}
                </button>

                {editId && (
                  <button 
                    type="button" 
                    onClick={resetForm} 
                    className="w-full py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                  >
                    Discard Changes
                  </button>
                )}
              </form>
            </div>
          </div>

          {/* Right: Table */}
          <div className="lg:col-span-7">
            <div className={`${cardClass} overflow-hidden`}>
              {loading.fetch ? (
                <div className="py-32 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="animate-spin text-primary" size={40} />
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500">Loading Financial Ledger...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className={`${isDark ? "bg-white/5" : "bg-gray-50"} border-b border-white/5`}>
                      <tr>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary">Head Details</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary">Scope</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary text-center">Status</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredHeads.map((head) => (
                        <tr key={head.id} className="group hover:bg-primary/[0.02] transition-colors">
                          <td className="p-6">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-primary/5"} text-primary`}>
                                <Tag size={18} />
                              </div>
                              <div>
                                <p className="font-black text-sm leading-tight">{head.name}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase">{head.categoryCode}</span>
                                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">{head.code}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            {head.global ? (
                              <div className="flex items-center gap-2 text-blue-500">
                                <Globe size={14} />
                                <span className="text-[10px] font-black uppercase tracking-tight">Global</span>
                              </div>
                            ) : (
                              // <div className="flex items-center gap-2 text-orange-500">
                              //   <Building2 size={14} />
                              //   <span className="text-[10px] font-black uppercase tracking-tight truncate max-w-[80px]">Campus #{head.campusId}
                              //   </span>
                              // </div>
                              <div className="flex items-center gap-2 text-orange-500">
                                <Building2 size={14} />
                                {campuses.map(cam => (
                                      <span className="text-[10px] font-black uppercase tracking-tight truncate max-w-[80px]">#{cam.name}</span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="p-6">
                            <button 
                              onClick={() => toggleStatus(head.id, head.active)}
                              className={`flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                                head.active 
                                  ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                                  : 'bg-red-500/10 text-red-500 border border-red-500/20'
                              }`}
                            >
                              {head.active ? <ShieldCheck size={12} /> : <XCircle size={12} />}
                              {head.active ? "Active" : "Inactive"}
                            </button>
                          </td>
                          <td className="p-6 text-right">
                            <button 
                              onClick={() => handleEdit(head)} 
                              className={`p-3 rounded-xl transition-all ${isDark ? "text-gray-500 hover:text-white hover:bg-white/10" : "text-gray-400 hover:text-primary hover:bg-primary/10"}`}
                            >
                              <Edit3 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredHeads.length === 0 && (
                    <div className="py-20 text-center text-gray-500">
                      <Layers className="mx-auto mb-4 opacity-20" size={48} />
                      <p className="font-bold text-sm">No Fees Heads found</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default FeesHeadManager;