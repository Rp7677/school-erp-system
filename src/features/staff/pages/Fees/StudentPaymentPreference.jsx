import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../config/api";
import {
  Search, School, Calendar, BookOpen, Loader2, 
  GraduationCap, ChevronDown, CheckCircle2, 
  X, Landmark, Banknote, ShieldAlert, ShieldCheck, 
  Fingerprint, Wallet, TrendingUp
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const StudentPaymentPreference = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");

  const [selections, setSelections] = useState({ campusId: "", branchId: "", academicYearId: "", branchGradeId: "" });
  const [options, setOptions] = useState({ campuses: [], branches: [], academicYears: [], grades: [] });
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState({ initial: true, students: false, action: null });
  const [modal, setModal] = useState({ show: false, type: null, student: null });
  const [mandateForm, setMandateForm] = useState({ accountNumber: "", ifsc: "", accountHolderName: "", maxAmount: "", startDate: "", endDate: "" });
  const [activationRef, setActivationRef] = useState("");

  useEffect(() => { fetchInitialData(); }, []);

  const fetchInitialData = async () => {
    try {
      const [campusRes, branchRes, yearRes] = await Promise.all([
        api.get("/api/campuses"),
        api.get("/api/branches"),
        api.get("/api/academic-years/get-all-academic-year")
      ]);
      setOptions(prev => ({ ...prev, campuses: campusRes.data, branches: branchRes.data, academicYears: yearRes.data }));
    } catch (error) { toast.error("System Sync Failed"); }
    finally { setLoading(prev => ({ ...prev, initial: false })); }
  };

  useEffect(() => {
    if (selections.branchId) {
      api.get(`/api/branches/${selections.branchId}/grades`)
        .then(res => setOptions(prev => ({ ...prev, grades: res.data || [] })));
    }
  }, [selections.branchId]);

  const fetchStudents = async () => {
    if (!selections.branchGradeId || !selections.academicYearId) return toast.error("Selection Required");
    setLoading(prev => ({ ...prev, students: true }));
    try {
      const [enrollRes, mandateRes] = await Promise.all([
        api.get(`/api/admission/getEnrollmentsByBranchGradeAndAcademicYear/${selections.branchGradeId}/${selections.academicYearId}`),
        api.get(`/api/nach/mandates`)
      ]);
      const enrollmentList = enrollRes.data.content || [];
      const allMandates = mandateRes.data || [];

      const enrichedStudents = await Promise.all(enrollmentList.map(async (student) => {
        let pref = null;
        try {
          const p = await api.get(`/api/payment-preference`, { params: { studentEnrollmentId: student.id } });
          pref = p.data;
        } catch (e) { pref = null; }
        const mandate = allMandates.find(m => m.studentEnrollmentId === student.id);
        return { ...student, paymentPreference: pref, mandate };
      }));
      setStudents(enrichedStudents);
    } catch (error) { toast.error("Search Protocol Failed"); }
    finally { setLoading(prev => ({ ...prev, students: false })); }
  };

  const handlePreferenceChange = async (student, mode) => {
    if (mode === "NACH") {
      setModal({ show: true, type: student.mandate ? "VIEW_MANDATE" : "CREATE_MANDATE", student });
      return;
    }
    setLoading({ ...loading, action: student.id });
    try {
      await api.post(`/api/payment-preference`, null, { params: { studentEnrollmentId: student.id, mode } });
      toast.success(`${mode} Selection Confirmed`);
      fetchStudents();
    } catch (e) { toast.error("Update Failed"); }
    finally { setLoading({ ...loading, action: null }); }
  };

  const handleCreateMandate = async (e) => {
    e.preventDefault();
    setLoading({ ...loading, action: modal.student.id });
    try {
      await api.post(`/api/payment-preference`, null, { params: { studentEnrollmentId: modal.student.id, mode: "NACH" } });
      await api.post(`/api/nach/mandates`, { ...mandateForm, studentEnrollmentId: modal.student.id });
      toast.success("Mandate Strategy Created");
      setModal({ show: false, type: null, student: null });
      fetchStudents();
    } catch (e) { toast.error("Mandate Creation Failed"); }
    finally { setLoading({ ...loading, action: null }); }
  };

  const handleActivateMandate = async () => {
    setLoading({ ...loading, action: modal.student.id });
    try {
      await api.post(`/api/nach/mandates/${modal.student.id}/activate`, null, { params: { ref: activationRef } });
      toast.success("Security Activation Complete");
      setModal({ show: false, type: null, student: null });
      fetchStudents();
    } catch (e) { toast.error("Activation Error"); }
    finally { setLoading({ ...loading, action: null }); }
  };

  // Modern Styles
  const glassPanel = `rounded-[2.5rem] border shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-xl ${isDark ? "bg-[#111111]/80 border-white/10" : "bg-white/80 border-gray-100"}`;
  const actionBtn = `flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 active:scale-95`;
  
  // Custom Select Style - FIXED for Visibility
  const customSelectContainer = `relative w-full group`;
  const selectStyle = `appearance-none w-full px-5 py-4 rounded-2xl border outline-none font-bold text-xs transition-all duration-300 cursor-pointer
    ${isDark 
      ? "bg-[#1A1A1A] border-white/10 text-white focus:border-primary focus:ring-4 focus:ring-primary/20" 
      : "bg-gray-50 border-gray-200 text-gray-800 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10"}`;

  return (
    <div className={`min-h-screen p-4 lg:p-10 max-w-[1700px] mx-auto space-y-10 selection:bg-primary selection:text-white ${isDark ? "text-gray-100" : "text-gray-800"}`}>
      <Toaster position="bottom-center" />

      {/* Hero Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/10 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary rounded-xl rotate-12 shadow-lg shadow-primary/40"><Wallet className="text-white" /></div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic leading-none">
              Payment <span className="text-primary not-italic">Gateway Control</span>
            </h1>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 flex items-center gap-2">
            <Fingerprint size={14} className="text-primary"/> Financial Enrollment Infrastructure
          </p>
        </div>
        <div className="hidden lg:flex gap-10">
            <div className="text-right">
                <p className="text-[10px] font-black text-gray-500 uppercase">Active Students</p>
                <p className="text-2xl font-black">{students.length}</p>
            </div>
            <div className="text-right">
                <p className="text-[10px] font-black text-gray-500 uppercase">System Status</p>
                <p className="text-2xl font-black text-green-500">ENCRYPTED</p>
            </div>
        </div>
      </div>

      {/* Filter Section - FIXED OVERFLOW */}
      <div className={glassPanel}>
        <div className="p-8 lg:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Campus', icon: <School size={14}/>, key: 'campusId', opts: options.campuses },
            { label: 'Branch', icon: <GraduationCap size={14}/>, key: 'branchId', opts: options.branches.filter(b => String(b.campusId) === String(selections.campusId)) },
            { label: 'Grade', icon: <BookOpen size={14}/>, key: 'branchGradeId', opts: options.grades },
            { label: 'Academic Year', icon: <Calendar size={14}/>, key: 'academicYearId', opts: options.academicYears },
          ].map((field) => (
            <div key={field.key} className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center gap-2">
                {field.icon} {field.label}
              </label>
              <div className={customSelectContainer}>
                <select 
                  className={selectStyle}
                  value={selections[field.key]}
                  onChange={(e) => setSelections(prev => ({ ...prev, [field.key]: e.target.value }))}
                >
                  <option value="" className={isDark ? "bg-[#1A1A1A]" : "bg-white"}>Select {field.label}</option>
                  {field.opts.map(o => (
                    <option key={o.id} value={o.id} className={isDark ? "bg-[#1A1A1A]" : "bg-white text-gray-800"}>
                      {o.name || o.gradeName || `${o.campusName} - ${o.mediumName}`}
                    </option>
                  ))}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40 group-hover:text-primary transition-colors">
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="px-8 lg:px-12 pb-12">
          <button 
            onClick={fetchStudents} 
            disabled={loading.students} 
            className="group w-full py-5 bg-primary text-white font-black uppercase text-xs tracking-[0.3em] rounded-2xl shadow-2xl shadow-primary/40 hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-4"
          >
            {loading.students ? <Loader2 className="animate-spin"/> : <Search size={20} className="group-hover:rotate-12 transition-transform"/>}
            Execute Global Search
          </button>
        </div>
      </div>

{/* Main Action Table */}
<div className={`${glassPanel} overflow-hidden`}>
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className={`border-b ${isDark ? "border-white/10" : "border-gray-100"} bg-primary/5`}>
          <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">ID / Student</th>
          <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Enrollment & Roll</th>
          <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Mandate Status</th>
          <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 text-right">Action / Preference</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {students.length > 0 ? (
          students.map((student) => (
            <tr key={student.id} className="group hover:bg-primary/[0.02] transition-colors">
              {/* Profile Cell */}
              <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-[10px] shadow-lg group-hover:rotate-6 transition-transform">
                    {student.id}
                  </div>
                  <div>
                    <p className="font-bold text-sm tracking-tight">{student.firstName || 'Student Name'}</p>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{student.status}</p>
                  </div>
                </div>
              </td>

              {/* Enrollment Cell */}
              <td className="px-6 py-5">
                <div className="space-y-1">
                  <p className="font-black text-xs tracking-widest">{student.enrollmentNo}</p>
                  <p className="text-[9px] font-bold text-primary uppercase">Roll: {student.rollNumber}</p>
                </div>
              </td>

              {/* Mandate Status Cell */}
              <td className="px-6 py-5">
                {student.mandate ? (
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase border ${
                    student.mandate.status === 'ACTIVE' 
                    ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                    : 'bg-orange-500/10 border-orange-500/20 text-orange-500'
                  }`}>
                    {student.mandate.status === 'ACTIVE' ? <ShieldCheck size={12}/> : <ShieldAlert size={12}/>}
                    {student.mandate.status}
                  </div>
                ) : (
                  <span className="text-[9px] font-black text-gray-500 uppercase italic opacity-50 underline decoration-dotted">No Mandate Found</span>
                )}
              </td>

              {/* Action Cell */}
              <td className="px-8 py-5 text-right">
                {student.paymentPreference ? (
                  <button 
                    onClick={() => student.paymentPreference.preferredMode === 'NACH' && setModal({ show: true, type: 'VIEW_MANDATE', student })}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-black text-[9px] uppercase tracking-tighter hover:scale-105 transition-transform"
                  >
                    <Landmark size={12}/> {student.paymentPreference.preferredMode} ACTIVE
                  </button>
                ) : (
                  <select 
                    className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest outline-none border transition-all cursor-pointer ${
                      isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-gray-200 text-gray-700"
                    } focus:border-primary`}
                    onChange={(e) => handlePreferenceChange(student, e.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>Select Mode</option>
                    <option value="NACH">NACH</option>
                    <option value="GATEWAY">GATEWAY</option>
                  </select>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="4" className="py-32 text-center opacity-20 grayscale">
              <div className="flex flex-col items-center gap-4">
                <TrendingUp size={60} strokeWidth={1}/>
                <p className="font-black uppercase tracking-[0.8em] text-[10px]">Awaiting Data Input</p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
      {/* Premium Mandate Modal */}
      {modal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
          <div className={`${isDark ? 'bg-[#0F0F0F] border-white/10' : 'bg-white border-gray-200'} border w-full max-w-2xl rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden`}>
            
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-primary/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white"><Landmark/></div>
                <h2 className="text-2xl font-black uppercase tracking-tighter italic">
                  {modal.type === "CREATE_MANDATE" ? "Mandate Issuance" : "Secure Vault"}
                </h2>
              </div>
              <button onClick={() => setModal({show:false})} className="p-3 hover:bg-red-500/20 text-red-500 rounded-2xl transition-colors"><X/></button>
            </div>
            
            <div className="p-10">
              {modal.type === "CREATE_MANDATE" ? (
                <form onSubmit={handleCreateMandate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2"><label className="text-[10px] font-black text-gray-500 uppercase ml-2">Card Holder Name</label><input required className={selectStyle} onChange={e => setMandateForm({...mandateForm, accountHolderName: e.target.value})}/></div>
                    <div><label className="text-[10px] font-black text-gray-500 uppercase ml-2">Bank Account Number</label><input required className={selectStyle} onChange={e => setMandateForm({...mandateForm, accountNumber: e.target.value})}/></div>
                    <div><label className="text-[10px] font-black text-gray-500 uppercase ml-2">IFSC Routing Code</label><input required className={selectStyle} onChange={e => setMandateForm({...mandateForm, ifsc: e.target.value})}/></div>
                    <div><label className="text-[10px] font-black text-gray-500 uppercase ml-2">Max Debit Limit</label><input type="number" required className={selectStyle} onChange={e => setMandateForm({...mandateForm, maxAmount: e.target.value})}/></div>
                    <div><label className="text-[10px] font-black text-gray-500 uppercase ml-2">Effective From</label><input type="date" required className={selectStyle} onChange={e => setMandateForm({...mandateForm, startDate: e.target.value})}/></div>
                  </div>
                  <button className="w-full py-5 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-primary/30 hover:scale-[1.02] transition-transform mt-4">Generate Mandate Certificate</button>
                </form>
              ) : (
                <div className="space-y-8">
                  <div className={`p-8 rounded-[2rem] ${isDark ? 'bg-white/5' : 'bg-gray-50'} border border-white/5 space-y-6`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[10px] text-gray-500 font-black uppercase">Active Mandate Account</p>
                            <p className="text-xl font-black">{modal.student.mandate?.bankAccountMasked}</p>
                        </div>
                        <Banknote className="text-primary" size={32}/>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                        <div><p className="text-[10px] text-gray-500 font-black uppercase">Routing IFSC</p><p className="font-bold">{modal.student.mandate?.ifscCode}</p></div>
                        <div><p className="text-[10px] text-gray-500 font-black uppercase">Max Allowance</p><p className="font-black text-primary text-lg">₹{modal.student.mandate?.maxAmount}</p></div>
                    </div>
                  </div>
                  
                  {modal.student.mandate?.status !== 'ACTIVE' && (
                    <div className="space-y-4 animate-in slide-in-from-bottom-5 duration-700">
                      <div className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center gap-4">
                        <ShieldAlert className="text-orange-500" size={24}/>
                        <p className="text-[11px] font-black text-orange-500 uppercase leading-relaxed">System requires activation reference (UMRN) to finalize the mandate.</p>
                      </div>
                      <div className="flex gap-3">
                        <input placeholder="Enter Reference Code" className={selectStyle} onChange={e => setActivationRef(e.target.value)}/>
                        <button onClick={handleActivateMandate} className="px-10 bg-green-600 text-white font-black uppercase text-xs rounded-2xl hover:bg-green-500 transition-colors">Activate</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentPaymentPreference;