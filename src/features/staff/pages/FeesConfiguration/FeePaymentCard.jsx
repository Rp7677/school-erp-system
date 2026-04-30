import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../../config/api";
import {
  Search, Fingerprint, Loader2, CheckCircle2, AlertCircle,
  XCircle, ChevronDown, Wallet, ShieldCheck, Filter, 
  LayoutGrid, Info, Landmark, GraduationCap
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";

const PaymentPreferenceManager = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  const { campuses } = useSelector((state) => state.campus);

  const [selections, setSelections] = useState({
    campusId: "", branchId: "", academicYearId: "", branchGradeId: ""
  });
  const [options, setOptions] = useState({
    branches: [], academicYears: [], grades: []
  });

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState({ 
    initial: true, students: false, action: false, dues: false 
  });
  const [preferences, setPreferences] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const [showPaymentModal, setShowPaymentModal] = useState(null);
  const [studentDues, setStudentDues] = useState([]);
  const [selectedInstallments, setSelectedInstallments] = useState([]);

  const cardClass = `rounded-[2.5rem] border shadow-2xl transition-all duration-300 ${isDark ? "bg-[#1A1A1A] border-white/5 shadow-black/40" : "bg-white border-gray-100 shadow-gray-200/50"}`;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    const fetchBaseData = async () => {
      try {
        const [branchRes, yearRes] = await Promise.all([
          api.get("/api/branches"),
          api.get("/api/academic-years/get-all-academic-year")
        ]);
        setOptions(prev => ({ 
          ...prev, 
          branches: branchRes.data || [], 
          academicYears: yearRes.data || [] 
        }));
      } catch (error) {
        toast.error("Failed to sync infrastructure data");
      } finally {
        setLoading(prev => ({ ...prev, initial: false }));
      }
    };
    fetchBaseData();

    return () => {
        if (document.body.contains(script)) {
            document.body.removeChild(script);
        }
    };
  }, []);

  useEffect(() => {
    if (selections.branchId) {
      api.get(`/api/branches/${selections.branchId}/grades`)
        .then(res => setOptions(prev => ({ ...prev, grades: res.data || [] })))
        .catch(() => {
          setOptions(prev => ({ ...prev, grades: [] }));
          toast.error("Could not load grades");
        });
    }
  }, [selections.branchId]);

  const fetchStudentsList = async () => {
    if (!selections.branchGradeId || !selections.academicYearId) {
      return toast.error("Select Grade and Academic Year first");
    }
    setLoading(prev => ({ ...prev, students: true }));
    try {
      const res = await api.get(`/api/admission/getEnrollmentsByBranchGradeAndAcademicYear/${selections.branchGradeId}/${selections.academicYearId}`);
      const list = res.data.content || [];
      setStudents(list);

      const prefMap = {};
      await Promise.all(list.map(async (s) => {
        try {
          const pRes = await api.get(`/api/payment-preference?studentEnrollmentId=${s.id}`);
          if (pRes.data) prefMap[s.id] = pRes.data;
        } catch (e) {}
      }));
      setPreferences(prefMap);
    } catch (error) {
      toast.error("Error loading enrollment data");
    } finally {
      setLoading(prev => ({ ...prev, students: false }));
    }
  };

  const handleSetPreference = async (studentId, mode) => {
    if (!mode) return;
    setLoading(prev => ({ ...prev, action: true }));
    try {
      const res = await api.post(`/api/payment-preference?studentEnrollmentId=${studentId}&mode=${mode}`);
      setPreferences(prev => ({ ...prev, [studentId]: res.data }));
      toast.success(`Mode updated to ${mode}`);
    } catch (error) {
      toast.error("Update failed");
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleOpenPayment = async (student) => {
    setShowPaymentModal(student);
    setLoading(prev => ({ ...prev, dues: true }));
    try {
      const res = await api.get(`/api/fees/dues/${student.id}`);
      setStudentDues(res.data.installments || []);
      setSelectedInstallments([]);
    } catch (error) {
      toast.error("Failed to fetch dues");
      setShowPaymentModal(null);
    } finally {
      setLoading(prev => ({ ...prev, dues: false }));
    }
  };

  const processPayment = async () => {
    if (selectedInstallments.length === 0) return toast.error("Select installments");
    if (!window.Razorpay) return toast.error("Razorpay SDK not loaded.");
    
    setLoading(prev => ({ ...prev, action: true }));
    
    try {
      const sortedIds = [...selectedInstallments].sort((a, b) => a - b);
      // BUG FIX: Generate a clean, unique idempotency key
      const idempotencyKey = `ENR_${showPaymentModal.id}_INST_${sortedIds.join("_")}_TS_${Date.now()}`;

      const payload = {
        studentEnrollmentId: showPaymentModal.id,
        installmentIds: sortedIds,
        paymentMode: "ONLINE",
        idempotencyKey: idempotencyKey 
      };

      const res = await api.post("/api/payments/initiate", payload);
      const orderData = res.data;

      // Ensure amount is in paise (Razorpay requirement)
      // orderData.amount is 3400.00 from your example response
      const finalAmountInPaise = Math.round(orderData.amount * 100);

      const options = {
        key: orderData.key || "rzp_test_Sc6MNjzRFpVmay", 
        amount: finalAmountInPaise, 
        currency: "INR",
        name: "School Fee Terminal",
        description: `Fee Payment: ${showPaymentModal.enrollmentNo}`,
        // BUG FIX: Map the backend orderId correctly to Razorpay's order_id
        order_id: orderData.orderId, 
        handler: async function (response) {
            toast.success("Payment successful!");
            setShowPaymentModal(null);
            fetchStudentsList(); 
        },
        prefill: {
          name: showPaymentModal.enrollmentNo,
          email: "student@school.com",
        },
        theme: { color: "#3B82F6" },
        modal: {
            ondismiss: () => setLoading(prev => ({ ...prev, action: false }))
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
          toast.error(`Payment Failed: ${resp.error.description}`);
          setLoading(prev => ({ ...prev, action: false }));
      });
      rzp.open();

    } catch (error) {
      toast.error(error.response?.data?.message || "Initiation Failed");
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const filteredStudents = students.filter(s => 
    s.enrollmentNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`min-h-screen p-4 lg:p-10 max-w-[1700px] mx-auto space-y-8 ${isDark ? "text-gray-100" : "text-gray-800"}`}>
      <Toaster position="top-right" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Billing Terminal</h1>
          <p className="text-gray-500 font-bold uppercase tracking-[0.15em] text-[10px] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Fee Collection & Preference Management
          </p>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text" placeholder="SEARCH ENROLLMENT..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className={`pl-12 pr-4 py-4 rounded-2xl border border-transparent outline-none w-full font-black text-[11px] transition-all ${isDark ? "bg-white/5 focus:bg-white/10 text-white" : "bg-white shadow-xl text-gray-800"}`} 
          />
        </div>
      </div>

      <div className={`${cardClass} p-8 border-t-8 border-t-primary`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SelectField label="Campus" icon={<Landmark size={14}/>} value={selections.campusId} options={campuses?.map(c => ({ id: c.campusId, name: c.campusName }))} onChange={(e) => setSelections(p => ({ ...p, campusId: e.target.value }))} />
          <SelectField label="Branch" icon={<GraduationCap size={14}/>} value={selections.branchId} options={options.branches.filter(b => String(b.campusId) === String(selections.campusId)).map(b => ({ id: b.id, name: `${b.campusName} | ${b.boardName}` }))} onChange={(e) => setSelections(p => ({ ...p, branchId: e.target.value }))} />
          <SelectField label="Grade" icon={<Filter size={14}/>} value={selections.branchGradeId} options={options.grades} isGrade={true} onChange={(e) => setSelections(p => ({ ...p, branchGradeId: e.target.value }))} />
          <SelectField label="Year" icon={<Info size={14}/>} value={selections.academicYearId} options={options.academicYears} onChange={(e) => setSelections(p => ({ ...p, academicYearId: e.target.value }))} />
        </div>
        <button onClick={fetchStudentsList} disabled={loading.students} className="w-full mt-8 py-4 bg-primary text-white rounded-2xl font-black shadow-lg shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase text-xs tracking-widest">
          {loading.students ? <Loader2 className="animate-spin" /> : <><LayoutGrid size={18}/> Synchronize Records</>}
        </button>
      </div>

      <div className={`${cardClass} overflow-hidden`}>
        {loading.students ? (
          <div className="py-24 flex flex-col items-center"><Loader2 className="animate-spin text-primary" size={40} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className={`${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                <tr>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary">Identity</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary text-center">Status</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary">Preferred Mode</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-primary text-right">Payment</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-gray-100"}`}>
                {filteredStudents.map((student) => {
                  const pref = preferences[student.id];
                  return (
                    <tr key={student.id} className="hover:bg-primary/[0.02] transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${isDark ? "bg-[#242424]" : "bg-primary/5"} text-primary`}><Fingerprint size={22}/></div>
                          <div>
                            <p className="font-black text-sm uppercase">{student.enrollmentNo}</p>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-tighter">ROLL: {student.rollNumber || 'TBD'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-center">
                          {pref ? (
                          <span className="inline-flex px-3 py-1.5 rounded-lg text-[9px] font-black uppercase bg-green-500/10 text-green-500 border border-green-500/20 items-center gap-2"><CheckCircle2 size={12}/> Ready</span>
                          ) : (
                          <span className="inline-flex px-3 py-1.5 rounded-lg text-[9px] font-black uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20 items-center gap-2"><AlertCircle size={12}/> Pending</span>
                          )}
                      </td>
                      <td className="p-6">
                        <select value={pref?.preferredMode || ""} onChange={(e) => handleSetPreference(student.id, e.target.value)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border outline-none ${isDark ? "bg-[#242424] border-white/10" : "bg-gray-100 border-gray-200"}`}>
                          <option value="">Select Mode</option>
                          <option value="NACH">NACH / Auto-Debit</option>
                          <option value="GATEWAY">Razorpay / Online</option>
                        </select>
                      </td>
                      <td className="p-6 text-right">
                        <button onClick={() => handleOpenPayment(student)} disabled={!pref} className={`p-3 rounded-xl transition-all ${pref ? "bg-primary text-white hover:scale-110" : "bg-gray-500/10 text-gray-400 cursor-not-allowed"}`}><Wallet size={20} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`${cardClass} w-full max-w-lg overflow-hidden border-t-8 border-t-primary animate-in fade-in zoom-in duration-300`}>
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-primary/5">
              <div>
                <h2 className="text-xl font-black uppercase italic">Dues Ledger</h2>
                <p className="text-[10px] text-primary font-black uppercase">{showPaymentModal.enrollmentNo}</p>
              </div>
              <button onClick={() => setShowPaymentModal(null)} className="p-2 hover:bg-red-500/10 rounded-full text-gray-400 hover:text-red-500"><XCircle size={24}/></button>
            </div>
            
            <div className="p-6 max-h-[400px] overflow-y-auto space-y-3">
              {loading.dues ? (
                <div className="py-10 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
              ) : studentDues.map(due => {
                const isSelected = selectedInstallments.includes(due.installmentId);
                return (
                  <div key={due.installmentId} onClick={() => setSelectedInstallments(p => isSelected ? p.filter(i => i !== due.installmentId) : [...p, due.installmentId])}
                    className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex justify-between items-center ${isSelected ? "border-primary bg-primary/5 shadow-inner" : isDark ? "border-white/5 bg-white/5" : "border-gray-100 bg-gray-50"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${isSelected ? "bg-primary border-primary" : "border-gray-500"}`}>
                        {isSelected && <CheckCircle2 size={14} className="text-white"/>}
                      </div>
                      <div><span className="font-black text-[11px] uppercase block">{due.installmentName}</span></div>
                    </div>
                    <div className="text-right"><span className="font-black text-base text-primary">₹{due.total.toLocaleString()}</span></div>
                  </div>
                );
              })}
            </div>

            <div className="p-8 bg-black/10">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Payable</span>
                <span className="text-3xl font-black text-primary">
                  ₹{studentDues.filter(d => selectedInstallments.includes(d.installmentId)).reduce((a, b) => a + b.total, 0).toLocaleString()}
                </span>
              </div>
              <button onClick={processPayment} disabled={loading.action || selectedInstallments.length === 0} className="w-full py-5 bg-primary text-white font-black uppercase rounded-2xl shadow-xl flex items-center justify-center gap-3 hover:brightness-110 transition-all text-xs disabled:opacity-30">
                {loading.action ? <Loader2 className="animate-spin" /> : <><ShieldCheck size={20}/> Secure Initiation</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SelectField = ({ label, icon, value, options, onChange, isGrade = false }) => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  const themeInput = isDark ? `bg-[#242424] border-white/10 text-white focus:border-primary/50` : `bg-white border-gray-200 text-gray-800 focus:border-primary`;
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase text-primary tracking-widest flex items-center gap-2">{icon} {label}</label>
      <div className="relative">
        <select value={value} onChange={onChange} className={`w-full px-5 py-4 rounded-xl border outline-none font-black text-[10px] appearance-none cursor-pointer transition-all ${themeInput}`}>
          <option value="">SELECT {label.toUpperCase()}</option>
          {options?.map(o => (
            <option key={o.id} value={o.id} className={isDark ? "bg-[#1A1A1A]" : "bg-white"}>
              {isGrade ? (o.gradeName || o.name || "Unknown Grade") : (o.name || o.academicYearName || `ID: ${o.id}`)}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-primary" />
      </div>
    </div>
  );
};

export default PaymentPreferenceManager;