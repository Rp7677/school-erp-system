import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Calendar, Bell, Users, Clock, FileText, Gift, Plus, Gauge, User, User2, Camera, TrendingUp, Award, Target, Activity, Zap, Star, ChevronRight, ArrowUpRight, ArrowDownRight, Sparkles, Briefcase, Building, Globe, Shield, BarChart3, PieChart, TrendingDown, Mail, Phone, MapPin, Linkedin, Twitter, Crown, Diamond, Medal, Trophy, Flame, Rocket, Eye, Heart, MessageSquare, CheckCircle, AlertCircle, TrendingUp as TrendUp, DollarSign, UserCheck, BookOpen, Brain, Target as TargetIcon } from "lucide-react";

const StaffDashboard = () => {
    const themeMode = useSelector((state) => state.color.mode);
    const isDark = themeMode === "dark";
    const [mounted, setMounted] = useState(false);
    const [stats, setStats] = useState({
        attendance: 95,
        performance: 88,
        tasksCompleted: 42,
        pendingTasks: 8,
        totalStudents: 1248,
        avgRating: 4.8,
        monthlyEarnings: 8450,
        courseCompletion: 76
    });

    useEffect(() => {
        setMounted(true);
        // Animate stats on mount
        const timer = setTimeout(() => {
            setStats(prev =>({
                attendance: 95,
                performance: 88,
                tasksCompleted: 42,
                pendingTasks: 8,
                totalStudents: 1248,
                avgRating: 4.8,
                monthlyEarnings: 8450,
                courseCompletion: 76
            }));
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const premiumCard = `relative overflow-hidden group rounded-3xl border backdrop-blur-xl transition-all duration-700 hover:shadow-2xl hover:scale-[1.03] hover:-translate-y-1 ${
        isDark 
            ? 'bg-[#1E1E1E] border-white/10 shadow-2xl' 
            : 'bg-white border-gray-200/80 shadow-lg'
    }`;
    
    const glassHeader = isDark 
        ? 'bg-white/[0.02] border-b border-white/10' 
        : 'bg-gray-50/80 border-b border-gray-200/80';
    
    const textPrimary = isDark ? 'text-white' : 'text-gray-900';
    const textSecondary = isDark ? 'text-gray-400' : 'text-gray-500';
    const textMuted = isDark ? "text-gray-500 font-medium text-xs" : "text-gray-500 font-medium text-xs";

    const PremiumStatCard = ({ icon: Icon, label, value, change, color, delay = 0, prefix = '', suffix = '' }) => (
        <div 
            className={`${premiumCard} p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl opacity-50"></div>
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                    <div className={`p-4 rounded-2xl ${color} bg-opacity-10 backdrop-blur-sm border ${color} border-opacity-20`}>
                        <Icon className={`w-7 h-7 ${color}`} />
                    </div>
                    {change && (
                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm ${
                            change > 0 
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                            {change > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                            <span>{Math.abs(change)}%</span>
                        </div>
                    )}
                </div>
                <div>
                    <p className={`text-sm font-semibold ${textMuted} mb-2 uppercase tracking-wider`}>{label}</p>
                    <p className={`text-3xl font-black ${textPrimary} leading-tight`}>
                        {prefix}{value}{suffix}
                    </p>
                </div>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen  p-6`}>
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Premium Profile Section */}
                {/* <div className={`${premiumCard} animate-in fade-in slide-in-from-top-4 duration-1000 delay-0`}>
                    <div className="relative overflow-hidden">
                        {/* Background Banner 
                        <div className={`h-32 ${isDark ? 'bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20' : 'bg-gradient-to-r from-primary/10 via-purple-100 to-blue-100'} relative`}>
                            <div className="absolute inset-0 bg-black/20"></div>
                            <div className="absolute top-4 right-4">
                                <button className={`px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm ${
                                    isDark 
                                        ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                                        : 'bg-white/80 text-gray-800 hover:bg-white border border-gray-200'
                                }`}>
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                        
                        {/* Profile Content 
                        <div className="relative px-8 pb-8">
                            {/* Avatar 
                            <div className="relative -mt-16 mb-6">
                                <div className="relative">
                                    <div className={`w-32 h-32 rounded-full ${isDark ? 'bg-gradient-to-br from-primary/20 to-primary/10' : 'bg-gradient-to-br from-primary/10 to-primary/5'} p-2 backdrop-blur-sm border-2 border-primary/30`}>
                                        <div className={`w-full h-full rounded-full ${isDark ? 'bg-[#1E1E1A]' : 'bg-white'} flex items-center justify-center border-2 border-primary/30`}>
                                            <User2 className={`w-16 h-16 ${isDark ? 'text-primary' : 'text-primary'}`} />
                                        </div>
                                    </div>
                                    {/* Status Ring 
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-3 border-white dark:border-[#121212] flex items-center justify-center">
                                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                                    </div>
                                    {/* Premium Badge 
                                    <div className="absolute -top-2 -left-2">
                                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                                            <Crown className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Profile Info 
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className={`text-3xl font-black ${textPrimary}`}>Mr. Patel Riyaz Abdullah</h1>
                                        <div className="flex items-center gap-1">
                                            <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 text-white`}>PRO</span>
                                        </div>
                                    </div>
                                    
                                    <p className={`${textSecondary} text-lg mb-4`}>Senior Faculty Member • ERP Department • PPSU</p>
                                    
                                    {/* Professional Tags 
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {[
                                            { label: 'PhD Computer Science', color: 'purple' },
                                            { label: '10+ Years Experience', color: 'blue' },
                                            { label: 'Certified Educator', color: 'green' },
                                            { label: 'Research Scholar', color: 'orange' },
                                            { label: 'Mentor', color: 'pink' }
                                        ].map((tag, index) => (
                                            <span key={index} className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                isDark 
                                                    ? `bg-${tag.color}-500/20 text-${tag.color}-400 border border-${tag.color}-500/30` 
                                                    : `bg-${tag.color}-100 text-${tag.color}-700`
                                            }`}>
                                                {tag.label}
                                            </span>
                                        ))}
                                    </div>
                                
                                    {/* Bio 
                                    <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'} mb-6`}>
                                        <p className={`${textSecondary} leading-relaxed`}>
                                            Passionate educator with expertise in Enterprise Resource Planning and Computer Science. 
                                            Dedicated to fostering innovation and excellence in academic environments. 
                                            Specialized in curriculum development and student mentorship.
                                        </p>
                                    </div>
                                    
                                    {/* Quick Stats 
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                            <p className={`text-2xl font-bold ${textPrimary}`}>4.9</p>
                                            <p className={`text-xs ${textMuted}`}>Rating</p>
                                        </div>
                                        <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                            <p className={`text-2xl font-bold ${textPrimary}`}>248</p>
                                            <p className={`text-xs ${textMuted}`}>Students</p>
                                        </div>
                                        <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                            <p className={`text-2xl font-bold ${textPrimary}`}>42</p>
                                            <p className={`text-xs ${textMuted}`}>Courses</p>
                                        </div>
                                        <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                            <p className={`text-2xl font-bold ${textPrimary}`}>15</p>
                                            <p className={`text-xs ${textMuted}`}>Awards</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Side Actions 
                                <div className="mt-6 md:mt-0 md:ml-8 space-y-3">
                                    <button className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                        isDark 
                                            ? 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20' 
                                            : 'bg-primary text-white hover:bg-primary/90 shadow-lg'
                                    }`}>
                                        View Full Profile
                                    </button>
                                    <button className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                        isDark 
                                            ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
                                    }`}>
                                        Download CV
                                    </button>
                                    <button className={`w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                                        isDark 
                                            ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
                                    }`}>
                                        Share Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div> */}
                <div className={`animate-in fade-in slide-in-from-top-4 duration-700 ${isDark ? 'bg-gradient-to-r from-[#1E1E1E] to-[#2A2A2A]' : 'bg-gradient-to-r from-white to-gray-50'} rounded-3xl p-8 border ${isDark ? 'border-white/10' : 'border-gray-200/60'} shadow-xl`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className={`w-24 h-24 rounded-full ${isDark ? 'bg-gradient-to-br from-primary/20 to-primary/10' : 'bg-gradient-to-br from-primary/10 to-primary/5'} p-1`}>
                                    <div className={`w-full h-full rounded-full ${isDark ? 'bg-[#1E1E1E]' : 'bg-white'} flex items-center justify-center border-2 border-primary/20`}>
                                        <User2 className={`w-10 h-10 ${isDark ? 'text-primary' : 'text-primary'}`} />
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-[#121212] flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <div>
                                <h1 className={`text-3xl font-bold ${textPrimary} flex items-center gap-2`}>
                                    Welcome back, Mr. Patel Riyaz Abdullah
                                    <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                                </h1>
                                <p className={`${textSecondary} mt-2`}>Intern, ERP, PPSU • Employee ID: 1899</p>
                                <div className="flex items-center space-x-4 mt-3">
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                                        Active Status
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`}>
                                        Verification Pending
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 md:mt-0">
                            <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-white/[0.05]' : 'bg-gray-50'}`}>
                                <Clock className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-primary' : 'text-primary'}`} />
                                <p className={`text-2xl font-bold ${textPrimary}`}>10:05 AM</p>
                                <p className={`text-sm ${textSecondary}`}>Current Time</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <PremiumStatCard 
                        icon={TrendingUp} 
                        label="Attendance Rate" 
                        value={`${stats.attendance}%`} 
                        change={5} 
                        color="text-green-500"
                        delay={100}
                    />
                    <PremiumStatCard 
                        icon={Award} 
                        label="Performance Score" 
                        value={`${stats.performance}/100`} 
                        change={12} 
                        color="text-blue-500"
                        delay={200}
                    />
                    <PremiumStatCard 
                        icon={Target} 
                        label="Tasks Completed" 
                        value={stats.tasksCompleted} 
                        change={8} 
                        color="text-purple-500"
                        delay={300}
                    />
                    <PremiumStatCard 
                        icon={Activity} 
                        label="Pending Tasks" 
                        value={stats.pendingTasks} 
                        change={-3} 
                        color="text-orange-500"
                        delay={400}
                    />
                </div> */}

                {/* Additional Premium Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                    <PremiumStatCard 
                        icon={Users} 
                        label="Total Students" 
                        value={stats.totalStudents.toLocaleString()} 
                        change={15} 
                        color="text-indigo-500"
                        delay={500}
                        prefix=""
                    />
                    <PremiumStatCard 
                        icon={Star} 
                        label="Average Rating" 
                        value={stats.avgRating.toFixed(1)} 
                        change={0.2} 
                        color="text-yellow-500"
                        delay={600}
                        prefix="⭐ "
                    />
                    <PremiumStatCard 
                        icon={DollarSign} 
                        label="Monthly Earnings" 
                        value={`$${stats.monthlyEarnings.toLocaleString()}`} 
                        change={8} 
                        color="text-emerald-500"
                        delay={700}
                    />
                    <PremiumStatCard 
                        icon={Trophy} 
                        label="Course Completion" 
                        value={`${stats.courseCompletion}%`} 
                        change={5} 
                        color="text-rose-500"
                        delay={800}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Today's Schedule */}
                    <div className={`lg:col-span-2 ${premiumCard} animate-in fade-in slide-in-from-left-4 duration-1000 delay-900`}>
                        <div className={`${glassHeader} px-6 py-4 border-b flex items-center justify-between`}>
                            <h3 className={`font-bold text-lg ${textPrimary} flex items-center gap-2`}>
                                <Calendar className="w-5 h-5" />
                                Today's Schedule
                            </h3>
                            <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isDark 
                                    ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                                    : 'bg-primary/5 text-primary hover:bg-primary/10'
                            }`}>
                                View Full Calendar
                            </button>
                        </div>
                        <div className="p-6">
                            <div className={`text-center py-12 rounded-xl ${isDark ? 'bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20' : 'bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200'}`}>
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Users className="w-8 h-8 text-green-500" />
                                </div>
                                <h4 className={`text-lg font-semibold ${textPrimary} mb-2`}>No Teaching Sessions Today</h4>
                                <p className={`${textSecondary}`}>Enjoy your free day or focus on administrative tasks</p>
                            </div>
                            
                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-4 mt-6">
                                <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-white/[0.05]' : 'bg-gray-50'}`}>
                                    <p className={`text-2xl font-bold ${textPrimary}`}>0</p>
                                    <p className={`text-xs ${textMuted}`}>Classes Today</p>
                                </div>
                                <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-white/[0.05]' : 'bg-gray-50'}`}>
                                    <p className={`text-2xl font-bold ${textPrimary}`}>12</p>
                                    <p className={`text-xs ${textMuted}`}>This Week</p>
                                </div>
                                <div className={`text-center p-4 rounded-xl ${isDark ? 'bg-white/[0.05]' : 'bg-gray-50'}`}>
                                    <p className={`text-2xl font-bold ${textPrimary}`}>48</p>
                                    <p className={`text-xs ${textMuted}`}>This Month</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className={`${premiumCard} animate-in fade-in slide-in-from-right-4 duration-1000 delay-1000`}>
                        <div className={`${glassHeader} px-6 py-4 border-b`}>
                            <h3 className={`font-bold text-lg ${textPrimary} flex items-center gap-2`}>
                                <Zap className="w-5 h-5" />
                                Quick Actions
                            </h3>
                        </div>
                        <div className="p-6 space-y-3">
                            {[
                                { icon: FileText, label: 'Apply Leave', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                { icon: Users, label: 'View Profile', color: 'text-green-500', bg: 'bg-green-500/10' },
                                { icon: Calendar, label: 'Schedule', color: 'text-purple-500', bg: 'bg-purple-500/10' },
                                { icon: Bell, label: 'Notifications', color: 'text-orange-500', bg: 'bg-orange-500/10' },
                                { icon: Award, label: 'Performance', color: 'text-pink-500', bg: 'bg-pink-500/10' },
                                { icon: Gift, label: 'Rewards', color: 'text-yellow-500', bg: 'bg-yellow-500/10' }
                            ].map((action, index) => (
                                <button
                                    key={index}
                                    className={`w-full p-4 rounded-xl flex items-center space-x-3 transition-all duration-200 hover:scale-[1.02] ${
                                        isDark 
                                            ? 'bg-white/[0.05] hover:bg-white/[0.08]' 
                                            : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                    style={{ animationDelay: `${500 + index * 100}ms` }}
                                >
                                    <div className={`p-2 rounded-lg ${action.bg}`}>
                                        <action.icon className={`w-5 h-5 ${action.color}`} />
                                    </div>
                                    <span className={`font-medium ${textPrimary}`}>{action.label}</span>
                                    <ChevronRight className={`w-4 h-4 ${textMuted} ml-auto`} />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Premium Achievements Section */}
                <div className={`${premiumCard} animate-in fade-in slide-in-from-top-4 duration-1000 delay-1300`}>
                    <div className={`${glassHeader} px-6 py-4 border-b flex items-center justify-between`}>
                        <h3 className={`font-bold text-lg ${textPrimary} flex items-center gap-2`}>
                            <Crown className="w-5 h-5 text-yellow-500" />
                            Achievements
                        </h3>
                        <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isDark 
                                ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' 
                                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        }`}>
                            View All Badges
                        </button>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className={`text-center p-6 rounded-xl ${isDark ? 'bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20' : 'bg-gradient-to-br from-purple-50 to-purple-100/50 border border-purple-200'}`}>
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                                    <Medal className="w-8 h-8 text-purple-500" />
                                </div>
                                <h4 className={`text-lg font-bold ${textPrimary} mb-2`}>Excellence Award</h4>
                                <p className={`text-sm ${textSecondary} mb-3`}>Top performer for 3 consecutive months</p>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700'}`}>
                                    Level: Gold
                                </div>
                            </div>
                            <div className={`text-center p-6 rounded-xl ${isDark ? 'bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20' : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200'}`}>
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Rocket className="w-8 h-8 text-blue-500" />
                                </div>
                                <h4 className={`text-lg font-bold ${textPrimary} mb-2`}>Innovation Leader</h4>
                                <p className={`text-sm ${textSecondary} mb-3`}>Pioneered new teaching methodologies</p>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                                    Level: Platinum
                                </div>
                            </div>
                            <div className={`text-center p-6 rounded-xl ${isDark ? 'bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20' : 'bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200'}`}>
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Trophy className="w-8 h-8 text-green-500" />
                                </div>
                                <h4 className={`text-lg font-bold ${textPrimary} mb-2`}>Student Mentor</h4>
                                <p className={`text-sm ${textSecondary} mb-3`}>Mentored 50+ students to success</p>
                                <div className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                                    Level: Diamond
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Quick Actions */}
                <div className={`${premiumCard} animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1400`}>
                    <div className={`${glassHeader} px-6 py-4 border-b`}>
                        <h3 className={`font-bold text-lg ${textPrimary} flex items-center gap-2`}>
                            <Zap className="w-5 h-5" />
                            Professional Quick Actions
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { icon: Brain, label: 'AI Assistant', color: 'text-purple-500', bg: 'bg-purple-500/10', badge: 'NEW' },
                                { icon: BookOpen, label: 'Course Library', color: 'text-blue-500', bg: 'bg-blue-500/10', badge: null },
                                { icon: MessageSquare, label: 'Student Forum', color: 'text-green-500', bg: 'bg-green-500/10', badge: '12' },
                                { icon: TargetIcon, label: 'Goal Tracker', color: 'text-orange-500', bg: 'bg-orange-500/10', badge: null },
                                { icon: Shield, label: 'Security', color: 'text-red-500', bg: 'bg-red-500/10', badge: null },
                                { icon: BarChart3, label: 'Analytics', color: 'text-indigo-500', bg: 'bg-indigo-500/10', badge: null },
                                { icon: Heart, label: 'Wellness', color: 'text-pink-500', bg: 'bg-pink-500/10', badge: null },
                                { icon: Eye, label: 'Insights', color: 'text-cyan-500', bg: 'bg-cyan-500/10', badge: 'PRO' }
                            ].map((action, index) => (
                                <button
                                    key={index}
                                    className={`relative p-4 rounded-xl flex flex-col items-center space-y-3 transition-all duration-200 hover:scale-[1.05] ${
                                        isDark 
                                            ? 'bg-white/[0.05] hover:bg-white/[0.08]' 
                                            : 'bg-gray-50 hover:bg-gray-100'
                                    }`}
                                    style={{ animationDelay: `${1400 + index * 100}ms` }}
                                >
                                    {action.badge && (
                                        <span className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-bold ${
                                            action.badge === 'NEW' ? 'bg-green-500 text-white' :
                                            action.badge === 'PRO' ? 'bg-purple-500 text-white' :
                                            'bg-red-500 text-white'
                                        }`}>
                                            {action.badge}
                                        </span>
                                    )}
                                    <div className={`p-3 rounded-lg ${action.bg}`}>
                                        <action.icon className={`w-6 h-6 ${action.color}`} />
                                    </div>
                                    <span className={`text-sm font-medium ${textPrimary}`}>{action.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Recent Notifications */}
                    <div className={`${premiumCard} animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1100`}>
                        <div className={`${glassHeader} px-6 py-4 border-b flex items-center justify-between`}>
                            <h3 className={`font-bold text-lg ${textPrimary} flex items-center gap-2`}>
                                <Bell className="w-5 h-5" />
                                Recent Notifications
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            </h3>
                            <button className={`text-sm ${textSecondary} hover:${textPrimary} transition-colors`}>
                                Mark all read
                            </button>
                        </div>
                        <div className="p-6">
                            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>All caught up! No new notifications.</p>
                            </div>
                        </div>
                    </div>

                    {/* Announcements */}
                    <div className={`${premiumCard} animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-1200`}>
                        <div className={`${glassHeader} px-6 py-4 border-b flex items-center justify-between`}>
                            <h3 className={`font-bold text-lg ${textPrimary} flex items-center gap-2`}>
                                <Star className="w-5 h-5" />
                                Latest Announcements
                            </h3>
                            <button className={`text-sm ${textSecondary} hover:${textPrimary} transition-colors`}>
                                View all
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            {[
                                { id: '9981', title: 'Kalagoonj 2026 Invitation', date: '23-Jan', type: 'event' },
                                { id: '9980', title: 'B.A. Sem-6 Practical Exam', date: '22-Jan', type: 'exam' },
                                { id: '9979', title: 'Staff Meeting Notice', date: '21-Jan', type: 'meeting' }
                            ].map((item, index) => (
                                <div key={item.id} className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-200 hover:scale-[1.01] ${
                                    isDark ? 'bg-white/[0.05] hover:bg-white/[0.08]' : 'bg-gray-50 hover:bg-gray-100'
                                }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                        item.type === 'event' ? 'bg-blue-500/20 text-blue-500' :
                                        item.type === 'exam' ? 'bg-red-500/20 text-red-500' :
                                        'bg-green-500/20 text-green-500'
                                    }`}>
                                        {item.id.slice(-2)}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${textPrimary}`}>{item.title}</p>
                                        <p className={`text-xs ${textMuted}`}>{item.date}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;