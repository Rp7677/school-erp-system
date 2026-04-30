import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Save,
  X,
  Loader2,
  CheckSquare,
  Square,
  LayoutGrid,
  ListChecks,
  Search,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Trash2,
  Tag,
  ArrowLeft,
  Plus,
  Eye,
} from "lucide-react";
import api from "../../../../../config/api"; // Your Axios instance
import { Toaster, toast } from "react-hot-toast";

const CreateCampusRole = () => {
  const themeMode = useSelector((state) => state.color.mode);
  const isDark = themeMode === "dark";
  const navigate = useNavigate();

  //fetch campuses from campus slice[REDUX]
  const { campuses, selectedCampus, superAdmin } = useSelector((state) => state.campus);

  // --- STATE ---
  const [selectedCampusId, setSelectedCampusId] = useState();
  const [formData, setFormData] = useState({ code: "", name: "" });
  const [allPermissions, setAllPermissions] = useState([]); // Stores flat list
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);

  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Search & Accordion State
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedModules, setExpandedModules] = useState([]);


  // --- FETCH PERMISSIONS (REAL API) ---
  useEffect(() => {
    const fetchPermissions = async () => {
      setLoadingPermissions(true);
      try {
        // Fetch permissions from your API
        const response = await api.get("/api/permissions/grouped"); // Adjust endpoint as needed

        let rawData = response.data;
        let flatList = [];

        // Handle if API returns Array or Object
        if (Array.isArray(rawData)) {
          flatList = rawData;
        } else if (typeof rawData === "object") {
          // If grouped by module { "Module": [...] }, flatten it
          flatList = Object.values(rawData).flat();
        }

        setAllPermissions(flatList);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        toast.error("Failed to load permissions list.");
      } finally {
        setLoadingPermissions(false);
      }
    };

    fetchPermissions();
  }, []);

  // --- COMPUTED: Selected Objects (For Preview) ---
  const selectedPermissionsList = useMemo(() => {
    return allPermissions.filter((p) => selectedPermissionIds.includes(p.id));
  }, [allPermissions, selectedPermissionIds]);

  // --- FILTERING LOGIC (SEARCH) ---
  const filteredPermissionsByModule = useMemo(() => {
    const grouped = {};

    // 1. Group all permissions first
    const allGrouped = allPermissions.reduce((acc, perm) => {
      const moduleName = perm.module || "OTHERS";
      if (!acc[moduleName]) acc[moduleName] = [];
      acc[moduleName].push(perm);
      return acc;
    }, {});

    // 2. Filter based on Search Term
    if (!searchTerm.trim()) return allGrouped;

    const lowerTerm = searchTerm.toLowerCase();

    Object.keys(allGrouped).forEach((moduleName) => {
      const perms = allGrouped[moduleName];

      // Check if module name matches
      const moduleMatch = moduleName.toLowerCase().includes(lowerTerm);

      // Filter specific permissions matching code or description
      const matchingPerms = perms.filter(
        (p) =>
          (p.code && p.code.toLowerCase().includes(lowerTerm)) ||
          (p.description && p.description.toLowerCase().includes(lowerTerm))
      );

      if (moduleMatch) {
        grouped[moduleName] = perms;
      } else if (matchingPerms.length > 0) {
        grouped[moduleName] = matchingPerms;
      }
    });

    return grouped;
  }, [allPermissions, searchTerm]);

  // --- AUTO EXPAND ON SEARCH ---
  useEffect(() => {
    if (searchTerm.trim()) {
      setExpandedModules(Object.keys(filteredPermissionsByModule));
    }
  }, [searchTerm, filteredPermissionsByModule]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePermission = (id) => {
    setSelectedPermissionIds((prev) => {
      if (prev.includes(id)) return prev.filter((pid) => pid !== id);
      return [...prev, id];
    });
  };

  const toggleModulePermissions = (moduleName, permsInModule) => {
    const moduleIds = permsInModule.map((p) => p.id);
    const allSelected = moduleIds.every((id) =>
      selectedPermissionIds.includes(id)
    );

    if (allSelected) {
      setSelectedPermissionIds((prev) =>
        prev.filter((id) => !moduleIds.includes(id))
      );
    } else {
      setSelectedPermissionIds((prev) => [...new Set([...prev, ...moduleIds])]);
    }
  };

  const toggleGlobalSelect = () => {
    if (selectedPermissionIds.length === allPermissions.length) {
      setSelectedPermissionIds([]);
    } else {
      setSelectedPermissionIds(allPermissions.map((p) => p.id));
    }
  };

  // Accordion Handlers
  const toggleAccordion = (moduleName) => {
    setExpandedModules((prev) =>
      prev.includes(moduleName)
        ? prev.filter((m) => m !== moduleName)
        : [...prev, moduleName]
    );
  };

  const expandAll = () =>
    setExpandedModules(Object.keys(filteredPermissionsByModule));
  const collapseAll = () => setExpandedModules([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      toast.error("Please fill in Code and Name");
      return;
    }
    if (selectedPermissionIds.length === 0) {
      toast.error("Please select at least one permission");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        code: formData.code.toUpperCase(),
        name: formData.name,
        permissionIds: selectedPermissionIds,
      };

      await api.post(`/api/campuses/${selectedCampusId}/roles`, payload);
      toast.success("Campus Role created successfully!");
      setFormData({ code: "", name: "" });
      setSelectedPermissionIds([]);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || "Failed to create role";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // --- STYLES ---
  const cardClass = `rounded-2xl shadow-sm border transition-all ${isDark ? "bg-[#1A1A1A] border-white/5" : "bg-white border-gray-100"
    }`;

  const inputClass = `w-full pl-4 pr-4 py-3 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${isDark
    ? "bg-[#1A1A1A] border-white/10 text-gray-200 focus:bg-[#242424]"
    : "bg-gray-50 border-gray-200 text-gray-800 focus:bg-white"
    }`;

  const labelClass = `block text-xs font-bold uppercase tracking-wide mb-2 ${isDark ? "text-gray-400" : "text-gray-700"
    }`;


  // fecthing Campus Name on select dropdown campus Id
  const CampusID = campuses.find(
    (campus) => campus.campusId === selectedCampusId
  );

  const selectedCampusName = CampusID?.campusName; 
  console.log("Selected Campus Name:", selectedCampusName);

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

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        {/* <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-1 text-sm mb-2 transition-colors ${isDark
            ? "text-gray-400 hover:text-white"
            : "text-gray-500 hover:text-gray-800"
            }`}
        >
          <ArrowLeft size={16} /> Back
        </button> */}
        <div className="grid grid-cols-12">
          <div className="col-span-10">
            <h1
              className={`text-2xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-gray-800"
                }`}
            >
              <Shield className="text-primary" size={28} />
              Create New Campus Role
            </h1>
          </div>
          <div className="col-span-2 flex justify-end">
            <button
              onClick={() => navigate('/staff/campusroles/viewcampusroles')}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Eye size={18} />
              <span className="hidden sm:inline">View Campus Roles</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Basic Details */}
        <div className={cardClass}>

          {/* dropdown for selecting campus */}
          <div className="p-4">
            <div className="relative w-full">
              {/*Role Info  */}
              <div
                className={`p-2 mb-5 border-b ${isDark ? "border-white/5" : "border-gray-100"
                  }`}
              >
                <h2
                  className={`text-lg font-bold ${isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                >
                  Select Campus to Create Role
                </h2>
              </div>
              {/* Select */}
              <div className="relative w-full">
                {/* Select */}
                <select
                  value={selectedCampusId}
                  onChange={(e) => { setSelectedCampusId(Number(e.target.value)) }}
                  className={`w-full appearance-none px-5 py-4 pr-12 rounded-2xl border shadow-sm transition-all duration-300 text-sm font-medium
                    focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                    ${isDark
                      ? "bg-[#1A1A1A] border-white/10 text-white hover:bg-[#242424]"
                      : "bg-white border-gray-200 text-gray-800 hover:border-gray-300"
                    }`}
                >
                  <option value="">Select Campus</option>
                  {campuses?.map((campus) => (
                    <option key={campus.campusId} value={campus.campusId} className="hover:bg-primary">
                      {campus.campusName}
                    </option>
                  ))}
                </select>
                {/* Custom Dropdown Arrow */}
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <ChevronDown 
                    size={20} 
                    className={isDark ? "text-gray-400" : "text-gray-500"} 
                  />
                </div>
              </div>

              </div>
            {/* <div className="flex w-full grid grid-cols-12 p-8 bg-primary">
              <p className="col-span-6">selectedCampus  :   {selectedCampusId}</p>
              <p className="col-span-6">
                Current Selected Campus   :   {selectedCampusName || "None"}
              </p>
            </div> */}
          </div>

          {/*Role Info  */}
          <div
            className={`p-5 border-b ${isDark ? "border-white/5" : "border-gray-100"
              }`}
          >
            <h2
              className={`text-lg font-bold ${isDark ? "text-gray-200" : "text-gray-800"
                }`}
            >
              Role Information
            </h2>
          </div>

          {/* Role code and Role Name */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>
                Role Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="e.g. TECHNICIAN"
                className={inputClass}
                required
              />
              <p className="text-[11px] text-gray-500 mt-1.5">
                Unique identifier (UPPERCASE recommended).
              </p>
            </div>
            <div>
              <label className={labelClass}>
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. Role for Technical Activity"
                className={inputClass}
                required
              />
            </div>
          </div>
        </div>

        {/* --- NEW SECTION: Selected Permissions Preview --- */}
        {selectedPermissionsList.length > 0 && (
          <div
            className={`${cardClass} animate-in fade-in slide-in-from-top-4 duration-300`}
          >
            <div
              className={`px-5 py-4 border-b flex justify-between items-center ${isDark ? "border-white/5" : "border-gray-100"
                }`}
            >
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-primary" />
                <h2
                  className={`text-base font-bold ${isDark ? "text-gray-200" : "text-gray-800"
                    }`}
                >
                  Selected Permissions Preview
                </h2>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark
                    ? "bg-primary/20 text-primary"
                    : "bg-primary/10 text-primary"
                    }`}
                >
                  {selectedPermissionsList.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPermissionIds([])}
                className="text-xs text-red-400 hover:text-red-500 flex items-center gap-1 font-medium transition-colors"
              >
                <Trash2 size={12} /> Clear All
              </button>
            </div>
            <div className="p-5">
              <div className="flex flex-wrap gap-2">
                {selectedPermissionsList.map((perm) => (
                  <div
                    key={perm.id}
                    className={`group inline-flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg text-xs font-medium border transition-all ${isDark
                      ? "bg-white/5 border-white/10 text-gray-300 hover:border-red-500/50"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:border-red-300"
                      }`}
                  >
                    <span>{perm.code}</span>
                    <button
                      type="button"
                      onClick={() => togglePermission(perm.id)}
                      className={`p-0.5 rounded-md transition-colors ${isDark
                        ? "text-gray-500 hover:bg-red-500/20 hover:text-red-400"
                        : "text-gray-400 hover:bg-red-100 hover:text-red-500"
                        }`}
                      title="Remove"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. Permissions Selector with Accordion & Search */}
        <div className={cardClass}>
          {/* Toolbar */}
          <div
            className={`p-5 border-b flex flex-col md:flex-row gap-4 justify-between items-center ${isDark ? "border-white/5" : "border-gray-100"
              }`}
          >
            <div className="flex items-center gap-2">
              <ListChecks size={20} className="text-primary" />
              <h2
                className={`text-lg font-bold ${isDark ? "text-gray-200" : "text-gray-800"
                  }`}
              >
                Permissions Library
              </h2>
            </div>

            {/* Search & Actions */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search Input */}
              <div className="relative w-full sm:w-64">
                <Search
                  className={`absolute left-3 top-2.5 ${isDark ? "text-gray-500" : "text-gray-400"
                    }`}
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search permissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-primary/20 ${isDark
                    ? "bg-white/5 border-white/10 text-gray-200 focus:bg-[#242424]"
                    : "bg-gray-50 border-gray-200 text-gray-800 focus:bg-white"
                    }`}
                />
              </div>

              {/* Expand/Collapse Controls */}
              {!loadingPermissions && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={toggleGlobalSelect}
                    title="Select All"
                    className={`p-2 rounded-lg border transition-colors ${isDark
                      ? "border-white/10 hover:bg-white/5"
                      : "border-gray-200 hover:bg-gray-50"
                      }`}
                  >
                    {selectedPermissionIds.length === allPermissions.length &&
                      allPermissions.length > 0 ? (
                      <CheckSquare size={18} className="text-primary" />
                    ) : (
                      <Square size={18} className="text-gray-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={expandAll}
                    title="Expand All"
                    className={`p-2 rounded-lg border transition-colors ${isDark
                      ? "border-white/10 hover:bg-white/5 text-gray-400"
                      : "border-gray-200 hover:bg-gray-50 text-gray-600"
                      }`}
                  >
                    <Maximize2 size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={collapseAll}
                    title="Collapse All"
                    className={`p-2 rounded-lg border transition-colors ${isDark
                      ? "border-white/10 hover:bg-white/5 text-gray-400"
                      : "border-gray-200 hover:bg-gray-50 text-gray-600"
                      }`}
                  >
                    <Minimize2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {loadingPermissions ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : Object.keys(filteredPermissionsByModule).length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                No permissions found matching "{searchTerm}"
              </div>
            ) : (
              <div className="space-y-4">
                {Object.keys(filteredPermissionsByModule).map((moduleName) => {
                  const modulePerms = filteredPermissionsByModule[moduleName];
                  const allInModuleSelected = modulePerms.every((p) =>
                    selectedPermissionIds.includes(p.id)
                  );
                  const isExpanded = expandedModules.includes(moduleName);

                  return (
                    <div
                      key={moduleName}
                      className={`rounded-xl border overflow-hidden transition-all ${isDark
                        ? "border-white/5 bg-white/[0.02]"
                        : "border-gray-100 bg-gray-50/50"
                        }`}
                    >
                      {/* Accordion Header */}
                      <div
                        className={`px-4 py-3 flex items-center justify-between cursor-pointer select-none transition-colors ${isExpanded
                          ? isDark
                            ? "bg-white/5"
                            : "bg-white shadow-sm"
                          : "hover:opacity-80"
                          }`}
                        onClick={() => toggleAccordion(moduleName)}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-1 rounded-md transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
                              }`}
                          >
                            <ChevronDown size={18} className="text-gray-400" />
                          </div>
                          <h3
                            className={`font-bold text-sm tracking-wider flex items-center gap-2 ${isDark ? "text-gray-200" : "text-gray-700"
                              }`}
                          >
                            <LayoutGrid
                              size={16}
                              className="text-primary opacity-80"
                            />
                            {moduleName}
                            <span
                              className={`ml-2 text-[10px] px-2 py-0.5 rounded-full ${isDark
                                ? "bg-white/10 text-gray-400"
                                : "bg-gray-200 text-gray-600"
                                }`}
                            >
                              {modulePerms.length}
                            </span>
                          </h3>
                        </div>

                        <div
                          className="flex items-center gap-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              toggleModulePermissions(moduleName, modulePerms)
                            }
                            className={`text-xs font-bold px-3 py-1.5 rounded-md transition-colors border ${allInModuleSelected
                              ? isDark
                                ? "bg-primary/20 text-primary border-primary/30"
                                : "bg-blue-100 text-primary border-blue-200"
                              : isDark
                                ? "border-white/10 text-gray-400 hover:text-white"
                                : "border-gray-200 text-gray-500 hover:text-gray-800"
                              }`}
                          >
                            {allInModuleSelected
                              ? "Unselect Group"
                              : "Select Group"}
                          </button>
                        </div>
                      </div>

                      {/* Accordion Body */}
                      {isExpanded && (
                        <div
                          className={`p-4 border-t ${isDark ? "border-white/5" : "border-gray-100"
                            }`}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {modulePerms.map((perm) => {
                              const isSelected = selectedPermissionIds.includes(
                                perm.id
                              );
                              return (
                                <div
                                  key={perm.id}
                                  onClick={() => togglePermission(perm.id)}
                                  className={`cursor-pointer p-3 rounded-lg border transition-all flex items-start gap-3 select-none group ${isSelected
                                    ? isDark
                                      ? "bg-primary/20 border-primary/50"
                                      : "bg-blue-50 border-blue-200"
                                    : isDark
                                      ? "bg-[#1A1A1A] border-white/5 hover:border-white/20"
                                      : "bg-white border-gray-200 hover:border-primary/30"
                                    }`}
                                >
                                  <div
                                    className={`mt-0.5 transition-colors ${isSelected
                                      ? "text-primary"
                                      : "text-gray-400 group-hover:text-primary/70"
                                      }`}
                                  >
                                    {isSelected ? (
                                      <CheckSquare size={18} />
                                    ) : (
                                      <Square size={18} />
                                    )}
                                  </div>
                                  <div>
                                    <p
                                      className={`text-sm font-semibold ${isDark
                                        ? "text-gray-200"
                                        : "text-gray-800"
                                        }`}
                                    >
                                      {perm.code}
                                    </p>
                                    <p
                                      className={`text-xs mt-0.5 ${isDark
                                        ? "text-gray-500"
                                        : "text-gray-500"
                                        }`}
                                    >
                                      {perm.description || "No description"}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 ${isDark
              ? "bg-white/5 text-gray-400 hover:bg-white/10"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            <X size={16} /> Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-lg text-sm font-bold text-white bg-primary hover:brightness-95 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Creating...
              </>
            ) : (
              <>
                <Save size={16} /> Create Role
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCampusRole;
