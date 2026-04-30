// import React, { useState } from "react";
// import { useSelector } from "react-redux";
// import {
//   Plus, X, Users, Wallet, Calendar, FileText, Bell, ClipboardList, Info,
//   Clock, Gift, MessageSquare, Download, Smartphone, BookOpen, 
//   ChevronRight, AlertCircle, CheckCircle2, MoreHorizontal
// } from "lucide-react";
// import StudentAdmission from "./StudentAdmission/StudentAdmission";

// const DashboardHome = () => {
//   const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
//   const themeMode = useSelector((state) => state.color.mode);
//   const isDark = themeMode === "dark";

//   // R&D Design Tokens
//   const cardBase = `rounded-[2rem] border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
//     isDark ? "bg-[#1A1A1A] border-white/5 shadow-black/40" : "bg-white border-gray-100 shadow-gray-200/40"
//   }`;
  
//   const accentText = isDark ? "text-primary" : "text-primary";
//   const mutedText = "text-gray-500 font-medium text-xs";

//   return (
//     <div className={`min-h-screen ${isDark ? 'bg-[#0F0F0F]' : 'bg-gray-50/50'} px-4 py-8 lg:px-10`}>
      
//       {/* --- HEADER SECTION: Smart Profile Hub --- */}
//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
//         <div className={`${cardBase} lg:col-span-8 p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden`}>
//           {/* Decorative background blur */}
//           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
          
//           <div className="relative">
//             <div className="w-28 h-28 rounded-3xl border-4 border-primary/20 overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-500">
//               <img src="https://ui-avatars.com/api/?name=Siddharth+Balar&background=0D8ABC&color=fff&size=128" alt="Profile" className="w-full h-full object-cover" />
//             </div>
//             <div className="absolute -bottom-2 -right-2 bg-green-500 p-1.5 rounded-xl border-4 border-white dark:border-[#1A1A1A]">
//                <CheckCircle2 size={16} className="text-white" />
//             </div>
//           </div>

//           <div className="flex-1 space-y-2 text-center md:text-left">
//             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase">
//                Staff ID: 1896
//             </div>
//             <h2 className={`text-3xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
//               Mr. Siddharth Balar
//             </h2>
//             <p className={`${mutedText} flex items-center justify-center md:justify-start gap-2`}>
//               <BookOpen size={14} /> Intern • Department of ERP • PPSU
//             </p>
//           </div>

//           <div className="flex flex-col gap-3 w-full md:w-auto">
//             <button 
//               onClick={() => setIsAdmissionOpen(true)}
//               className="px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-primary/40 transition-all shadow-lg flex items-center justify-center gap-2"
//             >
//               <Plus size={18} /> New Admission
//             </button>
//           </div>
//         </div>

//         {/* Real-time Punch Card */}
//         <div className={`${cardBase} lg:col-span-4 p-8 flex flex-col items-center justify-center text-center border-l-4 border-l-amber-500`}>
//           <div className="p-4 bg-amber-500/10 rounded-2xl mb-4">
//             <Clock className="text-amber-500" size={32} />
//           </div>
//           <h3 className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>09:26 AM</h3>
//           <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mt-1">Punch-in: Jan 12, 2026</p>
//           <div className="mt-4 px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-black rounded-xl animate-pulse">
//             LATE ENTRY: 26 MIN
//           </div>
//         </div>
//       </div>

//       {/* --- MAIN GRID SYSTEM --- */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
//         {/* 1. Leave & Attendance (Metric Focused) */}
//         <div className={`${cardBase} p-6`}>
//           <div className="flex justify-between items-center mb-6">
//             <h4 className={`font-black text-sm uppercase tracking-widest ${accentText}`}>Leave Inventory</h4>
//             <MoreHorizontal size={20} className="text-gray-400" />
//           </div>
//           <div className="space-y-4">
//             {[
//               { label: "Leave Balance", val: "12", color: "text-blue-500" },
//               { label: "Pending Approval", val: "01", color: "text-amber-500" },
//               { label: "On Duty Leaves", val: "04", color: "text-emerald-500" }
//             ].map((item, i) => (
//               <div key={i} className="flex justify-between items-center group cursor-pointer p-2 rounded-xl hover:bg-gray-500/5 transition-colors">
//                 <span className="text-gray-500 text-sm font-semibold">{item.label}</span>
//                 <span className={`text-lg font-black ${item.color}`}>{item.val}</span>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* 2. My Timetable (Schedule Focused) */}
//         <div className={`${cardBase} p-6 border-t-4 border-t-primary`}>
//           <div className="flex justify-between items-center mb-6">
//             <h4 className={`font-black text-sm uppercase tracking-widest ${accentText}`}>Today's Schedule</h4>
//             <Calendar size={18} className="text-gray-400" />
//           </div>
//           <div className="flex flex-col items-center justify-center py-6 text-center">
//             <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-4">
//                <CheckCircle2 size={32} />
//             </div>
//             <p className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>No teaching sessions today.</p>
//             <p className="text-xs text-gray-500 mt-1">Enjoy your prep time!</p>
//           </div>
//         </div>

//         {/* 3. Circulars (Action Focused) */}
//         <div className={`${cardBase} p-6 overflow-hidden`}>
//           <div className="flex justify-between items-center mb-6">
//             <h4 className={`font-black text-sm uppercase tracking-widest ${accentText}`}>Announcements</h4>
//             <button className="text-[10px] font-black text-primary hover:underline">VIEW ALL</button>
//           </div>
//           <div className="space-y-4 max-h-[220px] overflow-y-auto no-scrollbar">
//             {[1, 2, 3].map((_, i) => (
//               <div key={i} className="flex gap-4 p-3 rounded-2xl bg-gray-500/5 hover:bg-gray-500/10 transition-all cursor-pointer group">
//                 <div className="shrink-0 w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center group-hover:scale-110 transition-transform">
//                   <Bell size={18} />
//                 </div>
//                 <div>
//                   <h5 className={`text-xs font-bold leading-snug ${isDark ? 'text-gray-200' : 'text-slate-800'}`}>Kalagoonj 2026 Participation Invitation</h5>
//                   <p className="text-[10px] text-gray-500 mt-1 font-medium">Jan 23 • Admin Office</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* 4. Payroll & Finance (Document Focused) */}
//         <div className={`${cardBase} p-6`}>
//           <h4 className={`font-black text-sm uppercase tracking-widest mb-6 ${accentText}`}>Financial Hub</h4>
//           <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 mb-4">
//             <div className="flex items-center justify-between mb-4">
//                <span className="text-xs font-bold text-gray-500">Latest Payslip</span>
//                <span className="px-2 py-0.5 bg-primary text-white text-[8px] font-black rounded">NEW</span>
//             </div>
//             <button className="w-full py-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm flex items-center justify-center gap-2 text-xs font-black hover:bg-gray-50 transition-colors">
//                <Download size={14} className="text-primary" /> DOWNLOAD PDF
//             </button>
//           </div>
//           <div className="flex gap-2">
//              <select className={`flex-1 text-[10px] font-bold p-3 rounded-xl border ${isDark ? 'bg-zinc-900 border-zinc-700 text-white' : 'bg-white border-gray-200'}`}>
//                 <option>Select Month</option>
//                 <option>January 2026</option>
//              </select>
//           </div>
//         </div>

//         {/* 5. Service Requests (Task Focused) */}
//         <div className={`${cardBase} p-6`}>
//            <div className="flex justify-between items-center mb-6">
//             <h4 className={`font-black text-sm uppercase tracking-widest ${accentText}`}>Support Tickets</h4>
//             <button className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-white transition-all">
//               <Plus size={16} />
//             </button>
//           </div>
//           <div className="grid grid-cols-2 gap-3">
//              <div className="p-4 rounded-2xl bg-zinc-500/5 text-center">
//                 <p className="text-[10px] font-black text-gray-400 uppercase">Active</p>
//                 <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>04</p>
//              </div>
//              <div className="p-4 rounded-2xl bg-emerald-500/5 text-center">
//                 <p className="text-[10px] font-black text-emerald-500/60 uppercase">Closed</p>
//                 <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>12</p>
//              </div>
//           </div>
//         </div>

//         {/* 6. Upcoming Birthdays (Culture Focused) */}
//         <div className={`${cardBase} p-6 bg-gradient-to-br from-transparent to-primary/5`}>
//           <h4 className={`font-black text-sm uppercase tracking-widest mb-6 ${accentText}`}>Celebrations</h4>
//           <div className="flex flex-col items-center justify-center text-center space-y-3 opacity-60">
//              <div className="w-16 h-16 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center shadow-lg">
//                 <Gift size={28} className="text-primary" />
//              </div>
//              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">No Birthdays Today</p>
//           </div>
//         </div>

//       </div>

//       {/* --- MODAL SYSTEM --- */}
//       {isAdmissionOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//           <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setIsAdmissionOpen(false)}></div>
//           <div className={`relative w-full max-w-6xl max-h-[92vh] overflow-y-auto no-scrollbar rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300 ${isDark ? 'bg-[#121212]' : 'bg-white'}`}>
//             <div className="sticky top-0 z-[110] flex justify-end p-8 pointer-events-none">
//                 <button onClick={() => setIsAdmissionOpen(false)} className="pointer-events-auto w-12 h-12 flex items-center justify-center rounded-2xl bg-red-500 text-white shadow-xl shadow-red-500/30 hover:rotate-90 transition-all duration-500">
//                   <X size={24} />
//                 </button>
//             </div>
//             <div className="mt-[-80px]">
//                 <StudentAdmission />
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default DashboardHome;

import React from "react";
import { useSelector } from "react-redux";
import {
  Users,
  GraduationCap,
  UserCheck,
  Wallet,
  MoreVertical,
  ChevronRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

// --- Mock Data ---
const revenueData = [
  { name: "Jan", fee: 400, collected: 240 },
  { name: "Feb", fee: 300, collected: 139 },
  { name: "Mar", fee: 500, collected: 400 },
  { name: "Apr", fee: 280, collected: 390 },
  { name: "May", fee: 590, collected: 480 },
  { name: "Jun", fee: 350, collected: 250 },
  { name: "Jul", fee: 400, collected: 300 },
];

const expenseData = [
  { name: "Jan", income: 4000, expense: 2400 },
  { name: "Feb", income: 3000, expense: 1398 },
  { name: "Mar", income: 2000, expense: 5800 },
  { name: "Apr", income: 2780, expense: 3908 },
  { name: "May", income: 1890, expense: 4800 },
  { name: "Jun", income: 2390, expense: 3800 },
  { name: "Jul", income: 3490, expense: 4300 },
];

const admissionData = [
  { name: "English", value: 400, color: "#10B981" },
  { name: "Math", value: 300, color: "#3B82F6" },
  { name: "Physics", value: 300, color: "#F59E0B" },
  { name: "Biology", value: 200, color: "#EF4444" },
];

const userOverviewData = [
  { name: "Student", value: 60, color: "#10B981" },
  { name: "Teacher", value: 30, color: "#F97316" },
  { name: "Staff", value: 10, color: "#3B82F6" },
];

// --- Components ---

const StatCard = ({ icon: Icon, label, value, colorClass, bgClass, trend, isDark }) => (
  <div className={`${isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-100'} p-5 rounded-2xl shadow-sm border flex items-center justify-between hover:shadow-md transition-all`}>
    <div>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${bgClass} ${colorClass}`}>
        <Icon size={20} />
      </div>
      <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{value}</h3>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mt-1">{label}</p>
    </div>
    <div className="text-right">
       <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
         {trend}
       </span>
    </div>
  </div>
);

const SectionHeader = ({ title, isDark }) => (
  <div className="flex justify-between items-center mb-4">
    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>{title}</h3>
    <button className="text-gray-400 hover:text-gray-600 transition-colors">
      <MoreVertical size={18} />
    </button>
  </div>
);

const DashboardHome = () => {
  const themeMode = useSelector((state) => state.color.mode);
  const isDark = themeMode === "dark";

  // Chart UI Helpers
  const gridStroke = isDark ? "rgba(255,255,255,0.05)" : "#E5E7EB";
  const tickColor = isDark ? "#71717A" : "#9CA3AF";
  const cardClass = `${isDark ? 'bg-[#1A1A1A] border-white/5' : 'bg-white border-gray-100'} p-6 rounded-2xl shadow-sm border transition-all`;

  return (
    <div className="font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* --- LEFT COLUMN --- */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={Users} label="Total Students" value="20,000" colorClass="text-orange-500" bgClass="bg-orange-500/10" trend="+10%" isDark={isDark} />
            <StatCard icon={GraduationCap} label="Total Teachers" value="1,500" colorClass="text-blue-500" bgClass="bg-blue-500/10" trend="+5%" isDark={isDark} />
            <StatCard icon={UserCheck} label="Parents" value="18,000" colorClass="text-purple-500" bgClass="bg-purple-500/10" trend="+2%" isDark={isDark} />
            <StatCard icon={Wallet} label="Earnings" value="$50,000" colorClass="text-emerald-500" bgClass="bg-emerald-500/10" trend="+12%" isDark={isDark} />
            <StatCard icon={Users} label="Staff" value="450" colorClass="text-rose-500" bgClass="bg-rose-500/10" trend="+1%" isDark={isDark} />
            <StatCard icon={Wallet} label="Expenses" value="$32,000" colorClass="text-cyan-500" bgClass="bg-cyan-500/10" trend="-5%" isDark={isDark} />
          </div>

          {/* Revenue Chart */}
          <div className={cardClass}>
            <SectionHeader title="Revenue Statistics" isDark={isDark} />
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: tickColor, fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: tickColor, fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}} 
                    contentStyle={{backgroundColor: isDark ? '#18181B' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} 
                  />
                  <Bar dataKey="fee" fill="#10B981" radius={[4, 4, 0, 0]} name="Total Fee" />
                  <Bar dataKey="collected" fill="#F97316" radius={[4, 4, 0, 0]} name="Collected" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Notice Board & Leave Requests */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={cardClass}>
              <SectionHeader title="Notice Board" isDark={isDark} />
              <div className="space-y-4">
                {[
                  { name: "Admin", date: "24 Jan 2026", text: "New curriculum update for Grade 10.", color: "bg-purple-500/10 text-purple-500" },
                  { name: "Principal", date: "23 Jan 2026", text: "School will remain closed on Monday.", color: "bg-blue-500/10 text-blue-500" },
                  { name: "Sports Dept", date: "20 Jan 2026", text: "Annual Sports Day registration open.", color: "bg-orange-500/10 text-orange-500" },
                ].map((item, i) => (
                  <div key={i} className={`flex gap-4 items-start pb-4 border-b ${isDark ? 'border-white/5' : 'border-gray-50'} last:border-0 last:pb-0`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${item.color}`}>{item.name[0]}</div>
                    <div>
                        <h4 className={`font-bold text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{item.name}</h4>
                        <span className="text-[10px] text-gray-500 block mb-1">{item.date}</span>
                        <p className="text-xs text-gray-500 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={cardClass}>
              <SectionHeader title="Leave Requests" isDark={isDark} />
              <div className="space-y-4">
                {[
                  { name: "Darlene Robertson", role: "Teacher", days: "3 Days", status: "Pending", img: "https://i.pravatar.cc/150?u=1" },
                  { name: "Esther Howard", role: "Staff", days: "1 Day", status: "Approved", img: "https://i.pravatar.cc/150?u=2" },
                  { name: "Kristin Watson", role: "Teacher", days: "5 Days", status: "Rejected", img: "https://i.pravatar.cc/150?u=3" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={item.img} alt={item.name} className="w-10 h-10 rounded-full object-cover grayscale" />
                        <div>
                            <h4 className={`font-bold text-sm ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{item.name}</h4>
                            <p className="text-[10px] text-gray-500">{item.role}</p>
                        </div>
                    </div>
                    <div className="text-right">
                         <span className={`block font-bold text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.days}</span>
                         <span className={`text-[10px] font-medium ${item.status === 'Approved' ? 'text-green-500' : item.status === 'Rejected' ? 'text-red-500' : 'text-orange-500'}`}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={cardClass}>
            <SectionHeader title="Income vs Expense" isDark={isDark} />
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={expenseData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke}/>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: tickColor, fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: tickColor, fontSize: 12}}/>
                  <Tooltip contentStyle={{backgroundColor: isDark ? '#18181B' : '#fff', border: 'none', borderRadius: '12px'}} />
                  <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          
          <div className={cardClass}>
             <SectionHeader title="Student Attendance" isDark={isDark} />
             <div className="flex gap-2 mb-6 h-12">
                 <div className="flex-1 bg-emerald-500 rounded-lg"></div>
                 <div className="w-[15%] bg-orange-500 rounded-lg"></div>
                 <div className="w-[10%] bg-purple-500 rounded-lg"></div>
                 <div className="w-[10%] bg-green-300 rounded-lg"></div>
             </div>
             <div className="space-y-3">
                 {[
                     { label: "Present", val: "87%", color: "bg-emerald-500" },
                     { label: "Absent", val: "40%", color: "bg-orange-500" },
                     { label: "Late", val: "20%", color: "bg-purple-500" },
                     { label: "Half Day", val: "20%", color: "bg-green-300" },
                 ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between text-sm">
                         <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                             <span className="text-gray-500">{item.label}</span>
                         </div>
                         <span className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{item.val}</span>
                     </div>
                 ))}
             </div>
          </div>

          <div className={cardClass}>
            <div className="flex justify-between items-center mb-4">
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>January 2026</span>
                <div className="flex gap-1">
                    <ChevronRight size={16} className="rotate-180 text-gray-400 cursor-pointer" />
                    <ChevronRight size={16} className={`cursor-pointer ${isDark ? 'text-white' : 'text-gray-800'}`} />
                </div>
            </div>
            <div className="grid grid-cols-7 text-center text-xs mb-2 text-gray-500 font-medium">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className={`grid grid-cols-7 text-center text-xs gap-y-3 font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {[...Array(31)].map((_, i) => (
                    <div key={i} className={`h-7 w-7 flex items-center justify-center rounded-full mx-auto cursor-pointer transition-all ${i+1 === 24 ? 'bg-[#FBCB84] text-black font-bold shadow-lg shadow-[#FBCB84]/20' : isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                        {i+1}
                    </div>
                ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className={cardClass}>
             <SectionHeader title="Upcoming Events" isDark={isDark} />
             <div className={`relative pl-4 border-l border-dashed ${isDark ? 'border-white/10' : 'border-gray-200'} space-y-6`}>
                 {[
                     { time: "09:00 - 09:45 AM", title: "Marketing Strategy", lead: "Robert Fox", active: true },
                     { time: "11:15 - 12:00 PM", title: "Design Brandstorm", lead: "Leslie Alex", active: false },
                     { time: "02:00 - 03:00 PM", title: "Client Feedback", lead: "Courtney Henry", active: false },
                 ].map((ev, i) => (
                     <div key={i} className="relative">
                         <div className={`absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 ${isDark ? 'border-[#1A1A1A]' : 'border-white'} shadow-sm ${ev.active ? 'bg-emerald-500' : 'bg-gray-500'}`}></div>
                         <div>
                             <p className="text-[11px] font-bold text-gray-500 mb-1">{ev.time}</p>
                             <h4 className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{ev.title}</h4>
                             <p className="text-xs text-emerald-500 mt-0.5">Lead by {ev.lead}</p>
                         </div>
                     </div>
                 ))}
             </div>
          </div>

          {/* New Admissions Donut */}
          <div className={cardClass}>
            <SectionHeader title="New Admissions" isDark={isDark} />
            <div className="h-[200px] relative">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={admissionData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {admissionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>50</span>
                  <span className="text-[10px] text-gray-500 uppercase">Total</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;