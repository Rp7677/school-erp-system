import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../../config/api"; 
import { 
  Calendar, Save, Search, RefreshCcw, 
  Plus, ArrowLeft, Hash, Clock, Filter
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

const FeeDueDatesManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  
  // --- Redux Campus Integration ---
  const { campuses, selectedCampus, superAdmin } = useSelector((state) => state.campus);
  console.log(JSON.stringify(campuses) + "campusescampusescampusescampusescampuses");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" or "create"

  const [data, setData] = useState({
    branches: [], grades: [], streams: [],
    academicYears: [], admissionTypes: [], structureTypes: [],
    availableStructures: [] 
  });

  const [filters, setFilters] = useState({
    campusId: "", branchId: "", branchGradeId: "",
    branchGradeStreamId: "", admissionTypeId: "",
    academicYearId: "", feeStructureTypeId: "",
    selectedStructureId: ""
  });

  const [installments, setInstallments] = useState([]);

  // 1. Initial Load (Now excluding campuses as they come from Redux)
  useEffect(() => {
    const loadBasics = async () => {
      try {
        const [ay, adm] = await Promise.all([
          api.get("/api/academic-years/get-all-academic-year"),
          api.get("/api/admission-types")
        ]);
        setData(prev => ({
          ...prev,
          academicYears: ay.data,
          admissionTypes: adm.data
        }));
      } catch (err) {
        toast.error("Failed to load initial data");
      }
    };
    loadBasics();
  }, []);

  // 2. Cascading Selection
  useEffect(() => {
    if (filters.campusId) {
      api.get("/api/branches").then(res => {
        setData(prev => ({ ...prev, branches: res.data.filter(b => b.campusId === parseInt(filters.campusId)) }));
      });
      api.get(`/api/fees/structure-types?campus_id=${filters.campusId}`).then(res => {
        setData(prev => ({ ...prev, structureTypes: res.data }));
      });
      api.get(`/api/fees/structures?campusId=${filters.campusId}`).then(res => {
        setData(prev => ({ ...prev, availableStructures: res.data.filter(s => s.active) }));
      });
    }
  }, [filters.campusId]);

  useEffect(() => {
    if (filters.branchId) {
      api.get(`/api/branches/${filters.branchId}/grades`).then(res => {
        setData(prev => ({ ...prev, grades: res.data }));
      });
    }
  }, [filters.branchId]);

  useEffect(() => {
    if (filters.branchGradeId) {
      api.get(`/api/branch-grades/${filters.branchGradeId}/streams`).then(res => {
        setData(prev => ({ ...prev, streams: res.data.streams || [] }));
      });
    }
  }, [filters.branchGradeId]);

  // Derived: Filter templates based on selected Grade Name
  const filteredTemplates = data.availableStructures.filter(template => {
    if (!filters.branchGradeId) return true;
    const selectedGradeName = data.grades.find(g => g.id === parseInt(filters.branchGradeId))?.gradeName;
    return template.grade === selectedGradeName;
  });

  const fetchExistingSchedule = async () => {
    const { branchGradeId, academicYearId, admissionTypeId, feeStructureTypeId } = filters;
    if (!branchGradeId || !academicYearId || !admissionTypeId || !feeStructureTypeId) {
      return toast.error("Please fill all configuration filters");
    }

    setFetching(true);
    try {
      const query = `branchGradeId=${branchGradeId}&branchGradeStreamId=${filters.branchGradeStreamId || ""}&academicYearId=${academicYearId}&admissionTypeId=${admissionTypeId}&feeStructureTypeId=${feeStructureTypeId}`;
      const res = await api.get(`/api/fees/installment-schedule?${query}`);
      
      setInstallments(res.data.map(inst => ({
        installmentId: inst.installmentId,
        installmentName: inst.name,
        startDate: inst.startDate,
        dueDate: inst.dueDate
      })));
      setViewMode("list");
      if (res.data.length === 0) toast.error("No schedule found for these filters");
    } catch (err) {
      toast.error("Failed to fetch schedule");
    } finally {
      setFetching(false);
    }
  };

  const handleFetchInstallments = async () => {
    if (!filters.selectedStructureId) return toast.error("Select a Template first");
    
    setFetching(true);
    try {
      const res = await api.get(`/api/fees/structures/${filters.selectedStructureId}`);
      const installmentsData = res.data.lines?.[0]?.installments;
      
      if (installmentsData) {
        setInstallments(installmentsData.map(inst => ({
          installmentId: inst.installmentId,
          installmentName: inst.installmentName,
          startDate: "",
          dueDate: ""
        })));
        setViewMode("create");
        toast.success("Loaded template quarters");
      } else {
        toast.error("Template has no installments");
      }
    } catch (err) {
      toast.error("Error loading structure");
    } finally {
      setFetching(false);
    }
  };

  const handlePublish = async () => {
    if (installments.some(i => !i.startDate || !i.dueDate)) {
      return toast.error("Please fill all dates");
    }

    setLoading(true);
    try {
      await api.post("/api/fees/installment-schedule", {
        ...filters,
        campusId: parseInt(filters.campusId),
        branchId: parseInt(filters.branchId),
        branchGradeId: parseInt(filters.branchGradeId),
        branchGradeStreamId: filters.branchGradeStreamId ? parseInt(filters.branchGradeStreamId) : null,
        admissionTypeId: parseInt(filters.admissionTypeId),
        feeStructureTypeId: parseInt(filters.feeStructureTypeId),
        academicYearId: parseInt(filters.academicYearId),
        installments
      });
      toast.success("Schedule published!");
      setViewMode("list");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl border font-bold text-sm transition-all outline-none ${
    isDark ? "bg-[#1A1A1A] border-white/10 text-white focus:border-primary" : "bg-gray-50 border-gray-200 text-gray-900 focus:border-primary"
  } disabled:opacity-50 disabled:cursor-not-allowed`;

  return (
    <div className={` space-y-6 ${isDark ? "text-white" : "text-gray-900"}`}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tight">
            Fee <span className="text-primary">Schedules</span>
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={`h-2 w-2 rounded-full ${viewMode === 'list' ? 'bg-green-500' : 'bg-orange-500'}`} />
            <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest">
              {viewMode === "list" ? "Live Mode: Viewing Records" : "Draft Mode: Setting Timelines"}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {viewMode === "create" && (
            <button onClick={() => setViewMode("list")} className="px-6 py-4 rounded-2xl font-black flex gap-2 items-center border border-primary/20 text-primary text-sm uppercase hover:bg-primary/5">
              <ArrowLeft size={18} /> Exit
            </button>
          )}
          <button 
            onClick={viewMode === "list" ? handleFetchInstallments : handlePublish}
            disabled={loading || (viewMode === "create" && installments.length === 0)}
            className="bg-primary hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 text-white px-10 py-4 rounded-2xl font-black flex gap-3 items-center transition-all shadow-xl shadow-primary/20 uppercase text-sm"
          >
            {loading ? <RefreshCcw className="animate-spin" size={20} /> : viewMode === "list" ? <Plus size={20} /> : <Save size={20} />} 
            {viewMode === "list" ? "New Schedule" : "Publish Now"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className={`lg:col-span-4 p-6 rounded-[2.5rem] border ${isDark ? "bg-[#141414] border-white/5" : "bg-white border-gray-100 shadow-sm"} space-y-4 h-fit`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
               <Filter size={16} className="text-primary" />
               <span className="text-xs font-black uppercase tracking-tighter opacity-70">Configuration</span>
            </div>
            {fetching && <RefreshCcw className="animate-spin text-primary" size={16} />}
          </div>

          <select value={filters.campusId} onChange={e => setFilters({...filters, campusId: e.target.value})} className={inputClass}>
            <option value="">Select Campus</option>
            {campuses?.map(c => <option key={c.campusId} value={c.campusId}>{c.campusName}</option>)}
          </select>

          <select value={filters.branchId} onChange={e => setFilters({...filters, branchId: e.target.value})} className={inputClass} disabled={!filters.campusId}>
            <option value="">Select Branch</option>
            {data.branches.map(b => <option key={b.id} value={b.id}>{b.boardName}</option>)}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <select value={filters.branchGradeId} onChange={e => setFilters({...filters, branchGradeId: e.target.value, selectedStructureId: ""})} className={inputClass} disabled={!filters.branchId}>
              <option value="">Grade</option>
              {data.grades.map(g => <option key={g.id} value={g.id}>{g.gradeName}</option>)}
            </select>
            <select value={filters.branchGradeStreamId} onChange={e => setFilters({...filters, branchGradeStreamId: e.target.value})} className={inputClass} disabled={!filters.branchGradeId}>
              <option value="">Stream</option>
              {data.streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <select value={filters.academicYearId} onChange={e => setFilters({...filters, academicYearId: e.target.value})} className={inputClass}>
            <option value="">Academic Year</option>
            {data.academicYears.map(ay => <option key={ay.id} value={ay.id}>{ay.name}</option>)}
          </select>

          <select value={filters.admissionTypeId} onChange={e => setFilters({...filters, admissionTypeId: e.target.value})} className={inputClass}>
            <option value="">Admission Type</option>
            {data.admissionTypes.map(at => <option key={at.id} value={at.id}>{at.name}</option>)}
          </select>

          <select value={filters.feeStructureTypeId} onChange={e => setFilters({...filters, feeStructureTypeId: e.target.value})} className={inputClass}>
            <option value="">Structure Type</option>
            {data.structureTypes.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
          </select>

          <button onClick={fetchExistingSchedule} className={`w-full py-4 rounded-2xl font-black flex justify-center gap-2 transition-all uppercase text-[11px] border ${isDark ? "border-white/10 hover:bg-white/5" : "border-gray-200 hover:bg-gray-50"}`}>
            <Search size={16} /> View Existing Schedule
          </button>

          <div className="pt-4 border-t border-white/5 space-y-2">
             <label className="text-[10px] font-black uppercase text-primary ml-1">Fee Template Filtered by Grade</label>
             <select 
              value={filters.selectedStructureId} 
              onChange={e => setFilters({...filters, selectedStructureId: e.target.value})} 
              className={`${inputClass} border-primary/40`}
              disabled={!filters.branchGradeId}
            >
              <option value="">{filters.branchGradeId ? "Choose Template..." : "Select Grade First"}</option>
              {filteredTemplates.map(s => (
                <option key={s.id} value={s.id}>{s.grade} (v{s.version}) - {s.stream} - {s.branch} - {s.structureType} </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Panel */}
        <div className="lg:col-span-8">
          {installments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {installments.map((inst, index) => (
                <div key={inst.installmentId} className={`p-6 rounded-[2rem] border transition-all ${isDark ? "bg-[#141414] border-white/5 hover:border-primary/20" : "bg-white border-gray-100 shadow-sm hover:shadow-md"}`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black italic text-primary">{inst.installmentName}</h3>
                    <span className="text-[10px] font-black px-3 py-1 bg-primary/10 rounded-full text-primary uppercase">Step {index + 1}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase opacity-40 ml-2 mb-1 block">Start Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40" size={16} />
                        <input type="date" readOnly={viewMode === "list"} value={inst.startDate || ""}
                          onChange={(e) => setInstallments(prev => prev.map(i => i.installmentId === inst.installmentId ? {...i, startDate: e.target.value} : i))}
                          className={`${inputClass} !pl-12 ${viewMode === "list" ? "border-transparent bg-transparent" : ""}`} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase opacity-40 ml-2 mb-1 block">Due Date</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-500 opacity-40" size={16} />
                        <input type="date" readOnly={viewMode === "list"} value={inst.dueDate || ""}
                          onChange={(e) => setInstallments(prev => prev.map(i => i.installmentId === inst.installmentId ? {...i, dueDate: e.target.value} : i))}
                          className={`${inputClass} !pl-12 border-orange-500/20 ${viewMode === "list" ? "border-transparent bg-transparent" : ""}`} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`h-full min-h-[500px] border-2 border-dashed rounded-[3rem] flex flex-col items-center justify-center opacity-40 ${isDark ? "border-white/10" : "border-gray-200"}`}>
              <div className="bg-primary/5 p-10 rounded-full mb-6">
                <Calendar size={80} className="text-primary" strokeWidth={0.5} />
              </div>
              <h2 className="text-lg font-black uppercase tracking-widest">No Schedule Selected</h2>
              <p className="text-xs font-bold text-center mt-2 max-w-xs leading-loose">
                Click <span className="text-primary">"View Existing"</span> to see current dates or select a <span className="text-primary">"Template"</span> and click <span className="text-primary">"New Schedule"</span> to create.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeDueDatesManager;