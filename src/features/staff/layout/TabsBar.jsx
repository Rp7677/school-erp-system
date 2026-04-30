import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { closeTab, setActiveTab } from "../../../hooks/tabsSlice";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { setPrimaryColor } from "../../../hooks/themeSlice"; 

const TabsBar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const scrollContainerRef = useRef(null);

  const { tabs, activePath } = useSelector((state) => state.tabs);
  const { superAdmin } = useSelector((state) => state.campus);
  const isDark = useSelector((state) => state.color.mode === "dark");

  const brandColor = useSelector((state) => state.theme.primaryColor);

  useEffect(() => {
    if (brandColor) {
      document.documentElement.style.setProperty('--color-primary', brandColor);
    }
  }, [brandColor]);

  const defaultDashboard = superAdmin ? "/staff/dashboard" : "/staff/staffdashboard";

  // Auto-scroll to active tab
  useEffect(() => {
    const activeTabElement = scrollContainerRef.current?.querySelector('[data-active="true"]');
    if (activeTabElement) {
      activeTabElement.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [location.pathname]);

  const handleCloseTab = (e, pathToRemove) => {
    e.stopPropagation();
    const tabIndex = tabs.findIndex(t => t.path === pathToRemove);
    let nextPath = activePath;

    if (activePath === pathToRemove) {
      const remainingTabs = tabs.filter(t => t.path !== pathToRemove);
      if (remainingTabs.length > 0) {
        const nextTab = remainingTabs[tabIndex - 1] || remainingTabs[0];
        nextPath = nextTab.path;
      } else {
        nextPath = defaultDashboard;
      }
    }
    dispatch(closeTab(pathToRemove));
    if (nextPath !== location.pathname) navigate(nextPath);
  };

  if (!tabs.length) return null;

  return (
    /* FIX: top-16 assumes your header is 64px tall. 
      Adjust to top-0 if your header isn't sticky.
      z-30 ensures it stays above content but below header dropdowns (usually z-40/50).
    */
    <div className={`w-full sticky top-16 z-30 transition-all duration-300 border-b ${
      isDark 
        ? "bg-[#0A0A0A]/95 border-white/5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.5)]" 
        : "bg-white/90 border-gray-200/60 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)]"
    } backdrop-blur-md`}>
      
      <div className="relative group/bar flex items-center px-2 py-2">
        
        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full py-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <AnimatePresence mode='popLayout'>
            {tabs.map((tab) => {
              const isActive = location.pathname === tab.path;

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                  key={tab.path}
                  data-active={isActive}
                  onClick={() => {
                    dispatch(setActiveTab(tab.path));
                    navigate(tab.path);
                  }}
                  className={`
                    group relative flex items-center gap-3 px-5 py-2 cursor-pointer 
                    rounded-full transition-all duration-300 select-none flex-shrink-0
                    ${isActive 
                      ? "text-white" 
                      : isDark ? "text-gray-500 hover:text-gray-200 hover:bg-white/5" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    }
                  `}
                >
                  {/* Liquid Background Effect */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBackground"
                      className="absolute inset-0 bg-primary rounded-full"
                      transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                    >
                      <div className="absolute top-1 left-4 right-4 h-[15%] bg-white/20 rounded-full blur-[1px]" />
                    </motion.div>
                  )}

                  <span className="relative z-10 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                    {tab.label}
                  </span>

                  <motion.button
                    whileHover={{ scale: 1.2, rotate: 90 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => handleCloseTab(e, tab.path)}
                    className={`relative z-10 p-0.5 rounded-full transition-colors ${
                      isActive ? "bg-white/20 hover:bg-white/40 text-white" : "hover:bg-red-500/20 text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <X size={12} strokeWidth={3} />
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Gradient Indicators for overflow */}
        <div className={`absolute left-0 top-0 bottom-0 w-12 pointer-events-none bg-gradient-to-r ${isDark ? 'from-[#0A0A0A]' : 'from-white'} to-transparent z-10 opacity-60`} />
        <div className={`absolute right-0 top-0 bottom-0 w-12 pointer-events-none bg-gradient-to-l ${isDark ? 'from-[#0A0A0A]' : 'from-white'} to-transparent z-10 opacity-60`} />
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
      `}</style>
    </div>
  );
};

export default TabsBar;