import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  RefreshCcw,
  GitBranch,
  Tag,
  Loader2,
  Search,
  Info,
  ChevronRight,
  Zap,
  Layers,
  Settings2,
  Languages,
  Building2,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  BarChart3,
  Globe,
  School,
  GraduationCap,
  Filter,
  X,
  AlertCircle,
  Power,
  PowerOff,
  ListChecks,
  Link as LinkIcon,
  LayoutDashboard,
  Activity,
  ArrowRight,
  Eye,
  Milestone,
  HelpCircle,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import api from "../../../../config/api";
import AutoBreadcrumb from "../../../../components/common/AutoBreadcrumb";

const UnifiedBranchManager = () => {
  const themeMode = useSelector((state) => state.color.mode);
  const { campuses } = useSelector((state) => state.campus);
  const isDark = themeMode === "dark";

  // --- GLOBAL STATE ---
  const [activeTab, setActiveTab] = useState("setup");
  const [allApiBranches, setAllApiBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [globalLoading, setGlobalLoading] = useState(true);

  // --- NEW: CONFIRMATION DIALOG STATE ---
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
  });

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

  const closeConfirm = () => setConfirmModal({ ...confirmModal, show: false });

  const askConfirmation = (title, message, action) => {
    setConfirmModal({
      show: true,
      title,
      message,
      onConfirm: () => {
        action();
        closeConfirm();
      },
    });
  };

  // --- FILTERED BRANCHES LOGIC ---
  const authorizedBranches = useMemo(() => {
    if (!campuses || campuses.length === 0) return [];
    const authorizedIds = campuses.map((c) => c.campusId);
    return allApiBranches.filter((branch) =>
      authorizedIds.includes(branch.campusId)
    );
  }, [allApiBranches, campuses]);

  // --- STEP NAVIGATION STATE ---
  const [showNextStepPopup, setShowNextStepPopup] = useState(false);
  const [nextStepName, setNextStepName] = useState("");
  const tabsOrder = [
    "setup",
    "grades",
    "streams",
    "assignments",
    "labels",
    "levels",
  ];

  // --- MODULE SPECIFIC STATES ---
  const [setupData, setSetupData] = useState({ boards: [], mediums: [] });
  const [formSetup, setFormSetup] = useState({
    campusId: "",
    boardId: "",
    mediumId: "",
  });
  const [gradeData, setGradeData] = useState({
    allGrades: [],
    branchGrades: [],
    selectedForAssignment: [],
  });
  const [streamData, setStreamData] = useState({
    list: [],
    newStream: { name: "", code: "" },
  });
  const [assignmentData, setAssignmentData] = useState({
    selectedGradeId: "",
    selectedStreamIds: [],
  });
  const [labelData, setLabelData] = useState({
    grades: [],
    labels: {},
    quickFill: "",
  });
  const [levelData, setLevelData] = useState({
    levels: [],
    selectedLevel: "",
    selectedGradesForLevel: [],
  });
  const [processing, setProcessing] = useState(false);

  const cardStyles = isDark
    ? "bg-[#1C1C1E]/80 border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl"
    : "bg-white border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] backdrop-blur-md";
  const inputStyles = isDark
    ? "bg-[#2C2C2E] border-white/5 text-white focus:border-primary/50 focus:ring-2 focus:ring-primary/20 placeholder:text-gray-600"
    : "bg-gray-50 border-gray-200 text-gray-900 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/5";

  const fetchInitialData = useCallback(async () => {
    setGlobalLoading(true);
    try {
      const [bRes, bdRes, mRes, lRes, gRes] = await Promise.all([
        api.get("/api/branches"),
        api.get("/api/boards/view-all"),
        api.get("/api/mediums/view-all-mediums"),
        api.get("/api/academic-levels"),
        api.get("/api/grades"),
      ]);
      setAllApiBranches(bRes.data || []);
      setSetupData({ boards: bdRes.data || [], mediums: mRes.data || [] });
      setLevelData((prev) => ({ ...prev, levels: lRes.data || [] }));
      setGradeData((prev) => ({ ...prev, allGrades: gRes.data || [] }));
    } catch (error) {
      toast.error("Data synchronization failed.");
    } finally {
      setGlobalLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleBranchChange = async (branchId) => {
    setSelectedBranchId(branchId);
    if (!branchId) return;
    setProcessing(true);
    try {
      const [structRes, sRes, bgRes] = await Promise.all([
        api.get(`/api/branches/${branchId}/structure`),
        api.get(`/api/branches/${branchId}/streams`),
        api.get(`/api/branches/${branchId}/grades`),
      ]);
      const structure = structRes.data.grades || [];
      const rawBranchGrades = bgRes.data || [];
      const labels = {};

      const gradeMappingWithLevels = rawBranchGrades.map((bg) => {
        const structInfo = structure.find((s) => s.branchGradeId === bg.id);
        labels[bg.id] = structInfo?.label || "";
        return {
          ...bg,
          academicLevelName: structInfo?.academicLevel || "Not Assigned",
          currentStreams: structInfo?.streams || [],
        };
      });

      setGradeData((prev) => ({
        ...prev,
        branchGrades: gradeMappingWithLevels,
        selectedForAssignment: rawBranchGrades.map((g) => g.gradeId || g.id),
      }));
      setStreamData((prev) => ({ ...prev, list: sRes.data || [] }));
      setLabelData({ grades: gradeMappingWithLevels, labels, quickFill: "" });
      setAssignmentData({ selectedGradeId: "", selectedStreamIds: [] });
    } catch (error) {
      toast.error("Failed to fetch branch structure.");
    } finally {
      setProcessing(false);
    }
  };

  const triggerNextStep = (currentTab) => {
    const currentIndex = tabsOrder.indexOf(currentTab);
    if (currentIndex < tabsOrder.length - 1) {
      setNextStepName(tabsOrder[currentIndex + 1]);
      setShowNextStepPopup(true);
    }
  };

  // --- ACTIONS WITH CONFIRMATION ---

  const onCreateBranch = async (e) => {
    if (e) e.preventDefault();
    askConfirmation(
      "Initialize Infrastructure?",
      "This will create a new branch configuration for the selected campus, board, and medium.",
      async () => {
        setProcessing(true);
        try {
          await api.post("/api/branches", formSetup);
          toast.success("Branch Infrastructure Initialized!");
          const bRes = await api.get("/api/branches");
          setAllApiBranches(bRes.data || []);
          setFormSetup({ campusId: "", boardId: "", mediumId: "" });
          triggerNextStep("setup");
        } catch (err) {
          toast.error("Branch creation failed");
        } finally {
          setProcessing(false);
        }
      }
    );
  };

  const onAssignGrades = async () => {
    askConfirmation(
      "Sync Grades?",
      "Are you sure you want to update the grade enrollment for this branch?",
      async () => {
        setProcessing(true);
        try {
          await api.post(`/api/branches/${selectedBranchId}/grades`, {
            gradeIds: gradeData.selectedForAssignment,
          });
          toast.success("Branch grades updated successfully");
          await handleBranchChange(selectedBranchId);
          triggerNextStep("grades");
        } catch (err) {
          toast.error("Failed to assign grades");
        } finally {
          setProcessing(false);
        }
      }
    );
  };

  const toggleGradeStatus = async (mappingId, currentStatus) => {
    const action = currentStatus ? "deactivate" : "activate";
    askConfirmation(
      `${action.toUpperCase()} Grade?`,
      `Are you sure you want to ${action} this grade?`,
      async () => {
        setProcessing(true);
        try {
          await api.patch(`/api/branches/branch-grades/${mappingId}/${action}`);
          toast.success(`Grade status: ${action}d`);
          handleBranchChange(selectedBranchId);
        } catch (err) {
          toast.error(`Failed to change status`);
        } finally {
          setProcessing(false);
        }
      }
    );
  };

  const onCreateStream = async (e) => {
    if (e) e.preventDefault();
    setProcessing(true);
    try {
      await api.post(
        `/api/branches/${selectedBranchId}/streams`,
        streamData.newStream
      );
      toast.success("Stream added");
      setStreamData((prev) => ({ ...prev, newStream: { name: "", code: "" } }));
      await handleBranchChange(selectedBranchId);
      triggerNextStep("streams");
    } catch (err) {
      toast.error("Stream creation failed");
    } finally {
      setProcessing(false);
    }
  };

  const onDeleteStream = async (streamId) => {
    askConfirmation(
      "Remove Stream?",
      "This action cannot be undone. Are you sure you want to remove this stream?",
      async () => {
        setProcessing(true);
        try {
          await api.delete(`/api/branches/streams/${streamId}`);
          toast.success("Stream removed");
          handleBranchChange(selectedBranchId);
        } catch (err) {
          toast.error("Delete failed");
        } finally {
          setProcessing(false);
        }
      }
    );
  };

  const onAssignStreamToGrade = async () => {
    if (
      !assignmentData.selectedGradeId ||
      assignmentData.selectedStreamIds.length === 0
    ) {
      return toast.error("Select a grade and at least one stream");
    }
    askConfirmation(
      "Update Linkages?",
      "Apply stream assignments to the selected grade?",
      async () => {
        setProcessing(true);
        try {
          await Promise.all(
            assignmentData.selectedStreamIds.map((streamId) =>
              api.post(
                `/api/branch-grades/${assignmentData.selectedGradeId}/streams/${streamId}`
              )
            )
          );
          toast.success("All selected streams linked successfully! 🎉");
          setAssignmentData((prev) => ({ ...prev, selectedStreamIds: [] }));
          await handleBranchChange(selectedBranchId);
          triggerNextStep("assignments");
        } catch (err) {
          toast.error(err.response?.data?.message || "Assignment failed");
        } finally {
          setProcessing(false);
        }
      }
    );
  };

  const onSaveLabels = async () => {
    if (!labelData.quickFill.trim()) return toast.error("Enter a label");
    askConfirmation(
      "Batch Update Labels?",
      "This will apply the alias to ALL grades in this branch.",
      async () => {
        setProcessing(true);
        try {
          await Promise.all(
            labelData.grades.map((g) =>
              api.post(`/api/bglabel/branch-grades/${g.id}/label`, {
                displayName: labelData.quickFill,
              })
            )
          );
          toast.success("Labels synced");
          await handleBranchChange(selectedBranchId);
          triggerNextStep("labels");
        } catch (err) {
          toast.error("Batch update failed");
        } finally {
          setProcessing(false);
        }
      }
    );
  };

  const onAuthorizeLevelMapping = async () => {
    if (!levelData.selectedLevel)
      return toast.error("Please select an Academic Level first");
    if (levelData.selectedGradesForLevel.length === 0)
      return toast.error("Please select at least one grade to map");

    askConfirmation(
      "Confirm Level Mapping?",
      "Map the selected grades to the specified academic level?",
      async () => {
        setProcessing(true);
        try {
          await api.post(`/api/branch-grades/level`, {
            academicLevelId: levelData.selectedLevel,
            branchGradeIds: levelData.selectedGradesForLevel,
          });
          toast.success(`Mapped grades to level successfully`);
          setLevelData((prev) => ({ ...prev, selectedGradesForLevel: [] }));
          handleBranchChange(selectedBranchId);
        } catch (err) {
          toast.error("Level assignment failed");
        } finally {
          setProcessing(false);
        }
      }
    );
  };

  const toggleLevelGradeSelection = (gradeId) => {
    setLevelData((prev) => {
      const isSelected = prev.selectedGradesForLevel.includes(gradeId);
      return {
        ...prev,
        selectedGradesForLevel: isSelected
          ? prev.selectedGradesForLevel.filter((id) => id !== gradeId)
          : [...prev.selectedGradesForLevel, gradeId],
      };
    });
  };

  if (globalLoading)
    return (
      <div
        className={`h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 ${
          isDark ? "bg-[#09090B]" : "bg-gray-50"
        }`}
      >
        <div className="relative">
          <div className="absolute inset-0 blur-2xl bg-primary/20 animate-pulse"></div>
          <Loader2
            className="animate-spin text-primary relative"
            size={56}
            strokeWidth={1.5}
          />
        </div>
        <p className="mt-6 font-black tracking-[0.3em] uppercase text-[10px] text-primary animate-pulse">
          Initializing Engine
        </p>
      </div>
    );

  return (
    <div>
      <Toaster position="top-right" />

      {/* --- GLOBAL CONFIRMATION DIALOG --- */}
      {confirmModal.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className={`${cardStyles} p-8 rounded-[2rem] max-w-md w-full border border-primary/20 shadow-2xl`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mb-4 text-rose-500">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-black uppercase mb-2">
                {confirmModal.title}
              </h3>
              <p className="text-sm text-gray-500 mb-8">
                {confirmModal.message}
              </p>
              <div className="flex gap-4 w-full">
                <button
                  onClick={closeConfirm}
                  className="flex-1 px-6 py-4 rounded-xl font-black uppercase text-xs border border-gray-500/20 hover:bg-gray-500/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 px-6 py-4 rounded-xl font-black uppercase text-xs bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNextStepPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
          <div
            className={`${cardStyles} p-8 rounded-[2rem] max-w-sm w-full border border-primary/20 shadow-2xl transform transition-all scale-100`}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 text-primary animate-bounce">
                <Milestone size={32} />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                Success!
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Configuration saved. Would you like to proceed to the next setup
                phase?
              </p>
              <button
                onClick={() => {
                  setActiveTab(nextStepName);
                  setShowNextStepPopup(false);
                }}
                className="w-full bg-primary text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 group hover:gap-4 transition-all"
              >
                GO TO {nextStepName.toUpperCase()} <ArrowRight size={18} />
              </button>
              <button
                onClick={() => setShowNextStepPopup(false)}
                className="mt-4 text-[10px] font-black uppercase text-gray-400 hover:text-primary transition-colors"
              >
                Stay on current page
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-10 backdrop-blur-xl px-6 py-4">
        {/* <div className={`border-b ${isDark ? "bg-[#09090B]/80 border-white/5" : "bg-white/80 border-gray-200"} sticky top-0 z-50 backdrop-blur-xl px-6 py-4`}> */}
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="group">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20">
                <Settings2 className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-heading font-black uppercase tracking-tight">
                  Infrastructure <span className="text-primary">Manager</span>
                </h1>
              </div>
            </div>
          </div>
          <div
            className={`flex p-1.5 rounded-[1rem] ${
              isDark ? "bg-white/5" : "bg-gray-100"
            } overflow-x-auto no-scrollbar border ${
              isDark ? "border-white/5" : "border-gray-200"
            }`}
          >
            {tabsOrder.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-[0.75rem] text-[11px] font-black transition-all uppercase whitespace-nowrap tracking-wider ${
                  activeTab === tab
                    ? "bg-primary text-white shadow-lg"
                    : "text-gray-500 hover:text-primary"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* --- INFORMATION BOX --- */}
        {/* <div className={`p-6 rounded-[2rem] border-2 border-dashed ${isDark ? "border-primary/20 bg-primary/5" : "border-primary/10 bg-white"} flex flex-col md:flex-row items-center gap-6`}>
           <div className="p-4 bg-primary rounded-2xl text-white shadow-xl shadow-primary/20">
              <Info size={32} />
           </div>
           <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-black uppercase tracking-tight text-primary">Unified Infrastructure Console</h3>
              <p className="text-xs font-bold text-gray-500 uppercase mt-1 leading-relaxed">
                A centralized engine for managing multi-campus school architecture. 
                Use this module to define <b>Branches</b> (Campus-Board-Medium unique pairs), enroll <b>Grades</b>, create specialized <b>Streams</b>, 
                assign <b>Academic Levels</b>, and manage <b>Display Aliases</b> across the entire organization.
              </p>
           </div>
           <div className="hidden lg:grid grid-cols-2 gap-2">
              <div className="px-4 py-2 bg-black/5 dark:bg-white/5 rounded-lg text-[9px] font-black uppercase">Step-by-Step Flow</div>
              <div className="px-4 py-2 bg-black/5 dark:bg-white/5 rounded-lg text-[9px] font-black uppercase">Redux Protected</div>
           </div>
        </div> */}

        {/* CONTEXT SELECTOR */}
        {activeTab !== "setup" && (
          <div
            className={`group relative p-1 rounded-2xl border transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] ${cardStyles} flex flex-col md:flex-row items-center gap-2`}
          >
            <div className="flex items-center gap-4 px-6 py-4 border-r border-dashed border-gray-500/20">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Building2 className="text-primary" size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 leading-none">
                  Context
                </span>
                <span className="text-[9px] font-bold text-gray-500 uppercase mt-1">
                  Infrastructure
                </span>
              </div>
            </div>
            <div className="relative flex-1 w-full group/select">
              <select
                value={selectedBranchId}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="w-full bg-transparent text-small-table pl-6 pr-12 py-4 outline-none cursor-pointer appearance-none transition-colors hover:text-primary focus:text-primary"
              >
                <option
                  value=""
                  className={
                    isDark
                      ? "bg-[#1C1C1E] text-gray-400"
                      : "bg-white text-gray-400"
                  }
                >
                  Select Branch Infrastructure Context...
                </option>
                {authorizedBranches.map((b) => (
                  <option
                    key={b.id}
                    value={b.id}
                    className={
                      isDark
                        ? "bg-[#1C1C1E] text-white"
                        : "bg-white text-gray-900"
                    }
                  >
                    {b.campusName} • {b.boardName} • {b.mediumName}
                  </option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-300 group-hover/select:translate-y-[-40%] group-hover/select:scale-110">
                <ChevronRight size={18} className="text-primary rotate-90" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "setup" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div
              className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}
            >
              {/* Header Section: Title and Search aligned like reference */}
              <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-primary/5">
                <div className="flex items-center gap-3">
                  <LayoutDashboard
                    size={20}
                    className="text-primary opacity-70"
                  />
                  <h3 className="font-black uppercase text-title-table tracking-widest">
                    Infrastructure Directory
                  </h3>
                </div>

                <div className="relative w-full sm:w-80">
                  <input
                    type="text"
                    placeholder="SEARCH NODES..."
                    className={`w-full h-11 pl-10 pr-4 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30"
                    size={14}
                  />
                </div>
              </div>

              {/* Table Section */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr
                      className={`${theme.tableHeader} text-heding-table font-black uppercase text-slate-500 tracking-widest`}
                    >
                      <th className="px-8 py-5">Campus Identity</th>
                      <th className="px-8 py-5">Educational Board</th>
                      <th className="px-8 py-5">Medium</th>
                      <th className="px-8 py-5 text-right">Status State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {authorizedBranches.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-8 py-20 text-center opacity-30 font-black uppercase text-[10px] tracking-widest"
                        >
                          No authorized branch nodes detected
                        </td>
                      </tr>
                    ) : (
                      authorizedBranches.map((b) => (
                        <tr
                          key={b.id}
                          className={`transition-colors ${theme.rowHover}`}
                        >
                          <td className="px-8 py-6">
                            <span className="text-small-table uppercase">
                              {b.campusName}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-small-table uppercase">
                              {b.boardName}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-small-table uppercase">
                              {b.mediumName}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${
                                  b.active
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-red-500"
                                }`}
                              />
                              <span
                                className={`text-small-table px-3 py-1 rounded-full border ${
                                  b.active
                                    ? "border-green-500/30 text-green-500 bg-green-500/5"
                                    : "border-red-500/30 text-red-500 bg-red-500/5"
                                }`}
                              >
                                {b.active ? "ACTIVE" : "OFFLINE"}
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

            <div
              className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}
            >
              {/* Header Section: Matches the Registry Table style */}
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Plus size={18} />
                  </div>
                  <h3 className="font-black uppercase text-title-table tracking-widest">
                    Deploy Branch
                  </h3>
                </div>
              </div>

              {/* Form Content: 2-column grid based on your reference */}
              <form onSubmit={onCreateBranch} className="p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Campus Selection */}
                  <div className="space-y-1">
                    <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">
                      Campus Location
                    </label>
                    <select
                      required
                      value={formSetup.campusId}
                      className={`w-full h-11 px-4 rounded-xl text-[11px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                      onChange={(e) =>
                        setFormSetup({ ...formSetup, campusId: e.target.value })
                      }
                    >
                      <option value="">Select Campus...</option>
                      {campuses?.map((opt) => (
                        <option key={opt.campusId} value={opt.campusId}>
                          {opt.campusName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Academic Board Selection */}
                  <div className="space-y-1">
                    <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">
                      Academic Board
                    </label>
                    <select
                      required
                      value={formSetup.boardId}
                      className={`w-full h-11 px-4 rounded-xl text-[11px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                      onChange={(e) =>
                        setFormSetup({ ...formSetup, boardId: e.target.value })
                      }
                    >
                      <option value="">Select Board...</option>
                      {setupData.boards.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Instruction Medium Selection */}
                  <div className="space-y-1">
                    <label className="text-heding-table font-black uppercase tracking-widest text-slate-500 ml-1">
                      Instruction Medium
                    </label>
                    <select
                      required
                      value={formSetup.mediumId}
                      className={`w-full h-11 px-4 rounded-xl text-[11px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                      onChange={(e) =>
                        setFormSetup({ ...formSetup, mediumId: e.target.value })
                      }
                    >
                      <option value="">Select Medium...</option>
                      {setupData.mediums.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full h-12 bg-primary text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-3"
                  >
                    {processing ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    Initialize Infrastructure
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- GRADES TAB --- */}
        {activeTab === "grades" && selectedBranchId && (
          <div>
            {/* <div className={`p-10 rounded-[2.5rem] border ${cardStyles} animate-in slide-in-from-right-4 duration-700`}> */}
            <div
              className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}
            >
              {/* Header Section */}
              <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <GraduationCap size={20} />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-title-table tracking-widest">
                      Grade Enrollment
                    </h3>
                  </div>
                </div>

                <button
                  onClick={onAssignGrades}
                  disabled={processing}
                  className="w-full sm:w-auto h-11 px-8 bg-primary text-white rounded-xl font-black text-button uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-3"
                >
                  {processing ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  Sync Grades
                </button>
              </div>

              {/* Table Section */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr
                      className={`${theme.tableHeader} text-heding-table uppercase text-slate-500 tracking-widest`}
                    >
                      <th className="px-8 py-5">Grade Entity</th>
                      <th className="px-8 py-5">Enrollment Status</th>
                      <th className="px-8 py-5">Academic Level</th>
                      <th className="px-8 py-5 text-right">Row Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {gradeData.allGrades.map((grade) => {
                      const mapping = gradeData.branchGrades.find(
                        (bg) => bg.gradeId === grade.id
                      );
                      const isEnrolled =
                        !!mapping ||
                        gradeData.selectedForAssignment.includes(grade.id);
                      const isActive = mapping?.active;

                      return (
                        <tr
                          key={grade.id}
                          className={`transition-colors ${theme.rowHover} ${
                            !isEnrolled ? "opacity-60" : ""
                          }`}
                        >
                          {/* Grade Name Column */}
                          <td className="px-8 py-6">
                            <div
                              className="flex items-center gap-4 cursor-pointer group"
                              onClick={() => {
                                const current = [
                                  ...gradeData.selectedForAssignment,
                                ];
                                const next = isEnrolled
                                  ? current.filter((id) => id !== grade.id)
                                  : [...current, grade.id];
                                setGradeData({
                                  ...gradeData,
                                  selectedForAssignment: next,
                                });
                              }}
                            >
                              <span className="text-small-table uppercase text-primary">
                                {grade.gradeName || grade.name}
                              </span>
                            </div>
                          </td>

                          {/* Status Column */}
                          <td className="px-8 py-6">
                            <span className={"text-small-table"}>
                              {isEnrolled ? "ENROLLED" : "AVAILABLE"}
                            </span>
                          </td>

                          {/* Academic Level Column */}
                          <td className="px-8 py-6">
                            {mapping ? (
                              <span className="text-small-table uppercase text-primary">
                                {mapping.academicLevelName}
                              </span>
                            ) : (
                              <span className="text-small-table uppercase opacity-30 italic">
                                Not Linked
                              </span>
                            )}
                          </td>

                          {/* Actions Column */}
                          <td className="px-8 py-6 text-right">
                            {mapping && (
                              <button
                                onClick={() =>
                                  toggleGradeStatus(mapping.id, isActive)
                                }
                                className={`inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-90 shadow-sm ${
                                  isActive
                                    ? "bg-emerald-500 text-white shadow-emerald-500/20"
                                    : "bg-rose-500 text-white shadow-rose-500/20 opacity-60 hover:opacity-100"
                                }`}
                              >
                                {isActive ? (
                                  <Power size={18} />
                                ) : (
                                  <PowerOff size={18} />
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- STREAMS TAB --- */}
        {activeTab === "streams" && selectedBranchId && (
          <div className="grid md:grid-cols-12 gap-8 animate-in zoom-in-95 duration-700">
            {/* Left Panel: New Stream Form */}
            <div
              className={`md:col-span-4 rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}
            >
              <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-primary/5">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Plus size={18} />
                </div>
                <h3 className="font-black uppercase text-title-table tracking-widest">
                  New Stream
                </h3>
              </div>

              <form onSubmit={onCreateStream} className="p-8 space-y-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Stream Name
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="E.G. SCIENCE"
                    className={`w-full h-11 px-4 rounded-xl text-[11px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                    value={streamData.newStream.name}
                    onChange={(e) =>
                      setStreamData({
                        ...streamData,
                        newStream: {
                          ...streamData.newStream,
                          name: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                    Short Code
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="E.G. SCI"
                    className={`w-full h-11 px-4 rounded-xl text-[11px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                    value={streamData.newStream.code}
                    onChange={(e) =>
                      setStreamData({
                        ...streamData,
                        newStream: {
                          ...streamData.newStream,
                          code: e.target.value,
                        },
                      })
                    }
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-12 bg-primary text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 hover:shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-3"
                >
                  <Plus size={18} />
                  Add Stream
                </button>
              </form>
            </div>

            {/* Right Panel: Active Streams Table */}
            <div
              className={`md:col-span-8 rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Activity size={18} />
                  </div>
                  <h3 className="font-black uppercase text-title-table tracking-widest">
                    Active Branch Streams
                  </h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr
                      className={`${theme.tableHeader} text-heding-table font-black uppercase text-slate-500 tracking-widest`}
                    >
                      <th className="px-8 py-5">Code</th>
                      <th className="px-8 py-5">Stream Name</th>
                      <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {streamData.list.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-8 py-20 text-center opacity-30 font-black uppercase text-[10px] tracking-widest"
                        >
                          No streams registered for this branch
                        </td>
                      </tr>
                    ) : (
                      streamData.list.map((s) => (
                        <tr
                          key={s.id}
                          className={`transition-colors ${theme.rowHover}`}
                        >
                          <td className="px-8 py-6">
                            <span className="font-mono text-small-table text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                              {s.code}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-small-table uppercase tracking-tight">
                              {s.name}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button
                              onClick={() => onDeleteStream(s.id)}
                              className="inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-90 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white"
                            >
                              <Trash2 size={18} />
                            </button>
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

        {/* --- ASSIGNMENTS TAB --- */}
        {activeTab === "assignments" && selectedBranchId && (
          <div className="space-y-8">
            {/* Page Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <LinkIcon size={15} />
              </div>
              <h2 className="text-title-table font-black uppercase tracking-tighter">
                Grade-Stream Linking
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Step 1: Target Grade Selection */}
              <div
                className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-primary/5">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold">
                      1
                    </span>
                    <h3 className="font-black uppercase text-title-table tracking-widest">
                      Target Grade
                    </h3>
                  </div>
                </div>

                <div className="p-4 max-h-[500px] overflow-y-auto no-scrollbar space-y-2">
                  {gradeData.branchGrades.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() =>
                        setAssignmentData({
                          ...assignmentData,
                          selectedGradeId: bg.id,
                        })
                      }
                      className={`w-full p-4 rounded-xl border transition-all text-left group ${
                        assignmentData.selectedGradeId === bg.id
                          ? "bg-primary border-primary shadow-lg shadow-primary/20"
                          : `border-white/5 ${theme.rowHover}`
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span
                          className={`text-small-table uppercase ${
                            assignmentData.selectedGradeId === bg.id
                              ? "text-white"
                              : ""
                          }`}
                        >
                          {bg.gradeName}
                        </span>
                        <span
                          className={`text-[10px] font-bold ${
                            assignmentData.selectedGradeId === bg.id
                              ? "text-white/70"
                              : "text-slate-500"
                          }`}
                        >
                          {bg.academicLevelName}
                        </span>
                      </div>

                      {bg.currentStreams?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {bg.currentStreams.map((st) => (
                            <span
                              key={st.id}
                              className={`text-[8px] px-2 py-0.5 rounded-md uppercase font-bold border ${
                                assignmentData.selectedGradeId === bg.id
                                  ? "bg-white/20 border-white/10 text-white"
                                  : "bg-primary/10 border-primary/10 text-primary"
                              }`}
                            >
                              {st.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Available Streams */}
              <div
                className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}
              >
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-primary/5">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-[10px] font-bold">
                      2
                    </span>
                    <h3 className="font-black uppercase text-title-table tracking-widest">
                      Available Streams
                    </h3>
                  </div>
                </div>

                <div className="p-4 max-h-[420px] overflow-y-auto no-scrollbar space-y-2">
                  {streamData.list.map((stream) => {
                    const isSelected =
                      assignmentData.selectedStreamIds.includes(stream.id);
                    return (
                      <div
                        key={stream.id}
                        onClick={() => {
                          const current = assignmentData.selectedStreamIds;
                          setAssignmentData({
                            ...assignmentData,
                            selectedStreamIds: isSelected
                              ? current.filter((id) => id !== stream.id)
                              : [...current, stream.id],
                          });
                        }}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                          isSelected
                            ? "bg-primary/5 border-primary/30"
                            : `border-white/5 ${theme.rowHover}`
                        }`}
                      >
                        <span
                          className={`text-small-table uppercase ${
                            isSelected ? "text-primary" : ""
                          }`}
                        >
                          {stream.name}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-slate-500/30"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle2 size={12} className="text-white" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-6">
                  <button
                    onClick={onAssignStreamToGrade}
                    disabled={processing || !assignmentData.selectedGradeId}
                    className="w-full h-12 bg-primary text-white rounded-xl font-black text-button uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                  >
                    {processing ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Save size={18} />
                    )}
                    Update Linking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- LABELS TAB --- */}
        {activeTab === "labels" && selectedBranchId && (
          <div className="space-y-8 animate-in zoom-in-95 duration-700">
            {/* Header Panel */}
            <div
              className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}
            >
              <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Tag size={18} />
                  </div>
                  <h3 className="font-black uppercase text-title-table tracking-widest">
                    Batch Alias Labeler
                  </h3>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      placeholder="QUICK FILL LABEL..."
                      value={labelData.quickFill}
                      onChange={(e) =>
                        setLabelData({
                          ...labelData,
                          quickFill: e.target.value,
                        })
                      }
                      className={`w-full h-11 px-4 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                    />
                  </div>
                  <button
                    onClick={onSaveLabels}
                    className="h-11 px-8 bg-primary text-white rounded-xl font-black text-button uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2"
                  >
                    {/* Ensure RefreshCcw is imported from lucide-react */}
                    Sync All
                  </button>
                </div>
              </div>

              {/* Table Section */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr
                      className={`${theme.tableHeader} text-heding-table font-black uppercase text-slate-500 tracking-widest`}
                    >
                      <th className="px-8 py-5">Grade Identity</th>
                      <th className="px-8 py-5 text-right">Computed Alias</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {labelData.grades.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-8 py-20 text-center opacity-30 font-black uppercase text-[10px] tracking-widest"
                        >
                          No active grades detected for labeling
                        </td>
                      </tr>
                    ) : (
                      labelData.grades.map((g) => (
                        <tr
                          key={g.id}
                          className={`transition-colors ${theme.rowHover}`}
                        >
                          <td className="px-8 py-6">
                            <span className="text-small-table uppercase tracking-tighter">
                              {g.gradeName}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="inline-flex items-center gap-3">
                              <span
                                className={`text-small-table px-4 py-2 rounded-lg border transition-all ${
                                  labelData.quickFill || labelData.labels[g.id]
                                    ? "text-primary bg-primary/10 border-primary/20"
                                    : "text-slate-500 bg-slate-500/5 border-white/5 opacity-40"
                                }`}
                              >
                                {labelData.quickFill ||
                                  labelData.labels[g.id] ||
                                  "PENDING_LABEL"}
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

        {/* --- LEVELS TAB --- */}
        {activeTab === "levels" && selectedBranchId && (
          <div className="grid md:grid-cols-5 gap-8 animate-in slide-in-from-bottom-8 duration-700">
            {/* Step 1: Select Academic Level */}
            <div
              className={`md:col-span-2 rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}
            >
              <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-primary/5">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Layers size={18} />
                </div>
                <h3 className="font-black uppercase text-title-table tracking-widest">
                  Select Academic Level
                </h3>
              </div>

              <div className="p-6 space-y-3">
                {levelData.levels.map((l) => (
                  <button
                    key={l.id}
                    onClick={() =>
                      setLevelData({ ...levelData, selectedLevel: l.id })
                    }
                    className={`w-full p-5 rounded-xl border-2 text-left transition-all flex justify-between items-center group ${
                      levelData.selectedLevel === l.id
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                        : `border-white/5 bg-white/5 ${theme.rowHover}`
                    }`}
                  >
                    <span className="text-small-table uppercase tracking-tight">
                      {l.name}
                    </span>
                    {levelData.selectedLevel === l.id && (
                      <CheckCircle2 size={18} className="text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Authorize Grade Mapping */}
            <div
              className={`md:col-span-3 rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <GraduationCap size={18} />
                  </div>
                  <h3 className="font-black uppercase text-title-table tracking-widest">
                    Authorize Grade Mapping
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-h-[400px] overflow-y-auto no-scrollbar pr-1">
                  {gradeData.branchGrades.map((bg) => {
                    const isSelected =
                      levelData.selectedGradesForLevel.includes(bg.id);
                    return (
                      <div
                        key={bg.id}
                        onClick={() => toggleLevelGradeSelection(bg.id)}
                        className={`p-4 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer group ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : `border-white/5 ${theme.rowHover}`
                        }`}
                      >
                        <div className="flex flex-col">
                          <span
                            className={`text-small-table uppercase ${
                              isSelected ? "text-primary" : ""
                            }`}
                          >
                            {bg.gradeName}
                          </span>
                          <span className="text-small-table text-slate-500 uppercase tracking-tighter">
                            Currently: {bg.academicLevelName}
                          </span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-primary border-primary"
                              : "border-slate-500/30"
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle2 size={12} className="text-white" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={onAuthorizeLevelMapping}
                  disabled={processing || !levelData.selectedLevel}
                  className="w-full h-12 bg-primary text-white rounded-xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
                >
                  {processing ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <CheckCircle2 size={18} />
                  )}
                  Authorize Level Mapping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="h-20"></div>
    </div>
  );
};

export default UnifiedBranchManager;
