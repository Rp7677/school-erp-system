import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  UserPlus, X, Users, Search, Mail, Briefcase, Shield,
  ArrowLeft, CheckCircle, List, LayoutGrid, PhoneCallIcon,
  XCircle, Crown, Loader2, RefreshCw,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import api from "../../../../config/api";
import AutoBreadcrumb from "../../../../components/common/AutoBreadcrumb";
import UserManagementModal_Backup from "./Display User New Way/UserManagementModal_New";

const Displaystaff2 = () => {
  const themeMode = useSelector((state) => state.color.mode);
  const isDark = themeMode === "dark";
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [systemUsers, setSystemUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [viewType, setViewType] = useState("table");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showSuperAdmin, setShowSuperAdmin] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState();
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCampusRoleModal, setShowCampusRoleModal] = useState(false);
  const [selectedCampusData, setSelectedCampusData] = useState(null);
  const [activeTab, setActiveTab] = useState("staff");

  const fetchCampusData = async () => {
    try {
      const campusResponse = await api.get("/api/user-campus-access/all??page=0&size=100");
      const assignedcampus = campusResponse.data.content;
      setCampuses(assignedcampus);
      return assignedcampus;
    } catch (error) {
      console.error("Error fetching campus data:", error);
      toast.error("Failed to load campus data");
      return [];
    }
  };

  const fetchSuperAdminData = async () => {
    try {
      const superAdminResponse = await api.get("/api/assignment-users");
      return superAdminResponse.data.content;
    } catch (error) {
      console.error("Error fetching super admin data:", error);
      toast.error("Failed to load super admin data");
      return [];
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await api.get("/api/system-users");
      return response.data;
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
      return [];
    }
  };

  const mergeAndSetUsers = async () => {
    setLoadingUsers(true);
    try {
      const [assignedcampus, superAdmin, user] = await Promise.all([fetchCampusData(), fetchSuperAdminData(), fetchUserData()]);
      const mergedUsers = user.map(user => {
        const campusDataFromAPI = assignedcampus.find(u => u.id === user.id);
        const assignedCampuses = campusDataFromAPI?.campusAccess || [];
        const mergedAssignedCampuses = assignedCampuses.map(campus => {
          const systemCampus = user.campuses?.find(c => c.campusId === campus.campusId);
          return { ...campus, roles: systemCampus?.roles || [] };
        });
        const superAdminUser = superAdmin.find(admin => admin.id === user.id);
        return { ...user, assignedCampuses: mergedAssignedCampuses, isSuperAdmin: superAdminUser?.isSuperAdmin || false };
      });
      setSystemUsers(mergedUsers);
    } catch (error) {
      console.error("Error merging user data:", error);
      toast.error("Failed to load system users");
    } finally { setLoadingUsers(false); }
  };

  const fetchSystemUsers = async () => { await mergeAndSetUsers(); };

  useEffect(() => { fetchSystemUsers(); }, []);

  const superAdminUsers = systemUsers.filter(user => user.isSuperAdmin);
  const staffUsers = systemUsers.filter(user => !user.isSuperAdmin);
  const usersToDisplay = activeTab === "superadmin" ? superAdminUsers : staffUsers;

  const [userCampuses, setUserCampuses] = useState([]);
  const fetchUserCampuses = async (userId) => {
    try {
      const response = await api.get(`/api/user-campus-access/${userId}`);
      setUserCampuses(response.data);
    } catch (error) { console.error("Error fetching campuses", error); }
  };

  const handleCampusRoleClick = (user, campus) => {
    const campusWithRoles = { ...campus, roles: campus.roles && campus.roles.length > 0 ? campus.roles : (user.campuses?.find(c => c.campusId === campus.campusId)?.roles || []) };
    const campusesWithRoles = (user.assignedCampuses || []).map(c => ({ ...c, roles: c.roles && c.roles.length > 0 ? c.roles : (user.campuses?.find(uc => uc.campusId === c.campusId)?.roles || []) }));
    setSelectedCampusData({ userName: user.displayName, userEmail: user.email, campuses: campusesWithRoles, selectedCampus: campusWithRoles });
    setShowCampusRoleModal(true);
  };

  const deleteAssignRole = async (userId, campusId, roleId) => {
    try {
      await api.delete(`/api/users/${userId}/roles`, { data: { campusId: Number(campusId), roleId: Number(roleId) } });
      toast.success('Role deleted successfully');
      fetchSystemUsers();
    } catch (error) {
      console.log(error);
      toast.error('Failed to delete role');
    }
  };

  // ─── STYLES ────────────────────────────────────────────────────────────────
  const card = `rounded-2xl border transition-all ${isDark ? 'bg-[#141414] border-white/5 shadow-2xl' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`;
  const input = `w-full px-3.5 py-2.5 rounded-xl border outline-none transition-all text-sm font-medium ${isDark ? 'bg-[#1A1A1A] border-white/10 text-white focus:border-primary' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-primary focus:bg-white'}`;
  const thCell = `px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-gray-400 bg-[#1A1A1A]' : 'text-gray-500 bg-gray-50'}`;
  const tdCell = `px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const trHover = `border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/[0.03]' : 'border-gray-100 hover:bg-gray-50/80'}`;

  return (
    <div className="min-h-screen pb-24">
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: isDark ? '#1A1A1A' : '#fff', color: isDark ? '#fff' : '#000', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', fontSize: '13px', fontWeight: 600 } }} />


      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <button onClick={() => navigate(-1)} className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-wider mb-2 transition-colors ${isDark ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-gray-800'}`}>
            <ArrowLeft size={12} /> Back
          </button>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
            Staff <span className="text-primary">Management</span>
            <span className="inline-block ml-2 h-2 w-2 rounded-full bg-primary animate-pulse align-middle" />
          </h1>
          <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ml-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Manage System Users &amp; Staff Members
          </p>
          <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ml-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <AutoBreadcrumb />
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'}`}>
            <button onClick={() => setViewType("grid")} className={`p-2 rounded-lg transition-all ${viewType === "grid" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-primary"}`}><LayoutGrid size={16} /></button>
            <button onClick={() => setViewType("table")} className={`p-2 rounded-lg transition-all ${viewType === "table" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:text-primary"}`}><List size={16} /></button>
          </div>
          <button onClick={() => navigate("/staff/managestaff/createstaff")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-wider hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
            <UserPlus size={14} /> Create Staff
          </button>
        </div>
      </div>

      {/* ── Tab + Search Bar ─────────────────────────────────────────────────── */}
      <div className={`${card} p-5 mb-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex gap-2">
            {[
              { key: 'staff', label: `Users (${staffUsers.length})` },
              { key: 'superadmin', label: `Super Admins (${superAdminUsers.length})` },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${activeTab === key ? 'bg-primary text-white shadow-lg shadow-primary/20' : isDark ? 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80">
            <Search size={13} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input type="text" placeholder="Search staff members…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${input} pl-9`} />
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className={`${card} overflow-hidden`}>
        {/* Table header bar */}
        <div className={`px-5 py-4 flex items-center justify-between border-b ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
          <div className="flex items-center gap-2 text-primary">
            <Shield size={15} />
            <span className="text-[10px] font-black uppercase tracking-widest">System Users Registry</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20`}>
              {usersToDisplay.length} records
            </span>
            <button
              onClick={fetchSystemUsers}
              className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              title="Refresh"
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        <div>
          {loadingUsers ? (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 size={20} className="animate-spin text-primary" />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading staff…</span>
            </div>
          ) : systemUsers.length === 0 ? (
            <div className="text-center py-16">
              <Users size={36} className={`mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
              <p className={`text-sm font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{searchTerm ? "No staff members found" : "No staff members found"}</p>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                {searchTerm ? 'Try adjusting your search' : 'Click Create Staff to get started'}
              </p>
            </div>
          ) : viewType === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {usersToDisplay.map((user) => (
                <div key={user.id} className={`rounded-2xl border transition-all hover:shadow-lg ${isDark ? 'bg-[#1A1A1A] border-white/5 hover:border-primary/30' : 'bg-white border-gray-100 hover:border-primary/30'}`}>
                  <div className={`px-5 py-4 border-b flex items-center gap-3 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                      {user.isSuperAdmin ? <Crown size={18} className="text-primary" /> : <Users size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} />}
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.displayName}</p>
                      <p className="text-[10px] font-mono text-primary font-medium">{user.userId}</p>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Status</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${user.isActive ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100') : (isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100')}`}>
                        {user.isActive ? <CheckCircle size={9} /> : <XCircle size={9} />}
                        {user.isActive ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="opacity-40" />
                        <span className="text-xs truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PhoneCallIcon size={12} className="opacity-40" />
                        <span className="text-xs">+91{user.phone}</span>
                      </div>
                    </div>
                    <div className={`pt-2 border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                      {user.assignedCampuses && user.assignedCampuses.length > 0 ? user.assignedCampuses.map(campus => {
                        const mergedRoles = campus.roles || [];
                        const fallbackRoles = user.campuses?.find(c => c.campusId === campus.campusId)?.roles || [];
                        const roles = mergedRoles.length > 0 ? mergedRoles : fallbackRoles;
                        return (
                          <div key={campus.campusId} className="flex items-center gap-2 mb-1 cursor-pointer" onClick={() => handleCampusRoleClick(user, campus)}>
                            <Briefcase size={12} className="opacity-40 shrink-0" />
                            <span className={`text-xs font-medium truncate flex-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{campus.campusName || 'Unknown'}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${roles.length > 0 ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>{roles.length} roles</span>
                          </div>
                        );
                      }) : <p className="text-xs text-primary">No roles assigned</p>}
                    </div>
                    <button onClick={async () => { await fetchUserCampuses(user.id); setSelectedUser(user); setShowUserModal(true); }} className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${isDark ? 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20' : 'bg-primary/5 text-primary hover:bg-primary/10 border-primary/10'}`}>
                      <UserPlus size={13} /> Manage User
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className={`${thCell} w-10`}>#</th>
                    <th className={thCell}>User</th>
                    <th className={thCell}>Email</th>
                    <th className={thCell}>Phone</th>
                    <th className={thCell}>Assigned Campuses</th>
                    <th className={`${thCell} text-center`}>Status</th>
                    <th className={`${thCell} text-center`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersToDisplay.map((user, index) => (
                    <tr key={user.id} className={trHover}>
                      <td className={`${tdCell} font-black text-primary/40`}>{String(index + 1).padStart(2, '0')}</td>
                      <td className={tdCell}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                            {user.isSuperAdmin ? <Crown size={16} className="text-primary" /> : <Users size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />}
                          </div>
                          <div>
                            <p className={`font-bold text-xs ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.displayName}</p>
                            <p className="text-[10px] font-mono text-primary">{user.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td className={tdCell}>
                        <div className="flex items-center gap-2">
                          <Mail size={12} className="opacity-40" />
                          <span className="text-xs">{user.email}</span>
                        </div>
                      </td>
                      <td className={tdCell}>
                        <div className="flex items-center gap-2">
                          <PhoneCallIcon size={12} className="opacity-40" />
                          <span className="text-xs">+91{user.phone}</span>
                        </div>
                      </td>
                      <td className={`${tdCell} cursor-pointer`} onClick={() => handleCampusRoleClick(user, user.assignedCampuses[0])}>
                        {user.assignedCampuses && user.assignedCampuses.length > 0 ? (
                          <div className="space-y-1">
                            {user.assignedCampuses.map(campus => {
                              const mergedRoles = campus.roles || [];
                              const fallbackRoles = user.campuses?.find(c => c.campusId === campus.campusId)?.roles || [];
                              const roles = mergedRoles.length > 0 ? mergedRoles : fallbackRoles;
                              return (
                                <div key={campus.campusId} className="flex items-center gap-2">
                                  <Briefcase size={12} className="opacity-40" />
                                  <span className={`text-xs font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{campus.campusName || 'Unknown'}</span>
                                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${roles.length > 0 ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}>{roles.length} roles</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No Campus Assigned</span>}
                      </td>
                      <td className={`${tdCell} text-center`}>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${user.isActive ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100') : (isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100')}`}>
                          {user.isActive ? <CheckCircle size={9} /> : <XCircle size={9} />}
                          {user.isActive ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className={`${tdCell} text-center`}>
                        <button onClick={async () => { await fetchUserCampuses(user.id); setSelectedUser(user); setShowUserModal(true); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border mx-auto ${isDark ? 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20' : 'bg-primary/5 text-primary hover:bg-primary/10 border-primary/10'}`}>
                          <UserPlus size={12} /> Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* User Management Popup */}
      {showUserModal && selectedUser && (
        <UserManagementModal_Backup user={selectedUser} isDark={isDark} onClose={() => setShowUserModal(false)} userAssignedCampuses={userCampuses} refreshUsers={fetchSystemUsers} />
      )}

      {/* Campus Role Details Modal */}
      {showCampusRoleModal && selectedCampusData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl border shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col ${isDark ? 'bg-[#141414] border-white/10' : 'bg-white border-gray-200'}`}>
            <div className={`px-6 py-5 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Shield size={15} /></div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wide">Campus &amp; Role Details</p>
                  <p className={`text-[10px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{selectedCampusData.userName} · {selectedCampusData.userEmail}</p>
                </div>
              </div>
              <button onClick={() => setShowCampusRoleModal(false)} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><X size={16} /></button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className={`rounded-xl border p-4 ${isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{selectedCampusData.selectedCampus.campusName}</p>
                  <div className="space-y-2">
                    {selectedCampusData.selectedCampus.roles && selectedCampusData.selectedCampus.roles.length > 0 ? selectedCampusData.selectedCampus.roles.map(role => (
                      <div key={role.roleId} className={`flex items-center justify-between px-3 py-2 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200'}`}>
                        <span className="text-xs font-bold">{role.roleName}</span>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-400/20">Active</span>
                          <XCircle size={13} className="text-red-500 hover:text-red-400 cursor-pointer" onClick={() => deleteAssignRole(systemUsers.find(u => u.email === selectedCampusData.userEmail)?.id, selectedCampusData.selectedCampus.campusId, role.roleId)} />
                        </div>
                      </div>
                    )) : <p className={`text-xs italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No roles assigned</p>}
                  </div>
                </div>

                {selectedCampusData.campuses.length > 1 && (
                  <div className={`rounded-xl border p-4 ${isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{selectedCampusData.campuses.find(c => c.campusId !== selectedCampusData.selectedCampus.campusId)?.campusName}</p>
                    <div className="space-y-2">
                      {selectedCampusData.campuses.filter(campus => campus.campusId !== selectedCampusData.selectedCampus.campusId).map(campus => (
                        campus.roles && campus.roles.length > 0 ? campus.roles.map(role => (
                          <div key={role.roleId} className={`flex items-center justify-between px-3 py-2 rounded-xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-gray-200'}`}>
                            <span className="text-xs font-bold">{role.roleName}</span>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-400/20">Active</span>
                              <XCircle size={13} className="text-red-500 hover:text-red-400 cursor-pointer" onClick={() => deleteAssignRole(systemUsers.find(u => u.email === selectedCampusData.userEmail)?.id, campus.campusId, role.roleId)} />
                            </div>
                          </div>
                        )) : <p key={campus.campusId} className={`text-xs italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No roles assigned</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={`mt-4 rounded-xl border p-4 ${isDark ? 'bg-primary/5 border-primary/20' : 'bg-primary/5 border-primary/10'}`}>
                <p className="text-[10px] font-black uppercase tracking-wider text-primary mb-3">Summary</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { value: selectedCampusData.campuses.length, label: 'Total Campuses' },
                    { value: selectedCampusData.campuses.reduce((t, c) => t + (c.roles?.length || 0), 0), label: 'Total Roles' },
                    { value: selectedCampusData.selectedCampus.campusName, label: 'Active Campus' },
                  ].map(({ value, label }, i) => (
                    <div key={i}>
                      <p className={`text-lg font-black text-primary`}>{value}</p>
                      <p className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Displaystaff2;
