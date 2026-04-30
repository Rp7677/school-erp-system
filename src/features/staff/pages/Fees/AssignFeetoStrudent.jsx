import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../config/api";
import {
  Search, Users, School, Calendar, 
  BookOpen, Loader2, CreditCard, 
  GraduationCap, X, FilterX, 
  AlertCircle, ReceiptText, ArrowUpRight, 
  ArrowDownLeft, Info, UserCheck, 
  Wallet, ChevronDown, Printer
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const StudentFeeAssignment = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");

  // Selection States
  const [selections, setSelections] = useState({
    campusId: "",
    branchId: "",
    academicYearId: "",
    branchGradeId: ""
  });

  // Data Options
  const [options, setOptions] = useState({
    campuses: [],
    branches: [],
    academicYears: [],
    grades: [],
    feeTypes: []
  });

  // UI States
  const [students, setStudents] = useState([]);
  const [ledgerData, setLedgerData] = useState(null);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [loading, setLoading] = useState({
    initial: true,
    students: false,
    assigning: null,
    ledger: false
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [campusRes, branchRes, yearRes] = await Promise.all([
        api.get("/api/campuses"),
        api.get("/api/branches"),
        api.get("/api/academic-years/get-all-academic-year")
      ]);
      setOptions(prev => ({
        ...prev,
        campuses: campusRes.data || [],
        branches: branchRes.data || [],
        academicYears: yearRes.data || []
      }));
    } catch (error) {
      toast.error("Failed to load configuration data");
    } finally {
      setLoading(prev => ({ ...prev, initial: false }));
    }
  };

  useEffect(() => {
    if (selections.branchId) {
      api.get(`/api/branches/${selections.branchId}/grades`)
        .then(res => setOptions(prev => ({ ...prev, grades: res.data || [] })))
        .catch(() => toast.error("Error fetching grades"));
    } else {
      setOptions(prev => ({ ...prev, grades: [] }));
      setSelections(prev => ({ ...prev, branchGradeId: "" }));
    }
  }, [selections.branchId]);

  useEffect(() => {
    if (selections.campusId) {
      api.get(`/api/fees/structure-types?campus_id=${selections.campusId}`)
        .then(res => setOptions(prev => ({ ...prev, feeTypes: res.data || [] })))
        .catch(() => console.error("Error fetching fee types"));
    }
  }, [selections.campusId]);

  const fetchStudents = async () => {
    if (!selections.branchGradeId || !selections.academicYearId) {
      return toast.error("Please select Grade and Academic Year");
    }
    setLoading(prev => ({ ...prev, students: true }));
    try {
      const res = await api.get(
        `/api/admission/getEnrollmentsByBranchGradeAndAcademicYear/${selections.branchGradeId}/${selections.academicYearId}`
      );
      setStudents(res.data.content || []);
      if (res.data.content?.length === 0) toast.info("No students found for this selection");
    } catch (error) {
      toast.error("Failed to fetch student list");
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  };

  const handleAssignFee = async (enrollmentId) => {
    setLoading(prev => ({ ...prev, assigning: enrollmentId }));
    try {
      await api.post(`/api/fees/assign/${enrollmentId}`);
      toast.success("Fee assigned and ledger generated!");
      fetchStudents(); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Assignment failed");
    } finally {
      setLoading(prev => ({ ...prev, assigning: null }));
    }
  };

  const fetchLedger = async (enrollmentId) => {
    setLoading(prev => ({ ...prev, ledger: true }));
    try {
      const res = await api.get(`/api/fees/ledger/${enrollmentId}`);
      setLedgerData(res.data);
      setIsLedgerOpen(true);
    } catch (error) {
      toast.error("Could not load ledger entries");
    } finally {
      setLoading(prev => ({ ...prev, ledger: false }));
    }
  };

  // YOUR ORIGINAL UI STYLES
  const glassPanel = `rounded-[2.5rem] border shadow-2xl backdrop-blur-md transition-all duration-500 ${
    isDark ? "bg-[#121212]/90 border-white/10" : "bg-white/95 border-gray-100"
  }`;
  
  const inputGroup = `relative flex flex-col gap-2 group z-10`;
  
  const labelStyle = `text-[10px] font-black uppercase tracking-[0.2em] ml-1 flex items-center gap-2 transition-colors duration-300 ${
    isDark ? "text-gray-500 group-focus-within:text-primary" : "text-gray-400 group-focus-within:text-primary"
  }`;
  
  const selectStyle = `w-full appearance-none px-5 py-4 rounded-2xl border outline-none font-bold text-[13px] transition-all duration-300 cursor-pointer relative z-20 
    ${isDark 
      ? "bg-[#1A1A1A] border-white/10 text-white focus:border-primary focus:ring-4 focus:ring-primary/10" 
      : "bg-gray-50 border-gray-200 text-gray-800 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5"
    } disabled:opacity-40 disabled:cursor-not-allowed`;

  if (loading.initial) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-primary" size={60} strokeWidth={1.5} />
        <p className="font-black text-[10px] uppercase tracking-[0.5em] text-primary">Initializing Module...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 lg:p-10 max-w-[1700px] mx-auto space-y-10 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
      <Toaster position="top-right" gutter={12} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-[1.5rem] bg-primary shadow-xl shadow-primary/30 text-white transform -rotate-3">
              <CreditCard size={32} />
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase italic leading-none">
              Fee <span className="text-primary not-italic">Assignment</span>
            </h1>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 flex items-center gap-3">
            <span className="w-10 h-[2px] bg-primary rounded-full" />
            Ledger Generation Engine v2.0
          </p>
        </div>
      </div>

      {/* Filter Grid */}
      <div className={glassPanel}>
        <div className="p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className={inputGroup}>
              <label className={labelStyle}><School size={14}/> Campus Location</label>
              <div className="relative">
                <select className={selectStyle} value={selections.campusId} onChange={(e) => setSelections({...selections, campusId: e.target.value, branchId: "", branchGradeId: ""})}>
                  <option value="">Choose Campus</option>
                  {options.campuses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 z-30" size={18} />
              </div>
            </div>

            <div className={inputGroup}>
              <label className={labelStyle}><GraduationCap size={14}/> Academic Branch</label>
              <div className="relative">
                <select className={selectStyle} disabled={!selections.campusId} value={selections.branchId} onChange={(e) => setSelections({...selections, branchId: e.target.value, branchGradeId: ""})}>
                  <option value="">Select Branch</option>
                  {options.branches.filter(b => String(b.campusId) === String(selections.campusId)).map(b => <option key={b.id} value={b.id}>{b.campusName} - {b.mediumName}</option>)}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 z-30" size={18} />
              </div>
            </div>

            <div className={inputGroup}>
              <label className={labelStyle}><BookOpen size={14}/> Target Grade</label>
              <div className="relative">
                <select className={selectStyle} disabled={!selections.branchId} value={selections.branchGradeId} onChange={(e) => setSelections({...selections, branchGradeId: e.target.value})}>
                  <option value="">Select Grade</option>
                  {options.grades.map(g => <option key={g.id} value={g.id}>{g.gradeName}</option>)}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 z-30" size={18} />
              </div>
            </div>

            <div className={inputGroup}>
              <label className={labelStyle}><Calendar size={14}/> Session Year</label>
              <div className="relative">
                <select className={selectStyle} value={selections.academicYearId} onChange={(e) => setSelections({...selections, academicYearId: e.target.value})}>
                  <option value="">Select Session</option>
                  {options.academicYears.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 z-30" size={18} />
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <button onClick={fetchStudents} disabled={loading.students} className="group relative w-full lg:w-1/2 py-5 bg-primary text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.98] shadow-2xl shadow-primary/30">
              <div className="relative flex items-center justify-center gap-4">
                {loading.students ? <Loader2 className="animate-spin" size={20}/> : <Search size={20}/>}
                Execute Search Protocol
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className={`${glassPanel} overflow-hidden`}>
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-primary/5">
          <h3 className="font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3">
            <Users size={18} className="text-primary"/> Enrollment Master List
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                <th className="px-10 py-8 border-b border-white/5">Identity Profile</th>
                <th className="px-10 py-8 border-b border-white/5">Fee Structure</th>
                <th className="px-10 py-8 border-b border-white/5 text-center">Status</th>
                <th className="px-10 py-8 border-b border-white/5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
              {students.length > 0 ? students.map((student) => (
                <tr key={student.id} className="group hover:bg-primary/[0.02] transition-all duration-300">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white font-black text-xs shadow-lg transform group-hover:rotate-6 transition-transform">
                        {student.studentName?.substring(0,2) || "ST"}
                      </div>
                      <div>
                        <p className="font-black text-base tracking-tight">{student.studentName || "N/A"}</p>
                        <p className="text-[10px] font-black text-primary uppercase tracking-tighter opacity-70">Roll: {student.rollNumber || "PENDING"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-[11px] font-black uppercase tracking-tight">
                      Mapping: {options.feeTypes.find(f => f.id === student.feeStructureTypeId)?.code || "N/A"}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-center">
                    <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest
                        ${student.status === "ACTIVE" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                      {student.status}
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => handleAssignFee(student.id)} disabled={loading.assigning === student.id} className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:shadow-primary/40 disabled:opacity-50 transition-all active:scale-95">
                        {loading.assigning === student.id ? <Loader2 className="animate-spin" size={16}/> : <UserCheck size={16}/>}
                        Assign
                      </button>
                      <button onClick={() => fetchLedger(student.id)} className={`flex items-center gap-3 px-6 py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-primary hover:text-white hover:border-primary ${isDark ? "border-white/10 text-white" : "border-gray-100 text-gray-600"}`}>
                        <ReceiptText size={16}/> Ledger
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="py-24 text-center">
                    <div className="flex flex-col items-center gap-5 opacity-20 transform scale-110">
                      <FilterX size={80} strokeWidth={1} />
                      <p className="font-black uppercase tracking-[0.5em] text-xs">Waiting for search criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODIFIED COMPONENT: Financial Statement Centered Popup */}
      {isLedgerOpen && ledgerData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className={`w-full max-w-4xl max-h-[85vh] overflow-hidden rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col animate-in zoom-in-95 duration-300 ${isDark ? "bg-[#0A0A0A] border border-white/10" : "bg-white border border-gray-100"}`}>
            
            {/* Modal Header */}
            <div className="p-8 lg:p-10 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg transform -rotate-6">
                  <Wallet size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Financial Statement</h2>
                  <p className="text-[10px] font-black uppercase text-gray-500 mt-1 tracking-widest">Audit Grade Record</p>
                </div>
              </div>
              <button onClick={() => setIsLedgerOpen(false)} className={`p-4 rounded-2xl transition-all ${isDark ? "hover:bg-white/5" : "hover:bg-gray-100"}`}>
                <X size={28}/>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-8 lg:p-10 flex-1 overflow-y-auto space-y-10">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"}`}>
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Total Debit</p>
                  <p className="text-3xl font-black tracking-tighter text-red-500">₹{ledgerData.summary.totalDebit.toLocaleString()}</p>
                </div>
                <div className={`p-6 rounded-3xl border ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-100"}`}>
                  <p className="text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Total Credit</p>
                  <p className="text-3xl font-black tracking-tighter text-green-500">₹{ledgerData.summary.totalCredit.toLocaleString()}</p>
                </div>
                <div className="p-6 rounded-3xl bg-primary text-white shadow-xl shadow-primary/30">
                  <p className="text-[10px] font-black uppercase text-white/60 mb-2 tracking-widest">Current Due</p>
                  <p className="text-3xl font-black tracking-tighter">₹{ledgerData.summary.totalDue.toLocaleString()}</p>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] px-2">Ledger Entries</p>
                {ledgerData.entries.map((entry, idx) => (
                  <div key={idx} className={`p-6 rounded-[2rem] border flex items-center justify-between group transition-all ${isDark ? "bg-[#161616] border-white/5 hover:border-white/10" : "bg-white border-gray-100 hover:border-primary/20"}`}>
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${entry.debitAmount > 0 ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}>
                        {entry.debitAmount > 0 ? <ArrowUpRight size={20}/> : <ArrowDownLeft size={20}/>}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-tight">{entry.feeHeadName}</p>
                        <p className="text-[10px] font-bold text-gray-400 tracking-wider">Date: {new Date(entry.dueDate).toLocaleDateString('en-GB')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${entry.debitAmount > 0 ? "text-red-500" : "text-green-500"}`}>
                        {entry.debitAmount > 0 ? `+ ₹${entry.debitAmount.toLocaleString()}` : `- ₹${entry.creditAmount.toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-white/5 flex justify-center bg-primary/5">
              <button onClick={() => window.print()} className="flex items-center gap-4 px-12 py-5 rounded-2xl bg-primary text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">
                <Printer size={18}/> Export Audit Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFeeAssignment;