import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Shield, Save, X, Loader2, CheckSquare, Square,
  LayoutGrid, Search, ChevronDown, Maximize2, Minimize2,
  Trash2, Tag, ArrowLeft
} from "lucide-react";
import api from "../../../../../config/api";
import { Toaster, toast } from "react-hot-toast";

const CreateRole = () => {
  const themeMode = useSelector((state) => state.color.mode);
  const isDark = themeMode === "dark";
  const navigate = useNavigate();

  // --- STATE ---
  const [formData, setFormData] = useState({ code: "", name: "" });
  const [groupedData, setGroupedData] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedModules, setExpandedModules] = useState([]);

  // --- FETCH PERMISSIONS ---
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const { data } = await api.get("/api/permissions/grouped");
        setGroupedData(data);
        setExpandedModules(Object.keys(data));
      } catch (error) {
        toast.error("Failed to load permissions.");
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  // --- FILTERING LOGIC ---
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return groupedData;
    const filtered = {};
    const lowerSearch = searchTerm.toLowerCase();

    Object.entries(groupedData).forEach(([module, perms]) => {
      const matchedPerms = perms.filter(p =>
        p.code.toLowerCase().includes(lowerSearch) ||
        (p.description && p.description.toLowerCase().includes(lowerSearch))
      );
      if (module.toLowerCase().includes(lowerSearch) || matchedPerms.length > 0) {
        filtered[module] = matchedPerms.length > 0 ? matchedPerms : perms;
      }
    });
    return filtered;
  }, [groupedData, searchTerm]);

  // --- HANDLERS ---
  const togglePermission = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleModule = (modulePerms) => {
    const ids = modulePerms.map(p => p.id);
    const allSelected = ids.every(id => selectedIds.includes(id));
    setSelectedIds(prev => allSelected ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name || selectedIds.length === 0) {
      return toast.error("Please complete all fields and select permissions.");
    }

    setSubmitting(true);
    try {
      await api.post("/api/template-roles", {
        code: formData.code.toUpperCase(),
        name: formData.name,
        permissionIds: selectedIds
      });
      toast.success("Role created successfully!");
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  // --- STYLES (REVERTED TO YOUR OLD COLOR DESIGN) ---
  const cardClass = `rounded-2xl shadow-sm border transition-all ${isDark ? "bg-[#1A1A1A] border-white/5" : "bg-white border-gray-100"
    }`;

  const inputClass = `w-full px-4 py-3 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${isDark ? "bg-[#242424] border-white/10 text-gray-200" : "bg-gray-50 border-gray-200 text-gray-800"
    }`;

  return (
    <div className="font-sans max-w-7xl mx-auto p-4 pb-10">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <button onClick={() => navigate(-1)} className={`flex items-center gap-1 text-sm mb-2 hover:opacity-75 transition-opacity ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className={`text-2xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-800"}`}>
            <Shield className="text-primary" size={28} /> Create New Role
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-primary text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
        >
          {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Save Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Identity Card */}
          <div className={cardClass + " p-6"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-2 text-gray-500">Role Code *</label>
                <input
                  className={inputClass}
                  placeholder="e.g. IT_MANAGER"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide mb-2 text-gray-500">Display Name *</label>
                <input
                  className={inputClass}
                  placeholder="e.g. System Administrator"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Permissions Grid */}
          <div className={cardClass}>
            <div className="p-5 border-b flex flex-col md:flex-row justify-between items-center gap-4">
              <h2 className={`font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-800"}`}>
                <LayoutGrid className="text-primary" size={20} /> Permissions Matrix
              </h2>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  className={inputClass + " !pl-10"}
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 space-y-4">
              {loading ? <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" size={32} /></div> :
                Object.entries(filteredData).map(([module, perms]) => {
                  const isExpanded = expandedModules.includes(module) || searchTerm.length > 0;
                  const allSelected = perms.every(p => selectedIds.includes(p.id));

                  return (
                    <div key={module} className={`border rounded-xl overflow-hidden transition-all ${isDark
                      ? "border-white/5 bg-white/2"
                      : "border-gray-100 bg-gray-50/50"
                      }`}>
                      <div className={`p-4 flex items-center justify-between cursor-pointer ${isDark ? "bg-white/5" : "bg-gray-50/50"
                        }`}
                        onClick={() => setExpandedModules(prev => prev.includes(module) ? prev.filter(m => m !== module) : [...prev, module])}>
                        <div className="flex items-center gap-3">
                          <ChevronDown size={18} className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                          <span className="text-xs font-bold uppercase tracking-widest">{module}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); toggleModule(perms); }}
                          className="text-[10px] font-bold text-primary border border-primary/20 px-3 py-1 rounded-lg hover:bg-primary hover:text-white transition-all"
                        >
                          {allSelected ? "Deselect Group" : "Select Group"}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-transparent">
                          {perms.map(p => (
                            <div
                              key={p.id}
                              onClick={() => togglePermission(p.id)}
                              className={`p-3 border rounded-lg cursor-pointer flex gap-3 transition-all ${selectedIds.includes(p.id)
                                ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                                : `border-transparent ${isDark ? "bg-white/5" : "bg-gray-50"}`
                                }`}
                            >
                              {selectedIds.includes(p.id) ? <CheckSquare className="text-primary shrink-0" size={18} /> : <Square className="text-gray-400 shrink-0" size={18} />}
                              <div className="min-w-0">
                                <p className={`text-sm font-bold truncate ${selectedIds.includes(p.id) ? "text-primary" : (isDark ? "text-gray-200" : "text-gray-800")}`}>{p.code}</p>
                                <p className="text-[10px] text-gray-500 truncate">{p.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              }
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          <div className={`${cardClass} p-6 sticky top-6 border-primary/20`}>
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-bold flex items-center gap-2">
                <Tag size={16} className="text-primary" /> Selection ({selectedIds.length})
              </span>
              {selectedIds.length > 0 && (
                <button onClick={() => setSelectedIds([])} className="text-xs text-red-500 font-bold hover:underline">Clear</button>
              )}
            </div>

            <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {selectedIds.length === 0 ? (
                <div className="text-center py-10 text-gray-500 italic text-sm">No permissions selected</div>
              ) : (
                Object.values(groupedData).flat()
                  .filter(p => selectedIds.includes(p.id))
                  .map(p => (
                    <div key={p.id} className={`flex justify-between items-center px-3 py-2 rounded-lg border ${isDark ? "bg-[#242424] border-white/5" : "bg-gray-50 border-gray-100"}`}>
                      <span className="text-[10px] font-bold text-primary truncate">{p.code}</span>
                      <X size={14} className="text-gray-500 cursor-pointer hover:text-red-500" onClick={() => togglePermission(p.id)} />
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRole;