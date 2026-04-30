// import React, { useState, useMemo, useEffect } from "react";
// import { NavLink } from "react-router-dom";
// import {
//   LayoutDashboard,
//   BookOpen,
//   Layers,
//   ChevronDown,
//   Palette,
//   Settings,
//   X,
//   Sun,
//   Moon,
//   Search,
//   Lock,
//   University,
//   Star,
//   ChevronsLeft, // Imported for toggle
//   ChevronsRight, // Imported for toggle
//   IndianRupee,
//   StarOffIcon
// } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { changeColor, setThemeMode } from "../../../hooks/colorSlice";
// import { useNavigate } from "react-router-dom";
// import { openTab } from "../../../hooks/tabsSlice";

// const Sidebar = ({ isOpen, onClose }) => {
//   const dispatch = useDispatch();
//   const themeMode = useSelector((state) => state.color.mode);

//   const navigate = useNavigate();

//   // --- STATE ---
//   const [activeMenu, setActiveMenu] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");

//   // 1. COLLAPSE STATE (Persisted in LocalStorage)
//   const [isCollapsed, setIsCollapsed] = useState(() => {
//     try {
//       const saved = localStorage.getItem("sidebarCollapsed");
//       return saved ? JSON.parse(saved) : false;
//     } catch (e) {
//       return false;
//     }
//   });

//   // 2. SHORTCUT STATE (Persisted in LocalStorage)
//   const [shortcuts, setShortcuts] = useState(() => {
//     try {
//       const saved = localStorage.getItem("sidebarShortcuts");
//       return saved ? JSON.parse(saved) : [];
//     } catch (e) {
//       return [];
//     }
//   });

//   // Save states to LocalStorage
//   useEffect(() => {
//     localStorage.setItem("sidebarShortcuts", JSON.stringify(shortcuts));
//   }, [shortcuts]);

//   useEffect(() => {
//     localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
//   }, [isCollapsed]);

//   const isDark = themeMode === "dark";
//   const sidebarBg = isDark ? "#121212" : "#FDFBF7";
//   const textColor = isDark ? "#F5F5F5" : "#1A1A1A";
//   const lineStroke = isDark ? "rgba(255,255,255,0.1)" : "rgba(26,26,26,0.08)";
//   const inputBg = isDark ? "bg-[#1A1A1A]" : "bg-white";
//   const inputBorder = isDark ? "border-gray-800" : "border-gray-200";

//   //for campus check
//   const { superAdmin } = useSelector((state) => state.campus);
//   //for permission check
//   const { permissions } = useSelector((state) => state.permissions);

//   const hasPermission = (perm) => {
//     if (superAdmin) return true; // super admin sees everything
//     return permissions?.includes(perm);
//   };

//   // --- MENU CONFIG ---
//   const MENU_CONFIG = useMemo(
//     () => [
//       { type: "header", label: "Main Menu" },
//       {
//         type: "link",
//         label: "Dashboard",
//         to: "/staff/dashboard",
//         icon: <LayoutDashboard />,
//         show: superAdmin,
//       },
//       {
//         type: "link",
//         label: "Admin Dashboard",
//         to: "/staff/admindashboard",
//         icon: <LayoutDashboard />,
//         show: superAdmin,
//       },
//       {
//         type: "link",
//         label: "Staff Dashboard",
//         to: "/staff/staffdashboard",
//         icon: <LayoutDashboard />,
//         show: !superAdmin,
//       },
//       {
//         type: "dropdown",
//         label: "Campuses",
//         id: "Campuses",
//         icon: <University />,
//         show: hasPermission("CAMPUS_VIEW"),
//         children: [
//           { label: "Create Campuses", to: "/staff/campus/create-campus", show: hasPermission("CAMPUS_VIEW") },
//         ],
//       },
//       {
//         type: "dropdown",
//         label: "Staff Management",
//         id: "DisplayStaff",
//         icon: <StarOffIcon />,
//         show: hasPermission("STAFF_VIEW"),
//         children: [
//           { label: "Display Users", to: "/staff/managestaff/displaystaff"},
//           { label: "Display Users New", to: "/staff/managestaff/displaystaff2"},
//           // { label: "Create Staff", to: "/staff/managestaff/createstaff"},
//           // { label: "Assign Roles to Staff", to: "/staff/managestaff/assignrolestostaff"},
//           // { label: "Campus Access", to: "/staff/managestaff/campusaccess"},
//         ],
//       },
//       {
//         type: "dropdown",
//         label: "Roles Configuration",
//         id: "RoleConfiguration",
//         icon: <Lock />,
//         show: hasPermission("ROLE_CREATE") || hasPermission("ROLE_VIEW"),
//         children: [
//           // {
//           //   label: "Create Global Role",
//           //   to: "/staff/globalroles/create-role",
//           //   show: hasPermission("ROLE_CREATE"),
//           // },
//           {
//             label: "Global Roles Config",
//             to: "/staff/globalroles/view-role",
//             show: hasPermission("ROLE_VIEW"),
//           },
//           // { label: "Create Campuses Roles",
//           //   to: "/staff/campusroles/createcampusroles",
//           //   show: hasPermission("CAMPUS_VIEW")
//           // },
//           { label: "Campuses Roles Config",
//             to: "/staff/campusroles/viewcampusroles",
//             show: hasPermission("CAMPUS_VIEW")
//           },
//         ],
//       },
//       { type: "header", label: "Branch configuration" },
//       { type: "divider" },
//       {
//         type: "dropdown",
//         label: "Academic Setup",
//         id: "Branchconfiguration",
//         icon: <BookOpen />,
//         show: hasPermission("ACADEMIC_YEAR_VIEW"),
//         children: [
//           { label: "1 - Create Board", to: "/staff/AcademicSetup/create-board", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "2 - Create Medium", to: "/staff/AcademicSetup/create-medium", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "3 - Academic Level", to: "/staff/AcademicSetup/academic-level", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "4 - Branch Configuration", to: "/staff/branchconfiguration/create-branch-configuration", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "5 - Create Academic Year", to: "/staff/AcademicSetup/create-academic-year", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "6 - Year Configuration", to: "/staff/branchconfiguration/create-academic-year-configuration", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "7 - Whole Structure", to: "/staff/branchconfiguration/full-configuration-structure", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "7 - Whole Structure", to: "/staff/branchconfiguration/Class-Allocation-Manager", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//         ],
//       },
//       {
//         type: "dropdown",
//         label: "Admission Cycle",
//         id: "AdmissionCycle",
//         icon: <BookOpen />,
//         show: hasPermission("ROLE_CREATE") || hasPermission("ROLE_VIEW"),
//         children: [
//           {
//             label: "Create Admission Cycle",
//             to: "/staff/admissioncycle/Create-Admission-Cycle",
//             show: hasPermission("ROLE_CREATE"),
//           },
//           {
//             label: "Create Admission Cycle for BranchGrade",
//             to: "/staff/admissioncycle/create-admission-cycle-for-branchGrade",
//             show: hasPermission("ROLE_CREATE"),
//           },
//         ],
//       },
//       {
//         type: "dropdown",
//         label: "Fees Structure",
//         id: "FeesCycle",
//         icon: <IndianRupee   />,
//         children: [
//           {
//             label: "Fees Category",
//             to: "/staff/feescycle/add-fees-category",
//           },
//           {
//             label: "Fees Head",
//             to: "/staff/feescycle/create-fees-head",
//           },
//           {
//             label: "Bank Account",
//             to: "/staff/feescycle/bank-account",
//           },
//           {
//             label: "Fees Bank Mapping",
//             to: "/staff/feescycle/fees-bank-mapping",
//           },
//           {
//             label: "Fee Structure Type",
//             to: "/staff/feescycle/fee-structure-type",
//           },
//           {
//             label: "Fee Structure",
//             to: "/staff/feescycle/fee-structure",
//           },
//         ],
//       },
//       { type: "header", label: "Academic" },
//       { type: "divider" },
//       {
//         type: "dropdown",
//         label: "Academic Setup",
//         id: "AcademicSetup",
//         icon: <BookOpen />,
//         show: hasPermission("ACADEMIC_YEAR_VIEW"),
//         children: [
//           { label: "0 - Academic Setup Guide", to: "/staff/AcademicSetup/Academic-Setup-Guide", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "1 - Create Board", to: "/staff/AcademicSetup/create-board", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "2 - Create Medium", to: "/staff/AcademicSetup/create-medium", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "3 - Academic Level", to: "/staff/AcademicSetup/academic-level", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "4 - Create Branch", to: "/staff/AcademicSetup/create-branch", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "5 - Create Grades", to: "/staff/AcademicSetup/create-grades", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "6 - Branch Grade Label", to: "/staff/AcademicSetup/branch-grade-label", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "7 - Create Stream", to: "/staff/AcademicSetup/create-stream", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "8 - Assign Stream", to: "/staff/AcademicSetup/assign-stream", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "9 - Assign Academic Level", to: "/staff/AcademicSetup/Assign-Academic-Level", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "10 - Create Academic Year", to: "/staff/AcademicSetup/create-academic-year", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "11 - Create Branch Academic Year", to: "/staff/AcademicSetup/create-branch-academicYear", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "12 - Assign Stream to Branch Grade", to: "/staff/AcademicSetup/assign-stream-to-branch-grade", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "13 - Create Academic Term", to: "/staff/AcademicSetup/create-academic-term", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//           { label: "14 - Assign Academic Term", to: "/staff/AcademicSetup/assign-academic-term", show: hasPermission("ACADEMIC_YEAR_VIEW"), },
//         ],
//       },
//       // {
//       //   type: "dropdown",
//       //   label: "Admission Cycle",
//       //   id: "AdmissionCycle",
//       //   icon: <BookOpen />,
//       //   show: hasPermission("ROLE_CREATE") || hasPermission("ROLE_VIEW"),
//       //   children: [
//       //     {
//       //       label: "Create Admission Cycle",
//       //       to: "/staff/admissioncycle/Create-Admission-Cycle",
//       //       show: hasPermission("ROLE_CREATE"),
//       //     },
//       //     {
//       //       label: "Create Admission Cycle for BranchGrade",
//       //       to: "/staff/admissioncycle/create-admission-cycle-for-branchGrade",
//       //       show: hasPermission("ROLE_CREATE"),
//       //     },
//       //   ],
//       // },

//       {
//         type: "dropdown",
//         label: "Student Admission",
//         id: "StudentAdmission",
//         icon: <University />,
//         children: [
//           {
//             label: "Enquiry Details",
//             to: "/staff/admission/student-enquiry-details",
//           },
//           {
//             label: "Student Enquiry",
//             to: "/staff/admission/student-enquiry",
//           },
//           {
//             label: "Student Admission",
//             to: "/staff/admission/student-admission",
//           },
//           {
//             label: "Student Dashboard",
//             to: "/staff/student/dashboard",
//           },
//         ],
//       },
//       { type: "divider" },
//       { type: "header", label: "System" },
//       { type: "custom_theme_toggle" },
//       {
//         type: "dropdown",
//         label: "Appearance",
//         id: "Theme",
//         icon: <Palette />,
//         isThemeSelector: true,
//         children: [],
//       },

//     ],
//     [superAdmin, permissions]
//   );

//   // --- FLATTENED ROUTES ---
//   const searchableRoutes = useMemo(() => {
//     const routes = [];
//     MENU_CONFIG.forEach((item) => {
//       if (item.type === "link") {
//         routes.push({ label: item.label, to: item.to, icon: item.icon });
//       }
//       if (item.type === "dropdown" && item.children) {
//         item.children.forEach((child) => {
//           if (child.to) {
//             routes.push({
//               label: child.label,
//               to: child.to,
//               icon: item.icon,
//             });
//           }
//         });
//       }
//     });
//     return routes;
//   }, [MENU_CONFIG]);

//   // --- FILTER LOGIC ---
//   const filteredRoutes = useMemo(() => {
//     if (!searchQuery) return [];
//     return searchableRoutes.filter((route) =>
//       route.label.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   }, [searchQuery, searchableRoutes]);

//   // --- SHORTCUT LOGIC ---
//   const toggleShortcut = (e, to) => {
//     e.preventDefault();
//     e.stopPropagation();

//     if (shortcuts.includes(to)) {
//       setShortcuts((prev) => prev.filter((path) => path !== to));
//     } else {
//       setShortcuts((prev) => [...prev, to]);
//     }
//   };

//   const activeShortcuts = useMemo(() => {
//     return searchableRoutes.filter((route) => shortcuts.includes(route.to));
//   }, [shortcuts, searchableRoutes]);

//   // --- HELPERS ---
//   const toggleMenu = (menuName) => {
//     // If collapsed, expand sidebar first so user can see what they are doing
//     if (isCollapsed) {
//       setIsCollapsed(false);
//       setActiveMenu(menuName);
//     } else {
//       setActiveMenu(activeMenu === menuName ? "" : menuName);
//     }
//   };

//   const handleLinkClick = () => {
//     if (window.innerWidth < 1024) onClose();
//   };

//   // --- SUB-COMPONENTS ---

//   const SidebarItem = ({ icon, label, to }) => {
//     const isPinned = shortcuts.includes(to);

//     return (
//       <NavLink
//         to={to}
//         onClick={(e) => {
//           e.preventDefault();

//           dispatch(openTab({
//             path: to,
//             label: label
//           }));

//           navigate(to);
//           handleLinkClick();
//         }}
//         end
//         className={({ isActive }) =>
//           `group relative flex items-center ${isCollapsed ? "justify-center" : "justify-between"
//           } p-3 mx-3 rounded-xl transition-all duration-300 ${isActive
//             ? isDark
//               ? "bg-white/10 shadow-lg"
//               : "bg-white shadow-md"
//             : "text-gray-500 hover:text-primary"
//           }`
//         }
//         style={({ isActive }) => (isActive ? { color: textColor } : {})}
//       >
//         {({ isActive }) => (
//           <>
//             <div
//               className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"
//                 } w-full`}
//             >
//               {/* Active Indicator Strip */}
//               <span
//                 className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary transition-all ${isActive ? "opacity-100" : "opacity-0"
//                   }`}
//               />

//               {/* Icon */}
//               <span
//                 className={`transition-colors ${isActive
//                   ? "text-primary"
//                   : "text-gray-400 group-hover:text-primary"
//                   }`}
//               >
//                 {React.cloneElement(icon, {
//                   size: 20,
//                   strokeWidth: isActive ? 2.5 : 2,
//                 })}
//               </span>

//               {/* Label (Hidden if collapsed) */}
//               <span
//                 className={`text-sm font-bold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
//                   }`}
//               >
//                 {label}
//               </span>
//             </div>

//             {/* SHORTCUT BUTTON (Only show if not collapsed) */}
//             {!isCollapsed && (
//               <button
//                 onClick={(e) => toggleShortcut(e, to)}
//                 className={`p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 ${isPinned
//                   ? "opacity-100 text-yellow-400"
//                   : "text-gray-300 hover:text-yellow-400"
//                   }`}
//               >
//                 <Star size={16} fill={isPinned ? "currentColor" : "none"} />
//               </button>
//             )}
//           </>
//         )}
//       </NavLink>
//     );
//   };

//   const TreeItem = ({ label, to, isLast }) => {
//     const isPinned = shortcuts.includes(to);

//     return (
//       <NavLink
//         to={to}
//         end
//         onClick={(e) => {
//           e.preventDefault();

//           dispatch(openTab({
//             path: to,
//             label: label
//           }));

//           navigate(to);
//           handleLinkClick();
//         }}
//         className={({ isActive }) =>
//           `relative flex items-center justify-between h-10 ml-6 pr-3 rounded-lg transition-all group hover:bg-white/5 ${isActive ? "font-bold" : "text-gray-500"
//           }`
//         }
//         style={({ isActive }) => (isActive ? { color: textColor } : {})}
//       >
//         <div className="flex items-center">
//           <span
//             className={`absolute left-0 top-0 w-px ${isLast ? "h-1/2" : "h-full"
//               }`}
//             style={{ backgroundColor: lineStroke }}
//           />
//           <span
//             className="absolute left-0 top-1/2 w-4 border-t"
//             style={{ borderColor: lineStroke }}
//           />
//           <span
//             className={`absolute left-[14px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border bg-white/10 group-hover:border-primary transition-colors ${isDark ? "border-white/20" : "border-gray-200"
//               }`}
//           />
//           <span className="ml-8 text-[13px] whitespace-nowrap">{label}</span>
//         </div>

//         <button
//           onClick={(e) => toggleShortcut(e, to)}
//           className={`p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 ${isPinned
//             ? "opacity-100 text-yellow-400"
//             : "text-gray-300 hover:text-yellow-400"
//             }`}
//         >
//           <Star size={14} fill={isPinned ? "currentColor" : "none"} />
//         </button>
//       </NavLink>
//     );
//   };

//   const SidebarDropdown = ({ icon, label, isOpen, onClick, children }) => (
//     <div className="mx-3 mb-1">
//       <div
//         onClick={onClick}
//         className={`group flex items-center ${isCollapsed ? "justify-center" : "justify-between"
//           } p-3 rounded-xl cursor-pointer transition-all ${isOpen
//             ? "bg-white/5 text-primary"
//             : "text-gray-500 hover:text-primary"
//           }`}
//       >
//         <div
//           className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"
//             } w-full`}
//         >
//           <span
//             className={`transition-colors ${isOpen
//               ? "text-primary"
//               : "text-gray-400 group-hover:text-primary"
//               }`}
//           >
//             {React.cloneElement(icon, { size: 20 })}
//           </span>

//           <span
//             className={`text-sm font-bold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
//               }`}
//             style={{ color: isOpen ? textColor : "" }}
//           >
//             {label}
//           </span>
//         </div>

//         {!isCollapsed && (
//           <ChevronDown
//             size={16}
//             className={`transition-transform duration-300 shrink-0 ${isOpen ? "rotate-180" : ""
//               }`}
//           />
//         )}
//       </div>

//       {/* If collapsed, hide children entirely. If open, show them. */}
//       <div
//         className={`grid transition-all duration-300 ease-in-out ${isOpen && !isCollapsed
//           ? "grid-rows-[1fr] opacity-100 mt-1"
//           : "grid-rows-[0fr] opacity-0"
//           }`}
//       >
//         <div className="overflow-hidden">{children}</div>
//       </div>
//     </div>
//   );

//   return (
//     <>
//       {/* MOBILE OVERLAY */}
//       <div
//         className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden transition-opacity ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
//           }`}
//         onClick={onClose}
//       />

//       <aside
//         style={{
//           backgroundColor: sidebarBg,
//           color: textColor,
//           borderColor: lineStroke,
//         }}
//         className={`fixed inset-y-0 left-0 z-50 h-screen border-r flex flex-col transition-all duration-300
//           ${isOpen ? "translate-x-0" : "-translate-x-full"}
//           lg:translate-x-0 lg:static
//           ${isCollapsed ? "w-20" : "w-72"}`}
//       >
//         {/* --- TOGGLE BUTTON (DESKTOP ONLY) --- */}
//         <button
//           onClick={() => setIsCollapsed(!isCollapsed)}
//           className={`absolute -right-3 top-20 z-50 hidden lg:flex items-center justify-center w-6 h-6 rounded-full shadow-md border transition-colors ${isDark
//             ? "bg-[#1A1A1A] border-gray-700 text-gray-300 hover:text-white"
//             : "bg-white border-gray-200 text-gray-500 hover:text-primary"
//             }`}
//         >
//           {isCollapsed ? (
//             <ChevronsRight size={14} />
//           ) : (
//             <ChevronsLeft size={14} />
//           )}
//         </button>

//         {/* HEADER & SEARCH */}
//         <div className={`p-6 pb-4 ${isCollapsed ? "px-2" : "p-6"}`}>
//           <div
//             className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"
//               } mb-6`}
//           >
//             <div
//               className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : "px-2"
//                 }`}
//             >
//               <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center shadow-lg shrink-0">
//                 <Layers
//                   className="text-primary"
//                   size={22}
//                   strokeWidth={2.5}
//                 />
//               </div>

//               <div
//                 className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
//                   }`}
//               >
//                 <h1 className="text-xl font-bold tracking-tight">Eduverse</h1>
//                 <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">
//                   Admin Portal
//                 </p>
//               </div>
//             </div>
//             <button onClick={onClose} className="lg:hidden p-2 text-gray-500">
//               <X size={20} />
//             </button>
//           </div>

//           {/* Search Bar */}
//           <div
//             className={`relative flex items-center rounded-xl border transition-all ${inputBg} ${inputBorder}
//             ${isCollapsed
//                 ? "justify-center p-2 cursor-pointer"
//                 : "px-3 py-2.5 focus-within:ring-2 ring-primary/20"
//               }`}
//             onClick={() => isCollapsed && setIsCollapsed(false)} // Auto expand if search clicked
//           >
//             <Search size={16} className="text-gray-400 min-w-[16px]" />
//             <input
//               type="text"
//               placeholder="Search..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className={`bg-transparent border-none outline-none text-xs font-medium ml-2 placeholder:text-gray-500 ${textColor}
//                 transition-all duration-300 ${isCollapsed ? "w-0 opacity-0 p-0" : "w-full opacity-100"
//                 }`}
//             />
//             {searchQuery && !isCollapsed && (
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   setSearchQuery("");
//                 }}
//                 className="text-gray-400 hover:text-red-500 transition-colors"
//               >
//                 <X size={14} />
//               </button>
//             )}
//           </div>
//         </div>

//         {/* NAVIGATION CONTENT */}
//         <nav className="flex-1 space-y-1 px-2 pb-10 overflow-y-auto custom-scrollbar overflow-x-hidden">
//           {/* --- SHORTCUT HEADER PANEL --- */}
//           {activeShortcuts.length > 0 && !searchQuery && (
//             <div className="mb-4 animate-in slide-in-from-left duration-300">
//               {!isCollapsed && (
//                 <div className="px-5 mb-2 flex items-center gap-2">
//                   <Star size={12} className="text-primary fill-primary" />
//                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                     Quick Access
//                   </span>
//                 </div>
//               )}
//               {/* Separator for collapsed mode to denote shortcuts */}
//               {isCollapsed && (
//                 <div className="h-px bg-gray-700/20 mx-4 mb-2"></div>
//               )}

//               {activeShortcuts.map((route, idx) => (
//                 <SidebarItem
//                   key={`sc-${idx}`}
//                   icon={route.icon}
//                   label={route.label}
//                   to={route.to}
//                 />
//               ))}
//               <div
//                 className="my-4 mx-5 border-t"
//                 style={{ borderColor: lineStroke }}
//               ></div>
//             </div>
//           )}

//           {searchQuery ? (
//             // --- SEARCH RESULTS VIEW ---
//             <div className="mt-2 animate-in fade-in duration-200">
//               {!isCollapsed && (
//                 <div className="px-5 mb-2">
//                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                     Search Results ({filteredRoutes.length})
//                   </span>
//                 </div>
//               )}
//               {filteredRoutes.length > 0 ? (
//                 filteredRoutes.map((route, idx) => (
//                   <SidebarItem
//                     key={idx}
//                     icon={route.icon}
//                     label={route.label}
//                     to={route.to}
//                   />
//                 ))
//               ) : (
//                 <div className="px-5 py-4 text-center">
//                   <p className="text-sm text-gray-400">
//                     {isCollapsed ? "?" : "No results found"}
//                   </p>
//                 </div>
//               )}
//             </div>
//           ) : (
//             // --- DYNAMIC TREE VIEW ---
//             <div className="animate-in fade-in duration-200 mt-2">
//               {MENU_CONFIG
//                 .filter(item => item.show !== false)
//                 .map((item, index) => {
//                   // 1. HEADER
//                   if (item.type === "header") {
//                     if (isCollapsed)
//                       return <div key={index} className="h-4"></div>; // Spacer when collapsed
//                     return (
//                       <div key={index} className="px-5 mb-2 mt-2">
//                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                           {item.label}
//                         </span>
//                       </div>
//                     );
//                   }
//                   // 2. DIVIDER
//                   if (item.type === "divider") {
//                     return (
//                       <div
//                         key={index}
//                         className="my-6 mx-5 border-t"
//                         style={{ borderColor: lineStroke }}
//                       ></div>
//                     );
//                   }
//                   // 3. STANDARD LINK
//                   if (item.type === "link") {
//                     return (
//                       <SidebarItem
//                         key={index}
//                         icon={item.icon}
//                         label={item.label}
//                         to={item.to}
//                       />
//                     );
//                   }
//                   // 4. CUSTOM THEME BUTTONS
//                   if (item.type === "custom_theme_toggle") {
//                     // Hide theme toggle in collapsed mode to save space/complexity, or make it icon only
//                     if (isCollapsed) return null;
//                     return (
//                       <div
//                         key={index}
//                         className="mx-3 mb-4 flex bg-gray-500/10 p-1 rounded-xl"
//                       >
//                         <button
//                           onClick={() => dispatch(setThemeMode("light"))}
//                           className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${!isDark
//                             ? "bg-white shadow text-black"
//                             : "text-gray-400"
//                             }`}
//                         >
//                           <Sun size={14} /> Light
//                         </button>
//                         <button
//                           onClick={() => dispatch(setThemeMode("dark"))}
//                           className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${isDark ? "bg-[#0D1116] text-white" : "text-gray-400"
//                             }`}
//                         >
//                           <Moon size={14} /> Dark
//                         </button>
//                       </div>
//                     );
//                   }
//                   // 5. DROPDOWN
//                   if (item.type === "dropdown") {
//                     return (
//                       <SidebarDropdown
//                         key={index}
//                         icon={item.icon}
//                         label={item.label}
//                         isOpen={activeMenu === item.id}
//                         onClick={() => toggleMenu(item.id)}
//                       >
//                         {item.isThemeSelector
//                           ? !isCollapsed && ( // Hide color selector content if collapsed
//                             <div className="ml-6 py-3 px-4 mt-1 bg-white/5 dark:bg-white/10 rounded-xl border border-gray-200/10 shadow-sm">
//                               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 block">
//                                 BG Accent
//                               </span>
//                               <div className="flex flex-wrap gap-2">
//                                 {[
//                                   "#F4F6F8",
//                                   "#EFF2F9",
//                                   "#FAFAFA",
//                                   "#E4EBF1",
//                                   "#D4E2EF",
//                                   "#F5F7FA",
//                                   "#EEF2F5",
//                                   "#E9EFF5",
//                                   "#ECF3F1",
//                                   "#D7DBDA",
//                                   "#B5BFC6",
//                                 ].map((color) => (
//                                   <button
//                                     key={color}
//                                     onClick={() => dispatch(changeColor(color))}
//                                     className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-all"
//                                     style={{ backgroundColor: color }}
//                                   />
//                                 ))}
//                               </div>
//                             </div>
//                           )
//                           : item.children?.filter(child => child.show !== false).map((child, cIdx) => (
//                             <TreeItem
//                               key={cIdx}
//                               label={child.label}
//                               to={child.to}
//                               isLast={cIdx === item.children.length - 1}
//                             />
//                           ))}
//                       </SidebarDropdown>
//                     );
//                   }
//                   return null;
//                 })}
//             </div>
//           )}
//         </nav>

//         {/* FOOTER */}
//         {/* <div className="p-4 border-t" style={{ borderColor: lineStroke }}>
//           <div
//             className={`bg-[#1A1A1A] rounded-xl p-3 flex items-center ${isCollapsed ? "justify-center" : "gap-3"
//               } text-white transition-all`}
//           >
//             <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-[#1A1A1A] font-bold text-xs shrink-0">
//               ED
//             </div>
//             <div
//               className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
//                 }`}
//             >
//               <p className="text-xs font-bold">Eduverse</p>
//               <p className="text-[10px] text-gray-400">v2.4.0</p>
//             </div>
//           </div>
//         </div> */}
//       </aside>
//     </>
//   );
// };

// export default Sidebar;

// import React, { useState, useMemo, useEffect } from "react";
// import { NavLink } from "react-router-dom";
// import {
//   LayoutDashboard,
//   BookOpen,
//   Layers,
//   ChevronDown,
//   Palette,
//   X,
//   Sun,
//   Moon,
//   Search,
//   Lock,
//   University,
//   Star,
//   ChevronsLeft,
//   ChevronsRight,
//   IndianRupee,
//   StarOffIcon,
//   User2,
//   Users2,
//   Users,
//   FileText,
//   UserCheck
// } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { changeColor, setThemeMode } from "../../../hooks/colorSlice";
// import { useNavigate } from "react-router-dom";
// import { openTab } from "../../../hooks/tabsSlice";

// const Sidebar = ({ isOpen, onClose }) => {
//   const dispatch = useDispatch();
//   const themeMode = useSelector((state) => state.color.mode);
//   const navigate = useNavigate();

//   const [activeMenu, setActiveMenu] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");

//   const [isCollapsed, setIsCollapsed] = useState(() => {
//     try {
//       const saved = localStorage.getItem("sidebarCollapsed");
//       return saved ? JSON.parse(saved) : false;
//     } catch (e) {
//       return false;
//     }
//   });

//   const [shortcuts, setShortcuts] = useState(() => {
//     try {
//       const saved = localStorage.getItem("sidebarShortcuts");
//       return saved ? JSON.parse(saved) : [];
//     } catch (e) {
//       return [];
//     }
//   });

//   useEffect(() => {
//     localStorage.setItem("sidebarShortcuts", JSON.stringify(shortcuts));
//   }, [shortcuts]);

//   useEffect(() => {
//     localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
//   }, [isCollapsed]);

//   const isDark = themeMode === "dark";
//   const sidebarBg = isDark ? "#121212" : "#FDFBF7";
//   const textColor = isDark ? "#F5F5F5" : "#1A1A1A";
//   const lineStroke = isDark ? "rgba(255,255,255,0.1)" : "rgba(26,26,26,0.08)";
//   const inputBg = isDark ? "bg-[#1A1A1A]" : "bg-white";
//   const inputBorder = isDark ? "border-gray-800" : "border-gray-200";

//   const { superAdmin } = useSelector((state) => state.campus);
//   const { permissions } = useSelector((state) => state.permissions);

//   const hasPermission = (perm) => {
//     if (superAdmin) return true;
//     return permissions?.includes(perm);
//   };

//   const MENU_CONFIG = useMemo(
//     () => [
//       { type: "header", label: "Main Menu" },
//       {
//         type: "link",
//         label: "Dashboard",
//         to: "/staff/dashboard",
//         icon: <LayoutDashboard />,
//         show: superAdmin,
//       },
//       {
//         type: "link",
//         label: "Admin Dashboard",
//         to: "/staff/admindashboard",
//         icon: <LayoutDashboard />,
//         show: superAdmin,
//       },
//       {
//         type: "link",
//         label: "Staff Dashboard",
//         to: "/staff/staffdashboard",
//         icon: <LayoutDashboard />,
//         show: !superAdmin,
//       },
//       {
//         type: "dropdown",
//         label: "Campuses",
//         id: "Campuses",
//         icon: <University />,
//         show: hasPermission("CAMPUS_VIEW"),
//         children: [
//           {
//             label: "Create Campuses",
//             to: "/staff/campus/create-campus",
//             show: hasPermission("CAMPUS_VIEW"),
//           },
//         ],
//       },
//       {
//         type: "dropdown",
//         label: "User Management",
//         id: "DisplayUsers",
//         icon: <Users2 />,
//         show: hasPermission("STAFF_VIEW"),
//         children: [
//           // { label: "Display Users", to: "/staff/managestaff/displaystaff" },
//           {
//             label: "Display Users New",
//             to: "/staff/managestaff/displaystaff2",
//           },
//         ],
//       },
//       {
//         type: "dropdown",
//         label: "Roles Configuration",
//         id: "RoleConfiguration",
//         icon: <Lock />,
//         show: hasPermission("ROLE_CREATE") || hasPermission("ROLE_VIEW"),
//         children: [
//           {
//             label: "Global Roles Config",
//             to: "/staff/globalroles/view-role",
//             show: hasPermission("ROLE_VIEW"),
//           },
//           {
//             label: "Campuses Roles Config",
//             to: "/staff/campusroles/viewcampusroles",
//             show: hasPermission("CAMPUS_VIEW"),
//           },
//         ],
//       },
//       { type: "header", label: "Branch configuration" },
//       { type: "divider" },
//       {
//         type: "dropdown",
//         label: "Academic Setup",
//         id: "Branchconfiguration",
//         icon: <BookOpen />,
//         show: hasPermission("ACADEMIC_YEAR_VIEW"),
//         children: [
//           { label: "0 - Academic Setup Guide", to: "/staff/AcademicSetup/Academic-Setup-Guide" },
//           { label: "1 - Create Board", to: "/staff/AcademicSetup/create-board" },
//           { label: "2 - Create Medium", to: "/staff/AcademicSetup/create-medium" },
//           { label: "3 - Academic Level", to: "/staff/AcademicSetup/academic-level" },
//           { label: "4 - Branch Configuration", to: "/staff/AcademicSetup/create-branch-configuration" },
//           { label: "5 - Create Academic Year", to: "/staff/AcademicSetup/create-academic-year" },
//           { label: "6 - Year Configuration", to: "/staff/AcademicSetup/create-academic-year-configuration" },
//           { label: "7 - Whole Structure", to: "/staff/AcademicSetup/full-configuration-structure" },
//         ],
//       },
//       {
//         type: "dropdown",
//         label: "Admission Cycle",
//         id: "AdmissionCycle",
//         icon: <BookOpen />,
//         show: hasPermission("ROLE_CREATE") || hasPermission("ROLE_VIEW"),
//         children: [
//           { label: "Create Admission Cycle", to: "/staff/admissioncycle/Create-Admission-Cycle" },
//           { label: "Create Admission Cycle for BranchGrade", to: "/staff/admissioncycle/create-admission-cycle-for-branchGrade" },
//         ],
//       },
//       {
//         type: "dropdown",
//         label: "Fees Cycle",
//         id: "FeesCycle",
//         icon: <IndianRupee />,
//         children: [
//           { label: "1 Fees Category", to: "/staff/feescycle/add-fees-category" },
//           { label: "2 Fees Head", to: "/staff/feescycle/create-fees-head" },
//           { label: "3 Bank Account", to: "/staff/feescycle/bank-account" },
//           { label: "4 Fees Bank Mapping", to: "/staff/feescycle/fees-bank-mapping" },
//           { label: "5 Fee Structure Type", to: "/staff/feescycle/fee-structure-type" },
//           { label: "6 Fee Structure", to: "/staff/feescycle/fee-structure" },
//           { label: "7 Fees Due Dates", to: "/staff/feescycle/fees-due-dates" },
//           { label: "8 Create Late Fee Policy", to: "/staff/feescycle/create-late-fee-policy" },
//           { label: "9 Create Late Fee Mapping", to: "/staff/feescycle/create-late-fee-mapping" },
//           { label: "10 Assign Fee to Strudent", to: "/staff/feescycle/assign-fee-to-strudent" },
//           { label: "11 Campus Payment Config", to: "/staff/feescycle/campus-payment-config" },
//           { label: "12 Student Payment Preference", to: "/staff/feescycle/student-payment-preference" },
//           { label: "13 Students Preview for NACH", to: "/staff/feescycle/students-preview-for-NACH" },
//           { label: "14 Create NACH Batch", to: "/staff/feescycle/create-nach-batch" },
//         ],
//       },
//       {
//         type: "dropdown",
//         label: "Fees Configuration",
//         id: "FeesConfiguration",
//         icon: <IndianRupee />,
//         children: [
//           { label: "Fees Configuration Guide", to: "/staff/FeesConfiguration/FeesConfigurationGuide" },
//           { label: "Fee Master Manager", to: "/staff/FeesConfiguration/FeeMasterManager" },
//           { label: "Fee Structure And DueDates", to: "/staff/FeesConfiguration/FeeStructureAndDueDates" },
//           { label: "Fee Policy And Mapping", to: "/staff/FeesConfiguration/FeePolicyAndMapping" },
//           { label: "Campus Payment Config", to: "/staff/FeesConfiguration/CampusPaymentConfiguration" },
//           { label: "Assign Fee to Strudent", to: "/staff/feescycle/assign-fee-to-strudent" },
//           { label: "Student Payment Preferences", to: "/staff/FeesConfiguration/StudentPaymentPreferences" },
//           { label: "NACH Unified Manager", to: "/staff/FeesConfiguration/NACHUnifiedManager" },
//           { label: "Fee Payment Card", to: "/staff/FeesConfiguration/FeePaymentCard" },
//           { label: "Payment Preference Manager", to: "/staff/FeesConfiguration/PaymentPreferenceManager" },
//           { label: "Late Fee Manager", to: "/staff/FeesConfiguration/LateFeeManager" },
//         ],
//       },
//       { type: "header", label: "Academic" },
//       { type: "divider" },
//       // {
//       //   type: "dropdown",
//       //   label: "Admission Cycle",
//       //   id: "AdmissionCycle",
//       //   icon: <BookOpen />,
//       //   show: hasPermission("ROLE_CREATE") || hasPermission("ROLE_VIEW"),
//       //   children: [
//       //     {
//       //       label: "Create Admission Cycle",
//       //       to: "/staff/admissioncycle/Create-Admission-Cycle",
//       //       show: hasPermission("ROLE_CREATE"),
//       //     },
//       //     {
//       //       label: "Create Admission Cycle for BranchGrade",
//       //       to: "/staff/admissioncycle/create-admission-cycle-for-branchGrade",
//       //       show: hasPermission("ROLE_CREATE"),
//       //     },
//       //   ],
//       // },

//       {
//         type: "dropdown",
//         label: "Admission",
//         id: "StudentAdmission",
//         icon: <University />,
//         children: [
//           {
//             label: "Enquiries List",
//             to: "/staff/admission/student-enquiry-details",
//           },
//           // {
//           //   label: "Enquiry Form",
//           //   to: "/staff/admission/student-enquiry",
//           // },
//           {
//             label: "Admission Dashboard",
//             to: "/staff/admission/admission-dashboard",
//           },
//           {
//             label: "Admission Form",
//             to: "/staff/admission/student-admission",
//           },
//           {
//             label: "Student Dashboard",
//             to: "/staff/student/dashboard",
//           },
//         ],
//       },
//        {
//         type: "dropdown",
//         label: "Student",
//         id: "studentApproval",
//         icon: <UserCheck/>,
//         children: [
//           {
//             label: "Student Profile",
//             to: "/staff/admission/student-profile",
//             // show: hasPermission("ADMISSION_APPROVAL"),
//           },
//           {
//             label: "Students List",
//             to: "/staff/admission/studentlist",
//             // show: hasPermission("ADMISSION_APPROVAL"),
//           },
//         ],
//       },
//       {
//         type: "dropdown",
//         label: "Document Management",
//         id: "DocumentManagement",
//         icon: <FileText/>,
//         children: [
//           {
//             label: "Document Configuration",
//             to: "/staff/document-management/document-config",
//           },
//           {
//             label: "Document Master",
//             to: "/staff/document-management/document-master",
//           },
//         ],
//       },
//       { type: "divider" },
//       { type: "header", label: "System" },
//       { type: "custom_theme_toggle" },
//       {
//         type: "dropdown",
//         label: "Appearance",
//         id: "Theme",
//         icon: <Palette />,
//         isThemeSelector: true,
//         children: [],
//       },
//     ],
//     [superAdmin, permissions]
//   );

//   const searchableRoutes = useMemo(() => {
//     const routes = [];
//     MENU_CONFIG.forEach((item) => {
//       if (item.type === "link")
//         routes.push({ label: item.label, to: item.to, icon: item.icon });
//       if (item.type === "dropdown" && item.children) {
//         item.children.forEach((child) => {
//           if (child.to)
//             routes.push({ label: child.label, to: child.to, icon: item.icon });
//         });
//       }
//     });
//     return routes;
//   }, [MENU_CONFIG]);

//   const filteredRoutes = useMemo(() => {
//     if (!searchQuery) return [];
//     return searchableRoutes.filter((route) =>
//       route.label.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   }, [searchQuery, searchableRoutes]);

//   const toggleShortcut = (e, to) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setShortcuts((prev) =>
//       prev.includes(to) ? prev.filter((p) => p !== to) : [...prev, to]
//     );
//   };

//   const activeShortcuts = useMemo(
//     () => searchableRoutes.filter((r) => shortcuts.includes(r.to)),
//     [shortcuts, searchableRoutes]
//   );

//   const toggleMenu = (menuName) => {
//     if (isCollapsed) {
//       setIsCollapsed(false);
//       setActiveMenu(menuName);
//     } else {
//       setActiveMenu(activeMenu === menuName ? "" : menuName);
//     }
//   };

//   const handleLinkClick = () => {
//     if (window.innerWidth < 1024) onClose();
//   };

//   const SidebarItem = ({ icon, label, to }) => {
//     const isPinned = shortcuts.includes(to);
//     return (
//       <NavLink
//         to={to}
//         onClick={(e) => {
//           e.preventDefault();
//           dispatch(openTab({ path: to, label: label }));
//           navigate(to);
//           handleLinkClick();
//         }}
//         className={({ isActive }) =>
//           `group relative flex items-center ${
//             isCollapsed ? "lg:justify-center" : "justify-between"
//           } p-3 mx-3 rounded-xl transition-all duration-300 ${
//             isActive
//               ? isDark
//                 ? "bg-white/10 shadow-lg"
//                 : "bg-white shadow-md"
//               : "text-gray-500 hover:text-primary"
//           }`
//         }
//         style={({ isActive }) => (isActive ? { color: textColor } : {})}
//       >
//         {({ isActive }) => (
//           <>
//             <div
//               className={`flex items-center ${
//                 isCollapsed ? "lg:justify-center" : "gap-3"
//               } w-full`}
//             >
//               <span
//                 className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary transition-all ${
//                   isActive ? "opacity-100" : "opacity-0"
//                 }`}
//               />
//               <span
//                 className={`transition-colors ${
//                   isActive
//                     ? "text-primary"
//                     : "text-gray-400 group-hover:text-primary"
//                 }`}
//               >
//                 {React.cloneElement(icon, {
//                   size: 20,
//                   strokeWidth: isActive ? 2.5 : 2,
//                 })}
//               </span>
//               <span
//                 className={`text-sm font-bold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${
//                   isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
//                 }`}
//               >
//                 {label}
//               </span>
//             </div>
//             {!isCollapsed && (
//               <button
//                 onClick={(e) => toggleShortcut(e, to)}
//                 className={`p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
//                   isPinned
//                     ? "opacity-100 text-yellow-400"
//                     : "text-gray-300 hover:text-yellow-400"
//                 }`}
//               >
//                 <Star size={16} fill={isPinned ? "currentColor" : "none"} />
//               </button>
//             )}
//           </>
//         )}
//       </NavLink>
//     );
//   };

//   const TreeItem = ({ label, to, isLast }) => {
//     const isPinned = shortcuts.includes(to);
//     return (
//       <NavLink
//         to={to}
//         end
//         onClick={(e) => {
//           e.preventDefault();
//           dispatch(openTab({ path: to, label: label }));
//           navigate(to);
//           handleLinkClick();
//         }}
//         className={({ isActive }) =>
//           `relative flex items-center justify-between h-10 ml-6 pr-3 rounded-lg transition-all group hover:bg-white/5 ${
//             isActive ? "font-bold" : "text-gray-500"
//           }`
//         }
//         style={({ isActive }) => (isActive ? { color: textColor } : {})}
//       >
//         <div className="flex items-center">
//           <span
//             className={`absolute left-0 top-0 w-px ${
//               isLast ? "h-1/2" : "h-full"
//             }`}
//             style={{ backgroundColor: lineStroke }}
//           />
//           <span
//             className="absolute left-0 top-1/2 w-4 border-t"
//             style={{ borderColor: lineStroke }}
//           />
//           <span
//             className={`absolute left-[14px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border bg-white/10 group-hover:border-primary transition-colors ${
//               isDark ? "border-white/20" : "border-gray-200"
//             }`}
//           />
//           <span className="ml-8 text-[13px] whitespace-nowrap">{label}</span>
//         </div>
//         <button
//           onClick={(e) => toggleShortcut(e, to)}
//           className={`p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
//             isPinned
//               ? "opacity-100 text-yellow-400"
//               : "text-gray-300 hover:text-yellow-400"
//           }`}
//         >
//           <Star size={14} fill={isPinned ? "currentColor" : "none"} />
//         </button>
//       </NavLink>
//     );
//   };

//   const SidebarDropdown = ({ icon, label, isOpen: menuOpen, onClick, children }) => (
//     <div className="mx-3 mb-1">
//       <div
//         onClick={onClick}
//         className={`group flex items-center ${
//           isCollapsed ? "lg:justify-center" : "justify-between"
//         } p-3 rounded-xl cursor-pointer transition-all ${
//           menuOpen
//             ? "bg-white/5 text-primary"
//             : "text-gray-500 hover:text-primary"
//         }`}
//       >
//         <div
//           className={`flex items-center ${
//             isCollapsed ? "lg:justify-center" : "gap-3"
//           } w-full`}
//         >
//           <span
//             className={`transition-colors ${
//               menuOpen
//                 ? "text-primary"
//                 : "text-gray-400 group-hover:text-primary"
//             }`}
//           >
//             {React.cloneElement(icon, { size: 20 })}
//           </span>
//           <span
//             className={`text-sm font-bold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${
//               isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
//             }`}
//             style={{ color: menuOpen ? textColor : "" }}
//           >
//             {label}
//           </span>
//         </div>
//         {!isCollapsed && (
//           <ChevronDown
//             size={16}
//             className={`transition-transform duration-300 shrink-0 ${
//               menuOpen ? "rotate-180" : ""
//             }`}
//           />
//         )}
//       </div>
//       <div
//         className={`grid transition-all duration-300 ease-in-out ${
//           menuOpen && !isCollapsed
//             ? "grid-rows-[1fr] opacity-100 mt-1"
//             : "grid-rows-[0fr] opacity-0"
//         }`}
//       >
//         <div className="overflow-hidden">{children}</div>
//       </div>
//     </div>
//   );

//   return (
//     <>
//       {/* OVERLAY (z-40):
//           Hidden on desktop (lg:hidden). Covers the app when sidebar is open on mobile.
//       */}
//       <div
//         className={`fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-300
//           ${isOpen ? "opacity-100 visible z-[40]" : "opacity-0 invisible z-[-1]"}`}
//         onClick={onClose}
//       />

//       {/* ASIDE (z-50):
//           Primary sidebar container.
//       */}
//       <aside
//         style={{
//           backgroundColor: sidebarBg,
//           color: textColor,
//           borderColor: lineStroke,
//         }}
//         className={`fixed inset-y-0 left-0 z-[50] h-full border-r flex flex-col transition-all duration-300 ease-in-out
//           ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
//           lg:translate-x-0 lg:static
//           ${isCollapsed ? "lg:w-20" : "w-72"}
//           max-w-[280px] lg:max-w-none`}
//       >
//         {/* COLLAPSE BUTTON (z-60):
//             Floating toggle for desktop. Needs higher z-index to stay above sidebar borders.
//         */}
//         <button
//           onClick={() => setIsCollapsed(!isCollapsed)}
//           className={`absolute -right-3 top-20 z-[60] hidden lg:flex items-center justify-center w-6 h-6 rounded-full shadow-md border transition-colors ${
//             isDark
//               ? "bg-[#1A1A1A] border-gray-700 text-gray-300 hover:text-white"
//               : "bg-white border-gray-200 text-gray-500 hover:text-primary"
//           }`}
//         >
//           {isCollapsed ? <ChevronsRight size={14} /> : <ChevronsLeft size={14} />}
//         </button>

//         <div className={`p-6 pb-4 ${isCollapsed ? "lg:px-2" : "p-6"}`}>
//           <div className="flex items-center justify-between mb-6">
//             <div
//               className={`flex items-center gap-3 ${
//                 isCollapsed ? "lg:justify-center" : "px-2"
//               }`}
//             >
//               <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center shadow-lg shrink-0">
//                 <Layers
//                   className="text-primary"
//                   size={22}
//                   strokeWidth={2.5}
//                 />
//               </div>
//               <div
//                 className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
//                   isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
//                 }`}
//               >
//                 <h1 className="text-xl font-bold tracking-tight">Eduverse</h1>
//                 <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">
//                   Admin Portal
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-gray-500"
//             >
//               <X size={24} />
//             </button>
//           </div>

//           <div
//             className={`relative flex items-center rounded-xl border transition-all ${inputBg} ${inputBorder} ${
//               isCollapsed
//                 ? "lg:justify-center lg:p-2 cursor-pointer"
//                 : "px-3 py-2.5 focus-within:ring-2 ring-primary/20"
//             }`}
//             onClick={() => isCollapsed && setIsCollapsed(false)}
//           >
//             <Search size={16} className="text-gray-400 min-w-[16px]" />
//             <input
//               type="text"
//               placeholder="Search..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className={`bg-transparent border-none outline-none text-xs font-medium ml-2 placeholder:text-gray-500 ${textColor} transition-all duration-300 ${
//                 isCollapsed ? "lg:w-0 lg:opacity-0 p-0" : "w-full opacity-100"
//               }`}
//             />
//           </div>
//         </div>

//         <nav className="flex-1 space-y-1 px-2 pb-10 overflow-y-auto custom-scrollbar overflow-x-hidden">
//           {activeShortcuts.length > 0 && !searchQuery && (
//             <div className="mb-4 animate-in slide-in-from-left duration-300">
//               {!isCollapsed && (
//                 <div className="px-5 mb-2 flex items-center gap-2">
//                   <Star size={12} className="text-primary fill-primary" />
//                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                     Quick Access
//                   </span>
//                 </div>
//               )}
//               {activeShortcuts.map((route, idx) => (
//                 <SidebarItem
//                   key={`sc-${idx}`}
//                   icon={route.icon}
//                   label={route.label}
//                   to={route.to}
//                 />
//               ))}
//               <div
//                 className="my-4 mx-5 border-t"
//                 style={{ borderColor: lineStroke }}
//               ></div>
//             </div>
//           )}

//           {searchQuery ? (
//             <div className="mt-2 animate-in fade-in duration-200">
//               {filteredRoutes.map((route, idx) => (
//                 <SidebarItem
//                   key={idx}
//                   icon={route.icon}
//                   label={route.label}
//                   to={route.to}
//                 />
//               ))}
//             </div>
//           ) : (
//             <div className="animate-in fade-in duration-200 mt-2">
//               {MENU_CONFIG.filter((item) => item.show !== false).map(
//                 (item, index) => {
//                   if (item.type === "header") {
//                     if (isCollapsed) return <div key={index} className="h-4"></div>;
//                     return (
//                       <div key={index} className="px-5 mb-2 mt-2">
//                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                           {item.label}
//                         </span>
//                       </div>
//                     );
//                   }
//                   if (item.type === "divider")
//                     return (
//                       <div
//                         key={index}
//                         className="my-6 mx-5 border-t"
//                         style={{ borderColor: lineStroke }}
//                       ></div>
//                     );
//                   if (item.type === "link")
//                     return (
//                       <SidebarItem
//                         key={index}
//                         icon={item.icon}
//                         label={item.label}
//                         to={item.to}
//                       />
//                     );
//                   if (item.type === "custom_theme_toggle" && !isCollapsed) {
//                     return (
//                       <div
//                         key={index}
//                         className="mx-3 mb-4 flex bg-gray-500/10 p-1 rounded-xl"
//                       >
//                         <button
//                           onClick={() => dispatch(setThemeMode("light"))}
//                           className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
//                             !isDark
//                               ? "bg-white shadow text-black"
//                               : "text-gray-400"
//                           }`}
//                         >
//                           <Sun size={14} /> Light
//                         </button>
//                         <button
//                           onClick={() => dispatch(setThemeMode("dark"))}
//                           className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
//                             isDark ? "bg-[#0D1116] text-white" : "text-gray-400"
//                           }`}
//                         >
//                           <Moon size={14} /> Dark
//                         </button>
//                       </div>
//                     );
//                   }
//                   if (item.type === "dropdown") {
//                     return (
//                       <SidebarDropdown
//                         key={index}
//                         icon={item.icon}
//                         label={item.label}
//                         isOpen={activeMenu === item.id}
//                         onClick={() => toggleMenu(item.id)}
//                       >
//                         {item.isThemeSelector
//                           ? !isCollapsed && (
//                               <div className="ml-6 py-3 px-4 mt-1 bg-white/5 dark:bg-white/10 rounded-xl border border-gray-200/10 shadow-sm">
//                                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 block">
//                                   BG Accent
//                                 </span>
//                                 <div className="flex flex-wrap gap-2">
//                                   {[
//                                     "#F4F6F8", "#EFF2F9", "#FAFAFA",
//                                     "#E4EBF1", "#D4E2EF", "#F5F7FA",
//                                     "#EEF2F5", "#E9EFF5", "#ECF3F1",
//                                     "#D7DBDA", "#B5BFC6",
//                                   ].map((color) => (
//                                     <button
//                                       key={color}
//                                       onClick={() => dispatch(changeColor(color))}
//                                       className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-all"
//                                       style={{ backgroundColor: color }}
//                                     />
//                                   ))}
//                                 </div>
//                               </div>
//                             )
//                           : item.children
//                               ?.filter((child) => child.show !== false)
//                               .map((child, cIdx) => (
//                                 <TreeItem
//                                   key={cIdx}
//                                   label={child.label}
//                                   to={child.to}
//                                   isLast={cIdx === item.children.length - 1}
//                                 />
//                               ))}
//                       </SidebarDropdown>
//                     );
//                   }
//                   return null;
//                 }
//               )}
//             </div>
//           )}
//         </nav>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;

// import React, { useState, useMemo, useEffect } from "react";
// import { NavLink } from "react-router-dom";
// import {
//   LayoutDashboard,
//   BookOpen,
//   Layers,
//   ChevronDown,
//   Palette,
//   X,
//   Sun,
//   Moon,
//   Search,
//   Lock,
//   University,
//   Star,
//   ChevronsLeft,
//   ChevronsRight,
//   IndianRupee,
//   StarOffIcon,
//   User2,
//   Users2,
//   Users,
//   FileText,
//   UserCheck,
// } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { changeColor, setThemeMode } from "../../../hooks/colorSlice";
// import { useNavigate } from "react-router-dom";
// import { openTab } from "../../../hooks/tabsSlice";

// const Sidebar = ({ isOpen, onClose }) => {
//   const dispatch = useDispatch();
//   const themeMode = useSelector((state) => state.color.mode);
//   const navigate = useNavigate();

//   const [activeMenu, setActiveMenu] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");

//   const [isCollapsed, setIsCollapsed] = useState(() => {
//     try {
//       const saved = localStorage.getItem("sidebarCollapsed");
//       return saved ? JSON.parse(saved) : false;
//     } catch (e) {
//       return false;
//     }
//   });

//   const [shortcuts, setShortcuts] = useState(() => {
//     try {
//       const saved = localStorage.getItem("sidebarShortcuts");
//       return saved ? JSON.parse(saved) : [];
//     } catch (e) {
//       return [];
//     }
//   });

//   useEffect(() => {
//     localStorage.setItem("sidebarShortcuts", JSON.stringify(shortcuts));
//   }, [shortcuts]);

//   useEffect(() => {
//     localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
//   }, [isCollapsed]);

//   const isDark = themeMode === "dark";
//   const sidebarBg = isDark ? "#121212" : "#FDFBF7";
//   const textColor = isDark ? "#F5F5F5" : "#1A1A1A";
//   const lineStroke = isDark ? "rgba(255,255,255,0.1)" : "rgba(26,26,26,0.08)";
//   const inputBg = isDark ? "bg-[#1A1A1A]" : "bg-white";
//   const inputBorder = isDark ? "border-gray-800" : "border-gray-200";

//   const { superAdmin } = useSelector((state) => state.campus);
//   const { permissions } = useSelector((state) => state.permissions);

//   const hasPermission = (perm) => {
//     if (superAdmin) return true;
//     return permissions?.includes(perm);
//   };

//   const MENU_CONFIG = useMemo(
//     () => [
//       { type: "header", label: "Main Menu" },
//       {
//         type: "link",
//         label: "Dashboard",
//         to: "/staff/dashboard",
//         icon: <LayoutDashboard />,
//         show: superAdmin,
//       },
//       {
//         type: "link",
//         label: "Admin Dashboard",
//         to: "/staff/admindashboard",
//         icon: <LayoutDashboard />,
//         show: superAdmin,
//       },
//       {
//         type: "link",
//         label: "Staff Dashboard",
//         to: "/staff/staffdashboard",
//         icon: <LayoutDashboard />,
//         show: !superAdmin,
//       },
//       {
//         type: "dropdown",
//         label: "Campuses",
//         id: "Campuses",
//         icon: <University />,
//         show: hasPermission("CAMPUS_VIEW"),
//         children: [
//           {
//             label: "Create Campuses",
//             to: "/staff/campus/create-campus",
//             show: hasPermission("CAMPUS_VIEW"),
//           },
//         ],
//       },
//       {
//         type: "dropdown",
//         label: "User Management",
//         id: "DisplayUsers",
//         icon: <Users2 />,
//         show: hasPermission("STAFF_VIEW"),
//         children: [
//           // { label: "Display Users", to: "/staff/managestaff/displaystaff" },
//           {
//             label: "Display Users New",
//             to: "/staff/managestaff/displaystaff2",
//           },
//         ],
//       },
//       {
//         type: "dropdown",
//         label: "Roles Configuration",
//         id: "RoleConfiguration",
//         icon: <Lock />,
//         show: hasPermission("ROLE_CREATE") || hasPermission("ROLE_VIEW"),
//         children: [
//           {
//             label: "Global Roles Config",
//             to: "/staff/globalroles/view-role",
//             show: hasPermission("ROLE_VIEW"),
//           },
//           {
//             label: "Campuses Roles Config",
//             to: "/staff/campusroles/viewcampusroles",
//             show: hasPermission("CAMPUS_VIEW"),
//           },
//         ],
//       },
//       { type: "header", label: "Branch configuration" },
//       { type: "divider" },
//       {
//         type: "dropdown",
//         label: "Academic Setup",
//         id: "Branchconfiguration",
//         icon: <BookOpen />,
//         show: hasPermission("ACADEMIC_YEAR_VIEW"),
//         children: [
//           {
//             label: "0 - Academic Setup Guide",
//             to: "/staff/AcademicSetup/Academic-Setup-Guide",
//           },
//           {
//             label: "1 - Create Board",
//             to: "/staff/AcademicSetup/create-board",
//           },
//           {
//             label: "2 - Create Medium",
//             to: "/staff/AcademicSetup/create-medium",
//           },
//           {
//             label: "3 - Academic Level",
//             to: "/staff/AcademicSetup/academic-level",
//           },
//           {
//             label: "4 - Branch Configuration",
//             to: "/staff/AcademicSetup/create-branch-configuration",
//           },
//           {
//             label: "5 - Create Academic Year",
//             to: "/staff/AcademicSetup/create-academic-year",
//           },
//           {
//             label: "6 - Year Configuration",
//             to: "/staff/AcademicSetup/create-academic-year-configuration",
//           },
//           {
//             label: "7 - Whole Structure",
//             to: "/staff/AcademicSetup/full-configuration-structure",
//           },
//         ],
//       },
//       {
//         type: "dropdown",
//         label: "Admission Cycle",
//         id: "AdmissionCycle",
//         icon: <BookOpen />,
//         show: hasPermission("ROLE_CREATE") || hasPermission("ROLE_VIEW"),
//         children: [
//           {
//             label: "Create Admission Cycle",
//             to: "/staff/admissioncycle/Create-Admission-Cycle",
//           },
//           {
//             label: "Create Admission Cycle for BranchGrade",
//             to: "/staff/admissioncycle/create-admission-cycle-for-branchGrade",
//           },
//         ],
//       },
//       // {
//       //   type: "dropdown",
//       //   label: "Fees Cycle",
//       //   id: "FeesCycle",
//       //   icon: <IndianRupee />,
//       //   children: [
//       //     {
//       //       label: "1 Fees Category",
//       //       to: "/staff/feescycle/add-fees-category",
//       //     },
//       //     { label: "2 Fees Head", to: "/staff/feescycle/create-fees-head" },
//       //     { label: "3 Bank Account", to: "/staff/feescycle/bank-account" },
//       //     {
//       //       label: "4 Fees Bank Mapping",
//       //       to: "/staff/feescycle/fees-bank-mapping",
//       //     },
//       //     {
//       //       label: "5 Fee Structure Type",
//       //       to: "/staff/feescycle/fee-structure-type",
//       //     },
//       //     { label: "6 Fee Structure", to: "/staff/feescycle/fee-structure" },
//       //     { label: "7 Fees Due Dates", to: "/staff/feescycle/fees-due-dates" },
//       //     {
//       //       label: "8 Create Late Fee Policy",
//       //       to: "/staff/feescycle/create-late-fee-policy",
//       //     },
//       //     {
//       //       label: "9 Create Late Fee Mapping",
//       //       to: "/staff/feescycle/create-late-fee-mapping",
//       //     },
//       //     {
//       //       label: "10 Assign Fee to Strudent",
//       //       to: "/staff/feescycle/assign-fee-to-strudent",
//       //     },
//       //     {
//       //       label: "11 Campus Payment Config",
//       //       to: "/staff/feescycle/campus-payment-config",
//       //     },
//       //     {
//       //       label: "12 Student Payment Preference",
//       //       to: "/staff/feescycle/student-payment-preference",
//       //     },
//       //     {
//       //       label: "13 Students Preview for NACH",
//       //       to: "/staff/feescycle/students-preview-for-NACH",
//       //     },
//       //     {
//       //       label: "14 Create NACH Batch",
//       //       to: "/staff/feescycle/create-nach-batch",
//       //     },
//       //   ],
//       // },
//       {
//         type: "dropdown",
//         label: "Fees Configuration",
//         id: "FeesConfiguration",
//         icon: <IndianRupee />,
//         children: [
//           {
//             label: "Fees Configuration Guide",
//             to: "/staff/FeesConfiguration/FeesConfigurationGuide",
//           },
//           {
//             label: "Fee Master Manager",
//             to: "/staff/FeesConfiguration/FeeMasterManager",
//           },
//           {
//             label: "Fee Structure And DueDates",
//             to: "/staff/FeesConfiguration/FeeStructureAndDueDates",
//           },
//           {
//             label: "Fee Policy And Mapping",
//             to: "/staff/FeesConfiguration/FeePolicyAndMapping",
//           },
//           {
//             label: "Campus Payment Config",
//             to: "/staff/FeesConfiguration/CampusPaymentConfiguration",
//           },
//           {
//             label: "Assign Fee to Strudent",
//             to: "/staff/feescycle/assign-fee-to-strudent",
//           },
//           {
//             label: "Student Payment Preferences",
//             to: "/staff/FeesConfiguration/StudentPaymentPreferences",
//           },
//           {
//             label: "NACH Unified Manager",
//             to: "/staff/FeesConfiguration/NACHUnifiedManager",
//           },
//           {
//             label: "Fee Payment Card",
//             to: "/staff/FeesConfiguration/FeePaymentCard",
//           },
//           {
//             label: "Payment Preference Manager",
//             to: "/staff/FeesConfiguration/PaymentPreferenceManager",
//           },
//           {
//             label: "Late Fee Manager",
//             to: "/staff/FeesConfiguration/LateFeeManager",
//           },
//         ],
//       },
//       { type: "header", label: "Academic" },
//       { type: "divider" },
//       // {
//       //   type: "dropdown",
//       //   label: "Admission Cycle",
//       //   id: "AdmissionCycle",
//       //   icon: <BookOpen />,
//       //   show: hasPermission("ROLE_CREATE") || hasPermission("ROLE_VIEW"),
//       //   children: [
//       //     {
//       //       label: "Create Admission Cycle",
//       //       to: "/staff/admissioncycle/Create-Admission-Cycle",
//       //       show: hasPermission("ROLE_CREATE"),
//       //     },
//       //     {
//       //       label: "Create Admission Cycle for BranchGrade",
//       //       to: "/staff/admissioncycle/create-admission-cycle-for-branchGrade",
//       //       show: hasPermission("ROLE_CREATE"),
//       //     },
//       //   ],
//       // },

//       {
//         type: "dropdown",
//         label: "Admission",
//         id: "StudentAdmission",
//         icon: <University />,
//         children: [
//           {
//             label: "Enquiries List",
//             to: "/staff/admission/student-enquiry-details",
//           },
//           // {
//           //   label: "Enquiry Form",
//           //   to: "/staff/admission/student-enquiry",
//           // },
//           {
//             label: "Admission Dashboard",
//             to: "/staff/admission/admission-dashboard",
//           },
//           {
//             label: "Admission Form",
//             to: "/staff/admission/student-admission",
//           },
//           {
//             label: "Student Dashboard",
//             to: "/staff/student/dashboard",
//           },
//         ],
//       },
//       {
//         type: "dropdown",
//         label: "Student",
//         id: "studentApproval",
//         icon: <UserCheck />,
//         children: [
//           {
//             label: "Student Profile",
//             to: "/staff/admission/student-profile",
//             // show: hasPermission("ADMISSION_APPROVAL"),
//           },
//           {
//             label: "Students List",
//             to: "/staff/admission/studentlist",
//             // show: hasPermission("ADMISSION_APPROVAL"),
//           },
//         ],
//       },
//       {
//         type: "dropdown",
//         label: "Document Management",
//         id: "DocumentManagement",
//         icon: <FileText />,
//         children: [
//           {
//             label: "Document Configuration",
//             to: "/staff/document-management/document-config",
//           },
//           {
//             label: "Document Master",
//             to: "/staff/document-management/document-master",
//           },
//         ],
//       },
//       { type: "divider" },
//       { type: "header", label: "System" },
//       { type: "custom_theme_toggle" },
//       {
//         type: "dropdown",
//         label: "Appearance",
//         id: "Theme",
//         icon: <Palette />,
//         isThemeSelector: true,
//         children: [],
//       },
//     ],
//     [superAdmin, permissions]
//   );

//   const searchableRoutes = useMemo(() => {
//     const routes = [];
//     MENU_CONFIG.forEach((item) => {
//       if (item.type === "link")
//         routes.push({ label: item.label, to: item.to, icon: item.icon });
//       if (item.type === "dropdown" && item.children) {
//         item.children.forEach((child) => {
//           if (child.to)
//             routes.push({ label: child.label, to: child.to, icon: item.icon });
//         });
//       }
//     });
//     return routes;
//   }, [MENU_CONFIG]);

//   const filteredRoutes = useMemo(() => {
//     if (!searchQuery) return [];
//     return searchableRoutes.filter((route) =>
//       route.label.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   }, [searchQuery, searchableRoutes]);

//   const toggleShortcut = (e, to) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setShortcuts((prev) =>
//       prev.includes(to) ? prev.filter((p) => p !== to) : [...prev, to]
//     );
//   };

//   const activeShortcuts = useMemo(
//     () => searchableRoutes.filter((r) => shortcuts.includes(r.to)),
//     [shortcuts, searchableRoutes]
//   );

//   const toggleMenu = (menuName) => {
//     if (isCollapsed) {
//       setIsCollapsed(false);
//       setActiveMenu(menuName);
//     } else {
//       setActiveMenu(activeMenu === menuName ? "" : menuName);
//     }
//   };

//   const handleLinkClick = () => {
//     if (window.innerWidth < 1024) onClose();
//   };

//   const SidebarItem = ({ icon, label, to }) => {
//     const isPinned = shortcuts.includes(to);
//     return (
//       <NavLink
//         to={to}
//         onClick={(e) => {
//           e.preventDefault();
//           dispatch(openTab({ path: to, label: label }));
//           navigate(to);
//           handleLinkClick();
//         }}
//         // This changes padding to a fixed 40px height for a high-density professional look
//         className={({ isActive }) =>
//           `group relative flex items-center h-10 px-3 mx-2 rounded-lg transition-all duration-200 ${
//             isActive
//               ? isDark
//                 ? "bg-[#FBCB8410] text-primary"
//                 : "bg-[#FBCB8415] text-primary"
//               : "text-gray-500 hover:text-primary hover:bg-white/5"
//           }`
//         }
//         style={({ isActive }) => (isActive ? { color: textColor } : {})}
//       >
//         {({ isActive }) => (
//           <>
//             <div
//               className={`flex items-center ${
//                 isCollapsed ? "lg:justify-center" : "gap-3"
//               } w-full`}
//             >
//               <span
//                 className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary transition-all ${
//                   isActive ? "opacity-100" : "opacity-0"
//                 }`}
//               />
//               <span
//                 className={`transition-colors ${
//                   isActive
//                     ? "text-primary"
//                     : "text-gray-400 group-hover:text-primary"
//                 }`}
//               >
//                 {React.cloneElement(icon, {
//                   size: 20,
//                   strokeWidth: isActive ? 2.5 : 2,
//                 })}
//               </span>
//               <span
//                 className={`text-sm font-bold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${
//                   isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
//                 }`}
//               >
//                 {label}
//               </span>
//             </div>
//             {!isCollapsed && (
//               <button
//                 onClick={(e) => toggleShortcut(e, to)}
//                 className={`p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
//                   isPinned
//                     ? "opacity-100 text-yellow-400"
//                     : "text-gray-300 hover:text-yellow-400"
//                 }`}
//               >
//                 <Star size={16} fill={isPinned ? "currentColor" : "none"} />
//               </button>
//             )}
//           </>
//         )}
//       </NavLink>
//     );
//   };

//   const TreeItem = ({ label, to, isLast }) => {
//     const isPinned = shortcuts.includes(to);
//     return (
//       <NavLink
//         to={to}
//         end
//         onClick={(e) => {
//           e.preventDefault();
//           dispatch(openTab({ path: to, label: label }));
//           navigate(to);
//           handleLinkClick();
//         }}
//         // This makes sub-menu items only 32px tall to save massive vertical space
//         className={({ isActive }) =>
//           `relative flex items-center justify-between h-8 ml-5 pr-3 rounded-md transition-all group hover:bg-white/5 ${
//             isActive ? "font-bold text-primary" : "text-gray-500"
//           }`
//         }
//         style={({ isActive }) => (isActive ? { color: textColor } : {})}
//       >
//         <div className="flex items-center">
//           <span
//             className={`absolute left-0 top-0 w-px ${
//               isLast ? "h-1/2" : "h-full"
//             }`}
//             style={{ backgroundColor: lineStroke }}
//           />
//           <span
//             className="absolute left-0 top-1/2 w-4 border-t"
//             style={{ borderColor: lineStroke }}
//           />
//           <span
//             className={`absolute left-[14px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border bg-white/10 group-hover:border-primary transition-colors ${
//               isDark ? "border-white/20" : "border-gray-200"
//             }`}
//           />
//           <span className="ml-8 text-[13px] whitespace-nowrap">{label}</span>
//         </div>
//         <button
//           onClick={(e) => toggleShortcut(e, to)}
//           className={`p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
//             isPinned
//               ? "opacity-100 text-yellow-400"
//               : "text-gray-300 hover:text-yellow-400"
//           }`}
//         >
//           <Star size={14} fill={isPinned ? "currentColor" : "none"} />
//         </button>
//       </NavLink>
//     );
//   };

//   const SidebarDropdown = ({
//     icon,
//     label,
//     isOpen: menuOpen,
//     onClick,
//     children,
//   }) => (
//     <div className="mx-3 mb-1">
//       <div
//         onClick={onClick}
//         className={`group flex items-center ${
//           isCollapsed ? "lg:justify-center" : "justify-between"
//         } p-3 rounded-xl cursor-pointer transition-all ${
//           menuOpen
//             ? "bg-white/5 text-primary"
//             : "text-gray-500 hover:text-primary"
//         }`}
//       >
//         <div
//           className={`flex items-center ${
//             isCollapsed ? "lg:justify-center" : "gap-3"
//           } w-full`}
//         >
//           <span
//             className={`transition-colors ${
//               menuOpen
//                 ? "text-primary"
//                 : "text-gray-400 group-hover:text-primary"
//             }`}
//           >
//             {React.cloneElement(icon, { size: 20 })}
//           </span>
//           <span
//             className={`text-sm font-bold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${
//               isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
//             }`}
//             style={{ color: menuOpen ? textColor : "" }}
//           >
//             {label}
//           </span>
//         </div>
//         {!isCollapsed && (
//           <ChevronDown
//             size={16}
//             className={`transition-transform duration-300 shrink-0 ${
//               menuOpen ? "rotate-180" : ""
//             }`}
//           />
//         )}
//       </div>
//       <div
//         className={`grid transition-all duration-300 ease-in-out ${
//           menuOpen && !isCollapsed
//             ? "grid-rows-[1fr] opacity-100 mt-1"
//             : "grid-rows-[0fr] opacity-0"
//         }`}
//       >
//         <div className="overflow-hidden">{children}</div>
//       </div>
//     </div>
//   );

//   return (
//     <>
//       {/* OVERLAY (z-40):
//           Hidden on desktop (lg:hidden). Covers the app when sidebar is open on mobile.
//       */}
//       <div
//         className={`fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-300
//           ${
//             isOpen ? "opacity-100 visible z-[40]" : "opacity-0 invisible z-[-1]"
//           }`}
//         onClick={onClose}
//       />

//       {/* ASIDE (z-50):
//           Primary sidebar container.
//       */}
//       <aside
//         style={{
//           backgroundColor: sidebarBg,
//           color: textColor,
//           borderColor: lineStroke,
//         }}
//         // This reduces the sidebar from 288px to 240px and makes the collapsed version tighter
//         className={`fixed inset-y-0 left-0 z-[50] border-r transition-all duration-300 ease-in-out flex flex-col ${
//           isDark ? "bg-[#09090B] border-white/5" : "bg-white border-gray-100"
//         } ${
//           isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
//         } lg:translate-x-0 lg:static ${
//           isCollapsed ? "lg:w-[68px]" : "lg:w-60"
//         }`}
//       >
//         {/* COLLAPSE BUTTON (z-60):
//             Floating toggle for desktop. Needs higher z-index to stay above sidebar borders.
//         */}
//         <button
//           onClick={() => setIsCollapsed(!isCollapsed)}
//           className={`absolute -right-3 top-20 z-[60] hidden lg:flex items-center justify-center w-6 h-6 rounded-full shadow-md border transition-colors ${
//             isDark
//               ? "bg-[#1A1A1A] border-gray-700 text-gray-300 hover:text-white"
//               : "bg-white border-gray-200 text-gray-500 hover:text-primary"
//           }`}
//         >
//           {isCollapsed ? (
//             <ChevronsRight size={14} />
//           ) : (
//             <ChevronsLeft size={14} />
//           )}
//         </button>

//         <div className={`p-6 pb-4 ${isCollapsed ? "lg:px-2" : "p-6"}`}>
//           <div className="flex items-center justify-between mb-6">
//             <div
//               className={`flex items-center h-14 px-4 mb-2 ${
//                 isCollapsed ? "justify-center" : ""
//               }`}
//             >
//               <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center shadow-lg shrink-0">
//                 <Layers
//                   className="text-primary"
//                   size={18}
//                   strokeWidth={2.5}
//                 />
//               </div>
//               <div
//                 className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
//                   isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
//                 }`}
//               >
//                 <h1 className="text-xl font-bold tracking-tight">Eduverse</h1>
//                 <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">
//                   Admin Portal
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={onClose}
//               className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-gray-500"
//             >
//               <X size={24} />
//             </button>
//           </div>

//           <div
//             className={`relative flex items-center rounded-xl border transition-all ${inputBg} ${inputBorder} ${
//               isCollapsed
//                 ? "lg:justify-center lg:p-2 cursor-pointer"
//                 : "px-3 py-2.5 focus-within:ring-2 ring-primary/20"
//             }`}
//             onClick={() => isCollapsed && setIsCollapsed(false)}
//           >
//             <Search size={14} className="text-gray-500 min-w-[14px]" />
//             <input
//               type="text"
//               placeholder="Search..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className={`bg-transparent border-none outline-none text-xs font-medium ml-2 placeholder:text-gray-500 ${textColor} transition-all duration-300 ${
//                 isCollapsed ? "lg:w-0 lg:opacity-0 p-0" : "w-full opacity-100"
//               }`}
//             />
//           </div>
//         </div>

//         <nav className="flex-1 space-y-1 px-2 pb-10 overflow-y-auto custom-scrollbar overflow-x-hidden">
//           {activeShortcuts.length > 0 && !searchQuery && (
//             <div className="mb-4 animate-in slide-in-from-left duration-300">
//               {!isCollapsed && (
//                 <div className="px-5 mb-2 flex items-center gap-2">
//                   <Star size={12} className="text-primary fill-primary" />
//                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                     Quick Access
//                   </span>
//                 </div>
//               )}
//               {activeShortcuts.map((route, idx) => (
//                 <SidebarItem
//                   key={`sc-${idx}`}
//                   icon={route.icon}
//                   label={route.label}
//                   to={route.to}
//                 />
//               ))}
//               <div
//                 className="my-4 mx-5 border-t"
//                 style={{ borderColor: lineStroke }}
//               ></div>
//             </div>
//           )}

//           {searchQuery ? (
//             <div className="mt-2 animate-in fade-in duration-200">
//               {filteredRoutes.map((route, idx) => (
//                 <SidebarItem
//                   key={idx}
//                   icon={route.icon}
//                   label={route.label}
//                   to={route.to}
//                 />
//               ))}
//             </div>
//           ) : (
//             <div className="animate-in fade-in duration-200 mt-2">
//               {MENU_CONFIG.filter((item) => item.show !== false).map(
//                 (item, index) => {
//                   if (item.type === "header") {
//                     if (isCollapsed)
//                       return <div key={index} className="h-4"></div>;
//                     return (
//                       <div key={index} className="px-5 mb-2 mt-2">
//                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
//                           {item.label}
//                         </span>
//                       </div>
//                     );
//                   }
//                   if (item.type === "divider")
//                     return (
//                       <div
//                         key={index}
//                         className="my-6 mx-5 border-t"
//                         style={{ borderColor: lineStroke }}
//                       ></div>
//                     );
//                   if (item.type === "link")
//                     return (
//                       <SidebarItem
//                         key={index}
//                         icon={item.icon}
//                         label={item.label}
//                         to={item.to}
//                       />
//                     );
//                   if (item.type === "custom_theme_toggle" && !isCollapsed) {
//                     return (
//                       <div
//                         key={index}
//                         className="mx-3 mb-4 flex bg-gray-500/10 p-1 rounded-xl"
//                       >
//                         <button
//                           onClick={() => dispatch(setThemeMode("light"))}
//                           className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
//                             !isDark
//                               ? "bg-white shadow text-black"
//                               : "text-gray-400"
//                           }`}
//                         >
//                           <Sun size={14} /> Light
//                         </button>
//                         <button
//                           onClick={() => dispatch(setThemeMode("dark"))}
//                           className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
//                             isDark ? "bg-[#0D1116] text-white" : "text-gray-400"
//                           }`}
//                         >
//                           <Moon size={14} /> Dark
//                         </button>
//                       </div>
//                     );
//                   }
//                   if (item.type === "dropdown") {
//                     return (
//                       <SidebarDropdown
//                         key={index}
//                         icon={item.icon}
//                         label={item.label}
//                         isOpen={activeMenu === item.id}
//                         onClick={() => toggleMenu(item.id)}
//                       >
//                         {item.isThemeSelector
//                           ? !isCollapsed && (
//                               <div className="ml-6 py-3 px-4 mt-1 bg-white/5 dark:bg-white/10 rounded-xl border border-gray-200/10 shadow-sm">
//                                 <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 block">
//                                   BG Accent
//                                 </span>
//                                 <div className="flex flex-wrap gap-2">
//                                   {[
//                                     "#F4F6F8",
//                                     "#EFF2F9",
//                                     "#FAFAFA",
//                                     "#E4EBF1",
//                                     "#D4E2EF",
//                                     "#F5F7FA",
//                                     "#EEF2F5",
//                                     "#E9EFF5",
//                                     "#ECF3F1",
//                                     "#D7DBDA",
//                                     "#B5BFC6",
//                                   ].map((color) => (
//                                     <button
//                                       key={color}
//                                       onClick={() =>
//                                         dispatch(changeColor(color))
//                                       }
//                                       className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-all"
//                                       style={{ backgroundColor: color }}
//                                     />
//                                   ))}
//                                 </div>
//                               </div>
//                             )
//                           : item.children
//                               ?.filter((child) => child.show !== false)
//                               .map((child, cIdx) => (
//                                 <TreeItem
//                                   key={cIdx}
//                                   label={child.label}
//                                   to={child.to}
//                                   isLast={cIdx === item.children.length - 1}
//                                 />
//                               ))}
//                       </SidebarDropdown>
//                     );
//                   }
//                   return null;
//                 }
//               )}
//             </div>
//           )}
//         </nav>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;

import React, { useState, useMemo, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  ChevronDown,
  Palette,
  X,
  Sun,
  Moon,
  Search,
  Lock,
  University,
  Star,
  ChevronsLeft,
  ChevronsRight,
  IndianRupee,
  StarOffIcon,
  User2,
  Users2,
  Users,
  FileText,
  UserCheck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { changeColor, setThemeMode } from "../../../hooks/colorSlice";
import { useNavigate } from "react-router-dom";
import { openTab } from "../../../hooks/tabsSlice";

const Sidebar = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.color.mode);
  const navigate = useNavigate();
  const location = useLocation();

  // const [activeMenu, setActiveMenu] = useState("");
  const [openMenus, setOpenMenus] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem("sidebarCollapsed");
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });

  const [shortcuts, setShortcuts] = useState(() => {
    try {
      const saved = localStorage.getItem("sidebarShortcuts");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("sidebarShortcuts", JSON.stringify(shortcuts));
  }, [shortcuts]);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const isDark = themeMode === "dark";
  const sidebarBg = isDark ? "#121212" : "#FDFBF7";
  const textColor = isDark ? "#F5F5F5" : "#1A1A1A";
  const lineStroke = isDark ? "rgba(255,255,255,0.1)" : "rgba(26,26,26,0.08)";
  const inputBg = isDark ? "bg-[#1A1A1A]" : "bg-white";
  const inputBorder = isDark ? "border-gray-800" : "border-gray-200";

  const { superAdmin } = useSelector((state) => state.campus);
  const { permissions } = useSelector((state) => state.permissions);

  const hasPermission = (perm) => {
    if (superAdmin) return true;
    return permissions?.includes(perm);
  };

  const MENU_CONFIG = useMemo(
    () => [
      { type: "header", label: "Main Menu" },
      {
        type: "link",
        label: "Dashboard",
        to: "/staff/dashboard",
        icon: <LayoutDashboard />,
        show: superAdmin,
      },
      {
        type: "link",
        label: "Admin Dashboard",
        to: "/staff/admindashboard",
        icon: <LayoutDashboard />,
        show: superAdmin,
      },
      {
        type: "link",
        label: "Staff Dashboard",
        to: "/staff/staffdashboard",
        icon: <LayoutDashboard />,
        show: !superAdmin,
      },
      {
        type: "dropdown",
        label: "Campuses",
        id: "Campuses",
        icon: <University />,
        show: hasPermission("CAMPUS_VIEW"),
        children: [
          {
            label: "Create Campuses",
            to: "/staff/campus/create-campus",
            show: hasPermission("CAMPUS_VIEW"),
          },
          {
            label: "Campus Payment Config",
            to: "/staff/FeesConfiguration/CampusPaymentConfiguration",
          },
        ],
      },
      {
        type: "dropdown",
        label: "User Management",
        id: "DisplayUsers",
        icon: <Users2 />,
        show: hasPermission("STAFF_VIEW"),
        children: [
          // { label: "Display Users", to: "/staff/managestaff/displaystaff" },
          {
            label: "Display Users New",
            to: "/staff/managestaff/displaystaff2",
          },
        ],
      },
      {
        type: "dropdown",
        label: "Roles Configuration",
        id: "RoleConfiguration",
        icon: <Lock />,
        show: hasPermission("ROLE_CREATE") || hasPermission("ROLE_VIEW"),
        children: [
          {
            label: "Global Roles Config",
            to: "/staff/globalroles/view-role",
            show: hasPermission("ROLE_VIEW"),
          },
          {
            label: "Campuses Roles Config",
            to: "/staff/campusroles/viewcampusroles",
            show: hasPermission("CAMPUS_VIEW"),
          },
        ],
      },
      { type: "header", label: "Branch configuration" },
      { type: "divider" },
      {
        type: "dropdown",
        label: "Academic Setup",
        id: "Branchconfiguration",
        icon: <BookOpen />,
        show: hasPermission("ACADEMIC_YEAR_VIEW"),
        children: [
          {
            label: "0 - Academic Setup Guide",
            to: "/staff/AcademicSetup/Academic-Setup-Guide",
          },
          {
            label: "1 - Create Board",
            to: "/staff/AcademicSetup/create-board",
          },
          {
            label: "2 - Create Medium",
            to: "/staff/AcademicSetup/create-medium",
          },
          {
            label: "3 - Academic Level",
            to: "/staff/AcademicSetup/academic-level",
          },
          {
            label: "4 - Branch Configuration",
            to: "/staff/AcademicSetup/create-branch-configuration",
          },
          {
            label: "5 - Create Academic Year",
            to: "/staff/AcademicSetup/create-academic-year",
          },
          {
            label: "6 - Year Configuration",
            to: "/staff/AcademicSetup/create-academic-year-configuration",
          },
          {
            label: "7 - Whole Structure",
            to: "/staff/AcademicSetup/full-configuration-structure",
          },
        ],
      },
      {
        type: "dropdown",
        label: "Admission Cycle",
        id: "AdmissionCycle",
        icon: <BookOpen />,
        show: hasPermission("ROLE_CREATE") || hasPermission("ROLE_VIEW"),
        children: [
          {
            label: "Create Admission Cycle",
            to: "/staff/admissioncycle/Create-Admission-Cycle",
          },
          {
            label: "Create Admission Cycle for BranchGrade",
            to: "/staff/admissioncycle/create-admission-cycle-for-branchGrade",
          },
        ],
      },
      // {
      //   type: "dropdown",
      //   label: "Fees Cycle",
      //   id: "FeesCycle",
      //   icon: <IndianRupee />,
      //   children: [
      //     {
      //       label: "1 Fees Category",
      //       to: "/staff/feescycle/add-fees-category",
      //     },
      //     { label: "2 Fees Head", to: "/staff/feescycle/create-fees-head" },
      //     { label: "3 Bank Account", to: "/staff/feescycle/bank-account" },
      //     {
      //       label: "4 Fees Bank Mapping",
      //       to: "/staff/feescycle/fees-bank-mapping",
      //     },
      //     {
      //       label: "5 Fee Structure Type",
      //       to: "/staff/feescycle/fee-structure-type",
      //     },
      //     { label: "6 Fee Structure", to: "/staff/feescycle/fee-structure" },
      //     { label: "7 Fees Due Dates", to: "/staff/feescycle/fees-due-dates" },
      //     {
      //       label: "8 Create Late Fee Policy",
      //       to: "/staff/feescycle/create-late-fee-policy",
      //     },
      //     {
      //       label: "9 Create Late Fee Mapping",
      //       to: "/staff/feescycle/create-late-fee-mapping",
      //     },
      //     {
      //       label: "10 Assign Fee to Strudent",
      //       to: "/staff/feescycle/assign-fee-to-strudent",
      //     },
      //     {
      //       label: "11 Campus Payment Config",
      //       to: "/staff/feescycle/campus-payment-config",
      //     },
      //     {
      //       label: "12 Student Payment Preference",
      //       to: "/staff/feescycle/student-payment-preference",
      //     },
      //     {
      //       label: "13 Students Preview for NACH",
      //       to: "/staff/feescycle/students-preview-for-NACH",
      //     },
      //     {
      //       label: "14 Create NACH Batch",
      //       to: "/staff/feescycle/create-nach-batch",
      //     },
      //   ],
      // },
      {
        type: "dropdown",
        label: "Fees",
        id: "FeesConfiguration",
        icon: <IndianRupee />,
        children: [
          {
            label: "Fees Configuration Guide",
            to: "/staff/FeesConfiguration/FeesConfigurationGuide",
          },
          {
            label: "Fees Configuration",
            children: [
              {
                label: "Fee Master Manager",
                to: "/staff/FeesConfiguration/FeeMasterManager",
              },
              {
                label: "Fee Policy And Mapping",
                to: "/staff/FeesConfiguration/FeePolicyAndMapping",
              },

            ],
          },
          {
            label: "Fee Structure And DueDates",
            to: "/staff/FeesConfiguration/FeeStructureAndDueDates",
          },
          {
            label: "Assign Fee to Strudent",
            to: "/staff/feescycle/assign-fee-to-strudent",
          },
          {
            label: "Student Payment Preferences",
            to: "/staff/FeesConfiguration/StudentPaymentPreferences",
          },
          {
            label: "NACH Unified Manager",
            to: "/staff/FeesConfiguration/NACHUnifiedManager",
          },
          {
            label: "Fee Payment Card",
            to: "/staff/FeesConfiguration/FeePaymentCard",
          },
          {
            label: "Payment Preference Manager",
            to: "/staff/FeesConfiguration/PaymentPreferenceManager",
          },
          {
            label: "Late Fee Manager",
            to: "/staff/FeesConfiguration/LateFeeManager",
          },
        ],
      },
      { type: "header", label: "Academic" },
      { type: "divider" },
      // {
      //   type: "dropdown",
      //   label: "Admission Cycle",
      //   id: "AdmissionCycle",
      //   icon: <BookOpen />,
      //   show: hasPermission("ROLE_CREATE") || hasPermission("ROLE_VIEW"),
      //   children: [
      //     {
      //       label: "Create Admission Cycle",
      //       to: "/staff/admissioncycle/Create-Admission-Cycle",
      //       show: hasPermission("ROLE_CREATE"),
      //     },
      //     {
      //       label: "Create Admission Cycle for BranchGrade",
      //       to: "/staff/admissioncycle/create-admission-cycle-for-branchGrade",
      //       show: hasPermission("ROLE_CREATE"),
      //     },
      //   ],
      // },

      {
        type: "dropdown",
        label: "Admission",
        id: "StudentAdmission",
        icon: <University />,
        children: [
          {
            label: "Enquiries List",
            to: "/staff/admission/student-enquiry-details",
          },
          // {
          //   label: "Enquiry Form",
          //   to: "/staff/admission/student-enquiry",
          // },
          {
            label: "Admission Dashboard",
            to: "/staff/admission/admission-dashboard",
          },
          {
            label: "Admission Form",
            to: "/staff/admission/student-admission",
          },
          {
            label: "Student Dashboard",
            to: "/staff/student/dashboard",
          },
        ],
      },
      {
        type: "dropdown",
        label: "Student",
        id: "studentApproval",
        icon: <UserCheck />,
        children: [
          {
            label: "Student Profile",
            to: "/staff/admission/student-profile",
            // show: hasPermission("ADMISSION_APPROVAL"),
          },
          {
            label: "Students List",
            to: "/staff/admission/studentlist",
            // show: hasPermission("ADMISSION_APPROVAL"),
          },
        ],
      },
      {
        type: "dropdown",
        label: "Document Management",
        id: "DocumentManagement",
        icon: <FileText />,
        children: [
          {
            label: "Document Configuration",
            to: "/staff/document-management/document-config",
          },
          {
            label: "Document Master",
            to: "/staff/document-management/document-master",
          },
        ],
      },
      { type: "divider" },
      { type: "header", label: "System" },
      { type: "custom_theme_toggle" },
      {
        type: "dropdown",
        label: "Appearance",
        id: "Theme",
        icon: <Palette />,
        isThemeSelector: true,
        children: [],
      },
    ],
    [superAdmin, permissions]
  );
  useEffect(() => {
    const openParents = (children, parents = []) => {
      for (let child of children) {
        if (child.to && location.pathname.startsWith(child.to)) {
          return parents;
        }

        if (child.children) {
          const found = openParents(child.children, [...parents, child.label]);
          if (found) return found;
        }
      }
      return null;
    };

    MENU_CONFIG.forEach((item) => {
      if (item.type === "dropdown" && item.children) {
        const parents = openParents(item.children, []);

        if (parents) {
          setOpenMenus((prev) => {
            const updated = { ...prev, [item.id]: true };
            parents.forEach((p) => (updated[p] = true));
            return updated;
          });
        }
      }
    });
  }, [location.pathname]);

  const searchableRoutes = useMemo(() => {
    const routes = [];
    MENU_CONFIG.forEach((item) => {
      if (item.type === "link")
        routes.push({ label: item.label, to: item.to, icon: item.icon });
      if (item.type === "dropdown" && item.children) {
        item.children.forEach((child) => {
          if (child.to)
            routes.push({ label: child.label, to: child.to, icon: item.icon });
        });
      }
    });
    return routes;
  }, [MENU_CONFIG]);

  const filteredRoutes = useMemo(() => {
    if (!searchQuery) return [];
    return searchableRoutes.filter((route) =>
      route.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, searchableRoutes]);

  const toggleShortcut = (e, to) => {
    e.preventDefault();
    e.stopPropagation();
    setShortcuts((prev) =>
      prev.includes(to) ? prev.filter((p) => p !== to) : [...prev, to]
    );
  };

  const activeShortcuts = useMemo(
    () => searchableRoutes.filter((r) => shortcuts.includes(r.to)),
    [shortcuts, searchableRoutes]
  );

  const toggleMenu = (menuName) => {
    if (isCollapsed) setIsCollapsed(false);

    setOpenMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) onClose();
  };

  const SidebarItem = ({ icon, label, to }) => {
    const isPinned = shortcuts.includes(to);
    return (
      <NavLink
        to={to}
        onClick={(e) => {
          e.preventDefault();
          dispatch(openTab({ path: to, label: label }));
          navigate(to);
          handleLinkClick();
        }}
        // This changes padding to a fixed 40px height for a high-density professional look
        className={({ isActive }) =>
          `group relative flex items-center h-10 px-3 mx-2 rounded-lg transition-all duration-200 ${
            isActive
              ? isDark
                ? "bg-[#FBCB8410] text-primary"
                : "bg-[#FBCB8415] text-primary"
              : "text-gray-500 hover:text-primary hover:bg-white/5"
          }`
        }
        style={({ isActive }) => (isActive ? { color: textColor } : {})}
      >
        {({ isActive }) => (
          <>
            <div
              className={`flex items-center ${
                isCollapsed ? "lg:justify-center" : "gap-3"
              } w-full`}
            >
              <span
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary transition-all ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />
              <span
                className={`transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-gray-400 group-hover:text-primary"
                }`}
              >
                {React.cloneElement(icon, {
                  size: 20,
                  strokeWidth: isActive ? 2.5 : 2,
                })}
              </span>
              <span
                className={`text-sm font-bold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${
                  isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
                }`}
              >
                {label}
              </span>
            </div>
            {!isCollapsed && (
              <button
                onClick={(e) => toggleShortcut(e, to)}
                className={`p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
                  isPinned
                    ? "opacity-100 text-yellow-400"
                    : "text-gray-300 hover:text-yellow-400"
                }`}
              >
                <Star size={16} fill={isPinned ? "currentColor" : "none"} />
              </button>
            )}
          </>
        )}
      </NavLink>
    );
  };

  const TreeItem = ({ item, isLast, level = 0 }) => {
    const isPinned = shortcuts.includes(item.to);
    const hasChildren = item.children && item.children.length > 0;

    // ✅ use global state instead of local
    const isOpen = openMenus[item.label];

    return (
      <>
        {item.to ? (
          <NavLink
            to={item.to}
            end
            onClick={(e) => {
              e.preventDefault();
              dispatch(openTab({ path: item.to, label: item.label }));
              navigate(item.to);
              handleLinkClick();
            }}
            className={({ isActive }) =>
              `relative flex items-center justify-between h-8 ml-5 pr-3 rounded-md transition-all group hover:bg-white/5 ${
                isActive ? "font-bold text-primary" : "text-gray-500"
              }`
            }
            style={({ isActive }) => (isActive ? { color: textColor } : {})}
          >
            <div className="flex items-center">
              {/* ✅ YOUR ORIGINAL TREE DESIGN (UNCHANGED) */}
              {level === 0 && (
                <span
                  className={`absolute left-0 top-0 w-px ${
                    isLast ? "h-1/2" : "h-full"
                  }`}
                  style={{ backgroundColor: lineStroke }}
                />
              )}
              <span
                className="absolute left-0 top-1/2 w-4 border-t"
                style={{ borderColor: lineStroke }}
              />
              <span
                className={`absolute left-[14px] top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border bg-white/10 group-hover:border-primary ${
                  isDark ? "border-white/20" : "border-gray-200"
                }`}
              />
              <span className="ml-8 text-[13px] whitespace-nowrap">
                {item.label}
              </span>
            </div>

            <button
              onClick={(e) => toggleShortcut(e, item.to)}
              className={`p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 ${
                isPinned
                  ? "opacity-100 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-400"
              }`}
            >
              <Star size={14} fill={isPinned ? "currentColor" : "none"} />
            </button>
          </NavLink>
        ) : (
          // 🔹 Parent node (expandable)
          <div
            onClick={() =>
              setOpenMenus((prev) => ({
                ...prev,
                [item.label]: !prev[item.label],
              }))
            }
            className="relative flex items-center justify-between h-8 ml-5 pr-3 cursor-pointer text-gray-400 hover:text-primary"
          >
            <div className="flex items-center">
              {/* ✅ ORIGINAL TREE DESIGN */}
              <span
                className="absolute left-0 top-0 h-full w-px"
                style={{ backgroundColor: lineStroke }}
              />
              <span
                className="absolute left-0 top-1/2 w-4 border-t"
                style={{
                  borderColor: lineStroke,
                  opacity: level === 0 ? 1 : 0.7,
                }}
              />
              <span className="ml-8 text-[13px]">{item.label}</span>
            </div>

            <ChevronDown
              size={14}
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        )}

        {/* 🔹 CHILDREN */}
        {hasChildren && isOpen && (
          <div className="relative ml-5">
            {/* vertical line */}
            <span
              className="absolute left-0 top-0 h-full w-px"
              style={{ backgroundColor: lineStroke }}
            />

            {item.children.map((child, idx) => (
              <TreeItem
                key={idx}
                item={child}
                level={level + 1}
                isLast={idx === item.children.length - 1}
              />
            ))}
          </div>
        )}
      </>
    );
  };
  const SidebarDropdown = ({
    icon,
    label,
    isOpen: menuOpen,
    onClick,
    children,
  }) => (
    <div className="mx-3 mb-1">
      <div
        onClick={onClick}
        className={`group flex items-center ${
          isCollapsed ? "lg:justify-center" : "justify-between"
        } p-3 rounded-xl cursor-pointer transition-all ${
          menuOpen
            ? "bg-white/5 text-primary"
            : "text-gray-500 hover:text-primary"
        }`}
      >
        <div
          className={`flex items-center ${
            isCollapsed ? "lg:justify-center" : "gap-3"
          } w-full`}
        >
          <span
            className={`transition-colors ${
              menuOpen
                ? "text-primary"
                : "text-gray-400 group-hover:text-primary"
            }`}
          >
            {React.cloneElement(icon, { size: 20 })}
          </span>
          <span
            className={`text-sm font-bold tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300 ${
              isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
            }`}
            style={{ color: menuOpen ? textColor : "" }}
          >
            {label}
          </span>
        </div>
        {!isCollapsed && (
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 shrink-0 ${
              menuOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </div>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          menuOpen && !isCollapsed
            ? "grid-rows-[1fr] opacity-100 mt-1"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );

  return (
    <>
      {/* OVERLAY (z-40): 
          Hidden on desktop (lg:hidden). Covers the app when sidebar is open on mobile.
      */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden transition-all duration-300 
          ${
            isOpen ? "opacity-100 visible z-[40]" : "opacity-0 invisible z-[-1]"
          }`}
        onClick={onClose}
      />

      {/* ASIDE (z-50): 
          Primary sidebar container.
      */}
      <aside
        style={{
          backgroundColor: sidebarBg,
          color: textColor,
          borderColor: lineStroke,
        }}
        // This reduces the sidebar from 288px to 240px and makes the collapsed version tighter
        className={`fixed inset-y-0 left-0 z-[50] border-r transition-all duration-300 ease-in-out flex flex-col ${
          isDark ? "bg-[#09090B] border-white/5" : "bg-white border-gray-100"
        } ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        } lg:translate-x-0 lg:static ${
          isCollapsed ? "lg:w-[68px]" : "lg:w-60"
        }`}
      >
        {/* COLLAPSE BUTTON (z-60): 
            Floating toggle for desktop. Needs higher z-index to stay above sidebar borders.
        */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute -right-3 top-20 z-[60] hidden lg:flex items-center justify-center w-6 h-6 rounded-full shadow-md border transition-colors ${
            isDark
              ? "bg-[#1A1A1A] border-gray-700 text-gray-300 hover:text-white"
              : "bg-white border-gray-200 text-gray-500 hover:text-primary"
          }`}
        >
          {isCollapsed ? (
            <ChevronsRight size={14} />
          ) : (
            <ChevronsLeft size={14} />
          )}
        </button>

        <div className={`p-6 pb-4 ${isCollapsed ? "lg:px-2" : "p-6"}`}>
          <div className="flex items-center justify-between mb-6">
            <div
              className={`flex items-center h-14 px-4 mb-2 ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <div className="w-8 h-8 bg-[#1A1A1A] rounded-lg flex items-center justify-center shadow-lg shrink-0">
                <Layers className="text-primary" size={18} strokeWidth={2.5} />
              </div>
              <div
                className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                  isCollapsed ? "lg:w-0 lg:opacity-0" : "w-auto opacity-100"
                }`}
              >
                <h1 className="text-xl font-bold tracking-tight">Eduverse</h1>
                <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">
                  Admin Portal
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-gray-500"
            >
              <X size={24} />
            </button>
          </div>

          <div
            className={`relative flex items-center rounded-xl border transition-all ${inputBg} ${inputBorder} ${
              isCollapsed
                ? "lg:justify-center lg:p-2 cursor-pointer"
                : "px-3 py-2.5 focus-within:ring-2 ring-primary/20"
            }`}
            onClick={() => isCollapsed && setIsCollapsed(false)}
          >
            <Search size={14} className="text-gray-500 min-w-[14px]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`bg-transparent border-none outline-none text-xs font-medium ml-2 placeholder:text-gray-500 ${textColor} transition-all duration-300 ${
                isCollapsed ? "lg:w-0 lg:opacity-0 p-0" : "w-full opacity-100"
              }`}
            />
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-2 pb-10 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {activeShortcuts.length > 0 && !searchQuery && (
            <div className="mb-4 animate-in slide-in-from-left duration-300">
              {!isCollapsed && (
                <div className="px-5 mb-2 flex items-center gap-2">
                  <Star size={12} className="text-primary fill-primary" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Quick Access
                  </span>
                </div>
              )}
              {activeShortcuts.map((route, idx) => (
                <SidebarItem
                  key={`sc-${idx}`}
                  icon={route.icon}
                  label={route.label}
                  to={route.to}
                />
              ))}
              <div
                className="my-4 mx-5 border-t"
                style={{ borderColor: lineStroke }}
              ></div>
            </div>
          )}

          {searchQuery ? (
            <div className="mt-2 animate-in fade-in duration-200">
              {filteredRoutes.map((route, idx) => (
                <SidebarItem
                  key={idx}
                  icon={route.icon}
                  label={route.label}
                  to={route.to}
                />
              ))}
            </div>
          ) : (
            <div className="animate-in fade-in duration-200 mt-2">
              {MENU_CONFIG.filter((item) => item.show !== false).map(
                (item, index) => {
                  if (item.type === "header") {
                    if (isCollapsed)
                      return <div key={index} className="h-4"></div>;
                    return (
                      <div key={index} className="px-5 mb-2 mt-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {item.label}
                        </span>
                      </div>
                    );
                  }
                  if (item.type === "divider")
                    return (
                      <div
                        key={index}
                        className="my-6 mx-5 border-t"
                        style={{ borderColor: lineStroke }}
                      ></div>
                    );
                  if (item.type === "link")
                    return (
                      <SidebarItem
                        key={index}
                        icon={item.icon}
                        label={item.label}
                        to={item.to}
                      />
                    );
                  if (item.type === "custom_theme_toggle" && !isCollapsed) {
                    return (
                      <div
                        key={index}
                        className="mx-3 mb-4 flex bg-gray-500/10 p-1 rounded-xl"
                      >
                        <button
                          onClick={() => dispatch(setThemeMode("light"))}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                            !isDark
                              ? "bg-white shadow text-black"
                              : "text-gray-400"
                          }`}
                        >
                          <Sun size={14} /> Light
                        </button>
                        <button
                          onClick={() => dispatch(setThemeMode("dark"))}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                            isDark ? "bg-[#0D1116] text-white" : "text-gray-400"
                          }`}
                        >
                          <Moon size={14} /> Dark
                        </button>
                      </div>
                    );
                  }
                  if (item.type === "dropdown") {
                    return (
                      <SidebarDropdown
                        key={index}
                        icon={item.icon}
                        label={item.label}
                        isOpen={openMenus[item.id]}
                        onClick={() => toggleMenu(item.id)}
                      >
                        {item.isThemeSelector
                          ? !isCollapsed && (
                              <div className="ml-6 py-3 px-4 mt-1 bg-white/5 dark:bg-white/10 rounded-xl border border-gray-200/10 shadow-sm">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3 block">
                                  BG Accent
                                </span>
                                <div className="flex flex-wrap gap-2">
                                  {[
                                    "#F4F6F8",
                                    "#EFF2F9",
                                    "#FAFAFA",
                                    "#E4EBF1",
                                    "#D4E2EF",
                                    "#F5F7FA",
                                    "#EEF2F5",
                                    "#E9EFF5",
                                    "#ECF3F1",
                                    "#D7DBDA",
                                    "#B5BFC6",
                                  ].map((color) => (
                                    <button
                                      key={color}
                                      onClick={() =>
                                        dispatch(changeColor(color))
                                      }
                                      className="w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-all"
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                              </div>
                            )
                          : item.children?.map((child, cIdx) => (
                              <TreeItem
                                key={cIdx}
                                item={child}
                                isLast={cIdx === item.children.length - 1}
                              />
                            ))}
                      </SidebarDropdown>
                    );
                  }
                  return null;
                }
              )}
            </div>
          )}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

