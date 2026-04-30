import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Search, Bell, FileDown, Plus, Calendar, Clock, UserCheck,
  MessageSquare, Filter, ChevronDown, Phone, Mail, MapPin,
  PhoneCall, UserPlus, FileText, Download, Menu, X, Hash
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api from "../../../../config/api";
import AutoBreadcrumb from "../../../../components/common/AutoBreadcrumb";

export default function InquiryPanel() {
  const themeMode = useSelector((state) => state.color.mode);
  const isDark = themeMode === "dark";
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [inquiries, setInquiries] = useState([]);
  const [selectedInquiryId, setSelectedInquiryId] = useState(null);

  const generateNotifications = (inquiryData) => {
    const today = new Date();
    const notificationList = [];
    inquiryData.forEach(inquiry => {
      if (inquiry.followUp) {
        const followUpDate = new Date(inquiry.followUp);
        const timeDiff = followUpDate - today;
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        // Show notification for follow-ups that are overdue (2+ days ago)
        if (daysDiff <= -2) {
          notificationList.push({ id: inquiry.id, name: inquiry.name, gradeApplyingfor: inquiry.gradeApplyingfor, type: 'overdue', message: `Follow-up overdue by ${Math.abs(daysDiff)} days - Action required!`, time: inquiry.followUp, priority: 'high' });
        } else if (daysDiff <= 0) {
          notificationList.push({ id: inquiry.id, name: inquiry.name, gradeApplyingfor: inquiry.gradeApplyingfor, type: 'overdue', message: `Follow-up overdue by ${Math.abs(daysDiff)} day${Math.abs(daysDiff) > 1 ? 's' : ''}`, time: inquiry.followUp, priority: 'high' });
        } else if (daysDiff <= 3) {
          notificationList.push({ id: inquiry.id, name: inquiry.name, gradeApplyingfor: inquiry.gradeApplyingfor, type: 'upcoming', message: `Follow-up due in ${daysDiff} day${daysDiff > 1 ? 's' : ''}`, time: inquiry.followUp, priority: daysDiff === 0 ? 'high' : 'medium' });
        }
      }
      if (inquiry.createdAt) {
        const createdDate = new Date(inquiry.createdAt);
        const createdDaysDiff = Math.ceil((today - createdDate) / (1000 * 60 * 60 * 24));
        if (createdDaysDiff <= 2 && inquiry.status === 'new') {
          notificationList.push({ id: inquiry.id, name: inquiry.name, gradeApplyingfor: inquiry.gradeApplyingfor, type: 'new', message: `New inquiry received ${createdDaysDiff === 0 ? 'today' : `${createdDaysDiff} day${createdDaysDiff > 1 ? 's' : ''} ago`}`, time: inquiry.createdAt, priority: 'medium' });
        }
      }
    });
    notificationList.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) return priorityOrder[a.priority] - priorityOrder[b.priority];
      return new Date(a.time) - new Date(b.time);
    });
    setNotifications(notificationList);
  };

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [getStatuses, setStatuses] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedInquiryDetails, setSelectedInquiryDetails] = useState(null);

  const fetchInquiries = async () => {
    try {
      const response = await api.get("/api/allenquiry");
      const datares = response.data.content;
      console.log(datares);
      setInquiries(datares);
      generateNotifications(datares);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  const fetchStatuses = async (inquiryId) => {
    try {
      const response = await api.get(`/api/enquiry/${inquiryId}/next-statuses`);
      setStatuses(prev => ({ ...prev, [inquiryId]: response.data }));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch statuses");
    }
  };

  const handleInquiryClick = (inquiry) => {
    setSelectedInquiryDetails(inquiry);
    setShowDetailsModal(true);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedInquiryDetails(null);
  };

  // Helper functions to convert IDs to names
  const getGradeName = (gradeId) => {
    const grades = {
      1: 'Grade 1', 2: 'Grade 2', 3: 'Grade 3', 4: 'Grade 4', 5: 'Grade 5',
      6: 'Grade 6', 7: 'Grade 7', 8: 'Grade 8', 9: 'Grade 9', 10: 'Grade 10',
      11: 'Grade 11', 12: 'Grade 12', 13: 'Grade 13', 14: 'Grade 14', 15: 'Grade 15'
    };
    return grades[gradeId] || gradeId;
  };

  const getStreamName = (streamId) => {
    const streams = {
      1: 'Science', 2: 'Commerce', 3: 'Arts', 4: 'Vocational', 5: 'Technical',
      6: 'Medical', 7: 'Engineering', 8: 'Management', 9: 'Law', 10: 'Agriculture',
      11: 'Pharmacy', 12: 'Architecture', 13: 'Hotel Management', 14: 'Design', 15: 'Other'
    };
    return streams[streamId] || streamId;
  };

  const getMediumName = (mediumId) => {
    const mediums = {
      1: 'English Medium', 2: 'Hindi Medium', 3: 'Regional Language', 4: 'Bilingual', 5: 'Other'
    };
    return mediums[mediumId] || mediumId;
  };

  const getBoardName = (boardId) => {
    const boards = {
      1: 'CBSE', 2: 'ICSE', 3: 'State Board', 4: 'International Board',
      5: 'IB', 6: 'Cambridge', 7: 'NIOS', 8: 'Other'
    };
    return boards[boardId] || boardId;
  };

  useEffect(() => {
    fetchInquiries();
    setTimeout(() => {
      setNotifications([{ id: 999, name: "Test Student", gradeApplyingfor: "Grade 10", type: 'upcoming', message: "Test notification - Follow-up due in 1 day", time: new Date().toISOString(), priority: 'medium' }]);
    }, 2000);
  }, []);

  useEffect(() => {
    const checkFollowUps = () => {
      const today = new Date().toISOString().split('T')[0];
      const dueFollowUps = inquiries.filter(inquiry => inquiry.followUp === today && inquiry.status !== 'converted');
      if (dueFollowUps.length > 0) {
        setNotifications(dueFollowUps);
        toast.success(`You have ${dueFollowUps.length} follow-up(s) due today!`);
      }
    };
    checkFollowUps();
    const interval = setInterval(checkFollowUps, 60000);
    return () => clearInterval(interval);
  }, [inquiries, isDark]);

  const handleExportToAdmission = (inquiry) => {
    toast.success(`${inquiry.name} exported to admission system!`);
    setInquiries(prev => prev.map(item => item.id === inquiry.id ? { ...item, status: 'converted' } : item));
  };

  const handleFollowUp = (inquiry) => {
    const newFollowUpDate = new Date();
    newFollowUpDate.setDate(newFollowUpDate.getDate() + 3);
    const followUpStr = newFollowUpDate.toISOString().split('T')[0];
    setInquiries(prev => prev.map(item => item.id === inquiry.id ? { ...item, status: 'follow-up', followUp: followUpStr, lastContact: new Date().toISOString().split('T')[0] } : item));
    toast.success(`Follow-up scheduled for ${inquiry.name}!`);
  };

  const exportToCSV = () => {
    const dataToExport = filteredInquiries.map(inquiry => ({ 'Student Name': inquiry.name, 'Phone': inquiry.phone, 'Email': inquiry.email, 'Grade': inquiry.gradeApplyingfor, 'Source': inquiry.heardFrom, 'Status': inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1), 'Follow Up Date': inquiry.followUp }));
    const csvContent = [Object.keys(dataToExport[0]).join(','), ...dataToExport.map(row => Object.values(row).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `student_inquiries_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Data exported to CSV successfully!');
    setShowExportMenu(false);
  };

  const handleConvert = (inquiry) => {
    setInquiries(prev => prev.map(item => item.id === inquiry.id ? { ...item, status: 'converted' } : item));
    toast.success(`${inquiry.name} marked as converted. Opening admission form...`);
    const mappedInquiry = { ...inquiry, academicYearId: inquiry.academicYear ? Number(inquiry.academicYear) : null, branchId: inquiry.branchId || inquiry.branchinfo || null, gradeApplyingfor: inquiry.gradeApplyingfor ? Number(inquiry.gradeApplyingfor) : null, streamApplyingFor: inquiry.streamApplyingFor ? Number(inquiry.streamApplyingFor) : null, medium: inquiry.medium ? Number(inquiry.medium) : null, board: inquiry.board ? Number(inquiry.board) : null, campusId: inquiry.campusId ? Number(inquiry.campusId) : null };
    navigate("/staff/admission/student-admission", { state: { inquiryData: mappedInquiry, fromInquiry: true } });
  };

  const handleStatusClick = async (inquiry, status = "") => {
    setSelectedInquiry(inquiry);
    setSelectedStatus(status);
    setStatusRemarks("");
    await fetchStatuses(inquiry.id);
    setShowStatusModal(true);
  };

  // const handleStatusUpdateDirect = async (inquiryId, status) => {
  //   try {
  //     await api.post('/api/enquiry/update-status', { inquiryId: inquiryId, remarks: "Quick status update" });
  //     setInquiries(prev => prev.map(item => item.id === inquiryId ? { ...item, status: status, lastUpdated: new Date().toISOString() } : item));
  //     toast.success(`Status updated to ${status}`);
  //   } catch (error) {
  //     console.error("Error updating status:", error);
  //     toast.error("Failed to update status. Please try again.");
  //   }
  // };

  // status update API
  const handleStatusUpdate = async () => {
    try {
      const payload = {
        counsellorRemarks: statusRemarks.trim(),
        status: selectedStatus,
      };
      await api.patch(`/api/enquiry/${selectedInquiry.id}/status`,payload );
      console.log("payload =>",payload);
      setInquiries(prev => prev.map(item => item.id === selectedInquiry.id ? { ...item, status: selectedStatus } : item));
      fetchInquiries();
      toast.success(`Status updated to ${selectedStatus}`);
      setShowStatusModal(false);
      setSelectedInquiry(null);
      setSelectedStatus("");
      setStatusRemarks("");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status. Please try again.");
    }
  };

  const handleCloseStatusModal = () => {
    setShowStatusModal(false);
    setSelectedInquiry(null);
    setSelectedStatus("");
    setStatusRemarks("");
  };

  const exportToPDF = () => {
    const dataToExport = filteredInquiries.map(inquiry => ({ 'Student Name': inquiry.name, 'Phone': inquiry.phone, 'Email': inquiry.email, 'Grade': inquiry.gradeApplyingfor, 'Status': inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1) }));
    const htmlContent = `<html><head><title>Student Inquiries Report</title><style>body{font-family:Arial,sans-serif;margin:20px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px}th{background:#f2f2f2}</style></head><body><h1>Student Inquiries Report</h1><p>Generated on: ${new Date().toLocaleDateString()}</p><table><thead><tr>${Object.keys(dataToExport[0]).map(k => `<th>${k}</th>`).join('')}</tr></thead><tbody>${dataToExport.map(row => `<tr>${Object.values(row).map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
    toast.success('PDF report generated successfully!');
    setShowExportMenu(false);
  };

  const normalizeStatus = (status) => status?.toLowerCase().replace(/[\s-_]+/g, "");

  const handleStatusChange = (inquiry, status) => {
    const normalized = normalizeStatus(status);
    if (normalized.startsWith("followup")) { handleStatusClick(inquiry, status); }
    else if (normalized === "interested") { handleConvert(inquiry); }
    else if (normalized === "notinterested") { handleStatusClick(inquiry, status); }
    else { handleStatusUpdate(inquiry.id, status); }
  };

  const statusCounts = inquiries.reduce((acc, inquiry) => {
    const status = normalizeStatus(inquiry.status);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const followupCount = Object.entries(statusCounts).filter(([key]) => key.startsWith("followup")).reduce((sum, [, value]) => sum + value, 0);

  // const getStatusColor = (status) => {
  //   const s = normalizeStatus(status);
  //   if (s.startsWith("followup")) return 'bg-amber-500/10 text-amber-600 border-amber-400/20';
  //   if (s === "new") return 'bg-blue/10 text-blue-500 border-blue/20';
  //   if (s.includes("interested")) return 'bg-emerald-500/10 text-emerald-600 border-emerald-400/20';
  //   if (s.includes("notinterested")) return 'bg-red-500/10 text-red-500 border-red-400/20';
  //   return 'bg-gray-500/10 text-gray-500 border-gray-400/20';
  // };

  const getStatusColor = (status) => {
  const s = normalizeStatus(status);

  if (s === "new")
    return "bg-blue-500/10 text-blue-600 border-blue-400/20";

  if (s.startsWith("followup"))
    return "bg-amber-500/10 text-amber-600 border-amber-400/20";

  if (s === "notinterested")
    return "bg-red-500/10 text-red-600 border-red-400/20";

  if (s === "interested")
    return "bg-emerald-500/10 text-emerald-600 border-emerald-400/20";

  return "bg-gray-500/10 text-gray-500 border-gray-400/20";
};

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) || inquiry.phone.includes(searchTerm) || inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) || String(inquiry.gradeApplyingfor).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'followup' ? normalizeStatus(inquiry.status).startsWith('followup') : normalizeStatus(inquiry.status) === statusFilter);
    const matchesPriority = priorityFilter === 'all' || inquiry.priority === priorityFilter;
    const matchesSource = sourceFilter === 'all' || inquiry.heardFrom === sourceFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesSource;
  });

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now - past) / 1000);
    const units = [{ label: "year", seconds: 31536000 }, { label: "month", seconds: 2592000 }, { label: "day", seconds: 86400 }, { label: "hour", seconds: 3600 }, { label: "minute", seconds: 60 }];
    for (let unit of units) {
      const value = Math.floor(diff / unit.seconds);
      if (value >= 1) return `${value} ${unit.label}${value > 1 ? "s" : ""} ago`;
    }
    return "Just now";
  };

  const getDateOnly = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const [getFollowups, setFollowups] = useState();
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [selectedInquiryFollowups, setSelectedInquiryFollowups] = useState([]);

  const fetchFollowups = async (enquiryID) => {
    try {
      const response = await api.get(`/api/followup/${enquiryID}`);
      setFollowups("Followups Remarks", response.data);
      setSelectedInquiryFollowups(response.data);
      setShowFollowupModal(true);
    } catch (error) { console.log(error); }
  };

  // ─── STYLES ────────────────────────────────────────────────────────────────
  const card = `rounded-2xl border transition-all ${isDark ? 'bg-[#141414] border-white/5 shadow-2xl' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`;
  const input = `w-full px-3.5 py-2.5 rounded-xl border outline-none transition-all text-sm font-medium ${isDark ? 'bg-[#1A1A1A] border-white/10 text-white focus:border-primary' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-primary focus:bg-white'}`;
  const label = `block text-[10px] font-black uppercase mb-1 tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`;
  const thCell = `px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-gray-400 bg-[#1A1A1A]' : 'text-gray-500 bg-gray-50'}`;
  const tdCell = `px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const trHover = `border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/[0.03]' : 'border-gray-100 hover:bg-gray-50/80'}`;

  return (
    <div className="min-h-screen pb-24">
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: isDark ? '#1A1A1A' : '#fff', color: isDark ? '#fff' : '#000', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', fontSize: '13px', fontWeight: 600 } }} />

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
            Student <span className="text-primary">Inquiries</span>
            <span className="inline-block ml-2 h-2 w-2 rounded-full bg-primary animate-pulse align-middle" />
          </h1>
          <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ml-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <AutoBreadcrumb />
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2.5 rounded-xl border transition-all ${isDark ? 'border-white/10 text-gray-400 hover:bg-white/10' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
            >
              <Bell size={16} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && notifications.length > 0 && (
              <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border z-50 ${isDark ? 'bg-[#141414] border-white/10' : 'bg-white border-gray-200'}`}>
                <div className={`px-4 py-3 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                  <p className="text-[10px] font-black uppercase tracking-wider text-primary">Notifications</p>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.map((n, i) => (
                    <div key={i} className={`px-4 py-3 border-b last:border-0 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 ${n.type === 'overdue' ? 'text-red-500' : n.type === 'upcoming' ? 'text-amber-500' : 'text-primary'}`}>
                          {n.type === 'overdue' ? <Clock size={14} /> : n.type === 'upcoming' ? <Calendar size={14} /> : <MessageSquare size={14} />}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{n.name}</p>
                          <p className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{n.message} · {n.gradeApplyingfor}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Export */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all ${isDark ? 'border-white/10 text-gray-300 hover:bg-white/5' : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}
            >
              <FileDown size={14} /> Export <ChevronDown size={12} />
            </button>
            {showExportMenu && (
              <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl border z-50 overflow-hidden ${isDark ? 'bg-[#141414] border-white/10' : 'bg-white border-gray-200'}`}>
                <button onClick={exportToCSV} className={`w-full flex items-center gap-3 px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider transition-all ${isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <Download size={14} className="text-primary" /> Export CSV
                </button>
                <div className={`h-px ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                <button onClick={exportToPDF} className={`w-full flex items-center gap-3 px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider transition-all ${isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <FileText size={14} className="text-primary" /> Export PDF
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate("/staff/admission/student-enquiry")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-wider hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <Plus size={14} /> Add Inquiry
          </button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`lg:hidden p-2.5 rounded-xl border transition-all ${isDark ? 'border-white/10 text-gray-300' : 'border-gray-200 text-gray-600'}`}
        >
          {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className={`lg:hidden ${card} p-4 mb-6`}>
          <div className="flex flex-col gap-2">
            <button onClick={() => { navigate("/staff/admission/student-enquiry"); setMobileMenuOpen(false); }} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-wider">
              <Plus size={14} /> Add Inquiry
            </button>
            <button onClick={() => { setShowExportMenu(!showExportMenu); setMobileMenuOpen(false); }} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-black uppercase tracking-wider ${isDark ? 'border-white/10 text-gray-300' : 'border-gray-200 text-gray-700'}`}>
              <FileDown size={14} /> Export All
            </button>
          </div>
        </div>
      )}

      {/* ── Stats Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Inquiries', value: inquiries.length, accent: 'text-primary', iconBg: 'bg-primary/10', icon: <UserCheck size={18} className="text-primary" /> },
          { label: 'New Inquiries', value: statusCounts["new"] || 0, accent: 'text-primary', iconBg: 'bg-primary/10', icon: <MessageSquare size={18} className="text-primary" /> },
          { label: 'Follow Up', value: followupCount, accent: 'text-amber-600', iconBg: 'bg-amber-500/10', icon: <Clock size={18} className="text-amber-600" /> },
          { label: 'Interested', value: statusCounts["interested"] || 0, accent: 'text-emerald-600', iconBg: 'bg-emerald-500/10', icon: <UserCheck size={18} className="text-emerald-600" /> },
          { label: 'Not Interested', value: statusCounts["notinterested"] || 0, accent: 'text-red-500', iconBg: 'bg-red-500/10', icon: <Clock size={18} className="text-red-500" /> },
        ].map(({ label: l, value, accent, iconBg, icon }) => (
          <div key={l} className={card}>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{l}</p>
                  <p className={`text-2xl font-black mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>{icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search + Filters ──────────────────────────────────────────────────── */}
      <div className={`${card} p-5 mb-6`}>
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search by name, phone, email or grade…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${input} pl-9`}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Status */}
            <div className="relative">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)} 
                className={`${input} pr-8 appearance-none`}
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="followup">Follow Up</option>
                <option value="interested">Interested</option>
                <option value="notinterested">Not Interested</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
            </div>

            {showMoreFilters && (
              <>
                <div className="relative">
                  <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className={`${input} pr-8`}>
                    <option value="all">All Priority</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                </div>
                <div className="relative">
                  <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className={`${input} pr-8`}>
                    <option value="all">All Source</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Campus Visit">Campus Visit</option>
                  </select>
                  <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
                </div>
              </>
            )}

            <button
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all ${isDark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <Filter size={13} /> {showMoreFilters ? 'Less' : 'More'}
            </button>
          </div>
        </div>

        {/* Stats chip */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-dashed border-gray-200/30">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            {filteredInquiries.length} results
          </div>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────────── */}
      <div className={`${card} overflow-hidden`}>
        <div className={`px-5 py-4 flex items-center justify-between border-b ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
          <div className="flex items-center gap-2 text-primary">
            <UserCheck size={15} />
            <span className="text-[10px] font-black uppercase tracking-widest">Inquiry Registry</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20">{filteredInquiries.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thCell}>Student</th>
                <th className={thCell}>Contact</th>
                <th className={thCell}>Grade</th>
                <th className={thCell}>Source</th>
                <th className={thCell}>Assigned To</th>
                <th className={thCell}>Status Changed</th>
                <th className={thCell}>Status</th>
                <th className={thCell}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInquiries.map((inquiry) => {
                const normalized = normalizeStatus(inquiry.status);
                return (
                  <tr key={inquiry.id} className={`${trHover} cursor-pointer`} onClick={() => handleInquiryClick(inquiry)}>
                    <td className={tdCell}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xs shrink-0">
                          {inquiry.name?.substring(0, 2) || 'ST'}
                        </div>
                        <div>
                          <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>{inquiry.name} {inquiry.middleName} {inquiry.lastName}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin size={10} className="opacity-40" />
                            <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{inquiry.studentFullAddress}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={tdCell}>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <Phone size={11} className="opacity-40" />
                          <span className="text-xs font-medium">{inquiry.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail size={11} className="opacity-40" />
                          <span className="text-[11px] opacity-70">{inquiry.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className={`${tdCell} font-bold text-xs`}>{inquiry.gradeApplyingfor}</td>
                    <td className={`${tdCell} text-xs`}>{inquiry.heardFrom}</td>
                    <td className={`${tdCell} text-xs font-medium`}>{inquiry.counsellorName}</td>
                    <td className={tdCell}>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={11} className="opacity-40" />
                          <span className="text-xs">{getDateOnly(inquiry.statusChangeDate)}</span>
                        </div>
                        <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{getDateOnly(inquiry.createdAt)}</p>
                      </div>
                    </td>
                    <td className={tdCell} onClick={(e) => e.stopPropagation()}>
                      <span
                        onClick={() => fetchFollowups(inquiry.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border cursor-pointer ${getStatusColor(inquiry.status)}`}
                      >
                        {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                      </span>
                    </td>
                    <td className={tdCell} onClick={(e) => e.stopPropagation()}>
                      <select
                        name="inquiryStatus"
                        onFocus={() => fetchStatuses(inquiry.id)}
                        onChange={(e) => handleStatusChange(inquiry, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        // className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider outline-none transition-all ${normalized === 'new' ? (isDark ? 'bg-primary/10 text-primary border-primary/20' : 'bg-primary/5 text-primary border-primary/20') : normalized.startsWith('followup') ? (isDark ? 'bg-amber-500/10 text-amber-500 border-amber-400/20' : 'bg-amber-50 text-amber-700 border-amber-200') : normalized === 'interested' ? (isDark ? 'bg-emerald-500/10 text-emerald-500 border-emerald-400/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200') : normalized === 'notinterested' ? (isDark ? 'bg-red-500/10 text-red-500 border-red-400/20' : 'bg-red-50 text-red-700 border-red-200') : (isDark ? 'bg-white/5 text-gray-400 border-white/10' : 'bg-gray-50 text-gray-700 border-gray-200')}`}
                        className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider outline-none transition-all appearance-none ${getStatusColor(inquiry.status)}`}
                      >
                        <option value="">Change Status</option>
                        {(getStatuses[inquiry.id] || []).map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredInquiries.length === 0 && (
          <div className="text-center py-16">
            <UserCheck size={36} className={`mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={`text-sm font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No inquiries found</p>
          </div>
        )}
      </div>

      {/* ── Inquiry Details Modal ──────────────────────────────────────────────── */}
      {showDetailsModal && selectedInquiryDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl border shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col ${isDark ? 'bg-[#141414] border-white/10' : 'bg-white border-gray-200'}`}>
            {/* Modal Header */}
            <div className={`px-6 py-5 border-b flex items-center justify-between ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <UserCheck size={18} />
                </div>
                <div>
                  <p className="text-lg font-black uppercase tracking-wide">Inquiry Details</p>
                  <p className={`text-[11px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{selectedInquiryDetails.name} {selectedInquiryDetails.middleName} {selectedInquiryDetails.lastName}</p>
                </div>
              </div>
              <button
                onClick={closeDetailsModal}
                className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-primary  hover:text-white text-gray-400' : 'hover:bg-primary text-gray-500  hover:text-white'}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-sm font-black uppercase tracking-wider mb-4 text-primary`}>Personal Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Full Name</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.name} {selectedInquiryDetails.middleName} {selectedInquiryDetails.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Date of Birth</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.dob || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Gender</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.gender || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Phone</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Email</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Address</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.studentFullAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Area</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.area || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>City</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.city || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-sm font-black uppercase tracking-wider mb-4 text-primary`}>Academic Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Grade Applying For</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{getGradeName(selectedInquiryDetails.gradeApplyingfor) || selectedInquiryDetails.gradeApplyingfor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Stream Applying For</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{getStreamName(selectedInquiryDetails.streamApplyingFor) || selectedInquiryDetails.streamApplyingFor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Medium</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{getMediumName(selectedInquiryDetails.medium) || selectedInquiryDetails.medium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Board</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{getBoardName(selectedInquiryDetails.board) || selectedInquiryDetails.board}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Previous School</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.previousSchoolName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Year of Passing</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.yearOfPassing || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Passed Class</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.passedClass || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Academic Year</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.year || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Inquiry Information */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-sm font-black uppercase tracking-wider mb-4 text-primary`}>Inquiry Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Inquiry ID</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>#{selectedInquiryDetails.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(selectedInquiryDetails.status)}`}>
                        {selectedInquiryDetails.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Source</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.heardFrom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Admission Type</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.admissionType || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Campus ID</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.campusId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Counsellor Name</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.counsellorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Counsellor Email</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.counsellorEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Counsellor Remarks</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.counsellorRemarks || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Requirements & Preferences */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-sm font-black uppercase tracking-wider mb-4 text-primary`}>Requirements & Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Transport Required</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${selectedInquiryDetails.transportRequired ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100') : (isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100')}`}>
                        {selectedInquiryDetails.transportRequired ? "YES" : "NO"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Hostel Required</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${selectedInquiryDetails.hostelRequired ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100') : (isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100')}`}>
                        {selectedInquiryDetails.hostelRequired ? "YES" : "NO"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Any Sibling</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${selectedInquiryDetails.anySibling ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100') : (isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100')}`}>
                        {selectedInquiryDetails.anySibling ? "YES" : "NO"}
                      </span>
                    </div>
                    {selectedInquiryDetails.anySibling && (
                      <>
                        <div className="flex justify-between">
                          <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Sibling Name</span>
                          <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.siblingName || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Sibling Grade</span>
                          <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.siblingGrade || 'N/A'}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Previous School Available</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${selectedInquiryDetails.previousSchoolAvailable ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100') : (isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100')}`}>
                        {selectedInquiryDetails.previousSchoolAvailable ? "YES" : "NO"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Parent Information */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-sm font-black uppercase tracking-wider mb-4 text-primary`}>Parent Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Parent Name</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.parentName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Relationship</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.relationship}</span>
                    </div>
                  </div>
                </div>

                {/* Timeline Information */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                  <h3 className={`text-sm font-black uppercase tracking-wider mb-4 text-primary`}>Timeline Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Created At</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.createdAt ? new Date(selectedInquiryDetails.createdAt).toLocaleString() : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Status Changed</span>
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedInquiryDetails.statusChangeDate ? new Date(selectedInquiryDetails.statusChangeDate).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`px-6 py-4 border-t flex justify-end gap-3 shrink-0 ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
              <button
                onClick={closeDetailsModal}
                className={`px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${isDark ? 'bg-white/10 text-gray-300 hover:bg-primary hover:text-white' : 'bg-gray-100 text-gray-700 hover:bg-primary  hover:text-white'}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status Update Modal ──────────────────────────────────────────────── */}
      {showStatusModal && selectedInquiry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl border shadow-2xl max-w-md w-full ${isDark ? 'bg-[#141414] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`px-6 py-5 border-b flex items-center justify-between ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <UserCheck size={15} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wide">Update Status</p>
                  <p className={`text-[10px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{selectedInquiry.name} {selectedInquiry.middleName} {selectedInquiry.lastName}</p>
                </div>
              </div>
              <button onClick={handleCloseStatusModal} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className={label}>Current Status</label>
                <div className="flex items-center gap-3">
                  <div className={`flex-1 px-3.5 py-2.5 rounded-xl border text-sm font-medium opacity-60 ${getStatusColor(selectedInquiry.status)}`}>
                    {selectedInquiry.status.charAt(0).toUpperCase() + selectedInquiry.status.slice(1)}
                  </div>
                  {selectedStatus && (
                    <>
                      <span className="text-xs text-gray-400">→</span>
                      <div className={`flex-1 px-3.5 py-2.5 rounded-xl border text-sm font-medium ${getStatusColor(selectedStatus)}`}>
                        {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className={label}>Remarks</label>
                <textarea
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="Add remarks or notes about this inquiry…"
                  rows={4}
                  className={`${input} resize-none`}
                />
              </div>
            </div>

            <div className={`px-6 py-4 border-t flex justify-end gap-3 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
              <button onClick={handleCloseStatusModal} className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${isDark ? 'bg-white/10 text-gray-300 hover:bg-white/15' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Cancel
              </button>
              <button onClick={handleStatusUpdate} className="px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Follow-up Modal ──────────────────────────────────────────────────── */}
      {showFollowupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl border shadow-2xl max-w-2xl w-full ${isDark ? 'bg-[#141414] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`px-6 py-5 border-b flex items-center justify-between ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <MessageSquare size={15} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wide">Follow-up History</p>
                  <p className={`text-[10px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Inquiry follow-up details and remarks</p>
                </div>
              </div>
              <button onClick={() => setShowFollowupModal(false)} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X size={16} />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {selectedInquiryFollowups && selectedInquiryFollowups.length > 0 ? (
                <div className="space-y-3">
                  {selectedInquiryFollowups.map((followup) => (
                    <div key={followup.id} className={`p-4 rounded-xl border ${isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm">
                            {followup.followupNumber}
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{followup.status}</p>
                            <p className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Follow-up #{followup.followupNumber}</p>
                          </div>
                        </div>
                        <p className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {new Date(followup.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                        <p className={`text-[10px] font-black uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Remarks</p>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{followup.remarks || 'No remarks provided'}</p>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar size={11} className="opacity-40" />
                          <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Enquiry ID: {followup.enquiryId}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Hash size={11} className="opacity-40" />
                          <span className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>ID: {followup.id}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare size={32} className={`mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                  <p className={`text-sm font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No Follow-ups Found</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>This inquiry doesn't have any follow-up records yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
