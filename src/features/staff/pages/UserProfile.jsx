import React, { useState, useRef } from "react"; // Added useRef
import { useSelector } from "react-redux";
import {
  User,
  Mail,
  Shield,
  Camera,
  MapPin,
  Calendar,
  Edit3,
  Lock,
  Bell,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Clock,
  Phone,
  BookOpen,
  Award,
  Hash,
  Loader2, // Added for a nice upload state if you want
} from "lucide-react";

const UserProfile = () => {
  const themeMode = useSelector((state) => state.color.mode);
  const role = useSelector((state) => state.auth.role);
  const isDark = themeMode === "dark";
  const [activeTab, setActiveTab] = useState("personal");

  // --- NEW: UPLOAD LOGIC ---
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(
    "https://ui-avatars.com/api/?name=Alex+Johnson&background=FBCB84&color=1A1A1A&size=256"
  );

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  // -------------------------

  const [userData, setUserData] = useState({
    name: "Alex Johnson",
    email: "alex.j@school.edu",
    phone: "+1 (555) 000-1234",
    location: "California, USA",
    joinDate: "Sept 12, 2023",
    employeeId: "EMP-2024-089",
    designation: "Senior Mathematics Lead",
    department: "Science & Mathematics",
    qualification: "M.Sc. in Applied Mathematics, B.Ed.",
    experience: "8+ Years",
    bio: "Lead Administrator and System Architect. Passionate about educational technology and streamlining workflows.",
    subjects: ["Advanced Calculus", "Linear Algebra", "Statistics"],
  });

  const cardClass = `rounded-3xl border transition-all duration-300 ${
    isDark
      ? "bg-[#1A1A1A] border-white/5 shadow-2xl shadow-black/40"
      : "bg-white border-gray-100 shadow-sm"
  }`;

  const inputClass = `w-full px-4 py-3 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[#FBCB84]/50 ${
    isDark
      ? "bg-[#242424] border-white/10 text-gray-200"
      : "bg-gray-50 border-gray-200 text-gray-800"
  }`;

  const labelClass =
    "text-[11px] font-black text-gray-400 uppercase tracking-[0.1em] mb-2 block";

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageChange}
      />

      {/* --- HERO SECTION --- */}
      <div className={`${cardClass} overflow-hidden border-none`}>
        <div className="h-48 bg-[#1A1A1A] relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-[#FBCB84] opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#1A1A1A] to-transparent"></div>
        </div>

        <div className="px-6 md:px-12 pb-10 flex flex-col md:flex-row items-center md:items-end gap-8 -mt-20 relative z-10">
          <div className="relative group">
            <div
              className={`w-40 h-40 rounded-[2.5rem] p-1.5 border-4 ${
                isDark
                  ? "border-[#1A1A1A] bg-[#242424]"
                  : "border-white bg-white"
              } shadow-2xl overflow-hidden`}
            >
              <img
                src={profileImage} // Updated to use state
                className="w-full h-full rounded-[2.2rem] object-cover transition-transform group-hover:scale-105 duration-500"
                alt="Profile"
              />
            </div>
            {/* Added onClick to trigger upload */}
            <button
              onClick={handleUploadClick}
              className="absolute bottom-2 right-2 p-3 bg-[#FBCB84] text-[#1A1A1A] rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all"
            >
              <Camera size={20} />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left mb-2">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-3">
              <h1
                className={`text-3xl font-black tracking-tight ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                {userData.name}
              </h1>
              <span className="px-4 py-1 rounded-full bg-[#FBCB84]/10 text-[#FBCB84] text-xs font-bold border border-[#FBCB84]/20 w-fit mx-auto md:mx-0">
                {userData.employeeId}
              </span>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-5 text-sm font-medium text-gray-400">
              <p className="flex items-center gap-2">
                <Briefcase size={16} className="text-[#FBCB84]" />{" "}
                {userData.designation}
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-[#FBCB84]" />{" "}
                {userData.location}
              </p>
            </div>
          </div>

          <button className="flex items-center gap-2 px-8 py-3.5 bg-[#FBCB84] text-[#1A1A1A] rounded-2xl text-sm font-black hover:shadow-lg hover:shadow-[#FBCB84]/30 transition-all active:scale-95">
            <Edit3 size={18} /> Edit Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- LEFT SIDEBAR --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className={`${cardClass} p-8`}>
            <h3
              className={`text-lg font-black mb-6 flex items-center gap-2 ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              <Award size={20} className="text-[#FBCB84]" /> Work Profile
            </h3>

            <div className="space-y-6">
              <div>
                <label className={labelClass}>Department</label>
                <p
                  className={`text-sm font-bold ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {userData.department}
                </p>
              </div>
              <div>
                <label className={labelClass}>Qualifications</label>
                <p
                  className={`text-sm font-bold ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {userData.qualification}
                </p>
              </div>
              <div>
                <label className={labelClass}>Experience</label>
                <p
                  className={`text-sm font-bold ${
                    isDark ? "text-gray-200" : "text-gray-700"
                  }`}
                >
                  {userData.experience}
                </p>
              </div>
              <div>
                <label className={labelClass}>Expertise</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userData.subjects.map((sub, i) => (
                    <span
                      key={i}
                      className={`text-[10px] font-bold px-3 py-1 rounded-lg ${
                        isDark
                          ? "bg-white/5 text-gray-400"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`${cardClass} p-6 text-center`}>
              <p className="text-2xl font-black text-[#FBCB84]">98%</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">
                Attendance
              </p>
            </div>
            <div className={`${cardClass} p-6 text-center`}>
              <p className="text-2xl font-black text-blue-500">12</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-1">
                Classes/Week
              </p>
            </div>
          </div>
        </div>

        {/* --- RIGHT CONTENT --- */}
        <div className="lg:col-span-8 space-y-6">
          <div className={`${cardClass} overflow-hidden`}>
            <div
              className={`flex border-b ${
                isDark ? "border-white/5" : "border-gray-100"
              }`}
            >
              {["personal", "professional", "security"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-5 text-sm font-bold capitalize transition-all relative ${
                    activeTab === tab
                      ? "text-[#FBCB84]"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tab} Information
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#FBCB84] rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-8 md:p-10">
              {activeTab === "personal" && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className={labelClass}>Full Name</label>
                      <div className="relative">
                        <User
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                        <input
                          type="text"
                          value={userData.name}
                          className={`${inputClass} pl-12`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Contact Email</label>
                      <div className="relative">
                        <Mail
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                        <input
                          type="email"
                          value={userData.email}
                          className={`${inputClass} pl-12`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Phone Number</label>
                      <div className="relative">
                        <Phone
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                        <input
                          type="text"
                          value={userData.phone}
                          className={`${inputClass} pl-12`}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Join Date</label>
                      <div className="relative">
                        <Calendar
                          size={16}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                        />
                        <input
                          type="text"
                          readOnly
                          value={userData.joinDate}
                          className={`${inputClass} pl-12 opacity-60`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={labelClass}>Short Biography</label>
                    <textarea
                      rows="4"
                      className={inputClass}
                      value={userData.bio}
                    ></textarea>
                  </div>
                </div>
              )}

              {activeTab === "professional" && (
                <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className={labelClass}>Employee ID</label>
                      <input
                        type="text"
                        readOnly
                        value={userData.employeeId}
                        className={`${inputClass} opacity-60`}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Official Designation</label>
                      <input
                        type="text"
                        value={userData.designation}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Academic Department</label>
                      <select className={inputClass}>
                        <option>{userData.department}</option>
                        <option>Arts & Humanities</option>
                        <option>Administration</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>
                        Highest Qualification
                      </label>
                      <input
                        type="text"
                        value={userData.qualification}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end mt-10 border-t border-white/5 pt-8">
                <button className="flex items-center gap-2 px-10 py-4 bg-[#FBCB84] text-[#1A1A1A] rounded-2xl text-sm font-black hover:shadow-2xl hover:shadow-[#FBCB84]/40 transition-all active:scale-95">
                  <CheckCircle2 size={20} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
