import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Shield,
  Save,
  X,
  Loader2,
  CheckSquare,
  Square,
  ListChecks,
  Search,
  ChevronDown,
  Tag,
  ArrowLeft,
} from "lucide-react";
import api from "../../../../../config/api";
import { Toaster, toast } from "react-hot-toast";

const EditCampusRole = () => {
  const { campusId, id } = useParams();
  const navigate = useNavigate();
  const themeMode = useSelector((state) => state.color.mode);
  const isDark = themeMode === "dark";

  // --- STATE ---
  const [formData, setFormData] = useState({ code: "", name: "" });
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedModules, setExpandedModules] = useState([]);

  console.log(campusId, id);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [roleRes, masterPermsRes, rolePermsRes] = await Promise.all([
          api.get(`/api/campuses/${campusId}/roles/${id}`), // Fetch role details with permissions
          api.get("/api/permissions/grouped"), // Fetch full permission library
          api.get(`/api/campuses/${campusId}/roles/${id}/permissions`)
        ]);

        console.log(roleRes, masterPermsRes, rolePermsRes);

        // 1. Get role data from campus API (includes name, code, permissionIds)
        const currentRole = roleRes.data;
        if (currentRole) {
          setFormData({
            code: currentRole.code || "",
            name: currentRole.name || "",
          });
          // 2. Set selected permissions from role data
          // setSelectedPermissionIds(currentRole.permissionIds || []);

          const permissionIds = rolePermsRes.data.map((p) => p.id);
          setSelectedPermissionIds(permissionIds);
        }

        // 2. Flatten the Master Permissions Object into an Array
        const flatList = Object.values(masterPermsRes.data).flat();
        setAllPermissions(flatList);

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load role details.");
      } finally {
        setLoading(false);
      }
    };

    if (id && campusId) fetchInitialData();
  }, [id, campusId]);

  // --- COMPUTED: Grouping & Filtering ---
  const filteredPermissionsByModule = useMemo(() => {
    const grouped = allPermissions.reduce((acc, perm) => {
      let moduleName = perm.module || "OTHERS";
      if (moduleName === "ACDEMIC_SETUP") moduleName = "ACADEMIC_SETUP";

      if (!acc[moduleName]) acc[moduleName] = [];
      acc[moduleName].push(perm);
      return acc;
    }, {});

    if (!searchTerm.trim()) return grouped;

    const lowerTerm = searchTerm.toLowerCase();
    const filteredGrouped = {};
    Object.keys(grouped).forEach((module) => {
      const matches = grouped[module].filter(
        (p) =>
          p.code.toLowerCase().includes(lowerTerm) ||
          (p.description && p.description.toLowerCase().includes(lowerTerm))
      );
      if (matches.length > 0) filteredGrouped[module] = matches;
    });

    return filteredGrouped;
  }, [allPermissions, searchTerm]);

  const selectedPermissionsList = useMemo(() => {
    return allPermissions.filter((p) => selectedPermissionIds.includes(p.id));
  }, [allPermissions, selectedPermissionIds]);

  // --- HANDLERS ---
  const togglePermission = (pid) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(pid) ? prev.filter((id) => id !== pid) : [...prev, pid]
    );
  };

  const toggleModulePermissions = (modulePerms) => {
    const ids = modulePerms.map((p) => p.id);
    const allSelected = ids.every((id) => selectedPermissionIds.includes(id));
    if (allSelected) {
      setSelectedPermissionIds((prev) =>
        prev.filter((id) => !ids.includes(id))
      );
    } else {
      setSelectedPermissionIds((prev) => [...new Set([...prev, ...ids])]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Role Name is required");
    if (selectedPermissionIds.length === 0)
      return toast.error("Select at least one permission");

    setSubmitting(true);
    try {
      // Debug: Check data before sending
      console.log("Updating role with data:", {
        code: formData.code,
        name: formData.name,
        permissionIds: selectedPermissionIds,
      });
      console.log("API endpoint:", `/api/campuses/${campusId}/roles/${id}`);

      // http://localhost:8080/api/campuses/{Campus-id}/roles/{Campus-role-id}
      const response = await api.put(`/api/campuses/${campusId}/roles/${id}`, {
        code: formData.code,
        name: formData.name,
        permissionIds: selectedPermissionIds,
      });

      console.log("Update response:", response);
      toast.success("Role updated successfully!");
      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      console.error("Update error details:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || error.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  // --- STYLES ---
  const cardClass = `rounded-2xl shadow-sm border transition-all  
  ${isDark
      ? "bg-[#1A1A1A] border-white/10 text-white hover:bg-[#242424]"
      : "bg-white border-gray-200 text-gray-800 hover:border-gray-300"
    }`;
  const inputClass = `w-full px-4 py-3 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${isDark
    ? "bg-[#242424] border-white/10 text-gray-200"
    : "bg-gray-50 border-gray-200 text-gray-800"
    }`;

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center py-40 gap-4">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className={isDark ? "text-gray-400" : "text-gray-500"}>
          Loading Role Config...
        </p>
      </div>
    );

  return (
    <div className="font-sans pb-10">
      <Toaster position="top-right" />

      {/* Header - Now shows Name instead of ID */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-1 text-sm mb-2 hover:opacity-75 transition-opacity ${isDark ? "text-gray-400" : "text-gray-500"
              }`}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1
            className={`text-2xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-800"
              }`}
          >
            <Shield className="text-primary" size={28} />
            Edit Role:{" "}
            <span className="text-primary capitalize">
              {formData.name || `Role #${id}`}
            </span>
          </h1>
          <p
            className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-400"
              }`}
          >
            System Code: <span className="font-mono">{formData.code}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Identity Card */}
        <div className={cardClass}>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2 text-gray-500">
                Internal Code
              </label>
              <input
                type="text"
                value={formData.code}
                className={`${inputClass} opacity-60 cursor-not-allowed`}
                disabled
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide mb-2 text-gray-500">
                Display Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={inputClass}
                required
              />
            </div>
          </div>
        </div>

        {/* Selected Tags Preview */}
        {selectedPermissionIds.length > 0 && (
          <div className={cardClass}>
            <div className="p-4 border-b flex justify-between items-center">
              <span className="text-sm font-bold flex items-center gap-2">
                <Tag size={16} className="text-primary" /> Assigned (
                {selectedPermissionIds.length})
              </span>
              <button
                type="button"
                onClick={() => setSelectedPermissionIds([])}
                className="text-xs text-red-500 font-bold hover:underline"
              >
                Unselect All
              </button>
            </div>
            <div className="p-4 flex flex-wrap gap-2 max-h-36 overflow-y-auto">
              {selectedPermissionsList.map((p) => (
                <span
                  key={p.id}
                  className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold flex items-center gap-2"
                >
                  {p.code}
                  <X
                    size={12}
                    className="cursor-pointer"
                    onClick={() => togglePermission(p.id)}
                  />
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Permissions Library */}
        <div className={cardClass}>
          <div className="p-5 border-b flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="font-bold flex items-center gap-2">
              <ListChecks className="text-primary" /> Permissions Library
            </h2>
            <div className="relative w-full md:w-80">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? "text-gray-500" : "text-gray-400"}`}
                size={16}
              />
              <input
                type="text"
                placeholder="Filter permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${isDark
                  ? "bg-white/5 border-white/10 text-gray-200 focus:bg-[#242424]"
                  : "bg-gray-50 border-gray-200 text-gray-800 focus:bg-white"
                  }`}
              />
            </div>
          </div>

          {/* Permissions List view */}
          <div className="p-6 space-y-4">
            {Object.keys(filteredPermissionsByModule).map((module) => {
              const perms = filteredPermissionsByModule[module];
              const isExpanded =
                expandedModules.includes(module) || searchTerm.length > 0;
              const allSel = perms.every((p) =>
                selectedPermissionIds.includes(p.id)
              );

              return (
                <div
                  key={module}
                  className={`border rounded-xl overflow-hidden transition-all ${isDark
                      ? "border-white/5 bg-white/[0.02]"
                      : "border-gray-100 bg-gray-50/50"
                    }`}
                >
                  <div
                    className={`p-4 flex items-center justify-between ${isDark ? "bg-white/5" : "bg-gray-50/50"}`}
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer select-none"
                      onClick={() =>
                        setExpandedModules((prev) =>
                          prev.includes(module)
                            ? prev.filter((m) => m !== module)
                            : [...prev, module]
                        )
                      }
                    >
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""
                          }`}
                      />
                      <span className="text-xs font-bold uppercase tracking-widest">
                        {module}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleModulePermissions(perms)}
                      className="text-[10px] font-bold text-primary border border-primary/20 px-3 py-1 rounded-lg hover:bg-primary hover:text-white transition-all"
                    >
                      {allSel ? "Deselect Group" : "Select Group"}
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {perms.map((p) => {
                        const isChecked = selectedPermissionIds.includes(p.id);
                        return (
                          <div
                            key={p.id}
                            onClick={() => togglePermission(p.id)}
                            className={`p-3 border rounded-lg cursor-pointer flex gap-3 transition-all ${isChecked
                              ? "border-primary bg-primary/5 shadow-sm shadow-primary/10"
                              : isDark
                                ? "border-transparent bg-white/5"
                                : "border-transparent bg-gray-50"
                              }`}
                          >
                            {isChecked ? (
                              <CheckSquare
                                size={18}
                                className="text-primary shrink-0"
                              />
                            ) : (
                              <Square
                                size={18}
                                className="text-gray-400 shrink-0"
                              />
                            )}
                            <div className="min-w-0">
                              <p
                                className={`text-sm font-bold truncate ${isChecked ? "text-primary" : ""
                                  }`}
                              >
                                {p.code}
                              </p>
                              <p className="text-[10px] text-gray-500 truncate">
                                {p.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Footer */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 text-sm font-bold"
          >
            Discard
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-white px-10 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <Save size={18} />
            )}
            Update Role
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCampusRole;
