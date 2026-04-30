import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { COLORS } from '../../../../config/colors';
import api from '../../../../config/api';
import { toast, Toaster } from 'react-hot-toast';
import {
  CreditCard,
  Calendar,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Receipt,
  ChevronRight,
  Eye,
  Wallet,
  Bell,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  RefreshCw,
  CalendarDays,
  Building,
  User,
  ShieldCheck,
  Zap,
  Target,
  Award,
  Star,
  BarChart3,
  PieChart,
  Activity,
  Timer,
  AlertTriangle,
  CheckSquare,
  XCircle,
  Loader2,
  Sparkles,
  Gem,
  Crown,
  Trophy,
  Medal,
  Coins,
  Banknote,
  CreditCardIcon,
  Smartphone,
  QrCode,
  Building2,
  PiggyBank,
  Calculator,
  FileCheck,
  FileX,
  FileWarning,
  FilePlus,
  FileDown,
  FileUp,
  FileSearch,
  FileSpreadsheet,
  FileTextIcon,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FilePlus2,
  FileMinus,
  FileEdit,
  FileTrash,
  FileCopy,
  FileScan,
  FileQuestion,
  FileHeart,
  FileLock,
  FileUnlock,
  FileKey,
  FileSignature,
  FileDigit,
  FileBox,
  FileStack,
  FileArchive2,
  FileOutput,
  FileInput,
  FileSymlink,
  FileMinus2,
  FilePlus3,
  FileCheck2,
  FileX2,
  FileSearch2,
  FileScan2,
  FileHeart2,
  FileLock2,
  FileUnlock2,
  FileKey2,
  FileSignature2,
  FileDigit2,
  FileBox2,
  FileStack2,
  FileArchive3,
  FileOutput2,
  FileInput2,
  FileSymlink2,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Edit,
  Trash2,
  Save,
  X,
  Menu,
  Home,
  Settings,
  LogOut,
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Link,
  ExternalLink,
  Copy,
  Share,
  Send,
  MessageCircle,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Bookmark,
  Flag,
  MoreHorizontal,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  Play,
  Pause,
  Square,
  Circle,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  ScreenShareOff,
  PhoneCall,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Voicemail,
  Wifi,
  WifiOff,
  Battery,
  BatteryLow,
  BatteryCharging,
  Signal,
  SignalLow,
  SignalMedium,
  SignalHigh,
  Radio,
  RadioTower,
  Router,
  Server,
  Database,
  HardDrive,
  Cpu,
  Monitor,
  Smartphone2,
  Tablet,
  Laptop,
  Camera,
  CameraOff,
  Image,
  ImageOff,
  Film,
  FilmOff,
  Music,
  MusicOff,
  Headphones,
  HeadphonesOff,
  Speaker,
  SpeakerOff,
  Mic2,
  Mic2Off,
  Video2,
  Video2Off,
  Tv,
  TvOff,
  Gamepad2,
  Gamepad2Off,
  Keyboard,
  KeyboardOff,
  Mouse,
  MouseOff,
  MousePointer,
  MousePointer2,
  MousePointerClick,
  Touchpad,
  TouchpadOff,
  Pen,
  PenOff,
  PenTool,
  PenToolOff,
  Brush,
  BrushOff,
  Eraser,
  EraserOff,
  Scissors,
  ScissorsOff,
  Ruler,
  RulerOff,
  Compass,
  CompassOff,
  Triangle,
  TriangleOff,
  Square2,
  Square2Off,
  Circle2,
  Circle2Off,
  Hexagon,
  HexagonOff,
  Pentagon,
  PentagonOff,
  Star2,
  Star2Off,
  Diamond,
  DiamondOff,
  Cross,
  CrossOff,
  Check,
  CheckOff,
  X2,
  X2Off,
  Plus2,
  Plus2Off,
  Minus2,
  Minus2Off,
  Divide,
  DivideOff,
  Equal,
  EqualOff,
  NotEqual,
  NotEqualOff,
  LessThan,
  LessThanOff,
  GreaterThan,
  GreaterThanOff,
  LessThanOrEqual,
  LessThanOrEqualOff,
  GreaterThanOrEqual,
  GreaterThanOrEqualOff,
  Percent,
  PercentOff,
  Hash,
  HashOff,
  AtSign,
  AtSignOff,
  Slash,
  SlashOff,
  Backslash,
  BackslashOff,
  Pipe,
  PipeOff,
  Underscore,
  UnderscoreOff,
  Hyphen,
  HyphenOff,
  Asterisk,
  AsteriskOff,
  Ampersand,
  AmpersandOff,
  Question,
  QuestionOff,
  Exclamation,
  ExclamationOff,
  Dot,
  DotOff,
  Comma,
  CommaOff,
  Colon,
  ColonOff,
  Semicolon,
  SemicolonOff,
  Apostrophe,
  ApostropheOff,
  Quote,
  QuoteOff,
  DoubleQuote,
  DoubleQuoteOff,
  LeftParenthesis,
  LeftParenthesisOff,
  RightParenthesis,
  RightParenthesisOff,
  LeftBracket,
  LeftBracketOff,
  RightBracket,
  RightBracketOff,
  LeftBrace,
  LeftBraceOff,
  RightBrace,
  RightBraceOff,
  LeftAngleBracket,
  LeftAngleBracketOff,
  RightAngleBracket,
  RightAngleBracketOff,
  LeftChevron,
  LeftChevronOff,
  RightChevron,
  RightChevronOff,
  UpChevron,
  UpChevronOff,
  DownChevron,
  DownChevronOff,
  UpArrow,
  UpArrowOff,
  DownArrow,
  DownArrowOff,
  LeftArrow,
  LeftArrowOff,
  RightArrow,
  RightArrowOff,
  UpLeftArrow,
  UpLeftArrowOff,
  UpRightArrow,
  UpRightArrowOff,
  DownLeftArrow,
  DownLeftArrowOff,
  DownRightArrow,
  DownRightArrowOff,
  ArrowUpCircle,
  ArrowUpCircleOff,
  ArrowDownCircle,
  ArrowDownCircleOff,
  ArrowLeftCircle,
  ArrowLeftCircleOff,
  ArrowRightCircle,
  ArrowRightCircleOff,
  ArrowUpSquare,
  ArrowUpSquareOff,
  ArrowDownSquare,
  ArrowDownSquareOff,
  ArrowLeftSquare,
  ArrowLeftSquareOff,
  ArrowRightSquare,
  ArrowRightSquareOff,
  ArrowUpTriangle,
  ArrowUpTriangleOff,
  ArrowDownTriangle,
  ArrowDownTriangleOff,
  ArrowLeftTriangle,
  ArrowLeftTriangleOff,
  ArrowRightTriangle,
  ArrowRightTriangleOff,
  ArrowUpDiamond,
  ArrowUpDiamondOff,
  ArrowDownDiamond,
  ArrowDownDiamondOff,
  ArrowLeftDiamond,
  ArrowLeftDiamondOff,
  ArrowRightDiamond,
  ArrowRightDiamondOff,
  ArrowUpHexagon,
  ArrowUpHexagonOff,
  ArrowDownHexagon,
  ArrowDownHexagonOff,
  ArrowLeftHexagon,
  ArrowLeftHexagonOff,
  ArrowRightHexagon,
  ArrowRightHexagonOff,
  ArrowUpPentagon,
  ArrowUpPentagonOff,
  ArrowDownPentagon,
  ArrowDownPentagonOff,
  ArrowLeftPentagon,
  ArrowLeftPentagonOff,
  ArrowRightPentagon,
  ArrowRightPentagonOff,
  ArrowUpStar,
  ArrowUpStarOff,
  ArrowDownStar,
  ArrowDownStarOff,
  ArrowLeftStar,
  ArrowLeftStarOff,
  ArrowRightStar,
  ArrowRightStarOff,
  ArrowUpCross,
  ArrowUpCrossOff,
  ArrowDownCross,
  ArrowDownCrossOff,
  ArrowLeftCross,
  ArrowLeftCrossOff,
  ArrowRightCross,
  ArrowRightCrossOff,
  ArrowUpCheck,
  ArrowUpCheckOff,
  ArrowDownCheck,
  ArrowDownCheckOff,
  ArrowLeftCheck,
  ArrowLeftCheckOff,
  ArrowRightCheck,
  ArrowRightCheckOff,
  ArrowUpX,
  ArrowUpXOff,
  ArrowDownX,
  ArrowDownXOff,
  ArrowLeftX,
  ArrowLeftXOff,
  ArrowRightX,
  ArrowRightXOff,
  ArrowUpPlus,
  ArrowUpPlusOff,
  ArrowDownPlus,
  ArrowDownPlusOff,
  ArrowLeftPlus,
  ArrowLeftPlusOff,
  ArrowRightPlus,
  ArrowRightPlusOff,
  ArrowUpMinus,
  ArrowUpMinusOff,
  ArrowDownMinus,
  ArrowDownMinusOff,
  ArrowLeftMinus,
  ArrowLeftMinusOff,
  ArrowRightMinus,
  ArrowRightMinusOff,
  ArrowUpDivide,
  ArrowUpDivideOff,
  ArrowDownDivide,
  ArrowDownDivideOff,
  ArrowLeftDivide,
  ArrowLeftDivideOff,
  ArrowRightDivide,
  ArrowRightDivideOff,
  ArrowUpEqual,
  ArrowUpEqualOff,
  ArrowDownEqual,
  ArrowDownEqualOff,
  ArrowLeftEqual,
  ArrowLeftEqualOff,
  ArrowRightEqual,
  ArrowRightEqualOff,
  ArrowUpNotEqual,
  ArrowUpNotEqualOff,
  ArrowDownNotEqual,
  ArrowDownNotEqualOff,
  ArrowLeftNotEqual,
  ArrowLeftNotEqualOff,
  ArrowRightNotEqual,
  ArrowRightNotEqualOff,
  ArrowUpLessThan,
  ArrowUpLessThanOff,
  ArrowDownLessThan,
  ArrowDownLessThanOff,
  ArrowLeftLessThan,
  ArrowLeftLessThanOff,
  ArrowRightLessThan,
  ArrowRightLessThanOff,
  ArrowUpGreaterThan,
  ArrowUpGreaterThanOff,
  ArrowDownGreaterThan,
  ArrowDownGreaterThanOff,
  ArrowLeftGreaterThan,
  ArrowLeftGreaterThanOff,
  ArrowRightGreaterThan,
  ArrowRightGreaterThanOff,
  ArrowUpLessThanOrEqual,
  ArrowUpLessThanOrEqualOff,
  ArrowDownLessThanOrEqual,
  ArrowDownLessThanOrEqualOff,
  ArrowLeftLessThanOrEqual,
  ArrowLeftLessThanOrEqualOff,
  ArrowRightLessThanOrEqual,
  ArrowRightLessThanOrEqualOff,
  ArrowUpGreaterThanOrEqual,
  ArrowUpGreaterThanOrEqualOff,
  ArrowDownGreaterThanOrEqual,
  ArrowDownGreaterThanOrEqualOff,
  ArrowLeftGreaterThanOrEqual,
  ArrowLeftGreaterThanOrEqualOff,
  ArrowRightGreaterThanOrEqual,
  ArrowRightGreaterThanOrEqualOff,
  ArrowUpPercent,
  ArrowUpPercentOff,
  ArrowDownPercent,
  ArrowDownPercentOff,
  ArrowLeftPercent,
  ArrowLeftPercentOff,
  ArrowRightPercent,
  ArrowRightPercentOff,
  ArrowUpHash,
  ArrowUpHashOff,
  ArrowDownHash,
  ArrowDownHashOff,
  ArrowLeftHash,
  ArrowLeftHashOff,
  ArrowRightHash,
  ArrowRightHashOff,
  ArrowUpAtSign,
  ArrowUpAtSignOff,
  ArrowDownAtSign,
  ArrowDownAtSignOff,
  ArrowLeftAtSign,
  ArrowLeftAtSignOff,
  ArrowRightAtSign,
  ArrowRightAtSignOff,
  ArrowUpSlash,
  ArrowUpSlashOff,
  ArrowDownSlash,
  ArrowDownSlashOff,
  ArrowLeftSlash,
  ArrowLeftSlashOff,
  ArrowRightSlash,
  ArrowRightSlashOff,
  ArrowUpBackslash,
  ArrowUpBackslashOff,
  ArrowDownBackslash,
  ArrowDownBackslashOff,
  ArrowLeftBackslash,
  ArrowLeftBackslashOff,
  ArrowRightBackslash,
  ArrowRightBackslashOff,
  ArrowUpPipe,
  ArrowUpPipeOff,
  ArrowDownPipe,
  ArrowDownPipeOff,
  ArrowLeftPipe,
  ArrowLeftPipeOff,
  ArrowRightPipe,
  ArrowRightPipeOff,
  ArrowUpUnderscore,
  ArrowUpUnderscoreOff,
  ArrowDownUnderscore,
  ArrowDownUnderscoreOff,
  ArrowLeftUnderscore,
  ArrowLeftUnderscoreOff,
  ArrowRightUnderscore,
  ArrowRightUnderscoreOff,
  ArrowUpHyphen,
  ArrowUpHyphenOff,
  ArrowDownHyphen,
  ArrowDownHyphenOff,
  ArrowLeftHyphen,
  ArrowLeftHyphenOff,
  ArrowRightHyphen,
  ArrowRightHyphenOff,
  ArrowUpAsterisk,
  ArrowUpAsteriskOff,
  ArrowDownAsterisk,
  ArrowDownAsteriskOff,
  ArrowLeftAsterisk,
  ArrowLeftAsteriskOff,
  ArrowRightAsterisk,
  ArrowRightAsteriskOff,
  ArrowUpAmpersand,
  ArrowUpAmpersandOff,
  ArrowDownAmpersand,
  ArrowDownAmpersandOff,
  ArrowLeftAmpersand,
  ArrowLeftAmpersandOff,
  ArrowRightAmpersand,
  ArrowRightAmpersandOff,
  ArrowUpQuestion,
  ArrowUpQuestionOff,
  ArrowDownQuestion,
  ArrowDownQuestionOff,
  ArrowLeftQuestion,
  ArrowLeftQuestionOff,
  ArrowRightQuestion,
  ArrowRightQuestionOff,
  ArrowUpExclamation,
  ArrowUpExclamationOff,
  ArrowDownExclamation,
  ArrowDownExclamationOff,
  ArrowLeftExclamation,
  ArrowLeftExclamationOff,
  ArrowRightExclamation,
  ArrowRightExclamationOff,
  ArrowUpDot,
  ArrowUpDotOff,
  ArrowDownDot,
  ArrowDownDotOff,
  ArrowLeftDot,
  ArrowLeftDotOff,
  ArrowRightDot,
  ArrowRightDotOff,
  ArrowUpComma,
  ArrowUpCommaOff,
  ArrowDownComma,
  ArrowDownCommaOff,
  ArrowLeftComma,
  ArrowLeftCommaOff,
  ArrowRightComma,
  ArrowRightCommaOff,
  ArrowUpColon,
  ArrowUpColonOff,
  ArrowDownColon,
  ArrowDownColonOff,
  ArrowLeftColon,
  ArrowLeftColonOff,
  ArrowRightColon,
  ArrowRightColonOff,
  ArrowUpSemicolon,
  ArrowUpSemicolonOff,
  ArrowDownSemicolon,
  ArrowDownSemicolonOff,
  ArrowLeftSemicolon,
  ArrowLeftSemicolonOff,
  ArrowRightSemicolon,
  ArrowRightSemicolonOff,
  ArrowUpApostrophe,
  ArrowUpApostropheOff,
  ArrowDownApostrophe,
  ArrowDownApostropheOff,
  ArrowLeftApostrophe,
  ArrowLeftApostropheOff,
  ArrowRightApostrophe,
  ArrowRightApostropheOff,
  ArrowUpQuote,
  ArrowUpQuoteOff,
  ArrowDownQuote,
  ArrowDownQuoteOff,
  ArrowLeftQuote,
  ArrowLeftQuoteOff,
  ArrowRightQuote,
  ArrowRightQuoteOff,
  ArrowUpDoubleQuote,
  ArrowUpDoubleQuoteOff,
  ArrowDownDoubleQuote,
  ArrowDownDoubleQuoteOff,
  ArrowLeftDoubleQuote,
  ArrowLeftDoubleQuoteOff,
  ArrowRightDoubleQuote,
  ArrowRightDoubleQuoteOff,
  ArrowUpLeftParenthesis,
  ArrowUpLeftParenthesisOff,
  ArrowDownLeftParenthesis,
  ArrowDownLeftParenthesisOff,
  ArrowLeftLeftParenthesis,
  ArrowLeftLeftParenthesisOff,
  ArrowRightLeftParenthesis,
  ArrowRightLeftParenthesisOff,
  ArrowUpRightParenthesis,
  ArrowUpRightParenthesisOff,
  ArrowDownRightParenthesis,
  ArrowDownRightParenthesisOff,
  ArrowLeftRightParenthesis,
  ArrowLeftRightParenthesisOff,
  ArrowRightRightParenthesis,
  ArrowRightRightParenthesisOff,
  ArrowUpLeftBracket,
  ArrowUpLeftBracketOff,
  ArrowDownLeftBracket,
  ArrowDownLeftBracketOff,
  ArrowLeftLeftBracket,
  ArrowLeftLeftBracketOff,
  ArrowRightLeftBracket,
  ArrowRightLeftBracketOff,
  ArrowUpRightBracket,
  ArrowUpRightBracketOff,
  ArrowDownRightBracket,
  ArrowDownRightBracketOff,
  ArrowLeftRightBracket,
  ArrowLeftRightBracketOff,
  ArrowRightRightBracket,
  ArrowRightRightBracketOff,
  ArrowUpLeftBrace,
  ArrowUpLeftBraceOff,
  ArrowDownLeftBrace,
  ArrowDownLeftBraceOff,
  ArrowLeftLeftBrace,
  ArrowLeftLeftBraceOff,
  ArrowRightLeftBrace,
  ArrowRightLeftBraceOff,
  ArrowUpRightBrace,
  ArrowUpRightBraceOff,
  ArrowDownRightBrace,
  ArrowDownRightBraceOff,
  ArrowLeftRightBrace,
  ArrowLeftRightBraceOff,
  ArrowRightRightBrace,
  ArrowRightRightBraceOff,
  ArrowUpLeftAngleBracket,
  ArrowUpLeftAngleBracketOff,
  ArrowDownLeftAngleBracket,
  ArrowDownLeftAngleBracketOff,
  ArrowLeftLeftAngleBracket,
  ArrowLeftLeftAngleBracketOff,
  ArrowRightLeftAngleBracket,
  ArrowRightLeftAngleBracketOff,
  ArrowUpRightAngleBracket,
  ArrowUpRightAngleBracketOff,
  ArrowDownRightAngleBracket,
  ArrowDownRightAngleBracketOff,
  ArrowLeftRightAngleBracket,
  ArrowLeftRightAngleBracketOff,
  ArrowRightRightAngleBracket,
  ArrowRightRightAngleBracketOff,
} from 'lucide-react';

const PaymentHistory = () => {
  const themeMode = useSelector((state) => state.color.mode);
  const isDark = themeMode === "dark";
  const [loading, setLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Professional theme colors
  const primaryColor = COLORS.bgColor;
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const textMuted = isDark ? 'text-gray-500 font-medium text-xs' : 'text-gray-500 font-medium text-xs';
  const glassCard = `relative overflow-hidden rounded-2xl backdrop-blur-lg transition-all duration-300 ${
    isDark 
      ? 'bg-[#1A1A1A] border-white/5 shadow-black/40' 
      : 'bg-white/80 border-gray-200/60 shadow-lg'
  }`;
  const premiumCard = `relative overflow-hidden group rounded-2xl backdrop-blur-xl transition-all duration-300 ${
    isDark 
      ? 'bg-[#1A1A1A] border-white/5 shadow-black/40 hover:shadow-2xl hover:scale-[1.03]' 
      : 'bg-white/80 border-gray-200/60 shadow-lg hover:shadow-xl hover:scale-[1.03]'
  }`;
  const buttonClass = `px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
    isDark 
      ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30' 
      : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30'
  }`;
  const inputClass = `w-full px-4 py-3 rounded-xl border outline-none transition-all font-semibold text-sm ${
    isDark 
      ? 'bg-[#1A1A1A] border-white/10 text-white focus:border-primary focus:bg-[#222]' 
      : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-primary focus:bg-white focus:shadow-sm'
  }`;

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [paymentHistory, searchQuery, filterStatus, filterMethod, filterDateRange]);

  const fetchPaymentHistory = async () => {
    try {
      setLoading(true);
      // Mock API call - replace with actual endpoint
      const mockHistory = [
        {
          id: 1,
          transactionId: 'TXN123456789',
          date: '2024-04-10',
          time: '10:30 AM',
          amount: 31250,
          type: 'Quarter 1 Fees',
          category: 'tuition',
          method: 'Online',
          paymentMethod: 'Credit Card',
          status: 'completed',
          description: 'Payment for Quarter 1 tuition fees',
          installmentDetails: {
            quarter: 'Quarter 1',
            academicYear: '2024-25',
            grade: 'Grade 12',
            stream: 'Science',
          },
          feeBreakdown: {
            tuitionFee: 25000,
            labFee: 3750,
            libraryFee: 1250,
            sportsFee: 1250,
          },
          discounts: [
            { name: 'Early Bird Discount', amount: 500 },
            { name: 'Sibling Discount', amount: 300 },
          ],
          penalties: [],
          receiptUrl: '#',
          invoiceUrl: '#',
          createdAt: '2024-04-10T10:30:00Z',
          updatedAt: '2024-04-10T10:30:00Z',
        },
        {
          id: 2,
          transactionId: 'TXN987654321',
          date: '2024-01-15',
          time: '02:45 PM',
          amount: 25000,
          type: 'Registration Fee',
          category: 'registration',
          method: 'Bank',
          paymentMethod: 'Bank Transfer',
          status: 'completed',
          description: 'One-time registration fee for new admission',
          installmentDetails: {
            academicYear: '2024-25',
            grade: 'Grade 12',
            stream: 'Science',
          },
          feeBreakdown: {
            registrationFee: 20000,
            admissionFee: 5000,
          },
          discounts: [],
          penalties: [],
          receiptUrl: '#',
          invoiceUrl: '#',
          createdAt: '2024-01-15T14:45:00Z',
          updatedAt: '2024-01-15T14:45:00Z',
        },
        {
          id: 3,
          transactionId: 'TXN456789123',
          date: '2023-10-15',
          time: '09:15 AM',
          amount: 20000,
          type: 'Library Fee',
          category: 'ancillary',
          method: 'Online',
          paymentMethod: 'UPI',
          status: 'completed',
          description: 'Annual library fee for academic resources',
          installmentDetails: {
            academicYear: '2024-25',
            grade: 'Grade 12',
            stream: 'Science',
          },
          feeBreakdown: {
            libraryFee: 15000,
            digitalResources: 5000,
          },
          discounts: [],
          penalties: [],
          receiptUrl: '#',
          invoiceUrl: '#',
          createdAt: '2023-10-15T09:15:00Z',
          updatedAt: '2023-10-15T09:15:00Z',
        },
        {
          id: 4,
          transactionId: 'TXN789123456',
          date: '2023-07-20',
          time: '11:30 AM',
          amount: 15000,
          type: 'Sports Fee',
          category: 'ancillary',
          method: 'Online',
          paymentMethod: 'Debit Card',
          status: 'completed',
          description: 'Annual sports and activities fee',
          installmentDetails: {
            academicYear: '2024-25',
            grade: 'Grade 12',
            stream: 'Science',
          },
          feeBreakdown: {
            sportsFee: 10000,
            activitiesFee: 5000,
          },
          discounts: [
            { name: 'Sports Scholarship', amount: 1000 },
          ],
          penalties: [],
          receiptUrl: '#',
          invoiceUrl: '#',
          createdAt: '2023-07-20T11:30:00Z',
          updatedAt: '2023-07-20T11:30:00Z',
        },
        {
          id: 5,
          transactionId: 'TXN321654987',
          date: '2023-04-05',
          time: '03:20 PM',
          amount: 18000,
          type: 'Lab Fee',
          category: 'ancillary',
          method: 'Online',
          paymentMethod: 'Credit Card',
          status: 'completed',
          description: 'Laboratory and equipment fee for science stream',
          installmentDetails: {
            academicYear: '2024-25',
            grade: 'Grade 12',
            stream: 'Science',
          },
          feeBreakdown: {
            labFee: 15000,
            equipmentFee: 3000,
          },
          discounts: [],
          penalties: [],
          receiptUrl: '#',
          invoiceUrl: '#',
          createdAt: '2023-04-05T15:20:00Z',
          updatedAt: '2023-04-05T15:20:00Z',
        },
      ];
      setPaymentHistory(mockHistory);
    } catch (error) {
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...paymentHistory];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(payment =>
        payment.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(payment => payment.status === filterStatus);
    }

    // Filter by method
    if (filterMethod !== 'all') {
      filtered = filtered.filter(payment => payment.method === filterMethod);
    }

    // Filter by date range
    if (filterDateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filterDateRange) {
        case '7days':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30days':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '3months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        case '6months':
          filterDate.setMonth(now.getMonth() - 6);
          break;
        case '1year':
          filterDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }
      
      filtered = filtered.filter(payment => new Date(payment.date) >= filterDate);
    }

    setFilteredHistory(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-500 bg-green-500/10';
      case 'pending':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'failed':
        return 'text-red-500 bg-red-500/10';
      case 'refunded':
        return 'text-blue-500 bg-blue-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'Online':
        return CreditCard;
      case 'Bank':
        return Building2;
      case 'Cash':
        return Banknote;
      case 'UPI':
        return Smartphone;
      default:
        return CreditCard;
    }
  };

  const handleViewReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleDownloadReceipt = (payment) => {
    // Mock download functionality
    toast.success('Receipt downloaded successfully!');
  };

  const handleDownloadInvoice = (payment) => {
    // Mock download functionality
    toast.success('Invoice downloaded successfully!');
  };

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // Calculate statistics
  const totalAmount = filteredHistory.reduce((sum, payment) => sum + payment.amount, 0);
  const completedPayments = filteredHistory.filter(p => p.status === 'completed').length;
  const averagePayment = filteredHistory.length > 0 ? totalAmount / filteredHistory.length : 0;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className={`text-lg font-semibold ${textPrimary}`}>Loading Payment History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary} mb-2 flex items-center gap-3`}>
              <Receipt className="w-8 h-8 text-primary" />
              Payment History
            </h1>
            <p className={`${textSecondary}`}>View and manage your payment records</p>
          </div>
          <div className="flex items-center gap-3">
            <button className={`px-4 py-2 rounded-xl ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-white hover:bg-gray-50'} transition-all`}>
              <RefreshCw className="w-5 h-5" />
            </button>
            <button className={`px-4 py-2 rounded-xl ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-white hover:bg-gray-50'} transition-all`}>
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={premiumCard}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg">
                Total
              </span>
            </div>
            <h3 className={`text-2xl font-bold ${textPrimary} mb-1`}>
              ₹{totalAmount.toLocaleString()}
            </h3>
            <p className={`${textSecondary} text-sm`}>Total Paid</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={premiumCard}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                Completed
              </span>
            </div>
            <h3 className={`text-2xl font-bold ${textPrimary} mb-1`}>
              {completedPayments}
            </h3>
            <p className={`${textSecondary} text-sm`}>Successful Payments</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={premiumCard}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <span className="text-xs font-semibold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg">
                Average
              </span>
            </div>
            <h3 className={`text-2xl font-bold ${textPrimary} mb-1`}>
              ₹{Math.round(averagePayment).toLocaleString()}
            </h3>
            <p className={`${textSecondary} text-sm`}>Average Payment</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={premiumCard}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <FileText className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-xs font-semibold text-purple-500 bg-purple-500/10 px-2 py-1 rounded-lg">
                Records
              </span>
            </div>
            <h3 className={`text-2xl font-bold ${textPrimary} mb-1`}>
              {filteredHistory.length}
            </h3>
            <p className={`${textSecondary} text-sm`}>Total Records</p>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={premiumCard}
      >
        <div className="p-6">
          <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`pl-10 pr-4 py-2 rounded-xl border ${inputClass}`}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={inputClass}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              className={inputClass}
            >
              <option value="all">All Methods</option>
              <option value="Online">Online</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
            </select>
            <select
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
              className={inputClass}
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Payment List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={premiumCard}
      >
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <th className={`text-left pb-4 ${textSecondary} text-sm font-semibold`}>Transaction</th>
                  <th className={`text-left pb-4 ${textSecondary} text-sm font-semibold`}>Date & Time</th>
                  <th className={`text-left pb-4 ${textSecondary} text-sm font-semibold`}>Type</th>
                  <th className={`text-left pb-4 ${textSecondary} text-sm font-semibold`}>Method</th>
                  <th className={`text-left pb-4 ${textSecondary} text-sm font-semibold`}>Amount</th>
                  <th className={`text-left pb-4 ${textSecondary} text-sm font-semibold`}>Status</th>
                  <th className={`text-right pb-4 ${textSecondary} text-sm font-semibold`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-transparent">
                {currentItems.map((payment) => {
                  const MethodIcon = getMethodIcon(payment.method);
                  return (
                    <tr key={payment.id} className={`transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                      <td className="py-4">
                        <div>
                          <p className={`font-semibold ${textPrimary}`}>{payment.transactionId}</p>
                          <p className={`text-sm ${textSecondary}`}>{payment.description}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <p className={`font-semibold ${textPrimary}`}>{payment.date}</p>
                          <p className={`text-sm ${textSecondary}`}>{payment.time}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div>
                          <p className={`font-semibold ${textPrimary}`}>{payment.type}</p>
                          <p className={`text-sm ${textSecondary}`}>{payment.category}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <MethodIcon className="w-4 h-4 text-primary" />
                          <div>
                            <p className={`font-semibold ${textPrimary}`}>{payment.method}</p>
                            <p className={`text-sm ${textSecondary}`}>{payment.paymentMethod}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <p className={`font-bold text-lg ${textPrimary}`}>₹{payment.amount.toLocaleString()}</p>
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(payment)}
                            className={`p-2 rounded-lg ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleViewReceipt(payment)}
                            className={`p-2 rounded-lg ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
                            title="View Receipt"
                          >
                            <Receipt className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadReceipt(payment)}
                            className={`p-2 rounded-lg ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
                            title="Download Receipt"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6">
              <p className={`text-sm ${textMuted}`}>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredHistory.length)} of {filteredHistory.length} payments
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-xl border transition-all ${
                    currentPage === 1 
                      ? 'opacity-20 cursor-not-allowed' 
                      : 'hover:bg-primary/10 text-primary border-primary/20'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                        currentPage === i + 1 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'text-gray-500 hover:bg-white/5'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2 rounded-xl border transition-all ${
                    currentPage === totalPages 
                      ? 'opacity-20 cursor-not-allowed' 
                      : 'hover:bg-primary/10 text-primary border-primary/20'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceiptModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowReceiptModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${premiumCard} w-full max-w-md`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold ${textPrimary}`}>Payment Receipt</h3>
                  <button
                    onClick={() => setShowReceiptModal(false)}
                    className={`p-2 rounded-lg ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className={`${textSecondary}`}>Transaction ID</span>
                        <span className={`font-semibold ${textPrimary}`}>{selectedPayment.transactionId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${textSecondary}`}>Date</span>
                        <span className={`font-semibold ${textPrimary}`}>{selectedPayment.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${textSecondary}`}>Time</span>
                        <span className={`font-semibold ${textPrimary}`}>{selectedPayment.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${textSecondary}`}>Type</span>
                        <span className={`font-semibold ${textPrimary}`}>{selectedPayment.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${textSecondary}`}>Method</span>
                        <span className={`font-semibold ${textPrimary}`}>{selectedPayment.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${textSecondary}`}>Amount</span>
                        <span className={`font-bold text-xl text-primary`}>₹{selectedPayment.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={`${textSecondary}`}>Status</span>
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(selectedPayment.status)}`}>
                          {selectedPayment.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDownloadReceipt(selectedPayment)}
                      className={`flex-1 ${buttonClass} flex items-center justify-center gap-2`}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                    <button
                      onClick={() => setShowReceiptModal(false)}
                      className={`flex-1 px-6 py-3 rounded-xl font-semibold ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetailsModal && selectedPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${premiumCard} w-full max-w-2xl max-h-[80vh] overflow-y-auto`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-bold ${textPrimary}`}>Payment Details</h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className={`p-2 rounded-lg ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Basic Information</h4>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className={`${textSecondary} text-sm`}>Transaction ID</span>
                          <p className={`font-semibold ${textPrimary}`}>{selectedPayment.transactionId}</p>
                        </div>
                        <div>
                          <span className={`${textSecondary} text-sm`}>Date & Time</span>
                          <p className={`font-semibold ${textPrimary}`}>{selectedPayment.date} at {selectedPayment.time}</p>
                        </div>
                        <div>
                          <span className={`${textSecondary} text-sm`}>Payment Type</span>
                          <p className={`font-semibold ${textPrimary}`}>{selectedPayment.type}</p>
                        </div>
                        <div>
                          <span className={`${textSecondary} text-sm`}>Category</span>
                          <p className={`font-semibold ${textPrimary}`}>{selectedPayment.category}</p>
                        </div>
                        <div>
                          <span className={`${textSecondary} text-sm`}>Payment Method</span>
                          <p className={`font-semibold ${textPrimary}`}>{selectedPayment.paymentMethod}</p>
                        </div>
                        <div>
                          <span className={`${textSecondary} text-sm`}>Status</span>
                          <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(selectedPayment.status)}`}>
                            {selectedPayment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fee Breakdown */}
                  <div>
                    <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Fee Breakdown</h4>
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                      <div className="space-y-2">
                        {Object.entries(selectedPayment.feeBreakdown).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className={`${textSecondary} capitalize`}>
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className={`font-semibold ${textPrimary}`}>
                              ₹{value.toLocaleString()}
                            </span>
                          </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between">
                            <span className={`font-semibold ${textPrimary}`}>Total</span>
                            <span className={`font-bold text-lg text-primary`}>
                              ₹{selectedPayment.amount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Discounts */}
                  {selectedPayment.discounts && selectedPayment.discounts.length > 0 && (
                    <div>
                      <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Discounts Applied</h4>
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <div className="space-y-2">
                          {selectedPayment.discounts.map((discount, index) => (
                            <div key={index} className="flex justify-between">
                              <span className={`${textSecondary}`}>{discount.name}</span>
                              <span className={`font-semibold text-green-500`}>
                                -₹{discount.amount.toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Installment Details */}
                  {selectedPayment.installmentDetails && (
                    <div>
                      <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Installment Details</h4>
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(selectedPayment.installmentDetails).map(([key, value]) => (
                            <div key={key}>
                              <span className={`${textSecondary} text-sm capitalize`}>
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <p className={`font-semibold ${textPrimary}`}>{value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDownloadReceipt(selectedPayment)}
                      className={`flex-1 ${buttonClass} flex items-center justify-center gap-2`}
                    >
                      <Download className="w-4 h-4" />
                      Download Receipt
                    </button>
                    <button
                      onClick={() => handleDownloadInvoice(selectedPayment)}
                      className={`flex-1 px-6 py-3 rounded-xl font-semibold ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
                    >
                      Download Invoice
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentHistory;
