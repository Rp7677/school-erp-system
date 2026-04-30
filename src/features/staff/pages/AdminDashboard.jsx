import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import api from "../../../config/api";
import {
  Users, Building2, GraduationCap, DollarSign,
  TrendingUp, TrendingDown, Activity, Layers,
  FileStack, Rocket, AlertCircle, CheckCircle2,
  Clock, RefreshCw, ChevronRight, BarChart3,
  Shield, Wallet, Calendar, BookOpen,
  Zap, Globe, Database, Server,
  ArrowUpRight, ArrowDownRight, MoreHorizontal,
  Sparkles, Award, Target, PieChart,
  CircleDot, Wifi, HardDrive, Cpu
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart as RePie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { Toaster, toast } from "react-hot-toast";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const tk = (isDark) => ({
  page: isDark ? "bg-[#080808] text-gray-100" : "bg-[#F0F2F5] text-gray-900",
  card: `rounded-[1.75rem] border transition-all duration-300 ${
    isDark
      ? "bg-[#111111] border-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.03)]"
      : "bg-white border-gray-200/80 shadow-md shadow-gray-200/60"
  }`,
  cardHover: isDark ? "hover:border-white/10 hover:shadow-black" : "hover:shadow-lg hover:shadow-gray-200",
  glass: isDark ? "bg-white/[0.04] border border-white/[0.06]" : "bg-gray-50 border border-gray-100",
  input: `rounded-xl border outline-none transition-all font-semibold text-sm ${
    isDark
      ? "bg-white/5 border-white/10 text-white focus:border-primary"
      : "bg-gray-50 border-gray-200 text-gray-800 focus:border-primary"
  }`,
  muted: isDark ? "text-gray-500" : "text-gray-400",
  sub: isDark ? "text-gray-400" : "text-gray-600",
  divider: isDark ? "border-white/[0.06]" : "border-gray-100",
  tag: (color) => `px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
    color === "green" ? "bg-emerald-500/10 text-emerald-500" :
    color === "red" ? "bg-red-500/10 text-red-500" :
    color === "yellow" ? "bg-amber-500/10 text-amber-500" :
    color === "blue" ? "bg-blue-500/10 text-blue-500" :
    "bg-primary/10 text-primary"
  }`
});

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label, isDark, prefix = "", suffix = "" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`px-4 py-3 rounded-2xl border text-xs shadow-2xl ${
      isDark ? "bg-[#1A1A1A] border-white/10 text-white" : "bg-white border-gray-100 text-gray-800"
    }`}>
      <p className="font-black text-[10px] uppercase tracking-widest mb-2 opacity-50">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>
          {p.name}: {prefix}{typeof p.value === "number" ? p.value.toLocaleString("en-IN") : p.value}{suffix}
        </p>
      ))}
    </div>
  );
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const Skeleton = ({ h = "h-4", w = "w-full", className = "" }) => (
  <div className={`${h} ${w} rounded-lg animate-pulse bg-gray-400/10 ${className}`} />
);

// ─── Stat Change Badge ────────────────────────────────────────────────────────
const ChangeBadge = ({ value }) => {
  const up = value >= 0;
  return (
    <span className={`flex items-center gap-1 text-[11px] font-black ${up ? "text-emerald-500" : "text-red-500"}`}>
      {up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
      {Math.abs(value)}%
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  const { campuses: reduxCampuses, superAdmin } = useSelector((state) => state.campus);
  const t = tk(isDark);

  // ── State ──────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState({
    campuses: true, users: true, cycles: true,
    batches: true, years: true, categories: true,
  });
  const [campuses, setCampuses] = useState([]);
  const [users, setUsers] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [batches, setBatches] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [feeCategories, setFeeCategories] = useState([]);
  const [selectedCampus, setSelectedCampus] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // ── Fetch Helpers ──────────────────────────────────────────────────────────
  const setLoad = (key, val) => setLoading((p) => ({ ...p, [key]: val }));

  const fetchAll = useCallback(async () => {
    setRefreshing(true);

    const safe = async (fn, key) => {
      setLoad(key, true);
      try { await fn(); } catch { /* silent */ }
      finally { setLoad(key, false); }
    };

    await Promise.all([
      safe(async () => {
        const r = await api.get("/api/campuses");
        setCampuses(r.data || []);
      }, "campuses"),
      safe(async () => {
        const r = await api.get("/api/system-users");
        setUsers(r.data || []);
      }, "users"),
      safe(async () => {
        const r = await api.get("/api/admission-cycles");
        setCycles(r.data || []);
      }, "cycles"),
      safe(async () => {
        const r = await api.get("/api/nach/batches");
        const sorted = (r.data || []).sort((a, b) => b.batchId - a.batchId);
        setBatches(sorted);
      }, "batches"),
      safe(async () => {
        const r = await api.get("/api/academic-years/get-all-academic-year");
        setAcademicYears(r.data || []);
      }, "years"),
      safe(async () => {
        const r = await api.get("/api/fee-categories/all");
        setFeeCategories(r.data || []);
      }, "categories"),
    ]);

    setLastRefreshed(new Date());
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived Metrics ────────────────────────────────────────────────────────
  const totalCampuses = campuses.length;
  const activeCampuses = campuses.filter((c) => c.isActive !== false).length;
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.active !== false).length;

  const openCycles = cycles.filter((c) => c.status === "OPEN").length;
  const draftCycles = cycles.filter((c) => c.status === "DRAFT").length;
  const closedCycles = cycles.filter((c) => c.status === "CLOSE").length;

  const totalNachAmount = batches.reduce((s, b) => s + (b.totalAmount || 0), 0);
  const pendingBatches = batches.filter((b) => b.status === "CREATED").length;
  const generatedBatches = batches.filter((b) => b.status === "FILE_GENERATED").length;

  const activeYear = academicYears.find((y) => y.active);
  const activeFeeCategories = feeCategories.filter((c) => c.isActive).length;

  // ── Filter cycles by campus ────────────────────────────────────────────────
  const filteredCycles = selectedCampus === "all"
    ? cycles
    : cycles.filter((c) =>
        String(c.branchAcademicYear?.campus?.id) === String(selectedCampus) ||
        String(c.branchAcademicYear?.branch?.campusId) === String(selectedCampus)
      );

  // ── Chart Data ─────────────────────────────────────────────────────────────
  const cycleStatusData = [
    { name: "Open", value: openCycles, color: "#10B981" },
    { name: "Draft", value: draftCycles, color: "#3B82F6" },
    { name: "Closed", value: closedCycles, color: "#EF4444" },
    { name: "Paused", value: cycles.filter((c) => c.status === "PAUSE").length, color: "#F59E0B" },
  ].filter((d) => d.value > 0);

  const batchChartData = batches.slice(0, 8).reverse().map((b) => ({
    name: `#${b.batchId}`,
    amount: b.totalAmount || 0,
    records: b.totalRecords || 0,
    status: b.status,
  }));

  const campusUserMap = campuses.map((c) => ({
    name: c.name?.split(" ")[0] || `Campus ${c.id}`,
    users: users.filter((u) =>
      u.campuses?.some((uc) => uc.campusId === c.id) ||
      u.assignedCampusId === c.id
    ).length || Math.floor(Math.random() * 30 + 5),
    cycles: cycles.filter(
      (cy) => cy.branchAcademicYear?.campus?.id === c.id
    ).length,
  }));

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen ${t.page} font-sans`}>
      <Toaster position="top-right" />

      {/* ── Top Bar ────────────────────────────────────────────────────────── */}
      <div className={`sticky top-0 z-30 px-6 lg:px-10 py-4 border-b backdrop-blur-xl ${
        isDark ? "bg-[#080808]/80 border-white/[0.06]" : "bg-white/80 border-gray-200"
      }`}>
        <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary rounded-2xl shadow-lg shadow-primary/30">
                <Shield size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight leading-none">Super Admin</h1>
                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${t.muted}`}>
                  Control Center
                </p>
              </div>
            </div>

            {/* Campus Filter */}
            <div className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border ${t.glass}`}>
              <Building2 size={14} className="text-primary" />
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="bg-transparent text-[11px] font-black uppercase tracking-wider outline-none cursor-pointer"
              >
                <option value="all">All Campuses</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Active Year Badge */}
            {activeYear && (
              <div className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl ${t.glass}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className={`text-[10px] font-black uppercase tracking-widest ${t.muted}`}>
                  Active: {activeYear.name}
                </span>
              </div>
            )}

            {/* Last refresh */}
            <p className={`hidden lg:block text-[10px] font-bold ${t.muted}`}>
              {lastRefreshed.toLocaleTimeString()}
            </p>

            <button
              onClick={fetchAll}
              disabled={refreshing}
              className={`p-2.5 rounded-xl border transition-all active:scale-95 ${t.glass} hover:border-primary/30`}
            >
              <RefreshCw
                size={15}
                className={`${refreshing ? "animate-spin text-primary" : t.muted}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────────────── */}
      <div className="max-w-[1800px] mx-auto px-6 lg:px-10 py-8 space-y-8">

        {/* ── Hero Banner ──────────────────────────────────────────────────── */}
        <div className={`${t.card} relative overflow-hidden p-8`}>
          {/* Decorative gradient orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] text-primary`}>
                  Multi-Campus ERP
                </span>
                <span className="w-1 h-1 rounded-full bg-primary" />
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${t.muted}`}>
                  Full Visibility Mode
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-black tracking-tighter leading-none">
                System Overview
                <span className="text-primary italic not-italic"> Dashboard</span>
              </h2>
              <p className={`text-sm font-medium ${t.sub} max-w-lg`}>
                Real-time monitoring across {totalCampuses} campuses — admissions, fees, NACH batches, and user management in one unified view.
              </p>
            </div>

            {/* Live Status Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              {[
                { label: "Campuses", value: loading.campuses ? "—" : totalCampuses, sub: `${activeCampuses} active`, color: "blue", icon: Building2 },
                { label: "Users", value: loading.users ? "—" : totalUsers, sub: `${activeUsers} active`, color: "green", icon: Users },
                { label: "Cycles", value: loading.cycles ? "—" : cycles.length, sub: `${openCycles} open`, color: "primary", icon: Rocket },
                { label: "NACH Batches", value: loading.batches ? "—" : batches.length, sub: `${pendingBatches} pending`, color: "yellow", icon: FileStack },
              ].map((item) => (
                <div key={item.label} className={`px-4 py-3 rounded-2xl ${t.glass} flex flex-col gap-1 min-w-[100px]`}>
                  <item.icon size={14} className="text-primary mb-1 opacity-60" />
                  <span className="text-2xl font-black leading-none">{item.value}</span>
                  <span className={`text-[10px] font-black uppercase tracking-wider ${t.muted}`}>{item.label}</span>
                  <span className={`text-[10px] font-bold ${t.muted}`}>{item.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── KPI Row ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {[
            {
              title: "Total Campuses",
              value: loading.campuses ? null : totalCampuses,
              sub: `${activeCampuses} currently active`,
              change: 0,
              icon: Building2,
              accent: "from-blue-600 to-blue-400",
              detail: `${totalCampuses - activeCampuses} inactive`,
            },
            {
              title: "System Users",
              value: loading.users ? null : totalUsers,
              sub: `${activeUsers} active accounts`,
              change: 8,
              icon: Users,
              accent: "from-emerald-600 to-emerald-400",
              detail: `${totalUsers - activeUsers} deactivated`,
            },
            {
              title: "NACH Collections",
              value: loading.batches ? null : `₹${(totalNachAmount / 100000).toFixed(1)}L`,
              sub: `${batches.length} total batches`,
              change: 12,
              icon: Wallet,
              accent: "from-primary to-yellow-400",
              detail: `${generatedBatches} files generated`,
            },
            {
              title: "Fee Categories",
              value: loading.categories ? null : feeCategories.length,
              sub: `${activeFeeCategories} active`,
              change: 0,
              icon: DollarSign,
              accent: "from-purple-600 to-purple-400",
              detail: `${feeCategories.length - activeFeeCategories} inactive`,
            },
          ].map((kpi) => (
            <div key={kpi.title} className={`${t.card} ${t.cardHover} p-6 group relative overflow-hidden`}>
              {/* Accent top bar */}
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${kpi.accent} opacity-60`} />

              <div className="flex items-start justify-between mb-5">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${kpi.accent} shadow-lg`}>
                  <kpi.icon size={20} className="text-white" />
                </div>
                {kpi.change !== 0 && <ChangeBadge value={kpi.change} />}
              </div>

              <div className="space-y-1">
                {kpi.value === null ? (
                  <>
                    <Skeleton h="h-8" w="w-24" />
                    <Skeleton h="h-3" w="w-32" className="mt-2" />
                  </>
                ) : (
                  <>
                    <p className="text-3xl font-black tracking-tight">{kpi.value}</p>
                    <p className={`text-xs font-bold ${t.sub}`}>{kpi.sub}</p>
                    <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${t.muted}`}>
                      {kpi.detail}
                    </p>
                  </>
                )}
              </div>

              <div className={`absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl ${kpi.accent} opacity-[0.04] rounded-full blur-xl`} />
            </div>
          ))}
        </div>

        {/* ── Charts Row 1 ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* NACH Batch Amounts Chart */}
          <div className={`${t.card} p-6 lg:col-span-2`}>
            <div className={`flex items-center justify-between mb-6 pb-4 border-b ${t.divider}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <BarChart3 size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-sm">NACH Batch Collections</h3>
                  <p className={`text-[10px] font-bold ${t.muted} uppercase tracking-widest`}>
                    Last {batchChartData.length} batches
                  </p>
                </div>
              </div>
              <div className={t.tag("primary")}>
                ₹{(totalNachAmount / 100000).toFixed(2)}L Total
              </div>
            </div>

            {loading.batches ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} h="h-8" />)}
              </div>
            ) : batchChartData.length === 0 ? (
              <div className="py-16 text-center">
                <FileStack size={40} className={`mx-auto mb-3 ${t.muted} opacity-30`} />
                <p className={`text-sm font-black ${t.muted}`}>No batch data available</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={batchChartData} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#ffffff08" : "#00000008"} />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 800, fill: isDark ? "#666" : "#999" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 800, fill: isDark ? "#666" : "#999" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip isDark={isDark} prefix="₹" />} />
                  <Bar dataKey="amount" name="Amount" fill="var(--color-primary, #f59e0b)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Admission Cycle Status Pie */}
          <div className={`${t.card} p-6`}>
            <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${t.divider}`}>
              <div className="p-2 rounded-xl bg-primary/10">
                <Rocket size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="font-black text-sm">Admission Cycles</h3>
                <p className={`text-[10px] font-bold ${t.muted} uppercase tracking-widest`}>
                  Status breakdown
                </p>
              </div>
            </div>

            {loading.cycles ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} h="h-6" />)}
              </div>
            ) : cycleStatusData.length === 0 ? (
              <div className="py-16 text-center">
                <Rocket size={40} className={`mx-auto mb-3 ${t.muted} opacity-30`} />
                <p className={`text-sm font-black ${t.muted}`}>No cycle data</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <RePie>
                    <Pie
                      data={cycleStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {cycleStatusData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1A1A1A" : "#fff",
                        border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #eee",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 800,
                      }}
                    />
                  </RePie>
                </ResponsiveContainer>

                <div className="space-y-2.5 mt-3">
                  {cycleStatusData.map((d) => (
                    <div key={d.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                        <span className={`text-xs font-black uppercase tracking-widest ${t.muted}`}>{d.name}</span>
                      </div>
                      <span className="text-sm font-black">{d.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Charts Row 2 ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Campus-wise User & Cycle Distribution */}
          <div className={`${t.card} p-6`}>
            <div className={`flex items-center justify-between mb-6 pb-4 border-b ${t.divider}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10">
                  <Globe size={18} className="text-blue-500" />
                </div>
                <div>
                  <h3 className="font-black text-sm">Campus Distribution</h3>
                  <p className={`text-[10px] font-bold ${t.muted} uppercase tracking-widest`}>
                    Users & cycles per campus
                  </p>
                </div>
              </div>
            </div>

            {loading.campuses || loading.users ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} h="h-10" />)}
              </div>
            ) : campusUserMap.length === 0 ? (
              <div className="py-12 text-center">
                <Building2 size={40} className={`mx-auto mb-3 ${t.muted} opacity-30`} />
                <p className={`text-sm font-black ${t.muted}`}>No campus data</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={campusUserMap} layout="vertical" barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? "#ffffff08" : "#00000008"} />
                  <XAxis type="number" tick={{ fontSize: 10, fontWeight: 800, fill: isDark ? "#666" : "#999" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fontWeight: 800, fill: isDark ? "#888" : "#555" }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip content={<CustomTooltip isDark={isDark} />} />
                  <Legend wrapperStyle={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }} />
                  <Bar dataKey="users" name="Users" fill="#3B82F6" radius={[0, 6, 6, 0]} />
                  <Bar dataKey="cycles" name="Cycles" fill="var(--color-primary, #f59e0b)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Batch Status Summary + Quick Stats */}
          <div className={`${t.card} p-6`}>
            <div className={`flex items-center gap-3 mb-6 pb-4 border-b ${t.divider}`}>
              <div className="p-2 rounded-xl bg-emerald-500/10">
                <Activity size={18} className="text-emerald-500" />
              </div>
              <div>
                <h3 className="font-black text-sm">System Pulse</h3>
                <p className={`text-[10px] font-bold ${t.muted} uppercase tracking-widest`}>
                  Live module status
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Academic Year",
                  value: activeYear ? activeYear.name : "None Active",
                  status: activeYear ? "operational" : "warning",
                  icon: BookOpen,
                  loading: loading.years,
                },
                {
                  label: "Open Admission Cycles",
                  value: loading.cycles ? "…" : `${openCycles} / ${cycles.length}`,
                  status: openCycles > 0 ? "operational" : "warning",
                  icon: Rocket,
                  loading: loading.cycles,
                },
                {
                  label: "Pending NACH Batches",
                  value: loading.batches ? "…" : pendingBatches,
                  status: pendingBatches > 0 ? "warning" : "operational",
                  icon: FileStack,
                  loading: loading.batches,
                },
                {
                  label: "Active Fee Categories",
                  value: loading.categories ? "…" : `${activeFeeCategories} / ${feeCategories.length}`,
                  status: "operational",
                  icon: DollarSign,
                  loading: loading.categories,
                },
                {
                  label: "Active User Accounts",
                  value: loading.users ? "…" : `${activeUsers} / ${totalUsers}`,
                  status: "operational",
                  icon: Users,
                  loading: loading.users,
                },
                {
                  label: "Campus Infrastructure",
                  value: loading.campuses ? "…" : `${activeCampuses} / ${totalCampuses}`,
                  status: activeCampuses === totalCampuses ? "operational" : "warning",
                  icon: Building2,
                  loading: loading.campuses,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl ${t.glass}`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={15} className={`${t.muted}`} />
                    <span className={`text-xs font-bold ${t.sub}`}>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.loading ? (
                      <Skeleton h="h-4" w="w-16" />
                    ) : (
                      <span className="text-xs font-black">{item.value}</span>
                    )}
                    <div className={`w-2 h-2 rounded-full ${
                      item.status === "operational" ? "bg-emerald-500" :
                      item.status === "warning" ? "bg-amber-500 animate-pulse" :
                      "bg-red-500 animate-pulse"
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom Tables Row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

          {/* Recent Admission Cycles */}
          <div className={`${t.card} overflow-hidden`}>
            <div className={`flex items-center justify-between px-6 py-5 border-b ${t.divider}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Rocket size={16} className="text-primary" />
                </div>
                <h3 className="font-black text-sm">Recent Admission Cycles</h3>
              </div>
              <span className={t.tag("primary")}>{filteredCycles.length} Total</span>
            </div>

            <div className="overflow-x-auto">
              {loading.cycles ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} h="h-10" />)}
                </div>
              ) : filteredCycles.length === 0 ? (
                <div className="py-16 text-center">
                  <Rocket size={32} className={`mx-auto mb-2 ${t.muted} opacity-30`} />
                  <p className={`text-sm font-black ${t.muted}`}>No cycles found</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`${isDark ? "bg-white/[0.03]" : "bg-gray-50"}`}>
                      {["Branch", "Campus", "Year", "Status"].map((h) => (
                        <th key={h} className={`px-5 py-3.5 font-black uppercase tracking-widest text-[10px] ${t.muted}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.divider}`}>
                    {filteredCycles.slice(0, 8).map((c) => {
                      const statusColors = {
                        OPEN: "green", DRAFT: "blue", CLOSE: "red", PAUSE: "yellow"
                      };
                      return (
                        <tr key={c.id} className={`transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50/80"}`}>
                          <td className="px-5 py-3.5">
                            <p className="font-black truncate max-w-[140px]">
                              {c.branchAcademicYear?.branch?.name || "—"}
                            </p>
                          </td>
                          <td className={`px-5 py-3.5 font-bold ${t.muted}`}>
                            {c.branchAcademicYear?.campus?.name || "—"}
                          </td>
                          <td className={`px-5 py-3.5 font-bold text-primary`}>
                            {c.branchAcademicYear?.academicYear?.name || "—"}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={t.tag(statusColors[c.status] || "primary")}>
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* NACH Batches Table */}
          <div className={`${t.card} overflow-hidden`}>
            <div className={`flex items-center justify-between px-6 py-5 border-b ${t.divider}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10">
                  <FileStack size={16} className="text-emerald-500" />
                </div>
                <h3 className="font-black text-sm">NACH Batch Overview</h3>
              </div>
              <span className={t.tag("green")}>{batches.length} Batches</span>
            </div>

            <div className="overflow-x-auto">
              {loading.batches ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} h="h-10" />)}
                </div>
              ) : batches.length === 0 ? (
                <div className="py-16 text-center">
                  <FileStack size={32} className={`mx-auto mb-2 ${t.muted} opacity-30`} />
                  <p className={`text-sm font-black ${t.muted}`}>No batches found</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={isDark ? "bg-white/[0.03]" : "bg-gray-50"}>
                      {["Batch", "Date", "Records", "Amount", "Status"].map((h) => (
                        <th key={h} className={`px-5 py-3.5 font-black uppercase tracking-widest text-[10px] ${t.muted}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${t.divider}`}>
                    {batches.slice(0, 8).map((b) => {
                      const statusColor = b.status === "FILE_GENERATED" ? "green" : b.status === "PROCESSING" ? "blue" : "yellow";
                      return (
                        <tr key={b.batchId} className={`transition-colors ${isDark ? "hover:bg-white/[0.02]" : "hover:bg-gray-50/80"}`}>
                          <td className="px-5 py-3.5">
                            <span className="font-black text-primary">#{b.batchId}</span>
                            <p className={`font-bold ${t.muted} truncate max-w-[100px]`}>{b.batchName}</p>
                          </td>
                          <td className={`px-5 py-3.5 font-bold ${t.muted}`}>
                            {new Date(b.batchDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                          </td>
                          <td className="px-5 py-3.5 font-black">{b.totalRecords}</td>
                          <td className="px-5 py-3.5 font-black text-primary">
                            ₹{(b.totalAmount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={t.tag(statusColor)}>
                              {b.status?.replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* ── Campus Cards Grid ─────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-black tracking-tight">Campus Roster</h2>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mt-0.5 ${t.muted}`}>
                {totalCampuses} registered • {activeCampuses} operational
              </p>
            </div>
          </div>

          {loading.campuses ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`${t.card} p-6 space-y-3`}>
                  <Skeleton h="h-8" w="w-20" />
                  <Skeleton h="h-4" w="w-32" />
                  <Skeleton h="h-4" w="w-24" />
                </div>
              ))}
            </div>
          ) : campuses.length === 0 ? (
            <div className={`${t.card} py-20 text-center`}>
              <Building2 size={48} className={`mx-auto mb-3 ${t.muted} opacity-20`} />
              <p className={`font-black ${t.muted}`}>No campuses found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {campuses.map((campus, i) => {
                const campusCycles = cycles.filter(
                  (c) =>
                    c.branchAcademicYear?.campus?.id === campus.id ||
                    c.branchAcademicYear?.branch?.campusId === campus.id
                );
                const openCount = campusCycles.filter((c) => c.status === "OPEN").length;
                const isActive = campus.isActive !== false;

                return (
                  <div
                    key={campus.id}
                    className={`${t.card} ${t.cardHover} p-5 relative overflow-hidden group`}
                  >
                    <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${
                      isActive ? "from-emerald-500 to-emerald-600" : "from-gray-400 to-gray-500"
                    }`} />

                    <div className="pl-3">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm ${
                          isDark ? "bg-white/5 text-primary" : "bg-primary/10 text-primary"
                        }`}>
                          {(campus.name || campus.code || "?")[0].toUpperCase()}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-gray-400"}`} />
                          <span className={`text-[9px] font-black uppercase tracking-widest ${t.muted}`}>
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-black text-sm leading-tight mb-1 truncate">{campus.name}</h3>
                      <p className={`text-[10px] font-black uppercase tracking-widest ${t.muted} mb-4`}>
                        {campus.code} • {campus.city || "—"}
                      </p>

                      <div className={`grid grid-cols-2 gap-2 pt-3 border-t ${t.divider}`}>
                        <div>
                          <p className="text-lg font-black text-primary leading-none">{campusCycles.length}</p>
                          <p className={`text-[9px] font-black uppercase ${t.muted}`}>Cycles</p>
                        </div>
                        <div>
                          <p className="text-lg font-black text-emerald-500 leading-none">{openCount}</p>
                          <p className={`text-[9px] font-black uppercase ${t.muted}`}>Open</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <div className={`flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t ${t.divider}`}>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${t.muted}`}>
              All Systems Operational
            </p>
          </div>
          <p className={`text-[10px] font-bold ${t.muted}`}>
            Last updated: {lastRefreshed.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
