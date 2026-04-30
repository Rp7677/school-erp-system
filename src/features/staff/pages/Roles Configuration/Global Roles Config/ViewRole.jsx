import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Shield, Plus, Search, Edit2, Power, Loader2, Users,
  CheckCircle2, XCircle, Eye, X, Grid, ShieldCheck,
  List, LayoutGrid, ChevronLeft, ChevronRight,
  RefreshCw,
} from "lucide-react";
import api from "../../../../../config/api";
import { Toaster, toast } from "react-hot-toast";
import AutoBreadcrumb from "../../../../../components/common/AutoBreadcrumb";

const ViewRoles = () => {
  const themeMode = useSelector((state) => state.color.mode);
  const isDark = themeMode === "dark";
  const navigate = useNavigate();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const [viewingRole, setViewingRole] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [viewType, setViewType] = useState("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/template-roles");
      setRoles(response.data || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to load roles.");
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRoles(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchTerm, itemsPerPage]);

  const handleViewPermissions = async (role) => {
    setViewingRole(role);
    setLoadingPermissions(true);
    setRolePermissions([]);
    try {
      const response = await api.get(`/api/template-roles/${role.id}/permissions`);
      setRolePermissions(response.data);
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast.error("Could not load permissions.");
    } finally { setLoadingPermissions(false); }
  };

  const closePermissionsModal = () => { setViewingRole(null); setRolePermissions([]); };

  const handleToggleStatus = async (role) => {
    setTogglingId(role.id);
    try {
      const active = role.active ? "false" : "true";
      await api.patch(`/api/template-roles/${role.id}/status`, { active });
      setRoles((prevRoles) => prevRoles.map((r) => r.id === role.id ? { ...r, active: !r.active } : r));
      toast.success(`Role ${role.active ? "deactivated" : "activated"} successfully`);
    } catch (error) {
      console.error("Toggle Error:", error);
      toast.error("Failed to update status");
    } finally { setTogglingId(null); }
  };

  const filteredRoles = useMemo(() => {
    if (!searchTerm) return roles;
    const lowerTerm = searchTerm.toLowerCase();
    return roles.filter((r) => r.name.toLowerCase().includes(lowerTerm) || r.code.toLowerCase().includes(lowerTerm));
  }, [roles, searchTerm]);

  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);
  const paginatedRoles = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRoles.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRoles, currentPage, itemsPerPage]);

  const groupedPermissions = useMemo(() => {
    if (!rolePermissions.length) return {};
    return rolePermissions.reduce((acc, perm) => {
      const moduleName = perm.module || "General";
      if (!acc[moduleName]) acc[moduleName] = [];
      acc[moduleName].push(perm);
      return acc;
    }, {});
  }, [rolePermissions]);

  // ─── STYLES (matching DocumentMaster) ───────────────────────────
  const card = `rounded-2xl border transition-all ${isDark ? 'bg-[#141414] border-white/5 shadow-2xl' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/50'}`;
  const input = `w-full px-3.5 py-2.5 rounded-xl border outline-none transition-all text-sm font-medium ${isDark ? 'bg-[#1A1A1A] border-white/10 text-white focus:border-primary' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-primary focus:bg-white'}`;
  const label = `block text-[10px] font-black uppercase mb-1 tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`;
  const thCell = `px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-gray-400 bg-[#1A1A1A]' : 'text-gray-500 bg-gray-50'}`;
  const tdCell = `px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`;
  const trHover = `border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/[0.03]' : 'border-gray-100 hover:bg-gray-50/80'}`;

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" toastOptions={{ duration: 3000, style: { background: isDark ? '#1A1A1A' : '#fff', color: isDark ? '#fff' : '#000', border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', fontSize: '13px', fontWeight: 600 } }} />

     
      <div className={`pb-4 mb-6 backdrop-blur-md transition-colors ${isDark ? 'bg-[#0F0F0F]/80' : 'bg-white/80'}`}>
        <div className="flex flex-col md:flex-row justify-between items-end md:items-center py-4 gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">
              Global <span className="text-primary">Roles</span>
              <span className="inline-block ml-2 h-2 w-2 rounded-full bg-primary animate-pulse align-middle" />
            </h1>
            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Manage Access Levels &amp; System Functionality
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
            <button onClick={() => navigate("/staff/globalroles/create-role")} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-wider hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
              <Plus size={14} /> Create Role
            </button>
          </div>
        </div>

        {/* Search + page size */}
        <div className={`${card} p-5 mb-6`}>
          <div className="flex items-center gap-2 mb-4 text-primary">
            <Shield size={15} />
            <span className="text-[10px] font-black uppercase tracking-widest">Filter &amp; Search</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Search */}
            <div className="md:col-span-1">
              <label className={label}>Search Roles</label>
              <div className="relative">
                <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <input
                  type="text"
                  placeholder="Search by role name…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`${input} pl-9`}
                />
              </div>
            </div>
            {/* Page Size */}
            <div>
              <label className={label}>Show</label>
              <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className={input}>
                {[10, 20, 30, 40, 50].map((val) => <option key={val} value={val}>{val}</option>)}
              </select>
            </div>
          </div>

          {/* Stats chips */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-dashed border-gray-200/30">
            {[
              { label: 'Total', value: filteredRoles.length, color: 'bg-primary/10 text-primary border-primary/20' },
              { label: 'Active', value: filteredRoles.filter(r => r.active).length, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-400/20' },
              { label: 'Inactive', value: filteredRoles.filter(r => !r.active).length, color: 'bg-red-500/10 text-red-500 border-red-400/20' },
            ].map(({ label: l, value, color }) => (
              <div key={l} className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${color}`}>
                <span>{l}:</span>
                <span>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 size={32} className="animate-spin text-primary" />
          <p className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Loading roles…</p>
        </div>
      ) : filteredRoles.length === 0 ? (
        <div className={`${card} p-16 text-center`}>
          <Shield size={36} className={`mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
          <p className={`text-sm font-bold ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No roles found</p>
        </div>
      ) : (
        <>
          {viewType === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedRoles.map((role) => (
                <div key={role.id} className={`${card} hover:-translate-y-1 hover:shadow-lg hover:border-primary/20`}>
                  <div className={`px-5 py-4 border-b flex items-center gap-3 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}><Users size={18} className={isDark ? 'text-gray-400' : 'text-gray-500'} /></div>
                    <div>
                      <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{role.name}</p>
                      <p className="text-[10px] font-mono text-primary font-medium">{role.code}</p>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Status</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${role.active ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100') : (isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100')}`}>
                        {role.active ? <CheckCircle2 size={9} /> : <XCircle size={9} />}
                        {role.active ? "ACTIVE" : "INACTIVE"}
                      </span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Access control for {role.name.toLowerCase()}.</p>
                    <div className="grid grid-cols-4 gap-2">
                      <button onClick={() => handleToggleStatus(role)} disabled={togglingId === role.id} className={`col-span-2 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${role.active ? (isDark ? 'border-red-400/20 text-red-400 hover:bg-red-500/10' : 'border-red-200 text-red-600 hover:bg-red-50') : (isDark ? 'border-emerald-400/20 text-emerald-400 hover:bg-emerald-500/10' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50')}`}>
                        {togglingId === role.id ? <Loader2 size={12} className="animate-spin" /> : <Power size={12} />}
                        {role.active ? "Off" : "On"}
                      </button>
                      <button onClick={() => handleViewPermissions(role)} className={`col-span-1 flex items-center justify-center rounded-xl border transition-all ${isDark ? 'border-white/10 text-primary hover:bg-primary/10' : 'border-gray-200 text-primary hover:bg-primary/5'}`}><Eye size={15} /></button>
                      <button onClick={() => navigate(`/staff/globalroles/edit-role/${role.id}`)} className={`col-span-1 flex items-center justify-center rounded-xl border transition-all ${isDark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}><Edit2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`${card} overflow-hidden`}>
              {/* Table header bar */}
              <div className={`px-5 py-4 flex items-center justify-between border-b ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
                <div className="flex items-center gap-2 text-primary">
                  <Shield size={15} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Role Registry</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black bg-primary/10 text-primary border border-primary/20`}>
                    {filteredRoles.length} records
                  </span>
                  <button
                    onClick={fetchRoles}
                    className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                    title="Refresh"
                  >
                    <RefreshCw size={13} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className={`${thCell} w-10`}>#</th>
                      <th className={thCell}>Role Name</th>
                      <th className={thCell}>Code</th>
                      <th className={thCell}>Status</th>
                      <th className={`${thCell} text-center`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <div className="flex items-center justify-center gap-3">
                            <Loader2 size={20} className="animate-spin text-primary" />
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Loading roles…</span>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedRoles.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-3 opacity-20">
                            <Shield size={40} />
                            <span className={`text-sm font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No roles found</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedRoles.map((role, index) => (
                        <tr key={role.id} className={trHover}>
                          <td className={tdCell}>
                            <span className={`text-sm font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </span>
                          </td>
                          <td className={tdCell}>
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                <Users size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                              </div>
                              <span className="font-medium">{role.name}</span>
                            </div>
                          </td>
                          <td className={tdCell}>
                            <span className="text-[10px] font-mono font-bold text-primary">{role.code}</span>
                          </td>
                          <td className={tdCell}>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${role.active ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100') : (isDark ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-600 border-red-100')}`}>
                              {role.active ? "ACTIVE" : "INACTIVE"}
                            </span>
                          </td>
                          <td className={`${tdCell} text-center`}>
                            <div className="flex justify-center gap-1.5">
                              <button onClick={() => handleViewPermissions(role)} className={`p-2 rounded-xl border transition-all ${isDark ? 'border-white/10 text-primary hover:bg-primary/10' : 'border-gray-200 text-primary hover:bg-primary/5'}`} title="View Permissions"><Eye size={14} /></button>
                              <button onClick={() => navigate(`/staff/globalroles/edit-role/${role.id}`)} className={`p-2 rounded-xl border transition-all ${isDark ? 'border-white/10 text-gray-400 hover:bg-white/5' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`} title="Edit"><Edit2 size={14} /></button>
                              <button onClick={() => handleToggleStatus(role)} disabled={togglingId === role.id} className={`p-2 rounded-xl border transition-all ${role.active ? (isDark ? 'border-red-400/20 text-red-400 hover:bg-red-500/10' : 'border-red-200 text-red-600 hover:bg-red-50') : (isDark ? 'border-emerald-400/20 text-emerald-400 hover:bg-emerald-500/10' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50')}`} title={role.active ? "Deactivate" : "Activate"}>
                                {togglingId === role.id ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
            <p className={`text-[11px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Showing <b>{(currentPage - 1) * itemsPerPage + 1}</b> to <b>{Math.min(currentPage * itemsPerPage, filteredRoles.length)}</b> of <b>{filteredRoles.length}</b> roles
            </p>
            <div className="flex items-center gap-1.5">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className={`p-2 rounded-xl border transition-all ${isDark ? 'border-white/10 text-gray-400 disabled:opacity-20' : 'border-gray-200 text-gray-600 disabled:opacity-40'}`}><ChevronLeft size={16} /></button>
              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i + 1} onClick={() => setCurrentPage(i + 1)} className={`w-8 h-8 rounded-xl text-xs font-black transition-all ${currentPage === i + 1 ? 'bg-primary text-white shadow-lg shadow-primary/20' : isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}>{i + 1}</button>
                ))}
              </div>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className={`p-2 rounded-xl border transition-all ${isDark ? 'border-white/10 text-gray-400 disabled:opacity-20' : 'border-gray-200 text-gray-600 disabled:opacity-40'}`}><ChevronRight size={16} /></button>
            </div>
          </div>
        </>
      )}

      {/* Permissions Modal */}
      {viewingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closePermissionsModal} />
          <div className={`relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden ${isDark ? 'bg-[#141414] border border-white/10' : 'bg-white border border-gray-200'}`}>
            <div className={`px-6 py-5 border-b flex items-center justify-between ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><ShieldCheck size={15} /></div>
                <div>
                  <p className="text-sm font-black uppercase tracking-wide">{viewingRole.name} Permissions</p>
                  <p className={`text-[10px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Code: <span className="font-mono text-primary">{viewingRole.code}</span></p>
                </div>
              </div>
              <button onClick={closePermissionsModal} className={`p-2 rounded-xl transition-all ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}><X size={16} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {loadingPermissions ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 size={24} className="animate-spin text-primary" />
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Fetching permissions…</span>
                </div>
              ) : rolePermissions.length === 0 ? (
                <div className="text-center py-12">
                  <Grid className={`mx-auto mb-3 opacity-20 ${isDark ? 'text-white' : 'text-black'}`} size={36} />
                  <p className={`text-sm font-bold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No permissions assigned to this role.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {Object.entries(groupedPermissions).map(([moduleName, permissions]) => (
                    <div key={moduleName}>
                      <p className={`text-[10px] font-black uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{moduleName.replace(/_/g, " ")}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {permissions.map((perm) => (
                          <div key={perm.id} className={`p-3 rounded-xl border ${isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                            <div className="flex justify-between items-start mb-1">
                              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isDark ? 'bg-primary/20 text-primary' : 'bg-primary/10 text-primary'}`}>{perm.code}</span>
                              {perm.active && <CheckCircle2 size={11} className="text-emerald-500" />}
                            </div>
                            <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{perm.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className={`px-6 py-4 border-t flex justify-end ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}`}>
              <button onClick={closePermissionsModal} className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${isDark ? 'bg-white/10 text-gray-300 hover:bg-white/15' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewRoles;
