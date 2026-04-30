import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { 
  Layers, School, Plus, Search, Loader2, 
  ArrowLeft, LayoutGrid, List, Filter, 
  CheckCircle2, Hash, FileText, Calendar,
  RefreshCcw, ShieldCheck
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import api from "../../../../config/api"; 
import AutoBreadcrumb from "../../../../components/common/AutoBreadcrumb";

const FeeStructureTypeManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");

  // --- STATE ---
  const [viewMode, setViewMode] = useState("table");
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState({ fetch: false, process: false });

  const [campuses, setCampuses] = useState([]);
  const [structureTypes, setStructureTypes] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    code: ""
  });

  // --- STYLING ---
  const cardClass = `rounded-[2.5rem] border shadow-2xl transition-all duration-300 ${isDark ? "bg-[#1A1A1A] border-white/5 shadow-black/40" : "bg-white border-gray-100 shadow-gray-200/50"}`;
  const inputClass = `w-full px-6 py-4 rounded-2xl border outline-none transition-all font-semibold ${isDark ? "bg-[#242424] border-white/10 text-white focus:border-primary/50" : "bg-gray-50 border-gray-200 focus:border-primary"}`;

  // --- DATA FETCHING ---

  const fetchCampuses = useCallback(async () => {
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const res = await api.get("/api/campuses");
      const activeCampuses = res.data.filter(c => c.isActive);
      setCampuses(activeCampuses);
      
      if (activeCampuses.length > 0) {
        setSelectedCampusId(activeCampuses[0].id.toString());
      }
    } catch (err) {
      toast.error("Failed to load campuses");
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, []);

  const fetchStructureTypes = useCallback(async (campusId) => {
    if (!campusId) return;
    setLoading(prev => ({ ...prev, fetch: true }));
    try {
      const res = await api.get(`/api/fees/structure-types?campus_id=${campusId}`);
      setStructureTypes(res.data || []);
    } catch (err) {
      console.error("Fetch error", err);
      setStructureTypes([]); // Reset on error
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, []);

  useEffect(() => { fetchCampuses(); }, [fetchCampuses]);

  useEffect(() => {
    if (selectedCampusId) fetchStructureTypes(selectedCampusId);
  }, [selectedCampusId, fetchStructureTypes]);

  // --- ACTIONS ---

  const handleCreateType = async (e) => {
    e.preventDefault();
    if (!selectedCampusId) return toast.error("Please select a campus context");

    setLoading(prev => ({ ...prev, process: true }));
    try {
      const payload = {
        ...formData,
        campusId: parseInt(selectedCampusId)
      };
      await api.post("/api/fees/structure-types", payload);
      toast.success("Fee Structure Type Created!");
      setFormData({ name: "", code: "" });
      setIsCreating(false);
      fetchStructureTypes(selectedCampusId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Creation failed");
    } finally {
      setLoading(prev => ({ ...prev, process: true }));
    }
  };

  return (
    <div className={`min-h-screen p-6 max-w-7xl mx-auto space-y-8 pb-20 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
      <Toaster position="top-right" />

      {isCreating ? (
        /* --- CREATION UI --- */
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <button onClick={() => setIsCreating(false)} className="group flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary mb-8 ml-4 transition-all">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Overview
          </button>
          
          <div className={`${cardClass} p-12 max-w-3xl mx-auto border-t-4 border-t-primary`}>
            <div className="flex items-center gap-6 mb-12">
              <div className="p-5 bg-primary/10 rounded-[2rem] text-primary shadow-inner"><Layers size={38} /></div>
              <div>
                <h2 className="text-3xl font-black tracking-tight">New Structure Type</h2>
                <p className="text-gray-500 font-medium">Define a new category for fee compositions (e.g. Regular, RTE, Scholarship)</p>
              </div>
            </div>

            <form onSubmit={handleCreateType} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-primary uppercase tracking-[0.2em] ml-2">Context Campus</label>
                <select className={inputClass} value={selectedCampusId} onChange={(e) => setSelectedCampusId(e.target.value)}>
                  {campuses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-black text-primary uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <FileText size={12}/> Type Name
                  </label>
                  <input
                    required
                    className={inputClass}
                    placeholder="e.g. Right to Education"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-primary uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                    <Hash size={12}/> Short Code
                  </label>
                  <input
                    required
                    className={inputClass}
                    placeholder="e.g. RTE"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase().replace(/\s/g, '_')})}
                  />
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button type="submit" disabled={loading.process} className="flex-[2] py-5 rounded-[1.5rem] bg-primary text-white font-black shadow-lg shadow-primary/40 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  {loading.process ? <Loader2 className="animate-spin" /> : <><Plus size={22}/> Initialize Type</>}
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
              <h1 className="text-4xl font-black tracking-tighter">Structure Types</h1>
              <p className="text-gray-500 font-bold uppercase tracking-[0.15em] text-[10px] mt-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Fee Classification Registry • {structureTypes.length} Active Types
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Campus Selector */}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-100 border-gray-200"}`}>
                <School size={16} className="text-primary" />
                <select 
                  value={selectedCampusId} 
                  onChange={(e) => setSelectedCampusId(e.target.value)}
                  className="bg-transparent font-black text-[11px] uppercase tracking-wider outline-none cursor-pointer"
                >
                  {campuses.map(c => <option key={c.id} value={c.id} className={isDark ? "bg-[#1A1A1A]" : "bg-white"}>{c.name} - {c.code}</option>)}
                </select>
              </div>

              <div className={`flex p-1 rounded-2xl ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
                <button onClick={() => setViewMode("grid")} className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-primary text-white shadow-md" : "text-gray-400"}`}><LayoutGrid size={20} /></button>
                <button onClick={() => setViewMode("table")} className={`p-2.5 rounded-xl transition-all ${viewMode === "table" ? "bg-primary text-white shadow-md" : "text-gray-400"}`}><List size={20} /></button>
              </div>

              <button onClick={() => setIsCreating(true)} className="group bg-primary text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-3 shadow-2xl shadow-primary/40 hover:scale-[1.03] active:scale-95 transition-all">
                <Plus size={20} /> <span>Create New</span>
              </button>
            </div>
          </div>

          {loading.fetch ? (
            <div className="py-40 flex justify-center"><Loader2 className="animate-spin text-primary" size={60} /></div>
          ) : structureTypes.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {structureTypes.map((type) => (
                  <div key={type.id} className={`${cardClass} overflow-hidden group`}>
                    <div className="p-8">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-primary/10 rounded-2xl text-primary"><Layers size={24}/></div>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${type.active ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                          {type.active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </div>
                      
                      <div className="space-y-1 mb-6">
                        <h3 className="font-black text-xl tracking-tight uppercase truncate">{type.name}</h3>
                        <p className="text-primary font-bold text-xs tracking-[0.2em]">{type.code}</p>
                      </div>

                      <div className={`p-5 rounded-2xl flex items-center justify-between ${isDark ? "bg-white/[0.03]" : "bg-gray-50"}`}>
                        <div className="flex items-center gap-2 text-gray-500">
                           <Calendar size={14}/>
                           <span className="text-[10px] font-bold uppercase tracking-tighter">Created: {new Date(type.createdAt).toLocaleDateString()}</span>
                        </div>
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
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-primary">Structure Name</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-primary">Identifier Code</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-primary">Created On</th>
                        <th className="p-8 text-[10px] font-black uppercase tracking-widest text-primary text-center">System Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {structureTypes.map((type) => (
                        <tr key={type.id} className="hover:bg-primary/[0.02] transition-colors group">
                          <td className="p-8">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-primary/10 rounded-xl text-primary"><FileText size={16}/></div>
                              <span className="font-black text-sm uppercase">{type.name}</span>
                            </div>
                          </td>
                          <td className="p-8">
                            <span className={`px-3 py-1 rounded-md text-[10px] font-black tracking-widest ${isDark ? "bg-white/5 text-primary" : "bg-gray-100 text-primary"}`}>
                                {type.code}
                            </span>
                          </td>
                          <td className="p-8">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold">{new Date(type.createdAt).toLocaleDateString()}</span>
                              <span className="text-[9px] text-gray-500 font-black uppercase tracking-tighter">Last Update: {new Date(type.updatedAt).toLocaleTimeString()}</span>
                            </div>
                          </td>
                          <td className="p-8 text-center">
                             <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider ${type.active ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                               <CheckCircle2 size={12}/> {type.active ? "Operational" : "Disabled"}
                             </div>
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
              <h3 className="text-xl font-black mt-4 uppercase tracking-[0.3em]">No Types Defined</h3>
              <p className="font-medium text-sm mt-2 italic">Select another campus or create a new fee structure category.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeeStructureTypeManager;