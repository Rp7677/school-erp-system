import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Calendar,
  Search,
  Plus,
  Loader2,
  CheckCircle2,
  Save,
  AlertCircle,
  Power,
  Fingerprint,
  Info,
  ShieldAlert,
  ArrowDownLeft,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import api from "../../../../config/api";
import AutoBreadcrumb from "../../../../components/common/AutoBreadcrumb";

const AcademicYearManagement = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");

  const [view, setView] = useState("list");
  const [years, setYears] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({ name: "" });
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  // --- MODAL & INFO STATES ---
  const [confirmModal, setConfirmModal] = useState({ show: false, year: null });
  const [showInfo, setShowInfo] = useState(false);

  const URL_PREFIX = "/api/academic-years";

  const theme = {
    bg: isDark ? "bg-[#050505]" : "bg-[#F8FAFC]",
    panel: isDark
      ? "bg-[#0D0D0D] border-white/10"
      : "bg-white border-slate-200",
    input: isDark
      ? "bg-[#141414] border-white/10 text-white"
      : "bg-white border-slate-200 text-slate-900",
    tableHeader: isDark ? "bg-white/[0.03]" : "bg-slate-50",
    textPrimary: isDark ? "text-white" : "text-slate-900",
    textSecondary: isDark ? "text-slate-500" : "text-slate-500",
    rowHover: isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50",
    modalOverlay:
      "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm",
    accent: "#FBCB84",
  };

  const fetchYears = async () => {
    setFetching(true);
    try {
      const res = await api.get(`${URL_PREFIX}/get-all-academic-year`);
      setYears(res.data || []);
    } catch (error) {
      toast.error("Failed to load academic years");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  // --- DIALOG HANDLERS ---
  const triggerToggleConfirm = (year) => {
    setConfirmModal({ show: true, year: year });
  };

  const handleToggleStatus = async () => {
    // 1. Guard against null year
    if (!confirmModal.year) return;

    const targetYear = confirmModal.year;

    // 2. Clear modal state before API call to prevent UI lag
    setConfirmModal({ show: false, year: null });
    setTogglingId(targetYear.id);

    const endpoint = targetYear.active
      ? `${URL_PREFIX}/deactivate-academic-year/${targetYear.id}`
      : `${URL_PREFIX}/activate-academic-year/${targetYear.id}`;

    try {
      await api.put(endpoint);
      toast.success(
        `Session ${targetYear.name} ${
          targetYear.active ? "Deactivated" : "Activated"
        }`
      );
      fetchYears();
    } catch (error) {
      toast.error(error.response?.data?.message || "Status update failed");
    } finally {
      setTogglingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`${URL_PREFIX}/create-academic-year`, {
        name: formData.name,
      });
      toast.success("Academic Year created");
      setFormData({ name: "" });
      setView("list");
      fetchYears();
    } catch (error) {
      toast.error(error.response?.data?.message || "Creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredYears = years
    .filter((y) => y.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.id - a.id);

  return (
    <div
      className={`min-h-screen p-6 lg:p-10 ${theme.bg} ${theme.textPrimary} transition-all duration-300 relative`}
    >
      <Toaster position="top-right" />

      {/* --- CONFIRMATION MODAL --- */}
      {confirmModal.show && confirmModal.year && (
        <div className={theme.modalOverlay}>
          <div
            className={`w-full max-w-md rounded-3xl border p-8 shadow-2xl animate-in zoom-in-95 duration-200 ${theme.panel}`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-yellow-500/10 rounded-2xl">
                <ShieldAlert className="text-yellow-500" size={28} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter italic">
                  Confirm Action
                </h3>
                <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                  Session Security Check
                </p>
              </div>
            </div>

            <p className="text-sm font-medium opacity-80 mb-8 leading-relaxed">
              Are you sure you want to{" "}
              <span
                className="font-black underline underline-offset-4"
                style={{ color: theme.accent }}
              >
                {confirmModal.year.active ? "DEACTIVATE" : "ACTIVATE"}
              </span>{" "}
              the academic session
              <span className="font-bold"> {confirmModal.year.name}</span>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal({ show: false, year: null })}
                className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest border border-white/10 hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleToggleStatus}
                className={`flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest text-black shadow-lg transition-all active:scale-95 ${
                  confirmModal.year.active
                    ? "bg-red-500 text-white shadow-red-500/20"
                    : "bg-[#FBCB84] shadow-[#FBCB84]/20"
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
            <Calendar className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-heading font-black tracking-tighter uppercase">
              Academic <span className="text-primary not-italic">Sessions</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* <button onClick={() => setShowInfo(!showInfo)} className={`p-3 rounded-xl border transition-all ${showInfo ? 'bg-primary/10 border-primary text-primary' : theme.panel + ' opacity-50'}`}>
            <Info size={20} />
          </button> */}
          {view === "list" && (
            <button
              onClick={() => setView("create")}
              className="h-14 px-6 bg-primary text-white rounded-2xl font-black uppercase text-button tracking-widest flex items-center gap-3 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-[#FBCB84]/20"
            >
              <Plus size={18} /> New Session
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div
          className={`${
            showInfo ? "lg:col-span-8" : "lg:col-span-12"
          } transition-all duration-500`}
        >
          <div className="mb-6">
            <AutoBreadcrumb />
          </div>

          {view === "list" ? (
            <div
              className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}
            >
              <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#FBCB84]/5">
                <h3 className="font-black uppercase text-title-table tracking-widest">
                  Timeline Registry
                </h3>
                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    placeholder="FILTER SESSIONS..."
                    className={`w-full h-11 pl-10 pr-4 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-[#FBCB84] border transition-all ${theme.input}`}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
                    size={14}
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr
                      className={`${theme.tableHeader} text-heding-table font-black uppercase text-slate-500 tracking-widest`}
                    >
                      <th className="px-8 py-5">Session Name</th>
                      <th className="px-8 py-5 text-center">Status</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {fetching ? (
                      <tr>
                        <td colSpan={4} className="py-20 text-center">
                          <Loader2
                            className="animate-spin mx-auto text-[#FBCB84]"
                            size={32}
                          />
                        </td>
                      </tr>
                    ) : filteredYears.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-8 py-20 text-center opacity-30 font-black uppercase text-[10px]"
                        >
                          No sessions found
                        </td>
                      </tr>
                    ) : (
                      filteredYears.map((year) => (
                        <tr
                          key={year.id}
                          className={`transition-colors ${theme.rowHover}`}
                        >
                          <td className="px-8 py-6 text-small-table tracking-tight">
                            {year.name}
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center justify-center gap-2">
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                  year.active
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-red-500"
                                }`}
                              />
                              <span
                                className={`text-small-table px-3 py-1 rounded-full border ${
                                  year.active
                                    ? "border-green-500/30 text-green-500 bg-green-500/5"
                                    : "border-red-500/30 text-red-500 bg-red-500/5"
                                }`}
                              >
                                {year.active ? "ACTIVE" : "INACTIVE"}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button
                              onClick={() => triggerToggleConfirm(year)}
                              disabled={togglingId === year.id}
                              className={`inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-90 ${
                                year.active
                                  ? "bg-red-500 text-white shadow-red-500/20"
                                  : "bg-green-500 text-white shadow-green-500/20"
                              }`}
                            >
                              {togglingId === year.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Power size={18} />
                              )}
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
                className={`mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${theme.textSecondary} hover:text-[#FBCB84]`}
              >
                <ArrowDownLeft className="rotate-90" size={14} /> Back to
                Registry
              </button>
              <div
                className={`max-w-xl mx-auto rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}
              >
                <div className="p-8 border-b border-white/5 bg-[#FBCB84]/5">
                  <h2 className="text-title-table font-black uppercase tracking-tighter">
                    Initialize Session
                  </h2>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">
                      Session Label
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="E.G. 2025-2026"
                      className={`w-full h-14 px-5 rounded-2xl outline-none  text-small-table border transition-all focus:border-[#FBCB84] ${theme.input}`}
                      value={formData.name}
                      onChange={(e) => setFormData({ name: e.target.value })}
                    />
                  </div>
                  <div className="pt-4 flex gap-4">
                    <button
                      type="button"
                      onClick={() => setView("list")}
                      className="flex-1 h-14 rounded-2xl font-black uppercase text-button tracking-widest border border-white/10 opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 h-14 bg-[#FBCB84] text-black rounded-2xl font-black uppercase text-button tracking-widest shadow-lg flex items-center justify-center gap-3"
                    >
                      {submitting ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <Save size={18} />
                      )}{" "}
                      Finalize Session
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* --- INFORMATION PANEL --- */}
        {showInfo && (
          <aside className="lg:col-span-4 animate-in slide-in-from-right-4 duration-500">
            <div
              className={`rounded-3xl border p-8 sticky top-10 ${theme.panel}`}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <AlertCircle className="text-primary" size={20} />
                </div>
                <h4 className="font-black uppercase text-xs tracking-widest">
                  Terminal Information
                </h4>
              </div>
              <div className="space-y-6">
                <div>
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2">
                    What is Academic Session?
                  </h5>
                  <p className="text-xs leading-relaxed opacity-60">
                    Sessions are time-bound cycles. All students, fees, and
                    marks are linked to an active session.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2 flex items-center gap-2">
                    <CheckCircle2 size={12} /> Status Logic
                  </h5>
                  <p className="text-[10px] leading-relaxed opacity-70">
                    <span className="text-green-500 font-bold">Active:</span>{" "}
                    Open for operations.
                    <br />
                    <span className="text-red-500 font-bold">
                      Inactive:
                    </span>{" "}
                    Locked/Archived data.
                  </p>
                </div>
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

export default AcademicYearManagement;
