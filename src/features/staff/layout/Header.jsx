// import React from "react";
// import { Search, Globe, HelpCircle, Bell, LogOut, Menu } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { logout } from "../../../hooks/authSlice";
// const Header = ({ toggleSidebar }) => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const role = useSelector((state) => state.auth.role);
//   const themeMode = useSelector((state) => state.color.mode);
//   const isDark = themeMode === "dark";
//   const textColor = isDark ? "#F5F5F5" : "#1A1A1A";
//   const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(26,26,26,0.05)";

//   const handleLogout = () => {
//     dispatch(logout());
//     navigate("/login", { replace: true });
//   };

//   const currentDate = new Date().toLocaleDateString("en-US", {
//     weekday: "long",
//     month: "short",
//     day: "numeric",
//   });

//   const IconButton = ({ icon, dot, onClick, className = "" }) => (
//     <button
//       onClick={onClick}
//       style={{ color: textColor, borderColor: borderColor }}
//       className={`relative p-2 bg-white/5 dark:bg-white/10 border border-gray-100 rounded-xl shadow-sm hover:shadow-md hover:border-[#FBCB84] hover:text-[#FBCB84] transition-all duration-300 group ${className}`}
//     >
//       {React.cloneElement(icon, { size: 20 })}
//       {dot && (
//         <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
//       )}
//     </button>
//   );

//   return (
//     <header
//       className="relative z-30 w-full backdrop-blur-md border-b shadow-sm"
//       style={{ borderColor: borderColor }}
//     >
//       <div className="flex items-center justify-between px-4 py-3 md:px-8 md:py-4">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={toggleSidebar}
//             className="md:hidden p-2.5 bg-[#1A1A1A] text-white rounded-xl shadow-lg active:scale-95 transition-all"
//           >
//             <Menu size={20} />
//           </button>
//           <div className="flex flex-col">
//             <h1
//               style={{ color: textColor }}
//               className="text-lg md:text-2xl font-bold tracking-tight"
//             >
//               Dashboard
//             </h1>
//             <p className="hidden md:flex text-xs font-medium text-gray-400 mt-0.5 items-center gap-2">
//               <span className="w-1.5 h-1.5 rounded-full bg-[#FBCB84]"></span>
//               {currentDate}
//             </p>
//           </div>
//         </div>

//         <div className="hidden md:block flex-1 max-w-xl mx-8">
//           <div className="relative group">
//             <Search
//               size={18}
//               className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 group-focus-within:text-[#FBCB84] transition-colors"
//             />
//             <input
//               type="text"
//               placeholder="Search..."
//               style={{ color: textColor, borderColor: borderColor }}
//               className="w-full pl-11 pr-4 py-2.5 bg-white/5 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FBCB84]/50 transition-all"
//             />
//           </div>
//         </div>

//         <div className="flex items-center gap-2 md:gap-4">
//           <IconButton icon={<LogOut />} dot={true} onClick={handleLogout} />
//           <IconButton icon={<Bell />} dot={true} />
//           <div className="hidden md:flex items-center gap-2">
//             <IconButton icon={<Globe />} />
//             <IconButton icon={<HelpCircle />} />
//           </div>
//           <div className="h-6 w-[1px] bg-gray-200/20 mx-1"></div>
//           <div className="flex items-center gap-3 group cursor-pointer">
//             <div className="hidden lg:block text-right">
//               <p style={{ color: textColor }} className="text-sm font-bold">
//                 Alex Johnson
//               </p>
//               <span className="text-[10px] font-bold uppercase bg-gray-500/10 text-gray-400 px-2 py-0.5 rounded border border-gray-500/20">
//                 {role || "Admin"}
//               </span>
//             </div>
//             <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-white p-0.5 border border-gray-200 overflow-hidden shadow-sm">
//               <img
//                 src="https://ui-avatars.com/api/?name=Admin&background=1A1A1A&color=FBCB84"
//                 className="w-full h-full rounded-[10px] object-cover"
//                 alt="Profile"
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;
// import React, { useEffect, useState } from "react";
// import {
//   Search,
//   Bell,
//   ChevronDown,
//   Plus,
//   Command,
//   Settings,
//   User,
//   LogOut,
//   Calendar,
//   Building,
//   Menu
// } from "lucide-react";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { logout } from "../../../hooks/authSlice";
// import { setSelectedCampus } from "../../../hooks/campusSlice";
// import { clearPermissions, fetchPermissions } from "../../../hooks/permissionsSlice";
// import { clearTabs } from "../../../hooks/tabsSlice";

// const Header = ({ toggleSidebar }) => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate(); // 2. Initialize navigate
//   const { role, user_id } = useSelector((state) => state.auth);
//   //for campus selection dropdown
//   const { campuses, selectedCampus, superAdmin } = useSelector((state) => state.campus);

//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [isCampusOpen, setIsCampusOpen] = useState(false);
//   const [isSearchOpen, setIsSearchOpen] = useState(false);

//   const themeMode = useSelector((state) => state.color.mode);
//   const isDark = themeMode === "dark";
//   const textColor = isDark ? "#F5F5F5" : "#1A1A1A";


//   const handleLogout = () => {
//     dispatch(logout());
//     dispatch(clearTabs()); // Clear all user tabs
//     localStorage.removeItem("activeTabs");
//     localStorage.removeItem("activePath");

//     navigate("/login", { replace: true });
//   };

//   console.log("selectedCampus:", selectedCampus);
//   console.log("campuses:", campuses);

//   useEffect(() => {
//     if (selectedCampus && !superAdmin) {
//       dispatch(clearPermissions());
//       dispatch(fetchPermissions(selectedCampus));
//     }
//   }, [selectedCampus, superAdmin, dispatch]);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (isCampusOpen && !event.target.closest('.campus-dropdown')) {
//         setIsCampusOpen(false);
//       }
//       if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
//         setIsProfileOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [isCampusOpen, isProfileOpen]);


//   return (
//     <>
//       <header className={`h-16 md:h-20 w-full ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'} backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-6 lg:px-8 z-40`}>

//         <div className="flex items-center gap-2 flex-1 min-w-0 max-w-full">

//           {/* MENU BUTTON */}
//           <button
//             onClick={toggleSidebar}
//             className="block lg:hidden shrink-0 p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
//           >
//             <Menu size={20} />
//           </button>

//           {/* SEARCH BAR */}
//           <div className="relative hidden sm:block w-full max-w-[400px] md:max-w-[500px] lg:max-w-[600px]">
//             <button
//               onClick={() => setIsSearchOpen(true)}
//               className="sm:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
//             >
//               <Search size={18} className="text-gray-600 dark:text-gray-400" />
//             </button>

//             <input
//               type="text"
//               placeholder="Search anything..."
//               className={`w-full rounded-xl py-2.5 pl-10 pr-4 text-sm  ${isDark ? "text-white" : "text-black"}`}
//             />
//           </div>

//         </div>
//         {/* Mobile Search Button */}
//         <button className="sm:hidden p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
//           <Search size={18} className="text-gray-600 dark:text-gray-400" />
//         </button>

//         {/* Right Actions */}
//         <div className="flex items-center gap-2 md:gap-3 lg:gap-4 shrink-0">
//           &nbsp;
//           {/* Campus List Dropdown */}
//           <div className="relative flex md:flex campus-dropdown">
//             <button
//               onClick={() => setIsCampusOpen(!isCampusOpen)}
//               className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed bg-primary border-primary mr-2 hover:bg-primary/80 transition-all"
//             >
//               <Calendar size={14} className="text-gray-800" />
//               <span className="hidden md:inline text-xs font-bold">
//                 {selectedCampus ? campuses.find(c => c.campusId === selectedCampus)?.campusName || "Select Campus" : "Select Campus"}
//               </span>
//               <ChevronDown
//                 size={14}
//                 className={`text-gray-800 transition-transform ${isCampusOpen ? "rotate-180" : ""
//                   }`}
//               />
//             </button>

//             {/* Campus Dropdown Menu */}
//             {isCampusOpen && (
//               <>
//                 {/* Backdrop to close dropdown when clicking outside */}
//                 <div
//                   className="fixed inset-0 z-40"
//                   onClick={() => setIsCampusOpen(false)}
//                 />
//                 <div className={`absolute left-0 mt-3 w-48 lg:w-56 ${isDark ? 'bg-[#1a1a1a] text-white' : 'bg-white  text-black'} border border-white/10 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200 max-h-64 overflow-y-auto z-50`}>
//                   {campuses?.map((campus) => (
//                     <button
//                       key={campus.campusId}
//                       onClick={async (e) => {
//                         e.stopPropagation(); // Prevent event bubbling

//                         // Disable campus selection for super admins
//                         if (superAdmin) {
//                           return; // Don't do anything for super admins
//                         }

//                         // Only dispatch if campus is actually different
//                         if (selectedCampus !== campus.campusId) {
//                           dispatch(setSelectedCampus(campus.campusId));
//                           dispatch(clearTabs()); // Clear tabs when changing campus
//                           navigate("/staff/staffdashboard", { replace: true });
//                         }

//                         setIsCampusOpen(false);
//                       }}
//                       className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all`}
//                     // ${
//                     // superAdmin 
//                     //   ? 'text-gray-500 cursor-not-allowed opacity-60' // Disabled state for super admin
//                     //   : selectedCampus === campus.campusId
//                     //     ? 'bg-primary/20 text-primary font-bold'
//                     //     : 'text-gray-400 hover:bg-gray-400/20 cursor-pointer'
//                     // }

//                     // disabled={superAdmin} // Disable button for super admin
//                     >
//                       <Building size={18} />
//                       {/* {campus.campusId} &nbsp; */}
//                       {campus.campusName}
//                     </button>
//                   ))}
//                 </div>
//               </>
//             )}
//           </div>

//           {/* <button className="hidden sm:flex items-center gap-2 bg-[#FBCB84] hover:bg-[#faba5f] text-black px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all active:scale-95 shadow-lg shadow-[#FBCB84]/10">
//             <Plus size={16} />
//             <span className="hidden md:inline">Quick Action</span>
//             <span className="md:hidden">+</span>
//           </button> */}

//           {/* Mobile Quick Action Button */}
//           {/* <button className="sm:hidden p-2 rounded-xl bg-[#FBCB84] hover:bg-[#faba5f] text-black transition-all active:scale-95 shadow-lg shadow-[#FBCB84]/10">
//             <Plus size={18} />
//           </button> */}

//           <button className={`relative p-2.5 bg-primary border border-white/5 rounded-xl transition-colors`}>
//             <Bell size={20} />
//             <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#111]"></span>
//           </button>

//           <div className="w-[1px] h-8 bg-white/5"></div>

//           {/* Profile Section */}
//           <div className="relative profile-dropdown">
//             <button
//               onClick={() => setIsProfileOpen(!isProfileOpen)}
//               className="flex items-center gap-2 md:gap-3 hover:bg-white/5 p-1.5 pr-2 md:pr-3 rounded-2xl transition-all"
//             >
//               <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center overflow-hidden">
//                 <img
//                   src={`https://ui-avatars.com/api/?name=${user_id || "User"
//                     }&background=FBCB84&color=000`}
//                   alt="Profile"
//                   className="w-full h-full rounded-[10px] object-cover"
//                 />
//               </div>
//               <div className="text-left hidden md:block">
//                 <p className={`text-sm font-bold leading-none ${isDark ? 'text-white' : 'text-black'}`}>
//                   {user_id || "Admin"}
//                 </p>
//                 <p className={`text-[10px] font-bold uppercase tracking-wider mt-1 ${isDark ? 'text-[#FBCB84]' : 'text-[#FBCB84]'}`}>
//                   {role || "Super Admin"}
//                 </p>
//               </div>
//               <ChevronDown
//                 size={14}
//                 className={`text-gray-500 transition-transform ${isProfileOpen ? "rotate-180" : ""
//                   }`}
//               />
//             </button>

//             {/* Dropdown Menu */}
//             {isProfileOpen && (
//               <>
//                 {/* Backdrop to close dropdown when clicking outside */}
//                 <div
//                   className="fixed inset-0 z-40"
//                   onClick={() => setIsProfileOpen(false)}
//                 />
//                 <div className={`absolute right-0 mt-3 w-48 md:w-56 ${isDark ? 'bg-[#1a1a1a]' : 'bg-white'} border border-white/10 rounded-2xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 duration-200`}>
//                   <button
//                     onClick={() => {
//                       // Navigate dynamically based on role (staff or student)
//                       const path = role?.toLowerCase() === "student" ? "/student" : "/staff";
//                       navigate(`${path}/UserProfile`);
//                       setIsProfileOpen(false);
//                     }}
//                     className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-gray-400/20 rounded-xl transition-all"
//                   >
//                     <User size={18} /> My Profile
//                   </button>
//                   <button
//                     onClick={() => { navigate("/settings"); setIsProfileOpen(false); }}
//                     className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-400 hover:bg-gray-400/20  rounded-xl transition-all"
//                   >
//                     <Settings size={18} /> Settings
//                   </button>
//                   <div className="h-px bg-white/5 my-1 mx-2"></div>
//                   <button
//                     onClick={handleLogout}
//                     className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
//                   >
//                     <LogOut size={18} /> Logout
//                   </button>
//                 </div>
//               </>
//             )}
//           </div>
//         </div>
//       </header>
//       {isSearchOpen && (
//         <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start p-4">

//           <div className="w-full bg-white dark:bg-[#1a1a1a] rounded-xl p-4 flex items-center gap-3">

//             <Search size={18} className="text-gray-400" />

//             <input
//               autoFocus
//               type="text"
//               placeholder="Search..."
//               className="flex-1 bg-transparent outline-none text-black dark:text-white"
//             />

//             <button
//               onClick={() => setIsSearchOpen(false)}
//               className="text-sm text-red-500"
//             >
//               Close
//             </button>

//           </div>
//         </div>
//       )}
//     </>
//   );
// };0.

// export default Header;

// import React, { useEffect, useState } from "react";
// import {
//   Search,
//   Bell,
//   ChevronDown,
//   Settings,
//   User,
//   LogOut,
//   Building,
//   Menu,
//   X,
//   Palette // Added for color selection icon
// } from "lucide-react";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { logout } from "../../../hooks/authSlice";
// import { setSelectedCampus } from "../../../hooks/campusSlice";
// import { clearPermissions, fetchPermissions } from "../../../hooks/permissionsSlice";
// import { clearTabs } from "../../../hooks/tabsSlice";
// // Import your action to update the color
// import { setPrimaryColor } from "../../../hooks/themeSlice"; 

// const Header = ({ toggleSidebar }) => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // Redux Selectors
//   const { role, user_id } = useSelector((state) => state.auth);
//   const { campuses, selectedCampus, superAdmin } = useSelector((state) => state.campus);
//   const themeMode = useSelector((state) => state.color.mode);
  
//   // Dynamic Color from Redux
//   const brandColor = useSelector((state) => state.color.primaryColor || "#FBCB84");

//   const [isProfileOpen, setIsProfileOpen] = useState(false);
//   const [isCampusOpen, setIsCampusOpen] = useState(false);
//   const [isSearchOpen, setIsSearchOpen] = useState(false);

//   const isDark = themeMode === "dark";

//   // EFFECT: This is the bridge between Redux and Tailwind CSS
//   useEffect(() => {
//     document.documentElement.style.setProperty('--color-primary', brandColor);
//   }, [brandColor]);

//   const handleLogout = () => {
//     dispatch(logout());
//     dispatch(clearTabs());
//     localStorage.clear();
//     navigate("/login", { replace: true });
//   };

//   const handleColorChange = (color) => {
//     dispatch(setPrimaryColor(color));
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (!event.target.closest('.header-dropdown-root')) {
//         setIsCampusOpen(false);
//         setIsProfileOpen(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const currentCampusName = campuses?.find(c => c.campusId === selectedCampus)?.campusName || "Campus";

//   return (
//     <>
//       <header className={`h-14 w-full sticky top-0 z-40 border-b transition-all duration-300
//         ${isDark ? 'bg-[#1a1a1a]/90 border-white/5' : 'bg-white/90 border-gray-100'} 
//         backdrop-blur-md header-dropdown-root`}>
        
//         <div className="h-full px-4 flex items-center justify-between gap-4">
          
//           <div className="flex items-center gap-3">
//             <button 
//               onClick={toggleSidebar} 
//               className={`lg:hidden p-1.5 rounded-md transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
//             >
//               <Menu size={18} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
//             </button>
            
//             <div className="relative">
//               <button
//                 onClick={() => setIsCampusOpen(!isCampusOpen)}
//                 className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] font-bold tracking-tight transition-all
//                   ${isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' 
//                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-primary/50'}`}
//               >
//                 <Building size={13} className="text-primary" />
//                 <span className="max-w-[120px] truncate uppercase">{currentCampusName}</span>
//                 <ChevronDown size={10} className={`transition-transform duration-200 ${isCampusOpen ? 'rotate-180' : ''}`} />
//               </button>

//               {isCampusOpen && (
//                 <div className={`absolute left-0 mt-2 w-60 rounded-xl border shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95
//                   ${isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-gray-100'}`}>
//                   {campuses?.map((campus) => (
//                     <button
//                       key={campus.campusId}
//                       onClick={() => {
//                         if (!superAdmin && selectedCampus !== campus.campusId) {
//                           dispatch(setSelectedCampus(campus.campusId));
//                           dispatch(clearTabs());
//                         }
//                         setIsCampusOpen(false);
//                       }}
//                       className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between
//                         ${selectedCampus === campus.campusId ? 'bg-primary/10 text-primary font-bold' : 'text-gray-400 hover:bg-white/5'}`}
//                     >
//                       {campus.campusName}
//                       {selectedCampus === campus.campusId && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="flex items-center gap-1">
//             <button onClick={() => setIsSearchOpen(true)} className="p-2 rounded-lg text-gray-500 hover:text-primary transition-colors">
//               <Search size={18} />
//             </button>

//             <button className="p-2 rounded-lg text-gray-500 hover:text-primary relative">
//               <Bell size={18} />
//               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#1a1a1a]"></span>
//             </button>

//             <div className={`w-[1px] h-4 mx-2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}></div>

//             <div className="relative">
//               <button
//                 onClick={() => setIsProfileOpen(!isProfileOpen)}
//                 className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-all group"
//               >
//                 <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black text-[10px] text-white shadow-lg shadow-primary/10">
//                   {user_id?.substring(0, 2).toUpperCase() || "AD"}
//                 </div>
//                 <ChevronDown size={12} className="text-gray-500 group-hover:text-primary transition-colors" />
//               </button>

//               {isProfileOpen && (
//                 <div className={`absolute right-0 mt-2 w-56 rounded-xl border shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2
//                   ${isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-gray-100'}`}>
                  
//                   {/* User Info */}
//                   <div className="px-4 py-3 border-b border-white/5 mb-1">
//                     <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">{role || "Staff"}</p>
//                     <p className={`text-xs font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{user_id}</p>
//                   </div>
                  
//                   <MenuItem onClick={() => navigate(role === "Student" ? "/student/UserProfile" : "/staff/UserProfile")} icon={<User size={14}/>} label="Profile" isDark={isDark} />
                  
//                   {/* BRAND COLOR SELECTOR SECTION */}
//                   <div className="px-4 py-2">
//                     <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-gray-500 uppercase">
//                       <Palette size={12} /> Theme Color
//                     </div>
//                     <div className="flex gap-2">
//                       {["#FBCB84", "#3852B4", "#E11D48", "#10B981", "#BA5624"].map((color) => (
//                         <button
//                           key={color}
//                           onClick={() => handleColorChange(color)}
//                           className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${brandColor === color ? 'border-white' : 'border-transparent'}`}
//                           style={{ backgroundColor: color }}
//                         />
//                       ))}
//                     </div>
//                   </div>

//                   <div className="h-px bg-white/5 my-1 mx-2" />
                  
//                   <button
//                     onClick={handleLogout}
//                     className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-500 hover:bg-red-500/10 transition-colors font-semibold"
//                   >
//                     <LogOut size={14} /> Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </header>

//       {isSearchOpen && (
//         <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-start justify-center p-4 pt-[10vh]">
//           <div className={`w-full max-w-xl rounded-2xl shadow-2xl border p-2 flex items-center gap-3 animate-in fade-in slide-in-from-top-8
//             ${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-100'}`}>
//             <Search size={20} className="ml-3 text-primary" />
//             <input 
//               autoFocus 
//               type="text" 
//               placeholder="Search anything..." 
//               className="flex-1 h-12 bg-transparent outline-none text-sm text-gray-400"
//             />
//             <button 
//               onClick={() => setIsSearchOpen(false)}
//               className="px-3 py-1 text-[10px] font-bold text-gray-500 hover:text-white uppercase"
//             >
//               ESC
//             </button>
//           </div>
//           <div className="fixed inset-0 -z-10" onClick={() => setIsSearchOpen(false)} />
//         </div>
//       )}
//     </>
//   );
// };

// const MenuItem = ({ onClick, icon, label, isDark }) => (
//   <button
//     onClick={onClick}
//     className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-colors
//       ${isDark ? 'text-gray-400 hover:bg-white/5 hover:text-primary' 
//                : 'text-gray-600 hover:bg-gray-50 hover:text-primary'}`}
//   >
//     {icon} {label}
//   </button>
// );

// export default Header;



import React, { useEffect, useState } from "react";
import {
  Search,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Building,
  Menu,
  Palette
} from "lucide-react";

import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../../../hooks/authSlice";
import { setSelectedCampus } from "../../../hooks/campusSlice";
import { clearPermissions, fetchPermissions } from "../../../hooks/permissionsSlice";
import { clearTabs } from "../../../hooks/tabsSlice";
import { setPrimaryColor } from "../../../hooks/themeSlice";

const Header = ({ toggleSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { role, user_id } = useSelector((state) => state.auth);
  const { campuses, selectedCampus, superAdmin } = useSelector((state) => state.campus);
  const themeMode = useSelector((state) => state.color.mode);
  const brandColor = useSelector((state) => state.color.primaryColor || "#FBCB84");

  const isDark = themeMode === "dark";

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCampusOpen, setIsCampusOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // ✅ Apply dynamic theme color
  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", brandColor);
  }, [brandColor]);

  // ✅ FIX: campus change logic (THIS WAS MISSING)
  useEffect(() => {
    if (selectedCampus && !superAdmin) {
      dispatch(clearPermissions());
      dispatch(fetchPermissions(selectedCampus));
    }
  }, [selectedCampus, superAdmin, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearTabs());
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const handleColorChange = (color) => {
    dispatch(setPrimaryColor(color));
  };

  // close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".header-dropdown-root")) {
        setIsCampusOpen(false);
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentCampusName =
    campuses?.find((c) => c.campusId === selectedCampus)?.campusName || "Campus";

  return (
    <>
      <header
        className={`h-14 w-full sticky top-0 z-40 border-b transition-all duration-300
        ${isDark ? "bg-[#1a1a1a]/90 border-white/5" : "bg-white/90 border-gray-100"}
        backdrop-blur-md header-dropdown-root`}
      >
        <div className="h-full px-4 flex items-center justify-between gap-4">
          
          {/* LEFT */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className={`lg:hidden p-1.5 rounded-md ${
                isDark ? "hover:bg-white/10" : "hover:bg-gray-100"
              }`}
            >
              <Menu size={18} />
            </button>

            {/* CAMPUS */}
            <div className="relative">
              <button
                onClick={() => setIsCampusOpen(!isCampusOpen)}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[11px] font-bold
                  ${
                    isDark
                      ? "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                      : "bg-gray-50 border-gray-200 text-gray-700 hover:border-primary/50"
                  }`}
              >
                <Building size={13} className="text-primary" />
                <span className="max-w-[120px] truncate uppercase">
                  {currentCampusName}
                </span>
                <ChevronDown
                  size={10}
                  className={`transition-transform ${
                    isCampusOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isCampusOpen && (
                <div
                  className={`absolute left-0 mt-2 w-60 rounded-xl border shadow-2xl py-1 z-50
                  ${isDark ? "bg-[#1e1e1e] border-white/10" : "bg-white border-gray-100"}`}
                >
                  {campuses?.map((campus) => (
                    <button
                      key={campus.campusId}
                      onClick={() => {
                        if (superAdmin) return;

                        if (selectedCampus !== campus.campusId) {
                          dispatch(setSelectedCampus(campus.campusId));
                          dispatch(clearTabs());
                          navigate("/staff/staffdashboard", { replace: true });
                        }

                        setIsCampusOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs flex justify-between
                        ${
                          selectedCampus === campus.campusId
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-gray-400 hover:bg-white/5"
                        }`}
                    >
                      {campus.campusName}
                      {selectedCampus === campus.campusId && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-lg text-gray-500 hover:text-primary"
            >
              <Search size={18} />
            </button>

            <button className="p-2 rounded-lg text-gray-500 hover:text-primary relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className={`w-[1px] h-4 mx-2 ${isDark ? "bg-white/10" : "bg-gray-200"}`} />

            {/* PROFILE */}
            <div className="relative">
            <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black text-[10px] text-white shadow-lg shadow-primary/10">
                  {user_id?.substring(0, 2).toUpperCase() || "AD"}
                </div>
                <ChevronDown size={12} className="text-gray-500 group-hover:text-primary transition-colors" />
              </button>

              {isProfileOpen && (
                <div className={`absolute right-0 mt-2 w-56 rounded-xl border shadow-2xl py-1 z-50 animate-in fade-in slide-in-from-top-2
                  ${isDark ? 'bg-[#1e1e1e] border-white/10' : 'bg-white border-gray-100'}`}>
                  
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-white/5 mb-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-1">{role || "Staff"}</p>
                    <p className={`text-xs font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{user_id}</p>
                  </div>
                  
                  <MenuItem onClick={() => navigate(role === "Student" ? "/student/UserProfile" : "/staff/UserProfile")} icon={<User size={14}/>} label="Profile" isDark={isDark} />
                  
                  {/* BRAND COLOR SELECTOR SECTION */}
                  <div className="px-4 py-2">
                    <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-gray-500 uppercase">
                      <Palette size={12} /> Theme Color
                    </div>
                    <div className="flex gap-2">
                      {["#FBCB84", "#3852B4", "#E11D48", "#10B981", "#BA5624"].map((color) => (
                        <button
                          key={color}
                          onClick={() => handleColorChange(color)}
                          className={`w-5 h-5 rounded-full border-2 transition-transform hover:scale-110 ${brandColor === color ? 'border-white' : 'border-transparent'}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-white/5 my-1 mx-2" />
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-red-500 hover:bg-red-500/10 transition-colors font-semibold"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

const MenuItem = ({ onClick, icon, label }) => (
  <button onClick={onClick} className="w-full flex gap-2 px-4 py-2 text-xs">
    {icon} {label}
  </button>
);

export default Header;