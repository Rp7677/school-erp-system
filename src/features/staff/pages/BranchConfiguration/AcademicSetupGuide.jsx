import React, { useState } from "react";
import { useSelector } from "react-redux";
import { 
  CheckCircle2, ArrowRight, BookOpen, GraduationCap, 
  Layers, Landmark, Globe, MapPin, ListTree, 
  Calendar, ShieldCheck, AlertCircle, Info, X,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

const AcademicSetupGuide = () => {
  const isDark = useSelector((state) => state.color.mode === "dark");
  const [expandedStep, setExpandedStep] = useState(null);

  const theme = {
    panel: isDark ? "bg-[#0D0D0D] border-white/10" : "bg-white border-slate-200",
    card: isDark ? "bg-[#141414] border-white/5" : "bg-white border-gray-100 shadow-sm",
    textMuted: isDark ? "text-gray-500" : "text-gray-400"
  };

  const steps = [
    { 
      label: "Board Manager", 
      icon: <Globe size={20} />,
      desc: "Define educational boards like CBSE, ICSE, or State Boards.", 
      to: "/staff/AcademicSetup/create-board", 
      show: true,
      category: "Foundational",
      moreInfo: "The Board Manager is the root configuration level. Here you define national or state boards that govern classes and subjects. Unique Codes are required."
    },
    { 
      label: "Medium Management", 
      icon: <Layers size={20} />,
      desc: "Set up instruction languages (English, Hindi, etc).", 
      to: "/staff/AcademicSetup/create-medium", 
      show: true,
      category: "Foundational",
      moreInfo: "Mediums define the language of instruction. Changing these affects registration forms and student filtering. Codes must be unique 3-4 letter identifiers."
    },
    { 
      label: "Academic Level", 
      icon: <ListTree size={20} />,
      desc: "Categorize by Primary, Secondary, or Higher Secondary.", 
      to: "/staff/AcademicSetup/academic-level", 
      show: true,
      category: "Foundational",
      moreInfo: "Academic Levels represent the primary structural hierarchy. The 'Sequence' determines how levels appear in enrollment forms."
    },
    { 
      label: "Branch Configuration", 
      icon: <MapPin size={20} />,
      desc: "Register physical school campuses or branch locations.", 
      to: "/staff/AcademicSetup/create-branch-configuration", 
      show: true,
      category: "Institutional",
      moreInfo: "A centralized engine for managing multi-campus architecture. Defines Branches as Campus-Board-Medium unique pairs."
    },
    { 
      label: "Master Grades", 
      icon: <ShieldCheck size={20} />,
      desc: "Define standard grade levels globally (Pre-K to 12).", 
      to: "/staff/AcademicSetup/create-branch-configuration", 
      show: true,
      category: "Institutional",
      moreInfo: "These are global definitions. Ensure the sequence order matches the educational progression."
    },
    { 
      label: "Create Stream", 
      icon: <Layers size={20} />,
      desc: "created streams for particular academic year.", 
      to: "/staff/AcademicSetup/create-branch-configuration", 
      show: true,
      category: "Institutional",
      moreInfo: "Create elective streams for the academic Year. (Example : Science, Commerce, Arts etc... )"
    },
    { 
      label: "Stream Assignment", 
      icon: <Layers size={20} />,
      desc: "Link created streams to the master academic list.", 
      to: "/staff/AcademicSetup/create-branch-configuration", 
      show: true,
      category: "Institutional",
      moreInfo: "Ensures elective streams are validated against the academic framework before student enrollment."
    },
    { 
      label: "Grade Custom Labels", 
      icon: <CheckCircle2 size={20} />,
      desc: "Map specific aliases to branch-specific grades.", 
      to: "/staff/AcademicSetup/create-branch-configuration", 
      show: true,
      category: "Institutional",
      moreInfo: "Use this to give grades custom names for specific branches (e.g., 'Senior Secondary' instead of 'Grade 12')."
    },
    { 
      label: "Assign Academic Level", 
      icon: <ListTree size={20} />,
      desc: "Assign Academic Level to particular grade Primary, Secondary, or Higher Secondary.", 
      to: "/staff/AcademicSetup/create-branch-configuration", 
      show: true,
      category: "Institutional",
      moreInfo: "Academic Levels represent the primary structural hierarchy. 1to5 Primary and 5to 10 Secondary"
    },
    { 
      label: "Academic Session", 
      icon: <Calendar size={20} />,
      desc: "Define global academic years (e.g., 2025-26).", 
      to: "/staff/AcademicSetup/create-academic-year", 
      show: true,
      category: "Academic",
      moreInfo: "Sessions are time-bound cycles. All students, fees, and marks are linked to an active session. Inactivating locks archived data."
    },
    { 
      label: "Branch Year Activation", 
      icon: <Landmark size={20} />,
      desc: "Activate sessions for specific campuses.", 
      to: "/staff/AcademicSetup/create-academic-year", 
      show: true,
      category: "Academic",
      moreInfo: "Maps global academic years to specific branch boards and mediums with custom date ranges."
    },
    { 
      label: "Academic Terms", 
      icon: <Calendar size={20} />,
      desc: "Set up Semesters or Quarterly terms.", 
      to: "/staff/AcademicSetup/create-academic-year-configuration", 
      show: true,
      category: "Operational",
      moreInfo: "Breaks down a branch year into terms (e.g., Sem 1, Final) with specific start/end dates for evaluation."
    },
    { 
      label: "Final Term Mapping", 
      icon: <ShieldCheck size={20} />,
      desc: "Link terms to the active branch academic year.", 
      to: "/staff/AcademicSetup/create-academic-year-configuration", 
      show: true,
      category: "Operational",
      moreInfo: "The final link: assigns which terms are applicable to which grades for progress tracking and examinations."
    },
  ];

  const categories = ["Foundational", "Institutional", "Academic", "Operational"];

  return (
    <div className={`p-8 max-w-7xl mx-auto ${isDark ? "text-white" : "text-gray-800"}`}>
      
      {/* HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-primary rounded-3xl text-white shadow-xl shadow-primary/20 rotate-3">
            <BookOpen size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase italic">
              Academic <span className="text-primary not-italic">Roadmap</span>
            </h1>
            <div className="flex items-center gap-2 opacity-50">
              <ShieldCheck size={12} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Super Admin One-Time Setup Protocol</span>
            </div>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-12">
          
          {/* INFRASTRUCTURE ARCHITECTURE SUMMARY */}
          <div className={`p-8 rounded-[2.5rem] border-2 border-dashed ${isDark ? "bg-primary/5 border-primary/20" : "bg-primary/5 border-primary/10"}`}>
            <h4 className="text-primary font-black uppercase text-xs mb-4 flex items-center gap-2 italic">
              <Layers size={16}/> Unified Infrastructure Architecture
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {t: "Global Master", d: "Define Boards and Mediums that govern the entire organization."},
                {t: "Campus Link", d: "Map master data to physical branches and specific academic sessions."},
                {t: "Term Bridge", d: "Finalize evaluation periods for automated grading and report cards."}
              ].map((item, i) => (
                <div key={i} className={`p-4 rounded-2xl ${theme.card}`}>
                  <span className="text-[10px] font-black text-primary uppercase mb-1 block tracking-wider">{item.t}</span>
                  <p className="text-[10px] leading-relaxed font-bold opacity-60 uppercase">{item.d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* DYNAMIC ROADMAP BY CATEGORY */}
          {categories.map((cat) => (
            <section key={cat} className="space-y-4">
              <div className="flex items-center gap-3 ml-2 mb-6">
                <div className="h-px flex-1 bg-primary/10" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic px-4 py-1 rounded-full border border-primary/20 bg-primary/5">
                  {cat} Layer
                </h2>
                <div className="h-px flex-1 bg-primary/10" />
              </div>

              <div className="space-y-4">
                {steps.filter(s => s.category === cat).map((step, index) => (
                  <div key={index} className="group">
                    <div className={`${theme.card} rounded-3xl border transition-all duration-300 hover:border-primary/30 ${expandedStep === step.label ? 'ring-1 ring-primary/40' : ''}`}>
                      <div className="p-6 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${expandedStep === step.label ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}`}>
                            {step.icon}
                          </div>
                          <div>
                            <h3 className="font-black uppercase text-sm tracking-tight">{step.label}</h3>
                            <p className="text-xs opacity-50 font-bold">{step.desc}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setExpandedStep(expandedStep === step.label ? null : step.label)}
                            className={`px-4 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                              expandedStep === step.label ? 'bg-primary text-white' : 'bg-primary/5 text-primary hover:bg-primary/10'
                            }`}
                          >
                            {expandedStep === step.label ? 'Close' : 'Protocol'}
                          </button>
                          <Link to={step.to} className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                            <ExternalLink size={16} />
                          </Link>
                        </div>
                      </div>

                      {/* EXPANDABLE INFO PANEL */}
                      {expandedStep === step.label && (
                        <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-300">
                          <div className={`p-5 rounded-2xl border border-dashed ${isDark ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                             <div className="flex items-start gap-3">
                                <div className="mt-1 p-1 bg-primary/20 rounded-md"><Info size={12} className="text-primary"/></div>
                                <div>
                                  <h5 className="text-[10px] font-black uppercase text-primary mb-1">Operational Logic</h5>
                                  <p className="text-xs leading-relaxed font-bold opacity-70 italic">"{step.moreInfo}"</p>
                                </div>
                             </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* SIDEBAR INFORMATION */}
        <aside className="lg:col-span-4 space-y-6">
          <div className={`${theme.panel} rounded-3xl border p-8 sticky top-10 shadow-2xl shadow-black/20`}>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-primary/10 rounded-lg">
                <AlertCircle className="text-primary" size={20} />
              </div>
              <h4 className="font-black uppercase text-xs tracking-widest italic">Terminal Status</h4>
            </div>

            <div className="space-y-8">
              <div>
                <h5 className="text-[10px] font-black uppercase text-primary mb-3">Integrity Logic</h5>
                <p className="text-xs leading-relaxed font-bold opacity-60">
                  This roadmap follows a strict dependency chain. Foundational layers must be defined before Academic terms can be bridged to branches.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                <h5 className="text-[10px] font-black uppercase text-primary flex items-center gap-2 leading-none">
                  <CheckCircle2 size={14} /> Status Protocol
                </h5>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <p className="text-[10px] font-black opacity-70 uppercase tracking-tighter">Operational: Visible to enrollment terminal.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                    <p className="text-[10px] font-black opacity-70 uppercase tracking-tighter">Locked: Data archived, no new entries allowed.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h5 className="text-[10px] font-black uppercase opacity-40 italic tracking-widest px-1">Infrastructure Rules</h5>
                <ul className="space-y-3">
                  {['Unique Short-Codes Required', 'Global Grade Persistence', 'Date-Range Validation', 'Super-Admin Clearance Only'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-[10px] font-bold opacity-50 uppercase tracking-tight">
                      <div className="w-1 h-1 rounded-full bg-primary" /> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-4 p-4 bg-primary rounded-2xl">
                   <GraduationCap size={24} className="text-white"/>
                   <p className="text-[9px] font-black text-white uppercase leading-tight italic">
                     Infrastructure verified? launch admission cycles.
                   </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default AcademicSetupGuide;