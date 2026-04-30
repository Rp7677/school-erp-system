import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  School,
  FlaskConical,
  Dna,
  Gamepad2,
  Music,
  Cpu,
  TrendingUp,
  Scissors,
  Shirt,
  Calculator,
  Sigma,
  Coins,
  Star,
  Languages,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Toaster, toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword } from "../../../hooks/authSlice";
const TYPING_SPEED = 150;
const DELETING_SPEED = 75;
const PAUSE_TIME = 2000;

const ResetPassword = () => {

  
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [isLangOpen, setIsLangOpen] = useState(false);
  const [showAnimations, setShowAnimations] = useState(false);

  // --- Helpers ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // --- API Logic ---
  const handleReset = async (e) => {
    e.preventDefault();

    // 1. Client-side Validation
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    // 2. Dispatch Action
    const action = await dispatch(resetPassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
    }));

    // 3. Handle Result
    if (resetPassword.fulfilled.match(action)) {
        toast.success(action.payload.message || "Password reset successful");
        
        // If the API mandated a logout (which your slice now handles), redirect
        if (action.payload.logout) {
             setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1500);
        }
    } else {
        // Handle Error
        toast.error(action.payload || "Failed to reset password");
    }
  };

  // --- Background Particles State (Kept exactly as provided) ---
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

  // --- Typing Animation Logic ---
  const TYPING_WORDS = React.useMemo(
    () => t("typingWords", { returnObjects: true }) || ["Security", "Privacy", "Control"],
    [i18n.language, t]
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

  // --- Background Animations Component (Kept exactly as provided) ---
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

        {/* --- I. GAMES (Bottom Right - Gamepad & XP) --- */}
        <div className="absolute bottom-[25%] right-[25%] opacity-20 text-purple-600">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Gamepad2 size={40} />
          </motion.div>
        </div>

        {/* FORMULAS */}
        <motion.div
          className="absolute top-[25%] left-[35%] text-xl font-mono text-[#FBCB84]/60 pointer-events-none -rotate-12"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
        >
          E = mc²
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
  }, [showAnimations, particles]);

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

      {BackgroundAnimations}

      {/* ================= MAIN CONTENT ================= */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-end items-center gap-4">
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 bg-white/80 border border-gray-200 text-[#1A1A1A] text-sm font-semibold py-2 px-4 rounded-lg shadow-sm"
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
                      {lng === "en" ? "English" : lng === "hi" ? "हिन्दी" : "ગુજરાતી"}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button className="bg-[#1A1A1A] hover:bg-black text-white text-sm font-semibold py-2.5 px-6 rounded-lg transition-all shadow-lg">
            {t("contact") || "Support"}
          </button>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center px-4 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full max-w-5xl rounded-[32px] shadow-2xl border border-white overflow-hidden flex flex-col md:flex-row min-h-[600px]"
          >
            {/* LEFT PANEL: HERO / ART */}
            <div className="w-full md:w-1/2 bg-[#1A1A1A] text-white relative overflow-hidden flex flex-col justify-between p-10 md:p-12">
              <div className="absolute -right-20 -bottom-20 opacity-[0.03] text-white rotate-12">
                <School size={400} />
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-[60px] h-[60px] bg-[#FBCB84] rounded-2xl flex items-center justify-center text-[#1A1A1A] shadow-lg shadow-[#FBCB84]/20">
                  <Lock size={32} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white leading-none">
                    ACCOUNT CENTER
                  </h2>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-medium">
                    {t("security") || "Security"}
                  </span>
                </div>
              </div>

              <div className="relative z-10 my-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-medium text-[#FBCB84] mb-6">
                  <Star size={12} fill="#FBCB84" />{" "}
                  {t("secure_badge") || "Secure Environment"}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                  {t("resetPrefix") || "Prioritize"}{" "}
                  <span className="text-[#FBCB84]">
                    {t("resetHighlight") || "Safety"}
                  </span>{" "}
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
                    {currentWord}
                    <motion.span
                      animate={{ opacity: blink ? 1 : 0 }}
                      className="inline-block ml-1 w-1 h-8 md:h-10 bg-[#FBCB84] align-middle"
                    />
                  </span>
                </h1>
                <p className="text-gray-400 text-sm max-w-sm">
                  {t("resetDesc") ||
                    "Update your password regularly to keep your academic data and personal information secure."}
                </p>
              </div>
            </div>

            {/* RIGHT PANEL: RESET FORM */}
            <div className="w-full md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center relative">
              <div className="relative z-10">
                <div className="mb-8">
                  <h2 className="text-3xl font-bold mb-2 text-[#1A1A1A]">
                    {t("resetTitle") || "Reset Password"}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {t("resetSubtitle") || "Create a new strong password for your account."}
                  </p>
                </div>

                <form className="space-y-5" onSubmit={handleReset}>
                  
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1A1A1A] ml-1">
                      {t("currentPassword") || "Current Password"}
                    </label>
                    <div className="relative group">
                      <input
                        type={showPassword.current ? "text" : "password"}
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full bg-white border-2 border-gray-100 text-sm text-[#1A1A1A] rounded-xl pl-12 pr-12 py-3.5 focus:border-[#FBCB84] transition-all outline-none"
                        required
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#FBCB84] transition-colors">
                        <Lock size={18} />
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleVisibility('current')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A1A1A] transition-colors"
                      >
                        {showPassword.current ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1A1A1A] ml-1">
                      {t("newPassword") || "New Password"}
                    </label>
                    <div className="relative group">
                      <input
                        type={showPassword.new ? "text" : "password"}
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full bg-white border-2 border-gray-100 text-sm text-[#1A1A1A] rounded-xl pl-12 pr-12 py-3.5 focus:border-[#FBCB84] transition-all outline-none"
                        required
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#FBCB84] transition-colors">
                        <CheckCircle2 size={18} />
                      </div>
                       <button
                        type="button"
                        onClick={() => toggleVisibility('new')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A1A1A] transition-colors"
                      >
                        {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1A1A1A] ml-1">
                      {t("confirmPassword") || "Confirm Password"}
                    </label>
                    <div className="relative group">
                      <input
                        type={showPassword.confirm ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={`w-full bg-white border-2 text-sm text-[#1A1A1A] rounded-xl pl-12 pr-12 py-3.5 transition-all outline-none
                          ${formData.confirmPassword && formData.newPassword !== formData.confirmPassword 
                            ? "border-red-200 focus:border-red-400" 
                            : "border-gray-100 focus:border-[#FBCB84]"}`}
                        required
                      />
                      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? "text-red-400" : "text-gray-300 group-focus-within:text-[#FBCB84]"}`}>
                        {formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                      </div>
                       <button
                        type="button"
                        onClick={() => toggleVisibility('confirm')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1A1A1A] transition-colors"
                      >
                        {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={!loading ? { scale: 1.01 } : {}}
                    whileTap={!loading ? { scale: 0.99 } : {}}
                    className={`w-full font-bold py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 mt-4
                      ${
                        loading
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-[#1A1A1A] text-white hover:bg-black"
                      }
                    `}
                  >
                    {loading ? (
                      "Updating..."
                    ) : (
                      <>
                        {t("resetBtn") || "Update Password"} <ArrowRight size={18} />
                      </>
                    )}
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

export default ResetPassword;