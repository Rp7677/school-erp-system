import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Eye, CheckCircle, XCircle, FileText,
  User, X, ChevronDown, Users, Loader2, FilterX, Edit,
  Layers, RefreshCw, CheckCircle2
} from 'lucide-react';
import api from '../../../../config/api';
import { useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import AutoBreadcrumb from '../../../../components/common/AutoBreadcrumb';

// ─── Status Badge ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    ADMISSION_CONFIRMED: 'bg-emerald-500/10 text-emerald-600 border-emerald-400/20',
    PENDING_PAYMENT: 'bg-amber-500/10  text-amber-600  border-amber-400/20',
    counselor_rejected: 'bg-red-500/10    text-red-500    border-red-400/20',
    principal_rejected: 'bg-red-500/10    text-red-500    border-red-400/20',
    DOCUMENTS_APPROVED: 'bg-primary/10    text-primary    border-primary/20',
  };
  const cls = map[status] || 'bg-gray-500/10 text-gray-500 border-gray-400/20';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${cls}`}>
      {status?.replace(/_/g, ' ') || 'PENDING'}
    </span>
  );
};

const StudentProfile = () => {
  const navigate = useNavigate();
  const { selectedCampus, campuses, superAdmin } = useSelector((state) => state.campus);
  const themeMode = useSelector((state) => state.color.mode);
  const isDark = themeMode === "dark";

  const theme = {
    panel: isDark ? "bg-[#0D0D0D] border-white/10" : "bg-white border-slate-200",
    input: isDark ? "bg-[#141414] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900",
    tableHeader: isDark ? "bg-white/[0.03]" : "bg-slate-50",
    textPrimary: isDark ? "text-white" : "text-slate-900",
    textSecondary: isDark ? "text-slate-500" : "text-slate-500",
    rowHover: isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50",
  };

  const [tempCampusId, setTempCampusId] = useState('');
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [getDocs, setDocs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({});

  // ─── STYLES matching CampusManager ────────────────────────────────────
  const inp = `w-full px-3.5 py-2.5 rounded-xl border outline-none transition-all text-sm font-medium ${isDark ? 'bg-[#1A1A1A] border-white/10 text-white focus:border-primary' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-primary focus:bg-white'}`;
  const lbl = `block text-[10px] font-black uppercase mb-1 tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`;

  const getCampusId = () => superAdmin ? tempCampusId : selectedCampus;

  useEffect(() => {
    if (superAdmin && campuses.length > 0 && !tempCampusId) {
      setTempCampusId(campuses[0].campusId || campuses[0].id);
    }
  }, [campuses, superAdmin]);

  const fetchPendingAdmissions = async () => {
    const campusId = getCampusId();
    if (!campusId) { setAdmissions([]); return; }
    try {
      setLoading(true);
      const response = await api.get(`/api/admission/allTempadmission/${campusId}`);
      const data = response.data.content || response.data;
      setAdmissions(Array.isArray(data) ? data : []);
    } catch { setAdmissions([]); }
    finally { setLoading(false); }
  };

  const fetchdocuments = async (admissionId) => {
    try {
      const response = await api.get(`/api/documents/${admissionId}`);
      setDocs(response.data);
    } catch { toast.error('Failed to fetch documents'); }
  };

  useEffect(() => {
    const campusId = getCampusId();
    if (campusId) fetchPendingAdmissions();
  }, [tempCampusId, selectedCampus]);

  useEffect(() => { if (selectedAdmission) setFormData(selectedAdmission); }, [selectedAdmission]);

  const viewAdmissionDetails = async (admission) => {
    setSelectedAdmission(admission);
    setShowDetailsModal(true);
    setActiveTab("overview");
    if (admission.id) await fetchdocuments(admission.id);
  };

  const handleApprove = async (documentId, status) => {
    try {
      await api.put(`/api/documents/${documentId}/status`, { status });
      toast[status === 'APPROVED' ? 'success' : 'error'](
        status === 'APPROVED' ? 'Document Approved!' : 'Document Rejected!'
      );
      if (selectedAdmission?.id) await fetchdocuments(selectedAdmission.id);
    } catch { toast.error('Failed to update document'); }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) { toast.error('Please provide a reason for rejection'); return; }
    try {
      await api.post(`/api/counselor/admissions/${selectedAdmission?.id}/reject`, { reason: rejectionReason });
      toast.success('Admission rejected');
      fetchPendingAdmissions();
      setShowRejectionModal(false);
      setRejectionReason('');
      setSelectedAdmission(null);
    } catch { toast.error('Failed to reject admission'); }
  };

  const handleApproveAdmission = async (admissionId) => {
    try {
      await api.post(`/api/principal/admissions/${admissionId}/approve`);
      fetchPendingAdmissions();
      toast.success('Admission approved successfully');
    } catch { toast.error('Failed to approve admission'); }
  };

  const handleEdit = (admission) => {
    navigate("/staff/admission/student-admission", { state: { admissionData: admission, isEdit: true } });
  };

  const filteredAdmissions = admissions.filter(a =>
    (statusFilter === 'ALL' || a.admissionStatus === statusFilter) &&
    (!searchTerm || a.studentName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sections = [
    { title: "Student Info", fields: ["studentName", "studentMiddleName", "studentLastName", "dob", "gender", "bloodGroup", "nationality", "religion", "casteCategory"] },
    { title: "Contact & Address", fields: ["address", "permanentAddress", "city", "state", "pincode", "area"] },
    { title: "Academic", fields: ["gradeApplyingfor", "gradeApplied", "board", "medium", "streamApplyingFor", "academicYearId", "lastSchool", "lastClass", "lastBoard", "lastMedium", "lastGrade", "lastStream"] },
    { title: "Parents - Father", fields: ["fatherName", "fatherMobile", "fatherEmail", "fatherOccupation", "fatherQualification", "fatherannualIncome", "fatherorganizationName", "fatherAadhar"] },
    { title: "Parents - Mother", fields: ["motherName", "motherMobile", "motherEmail", "motherOccupation", "motherQualification", "motherannualIncome", "motherorganizationName", "motherAadhar", "motherToungue"] },
    { title: "Guardian", fields: ["guardianName", "guardianMobile", "guardianEmail", "guardianOccupation", "guardianQualification", "guardianAnnualIncome", "guardianOrganizationName", "guardianAadhar"] },
    { title: "Medical", fields: ["bloodGroup", "allergies", "medicalConditions", "doctorName", "doctorContact", "specialNeeds"] },
    { title: "Transport & Hostel", fields: ["transportRequired", "hostelRequired", "distanceFromSchool", "pickupLocation", "routeName"] },
    { title: "Status / Payment", fields: ["admissionStatus", "paymentStatus", "amount", "orderId", "paymentId", "createdAt", "createdBy", "documentsVerified"] },
  ];

  return (
    <div className="min-h-screen pb-24">
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: isDark ? '#1A1A1A' : '#fff', color: isDark ? '#fff' : '#000', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', fontSize: '13px', fontWeight: 600 } }} />

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20">
            <User className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-heading font-black tracking-tighter uppercase">
              Student <span className="text-primary not-italic">Profile</span>
            </h1>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Admission Management &amp; Review · <AutoBreadcrumb />
            </p>
          </div>
        </div>

        <div className={`flex items-center gap-2 p-1.5 rounded-2xl border ${theme.panel}`}>
          <div className="px-5 py-2 border-r border-white/5 text-center">
            <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Total</p>
            <p className="text-sm font-black">{admissions.length}</p>
          </div>
          <div className="px-5 py-2 border-r border-white/5 text-center">
            <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Confirmed</p>
            <p className="text-sm font-black text-green-500">{admissions.filter(a => a.admissionStatus === 'ADMISSION_CONFIRMED').length}</p>
          </div>
          <div className="px-5 py-2 text-center">
            <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Pending</p>
            <p className="text-sm font-black text-amber-500">{admissions.filter(a => a.admissionStatus === 'PENDING_PAYMENT').length}</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        <div className="mb-2">
          <AutoBreadcrumb />
        </div>

        {/* ── Filter Bar ──────────────────────────────────────────────────── */}
        <div className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}>
          <div className="p-6 border-b border-white/5 flex items-center gap-2 bg-primary/5">
            <Layers size={15} className="text-primary" />
            <h3 className="font-black uppercase text-title-table tracking-widest">Filter &amp; Search</h3>
          </div>

          <div className="p-6">
            <div className={`grid gap-4 ${superAdmin ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-2'}`}>

              {/* Search */}
              <div>
                <label className={lbl}>Search Student</label>
                <div className="relative">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-30" />
                  <input
                    type="text"
                    placeholder="FILTER BY STUDENT NAME..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full h-11 pl-10 pr-4 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-primary border transition-all ${theme.input}`}
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className={lbl}>Status Filter</label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`${inp} appearance-none`}
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING_PAYMENT">Pending Payment</option>
                    <option value="ADMISSION_CONFIRMED">Admission Confirmed</option>
                    <option value="DOCUMENTS_APPROVED">Documents Approved</option>
                    <option value="counselor_rejected">Counselor Rejected</option>
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                </div>
              </div>

              {/* Campus (super admin only) */}
              {superAdmin && (
                <div>
                  <label className={lbl}>Campus</label>
                  <div className="relative">
                    <select
                      value={tempCampusId}
                      onChange={(e) => setTempCampusId(e.target.value)}
                      className={`${inp} appearance-none`}
                    >
                      <option value="">Select Campus</option>
                      {campuses.map(c => <option key={c.campusId || c.id} value={c.campusId || c.id}>{c.campusName}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                  </div>
                </div>
              )}
            </div>

            {/* Stats chips */}
            <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-dashed border-gray-200/30">
              {[
                { label: 'Total', value: admissions.length, color: 'bg-primary/10 text-primary border-primary/20' },
                { label: 'Confirmed', value: admissions.filter(a => a.admissionStatus === 'ADMISSION_CONFIRMED').length, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-400/20' },
                { label: 'Pending', value: admissions.filter(a => a.admissionStatus === 'PENDING_PAYMENT').length, color: 'bg-amber-500/10 text-amber-600 border-amber-400/20' },
                { label: 'Rejected', value: admissions.filter(a => a.admissionStatus?.includes('rejected')).length, color: 'bg-red-500/10 text-red-500 border-red-400/20' },
              ].map(({ label: l, value, color }) => (
                <div key={l} className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${color}`}>
                  <span>{l}:</span><span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Admissions Table ──────────────────────────────────────────────── */}
        <div className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}>
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-primary/5">
            <div className="flex items-center gap-2 text-primary">
              <Users size={15} />
              <h3 className="font-black uppercase text-title-table tracking-widest">Admission Master List</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-primary/10 text-primary border border-primary/20">
                {filteredAdmissions.length} records
              </span>
              <button
                onClick={fetchPendingAdmissions}
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${isDark ? 'border-white/10 text-gray-400 hover:bg-white/10' : 'border-slate-200 text-gray-500 hover:bg-slate-50'}`}
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`${theme.tableHeader} text-heding-table font-black uppercase text-slate-500 tracking-widest`}>
                  <th className="px-8 py-5">#</th>
                  <th className="px-8 py-5">Identity Profile</th>
                  <th className="px-8 py-5">Application Details</th>
                  <th className="px-8 py-5 text-center">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Loader2 className="animate-spin mx-auto text-primary" size={32} />
                    </td>
                  </tr>
                ) : filteredAdmissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <FilterX size={36} className={`mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className={`font-black uppercase text-[10px] tracking-widest opacity-30 ${theme.textPrimary}`}>No admissions found</p>
                      <p className={`text-[10px] mt-1 opacity-30 font-black uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {!getCampusId() ? 'Select a campus to load admissions' : 'Try adjusting your filters'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredAdmissions.map((admission, idx) => (
                    <tr key={admission.id} className={`transition-colors ${theme.rowHover} cursor-pointer`}>
                      <td className="px-8 py-6">
                        <span className="text-[10px] font-black text-primary/40">{String(idx + 1).padStart(2, '0')}</span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xs shadow-lg shadow-primary/20">
                            {admission.studentName?.substring(0, 2) || "ST"}
                          </div>
                          <div>
                            <p className="text-small-table font-black uppercase tracking-tight">{admission.studentName || "N/A"}</p>
                            <p className={`text-[10px] font-black uppercase tracking-tighter opacity-60 text-primary`}>ID: {admission.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-small-table uppercase tracking-tight font-black">{admission.gradeApplied || "N/A"}</span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className={`w-1.5 h-1.5 rounded-full ${admission.admissionStatus === 'ADMISSION_CONFIRMED' ? 'bg-green-500 animate-pulse' : admission.admissionStatus?.includes('rejected') ? 'bg-red-500' : 'bg-amber-500 animate-pulse'}`} />
                          <StatusBadge status={admission.admissionStatus} />
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => viewAdmissionDetails(admission)}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-90 shadow-sm border border-primary/20 text-primary hover:bg-primary/10"
                            title="View"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleApproveAdmission(admission.id)}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-90 shadow-sm bg-green-500 text-white shadow-green-500/20"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(admission)}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-xl transition-all active:scale-90 shadow-sm border border-amber-500/20 text-amber-500 hover:bg-amber-500/10"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredAdmissions.length > 0 && (
            <div className={`flex items-center gap-4 px-8 py-4 border-t ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
              <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Summary:</span>
              <span className="text-[11px] font-black text-primary">{filteredAdmissions.length} Total</span>
            </div>
          )}
        </div>
      </main>

      {/* ── Details Modal ─────────────────────────────────────────────────── */}
      {showDetailsModal && selectedAdmission && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl border shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col ${isDark ? 'bg-[#0D0D0D] border-white/10' : 'bg-white border-gray-200'}`}>

            {/* Modal Header */}
            <div className={`px-6 py-5 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/30">
                  {selectedAdmission.studentName?.substring(0, 2) || 'ST'}
                </div>
                <div>
                  <p className="font-black text-sm uppercase tracking-wide">
                    {selectedAdmission.studentName} {selectedAdmission.studentLastName}
                  </p>
                  <p className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>ID: {selectedAdmission.id}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className={`px-6 py-3 border-b flex gap-2 shrink-0 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
              {[
                { key: 'overview', label: 'Overview', Icon: User },
                { key: 'documents', label: 'Documents', Icon: FileText }
              ].map(({ key, label: l, Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all
                    ${activeTab === key ? 'bg-primary text-white shadow-lg shadow-primary/20' : isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'}`}
                >
                  <Icon size={13} />{l}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 overflow-y-auto flex-1">

              {/* Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {sections.map((section) => (
                    <div key={section.title}>
                      <p className="text-[10px] font-black uppercase tracking-wider text-primary mb-3">{section.title}</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {section.fields.map((key) => {
                          const value = formData[key];
                          return (
                            <div key={key} className={`p-3 rounded-xl border ${isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                              <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                {key.replace(/([A-Z])/g, " $1")}
                              </p>
                              <p className="text-sm font-semibold truncate">
                                {typeof value === "object" && value !== null
                                  ? value.name || value.gradeId || "—"
                                  : value?.toString() || "—"}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Documents */}
              {activeTab === 'documents' && (
                <div className="space-y-3">
                  <div className={`flex items-center px-4 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider ${isDark ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                    <span className="flex-1">Document Name</span>
                    <span className="w-28 text-center">Status</span>
                    <span className="w-28 text-center">Actions</span>
                  </div>

                  {getDocs.length > 0 ? getDocs.map((doc, i) => (
                    <div key={i} className={`flex items-center px-4 py-3.5 rounded-xl border transition-all hover:shadow-md ${isDark ? 'bg-[#1A1A1A] border-white/5 hover:border-primary/30' : 'bg-white border-gray-200 hover:border-primary/30'}`}>
                      <div className="flex-1 flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isDark ? 'bg-primary/10' : 'bg-primary/5'}`}>
                          <FileText size={13} className="text-primary" />
                        </div>
                        <span className="text-sm font-semibold">{doc.documentName}</span>
                      </div>
                      <div className="w-28 flex justify-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border
                          ${doc.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-400/20'
                            : doc.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-400/20'
                              : 'bg-amber-500/10 text-amber-600 border-amber-400/20'}`}>
                          {doc.status}
                        </span>
                      </div>
                      <div className="w-28 flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => window.open(doc.fileUrl, '_blank')}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all border border-primary/20 text-primary hover:bg-primary/10"
                          title="View"
                        >
                          <Eye size={13} />
                        </button>
                        <button
                          onClick={() => handleApprove(doc.id, 'APPROVED')}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all bg-green-500 text-white shadow-green-500/20 shadow-sm"
                          title="Approve"
                        >
                          <CheckCircle size={13} />
                        </button>
                        <button
                          onClick={() => handleApprove(doc.id, 'REJECTED')}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all bg-red-500 text-white shadow-red-500/20 shadow-sm"
                          title="Reject"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-12">
                      <FileText size={32} className={`mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                      <p className={`font-black uppercase text-[10px] tracking-widest opacity-30 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No documents uploaded</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Rejection Modal ───────────────────────────────────────────────── */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-3xl border shadow-2xl max-w-md w-full ${isDark ? 'bg-[#0D0D0D] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`px-6 py-5 border-b flex items-center justify-between ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-500/15 text-red-500 flex items-center justify-center">
                  <XCircle size={18} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wide">Reject Admission</p>
                  <p className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Provide a reason for rejection</p>
                </div>
              </div>
              <button onClick={() => { setShowRejectionModal(false); setRejectionReason(''); setSelectedAdmission(null); }} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              <label className={`${lbl} mb-2`}>Reason for Rejection <span className="text-red-500">*</span></label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className={`${inp} resize-none`}
                placeholder="Please provide a detailed reason…"
              />
            </div>

            <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
              <button
                onClick={() => { setShowRejectionModal(false); setRejectionReason(''); setSelectedAdmission(null); }}
                className={`h-11 px-5 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all active:scale-95 ${isDark ? 'border-white/10 text-gray-300 hover:bg-white/10' : 'border-slate-200 text-gray-700 hover:bg-gray-100'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="h-11 px-6 rounded-xl text-[11px] font-black uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 transition-all active:scale-95 shadow-lg shadow-red-500/20"
              >
                Reject Admission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentProfile;
