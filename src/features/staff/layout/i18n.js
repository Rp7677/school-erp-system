import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // ... Your existing Login keys ...
      contact: "Contact Support",
      logout: "Logout",
      
      // --- NEW DASHBOARD KEYS ---
      search: "Search...",
      home: "Home",
      dashboard: "Dashboard",
      session: "Session",
      my_account: "My Account",
      profile: "Profile",
      settings: "Settings",
      
      // Sidebar
      menu_main: "Main Menu",
      campuses: "Campuses",
      create_campus: "Create Campuses",
      academic_setup: "Academic Setup",
      create_board: "Create Board",
      role_permission: "Role Permission Setup",
      create_role: "Create Role",
      system: "System",
      appearance: "Appearance",
      light: "Light",
      dark: "Dark",
      bg_accent: "BG Accent",
      quick_access: "Quick Access",
      search_results: "Search Results",
      no_results: "No results found"
    }
  },
  hi: {
    translation: {
      // ... Your existing Login keys ...
      contact: "सहायता संपर्क",
      logout: "लॉगआउट",

      // --- NEW DASHBOARD KEYS ---
      search: "खोजें...",
      home: "होम",
      dashboard: "डैशबोर्ड",
      session: "सत्र",
      my_account: "मेरा खाता",
      profile: "प्रोफाइल",
      settings: "सेटिंग्स",

      // Sidebar
      menu_main: "मुख्य मेनू",
      campuses: "कैंपस",
      create_campus: "कैंपस बनाएं",
      academic_setup: "शैक्षणिक सेटअप",
      create_board: "बोर्ड बनाएं",
      role_permission: "भूमिका अनुमति",
      create_role: "भूमिका बनाएं",
      system: "सिस्टम",
      appearance: "दिखावट",
      light: "लाइट",
      dark: "डार्क",
      bg_accent: "पृष्ठभूमि रंग",
      quick_access: "त्वरित पहुंच",
      search_results: "खोज परिणाम",
      no_results: "कोई परिणाम नहीं मिला"
    }
  },
  gu: {
    translation: {
      // ... Your existing Login keys ...
      contact: "સપોર્ટ સંપર્ક",
      logout: "લોગઆઉટ",

      // --- NEW DASHBOARD KEYS ---
      search: "શોધો...",
      home: "હોમ",
      dashboard: "ડેશબોર્ડ",
      session: "સત્ર",
      my_account: "મારું ખાતું",
      profile: "પ્રોફાઇલ",
      settings: "સેટિંગ્સ",

      // Sidebar
      menu_main: "મુખ્ય મેનુ",
      campuses: "કેમ્પસ",
      create_campus: "કેમ્પસ બનાવો",
      academic_setup: "શૈક્ષણિક સેટઅપ",
      create_board: "બોર્ડ બનાવો",
      role_permission: "રોલ પરવાનગી",
      create_role: "રોલ બનાવો",
      system: "સિસ્ટમ",
      appearance: "દેખાવ",
      light: "લાઈટ",
      dark: "ડાર્ક",
      bg_accent: "બેકગ્રાઉન્ડ કલર",
      quick_access: "ઝડપી accessક્સેસ",
      search_results: "શોધ પરિણામો",
      no_results: "કોઈ પરિણામ મળ્યું નથી"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;