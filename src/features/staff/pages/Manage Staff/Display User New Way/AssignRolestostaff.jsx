import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Users,
  Search,
  MapPin,
  Building2,
  Mail,
  Phone,
  Calendar,
  Shield,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Plus,
  Filter,
  ChevronDown,
  UserPlus,
  Briefcase,
  GraduationCap,
  Award,
  Clock,
  Check,
  X,
  Loader2,
  MoreVertical,
  Eye,
  EyeOff,
  Sparkles,
  ArrowLeft,
  List,
  LayoutGrid,
  Crown,
  UserMinus,
  NutIcon,
  Building2Icon,
  CheckCircle,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import AutoBreadcrumb from "../../../../../components/common/AutoBreadcrumb";
import api from "../../../../../config/api";
import { data } from "react-router-dom";

const AdminStaffManagement = ({ user, refreshUsers, userAssignedCampuses }) => {

  const [roles, setRoles] = useState([]);
  // const [campuses, setCampuses] = useState([]);
  // const [users, setUsers] = useState([]);
  const [selectedCampusId, setSelectedCampusId] = useState(null);
  // const [openPopup, setOpenPopup] = useState(false);
  // const [userId, setUserId] = useState(null);
  const [assignRole, setAssignRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  // const [viewType, setViewType] = useState("table");

  // ISADMIN Context
  const isAdmin = useSelector((state) => state.campus);
  const superAdmin = isAdmin.superAdmin;
  console.log(superAdmin);

  // --- THEME STATE ---
  const themeMode = useSelector((state) => state.color.mode);
  const isDark = themeMode === "dark";

  // --- STYLES ---  
  const cardClass = `rounded-2xl shadow-sm border transition-all ${isDark ? "bg-[#1A1A1A] border-white/5" : "bg-white border-gray-100"
    }`;

  const searchInputClass = `w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${isDark ? "bg-[#1A1A1A] border-white/10 text-gray-200 focus:bg-[#242424]" : "bg-white border-gray-200 text-gray-800 focus:bg-white"
    }`;

  // Filter users based on search term
  // const filteredUsers = users.filter(user => {
  //   return user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //     user.id?.toString().includes(searchTerm.toLowerCase());
  // });

  const getRoleIcon = (role) => {
    switch (role) {
      case 'super_admin':
        return <Shield className="size-4" />;
      case 'campus_admin':
        return <Building2 className="size-4" />;
      case 'academic_admin':
        return <GraduationCap className="size-4" />;
      case 'staff_admin':
        return <Briefcase className="size-4" />;
      default:
        return <Users className="size-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'super_admin':
        return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
      case 'campus_admin':
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
      case 'academic_admin':
        return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300";
      case 'staff_admin':
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  //Fetch all Users/staff
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get('/api/system-users');
      console.log(response.data);
      setUsers(response.data);
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch data');
    } finally {
      setLoadingUsers(false);
    }
  }

  //Fetch User Assigned campuses
  // const fetchUserCampuses = async (userId) => {
  //   try {
  //     //http://localhost:8080/api/user-campus-access/{user-Id}
  //     const campusesRes = await api.get(`api/user-campus-access/${userId}`);
  //     console.log(campusesRes.data);
  //     setCampuses(campusesRes.data);
  //   } catch (error) {
  //     console.log(error);
  //     toast.error('Failed to fetch user campuses');
  //   }
  // }

  // Fetch roles for specific campus
  const handleAssignRole = async (campusId) => {
    try {
      const response = await api.get(`/api/campuses/${campusId}/roles`);
      console.log(response.data);
      setRoles(response.data);
    } catch (error) {
      console.log(error);
      toast.error('Failed to fetch campus roles');
    }
  };

  // Assign Roles to Users/staff
  const assignRoles = async (userId, campusId, roleId) => {
    try {
      const response = await api.post(`/api/users/${userId}/roles`,
        {
          campusId: Number(campusId),
          roleId: Number(roleId)
        }
      );
      
      console.log(response.data);
      toast.success('Role assigned successfully');

      //refresh Users 
      refreshUsers();
    } catch (error) {
      console.log(error);
      toast.error('Failed to assign role');
    }
  }

  //Delete assigned role
  // const deleteAssignRole = async (userId, campusId, roleId) => {
  //   try {
  //     const response = await api.delete(`/api/users/${userId}/roles`, {
  //       data: {
  //         campusId: Number(campusId),
  //         roleId: Number(roleId)
  //       }
  //     });
  //     console.log(data);

  //     console.log(response.data);
  //     toast.success('Role deleted successfully');
  //     fetchUsers(); // refresh user list
  //   } catch (error) {
  //     console.log(error);
  //     toast.error('Failed to delete role');
  //   }
  // }

  return (
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

      {/* System Users Display */}
      <div className={`h-full border-b ${isDark ? "border-white/5" : "border-gray-100"}`}>



        <div className="flex">
          {/* LEFT – SELECT CAMPUS */}
          <div className="w-2/3">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className={`text-lg font-bold ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                  Assign Roles to Users
                </h3>
                <p className={`text-sm mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  Select Campus and Role to assign to selected User
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary rounded-xl shadow-lg">
                <Users className="size-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-primary">
                  Select Campus
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <select
                  value={selectedCampusId || ""}
                  onChange={(e) => {
                    setSelectedCampusId(e.target.value);
                    handleAssignRole(e.target.value);
                  }}
                  className={`w-11/12 px-4 py-3 pr-10 border-2 rounded-xl 
                    ${isDark ? 'bg-white/20 text-white border-white/10' : 'bg-white text-gray-900 border-gray-300'}
                      font-medium transition-all duration-300 focus:outline-none
                        appearance-none cursor-pointer
                        hover:border-primary shadow-md`}
                >
                  <option value="" disabled className={isDark ? "bg-black/80 text-white" : "bg-white text-gray-500"}>
                    Choose a campus...
                  </option>
                  {userAssignedCampuses.map((campus) => (
                    <option key={campus.campusId} value={campus.campusId} className={`py-2 ${isDark ? "bg-black/80 text-white" : "bg-white text-gray-900"}`}>
                      {campus.campusName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-20 top-1/2 -translate-y-1/2 size-5 text-gray-400 pointer-events-none" />
              </div>
              {selectedCampusId && (
                <div className="w-11/12 mt-2 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20">
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

          {/* RIGHT – ROLES */}
          <div className="w-1/3 border-l-2 border-gray-200 dark:border-gray-800 p-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary rounded-xl shadow-lg">
                <Building2 className="size-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-primary">
                  Roles
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Select Role to assign to selected User
                </p>
              </div>
            </div>

            <div className="space-y-3  h-[200px] overflow-y-auto">
              {roles ? roles.map((role) => (
                <div
                  key={role.id}
                  className={`group relative p-3 rounded-xl
                    ${isDark ? 'bg-white/10 text-white border-white/10 hover:border-primary' : 'bg-white text-black border-gray-200 hover:border-primary'}
                    border-2 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="role"
                      checked={assignRole === role.id}
                      onChange={() => setAssignRole(role.id)}
                      className={`w-4 h-4 rounded  text-primary focus:ring-primary focus:ring-2`}
                    />
                    <div className="flex-1">
                      <h4 className={`font-bold text-sm ${isDark ? "text-white" : "text-gray-900"}`}>
                        {role.name}
                      </h4>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        {role.code}
                      </p>
                    </div>
                  </div>
                </div>
              )) : (
                <p>Loading ....</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-800">
          <div className="flex justify-end gap-3">

            <button
              onClick={async () => {
                if (!user.id || !selectedCampusId || !assignRole) {
                  toast.error("Select campus and role");
                  return;
                }

                await assignRoles(user.id, selectedCampusId, assignRole);
                console.log("UserId", user.id, "Selected Campus ID", selectedCampusId, "Role Id", assignRole);
                await fetchUsers();
                setAssignRole(null);
              }}
              disabled={!user.id || !selectedCampusId || !assignRole}
              className="bg-primary text-white rounded-lg shadow-xl px-6 py-3 hover:bg-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Assign Role
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminStaffManagement;
