import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation Resources
const resources = {
  en: {
    translation: {
      contact: "Contact Support",
      system: "System",
      version: "V2.0 Now Live",
      heroTitlePrefix: "The",
      heroTitleHighlight: "Smart",
      heroTitleMid: "Way to Manage",
      typingWords: ["Future", "Innovation", "Excellence"],
      heroDesc: "Streamline your academic journey with our unified portal. Access grades, attendance, and resources in one secure dashboard.",
      hello: "Hello Again!",
      welcomeBack: "Welcome back you've been missed.",
      staff: "Staff",
      student: "Student",
      admissionId: "Admission ID",
      employeeId: "Employee ID",
      enterAdmission: "Enter your Admission ID",
      enterEmployee: "Enter your Employee ID",
      password: "Password",
      enterPass: "Enter your password",
      remember: "Remember me",
      recovery: "Recovery Password",
      loginBtn: "Login Account",
      toastError: "Invalid credentials ❌",
      toastSuccess: "Login successful 🎉"
    }
  },
  hi: {
    translation: {
      contact: "सहायता संपर्क",
      system: "प्रणाली",
      version: "V2.0 अब लाइव है",
      heroTitlePrefix: "",
      heroTitleHighlight: "स्मार्ट",
      heroTitleMid: "तरीका, प्रबंधन का",
      typingWords: ["भविष्य", "नवाचार", "उत्कृष्टता"],
      heroDesc: "हमारे एकीकृत पोर्टल के साथ अपनी शैक्षणिक यात्रा को सरल बनाएं। एक सुरक्षित डैशबोर्ड में ग्रेड, उपस्थिति और संसाधनों तक पहुंचें।",
      hello: "नमस्ते!",
      welcomeBack: "वापसी पर स्वागत है, हमें आपकी याद आई।",
      staff: "कर्मचारी",
      student: "छात्र",
      admissionId: "प्रवेश आईडी",
      employeeId: "कर्मचारी आईडी",
      enterAdmission: "अपनी प्रवेश आईडी दर्ज करें",
      enterEmployee: "अपनी कर्मचारी आईडी दर्ज करें",
      password: "पासवर्ड",
      enterPass: "अपना पासवर्ड दर्ज करें",
      remember: "मुझे याद रखें",
      recovery: "पासवर्ड पुनर्प्राप्ति",
      loginBtn: "लॉगिन करें",
      toastError: "अमान्य क्रेडेंशियल्स ❌",
      toastSuccess: "लॉगिन सफल 🎉"
    }
  },
  gu: {
    translation: {
      contact: "સપોર્ટ સંપર્ક",
      system: "સિસ્ટમ",
      version: "V2.0 હવે લાઈવ",
      heroTitlePrefix: "",
      heroTitleHighlight: "સ્માર્ટ",
      heroTitleMid: "મેનેજમેન્ટની રીત",
      typingWords: ["ભવિષ્ય", "નવીનતા", "શ્રેષ્ઠતા"],
      heroDesc: "અમારા યુનિફાઇડ પોર્ટલ સાથે તમારી શૈક્ષણિક યાત્રાને સરળ બનાવો. એક સુરક્ષિત ડેશબોર્ડમાં ગ્રેડ, હાજરી અને સંસાધનોને ઍક્સેસ કરો.",
      hello: "નમસ્તે!",
      welcomeBack: "સ્વાગત છે, અમને તમારી યાદ આવી.",
      staff: "સ્ટાફ",
      student: "વિદ્યાર્થી",
      admissionId: "એડમિશન આઈડી",
      employeeId: "કર્મચારી આઈડી",
      enterAdmission: "તમારું એડમિશન આઈડી દાખલ કરો",
      enterEmployee: "તમારું કર્મચારી આઈડી દાખલ કરો",
      password: "પાસવર્ડ",
      enterPass: "તમારો પાસવર્ડ દાખલ કરો",
      remember: "મને યાદ રાખો",
      recovery: "પાસવર્ડ રિકવરી",
      loginBtn: "લોગિન કરો",
      toastError: "અમાન્ય વિગતો ❌",
      toastSuccess: "લોગિન સફળ 🎉"
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