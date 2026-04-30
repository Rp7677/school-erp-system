import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  GraduationCap,
  Hash,
  Type,
  Search,
  Plus,
  Loader2,
  CheckCircle2,
  XCircle,
  X,
  Save,
  AlertCircle,
  Power,
  Fingerprint,
  ArrowDownLeft,
  Info,
  ShieldAlert,
} from "lucide-react";
import api from "../../../../config/api";
import { Toaster, toast } from "react-hot-toast";
import AutoBreadcrumb from "../../../../components/common/AutoBreadcrumb";

const BoardManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");

  const [view, setView] = useState("list");
  const [boards, setBoards] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ code: "", name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // --- NEW STATES FOR DIALOG & INFO ---
  const [confirmModal, setConfirmModal] = useState({ show: false, board: null });
  const [showInfo, setShowInfo] = useState(false);

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

  const fetchBoards = async () => {
    setFetching(true);
    try {
      const res = await api.get("/api/boards/view-all");
      setBoards(res.data || []);
    } catch (error) {
      toast.error("Failed to load boards");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  // --- DIALOG HANDLERS ---
  const triggerToggleConfirm = (board) => {
    setConfirmModal({ show: true, board });
  };

  const handleToggleStatus = async () => {
    const { board } = confirmModal;
    setConfirmModal({ show: false, board: null });
    setTogglingId(board.id);
    
    try {
      if (board.active) {
        await api.put(`/api/boards/deactivate/${board.id}`);
        toast.success(`${board.code} Deactivated`);
      } else {
        await api.put(`/api/boards/activate/${board.id}`);
        toast.success(`${board.code} Activated`);
      }
      fetchBoards();
    } catch (error) {
      toast.error("Status update failed");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/api/boards/create", formData);
      toast.success("Board created successfully");
      setFormData({ code: "", name: "" });
      setView("list");
      fetchBoards();
    } catch (error) {
      toast.error(error.response?.data?.message || "Creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBoards = boards.filter((b) => {
    const term = searchTerm.toLowerCase();
    return b.name?.toLowerCase().includes(term) || b.code?.toLowerCase().includes(term);
  });

  return (
    <div>
      <Toaster position="top-right" />

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.show && (
        <div className={theme.modalOverlay}>
          <div className={`w-full max-w-md rounded-3xl border p-8 shadow-2xl animate-in zoom-in-95 duration-200 ${theme.panel}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-500/10 rounded-2xl">
                <ShieldAlert className="text-red-500" size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter italic">Confirm Action</h3>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">System Security Check</p>
              </div>
            </div>
            
            <p className="text-sm font-medium opacity-80 mb-8 leading-relaxed">
              Are you sure you want to <span className="font-black text-primary underline underline-offset-4">
              {confirmModal.board?.active ? "DEACTIVATE" : "ACTIVATE"}</span> the board 
              <span className="font-bold"> {confirmModal.board?.name}</span>? This will affect all associated curriculum data.
            </p>

            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal({ show: false, board: null })}
                className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border border-white/10 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleToggleStatus}
                className={`flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest text-white shadow-lg transition-all active:scale-95 ${
                    confirmModal.board?.active ? "bg-red-500 shadow-red-500/20" : "bg-green-500 shadow-green-500/20"
                }`}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20">
            <GraduationCap className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-heading font-black tracking-tighter uppercase">
              Board <span className="text-primary not-italic">Manager</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* <button 
            onClick={() => setShowInfo(!showInfo)}
            className={`p-3 rounded-xl border transition-all ${showInfo ? 'bg-primary/10 border-primary text-primary' : theme.panel + ' opacity-50'}`}
          >
            <Info size={20} />
          </button> */}
          <div className={`flex items-center gap-2 p-1.5 rounded-2xl border ${theme.panel}`}>
            <div className="px-5 py-2 border-r border-white/5 text-center">
              <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Total</p>
              <p className="text-sm font-black">{boards.length}</p>
            </div>
            <div className="px-5 py-2 text-center">
              <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Active</p>
              <p className="text-sm font-black text-green-500">{boards.filter((b) => b.active).length}</p>
            </div>
          </div>
          {view === "list" && (
            <button
              onClick={() => setView("create")}
              className="h-14 px-6 bg-primary text-white rounded-2xl font-black uppercase text-button tracking-widest flex items-center gap-3 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
            >
              <Plus size={18} /> Create Board
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT CONTENT AREA --- */}
        <div className={`${showInfo ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-500`}>
          <div className="mb-6">
            <AutoBreadcrumb />
          </div>

          {view === "list" ? (
            <div className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}>
              <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-primary/5">
                <h3 className="font-black uppercase text-title-table tracking-widest">Board Registry</h3>
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    placeholder="FILTER BY CODE OR NAME..."
                    className={`w-full h-11 pl-10 pr-4 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={14} />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className={`${theme.tableHeader} text-heding-table font-black uppercase text-slate-500 tracking-widest`}>
                      <th className="px-8 py-5">Board Code</th>
                      <th className="px-8 py-5">Full Name</th>
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
                    ) : filteredBoards.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center opacity-30 font-black uppercase text-[10px] tracking-widest">
                          No board records found
                        </td>
                      </tr>
                    ) : (
                      filteredBoards.map((board) => (
                        <tr key={board.id} className={`transition-colors ${theme.rowHover}`}>
                          <td className="px-8 py-6">
                            <span className="font-mono text-small-table text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                              {board.code}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-small-table uppercase tracking-tight">{board.name}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${board.active ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                              <span className={`text-small-table px-3 py-1 rounded-full border ${board.active ? "border-green-500/30 text-green-500 bg-green-500/5" : "border-red-500/30 text-red-500 bg-red-500/5"}`}>
                                {board.active ? "ACTIVE" : "INACTIVE"}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button
                              onClick={() => triggerToggleConfirm(board)}
                              disabled={togglingId === board.id}
                              className={`inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-90 shadow-sm ${
                                board.active ? "bg-red-500 text-white shadow-red-500/20" : "bg-green-500 text-white shadow-green-500/20"
                              }`}
                            >
                              {togglingId === board.id ? <Loader2 size={16} className="animate-spin" /> : <Power size={18} />}
                            </button>
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

              <div className={`max-w-2xl mx-auto rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}>
                <div className="p-8 border-b border-white/5 bg-primary/5">
                  <h2 className="text-title-table font-black italic uppercase tracking-tighter">Register New Board</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <Hash size={12} className="text-primary" /> Board Code
                    </label>
                    <input
                      type="text"
                      name="code"
                      required
                      placeholder="E.G. CBSE, ICSE, GSEB"
                      className={`w-full h-12 px-4 rounded-xl outline-none text-small-table border transition-all focus:border-primary ${theme.input}`}
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
                      <Type size={12} className="text-primary" /> Board Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="ENTER FULL BOARD DESCRIPTION"
                      className={`w-full h-12 px-4 rounded-xl outline-none text-small-table border transition-all focus:border-primary ${theme.input}`}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
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
                      Finalize Board
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* --- RIGHT INFORMATION PANEL --- */}
        {showInfo && (
          <aside className="lg:col-span-4 animate-in slide-in-from-right-4 duration-500">
            <div className={`rounded-3xl border p-8 sticky top-10 ${theme.panel}`}>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <AlertCircle className="text-primary" size={20} />
                </div>
                <h4 className="font-black uppercase text-xs tracking-widest">Terminal Information</h4>
              </div>

              <div className="space-y-6">
                <div>
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2">What is Board Manager?</h5>
                  <p className="text-xs leading-relaxed opacity-60">
                    The Board Manager is the root configuration level for the educational hierarchy. Here you define national or state boards (like CBSE, ICSE) that govern classes and subjects.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2 flex items-center gap-2">
                    <CheckCircle2 size={12} /> Status Logic
                  </h5>
                  <p className="text-[10px] leading-relaxed opacity-70">
                    <span className="text-green-500 font-bold">Active:</span> Board is visible to students and teachers. <br/>
                    <span className="text-red-500 font-bold">Inactive:</span> All linked classes and materials will be hidden from the front-end.
                  </p>
                </div>

                <ul className="space-y-3">
                    {['Unique Codes required', 'Naming must be descriptive', 'Confirmation required for toggles'].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-[10px] font-bold opacity-50 uppercase tracking-tight">
                            <div className="w-1 h-1 rounded-full bg-primary" /> {item}
                        </li>
                    ))}
                </ul>

                <button 
                  onClick={() => setShowInfo(false)}
                  className="w-full py-3 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
                >
                  Dismiss Panel
                </button>
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
};

export default BoardManager;