import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { X, Shield, Building2, Crown, Users, MapPin, CheckCircle, AlertCircle, Briefcase, User, Mail, Phone, Star, ChevronRight, Sparkles, Edit2, Save, XCircle } from "lucide-react";
import CampusAccess from "./CampusAccess";
import AssignRolestostaff from "./AssignRolestostaff";
import SuperAdminModal from "./SuperAdminModal";
import api from "../../../../../config/api";

const UserManagementModal_Backup = ({
  user,
  isDark,
  onClose,
  refreshUsers,
  userAssignedCampuses,
}) => {

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    displayName: user.displayName,
    email: user.email,
    phone: user.phone || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Premium styling consistent with fees dashboard
  const premiumCard = `relative overflow-hidden group rounded-3xl border backdrop-blur-xl transition-all duration-700 ${isDark
      ? 'bg-[#1E1E1E] border-white/10 shadow-2xl'
      : 'bg-white border-gray-200/80 shadow-lg'
    }`;

  const glassHeader = isDark
    ? 'bg-white/[0.02] border-b border-white/10'
    : 'bg-gray-50/80 border-b border-gray-200/80';

  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
  const textMuted = isDark ? "text-gray-500 font-medium text-xs" : "text-gray-500 font-medium text-xs";

  const tabButton = (key, label, Icon) => (
    <button
      onClick={() => {
        setActiveTab(key);
        // Only refresh data when actual changes are made, not on tab switching
      }}
      className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 relative overflow-hidden group
        ${activeTab === key
          ? "bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 scale-105"
          : isDark
            ? "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 border border-gray-200"
        }`}
    >
      <div className={`p-1.5 rounded-lg ${activeTab === key ? "bg-white/20" : isDark ? "bg-white/10" : "bg-gray-200"}`}>
        <Icon size={16} />
      </div>
      {label}
      {activeTab === key && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-2xl"></div>
      )}
    </button>
  );

  const InfoCard = ({ icon: Icon, label, value, color = "primary" }) => (
    <div className={`${premiumCard} p-6 hover:scale-[1.02] transition-transform duration-300`}>
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl opacity-60"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl bg-${color}/10 backdrop-blur-sm border border-${color}/20`}>
            <Icon className={`w-5 h-5 text-${color}`} />
          </div>
          <div className="flex-1">
            <p className={`text-xs uppercase tracking-wider ${textMuted} mb-1`}>{label}</p>
            <p className={`text-lg font-bold ${textPrimary}`}>{value}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const CampusCard = ({ campus }) => (
    <div className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md cursor-pointer ${isDark
        ? 'bg-[#1E1E1E] border-white/10 hover:border-white/20'
        : 'bg-white border-gray-200 hover:border-gray-300'
      }`}>
      <div className="flex items-start gap-3">
        <Building2 className={`w-4 h-4 ${textSecondary} mt-0.5`} />
        <div className="flex-1">
          <h4 className={`font-semibold text-base ${textPrimary} mb-1`}>
            {campus.campusName}
          </h4>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-3 h-3 text-primary" />
            <span className={`text-xs ${textSecondary}`}>ID: {campus.campusId}</span>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium w-fit">
            <CheckCircle size={8} />
            Active
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 ${textSecondary} mt-1`} />
      </div>
    </div>
  );

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Add your API call here to update user details
      // await api.put(`/api/users/${user.id}`, editedUser);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success("User details updated successfully!");
      setIsEditing(false);
      refreshUsers();
    } catch (error) {
      toast.error("Failed to update user details");
      console.error("Update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedUser({
      displayName: user.displayName,
      email: user.email,
      phone: user.phone || ''
    });
    setIsEditing(false);
  };

  const EditableField = ({ icon: Icon, label, value, fieldKey, color = "primary" }) => (
    <div className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${isDark
        ? 'bg-[#1E1E1E] border-white/10 hover:border-white/20'
        : 'bg-white border-gray-200 hover:border-gray-300'
      }`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-4 h-4 ${textSecondary} mt-0.5`} />
        <div className="flex-1">
          <p className={`text-xs font-medium uppercase tracking-wider ${textMuted} mb-1`}>{label}</p>
          {isEditing ? (
            <input
              type={fieldKey === 'email' ? 'email' : fieldKey === 'phone' ? 'tel' : 'text'}
              value={editedUser[fieldKey]}
              onChange={(e) => setEditedUser(prev => ({ ...prev, [fieldKey]: e.target.value }))}
              className={`w-full px-3 py-2 rounded-lg border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${isDark
                  ? "bg-white/5 border-white/20 text-gray-200 focus:bg-white/10"
                  : "bg-gray-50 border-gray-200 text-gray-800 focus:bg-white"
                }`}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          ) : (
            <p className={`text-sm font-medium ${textPrimary}`}>{value || "Not provided"}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-7xl max-h-[95vh] mx-auto rounded-xl shadow-2xl overflow-hidden transform transition-all duration-500 animate-in fade-in slide-in-from-bottom-4
        ${isDark ? "bg-[#1A1A1A] border border-white/10" : "bg-white border border-gray-200"}`}>

        {/* Premium Header */}
        <div className={`${glassHeader} p-8 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl opacity-50"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-5">
                <div className="p-4 rounded-2xl bg-primary/10 backdrop-blur-sm border border-primary/20">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className={`text-2xl font-bold ${textPrimary} mb-2 flex items-center gap-2`}>
                    Manage User
                    <Sparkles className="w-5 h-5 text-primary" />
                  </h2>
                  <div className="flex items-center gap-4">
                    <p className={`${textSecondary} font-medium text-lg`}>
                      {user.displayName}
                    </p>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${user.isActive
                        ? isDark ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-green-50 text-green-600 border-green-100"
                        : isDark ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-600 border-red-100"
                      }`}>
                      {user.isActive ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                      {user.isActive ? "ACTIVE" : "INACTIVE"}
                    </div>
                  </div>
                  <p className={`text-sm font-mono text-primary mt-2`}>({user.userId})</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className={`p-3 rounded-2xl transition-all duration-300 hover:scale-110 ${isDark
                    ? "bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
                  }`}
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Premium Tabs */}
        <div className={`p-6 ${glassHeader} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl opacity-40"></div>
          <div className="relative z-10 flex gap-3">
            {tabButton("overview", "Overview", Users)}
            {tabButton("campus", "Campus Access", Building2)}
            {tabButton("roles", "Roles", Shield)}
            {tabButton("superadmin", "Super Admin", Crown)}
          </div>
        </div>

        {/* Content */}
        <div className={`p-8 h-[calc(95vh-240px)] ${isDark
            ? 'scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent'
            : 'scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'
          }`}>

          {activeTab === "overview" && (
            <div className="grid grid-cols-12 h-full">
              {/* LEFT - USER DETAILS */}
              <div className="col-span-7 p-5 overflow-y-auto border-r border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-primary rounded-xl shadow-lg">
                    <Users className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`font-bold ${isDark ? 'text-primary' : 'text-primary'}`}>
                      User Details
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Manage user information and campus access
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <EditableField
                    icon={User}
                    label="Display Name"
                    value={user.displayName}
                    fieldKey="displayName"
                    color="purple"
                  />
                  <EditableField
                    icon={Mail}
                    label="Email Address"
                    value={user.email}
                    fieldKey="email"
                    color="blue"
                  />
                  <EditableField
                    icon={Phone}
                    label="Phone Number"
                    value={user.phone || "Not provided"}
                    fieldKey="phone"
                    color="green"
                  />
                  <div className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${isDark
                      ? 'bg-[#1E1E1E] border-white/10 hover:border-white/20'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}>
                    <div className="flex items-start gap-3">
                      <Shield className={`w-4 h-4 ${textSecondary} mt-0.5`} />
                      <div className="flex-1">
                        <p className={`text-xs font-medium uppercase tracking-wider ${textMuted} mb-1`}>Status</p>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border w-fit ${user.isActive
                            ? isDark ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-green-50 text-green-600 border-green-100"
                            : isDark ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-600 border-red-100"
                          }`}>
                          {user.isActive ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                          {user.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Edit/Save/Cancel Buttons */}
                  <div className="flex justify-start gap-3 pt-6 border-t border-gray-200 dark:border-gray-800 mt-6">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/25"
                      >
                        <Edit2 size={16} />
                        Edit Details
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleSave}
                          disabled={isLoading}
                          className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all duration-300 shadow-lg shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Save size={16} />
                          )}
                          {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={isLoading}
                          className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all duration-300 shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircle size={16} />
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT - CAMPUSES */}
              <div className="col-span-5 p-5 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-xl shadow-lg">
                      <Building2 className="size-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-primary">
                        Assigned Campuses
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Campuses this user has access to
                      </p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-xl ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                    <span className={`text-sm font-bold ${textPrimary}`}>
                      {userAssignedCampuses?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {userAssignedCampuses?.length > 0 ? (
                    userAssignedCampuses.map((campus) => (
                      <div
                        key={campus.campusId}
                        className={`group relative p-3 rounded-xl 
                          ${isDark ? 'bg-white/10 text-white border-white/10 hover:border-primary' : 'bg-white text-black border-gray-200 hover:border-primary'}
                          border-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Building2 className="size-4 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                              {campus.campusName}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="w-3 h-3 text-primary" />
                              <span className={`text-xs ${textSecondary}`}>ID: {campus.campusId}</span>
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs font-medium w-fit mt-2">
                              <CheckCircle size={8} />
                              Active
                            </div>
                          </div>
                          <ChevronRight className={`w-4 h-4 ${textSecondary} group-hover:text-primary transition-colors`} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`p-8 rounded-xl border text-center ${isDark
                        ? 'bg-[#1E1E1E] border-white/10'
                        : 'bg-white border-gray-200'
                      }`}>
                      <Building2 className={`w-12 h-12 mx-auto mb-4 ${textSecondary}`} />
                      <h4 className={`font-semibold ${textPrimary} mb-2`}>No Campuses Assigned</h4>
                      <p className={`text-sm ${textSecondary} mb-4`}>This user doesn't have access to any campuses yet.</p>
                      <button className="px-4 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all duration-300">
                        Assign Campus Access
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "campus" && (
            <CampusAccess
              user={user}
              refreshUsers={refreshUsers}
              onClose={onClose}
            />
          )}

          {activeTab === "roles" && (
            <AssignRolestostaff
              user={user}
              refreshUsers={refreshUsers}
              userAssignedCampuses={userAssignedCampuses}
            />
          )}

          {activeTab === "superadmin" && (
            <SuperAdminModal
              user={user}
              refreshUsers={refreshUsers}
              userAssignedCampuses={userAssignedCampuses}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default UserManagementModal_Backup;
