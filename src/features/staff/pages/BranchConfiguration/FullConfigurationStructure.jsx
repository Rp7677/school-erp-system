import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  Calendar,
  GitBranch,
  Compass,
  Search,
  ChevronDown,
  Beaker,
  MapPin,
  Loader2,
} from "lucide-react";
import api from "../../../../config/api";
import { Toaster, toast } from "react-hot-toast";

const BranchStructureFlow = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");

  const [branches, setBranches] = useState([]);
  const [gradeList, setGradeList] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [config, setConfig] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [selectedYearId, setSelectedYearId] = useState("");
  const [loading, setLoading] = useState({
    branches: true,
    years: false,
    config: false,
  });

  // --- DYNAMIC THEME CLASSES ---
  const theme = {
    bg: isDark ? "bg-[#080808]" : "bg-[#F8FAFC]",
    card: isDark
      ? "bg-[#111111] border-white/5 shadow-black/50"
      : "bg-white border-slate-200 shadow-sm",
    input: isDark
      ? "bg-[#1A1A1A] border-white/10 text-white focus:border-primary/50"
      : "bg-slate-50 border-slate-200 text-slate-900 focus:border-primary",
    textDim: isDark ? "text-white/40" : "text-slate-400",
    textMain: isDark ? "text-white" : "text-slate-900",
    line: isDark ? "bg-white/10" : "bg-slate-200",
    node: isDark
      ? "bg-[#1A1A1A] border-white/5"
      : "bg-white border-slate-200 shadow-md",
    streamBg: isDark
      ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
      : "bg-blue-50 border-blue-100 text-blue-600",
    term: isDark
      ? "bg-white/5 border-white/5 text-white/40"
      : "bg-slate-50 border-slate-100 text-slate-500",
  };

  // --- API LOGIC ---
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await api.get("/api/branches");
        setBranches(res.data || []);
      } catch (err) {
        toast.error("Failed to load branches");
      } finally {
        setLoading((prev) => ({ ...prev, branches: false }));
      }
    };
    fetchBranches();
  }, []);

  const fetchBranchData = async (branchId) => {
    setLoading((prev) => ({ ...prev, years: true }));
    try {
      const [yearsRes, gradesRes] = await Promise.all([
        api.get(`/api/branches/${branchId}/academic-years`),
        api.get(`/api/branches/${branchId}/grades`),
      ]);
      setAcademicYears(yearsRes.data || []);
      setGradeList(
        (gradesRes.data || []).sort(
          (a, b) => (Number(a.gradeId) || 0) - (Number(b.gradeId) || 0)
        )
      );
    } catch (err) {
      toast.error("Sync Error");
    } finally {
      setLoading((prev) => ({ ...prev, years: false }));
    }
  };

  const gradeMetadata = useMemo(() => {
    const map = {};
    gradeList.forEach((g) => {
      map[g.id] = { name: g.gradeName, order: Number(g.gradeId) || 0 };
    });
    return map;
  }, [gradeList]);

  const handleYearSelect = async (yearId) => {
    setSelectedYearId(yearId);
    if (!yearId) {
      setConfig(null);
      return;
    }
    setLoading((prev) => ({ ...prev, config: true }));
    try {
      const res = await api.get(
        `/api/branches/branch-academic-years/${yearId}/academic-configuration`
      );
      const sortedGrades = (res.data.grades || []).sort(
        (a, b) =>
          (gradeMetadata[a.branchGradeId]?.order || 0) -
          (gradeMetadata[b.branchGradeId]?.order || 0)
      );
      setConfig({ ...res.data, grades: sortedGrades });
      toast.success("Hierarchy Loaded");
    } catch (err) {
      toast.error("Mapping Failed");
    } finally {
      setLoading((prev) => ({ ...prev, config: false }));
    }
  };

  const filteredGrades = useMemo(() => {
    if (!config) return [];
    return config.grades.filter((g) =>
      gradeMetadata[g.branchGradeId]?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [config, searchTerm, gradeMetadata]);

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-500 ${theme.bg}`}
    >
      <Toaster position="top-right" />

      {/* --- HEADER CONTROLS --- */}
      <div
        className={`p-8 mb-12 rounded-[2.5rem] border-2 border-t-4 border-t-primary ${theme.card}`}
      >
        <div className="flex flex-col lg:flex-row gap-8 items-center">
          <div className="flex items-center gap-5 min-w-[300px]">
            <div className="p-4 bg-primary rounded-2xl text-white shadow-xl shadow-primary/30 ring-4 ring-primary/10">
              <GitBranch size={28} />
            </div>
            <div>
              <h1
                className={`text-2xl font-black tracking-tighter uppercase ${theme.textMain}`}
              >
                Hierarchy
              </h1>
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.3em] ${theme.textDim}`}
              >
                Structural Engine
              </p>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* Campus Select */}
            <div className="relative group">
              <MapPin
                size={18}
                className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors 
        ${selectedBranchId ? "text-primary" : theme.textDim} 
        group-focus-within:text-primary`}
              />
              <select
                className={`pl-12 pr-10 appearance-none cursor-pointer rounded-2xl py-4 font-bold text-sm w-full outline-none border-2 transition-all 
        ${theme.input} 
        ${isDark ? "hover:bg-[#222222]" : "hover:bg-slate-100/50"}`}
                value={selectedBranchId}
                onChange={(e) => {
                  setSelectedBranchId(e.target.value);
                  fetchBranchData(e.target.value);
                  setConfig(null);
                  setSelectedYearId("");
                }}
              >
                <option
                  value=""
                  className={
                    isDark
                      ? "bg-[#111111] text-white/50"
                      : "bg-white text-slate-400"
                  }
                >
                  Select Campus
                </option>
                {branches.map((b) => (
                  <option
                    key={b.id}
                    value={b.id}
                    className={
                      isDark
                        ? "bg-[#1A1A1A] text-white"
                        : "bg-white text-slate-900"
                    }
                  >
                    {b.campusName}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-hover:translate-y-[-40%] ${theme.textDim}`}
              />
            </div>

            {/* Year Select */}
            <div className="relative group">
              <Calendar
                size={18}
                className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors 
        ${selectedYearId ? "text-primary" : theme.textDim} 
        group-focus-within:text-primary`}
              />
              <select
                className={`pl-12 pr-10 appearance-none cursor-pointer rounded-2xl py-4 font-bold text-sm w-full outline-none border-2 transition-all 
        ${theme.input} 
        ${
          !selectedBranchId
            ? "opacity-40 cursor-not-allowed"
            : isDark
            ? "hover:bg-[#222222]"
            : "hover:bg-slate-100/50"
        }`}
                disabled={!selectedBranchId}
                value={selectedYearId}
                onChange={(e) => handleYearSelect(e.target.value)}
              >
                <option
                  value=""
                  className={
                    isDark
                      ? "bg-[#111111] text-white/50"
                      : "bg-white text-slate-400"
                  }
                >
                  {loading.years ? "Syncing..." : "Academic Year"}
                </option>
                {academicYears.map((y) => (
                  <option
                    key={y.id}
                    value={y.id}
                    className={
                      isDark
                        ? "bg-[#1A1A1A] text-white"
                        : "bg-white text-slate-900"
                    }
                  >
                    {y.academicYear.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform group-hover:translate-y-[-40%] ${theme.textDim}`}
              />
            </div>

            {/* Filter Input */}
            <div className="relative group">
              <Search
                size={18}
                className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 transition-colors 
        ${searchTerm ? "text-primary" : theme.textDim} 
        group-focus-within:text-primary`}
              />
              <input
                className={`pl-12 rounded-2xl py-4 font-bold text-sm w-full outline-none border-2 transition-all 
        ${theme.input} 
        hover:border-primary/30`}
                placeholder="Search nodes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* --- VISUAL CANVAS --- */}
      {!config && !loading.config ? (
        <div className="py-40 flex flex-col items-center">
          <div
            className={`p-10 rounded-full border-4 border-dashed animate-[spin_20s_linear_infinite] ${
              isDark ? "border-white/5" : "border-slate-200"
            }`}
          >
            <Compass size={60} className={theme.textDim} />
          </div>
          <p
            className={`mt-8 font-black uppercase tracking-[0.6em] text-[10px] ${theme.textDim}`}
          >
            Initialise Configuration
          </p>
        </div>
      ) : loading.config ? (
        <div className="py-40 flex justify-center">
          <Loader2 className="animate-spin text-primary" size={60} />
        </div>
      ) : (
        <div className="overflow-x-auto pb-24 scrollbar-hide">
          <div className="flex flex-col items-center min-w-max px-20">
            {/* Campus Node */}
            <div className="relative flex flex-col items-center mb-16">
              <div className="px-12 py-5 bg-primary text-white rounded-[2rem] font-black uppercase text-sm tracking-[0.25em] shadow-2xl shadow-primary/40 z-20 ring-8 ring-primary/5">
                {branches.find((b) => b.id == selectedBranchId)?.campusName}
              </div>
              <div
                className={`w-1 h-16 bg-gradient-to-b from-primary to-transparent opacity-40`}
              ></div>
            </div>

            {/* Structure Tree */}
            <div className="flex justify-center items-start gap-20 relative">
              {filteredGrades.length > 1 && (
                <div
                  className={`absolute top-0 h-[3px] rounded-full ${theme.line}`}
                  style={{
                    left: "80px",
                    right: "80px",
                    width: "calc(100% - 160px)",
                  }}
                ></div>
              )}

              {filteredGrades.map((grade, index) => (
                <div
                  key={grade.branchGradeId}
                  className="flex flex-col items-center group"
                >
                  <div
                    className={`w-1 h-10 ${theme.line} group-hover:bg-primary transition-colors duration-500`}
                  ></div>

                  {/* Grade Card */}
                  <div
                    className={`relative px-10 py-5 rounded-[1.5rem] border-2 mb-14 transition-all duration-500 hover:scale-105 hover:border-primary/50 ${theme.node}`}
                  >
                    <div className="absolute -top-4 -left-4 w-10 h-10 rounded-2xl bg-primary text-white text-xs flex items-center justify-center font-black shadow-lg shadow-primary/30 border-4 border-[#080808]">
                      {index + 1}
                    </div>
                    <h3
                      className={`text-xs font-black uppercase tracking-widest text-center ${theme.textMain}`}
                    >
                      {gradeMetadata[grade.branchGradeId]?.name}
                    </h3>
                  </div>

                  {/* Streams / Terms Branching */}
                  <div className="flex justify-center gap-12 relative">
                    {(grade.streams.length > 0 || grade.terms.length > 0) && (
                      <div
                        className={`absolute -top-14 left-1/2 -translate-x-1/2 w-0.5 h-14 ${theme.line} opacity-50`}
                      ></div>
                    )}

                    {grade.streams.length > 0 ? (
                      grade.streams.map((stream) => (
                        <div
                          key={stream.id}
                          className="flex flex-col items-center"
                        >
                          <div
                            className={`px-6 py-3 rounded-2xl border-2 flex items-center gap-3 mb-8 transition-transform hover:scale-105 ${theme.streamBg}`}
                          >
                            <Beaker size={16} />
                            <span className="text-[10px] font-black uppercase tracking-tighter">
                              {stream.name}
                            </span>
                          </div>
                          <div className="flex flex-col gap-4">
                            {grade.terms.map((term) => (
                              <div
                                key={term.id}
                                className="flex flex-col items-center group/item"
                              >
                                <div
                                  className={`w-0.5 h-4 ${theme.line}`}
                                ></div>
                                <div
                                  className={`px-6 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-tight transition-all hover:border-primary/40 ${theme.term}`}
                                >
                                  {term.name}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col gap-4">
                        {grade.terms.map((term) => (
                          <div
                            key={term.id}
                            className="flex flex-col items-center"
                          >
                            <div className={`w-0.5 h-4 ${theme.line}`}></div>
                            <div
                              className={`px-8 py-3 rounded-xl border-2 text-[10px] font-black uppercase tracking-tight ${theme.term}`}
                            >
                              {term.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchStructureFlow;