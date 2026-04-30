import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../../config/api";
import {
  Save,
  Plus,
  Trash2,
  Layers,
  AlertCircle,
  CheckCircle2,
  RefreshCcw,
  Copy,
  Power,
  Eye,
  ArrowLeft,
  FileText,
  Calculator,
  Settings2,
  ShieldCheck,
  Globe,
  Zap,
  MousePointer2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const FeeStructureManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  
  // --- Redux Campus Integration ---
  const { campuses, selectedCampus, superAdmin } = useSelector((state) => state.campus);
  console.log(JSON.stringify(campuses) + "campusescampusescampusescampusescampuses");

  // --- Navigation & View State ---
  const [view, setView] = useState("list");
  const [existingStructures, setExistingStructures] = useState([]);
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  // --- Global Constraints ---
  const [globalMaxQuarters, setGlobalMaxQuarters] = useState(4);

  // --- Dropdown Data ---
  const [dropdowns, setDropdowns] = useState({
    branches: [],
    grades: [],
    streams: [],
    academicYears: [],
    admissionTypes: [],
    structureTypes: [],
    feeHeads: [],
  });

  // --- Form States ---
  const [formData, setFormData] = useState({
    campusId: "",
    branchId: "",
    branchGradeId: "",
    branchGradeStreamId: "",
    admissionTypeId: "",
    academicYearId: "",
    feeStructureTypeId: "",
    version: 1,
    lines: [],
  });

  const [cloneData, setCloneData] = useState({
    sourceId: "",
    targetYearId: "",
    version: "",
  });

  // --- 1. Initial Data Fetching (Excluding Campuses) ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [ay, adm, heads] = await Promise.all([
          api.get("/api/academic-years/get-all-academic-year"),
          api.get("/api/admission-types"),
          api.get("/api/fees/heads"),
        ]);
        setDropdowns((prev) => ({
          ...prev,
          academicYears: ay.data || [],
          admissionTypes: adm.data || [],
          feeHeads: heads.data || [],
        }));
      } catch (err) {
        toast.error("Setup synchronization failed");
      }
    };
    fetchInitialData();
  }, []);

  // --- 2. Dependency Watchers ---
  useEffect(() => {
    if (formData.campusId) {
      api.get("/api/branches").then((res) => {
        const filtered = res.data.filter(
          (b) => b.campusId === parseInt(formData.campusId)
        );
        setDropdowns((prev) => ({ ...prev, branches: filtered }));
      });
      api
        .get(`/api/fees/structure-types?campus_id=${formData.campusId}`)
        .then((res) => {
          setDropdowns((prev) => ({ ...prev, structureTypes: res.data }));
        });
      fetchCampusStructures(formData.campusId);
    }
  }, [formData.campusId]);

  useEffect(() => {
    if (formData.branchId) {
      api
        .get(`/api/branches/${formData.branchId}/grades`)
        .then((res) => setDropdowns((prev) => ({ ...prev, grades: res.data })));
    }
  }, [formData.branchId]);

  useEffect(() => {
    if (formData.branchGradeId) {
      api
        .get(`/api/branch-grades/${formData.branchGradeId}/streams`)
        .then((res) =>
          setDropdowns((prev) => ({
            ...prev,
            streams: res.data.streams || [],
          }))
        );
    }
  }, [formData.branchGradeId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [existingStructures, view]);

  // --- 3. Pagination Logic ---
  const totalPages = Math.ceil(existingStructures.length / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentRecords = existingStructures.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // --- 4. API Actions ---
  const fetchCampusStructures = async (id) => {
    try {
      const res = await api.get(`/api/fees/structures?campusId=${id}`);
      setExistingStructures(res.data);
    } catch (err) {
      toast.error("Could not load structures");
    }
  };

  const fetchStructureDetail = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/api/fees/structures/${id}`);
      setDetailData(res.data);
      setView("detail");
    } catch (err) {
      toast.error("Failed to load details");
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (id) => {
    try {
      await api.patch(`/api/fees/structures/${id}/activate`);
      toast.success("Structure Activated!");
      fetchCampusStructures(formData.campusId);
    } catch (err) {
      toast.error("Activation failed");
    }
  };

  const handleClone = async () => {
    if (!cloneData.sourceId || !cloneData.targetYearId || !cloneData.version)
      return toast.error("Fill all clone fields");
    setLoading(true);
    try {
      await api.post("/api/fees/structures/clone", {
        sourceStructureId: parseInt(cloneData.sourceId),
        targetAcademicYearId: parseInt(cloneData.targetYearId),
        version: parseInt(cloneData.version),
      });
      toast.success("Structure Cloned Successfully");
      fetchCampusStructures(formData.campusId);
      setCloneData({ sourceId: "", targetYearId: "", version: "" });
    } catch (err) {
      toast.error("Clone failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.branchGradeId ||
      !formData.academicYearId ||
      formData.lines.length === 0
    ) {
      return toast.error(
        "Please fill all required classification fields and add fee lines"
      );
    }
    setLoading(true);
    const sanitizedPayload = {
      ...formData,
      campusId: parseInt(formData.campusId),
      branchId: parseInt(formData.branchId),
      branchGradeId: parseInt(formData.branchGradeId),
      branchGradeStreamId: formData.branchGradeStreamId
        ? parseInt(formData.branchGradeStreamId)
        : null,
      academicYearId: parseInt(formData.academicYearId),
      feeStructureTypeId: parseInt(formData.feeStructureTypeId),
      admissionTypeId: formData.admissionTypeId
        ? parseInt(formData.admissionTypeId)
        : null,
      version: parseInt(formData.version),
      lines: formData.lines.map((line) => ({
        feeHeadId: parseInt(line.feeHeadId),
        totalAmount: parseFloat(line.totalAmount),
        quarterCount: parseInt(line.quarterCount),
        installments: line.installments.map((inst) => ({
          installmentId: inst.installmentId,
          amount: parseFloat(inst.amount),
        })),
      })),
    };
    try {
      await api.post("/api/fees/structures", sanitizedPayload);
      toast.success("Published Successfully");
      setView("list");
      fetchCampusStructures(formData.campusId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Sync Error");
    } finally {
      setLoading(false);
    }
  };

  // --- Logic: Installment Management ---
  const recalculateInstallments = (line) => {
    const count = Math.max(1, parseInt(line.quarterCount) || 1);
    const total = parseFloat(line.totalAmount) || 0;
    const base = Math.floor(total / count);
    const remainder = total % count;
    return {
      ...line,
      installments: Array.from({ length: count }, (_, i) => ({
        installmentId: i + 1,
        amount: i === 0 ? base + remainder : base,
      })),
    };
  };

  const addFeeLine = () => {
    const newLine = {
      feeHeadId: "",
      totalAmount: 0,
      quarterCount: globalMaxQuarters,
      installments: [],
      calculationMode: "auto",
    };
    setFormData((prev) => ({
      ...prev,
      lines: [...prev.lines, recalculateInstallments(newLine)],
    }));
  };

  const handleLineChange = (index, field, value) => {
    const updatedLines = [...formData.lines];
    let val = value;
    if (field === "quarterCount") {
      val = parseInt(value) || 1;
      if (val > globalMaxQuarters) val = globalMaxQuarters;
      if (val < 1) val = 1;
    }
    updatedLines[index][field] = val;
    if (field === "calculationMode" && val === "auto") {
      updatedLines[index] = recalculateInstallments(updatedLines[index]);
    } else if (updatedLines[index].calculationMode === "auto") {
      if (field === "totalAmount" || field === "quarterCount") {
        updatedLines[index] = recalculateInstallments(updatedLines[index]);
      }
    }
    setFormData({ ...formData, lines: updatedLines });
  };

  const updateInstallment = (lIdx, iIdx, newVal) => {
    const updated = [...formData.lines];
    const line = updated[lIdx];
    line.installments[iIdx].amount = parseFloat(newVal) || 0;
    setFormData({ ...formData, lines: updated });
  };

  const calculateSummaries = () => {
    const quarterTotals = {};
    let grandTotal = 0;
    formData.lines.forEach((line) => {
      grandTotal += parseFloat(line.totalAmount || 0);
      line.installments.forEach((inst) => {
        const id = inst.installmentId;
        quarterTotals[id] = (quarterTotals[id] || 0) + inst.amount;
      });
    });
    return { quarterTotals, grandTotal };
  };

  const summary = calculateSummaries();

  // --- Dynamic Styles ---
  const inputClass = `w-full px-4 py-3 rounded-xl border outline-none transition-all font-bold text-sm ${
    isDark
      ? "bg-[#1A1A1A] border-white/10 text-white focus:border-primary focus:bg-[#222]"
      : "bg-gray-50 border-gray-200 text-gray-900 focus:border-primary focus:bg-white focus:shadow-sm"
  }`;
  const cardClass = `p-6 rounded-[2rem] border transition-all ${
    isDark
      ? "bg-[#141414] border-white/5 shadow-2xl"
      : "bg-white border-gray-100 shadow-xl shadow-gray-200/50"
  }`;
  const labelClass = `text-[10px] font-black uppercase mb-1 ml-2 tracking-wider ${
    isDark ? "text-gray-500" : "text-gray-400"
  }`;

  return (
    <div
      className={`mx-auto space-y-6 ${
        isDark ? "text-gray-100" : "text-gray-800"
      }`}
    >
      <Toaster position="top-right" />

      {/* 1. TOP HEADER NAVIGATION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter flex items-center gap-2">
            FEE <span className="text-primary">CORE</span>
            <div className={`h-2 w-2 rounded-full bg-primary animate-pulse`} />
          </h1>
          <p className={labelClass}>Finance Structure Management</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          {view !== "list" && (
            <button
              onClick={() => setView("list")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm ${
                isDark ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <ArrowLeft size={18} /> BACK
            </button>
          )}
          {view === "list" && (
            <button
              onClick={() => {
                setFormData({
                  campusId: "",
                  branchId: "",
                  branchGradeId: "",
                  branchGradeStreamId: "",
                  admissionTypeId: "",
                  academicYearId: "",
                  feeStructureTypeId: "",
                  version: 1,
                  lines: [],
                });
                setView("create");
              }}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={20} /> CREATE NEW
            </button>
          )}
          {view === "create" && (
            <button
              onClick={handleSubmit}
              disabled={loading || formData.lines.length === 0}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/30 hover:scale-105 disabled:opacity-50 transition-all"
            >
              {loading ? <RefreshCcw className="animate-spin" /> : <Save size={20} />} PUBLISH
            </button>
          )}
        </div>
      </div>

      {/* 2. GLOBAL SYSTEM CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${cardClass} md:col-span-2`}>
          <div className="flex items-center gap-2 mb-6 text-primary">
            <Settings2 size={18} />
            <span className="text-xs font-black uppercase tracking-widest">
              Primary Context
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className={labelClass}>Campus</label>
              <select
                value={formData.campusId}
                onChange={(e) => setFormData({ ...formData, campusId: e.target.value })}
                className={inputClass}
              >
                <option value="">Select Campus</option>
                {campuses?.map((c) => (
                  <option key={c.campusId} value={c.campusId}>
                    {c.campusName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelClass}>Branch</label>
              <select
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                className={inputClass}
                disabled={!formData.campusId}
              >
                <option value="">Select Branch</option>
                {dropdowns.branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.boardName} - {b.campusName} — {b.mediumName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={`${cardClass} border-primary/20 bg-primary/[0.02]`}>
          <div className="flex items-center gap-2 mb-6 text-primary">
            <Globe size={18} />
            <span className="text-xs font-black uppercase tracking-widest">
              System Max Quarters
            </span>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>System Max Quarters</label>
            <div className="relative">
              <input
                type="number"
                value={globalMaxQuarters}
                onChange={(e) =>
                  setGlobalMaxQuarters(Math.max(1, parseInt(e.target.value) || 1))
                }
                className={`${inputClass} !border-primary/40 text-center text-xl`}
              />
              <ShieldCheck
                className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/30"
                size={20}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <div className="space-y-6">
        {view === "list" && (
          <>
            <div
              className={`${cardClass} border-dashed border-primary/40 ${
                isDark ? "bg-primary/5" : "bg-primary/[0.02]"
              }`}
            >
              <div className="flex items-center gap-2 mb-4 text-primary">
                <Copy size={18} />
                <span className="text-xs font-black uppercase tracking-widest">
                  Clone Engine
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <select
                  value={cloneData.sourceId}
                  onChange={(e) =>
                    setCloneData({ ...cloneData, sourceId: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">Source Template</option>
                  {existingStructures.map((s) => (
                    <option key={s.id} value={s.id}>
                      ( v{s.version} ) {s.grade} - {s.stream} - {s.branch}
                    </option>
                  ))}
                </select>
                <select
                  value={cloneData.targetYearId}
                  onChange={(e) =>
                    setCloneData({ ...cloneData, targetYearId: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">Target Year</option>
                  {dropdowns.academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Version"
                  type="number"
                  value={cloneData.version}
                  onChange={(e) =>
                    setCloneData({ ...cloneData, version: e.target.value })
                  }
                  className={inputClass}
                />
                <button
                  onClick={handleClone}
                  className="bg-primary text-white rounded-xl font-black hover:brightness-110 transition-all text-xs uppercase tracking-widest"
                >
                  Clone Structure
                </button>
              </div>
            </div>

            <div className={cardClass}>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr
                      className={`border-b text-[10px] uppercase font-black ${
                        isDark ? "border-white/10 text-gray-500" : "border-gray-100 text-gray-400"
                      }`}
                    >
                      <th className="pb-4 px-2">Grade Detail</th>
                      <th className="pb-4 px-2">Category</th>
                      <th className="pb-4 px-2">Branch</th>
                      <th className="pb-4 px-2">Version</th>
                      <th className="pb-4 px-2">Status</th>
                      <th className="pb-4 text-right px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-transparent">
                    {currentRecords.map((s) => (
                      <tr
                        key={s.id}
                        className={`group transition-colors ${
                          isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                        }`}
                      >
                        <td className="py-4 px-2">
                          <p className="font-black text-sm">
                            {s.grade}{" "}
                            <span className="text-primary text-[10px] ml-1">{s.stream}</span>
                          </p>
                          <p className="text-[10px] opacity-50 font-bold uppercase">
                            {s.academicYear}
                          </p>
                        </td>
                        <td className="text-xs font-bold px-2">{s.structureType}</td>
                        <td className="text-xs font-bold px-2">{s.branch}</td>
                        <td className="px-2">
                          <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black">
                            V{s.version}
                          </span>
                        </td>
                        <td className="px-2">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                              s.active
                                ? "bg-green-500/10 text-green-500"
                                : "bg-orange-500/10 text-orange-500"
                            }`}
                          >
                            {s.active ? "Active" : "Draft"}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-1 px-2">
                          {!s.active && (
                            <button
                              onClick={() => handleActivate(s.id)}
                              className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-all"
                            >
                              <Power size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => fetchStructureDetail(s.id)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION CONTROLS */}
              {existingStructures.length > 0 && (
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6">
                  <p className="text-[10px] font-black uppercase text-gray-500 tracking-wider">
                    Showing {indexOfFirstItem + 1} to{" "}
                    {Math.min(indexOfLastItem, existingStructures.length)} of{" "}
                    {existingStructures.length} structures
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-xl border transition-all ${
                        currentPage === 1
                          ? "opacity-20 cursor-not-allowed"
                          : "hover:bg-primary/10 text-primary border-primary/20"
                      }`}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <div className="flex items-center gap-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => paginate(i + 1)}
                          className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${
                            currentPage === i + 1
                              ? "bg-primary text-white shadow-lg shadow-primary/20"
                              : "text-gray-500 hover:bg-white/5"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-xl border transition-all ${
                        currentPage === totalPages
                          ? "opacity-20 cursor-not-allowed"
                          : "hover:bg-primary/10 text-primary border-primary/20"
                      }`}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {view === "detail" && detailData && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className={cardClass}>
              <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                <div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
                    {detailData.grade} <span className="text-primary">{detailData.stream}</span>
                  </h2>
                  <div className="flex items-center gap-3 mt-3">
                    <span
                      className={`flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      <FileText size={12} /> {detailData.branch}
                    </span>
                    <div className={`h-1 w-1 rounded-full ${isDark ? "bg-white/20" : "bg-gray-200"}`} />
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      Year: {detailData.academicYear}
                    </span>
                  </div>
                </div>
                <span className="px-4 py-2 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-widest">
                  Version {detailData.version}
                </span>
              </div>
              <div className="space-y-6">
                {detailData.lines?.map((line, idx) => (
                  <div
                    key={idx}
                    className={`rounded-[2rem] border overflow-hidden ${
                      isDark ? "bg-white/[0.02] border-white/5" : "bg-gray-50 border-gray-100"
                    }`}
                  >
                    <div
                      className={`p-6 border-b flex justify-between items-center ${
                        isDark ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-100/50"
                      }`}
                    >
                      <h4 className="font-black text-lg uppercase tracking-tight">
                        {line.feeHeadName}
                      </h4>
                      <p className="text-xl font-black text-primary italic">
                        ₹{line.totalAmount?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                      {line.installments?.map((inst, iIdx) => (
                        <div
                          key={iIdx}
                          className={`p-4 rounded-2xl border ${
                            isDark ? "bg-black/20 border-white/5" : "bg-white border-gray-100"
                          }`}
                        >
                          <p className={labelClass}>{inst.installmentName}</p>
                          <p className="text-lg font-black tracking-tight">
                            ₹{inst.amount?.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === "create" && (
          <div className="space-y-6 pb-20">
            <div className={cardClass}>
              <div className="flex items-center gap-2 mb-6 text-primary">
                <Layers size={18} />
                <span className="text-xs font-black uppercase tracking-widest">
                  Structure Classification
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="space-y-1">
                  <label className={labelClass}>Grade</label>
                  <select
                    value={formData.branchGradeId}
                    onChange={(e) => setFormData({ ...formData, branchGradeId: e.target.value })}
                    className={inputClass}
                    disabled={!formData.branchId}
                  >
                    <option value="">Select Grade</option>
                    {dropdowns.grades.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.gradeName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Stream</label>
                  <select
                    value={formData.branchGradeStreamId}
                    onChange={(e) =>
                      setFormData({ ...formData, branchGradeStreamId: e.target.value })
                    }
                    className={inputClass}
                    disabled={!formData.branchGradeId}
                  >
                    <option value="">Select Stream</option>
                    {dropdowns.streams.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Academic Year</label>
                  <select
                    value={formData.academicYearId}
                    onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Select Year</option>
                    {dropdowns.academicYears.map((ay) => (
                      <option key={ay.id} value={ay.id}>
                        {ay.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Admission Type</label>
                  <select
                    value={formData.admissionTypeId}
                    onChange={(e) => setFormData({ ...formData, admissionTypeId: e.target.value })}
                    className={inputClass}
                  >
                    <option value="">Select Type</option>
                    {dropdowns.admissionTypes.map((at) => (
                      <option key={at.id} value={at.id}>
                        {at.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Fee Structure Type</label>
                  <select
                    value={formData.feeStructureTypeId}
                    onChange={(e) =>
                      setFormData({ ...formData, feeStructureTypeId: e.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="">Select Type</option>
                    {dropdowns.structureTypes.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className={labelClass}>Version</label>
                  <input
                    type="number"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {formData.lines.length > 0 && (
              <div className={`${cardClass} border-primary bg-primary/5 shadow-2xl shadow-primary/10`}>
                <div className="flex items-center gap-2 mb-6">
                  <Calculator className="text-primary" size={20} />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">
                    Live Calculation
                  </h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.keys(summary.quarterTotals).map((qId) => (
                    <div
                      key={qId}
                      className={`p-4 rounded-2xl border ${
                        isDark ? "bg-black/40 border-white/10" : "bg-white border-primary/10"
                      }`}
                    >
                      <p className={labelClass}>Quarter {qId}</p>
                      <p className="text-xl font-black text-primary">
                        ₹{summary.quarterTotals[qId].toLocaleString()}
                      </p>
                    </div>
                  ))}
                  <div className="p-4 rounded-2xl bg-primary text-white shadow-lg md:col-span-1 flex flex-col justify-center">
                    <p className="text-[9px] font-black uppercase opacity-70">Total Payable</p>
                    <p className="text-xl font-black">₹{summary.grandTotal.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {formData.lines.map((line, lIdx) => (
              <div key={lIdx} className={cardClass}>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <label className="text-[10px] font-black uppercase text-primary ml-2">
                      Fee Head
                    </label>
                    <select
                      value={line.feeHeadId}
                      onChange={(e) => handleLineChange(lIdx, "feeHeadId", e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select Fee Head</option>
                      {dropdowns.feeHeads.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full md:w-48">
                    <label className="text-[10px] font-black uppercase text-primary ml-2">
                      Total Amount
                    </label>
                    <input
                      type="number"
                      value={line.totalAmount}
                      onChange={(e) => handleLineChange(lIdx, "totalAmount", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <label className="text-[10px] font-black uppercase text-primary ml-2">
                      Distribution
                    </label>
                    <div
                      className={`flex p-1 rounded-xl border ${
                        isDark ? "bg-black/40 border-white/10" : "bg-gray-100 border-gray-200"
                      }`}
                    >
                      <button
                        onClick={() => handleLineChange(lIdx, "calculationMode", "auto")}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-black transition-all ${
                          line.calculationMode === "auto"
                            ? "bg-primary text-white shadow-md"
                            : "text-gray-400"
                        }`}
                      >
                        <Zap size={12} /> AUTO
                      </button>
                      <button
                        onClick={() => handleLineChange(lIdx, "calculationMode", "manual")}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-[10px] font-black transition-all ${
                          line.calculationMode === "manual"
                            ? "bg-orange-500 text-white shadow-md"
                            : "text-gray-400"
                        }`}
                      >
                        <MousePointer2 size={12} /> MANUAL
                      </button>
                    </div>
                  </div>
                  <div className="w-full md:w-32">
                    <label className="text-[10px] font-black uppercase text-primary ml-2">
                      Quarters
                    </label>
                    <input
                      type="number"
                      value={line.quarterCount}
                      onChange={(e) => handleLineChange(lIdx, "quarterCount", e.target.value)}
                      className={`${inputClass} border-orange-500/30`}
                      min="1"
                      max={globalMaxQuarters}
                    />
                  </div>
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        lines: formData.lines.filter((_, i) => i !== lIdx),
                      })
                    }
                    className="mt-6 p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <div
                  className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-3xl border ${
                    isDark ? "bg-white/[0.02] border-white/5" : "bg-gray-50 border-gray-100"
                  }`}
                >
                  {line.installments.map((inst, iIdx) => (
                    <div
                      key={iIdx}
                      className={
                        line.calculationMode === "manual" && inst.amount === 0 ? "opacity-40" : ""
                      }
                    >
                      <p className="text-[10px] font-bold text-gray-400 uppercase flex justify-between px-1 mb-1">
                        <span>Quarter {inst.installmentId}</span>
                        {line.totalAmount > 0 && (
                          <span className="text-primary/50">
                            {((inst.amount / line.totalAmount) * 100).toFixed(0)}%
                          </span>
                        )}
                      </p>
                      <input
                        type="number"
                        value={inst.amount}
                        onChange={(e) => updateInstallment(lIdx, iIdx, e.target.value)}
                        className={`${inputClass} !py-2 ${
                          line.calculationMode === "manual"
                            ? "border-orange-500/40 focus:border-orange-500"
                            : "border-primary/20"
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addFeeLine}
              className={`w-full py-12 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-3 group transition-all ${
                isDark
                  ? "border-white/10 hover:border-primary/50 hover:bg-primary/5"
                  : "border-gray-200 hover:border-primary/50 hover:bg-primary/[0.02]"
              }`}
            >
              <div className="p-4 bg-primary/10 text-primary rounded-full group-hover:scale-110 transition-transform">
                <Plus size={32} />
              </div>
              <span className="font-black text-xs uppercase tracking-[0.2em] text-gray-500 group-hover:text-primary">
                Add Fee Line
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeStructureManager;