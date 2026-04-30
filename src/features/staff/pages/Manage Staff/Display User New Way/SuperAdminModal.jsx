import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  Building2,
  ChevronDown,
  Crown,
  UserMinus,
} from "lucide-react";
import {Toaster, toast } from "react-hot-toast";
import api from "../../../../../config/api";

const SuperAdminModal = ({ user, refreshUsers,userAssignedCampuses }) => {
  const themeMode = useSelector((state) => state.color.mode);
  const isDark = themeMode === "dark";

  const [selectedCampusId, setSelectedCampusId] = useState(null);
  const [loading, setLoading] = useState(false);

  const cardClass = `relative overflow-hidden group rounded-3xl border backdrop-blur-xl transition-all duration-700 ${isDark
    ? 'bg-[#1E1E1E] border-white/10 shadow-2xl'
    : 'bg-white border-gray-200/80 shadow-lg'
  }`;

  console.log("CampusId : ",selectedCampusId,"UserID : ",user.id);

   // --- Assign SUPER ADMIN  ---
    const assignSuperAdmin = async (user) => {
      try {
        await api.post(`/api/global-roles/super-admin/${user.id}`, {
          "campusIds": [
            selectedCampusId
          ]
        });
        console.log("Super Admin Assigned successfully");
        toast.success(`Super Admin Assigned successfully`);
  
        // Refresh users list
        refreshUsers();
  
      } catch (error) {
        console.error("Super admin action error:", error);
        toast.error(`Failed to Assign super admin`);
      }
    };
  
    // Remove Super Admin
    const removeSuperAdmin = async (user) => {
      try {
        if (!selectedCampusId) {
          toast.error("Please select a campus");
          return;
        }

        const remove = await api.delete(`/api/global-roles/super-admin`, {
          data: {
            "userId": user.id,
            "campusIds": [selectedCampusId]
          }
        });
        toast.success(`Super Admin Removed successfully`);
        console.log(remove);
        // Refresh users list
        refreshUsers();
  
      } catch (error) {
        console.error("Super admin action error:", error);
        toast.error(`Failed to remove super admin`);
      }
    };


  return (
   <>
  <div className="font-sans pb-10">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: isDark ? "#333" : "#fff",
            color: isDark ? "#fff" : "#333",
          },
        }}
      />
      <div className={`p-6 border-b ${isDark ? "border-white/5" : "border-gray-100"}`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className={`text-lg font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
              Super Admin Management
            </h3>
            <p className={`text-sm mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Manage super admin privileges for <span className="font-semibold">{user?.displayName || 'User'}</span>
            </p>
          </div>
          
        </div>
      </div>

      <div className="flex h-[60vh]">
        {/* LEFT – SELECT CAMPUS */}
        <div className="w-2/3 p-5 overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary rounded-xl shadow-lg">
              <Users className="size-5 text-white" />
            </div>
            <div>
              <h3 className={`text-primary font-bold`}>
                Select Campus
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <select
                value={selectedCampusId || ""}
                onChange={(e) => { setSelectedCampusId(e.target.value); }}
                className={`w-full px-4 py-3 pr-10 border-2 rounded-xl ${isDark ? 'bg-white/10 text-white border-white/10' : 'bg-white text-gray-900 border-gray-300'} font-medium transition-all duration-300 focus:outline-none appearance-none cursor-pointer hover:border-primary shadow-md`}
              >
                <option value="" disabled className={isDark ? "bg-black/80 text-gray-400" : "bg-white text-gray-500"}>
                  Choose a campus...
                </option>
                {userAssignedCampuses && userAssignedCampuses.map(campus => (
                  <option key={campus.campusId} value={campus.campusId} className={`py-2 ${isDark ? "bg-black/80 text-white" : "bg-white text-gray-900"}`}>
                    {campus.campusName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none" />
            </div>
            {selectedCampusId && (
              <div className="mt-2 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 text-sm text-primary dark:text-primary-300">
                  <Building2 className="size-4" />
                  <span className="font-medium">
                    {userAssignedCampuses.find(c => c.campusId == selectedCampusId)?.campusName || 'Campus'} selected
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT – ACTIONS */}
        <div className="w-1/3 border-l border-white/5 p-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary rounded-xl shadow-lg">
              <Crown className="size-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-primary">
                Actions
              </h3>
              <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Choose action to perform
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div
              className={`group relative p-3 rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer
                ${isDark ? 'bg-gray-800 text-white border-green-900 hover:border-green-500' : 'bg-white text-black border-green-300 hover:border-green-500'} 
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => !loading && assignSuperAdmin(user)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Crown className="size-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold">
                    Assign Super Admin
                  </h4>
                  <p className="text-xs">
                    Grant super admin privileges
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`group relative p-3 rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer
                ${isDark ? 'bg-white/10 text-white' : 'bg-white text-black'} 
                ${isDark ? 'border-red-800/40' : 'border-red-300/50'}  
                ${isDark ? 'hover:border-red-700' : 'hover:border-red-400'}
                ${loading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              onClick={() => !loading && removeSuperAdmin(user)}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500 rounded-lg">
                  <UserMinus className="size-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">
                    Revoke Super Admin
                  </h4>
                  <p className="text-xs">
                    Remove super admin privileges
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</>
  );
};

export default SuperAdminModal;
