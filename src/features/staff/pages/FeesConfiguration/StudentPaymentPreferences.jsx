import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../config/api";
import {
  Search, School, Calendar, BookOpen, Loader2, 
  GraduationCap, ChevronDown, X, Landmark, 
  Banknote, ShieldAlert, ShieldCheck, 
  Fingerprint, Wallet, TrendingUp
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const StudentPaymentPreference = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  
  // Accessing your Redux Campus state
  const { campuses } = useSelector((state) => state.campus);

  const [selections, setSelections] = useState({ 
    campusId: "", 
    branchId: "", 
    academicYearId: "", 
    branchGradeId: "" 
  });
  
  const [options, setOptions] = useState({ 
    branches: [], 
    academicYears: [], 
    grades: [] 
  });

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState({ initial: true, students: false, action: null });
  const [modal, setModal] = useState({ show: false, type: null, student: null });
  const [mandateForm, setMandateForm] = useState({ 
    accountNumber: "", ifsc: "", accountHolderName: "", 
    maxAmount: "", startDate: "", endDate: "" 
  });
  const [activationRef, setActivationRef] = useState("");

  useEffect(() => { 
    fetchInitialData(); 
  }, []);

  const fetchInitialData = async () => {
    try {
      const [branchRes, yearRes] = await Promise.all([
        api.get("/api/branches"),
        api.get("/api/academic-years/get-all-academic-year")
      ]);
      setOptions(prev => ({ 
        ...prev, 
        branches: branchRes.data, 
        academicYears: yearRes.data 
      }));
    } catch (error) { 
      toast.error("System Sync Failed"); 
    } finally { 
      setLoading(prev => ({ ...prev, initial: false })); 
    }
  };

  // Reset dependent fields when parent selection changes
  const handleCampusChange = (id) => {
    setSelections({ campusId: id, branchId: "", branchGradeId: "", academicYearId: selections.academicYearId });
  };

  useEffect(() => {
    if (selections.branchId) {
      api.get(`/api/branches/${selections.branchId}/grades`)
        .then(res => setOptions(prev => ({ ...prev, grades: res.data || [] })))
        .catch(() => toast.error("Failed to load grades"));
    } else {
      setOptions(prev => ({ ...prev, grades: [] }));
    }
  }, [selections.branchId]);

  const fetchStudents = async () => {
    if (!selections.branchGradeId || !selections.academicYearId) {
        return toast.error("Please select Grade and Academic Year");
    }
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
    } catch (error) { 
      toast.error("Search Protocol Failed"); 
    } finally { 
      setLoading(prev => ({ ...prev, students: false })); 
    }
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
    } catch (e) { 
      toast.error("Update Failed"); 
    } finally { 
      setLoading({ ...loading, action: null }); 
    }
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
    } catch (e) { 
      toast.error("Mandate Creation Failed"); 
    } finally { 
      setLoading({ ...loading, action: null }); 
    }
  };

  const handleActivateMandate = async () => {
    setLoading({ ...loading, action: modal.student.id });
    try {
      await api.post(`/api/nach/mandates/${modal.student.id}/activate`, null, { params: { ref: activationRef } });
      toast.success("Security Activation Complete");
      setModal({ show: false, type: null, student: null });
      fetchStudents();
    } catch (error) { 
      toast.error("Activation Error"); 
    } finally { 
      setLoading({ ...loading, action: null }); 
    }
  };

  // UI STYLES
  const glassPanel = `rounded-[2.5rem] border shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-xl ${isDark ? "bg-[#111111]/80 border-white/10" : "bg-white/80 border-gray-100"}`;
  const customSelectContainer = `relative w-full group z-10`;
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

      {/* Filter Section */}
      <div className={glassPanel}>
        <div className="p-8 lg:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-20">
          
          {/* Campus Select - Mapped from Redux */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center gap-2">
              <School size={14}/> Campus
            </label>
            <div className={customSelectContainer}>
              <select 
                className={selectStyle}
                value={selections.campusId}
                onChange={(e) => handleCampusChange(e.target.value)}
              >
                <option value="">Select Campus</option>
                {campuses?.map(c => (
                  <option key={c.campusId} value={c.campusId} className={isDark ? "bg-[#1A1A1A]" : "bg-white text-gray-800"}>
                    {c.campusName}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40 group-hover:text-primary transition-colors">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Branch Select - Filtered by CampusId (String comparison fix) */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center gap-2">
              <GraduationCap size={14}/> Branch
            </label>
            <div className={customSelectContainer}>
              <select 
                className={selectStyle}
                value={selections.branchId}
                onChange={(e) => setSelections(prev => ({ ...prev, branchId: e.target.value, branchGradeId: "" }))}
                disabled={!selections.campusId}
              >
                <option value="">Select Branch</option>
                {options.branches
                  .filter(b => String(b.campusId) === String(selections.campusId))
                  .map(o => (
                    <option key={o.id} value={o.id} className={isDark ? "bg-[#1A1A1A]" : "bg-white text-gray-800"}>
                      {`${o.boardName} (${o.mediumName})`}
                    </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40 group-hover:text-primary transition-colors">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Grade Select */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center gap-2">
              <BookOpen size={14}/> Grade
            </label>
            <div className={customSelectContainer}>
              <select 
                className={selectStyle}
                value={selections.branchGradeId}
                onChange={(e) => setSelections(prev => ({ ...prev, branchGradeId: e.target.value }))}
                disabled={!selections.branchId}
              >
                <option value="">Select Grade</option>
                {options.grades.map(o => (
                  <option key={o.id} value={o.id} className={isDark ? "bg-[#1A1A1A]" : "bg-white text-gray-800"}>
                    {o.gradeName}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40 group-hover:text-primary transition-colors">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>

          {/* Academic Year Select */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2 flex items-center gap-2">
              <Calendar size={14}/> Academic Year
            </label>
            <div className={customSelectContainer}>
              <select 
                className={selectStyle}
                value={selections.academicYearId}
                onChange={(e) => setSelections(prev => ({ ...prev, academicYearId: e.target.value }))}
              >
                <option value="">Select Year</option>
                {options.academicYears.map(o => (
                  <option key={o.id} value={o.id} className={isDark ? "bg-[#1A1A1A]" : "bg-white text-gray-800"}>
                    {o.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-primary/40 group-hover:text-primary transition-colors">
                <ChevronDown size={18} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="px-8 lg:px-12 pb-12 relative z-10">
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
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-black text-[10px] shadow-lg group-hover:rotate-6 transition-transform">
                          {student.id}
                        </div>
                        <div>
                          <p className="font-bold text-sm tracking-tight">{student.firstName || 'Student'}</p>
                          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{student.status}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="font-black text-xs tracking-widest">{student.enrollmentNo}</p>
                        <p className="text-[9px] font-bold text-primary uppercase">Roll: {student.rollNumber}</p>
                      </div>
                    </td>
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

      {/* Mandate Modal */}
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

// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import api from "../../../../config/api";
// import {
//   Search, Fingerprint, Loader2, CheckCircle2, AlertCircle,
//   XCircle, ChevronDown, Wallet, ShieldCheck, Filter,
//   LayoutGrid, Info, Landmark, GraduationCap, Banknote,
//   History, Calendar, User, Receipt
// } from "lucide-react";
// import { Toaster, toast } from "react-hot-toast";

// const PaymentPreferenceManager = () => {
//   const isDark = useSelector((state) => state.color.mode === "dark");
//   const { campuses } = useSelector((state) => state.campus);

//   const [selections, setSelections] = useState({
//     campusId: "", branchId: "", academicYearId: "", branchGradeId: ""
//   });
//   const [options, setOptions] = useState({
//     branches: [], academicYears: [], grades: []
//   });

//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState({
//     initial: true, students: false, action: false, dues: false, mandate: false
//   });
//   const [preferences, setPreferences] = useState({});
//   const [mandates, setMandates] = useState({});
//   const [searchTerm, setSearchTerm] = useState("");

//   // Modals
//   const [showPaymentModal, setShowPaymentModal] = useState(null);
//   const [showNachForm, setShowNachForm] = useState(null);
//   const [showCashModal, setShowCashModal] = useState(null);

//   const [studentDues, setStudentDues] = useState([]);
//   const [selectedInstallments, setSelectedInstallments] = useState([]);

//   // Cash Denomination State
//   const currencyNotes = [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1];
//   const [receivedNotes, setReceivedNotes] = useState({});
//   const [refundNotes, setRefundNotes] = useState({});

//   const cardClass = `rounded-[2.5rem] border shadow-2xl transition-all duration-300 ${isDark ? "bg-[#1A1A1A] border-white/5 shadow-black/40" : "bg-white border-gray-100 shadow-gray-200/50"}`;

//   useEffect(() => {
//     const fetchBaseData = async () => {
//       try {
//         const [branchRes, yearRes] = await Promise.all([
//           api.get("/api/branches"),
//           api.get("/api/academic-years/get-all-academic-year")
//         ]);
//         setOptions(prev => ({
//           ...prev,
//           branches: branchRes.data || [],
//           academicYears: yearRes.data || []
//         }));
//       } catch (error) {
//         toast.error("Failed to sync infrastructure data");
//       } finally {
//         setLoading(prev => ({ ...prev, initial: false }));
//       }
//     };
//     fetchBaseData();
//   }, []);

//   useEffect(() => {
//     if (selections.branchId) {
//       api.get(`/api/branches/${selections.branchId}/grades`)
//         .then(res => setOptions(prev => ({ ...prev, grades: res.data || [] })))
//         .catch(() => setOptions(prev => ({ ...prev, grades: [] })));
//     }
//   }, [selections.branchId]);

//   const fetchStudentsList = async () => {
//     if (!selections.branchGradeId || !selections.academicYearId) return toast.error("Select Grade and Academic Year");
//     setLoading(prev => ({ ...prev, students: true }));
//     try {
//       const res = await api.get(`/api/admission/getEnrollmentsByBranchGradeAndAcademicYear/${selections.branchGradeId}/${selections.academicYearId}`);
//       const list = res.data.content || [];
//       setStudents(list);

//       const prefMap = {};
//       const mandateRes = await api.get("/api/nach/mandates");
//       const mandateMap = {};
//       mandateRes.data.forEach(m => mandateMap[m.studentEnrollmentId] = m);
//       setMandates(mandateMap);

//       await Promise.all(list.map(async (s) => {
//         try {
//           const pRes = await api.get(`/api/payment-preference?studentEnrollmentId=${s.id}`);
//           if (pRes.data) prefMap[s.id] = pRes.data;
//         } catch (e) { }
//       }));
//       setPreferences(prefMap);
//     } catch (error) {
//       toast.error("Error loading data");
//     } finally {
//       setLoading(prev => ({ ...prev, students: false }));
//     }
//   };

//   const handleSetPreference = async (studentId, mode) => {
//     if (mode === "NACH" && !mandates[studentId]) {
//       setShowNachForm(students.find(s => s.id === studentId));
//       return;
//     }
//     setLoading(prev => ({ ...prev, action: true }));
//     try {
//       const res = await api.post(`/api/payment-preference?studentEnrollmentId=${studentId}&mode=${mode}`);
//       setPreferences(prev => ({ ...prev, [studentId]: res.data }));
//       toast.success(`Preference set to ${mode}`);
//     } catch (error) {
//       toast.error("Preference update failed");
//     } finally {
//       setLoading(prev => ({ ...prev, action: false }));
//     }
//   };

//   const handleCreateMandate = async (e) => {
//     e.preventDefault();
//     const formData = new FormData(e.target);
//     const payload = Object.fromEntries(formData.entries());
//     payload.studentEnrollmentId = showNachForm.id;

//     setLoading(prev => ({ ...prev, mandate: true }));
//     try {
//       await api.post("/api/nach/mandates", payload);
//       toast.success("NACH Mandate Created");
//       setShowNachForm(null);
//       fetchStudentsList();
//     } catch (error) {
//       toast.error("Mandate Creation Failed");
//     } finally {
//       setLoading(prev => ({ ...prev, mandate: false }));
//     }
//   };

//   const calculateTotal = (denominations) => {
//     return Object.entries(denominations).reduce((acc, [note, count]) => acc + (Number(note) * (Number(count) || 0)), 0);
//   };

//   const handleCashPayment = async () => {
//     const totalPayable = studentDues.filter(d => selectedInstallments.includes(d.installmentId)).reduce((a, b) => a + b.total, 0);
//     const received = calculateTotal(receivedNotes);
//     const returned = calculateTotal(refundNotes);

//     if (received - returned !== totalPayable) {
//       return toast.error(`Denomination mismatch! Net: ₹${received - returned}, Needed: ₹${totalPayable}`);
//     }

//     setLoading(prev => ({ ...prev, action: true }));
//     try {
//       await api.post("/api/payments/cash", {
//         studentEnrollmentId: showCashModal.id,
//         installmentIds: selectedInstallments,
//         idempotencyKey: `CASH_${Date.now()}`,
//         receivedDenominations: receivedNotes,
//         returnedDenominations: refundNotes
//       });
//       toast.success("Cash Payment Recorded");
//       setShowCashModal(null);
//       fetchStudentsList();
//     } catch (error) {
//       toast.error("Cash payment failed");
//     } finally {
//       setLoading(prev => ({ ...prev, action: false }));
//     }
//   };

//   const handleOpenPaymentFlow = async (student) => {
//     setLoading(prev => ({ ...prev, dues: true }));
//     try {
//       const res = await api.get(`/api/fees/dues/${student.id}`);
//       setStudentDues(res.data.installments || []);
//       setSelectedInstallments([]);
//       setShowPaymentModal(student);
//     } catch (error) {
//       toast.error("Failed to fetch dues");
//     } finally {
//       setLoading(prev => ({ ...prev, dues: false }));
//     }
//   };

//   const filteredStudents = students.filter(s => s.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase()));

//   return (
//     <div className={`min-h-screen p-4 lg:p-10 max-w-[1700px] mx-auto space-y-8 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
//       <Toaster position="top-right" />

//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
//         <div>
//           <h1 className="text-4xl font-black tracking-tighter uppercase italic">Billing Terminal</h1>
//           <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] mt-2 flex items-center gap-2">
//             <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
//             Preference & Mandate Control
//           </p>
//         </div>

//         <div className="relative w-full md:w-80 group">
//           <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
//           <input
//             type="text" placeholder="SEARCH ENROLLMENT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//             className={`pl-12 pr-4 py-4 rounded-2xl border border-transparent outline-none w-full font-black text-[11px] transition-all ${isDark ? "bg-white/5 focus:bg-white/10 text-white" : "bg-white shadow-xl text-gray-800"}`}
//           />
//         </div>
//       </div>

//       {/* Filter Section */}
//       <div className={`${cardClass} p-8 border-t-8 border-t-primary`}>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <SelectField label="Campus" icon={<Landmark size={14} />} value={selections.campusId} options={campuses?.map(c => ({ id: c.campusId, name: c.campusName }))} onChange={(e) => setSelections(p => ({ ...p, campusId: e.target.value }))} />
//           <SelectField label="Branch" icon={<GraduationCap size={14} />} value={selections.branchId} options={options.branches.filter(b => String(b.campusId) === String(selections.campusId)).map(b => ({ id: b.id, name: `${b.campusName} | ${b.boardName}` }))} onChange={(e) => setSelections(p => ({ ...p, branchId: e.target.value }))} />
//           <SelectField label="Grade" icon={<Filter size={14} />} value={selections.branchGradeId} options={options.grades} isGrade={true} onChange={(e) => setSelections(p => ({ ...p, branchGradeId: e.target.value }))} />
//           <SelectField label="Year" icon={<Info size={14} />} value={selections.academicYearId} options={options.academicYears} onChange={(e) => setSelections(p => ({ ...p, academicYearId: e.target.value }))} />
//         </div>
//         <button onClick={fetchStudentsList} disabled={loading.students} className="w-full mt-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest">
//           {loading.students ? <Loader2 className="animate-spin" /> : <><LayoutGrid size={18} /> Synchronize Records</>}
//         </button>
//       </div>

//       {/* Student List */}
//       <div className={`${cardClass} overflow-hidden`}>
//         <div className="overflow-x-auto">
//           <table className="w-full text-left">
//             <thead className={`${isDark ? "bg-white/5" : "bg-gray-50"}`}>
//               <tr>
//                 <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary">Student</th>
//                 <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary">Payment Mode</th>
//                 <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary">Status</th>
//                 <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
//               {filteredStudents.map((student) => {
//                 const pref = preferences[student.id];
//                 const mandate = mandates[student.id];
//                 return (
//                   <tr key={student.id} className="hover:bg-primary/[0.02] transition-colors">
//                     <td className="p-6">
//                       <div className="flex items-center gap-4">
//                         <div className={`p-3 rounded-2xl ${isDark ? "bg-[#242424]" : "bg-primary/5"} text-primary`}><Fingerprint size={22} /></div>
//                         <div>
//                           <p className="font-black text-sm uppercase">{student.enrollmentNo}</p>
//                           <p className="text-[9px] font-bold text-gray-500 uppercase">Roll: {student.rollNumber || 'TBD'}</p>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="p-6">
//                       {pref ? (
//                         <div className="flex items-center gap-2 font-black text-[11px] text-primary bg-primary/10 px-4 py-2 rounded-xl w-fit">
//                           <ShieldCheck size={14} /> {pref.preferredMode}
//                         </div>
//                       ) : (
//                         <select onChange={(e) => handleSetPreference(student.id, e.target.value)}
//                           className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border outline-none ${isDark ? "bg-[#242424] border-white/10" : "bg-gray-100 border-gray-200"}`}>
//                           <option value="">Select Preferred Mode</option>
//                           <option value="NACH">NACH / Auto-Debit</option>
//                           <option value="GATEWAY">Gateway / Razorpay</option>
//                         </select>
//                       )}
//                     </td>
//                     <td className="p-6">
//                       {mandate ? (
//                         <button onClick={() => toast.success(`Mandate: ${mandate.mandateReferenceNumber}`, { icon: 'ℹ️' })}
//                           className="flex items-center gap-2 text-[9px] font-black uppercase bg-green-500/10 text-green-500 px-3 py-1.5 rounded-lg border border-green-500/20">
//                           <CheckCircle2 size={12} /> NACH Active
//                         </button>
//                       ) : (
//                         <span className="text-[9px] font-black uppercase text-gray-400">No Active Mandate</span>
//                       )}
//                     </td>
//                     <td className="p-6 text-right space-x-2">
//                       <button onClick={() => { setStudentDues([]); setShowCashModal(student); handleOpenPaymentFlow(student); }}
//                         className="p-3 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all"><Banknote size={18} /></button>
//                       <button onClick={() => handleOpenPaymentFlow(student)}
//                         className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all"><Wallet size={18} /></button>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* NACH Mandate Creation Modal */}
//       {showNachForm && (
//         <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
//           <form onSubmit={handleCreateMandate} className={`${cardClass} w-full max-w-xl p-8 space-y-6 animate-in zoom-in duration-300`}>
//             <div className="flex justify-between items-center border-b border-white/10 pb-4">
//               <h2 className="text-xl font-black uppercase italic">Create NACH Mandate</h2>
//               <XCircle className="cursor-pointer text-gray-500" onClick={() => setShowNachForm(null)} />
//             </div>
//             <div className="grid grid-cols-2 gap-4">
//               <Input label="A/C Holder Name" name="accountHolderName" icon={<User size={14} />} required />
//               <Input label="Account Number" name="accountNumber" icon={<Landmark size={14} />} required />
//               <Input label="IFSC Code" name="ifsc" icon={<ShieldCheck size={14} />} required />
//               <Input label="Max Limit (₹)" name="maxAmount" type="number" icon={<Receipt size={14} />} required />
//               <Input label="Start Date" name="startDate" type="date" icon={<Calendar size={14} />} required />
//               <Input label="End Date" name="endDate" type="date" icon={<Calendar size={14} />} required />
//             </div>
//             <button type="submit" disabled={loading.mandate} className="w-full py-4 bg-primary text-white font-black uppercase rounded-2xl shadow-xl hover:brightness-110">
//               {loading.mandate ? <Loader2 className="animate-spin mx-auto" /> : "Register Mandate"}
//             </button>
//           </form>
//         </div>
//       )}

//       {/* Cash Payment / Denomination Modal */}
//       {showCashModal && (
//         <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
//           <div className={`${cardClass} w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 space-y-8`}>
//             <div className="flex justify-between items-center border-b border-white/10 pb-4">
//               <h2 className="text-2xl font-black uppercase italic flex items-center gap-3"><Banknote className="text-green-500" /> Cash Desk</h2>
//               <XCircle className="cursor-pointer text-gray-500" onClick={() => setShowCashModal(null)} />
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//               {/* Recieved */}
//               <div className="space-y-4">
//                 <h3 className="text-xs font-black uppercase text-primary tracking-widest">Received Notes</h3>
//                 <div className="grid grid-cols-2 gap-3">
//                   {currencyNotes.map(note => (
//                     <div key={note} className={`flex items-center gap-3 p-3 rounded-2xl border ${isDark ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-200"}`}>
//                       <span className="w-12 font-black text-xs">₹{note}</span>
//                       <input type="number" placeholder="0" className="w-full bg-transparent outline-none font-black text-right"
//                         onChange={(e) => setReceivedNotes(p => ({ ...p, [note]: e.target.value }))} />
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* Refunded */}
//               <div className="space-y-4">
//                 <h3 className="text-xs font-black uppercase text-amber-500 tracking-widest">Refunded Notes</h3>
//                 <div className="grid grid-cols-2 gap-3">
//                   {currencyNotes.map(note => (
//                     <div key={note} className={`flex items-center gap-3 p-3 rounded-2xl border ${isDark ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-200"}`}>
//                       <span className="w-12 font-black text-xs">₹{note}</span>
//                       <input type="number" placeholder="0" className="w-full bg-transparent outline-none font-black text-right"
//                         onChange={(e) => setRefundNotes(p => ({ ...p, [note]: e.target.value }))} />
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <div className={`p-6 rounded-[2rem] flex justify-between items-center ${isDark ? "bg-white/5" : "bg-gray-100"}`}>
//               <div>
//                 <p className="text-[10px] font-black uppercase text-gray-500">Calculated Net</p>
//                 <p className="text-3xl font-black text-green-500">₹{(calculateTotal(receivedNotes) - calculateTotal(refundNotes)).toLocaleString()}</p>
//               </div>
//               <div className="text-right">
//                 <p className="text-[10px] font-black uppercase text-gray-500">Required Amount</p>
//                 <p className="text-3xl font-black text-primary">₹{studentDues.filter(d => selectedInstallments.includes(d.installmentId)).reduce((a, b) => a + b.total, 0).toLocaleString()}</p>
//               </div>
//             </div>

//             <button onClick={handleCashPayment} className="w-full py-5 bg-green-500 text-white font-black uppercase rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
//               Complete Cash Transaction
//             </button>
//           </div>
//         </div>
//       )}
      
//       {/* Existing Online Payment Modal remains largely the same but triggers showPaymentModal logic */}
//     </div>
//   );
// };

// // Reusable Sub-components
// const Input = ({ label, icon, ...props }) => {
//   const isDark = useSelector((state) => state.color.mode === "dark");
//   return (
//     <div className="space-y-2">
//       <label className="text-[9px] font-black uppercase text-primary flex items-center gap-2">{icon} {label}</label>
//       <input {...props} className={`w-full px-5 py-3 rounded-xl border outline-none font-black text-xs ${isDark ? "bg-[#242424] border-white/10 text-white" : "bg-white border-gray-200"}`} />
//     </div>
//   );
// };

// const SelectField = ({ label, icon, value, options, onChange, isGrade = false }) => {
//   const isDark = useSelector((state) => state.color.mode === "dark");
//   return (
//     <div className="space-y-2">
//       <label className="text-[9px] font-black uppercase text-primary flex items-center gap-2">{icon} {label}</label>
//       <div className="relative">
//         <select value={value} onChange={onChange} className={`w-full px-5 py-4 rounded-xl border outline-none font-black text-[10px] appearance-none cursor-pointer ${isDark ? "bg-[#242424] border-white/10" : "bg-white border-gray-200"}`}>
//           <option value="">SELECT {label.toUpperCase()}</option>
//           {options?.map(o => (
//             <option key={o.id} value={o.id}>{isGrade ? o.gradeName : o.name}</option>
//           ))}
//         </select>
//         <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary" />
//       </div>
//     </div>
//   );
// };

// export default PaymentPreferenceManager;