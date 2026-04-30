import { motion, AnimatePresence } from "framer-motion";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Building2, MapPin, Hash, Save, X, Loader2, School, Plus,
  Search, LayoutList, CheckCircle2, XCircle, Pencil, Power,
  Users, Globe, Mail, Info, ArrowDownLeft,
} from "lucide-react";
import api from "../../../../config/api";
import { Toaster, toast } from "react-hot-toast";
import AutoBreadcrumb from "../../../../components/common/AutoBreadcrumb";

const CampusManager = () => {
  const themeMode = useSelector((state) => state.color.mode);
  const isDark = themeMode === "dark";
  const token = useSelector((state) => state.auth.token);

  const theme = {
    bg: isDark ? "bg-[#050505]" : "bg-[#F8FAFC]",
    panel: isDark ? "bg-[#0D0D0D] border-white/10" : "bg-white border-slate-200",
    input: isDark ? "bg-[#141414] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900",
    tableHeader: isDark ? "bg-white/[0.03]" : "bg-slate-50",
    textPrimary: isDark ? "text-white" : "text-slate-900",
    textSecondary: isDark ? "text-slate-500" : "text-slate-500",
    rowHover: isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50",
    modalOverlay: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm",
  };

  const [view, setView] = useState("list");
  const [campuses, setCampuses] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ code: "", name: "", address: "", city: "", campusZipcode: "", state: "", country: "" });
  const [currentActiveStatus, setCurrentActiveStatus] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchCampuses = async () => {
    setFetching(true);
    try {
      const res = await api.get("/api/campuses");
      setCampuses(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load campuses");
    } finally { setFetching(false); }
  };

  useEffect(() => { if (view === "list") fetchCampuses(); }, [view]);

  const filteredCampuses = campuses.filter((campus) => {
    if (!searchTerm) return true;
    const lowerTerm = searchTerm.toLowerCase();
    return campus.name?.toLowerCase().includes(lowerTerm) || campus.code?.toLowerCase().includes(lowerTerm) || campus.city?.toLowerCase().includes(lowerTerm) || campus.address?.toLowerCase().includes(lowerTerm) || campus.state?.toLowerCase().includes(lowerTerm) || campus.country?.toLowerCase().includes(lowerTerm) || String(campus.campusZipcode)?.includes(lowerTerm) || String(campus.id).includes(lowerTerm);
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateNew = () => {
    setEditingId(null);
    setFormData({ code: "", name: "", address: "", city: "", campusZipcode: "", state: "", country: "" });
    setCurrentActiveStatus(true);
    setView("create");
  };

  const handleEdit = async (id) => {
    const toastId = toast.loading("Loading campus details...");
    try {
      const res = await api.get(`/api/campuses/${id}`);
      const data = res.data;
      setEditingId(data.id);
      setCurrentActiveStatus(data.isActive);
      setFormData({ code: data.code || "", name: data.name || "", address: data.address || "", city: data.city || "", campusZipcode: data.campusZipcode || "", state: data.state || "", country: data.country || "" });
      setView("create");
      toast.success("Details loaded", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load campus details", { id: toastId });
    }
  };

  const handleToggleStatus = async (campus) => {
    const newStatus = !campus.isActive;
    const toastId = toast.loading(`${newStatus ? "Activating" : "Deactivating"} campus...`);
    try {
      await api.put(`/api/campuses/${campus.id}`, { code: campus.code, name: campus.name, address: campus.address, city: campus.city, zipCode: campus.campusZipcode, isActive: newStatus });
      setCampuses((prev) => prev.map((item) => item.id === campus.id ? { ...item, isActive: newStatus } : item));
      toast.success(`Campus ${newStatus ? "Activated" : "Deactivated"}`, { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to change status", { id: toastId });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { code: formData.code, name: formData.name, address: formData.address, city: formData.city, zipCode: formData.campusZipcode, state: formData.state, country: formData.country, isActive: editingId ? currentActiveStatus : true };
      if (editingId) {
        await api.put(`/api/campuses/${editingId}`, payload);
        toast.success("Campus updated successfully");
      } else {
        await api.post("/api/campuses", payload);
        toast.success("Campus created successfully");
      }
      handleReset();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally { setSubmitting(false); }
  };

  const handleReset = () => {
    setFormData({ code: "", name: "", address: "", city: "", campusZipcode: "", state: "", country: "" });
    setEditingId(null);
    setView("list");
  };

  const [openModal, setOpenModal] = useState(false);
  const [activeCampus, setActiveCampus] = useState(null);

  useEffect(() => { document.body.style.overflow = openModal ? "hidden" : "auto"; }, [openModal]);

  // ─── STYLES ────────────────────────────────────────────────────────────────
  const card = `rounded-2xl border transition-all ${isDark ? 'bg-[#141414] border-white/5 shadow-2xl' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`;
  const input = `w-full px-3.5 py-2.5 rounded-xl border outline-none transition-all text-sm font-medium ${isDark ? 'bg-[#1A1A1A] border-white/10 text-white focus:border-primary' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-primary focus:bg-white'}`;
  const label = `block text-[10px] font-black uppercase mb-1 tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`;
  const thCell = `px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-gray-400 bg-[#1A1A1A]' : 'text-gray-500 bg-gray-50'}`;
  const tdCell = `px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const trHover = `border-b transition-colors cursor-pointer ${isDark ? 'border-white/5 hover:bg-white/[0.03]' : 'border-gray-100 hover:bg-gray-50/80'}`;

  // ─── Campus Summary Modal ──────────────────────────────────────────────────
  const CampusSummary = () => {
    if (!activeCampus) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className={`${card} w-full max-w-3xl max-h-[90vh] overflow-y-auto`}>
          {/* Header */}
          <div className={`px-6 py-5 border-b flex items-start justify-between ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Building2 size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-wide">{activeCampus.name}</p>
                <p className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Code: {activeCampus.code}</p>
              </div>
            </div>
            <button onClick={() => setActiveCampus(null)} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              <X size={16} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location */}
              <div className={`p-5 rounded-xl border ${isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                <p className={`text-[10px] font-black uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Location</p>
                <div className="space-y-2">
                  {[
                    { Icon: Building2, value: `${activeCampus.name} (${activeCampus.code})` },
                    { Icon: MapPin, value: `${activeCampus.city}, ${activeCampus.state}` },
                    { Icon: Globe, value: activeCampus.country },
                    { Icon: Mail, value: activeCampus.campusZipcode },
                  ].map(({ Icon, value }, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Icon size={13} className="opacity-40 shrink-0" />
                      <span className="text-sm">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className={`p-5 rounded-xl border ${isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                <p className={`text-[10px] font-black uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Status</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Campus Status</span>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${activeCampus.isActive ? 'bg-emerald-500/10 text-emerald-600 border-emerald-400/20' : 'bg-red-500/10 text-red-500 border-red-400/20'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeCampus.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {activeCampus.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Campus Code</span>
                    <span className="text-xs font-mono font-bold text-primary">{activeCampus.code}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Admins</span>
                    <span className={`text-xs font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{activeCampus.campusAdmins?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary stats */}
            <div className={`p-5 rounded-xl border ${isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-[10px] font-black uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Summary</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { value: activeCampus.campusAdmins?.length || 0, label: 'Admins', color: 'text-primary' },
                  { value: activeCampus.isActive ? "Active" : "Inactive", label: 'Status', color: activeCampus.isActive ? 'text-emerald-600' : 'text-red-500' },
                  { value: activeCampus.code, label: 'Code', color: 'text-primary' },
                ].map(({ value, label, color }, i) => (
                  <div key={i}>
                    <p className={`text-xl font-black ${color}`}>{value}</p>
                    <p className={`text-[10px] font-black uppercase tracking-wider mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24">
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: isDark ? '#1A1A1A' : '#fff', color: isDark ? '#fff' : '#000', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', fontSize: '13px', fontWeight: 600 } }} />

      {/* Campus Summary Modal */}
      {activeCampus && <CampusSummary />}

      {/* --- HEADER --- */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20">
            <Building2 className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-heading font-black tracking-tighter uppercase">
              Campus <span className="text-primary not-italic">Manager</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 p-1.5 rounded-2xl border ${theme.panel}`}>
            <div className="px-5 py-2 border-r border-white/5 text-center">
              <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Total</p>
              <p className="text-sm font-black">{campuses.length}</p>
            </div>
            <div className="px-5 py-2 text-center">
              <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Active</p>
              <p className="text-sm font-black text-green-500">{campuses.filter((c) => c.isActive).length}</p>
            </div>
          </div>
          {view === "list" && (
            <button
              onClick={handleCreateNew}
              className="h-14 px-6 bg-primary text-white rounded-2xl font-black uppercase text-button tracking-widest flex items-center gap-3 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              <Plus size={18} /> Create Campus
            </button>
          )}
        </div>
      </header>

      <main className={view === "list" ? "max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8" : "w-full"}>
        {/* --- LEFT CONTENT AREA --- */}
        <div className="lg:col-span-12">
          <div className="mb-6">
            <AutoBreadcrumb />
          </div>

          {view === "list" ? (
            <div className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}>
              <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-primary/5">
                <h3 className="font-black uppercase text-title-table tracking-widest">Campus Registry</h3>
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    placeholder="FILTER BY CODE OR NAME..."
                    className={`w-full h-11 pl-10 pr-4 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    value={searchTerm}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={14} />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`${theme.tableHeader} text-heding-table font-black uppercase text-slate-500 tracking-widest`}>
                      <th className="px-8 py-5">Campus Code</th>
                      <th className="px-8 py-5">Full Name</th>
                      <th className="px-8 py-5">Location</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {fetching ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center">
                          <Loader2 className="animate-spin mx-auto text-primary" size={32} />
                        </td>
                      </tr>
                    ) : filteredCampuses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center opacity-30 font-black uppercase text-[10px] tracking-widest">
                          No campus records found
                        </td>
                      </tr>
                    ) : (
                      filteredCampuses.map((campus) => (
                        <tr
                          key={campus.id}
                          className={`transition-colors ${theme.rowHover} cursor-pointer`}
                          onClick={() => setActiveCampus(campus)}
                        >
                          <td className="px-8 py-6">
                            <span className="font-mono text-small-table text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                              {campus.code}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-small-table uppercase tracking-tight">{campus.name}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-1">
                              <span className="text-small-table block">{campus.city}, {campus.state}</span>
                              <span className="text-small-table opacity-60">{campus.country} · {campus.campusZipcode}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${campus.isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                              <span className={`text-small-table px-3 py-1 rounded-full border ${campus.isActive ? "border-green-500/30 text-green-500 bg-green-500/5" : "border-red-500/30 text-red-500 bg-red-500/5"}`}>
                                {campus.isActive ? "ACTIVE" : "INACTIVE"}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(campus.id);
                                }}
                                className="inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-90 shadow-sm border border-amber-500/20 text-amber-500 hover:bg-amber-500/10"
                                title="Edit Campus"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleStatus(campus);
                                }}
                                className={`inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-90 shadow-sm ${campus.isActive ? "bg-red-500 text-white shadow-red-500/20" : "bg-green-500 text-white shadow-green-500/20"
                                  }`}
                                title={campus.isActive ? "Deactivate" : "Activate"}
                              >
                                <Power size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button
                onClick={() => setView("list")}
                className={`mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${theme.textSecondary} hover:text-primary`}
              >
                <ArrowDownLeft className="rotate-90" size={14} /> Back to Registry
              </button>

              <div className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}>
                <div className="p-8 border-b border-white/5 bg-primary/5">
                  <h2 className="text-title-table font-black not-italic uppercase tracking-tighter">{formData.code? "Update Campus Details" :"Register New Campus"}</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                        <Hash size={12} className="text-primary" /> Campus Code
                      </label>
                      <input
                        type="text"
                        name="code"
                        required
                        placeholder="E.G. CMP-001"
                        className={`w-full h-12 px-4 rounded-xl outline-none text-small-table border transition-all focus:border-primary ${theme.input}`}
                        value={formData.code}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                        <Building2 size={12} className="text-primary" /> Campus Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="ENTER FULL CAMPUS DESCRIPTION"
                        className={`w-full h-12 px-4 rounded-xl outline-none text-small-table border transition-all focus:border-primary ${theme.input}`}
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <MapPin size={12} className="text-primary" /> Full Address
                    </label>
                    <textarea
                      name="address"
                      required
                      placeholder="ENTER COMPLETE ADDRESS"
                      rows={3}
                      className={`w-full px-4 rounded-xl outline-none text-small-table border transition-all focus:border-primary ${theme.input} resize-none`}
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">City</label>
                      <input
                        type="text"
                        name="city"
                        required
                        placeholder="CITY NAME"
                        className={`w-full h-12 px-4 rounded-xl outline-none text-small-table border transition-all focus:border-primary ${theme.input}`}
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">Zip Code</label>
                      <input
                        type="text"
                        name="campusZipcode"
                        required
                        placeholder="POSTAL CODE"
                        className={`w-full h-12 px-4 rounded-xl outline-none text-small-table border transition-all focus:border-primary ${theme.input}`}
                        value={formData.campusZipcode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">State</label>
                      <input
                        type="text"
                        name="state"
                        required
                        placeholder="STATE/PROVINCE"
                        className={`w-full h-12 px-4 rounded-xl outline-none text-small-table border transition-all focus:border-primary ${theme.input}`}
                        value={formData.state}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">Country</label>
                      <input
                        type="text"
                        name="country"
                        required
                        placeholder="COUNTRY"
                        className={`w-full h-12 px-4 rounded-xl outline-none text-small-table border transition-all focus:border-primary ${theme.input}`}
                        value={formData.country}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => setView("list")}
                      className={`flex-1 h-14 rounded-2xl font-black uppercase text-button tracking-widest border border-white/10 transition-all active:scale-95 ${theme.textSecondary}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase text-button tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                      {submitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                      Finalize Campus
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CampusManager;