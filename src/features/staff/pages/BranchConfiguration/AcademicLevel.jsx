import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Layers,
  Search,
  Loader2,
  Hash,
  RefreshCcw,
  Tag,
  Info,
  AlertCircle,
  CheckCircle2,
  X,
  Fingerprint
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import api from "../../../../config/api"; 
import AutoBreadcrumb from "../../../../components/common/AutoBreadcrumb"; 

const AcademicLevelManagement = () => {
  // --- THEME STATE ---
  const themeMode = useSelector((state) => state.color.mode);
  const isDark = themeMode === "dark";

  // --- LOCAL STATE ---
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showInfo, setShowInfo] = useState(false);

  const URL_PREFIX = "/api/academic-levels";

  // --- FETCH DATA ---
  const fetchLevels = async () => {
    setLoading(true);
    try {
      const res = await api.get(URL_PREFIX);
      const sortedData = (res.data || []).sort((a, b) => a.orderNo - b.orderNo);
      setLevels(sortedData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load academic levels");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  // --- SEARCH LOGIC ---
  const filteredLevels = levels.filter((level) =>
    level.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    level.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- STYLES ---
  const theme = {
    bg: isDark ? "bg-[#050505]" : "bg-[#F8FAFC]",
    panel: isDark ? "bg-[#0D0D0D] border-white/10" : "bg-white border-slate-200",
    input: isDark ? "bg-[#141414] border-white/10 text-white" : "bg-white border-slate-200 text-slate-900",
    tableHeader: isDark ? "bg-white/[0.03]" : "bg-slate-50",
    textPrimary: isDark ? "text-white" : "text-slate-900",
    textSecondary: isDark ? "text-slate-500" : "text-slate-500",
    rowHover: isDark ? "hover:bg-white/[0.02]" : "hover:bg-slate-50",
  };

  return (
    <div>
      <Toaster position="top-right" />

      {/* --- HEADER --- */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-primary rounded-2xl shadow-xl">
            <Layers className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-heading font-black tracking-tighter uppercase">
              Level <span className="text-primary not-italic">Registry</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* <button 
            onClick={() => setShowInfo(!showInfo)}
            className={`p-3 rounded-xl border transition-all ${showInfo ? 'bg-primary/10 border-primary text-primary' : theme.panel + ' opacity-50'}`}
          >
            <Info size={20} />
          </button> */}
          
          <div className={`flex items-center gap-2 p-1.5 rounded-2xl border ${theme.panel}`}>
            <div className="px-5 py-2 text-center">
              <p className="text-[8px] font-black uppercase opacity-40 leading-none mb-1">Total Records</p>
              <p className="text-sm font-black">{levels.length}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT: TABLE CONTENT --- */}
        <div className={`${showInfo ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-500`}>
          <div className="mb-6">
            <AutoBreadcrumb />
          </div>

          <div className={`rounded-3xl border shadow-sm overflow-hidden ${theme.panel}`}>
            {/* Toolbar */}
            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#FBCB84]/5">
              <div className="flex items-center gap-3">
                <h3 className="font-black uppercase text-title-table tracking-widest">Academic Hierarchy</h3>
                <button 
                    onClick={fetchLevels} 
                    className={`p-1.5 rounded-full transition-all ${isDark ? "hover:bg-white/10 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
                >
                    <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="FILTER BY NAME OR CODE..."
                  className={`w-full h-11 pl-10 pr-4 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-[#FBCB84] border transition-all ${theme.input}`}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={14} />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className={`${theme.tableHeader} text-heding-table font-black uppercase text-slate-500 tracking-widest`}>
                    <th className="px-8 py-5">Sequence</th>
                    <th className="px-8 py-5">Academic Level Name</th>
                    <th className="px-8 py-5">Identifier Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <Loader2 className="animate-spin mx-auto text-[#FBCB84]" size={32} />
                        <p className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-40">Decrypting Data...</p>
                      </td>
                    </tr>
                  ) : filteredLevels.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center opacity-30 font-black uppercase text-[10px] tracking-widest">
                        No hierarchy records found
                      </td>
                    </tr>
                  ) : (
                    filteredLevels.map((level) => (
                      <tr key={level.id} className={`transition-colors ${theme.rowHover}`}>
                        <td className="px-8 py-6">
                          <span className="font-mono text-small-table text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                            {String(level.orderNo).padStart(2, '0')}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-small-table uppercase tracking-tight">{level.name}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <Tag size={12} className="opacity-30" />
                            <span className="text-small-table opacity-60">{level.code}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- RIGHT: INFORMATION PANEL --- */}
        {showInfo && (
          <aside className="lg:col-span-4 animate-in slide-in-from-right-4 duration-500">
            <div className={`rounded-3xl border p-8 sticky top-10 ${theme.panel}`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-lg">
                    <AlertCircle className="text-white" size={20} />
                  </div>
                  <h4 className="font-black uppercase text-xs tracking-widest">Terminal Information</h4>
                </div>
                <button onClick={() => setShowInfo(false)} className="opacity-30 hover:opacity-100 transition-opacity">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2">What are Academic Levels?</h5>
                  <p className="text-xs leading-relaxed opacity-60">
                    Academic Levels represent the primary structural hierarchy of your institution. They categorize groups of classes such as <strong>Primary</strong>, <strong>Secondary</strong>, or <strong>Higher Secondary</strong>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                  <h5 className="text-[10px] font-black uppercase text-primary mb-2 flex items-center gap-2">
                    <CheckCircle2 size={12} /> Sequence Logic
                  </h5>
                  <p className="text-[10px] leading-relaxed opacity-70">
                    The <strong>Sequence</strong> (Order No) determines how levels appear in enrollment forms and grade-sheets. Lower numbers indicate lower educational stages.
                  </p>
                </div>

                <ul className="space-y-3">
                    {[
                      'Registry is currently in Read-Only Mode',
                      'Sorting is strictly by Order Sequence',
                      'Identifier codes are system-unique',
                      'Auto-synchronized with Main Database'
                    ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-[10px] font-bold opacity-50 uppercase tracking-tight">
                            <div className="w-1 h-1 rounded-full bg-primary" /> {item}
                        </li>
                    ))}
                </ul>

                <div className="pt-4 mt-4 border-t border-white/5">
                  <p className="text-[9px] font-bold opacity-30 leading-tight">
                    *To modify these records, please contact the System Administrator for higher clearance.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        )}
      </main>
    </div>
  );
};

export default AcademicLevelManagement;