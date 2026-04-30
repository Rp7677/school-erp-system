import React, { useState, useEffect, startTransition } from "react";
import {
  ArrowRight,
  User,
  IdCard,
  GraduationCap,
  School,
  FlaskConical,
  Dna,
  Gamepad2,
  Music,
  Code,
  Cpu,
  TrendingUp,
  Scissors,
  Shirt,
  Calculator,
  Sigma,
  Coins,
  Star,
  Languages,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loginUser } from "../../../hooks/authSlice";
import { Toaster, toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import { fetchUserCampuses } from "../../../hooks/campusSlice";
import { setSelectedCampus } from "../../../hooks/campusSlice";
import { fetchPermissions } from "../../../hooks/permissionsSlice";
import { clearTabs } from "../../../hooks/tabsSlice";

// --- Animation Constants ---
const TYPING_SPEED = 150;
const DELETING_SPEED = 75;
const PAUSE_TIME = 2000;

const LoginPage = () => {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [portalType, setPortalType] = useState("staff");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showAnimations, setShowAnimations] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleStaff = React.useCallback(() => {
    startTransition(() => {
      setPortalType("staff");
    });
  }, []);

  const handleStudent = React.useCallback(() => {
    startTransition(() => {
      setPortalType("student");
    });
  }, []);


  const { loading } = useSelector((state) => state.auth);

  // --- Background Particles State ---
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 4 + 2,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  useEffect(() => {
    const id = requestIdleCallback(() => setShowAnimations(true));
    return () => cancelIdleCallback(id);
  }, []);

  // --- Typing Animation Logic (i18n integrated) ---
  const TYPING_WORDS = React.useMemo(
    () =>
      t("typingWords", { returnObjects: true }) || [
        "Future",
        "Innovation",
        "Excellence",
      ],
    [i18n.language]
  );
  const [textIndex, setTextIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const timeout2 = setTimeout(() => setBlink((prev) => !prev), 500);
    return () => clearTimeout(timeout2);
  }, [blink]);

  useEffect(() => {
    if (subIndex === TYPING_WORDS[textIndex].length + 1 && !isDeleting) {
      setTimeout(() => setIsDeleting(true), PAUSE_TIME);
      return;
    }
    if (subIndex === 0 && isDeleting) {
      setIsDeleting(false);
      setTextIndex((prev) => (prev + 1) % TYPING_WORDS.length);
      return;
    }
    const timeout = setTimeout(
      () => {
        setSubIndex((prev) => prev + (isDeleting ? -1 : 1));
      },
      isDeleting ? DELETING_SPEED : TYPING_SPEED
    );

    return () => clearTimeout(timeout);
  }, [subIndex, isDeleting, textIndex, TYPING_WORDS]);

  const currentWord = TYPING_WORDS[textIndex].substring(0, subIndex);
  const handleLogin = async (e) => {
    e.preventDefault();

    const userRole = portalType === "staff" ? "STAFF" : "STUDENT";

    const action = await dispatch(
      loginUser({
        identifier: email,
        password,
        user_type: userRole,
      })
    );

    if (action.meta.requestStatus === "rejected") {
      toast.error(t("toastError") || "Invalid credentials ❌");
      return;
    }

    // action.payload now contains token, userId, and passwordResetRequired
    const { passwordResetRequired } = action.payload;

    toast.success(t("toastSuccess") || "Login successful 🎉");

    if (passwordResetRequired) {
      navigate("/reset-password", { replace: true });
      return;
    }

    // Fetch campuses after login 
    const contextAction = await dispatch(fetchUserCampuses());

    if (contextAction.meta.requestStatus === "rejected") {
      toast.error("Failed to fetch campus data");
      return;
    }

    // Dispatch fetchUserCampuses to get campus data
    const { superAdmin, campuses } = contextAction.payload;

    // Priority 1: Super Admin
    if (superAdmin) {

      localStorage.setItem("isSuperAdmin", "true");
      localStorage.removeItem("selectedCampus");

      // SuperAdmin doesn't need permission API
      dispatch(setSelectedCampus(null));
      navigate("/staff/", { replace: true });
      return;
    }


    // Priority 2: Staff
    if (userRole === "STAFF") {
      // If no campuses → block
      if (!campuses || campuses.length === 0) {
        toast.error("No campus assigned to this user");
        return;
      }
      // Auto select first campus
      const firstCampusId = campuses[0].campusId;

      localStorage.setItem("selectedCampus", firstCampusId);
      localStorage.setItem("isSuperAdmin", "false");


      dispatch(setSelectedCampus(firstCampusId));
      dispatch(clearTabs()); // Clear tabs when setting campus during login

      // 🔥 VERY IMPORTANT → fetch permissions with campusId
      await dispatch(fetchPermissions(firstCampusId));

      navigate("/staff/", { replace: true });
      return;
    }

    // Default: Student
    navigate("/student/dashboard", { replace: true });



    // Use userRole to determine dashboard route
    // if (userRole === "STAFF") {
    //   navigate("/staff/staffdashboard", { replace: true });
    // } else {
    //   navigate("/student/dashboard", { replace: true });
    // }
  };



  const BackgroundAnimations = React.useMemo(() => {
    return showAnimations ? (
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* PARTICLES */}
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-[#FBCB84]"
            style={{
              top: `${p.top}%`,
              left: `${p.left}%`,
              width: p.size,
              height: p.size,
            }}
            animate={{ y: [0, -100, 0], opacity: [0.1, 0.4, 0.1] }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay,
            }}
          />
        ))}

        {/* NUCLEAR ATOM */}
        <div className="absolute top-[8%] left-[8%] opacity-30">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-4 h-4 bg-[#FBCB84] rounded-full shadow-[0_0_20px_#FBCB84] z-10"
            />
            {[0, 60, -60].map((deg, i) => (
              <motion.div
                key={i}
                className="absolute w-full h-14 border border-gray-400 rounded-[50%]"
                style={{ rotate: deg }}
                animate={{ rotate: deg + 360 }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>
        </div>

        {/* DNA HELIX */}
        <div className="absolute top-[15%] right-[8%] opacity-20 flex flex-col gap-3">
          <Dna size={40} className="mb-2 text-[#FBCB84]" />
          {[...Array(12)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 w-20">
              <motion.div
                className="w-1.5 h-1.5 bg-[#FBCB84] rounded-full"
                animate={{ x: [0, 15, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
              <div className="h-[1px] bg-gray-400 flex-grow" />
              <motion.div
                className="w-1.5 h-1.5 bg-gray-500 rounded-full"
                animate={{ x: [0, -15, 0] }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            </div>
          ))}
        </div>

        {/* CHEMISTRY FLASK */}
        <div className="absolute bottom-[5%] left-[10%] opacity-30">
          <div className="relative">
            <FlaskConical
              size={100}
              strokeWidth={1}
              className="text-gray-700"
            />
            <div className="absolute bottom-2 left-[18px] w-[64px] h-10 bg-[#FBCB84]/20 rounded-b-3xl overflow-hidden">
              <motion.div
                className="w-full h-full bg-[#FBCB84]/40"
                animate={{ y: [40, 0, 40] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bottom-10 left-10 w-2 h-2 border border-[#FBCB84] rounded-full"
                animate={{ y: -120, opacity: [0, 1, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: i * 0.8 }}
              />
            ))}
          </div>
        </div>

        {/* PHYSICS PENDULUM */}
        <div className="absolute bottom-[10%] right-[10%] opacity-20">
          <motion.div
            className="origin-top flex flex-col items-center"
            animate={{ rotate: [30, -30, 30] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div className="w-[1px] h-32 bg-gray-400"></div>
            <div className="w-8 h-8 rounded-full bg-gray-300 border border-gray-400 shadow-lg"></div>
          </motion.div>
        </div>

        {/* COMPUTER SCIENCE */}
        <div className="absolute top-[35%] left-[2%] opacity-25 font-mono text-xs flex flex-col gap-2 text-green-700">
          <div className="flex items-center gap-2">
            <Cpu size={24} /> <span className="font-bold">CPU_01</span>
          </div>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
            >
              10110101
            </motion.div>
          ))}
        </div>

        {/* --- G. MATHEMATICS (Right Middle - Geometry) --- */}
        <div className="absolute top-[40%] right-[3%] opacity-25 text-blue-600">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            <div className="relative w-24 h-24 border border-dashed border-current rounded-full flex items-center justify-center">
              <div className="w-16 h-16 border border-current rotate-45"></div>
            </div>
          </motion.div>
          <div className="flex justify-center gap-2 mt-2">
            <Calculator size={20} />
            <Sigma size={20} />
          </div>
        </div>

        {/* --- H. ECONOMICS (Bottom Left - Growing Graph) --- */}
        <div className="absolute bottom-[20%] left-[25%] opacity-20 text-emerald-600">
          <div className="flex items-end gap-1 h-16 w-20 border-b border-l border-gray-400 p-1">
            <motion.div
              className="w-4 bg-emerald-400"
              animate={{ height: ["20%", "60%", "20%"] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="w-4 bg-emerald-400"
              animate={{ height: ["40%", "80%", "40%"] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="w-4 bg-emerald-400"
              animate={{ height: ["30%", "90%", "30%"] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
          </div>
          <div className="flex gap-2 mt-1">
            <TrendingUp size={20} />
            <Coins size={20} />
          </div>
        </div>

        {/* --- I. GAMES (Bottom Right - Gamepad & XP) --- */}
        <div className="absolute bottom-[25%] right-[25%] opacity-20 text-purple-600">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Gamepad2 size={40} />
          </motion.div>
          <motion.div
            className="absolute -top-6 right-0 text-xs font-bold"
            animate={{ y: [0, -15], opacity: [1, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            + XP
          </motion.div>
        </div>

        {/* --- J. FASHION (Bottom Center-Left) --- */}
        <div className="absolute bottom-[8%] left-[35%] opacity-15 text-pink-500 flex gap-3">
          <motion.div
            animate={{ rotate: [0, 25, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Scissors size={28} />
          </motion.div>
          <Shirt size={28} />
        </div>

        {/* MUSIC BARS */}
        <div className="absolute top-[12%] right-[25%] opacity-20 text-indigo-500">
          <div className="flex gap-1 items-end h-10 mb-1">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 bg-indigo-400 rounded-t-sm"
                animate={{ height: [10, 30, 10] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
          <Music size={32} />
        </div>

        {/* FORMULAS */}
        <motion.div
          className="absolute top-[25%] left-[35%] text-xl font-mono text-[#FBCB84]/60 pointer-events-none -rotate-12"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          E = mc²
        </motion.div>
        <motion.div
          className="absolute bottom-[35%] right-[25%] text-3xl font-serif text-gray-200 pointer-events-none"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          π
        </motion.div>
        <motion.div
          className="absolute top-[10%] left-[50%] text-sm font-mono text-gray-300 pointer-events-none"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          H₂O
        </motion.div>
        {/* Sigma (Summation) - Slowly rotating */}
        <motion.div
          className="absolute top-[40%] right-[15%] text-2xl font-sans text-indigo-200/40 pointer-events-none"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          ∑
        </motion.div>

        {/* Integral - floating vertically */}
        <motion.div
          className="absolute bottom-[20%] left-[10%] text-4xl font-serif text-emerald-200/30 pointer-events-none rotate-12"
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          ∫
        </motion.div>

        {/* Golden Ratio (Phi) - pulsing scale */}
        <motion.div
          className="absolute bottom-[15%] right-[40%] text-2xl font-serif text-yellow-100/40 pointer-events-none"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          φ
        </motion.div>
        {/* Force Equation - sliding horizontally */}
        <motion.div
          className="absolute top-[65%] left-[5%] text-lg font-mono text-sky-200/50 pointer-events-none -rotate-6"
          animate={{ x: [0, 15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          F = ma
        </motion.div>

        {/* Delta (Change) - bobbing */}
        <motion.div
          className="absolute top-[15%] right-[35%] text-xl font-sans text-rose-200/40 pointer-events-none"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 3.5, repeat: Infinity }}
        >
          Δ
        </motion.div>

        {/* Infinity - fading in and out */}
        <motion.div
          className="absolute top-[8%] left-[8%] text-3xl font-sans text-gray-400/30 pointer-events-none"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          ∞
        </motion.div>
        {/* Psi (Wave Function) */}
        <motion.div
          className="absolute bottom-[45%] left-[25%] text-2xl font-serif text-purple-300/40 pointer-events-none"
          animate={{ rotate: [-10, 10, -10] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        >
          Ψ
        </motion.div>

        {/* Code Brackets */}
        <motion.div
          className="absolute top-[55%] right-[5%] text-xl font-mono text-green-200/30 pointer-events-none rotate-45"
          animate={{ opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {"{ }"}
        </motion.div>
      </div>
    ) : null;
  }, [showAnimations]);

  return (
    <div className="min-h-screen w-full bg-[#FDFBF7] text-[#1A1A1A] font-sans relative overflow-hidden selection:bg-[#FBCB84] selection:text-white">
      <Toaster position="top-right" reverseOrder={false} />
      {/* ================= BACKGROUND BASE LAYER ================= */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* ================= FULL ANIMATED ELEMENTS LAYER (RESTORED) ================= */}

      {BackgroundAnimations}

      {/* ================= MAIN CONTENT ================= */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-end items-center gap-2 sm:gap-4">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 bg-white/80 border border-gray-200 text-[#1A1A1A] text-xs sm:text-sm font-semibold py-2 px-3 sm:px-4 rounded-lg shadow-sm"
            >
              <Languages size={18} />
              <span className="uppercase">{i18n.language.split("-")[0]}</span>
            </button>
            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-50"
                >
                  {["en", "hi", "gu"].map((lng) => (
                    <button
                      key={lng}
                      onClick={() => {
                        i18n.changeLanguage(lng);
                        setIsLangOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-[#FDFBF7] hover:text-[#FBCB84] transition-colors font-medium"
                    >
                      {lng === "en"
                        ? "English"
                        : lng === "hi"
                          ? "हिन्दी"
                          : "ગુજરાતી"}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button className="bg-[#1A1A1A] hover:bg-black text-white text-xs sm:text-sm font-semibold py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg transition-all shadow-lg">
            {t("contact") || "Contact Support"}
          </button>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 pb-6 sm:pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full max-w-5xl rounded-[24px] sm:rounded-[32px] shadow-2xl border border-white overflow-hidden flex flex-col md:flex-row min-h-[500px] sm:min-h-[600px]"
          >
            {/* LEFT PANEL */}
            <div className="w-full md:w-1/2 bg-[#1A1A1A] text-white relative overflow-hidden flex flex-col justify-between p-6 sm:p-8 md:p-12">
              <div className="absolute -right-20 -bottom-20 opacity-[0.03] text-white rotate-12">
                <School size={400} />
              </div>
              <div className="relative z-10 flex items-center gap-3 sm:gap-4">
                <div className="w-[50px] h-[50px] sm:w-[60px] sm:h-[60px] bg-[#FBCB84] rounded-2xl flex items-center justify-center text-[#1A1A1A] shadow-lg shadow-[#FBCB84]/20">
                  <School size={24} sm:size={32} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-none">
                  Eduverse
                  </h2>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                    {t("system") || "System"}
                  </span>
                </div>
              </div>

              <div className="relative z-10 my-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-[#FBCB84] mb-6">
                  <Star size={12} fill="#FBCB84" />{" "}
                  {t("version") || "V2.0 Now Live"}
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4 sm:mb-6">
                  {t("heroTitlePrefix") || "The"}{" "}
                  <span className="text-[#FBCB84]">
                    {t("heroTitleHighlight") || "Smart"}
                  </span>{" "}
                  {t("heroTitleMid") || "Way"} <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    {currentWord}
                    <motion.span
                      animate={{ opacity: blink ? 1 : 0 }}
                      className="inline-block ml-1 w-1 h-6 sm:h-8 md:h-10 bg-[#FBCB84] align-middle"
                    />
                  </span>
                </h1>
                <p className="text-gray-400 text-sm max-w-sm">
                  {t("heroDesc") ||
                    "Streamline your academic journey with our unified portal."}
                </p>
              </div>
            </div>

            {/* RIGHT PANEL: LOGIN FORM */}
            <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 bg-white flex flex-col justify-center relative">
              <div className="relative z-10">
                <div className="mb-6 sm:mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-[#1A1A1A]">
                    {t("hello") || "Hello Again!"}
                  </h2>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    {t("welcomeBack") || "Welcome back you've been missed."}
                  </p>
                </div>

                <div className="flex bg-[#F5F5F5] p-1.5 rounded-2xl mb-6 sm:mb-8 w-fit">
                  <button
                    onClick={handleStaff}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${portalType === "staff"
                      ? "bg-white text-[#1A1A1A] shadow-md"
                      : "text-gray-400"
                      }`}
                  >
                    <IdCard size={14} sm:size={16} /> {t("staff") || "Staff"}
                  </button>
                  <button
                    onClick={handleStudent}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 text-xs font-bold rounded-xl transition-all ${portalType === "student"
                      ? "bg-white text-[#1A1A1A] shadow-md"
                      : "text-gray-400"
                      }`}
                  >
                    <GraduationCap size={14} sm:size={16} /> {t("student") || "Student"}
                  </button>
                </div>

                <form className="space-y-4 sm:space-y-5" onSubmit={handleLogin}>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1A1A1A] ml-1">
                      {portalType === "student"
                        ? t("admissionId")
                        : t("employeeId")}
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={
                          portalType === "student"
                            ? t("enterAdmission")
                            : t("enterEmployee")
                        }
                        className="w-full bg-white border-2 border-gray-100 text-sm text-[#1A1A1A] rounded-xl px-4 py-3 sm:py-3.5 focus:border-[#FBCB84] transition-all outline-none"
                        required
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#FBCB84] transition-colors">
                        <User size={18} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1A1A1A] ml-1">
                      {t("password") || "Password"}
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("enterPass") || "Enter password"}
                      className="w-full bg-white border-2 border-gray-100 text-sm rounded-xl px-4 py-3 sm:py-3.5 focus:border-[#FBCB84] transition-all outline-none"
                      required
                    />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={!loading ? { scale: 1.01 } : {}}
                    whileTap={!loading ? { scale: 0.99 } : {}}
                    className={`w-full font-bold py-3.5 sm:py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 text-sm sm:text-base
                      ${loading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#1A1A1A] text-white"
                      }
                    `}
                  >
                    {loading
                      ? "Logging in..."
                      : t("loginBtn") || "Login Account"}{" "}
                    <ArrowRight size={18} />
                  </motion.button>
                </form>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default LoginPage;
