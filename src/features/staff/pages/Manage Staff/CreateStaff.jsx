import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    UserPlus,
    Save,
    Loader2,
    Users,
    Mail,
    Phone,
    Briefcase,
    GraduationCap,
    ArrowLeft,
} from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import api from "../../../../config/api";

const CreateStaff = () => {
    const themeMode = useSelector((state) => state.color.mode);
    const isDark = themeMode === "dark";
    const navigate = useNavigate();

    // --- STATE ---
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        designation: "",
        employmentCategory: "",
    });

    const [submitting, setSubmitting] = useState(false);

    // Designation options
    const designationOptions = [
        { value: "PRINCIPAL", label: "Principal" },
        { value: "VICE_PRINCIPAL", label: "Vice Principal" },
        { value: "HEAD_MASTER", label: "Head Master" },
        { value: "TEACHER", label: "Teacher" },
        { value: "ADMIN", label: "Admin" },
        { value: "ACCOUNTANT", label: "Accountant" },
        { value: "LIBRARIAN", label: "Librarian" },
        { value: "LAB_ASSISTANT", label: "Lab Assistant" },
        { value: "OFFICE_STAFF", label: "Office Staff" },
        { value: "SECURITY", label: "Security" },
        { value: "CLEANING_STAFF", label: "Cleaning Staff" },
    ];

    // Employment category options
    const employmentCategories = [
        { value: "TEACHING", label: "Teaching" },
        { value: "NON_TEACHING", label: "Non-Teaching" },
        { value: "ADMINISTRATIVE", label: "Administrative" },
        { value: "SUPPORT", label: "Support Staff" },
        { value: "CONTRACT", label: "Contract" },
    ];

    // --- FORM HANDLERS ---
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.designation || !formData.employmentCategory) {
            toast.error("Please fill in all required fields");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        // Phone validation
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.phone)) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                designation: formData.designation,
                employmentCategory: formData.employmentCategory,
            };

            await api.post("/api/staff/create-staff", payload);
            toast.success("Staff member created successfully!");

            // Reset form
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                phone: "",
                designation: "",
                employmentCategory: "",
            });

            // Navigate back to staff list after successful creation
            navigate("/staff/managestaff/displaystaff2");

        } catch (error) {
            console.error("Create staff error:", error);
            toast.error("Failed to create staff member");
        } finally {
            setSubmitting(false);
        }
    };

    // --- STYLES ---
    const cardClass = `rounded-2xl shadow-sm border transition-all ${isDark ? "bg-[#1A1A1A] border-white/5" : "bg-white border-gray-100"
        }`;

    const inputClass = `w-full px-4 py-3 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${isDark
        ? "bg-[#1A1A1A] border-white/10 text-gray-200 focus:bg-[#242424]"
        : "bg-gray-50 border-gray-200 text-gray-800 focus:bg-white"
        }`;

    const labelClass = `block text-xs font-bold uppercase tracking-wide mb-2 ${isDark ? "text-gray-400" : "text-gray-700"
        }`;

    return (
        <div className="font-sans pb-10">
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: isDark ? "#333" : "#fff",
                        color: isDark ? "#fff" : "#333",
                    },
                }}
            />

            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm mb-6">
                <button
                    onClick={() => navigate("/staff/managestaff/displaystaff2")}
                    className={`flex items-center gap-1 transition-colors ${isDark
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-500 hover:text-gray-800"
                        }`}
                >
                    <ArrowLeft size={16} />
                    Staff
                </button>
                <span className={isDark ? "text-gray-600" : "text-gray-400"}>/</span>
                <button
                    onClick={() => navigate("/staff/managestaff/displaystaff")}
                    className={`transition-colors ${isDark
                        ? "text-gray-400 hover:text-white"
                        : "text-gray-500 hover:text-gray-800"
                        }`}
                >
                    Manage Staff
                </button>
                <span className={isDark ? "text-gray-600" : "text-gray-400"}>/</span>
                <span className={isDark ? "text-gray-200" : "text-gray-700"}>Create Staff</span>
            </div>

            {/* Header */}
            <div className="w-full mb-8">
                {/* Form Container */}
                <div className="mx-auto">
                    <div className={cardClass}>
                        <h1 className={`text-3xl font-bold flex items-center gap-3 ${isDark ? "text-white" : "text-gray-800"}`}>
                            <div className={`p-3 rounded-xl ${isDark ? "bg-primary/20" : "bg-primary/10"}`}>
                                <UserPlus className="text-primary" size={28} />
                            </div>
                            Create New Staff Member
                        </h1>
                        <p className={`text-lg ${isDark ? "text-gray-400" : "text-gray-600"} mt-3`}>
                            Add a new staff member to the system with their personal and professional information.
                        </p>
                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* Personal Information */}
                            <div>
                                <h2 className={`text-xl font-semibold mb-6 flex items-center gap-3 ${isDark ? "text-gray-200" : "text-gray-800"
                                    }`}>
                                    <div className={`p-2 rounded-lg ${isDark ? "bg-primary/20" : "bg-primary/10"}`}>
                                        <GraduationCap className="text-primary" size={20} />
                                    </div>
                                    Personal Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>
                                            First Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange("firstName", e.target.value)}
                                            placeholder="e.g., Arjun"
                                            className={inputClass}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Last Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                                            placeholder="e.g., Reddy"
                                            className={inputClass}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h2 className={`text-xl font-semibold mb-6 flex items-center gap-3 ${isDark ? "text-gray-200" : "text-gray-800"
                                    }`}>
                                    <div className={`p-2 rounded-lg ${isDark ? "bg-primary/20" : "bg-primary/10"}`}>
                                        <Mail className="text-primary" size={20} />
                                    </div>
                                    Contact Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                            placeholder="e.g., arjun.reddy@example.com"
                                            className={inputClass}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Phone Number <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange("phone", e.target.value)}
                                            placeholder="e.g., 9765432108"
                                            className={inputClass}
                                            maxLength={10}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Professional Information */}
                            <div>
                                <h2 className={`text-xl font-semibold mb-6 flex items-center gap-3 ${isDark ? "text-gray-200" : "text-gray-800"
                                    }`}>
                                    <div className={`p-2 rounded-lg ${isDark ? "bg-primary/20" : "bg-primary/10"}`}>
                                        <Briefcase className="text-primary" size={20} />
                                    </div>
                                    Professional Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={labelClass}>
                                            Designation <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.designation}
                                            onChange={(e) => handleInputChange("designation", e.target.value)}
                                            className={inputClass}
                                            required
                                        >
                                            <option value="">Select Designation</option>
                                            {designationOptions.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelClass}>
                                            Employment Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.employmentCategory}
                                            onChange={(e) => handleInputChange("employmentCategory", e.target.value)}
                                            className={inputClass}
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {employmentCategories.map((category) => (
                                                <option key={category.value} value={category.value}>
                                                    {category.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => navigate("/staff/managestaff/displaystaff2")}
                                    className={`px-6 py-3 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${isDark
                                        ? "bg-white/5 text-gray-400 hover:bg-white/10"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                        }`}
                                >
                                    <ArrowLeft size={16} />
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-8 py-3 rounded-lg text-sm font-bold text-white bg-primary hover:brightness-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            Creating Staff...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Create Staff Member
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateStaff;