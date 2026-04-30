import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  Settings2,
  Plus,
  Calendar,
  Link2,
  Loader2,
  Zap,
  Save,
  Trash2,
  PlusCircle,
  School,
  CheckCircle2,
  CalendarRange,
  RefreshCw,
  Clock,
  ChevronDown,
  Layers,
  Info,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
  LayoutGrid,
  Activity,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../../../config/api";
import AutoBreadcrumb from "../../../../components/common/AutoBreadcrumb";

const InfrastructureManager = () => {
  const themeMode = useSelector((state) => state.color.mode);
  const isDark = themeMode === "dark";

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
  };

  // --- GLOBAL CONTEXT ---
  const { campuses } = useSelector((state) => state.campus);
  const [selectedCampusId, setSelectedCampusId] = useState("");
  const [availableBranches, setAvailableBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [loadingGlobal, setLoadingGlobal] = useState(true);
  const [showInfo, setShowInfo] = useState(false);

  // --- NAVIGATION & PAGINATION ---
  const [activeTab, setActiveTab] = useState("setup");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- TAB STATE ---
  const [globalYears, setGlobalYears] = useState([]);
  const [assignData, setAssignData] = useState({
    academicYearId: "",
    startDate: "",
    endDate: "",
  });
  const [assignedYearsList, setAssignedYearsList] = useState([]);
  const [loadingAssignedList, setLoadingAssignedList] = useState(false);

  const [branchYears, setBranchYears] = useState([]);
  const [termData, setTermData] = useState({
    branchAcademicYearId: "",
    termName: "",
    startDate: "",
    endDate: "",
    orderNo: 1,
  });
  const [existingTerms, setExistingTerms] = useState([]);
  const [loadingTerms, setLoadingTerms] = useState(false);

  const [mappingGrades, setMappingGrades] = useState([]);
  const [mappingTerms, setMappingTerms] = useState([]);
  const [mappingData, setMappingData] = useState({
    branchAcademicYearId: "",
    gradeId: "",
    selectedTermIds: [{ id: "" }],
  });

  // --- MODAL STATE ---
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: null,
    data: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tabConfig = [
    { id: "setup", label: "Year Assign", icon: <Calendar size={14} /> },
    { id: "terms", label: "Create Terms", icon: <Plus size={14} /> },
    { id: "mapping", label: "Term Mapping", icon: <Link2 size={14} /> },
  ];

  // --- FETCH LOGIC ---
  useEffect(() => {
    const initFetch = async () => {
      try {
        const yearRes = await api.get(
          "/api/academic-years/get-all-academic-year"
        );
        setGlobalYears(yearRes.data || []);
      } catch (error) {
        toast.error("Failed to load Global Academic Years");
      } finally {
        setLoadingGlobal(false);
      }
    };
    initFetch();
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      if (!selectedCampusId) {
        setAvailableBranches([]);
        setSelectedBranchId("");
        return;
      }
      try {
        const res = await api.get(`/api/branches`);
        const campusSpecificBranches = (res.data || []).filter(
          (b) => b.campusId === parseInt(selectedCampusId)
        );
        setAvailableBranches(campusSpecificBranches);
        setSelectedBranchId("");
      } catch (error) {
        toast.error("Error loading branches");
      }
    };
    fetchBranches();
  }, [selectedCampusId]);

  const refreshBranchContext = useCallback(async (branchId) => {
    if (!branchId) return;
    setLoadingAssignedList(true);
    try {
      const [yearRes, gradeRes] = await Promise.all([
        api.get(`/api/branches/${branchId}/academic-years`),
        api.get(`/api/branches/${branchId}/grades`),
      ]);
      setBranchYears(yearRes.data || []);
      setAssignedYearsList(yearRes.data || []);
      setMappingGrades(gradeRes.data || []);
    } catch (error) {
      toast.error("Failed to sync branch configuration");
    } finally {
      setLoadingAssignedList(false);
    }
  }, []);

  useEffect(() => {
    if (selectedBranchId) refreshBranchContext(selectedBranchId);
  }, [selectedBranchId, refreshBranchContext]);

  // --- HANDLERS WITH CONFIRMATION ---
  const openConfirm = (type, data = null) => {
    setConfirmModal({ show: true, type, data });
  };

  const processAction = async () => {
    setIsSubmitting(true);
    try {
      if (confirmModal.type === "assignYear") {
        const { academicYearId, startDate, endDate } = assignData;
        await api.post(
          `/api/branches/${selectedBranchId}/academic-years/${academicYearId}?startDate=${startDate}&endDate=${endDate}`
        );
        toast.success("Year assigned successfully!");
        setAssignData({ academicYearId: "", startDate: "", endDate: "" });
        refreshBranchContext(selectedBranchId);
      } else if (confirmModal.type === "createTerm") {
        const { branchAcademicYearId, termName, startDate, endDate, orderNo } =
          termData;
        await api.post(`/api/academic-years/${branchAcademicYearId}/terms`, {
          name: termName,
          startDate,
          endDate,
          orderNo: Number(orderNo),
        });
        toast.success(`Term "${termName}" created!`);
        setTermData((prev) => ({
          ...prev,
          termName: "",
          startDate: "",
          endDate: "",
          orderNo: prev.orderNo + 1,
        }));
        fetchTermsForSetup(branchAcademicYearId);
      } else if (confirmModal.type === "saveMapping") {
        const { branchAcademicYearId, gradeId, selectedTermIds } = mappingData;
        const termIds = selectedTermIds
          .map((t) => parseInt(t.id))
          .filter((id) => !isNaN(id));
        await api.post(
          `/api/academic-years/${branchAcademicYearId}/branch-grades/${gradeId}/terms`,
          { academicTermIds: termIds }
        );
        toast.success("Grade mapping updated!");
        setMappingData((prev) => ({
          ...prev,
          gradeId: "",
          selectedTermIds: [{ id: "" }],
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
      setConfirmModal({ show: false, type: null, data: null });
    }
  };

  const fetchTermsForSetup = async (branchYearId) => {
    if (!branchYearId) {
      setExistingTerms([]);
      return;
    }
    setLoadingTerms(true);
    try {
      const res = await api.get(
        `/api/branch-academic-years/${branchYearId}/terms`
      );
      setExistingTerms(res.data || []);
    } catch (e) {
      console.error("Failed to load terms");
    } finally {
      setLoadingTerms(false);
    }
  };

  // --- UI COMPONENTS ---
  const Pagination = ({ totalItems }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className={`p-2 rounded-xl border transition-all ${
            isDark
              ? "border-white/10 hover:bg-white/5"
              : "border-gray-200 hover:bg-gray-50"
          } disabled:opacity-30`}
        >
          <ChevronLeft size={16} />
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${
              currentPage === i + 1
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : isDark
                ? "text-gray-500 hover:text-white"
                : "text-gray-400 hover:text-black"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className={`p-2 rounded-xl border transition-all ${
            isDark
              ? "border-white/10 hover:bg-white/5"
              : "border-gray-200 hover:bg-gray-50"
          } disabled:opacity-30`}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
  };

  const CustomTable = ({ headers, data, renderRow }) => (
    <div
      className={`overflow-hidden rounded-3xl border ${
        isDark ? "border-white/5 bg-white/2" : "border-gray-100 bg-white"
      }`}
    >
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className={`${isDark ? "bg-white/5" : "bg-gray-50/50"}`}>
            {headers.map((h, i) => (
              <th
                key={i}
                className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data
            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            .map((item, idx) => renderRow(item, idx))}
        </tbody>
      </table>
    </div>
  );

  // --- STYLES ---
  const cardClass = `p-8 rounded-[2.5rem] border transition-all duration-500 ${
    isDark
      ? "bg-[#0F0F11] border-white/5 shadow-2xl shadow-black/50"
      : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"
  }`;
  const inputClass = `w-full p-4 rounded-2xl border outline-none transition-all text-sm font-medium ${
    isDark
      ? "bg-white/5 border-white/10 focus:border-primary/50 text-white [color-scheme:dark]"
      : "bg-gray-50 border-gray-200 focus:border-primary focus:bg-white text-gray-900"
  }`;
  const optionClass = isDark
    ? "bg-[#1A1A1C] text-white"
    : "bg-white text-gray-900";
  const labelClass =
    "text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-2 block ml-1";

  if (loadingGlobal)
    return (
      <div className="h-screen flex items-center justify-center bg-[#09090B]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );

  return (
    <div
      className={`min-h-screen pb-20 transition-colors duration-500 ${
        isDark ? "bg-[#09090B] text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #FBCB8433; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #FBCB84; }
      `}</style>

      <Toaster position="top-right" />

      {/* CONFIRMATION MODAL */}
      <AnimatePresence>
        {confirmModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setConfirmModal({ show: false })}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`relative w-full max-w-md p-8 rounded-[2.5rem] border ${
                isDark
                  ? "bg-[#161618] border-white/10"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 mx-auto">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-black text-center mb-2">
                Confirm Action
              </h3>
              <p className="text-gray-400 text-center text-sm mb-8 font-medium">
                Are you sure you want to proceed? This will update the
                infrastructure configuration for the selected branch.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmModal({ show: false })}
                  className={`flex-1 py-4 rounded-2xl font-bold text-sm ${
                    isDark
                      ? "bg-white/5 hover:bg-white/10"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={processAction}
                  disabled={isSubmitting}
                  className="flex-1 py-4 rounded-2xl font-bold text-sm bg-primary text-white shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      {/* --- UPDATED SELECTOR SECTION --- */}
      <div
        className={`sticky top-0 z-10 border-b backdrop-blur-3xl ${
          isDark
            ? "bg-[#09090B]/90 border-white/10"
            : "bg-white/90 border-gray-200"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Branding & Breadcrumbs */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
              <Settings2 size={20} />
            </div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tighter">
                Infrastructure{" "}
                <span className="text-primary italic">Manager</span>
              </h1>
              <AutoBreadcrumb />
            </div>
          </div>

          {/* Center/Right: The Selection Command Center */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Information Toggle */}
            {/* <button 
        onClick={() => setShowInfo(!showInfo)} 
        className={`p-3 rounded-2xl border transition-all duration-300 ${
          showInfo 
            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
            : isDark ? "bg-white/5 border-white/10 text-gray-400 hover:border-primary/50" : "bg-gray-50 border-gray-200 text-gray-500 hover:border-primary"
        }`}
      >
        <Info size={18} />
      </button> */}

            {/* 1. Campus Selector Card */}
            <div
              className={`group relative flex items-center gap-3 pl-4 pr-2 py-1.5 rounded-2xl border transition-all duration-500 ${
                selectedCampusId
                  ? "border-primary/50 bg-primary/5 shadow-[0_0_20px_-10px_rgba(251,203,132,0.3)]"
                  : isDark
                  ? "bg-white/5 border-white/10"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div
                className={`${
                  selectedCampusId ? "text-primary" : "text-gray-500"
                } transition-colors`}
              >
                <School size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-[7px] font-black uppercase tracking-[0.2em] text-gray-500 mb-[-2px]">
                  Institution
                </span>
                <select
                  value={selectedCampusId}
                  onChange={(e) => setSelectedCampusId(e.target.value)}
                  className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none pr-6 cursor-pointer appearance-none min-w-[120px]"
                >
                  <option className={optionClass} value="">
                    Select Campus
                  </option>
                  {campuses?.map((c) => (
                    <option
                      className={optionClass}
                      key={c.campusId}
                      value={c.campusId}
                    >
                      {c.campusName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="absolute right-3 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
                <ChevronDown size={12} />
              </div>
            </div>

            {/* 2. Board & Medium Selector Card (Animated Entrance) */}
            <AnimatePresence>
              {selectedCampusId && (
                <motion.div
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -10 }}
                  className={`group relative flex items-center gap-3 pl-4 pr-2 py-1.5 rounded-2xl border transition-all duration-500 ${
                    selectedBranchId
                      ? "border-primary bg-primary/10 shadow-[0_0_25px_-5px_rgba(251,203,132,0.4)]"
                      : "border-primary/40 bg-primary/5"
                  }`}
                >
                  <div className="text-primary animate-pulse">
                    <Layers size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[7px] font-black uppercase tracking-[0.2em] text-primary/70 mb-[-2px]">
                      Board & Medium
                    </span>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => {
                        setSelectedBranchId(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="bg-transparent text-[10px] font-bold uppercase tracking-widest outline-none pr-8 cursor-pointer appearance-none max-w-[180px] truncate"
                    >
                      <option className={optionClass} value="">
                        Assign Board...
                      </option>
                      {availableBranches.map((b) => (
                        <option
                          className={optionClass}
                          key={b.id}
                          value={b.id}
                        >{`${b.boardName} • ${b.mediumName}`}</option>
                      ))}
                    </select>
                  </div>
                  <div className="absolute right-3 pointer-events-none text-primary">
                    <ChevronDown size={12} />
                  </div>

                  {/* Success indicator when fully selected */}
                  {selectedBranchId && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-primary text-[#09090B] rounded-full p-0.5 border-2 border-[#09090B]"
                    >
                      <CheckCircle2 size={10} strokeWidth={4} />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Vertical Divider */}
            <div
              className={`h-8 w-[1px] mx-2 ${
                isDark ? "bg-white/10" : "bg-gray-200"
              }`}
            />

            {/* Navigation Tabs */}
            <nav
              className={`flex p-1 rounded-2xl ${
                isDark ? "bg-white/5" : "bg-gray-100"
              }`}
            >
              {tabConfig.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-lg shadow-primary/30"
                      : "text-gray-500 hover:text-primary"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto mt-12 px-6">
        {/* INFO BOX */}
        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-12"
            >
              <div
                className={`p-8 rounded-[2.5rem] border-2 border-dashed ${
                  isDark
                    ? "bg-primary/5 border-primary/20"
                    : "bg-primary/5 border-primary/10"
                }`}
              >
                <h4 className="text-primary font-black uppercase text-xs mb-4 flex items-center gap-2">
                  <LayoutGrid size={16} /> Infrastructure Architecture
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      t: "Year Assign",
                      d: "Maps global academic years to specific branch boards and mediums with custom date ranges.",
                    },
                    {
                      t: "Create Terms",
                      d: "Breaks down a branch year into terms (e.g., Sem 1, Final) with specific start/end dates.",
                    },
                    {
                      t: "Term Mapping",
                      d: "The final link: assigns which terms are applicable to which grades for progress tracking.",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-2xl ${
                        isDark ? "bg-white/5" : "bg-white shadow-sm"
                      }`}
                    >
                      <span className="text-[10px] font-black text-primary uppercase mb-1 block">
                        {item.t}
                      </span>
                      <p className="text-xs text-gray-500 leading-relaxed font-medium">
                        {item.d}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedBranchId ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 border-2 border-dashed border-gray-200 rounded-[3rem] bg-white/5"
          >
            <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
              <Layers size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-400">
              Context Required
            </h3>
            <p className="text-gray-500 text-sm mt-2">
              Select a Campus and Board/Medium from the top bar to manage
              infrastructure.
            </p>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "setup" && (
              <div className="space-y-12">
                {/* TOP PANEL: Year Assignment Form */}
                <motion.div
                  key="setup"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}
                >
                  {/* Unified Header */}
                  <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-primary/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <h3 className="font-black uppercase text-title-table tracking-widest">
                          Year Assignment
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => refreshBranchContext(selectedBranchId)}
                      className="p-3 bg-primary/10 rounded-xl text-primary hover:rotate-180 transition-all duration-700 active:scale-90"
                    >
                      <RefreshCw size={18} />
                    </button>
                  </div>

                  {/* Form Section */}
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">
                          Global Academic Session
                        </label>
                        <select
                          className={`w-full h-11 px-4 rounded-xl text-small-table uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                          value={assignData.academicYearId}
                          onChange={(e) =>
                            setAssignData({
                              ...assignData,
                              academicYearId: e.target.value,
                            })
                          }
                        >
                          <option value="">Choose Session...</option>
                          {globalYears.map((y) => (
                            <option
                              key={y.id}
                              value={y.id}
                              disabled={!y.active}
                            >
                              {y.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          className={`w-full h-11 px-4 rounded-xl text-small-table uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                          value={assignData.startDate}
                          onChange={(e) =>
                            setAssignData({
                              ...assignData,
                              startDate: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          className={`w-full h-11 px-4 rounded-xl text-small-table uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                          value={assignData.endDate}
                          onChange={(e) =>
                            setAssignData({
                              ...assignData,
                              endDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => openConfirm("assignYear")}
                      className="w-full h-12 bg-primary text-white rounded-xl font-black text-button uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                    >
                      <Save size={18} />
                      Sync Branch Year
                    </button>
                  </div>
                </motion.div>

                {/* BOTTOM PANEL: Active Sessions Table */}
                <div
                  className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}
                >
                  <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-primary/5">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Activity size={18} />
                    </div>
                    <h3 className="font-black uppercase text-title-table tracking-widest">
                      Active Branch Sessions
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr
                          className={`${theme.tableHeader} text-heding-table font-black uppercase text-slate-500 tracking-widest`}
                        >
                          <th className="px-8 py-5">Session Name</th>
                          <th className="px-8 py-5">Duration</th>
                          <th className="px-8 py-5 text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {assignedYearsList.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-8 py-20 text-center opacity-30 font-black uppercase text-[10px] tracking-widest"
                            >
                              No active branch sessions found
                            </td>
                          </tr>
                        ) : (
                          assignedYearsList.map((item) => (
                            <tr
                              key={item.id}
                              className={`transition-colors ${theme.rowHover}`}
                            >
                              <td className="px-8 py-6">
                                <span className="text-small-table uppercase tracking-tight">
                                  {item.academicYear?.name}
                                </span>
                              </td>
                              <td className="px-8 py-6">
                                <span className="text-small-table text-slate-500 uppercase">
                                  {item.startDate} — {item.endDate}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-green-500/30 text-green-500 bg-green-500/5">
                                  <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                                  <span className="text-small-table uppercase">
                                    Active
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "terms" && (
              <div className="space-y-12">
                {/* TOP PANEL: Create Branch Terms Form */}
                <motion.div
                  key="terms"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}
                >
                  {/* Unified Header */}
                  <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-primary/5">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <PlusCircle size={18} />
                    </div>
                    <div>
                      <h3 className="font-black uppercase text-title-table tracking-widest">
                        Create Branch Terms
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                        Define academic periods for the selected branch session
                      </p>
                    </div>
                  </div>

                  {/* Form Section */}
                  <div className="p-8 space-y-6">
                    <div className="space-y-6">
                      {/* Row 1: Select Branch Session (Full Width) */}
                      <div className="space-y-1">
                        <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">
                          Select Branch Session
                        </label>
                        <select
                          className={`w-full h-11 px-4 rounded-xl text-[11px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                          value={termData.branchAcademicYearId}
                          onChange={(e) => {
                            setTermData({
                              ...termData,
                              branchAcademicYearId: e.target.value,
                            });
                            fetchTermsForSetup(e.target.value);
                          }}
                        >
                          <option value="">Select a year...</option>
                          {branchYears.map((y) => (
                            <option key={y.id} value={y.id}>
                              {y.academicYear?.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Row 2: Term Name and Order (Split 3:1) */}
                      <div className="grid grid-cols-4 gap-6">
                        <div className="col-span-3 space-y-1">
                          <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">
                            Term Name
                          </label>
                          <input
                            type="text"
                            placeholder="E.G. TERM 01"
                            className={`w-full h-11 px-4 rounded-xl text-[11px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                            value={termData.termName}
                            onChange={(e) =>
                              setTermData({
                                ...termData,
                                termName: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="col-span-1 space-y-1">
                          <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">
                            Order
                          </label>
                          <input
                            type="number"
                            className={`w-full h-11 px-4 rounded-xl text-[11px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                            value={termData.orderNo}
                            onChange={(e) =>
                              setTermData({
                                ...termData,
                                orderNo: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      {/* Row 3: Timeline Start and Timeline End (Split 1:1) */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                          <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">
                            Timeline Start
                          </label>
                          <input
                            type="date"
                            className={`w-full h-11 px-4 rounded-xl text-[11px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                            value={termData.startDate}
                            onChange={(e) =>
                              setTermData({
                                ...termData,
                                startDate: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">
                            Timeline End
                          </label>
                          <input
                            type="date"
                            className={`w-full h-11 px-4 rounded-xl text-[11px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                            value={termData.endDate}
                            onChange={(e) =>
                              setTermData({
                                ...termData,
                                endDate: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => openConfirm("createTerm")}
                      className="w-full h-12 bg-primary text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                    >
                      <PlusCircle size={18} />
                      Register New Term
                    </button>
                  </div>
                </motion.div>

                {/* BOTTOM PANEL: Existing Terms Table */}
                <div
                  className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}
                >
                  <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-primary/5">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Activity size={18} />
                    </div>
                    <h3 className="font-black uppercase text-title-table tracking-widest">
                      Existing Terms for Session
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr
                          className={`${theme.tableHeader} text-heding-table font-black uppercase text-slate-500 tracking-widest`}
                        >
                          <th className="px-8 py-5">Order</th>
                          <th className="px-8 py-5">Term Name</th>
                          <th className="px-8 py-5">Timeline</th>
                          <th className="px-8 py-5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {existingTerms.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-8 py-20 text-center opacity-30 font-black uppercase text-[10px] tracking-widest"
                            >
                              No terms configured for this session
                            </td>
                          </tr>
                        ) : (
                          existingTerms.map((term) => (
                            <tr
                              key={term.id}
                              className={`transition-colors ${theme.rowHover}`}
                            >
                              <td className="px-8 py-6">
                                <span className="text-small-table text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                                  0{term.orderNo}
                                </span>
                              </td>
                              <td className="px-8 py-6">
                                <span className="text-small-table uppercase tracking-tight">
                                  {term.name}
                                </span>
                              </td>
                              <td className="px-8 py-6">
                                <span className="text-small-table text-slate-500 uppercase tracking-tight">
                                  {term.startDate} — {term.endDate}
                                </span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                <button className="inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-90 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  {/* Optional Pagination Footer inside the panel */}
                  <div className="p-4 border-t border-white/5 bg-primary/[0.02]">
                    <Pagination totalItems={existingTerms.length} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "mapping" && (
              <motion.div
                key="mapping"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}
              >
                {/* Unified Header */}
                <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <Layers size={18} />
                    </div>
                    <div>
                      <h3 className="font-black uppercase text-title-table tracking-widest">
                        Grade Mapping
                      </h3>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                        Link specific terms to grades for results
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      setMappingData((p) => ({
                        ...p,
                        selectedTermIds: [...p.selectedTermIds, { id: "" }],
                      }))
                    }
                    className="h-10 px-5 bg-primary text-white text-[10px] font-black uppercase rounded-xl flex items-center gap-2 hover:shadow-lg hover:shadow-primary/20 active:scale-95 transition-all"
                  >
                    <Plus size={14} /> Add Mapping Row
                  </button>
                </div>

                <div className="p-8 space-y-8">
                  {/* Row 1: Session and Grade Selectors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">
                        Target Session
                      </label>
                      <select
                        className={`w-full h-11 px-4 rounded-xl text-[11px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                        value={mappingData.branchAcademicYearId}
                        onChange={(e) => {
                          setMappingData((prev) => ({
                            ...prev,
                            branchAcademicYearId: e.target.value,
                            selectedTermIds: [{ id: "" }],
                          }));
                          api
                            .get(
                              `/api/branch-academic-years/${e.target.value}/terms`
                            )
                            .then((res) => setMappingTerms(res.data));
                        }}
                      >
                        <option value="">Choose Session...</option>
                        {branchYears.map((by) => (
                          <option key={by.id} value={by.id}>
                            {by.academicYear?.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">
                        Target Grade
                      </label>
                      <select
                        className={`w-full h-11 px-4 rounded-xl text-[11px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                        value={mappingData.gradeId}
                        onChange={(e) =>
                          setMappingData({
                            ...mappingData,
                            gradeId: e.target.value,
                          })
                        }
                      >
                        <option value="">Choose Grade...</option>
                        {mappingGrades.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.gradeName}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Mapping Rows */}
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">
                      Active Mapping Nodes
                    </label>
                    {mappingData.selectedTermIds.map((row, idx) => (
                      <motion.div
                        layout
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3 items-center"
                      >
                        <div className="flex-1 relative group">
                          <select
                            className={`w-full h-11 px-4 rounded-xl text-[11px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                            value={row.id}
                            onChange={(e) => {
                              const list = [...mappingData.selectedTermIds];
                              list[idx].id = e.target.value;
                              setMappingData({
                                ...mappingData,
                                selectedTermIds: list,
                              });
                            }}
                          >
                            <option value="">Select term to map...</option>
                            {mappingTerms.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => {
                            const list = mappingData.selectedTermIds.filter(
                              (_, i) => i !== idx
                            );
                            setMappingData({
                              ...mappingData,
                              selectedTermIds: list.length
                                ? list
                                : [{ id: "" }],
                            });
                          }}
                          className="w-11 h-11 flex items-center justify-center text-rose-500 bg-rose-500/5 hover:bg-rose-500 hover:text-white rounded-xl transition-all active:scale-90 border border-rose-500/10"
                        >
                          <X size={18} />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  <button
                    onClick={() => openConfirm("saveMapping")}
                    className="w-full h-12 bg-primary text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                  >
                    <Save size={18} />
                    Deploy Grade Mappings
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default InfrastructureManager;
