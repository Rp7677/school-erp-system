import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  User,
  Users,
  FileText,
  ChevronRight,
  ChevronLeft,
  Save,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import api from "../../../../config/api";

const StudentEnquiry = () => {
  const themeMode = useSelector((state) => state.color.mode);
  const isDark = themeMode === "dark";
  const { selectedCampus, campuses, superAdmin } = useSelector((state) => state.campus);

  const isSuperAdmin = superAdmin;
  console.log(isSuperAdmin);

  const navigate = useNavigate();

  const [preResultType, setPreResultType] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    middleName: "",
    lastName: "",
    dob: "",
    studentFullAddress: "",

    gradeApplyingfor: "",
    gender: "",
    admissionType: "",
    year: null,
    medium: null,
    board: null,
    streamApplyingFor: null,

    previousSchoolAvailable: null,
    previousSchoolName: "",
    passedClass: "",
    preBoard: "",
    preStream: "",
    preMedium: "",
    yearOfPassing: "",
    preResult: "",


    parentName: "",
    address: "",
    email: "",
    phone: "",
    relationship: "",

    city: "",
    area: "",

    anySibling: null,
    siblingName: "",
    siblingGrade: "",

    hostelRequired: null,
    transportRequired: null,
    heardFrom: "",
  });

  //temparary campusid
  const [tempCampusId, setTempCampusId] = useState("");
  //Get Branch Id
  const [getSelectedBranch, setSelectedBranch] = useState("");
  //Get Branch
  const [getBranch, setBranch] = useState([]);
  //Get Stream
  const [streams, setStreams] = useState([]);
  //Get Acedemic Year
  const [acedemicYear, setAcedemicYear] = useState([]);
  //Get Grades
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    if (isSuperAdmin && campuses.length > 0 && !tempCampusId) {
      setTempCampusId(campuses[0].campusId || campuses[0].id);
    }
  }, [campuses, isSuperAdmin]);

  const steps = [
    {
      id: 0,
      title: "Student",
      icon: <User size={20} />,
      description: "Personal Details",
    },
    {
      id: 2,
      title: "Academic",
      icon: <Users size={20} />,
      description: "Contact Info",
    },
    {
      id: 3,
      title: "Guardian",
      icon: <Users size={20} />,
      description: "Contact Info",
    },
    {
      id: 4,
      title: "General",
      icon: <FileText size={20} />,
      description: "Document Upload",
    },
  ];

  // Calculate Progress
  const progress = ((activeStep + 1) / steps.length) * 100;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let newValue = value;

    // convert to number for year
    if (name === "admissionType" || name === "year" || name === "medium" || name === "board" || name === "gradeApplyingfor" || name === "streamApplyingFor") {
      newValue = value ? Number(value) : null;
    }

    if (
      name === "previousSchoolAvailable" ||
      name === "anySibling" ||
      name === "hostelRequired" ||
      name === "transportRequired"
    ) {
      newValue = value === "true";
    }

    if (name === "previousSchoolAvailable" && newValue === false) {
      setFormData(prev => ({
        ...prev,
        previousSchoolAvailable: null,
        previousSchoolName: "",
        passedClass: "",
        yearOfPassing: "",
        preResult: "",
        preBoard: "",
        preMedium: "",
        preStream: ""
      }));
      return;
    }

    // Handle mutual exclusivity between transport and hostel
    if (name === "transportRequired" && newValue === true) {
      // If transport is set to true, set hostel to false
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
        hostelRequired: false
      }));
      return;
    }

    if (name === "hostelRequired" && newValue === true) {
      // If hostel is set to true, set transport to false
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
        transportRequired: false
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue
    }));
  };


  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [fieldName]: file }));
      toast.success(`${fieldName.replace(/([A-Z])/g, " $1")} uploaded!`, {
        style: {
          borderRadius: "10px",
          background: isDark ? "#333" : "#fff",
          color: isDark ? "#fff" : "#333",
        },
      });
    }
  };

  const removeFile = (fieldName) => {
    setFormData((prev) => ({ ...prev, [fieldName]: null }));
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) setActiveStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  const campusIdToUse = isSuperAdmin
    ? tempCampusId
    : selectedCampus;

  console.log("Final campusId to use:", campusIdToUse);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!campusIdToUse) {
      toast.error("Please select a campus");
      return;
    }

    console.log('Form Data Being Submitted:', formData);

    const {
      boardName,
      mediumName,
      ...cleanFormData
    } = formData;

    const payload = {
      ...cleanFormData,
      campusId: campusIdToUse
    };

    console.log("Payload:", payload);
    console.log(typeof payload.hostelRequired);
    console.log(typeof payload.transportRequired);

    try {
      toast.promise(
        api.post('/api/enquiry', payload),
        {
          loading: "Processing Application...",
          success: (response) => {
            console.log('Application submitted successfully:', response.data);
            toast.success("Submitted Successfully");
            // Reset form after successful submission
            setFormData({
              name: "",
              middleName: "",
              lastName: "",
              dob: "",
              studentFullAddress: "",

              gradeApplyingfor: "",
              gender: "",
              admissionType: "",
              year: null,
              medium: null,
              board: null,
              streamApplyingFor: null,

              previousSchoolAvailable: "",
              previousSchoolName: "",
              passedClass: "",
              preBoard: "",
              preStream: "",
              preMedium: "",
              yearOfPassing: "",
              preResult: "",


              parentName: "",
              address: "",
              email: "",
              phone: "",
              relationship: "",

              city: "",
              area: "",

              anySibling: null,
              siblingName: "",
              siblingGrade: "",

              hostelRequired: null,
              transportRequired: null,
              heardFrom: "",
            });
            navigate('/staff/admission/student-enquiry-details'); // Navigate to inquiry panel
            return "Admission Form Submitted Successfully!";
          },
          error: (error) => {
            console.error('Submission failed:', error);
            const errorMessage = error.response?.data?.message || "Submission Failed. Please try again.";
            return errorMessage;
          },
        }
      );
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  // --- STYLES ---
  const cardClass = `rounded-3xl shadow-xl border transition-all duration-500 ${isDark
    ? "bg-[#1A1A1A] border-white/5 shadow-black/40"
    : "bg-white border-gray-100 shadow-gray-200/50"
    }`;

  const inputClass = `w-full px-4 py-3 border rounded-xl text-sm transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary ${isDark
    ? "bg-[#242424] border-white/5 text-gray-200"
    : "bg-gray-50 border-gray-200 text-gray-800"
    }`;

  const labelClass = `block text-[11px] font-black uppercase tracking-widest mb-2 ${isDark ? "text-gray-500" : "text-gray-500"
    }`;

  console.log("Final campusId to use:", campusIdToUse);

  // const fetchBranch = async () => {
  //   try {
  //     console.log("Fetching branches for campus:", campusIdToUse);
  //     const responseBranch = await api.get(`/api/branches/campus/${campusIdToUse}`);
  //     setBranch(responseBranch.data);
  //     console.log("Branch Response", responseBranch.data);
  //   } catch (error) {
  //     console.error("Branch fetch error:", error);
  //     console.error("Error details:", error.response?.status, error.message);

  //     // Show user-friendly error message
  //     if (error.response?.status === 404) {
  //       toast.error("Campus not found. Please check campus selection.");
  //     } else if (error.response?.status === 500) {
  //       toast.error("Server error. Please try again later.");
  //     } else if (error.code === "ERR_CONNECTION_CLOSED" || error.code === "ERR_CONNECTION_REFUSED") {
  //       toast.error("Cannot connect to server. Please check if backend is running.");
  //     } else {
  //       toast.error("Failed to fetch branches. Please try again.");
  //     }

  //     // Clear branches on error
  //     setBranch([]);
  //   }
  // }

  // Fetching Grade based on selected branch

  const fetchBranch = async () => {
    try {
      if (!campusIdToUse) return;

      console.log("Fetching branches for campus:", campusIdToUse);

      const responseBranch = await api.get(
        `/api/branches/campus/${campusIdToUse}`
      );

      setBranch(responseBranch.data);
    } catch (error) {
      console.error("Branch fetch error:", error);
      setBranch([]);
    }
  };

  const [admissionType, setAdmissionType] = useState([]);
  // http://localhost:8080/api/admission-types
  const fetchAdmissionType = async () => {
    try {
      const response = await api.get('api/admission-types');
      setAdmissionType(response.data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  const fetchGrade = async () => {
    try {
      if (getSelectedBranch) {
        // http://localhost:8080/api/branches/4/grades
        const responseGrade = await api.get(`/api/branches/${getSelectedBranch}/grades`);
        setGrades(responseGrade.data);
        console.log("Grades According to branch", responseGrade.data);
      } else {
        setGrades([]);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // Feching Year
  const fetchAcedemicYear = async () => {
    try {
      const responseYear = await api.get("/api/academic-years/get-all-academic-year");
      setAcedemicYear(responseYear.data);
      console.log(responseYear.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    if (formData.gradeApplyingfor) {
      console.log("Calling API with:", formData.gradeApplyingfor);
      // http://localhost:8080/api/branch-grades/{branch-grade-Id}/streams
      api.get(`/api/branch-grades/${formData.gradeApplyingfor}/streams`)
        .then(res => {
          console.log("FULL RESPONSE:", res.data);

          const streamData = Array.isArray(res.data)
            ? res.data
            : res.data.streams || [];

          console.log("FINAL STREAM DATA:", streamData);

          setStreams(streamData);
        })
        .catch((err) => {
          console.error("STREAM ERROR:", err);
          setStreams([]);
        });
    }
  }, [formData.gradeApplyingfor]);


  useEffect(() => {
    if (getSelectedBranch) {
      fetchGrade();
    }
  }, [getSelectedBranch]);


  useEffect(() => {
    fetchAcedemicYear();
    fetchAdmissionType();
  }, []);

  useEffect(() => {
    if (campusIdToUse) {
      fetchBranch();
    }
  }, [campusIdToUse]);


  const handleStepClick = (index) => {
    setActiveStep(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 pt-8 font-sans">
      <Toaster position="top-center" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase">
              Admissions 2026-27
            </span>
          </div>
          <h1
            className={`text-4xl font-black tracking-tight ${isDark ? "text-white" : "text-gray-900"
              }`}
          >
            Student <span className="text-primary">Enquiry</span>
          </h1>
          <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Please fill in the details accurately to process the application.
          </p>
        </div>

        <div className="hidden md:block text-right">
          <div
            className={`text-xs font-bold mb-2 ${isDark ? "text-gray-500" : "text-gray-400"
              }`}
          >
            Enquiry PROGRESS
          </div>
          <div
            className={`w-48 h-2 rounded-full overflow-hidden ${isDark ? "bg-white/5" : "bg-gray-100"
              }`}
          >
            <div
              className="h-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modern Step Indicator */}
      <div
        className={`${cardClass} p-2 mb-8 inline-flex w-full overflow-x-auto no-scrollbar`}
      >
        <div className="flex justify-between w-full min-w-[600px]">
          {steps.map((step, index) => {
            const isActive = activeStep === index;
            const isCompleted = activeStep > index;
            return (
              <div
                key={step.id}
                className={`flex-1 flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 
                    cursor-pointer hover:scale-[1.02] active:scale-[0.98]
                    ${isActive ? (isDark ? "bg-white/5" : "bg-gray-50") : ""}
                  `}
                onClick={() => handleStepClick(index)}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : isCompleted
                      ? "bg-green-500 text-white"
                      : isDark
                        ? "bg-[#242424] text-gray-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                >
                  {isCompleted ? <CheckCircle2 size={18} /> : step.icon}
                </div>
                <div className="text-left">
                  <p
                    className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? "text-primary" : "text-gray-500"
                      }`}
                  >
                    Step 0{index + 1}
                  </p>
                  <p
                    className={`text-sm font-bold whitespace-nowrap ${isActive
                      ? isDark
                        ? "text-white"
                        : "text-gray-900"
                      : "text-gray-500"
                      }`}
                  >
                    {step.title}
                  </p>
                </div>
                {index !== steps.length - 1 && (
                  <ChevronRight size={14} className="ml-auto text-gray-300" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Form Area */}
      <form onSubmit={handleSubmit}>
        <div className={`${cardClass} p-8 relative overflow-hidden`}>
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10">
            {activeStep === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-primary rounded-full"></div>
                  <h2
                    className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"
                      }`}
                  >
                    Student Details
                  </h2>

                  {isSuperAdmin &&
                    <select
                      value={tempCampusId}
                      onChange={(e) => setTempCampusId(e.target.value)}
                      className={`${inputClass} ${isDark ? "text-white" : "text-gray-800"}`}
                    >
                      <option value="">Select Campus</option>
                      {campuses.map(c => (
                        <option key={c.campusId} value={c.campusId}>{c.campusName}</option>
                      ))}
                    </select>
                  }
                </div>


                <div className="w-full">

                  <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Student First Name */}
                      <div>
                        <label className={labelClass}>
                          Student First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="First Name"
                        />
                      </div>
                      {/* Student Middle Name */}
                      <div>
                        <label className={labelClass}>
                          Student Middle Name  <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="Middle Name"
                        />
                      </div>
                      {/* Student Last Name */}
                      <div>
                        <label className={labelClass}>
                          Student Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="Last Name"
                        />
                      </div>

                    </div>
                    {/* DOB */}
                    <div>
                      <label className={labelClass}>Date of Birth <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleInputChange}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    {/* Gender */}
                    <div>
                      <label className={labelClass}>Gender <span className="text-red-500">*</span></label>
                      <div className="flex gap-2">
                        {["Male", "Female", "Other"].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, gender: g })
                            }
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${formData.gender === g
                              ? "bg-primary text-white shadow-lg shadow-primary/20"
                              : isDark
                                ? "bg-[#242424] text-gray-400"
                                : "bg-gray-100 text-gray-600"
                              }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>


                    {/*Heard From  */}
                    <div className="">
                      <label className={labelClass}>How did you hear about us? <span className="text-red-500">*</span></label>
                      <select
                        name="heardFrom"
                        value={formData.heardFrom}
                        onChange={handleInputChange}
                        className={inputClass}
                      >
                        <option value="">Select</option>
                        <option value="Website">Website</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Reference">Reference</option>
                        <option value="Walk In">Walk In</option>
                        <option value="Agent">Agent</option>
                        <option value="Advertisement">Advertisement</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    {/*  Sibling Details*/}
                    <div>
                      <label className={labelClass}>Any sibling in School? <span className="text-red-500">*</span></label>
                      <select
                        name="anySibling"
                        value={formData.anySibling}
                        onChange={handleInputChange}
                        className={inputClass}
                      >
                        <option value="">Select</option>
                        <option value={true}>Yes</option>
                        <option value={false}>No</option>
                      </select>
                    </div>
                    {formData.anySibling === true && (
                      <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>Sibling Name <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            name="siblingName"
                            value={formData.siblingName}
                            onChange={handleInputChange}
                            className={inputClass}
                            placeholder="Enter Sibling Name"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Sibling Grade Studing In <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            name="siblingGrade"
                            value={formData.siblingGrade}
                            onChange={handleInputChange}
                            className={inputClass}
                            placeholder="Enter Sibling Grade"
                          />
                        </div>
                      </div>
                    )}

                    {/* city */}
                    <div>
                      <label className={labelClass}>City <span className="text-red-500">*</span></label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={inputClass}
                      >
                        <option value="">Select City</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Bangalore">Bangalore</option>
                      </select>
                    </div>
                    {/* Area */}
                    <div>
                      <label className={labelClass}>Area <span className="text-red-500">*</span></label>
                      <select
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                        className={inputClass}
                      >
                        <option value="">Select Area</option>
                        <option value="Millenium">Millenium</option>
                        <option value="Adajan">Adajan</option>
                        <option value="Other">Other</option>
                      </select>
                      {formData.area === "Other" && (
                        <input
                          type="text"
                          name="area"
                          value={formData.area}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="Enter Area"
                        />
                      )}
                    </div>
                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className={labelClass}>
                        Students Full Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="studentFullAddress"
                        value={formData.studentFullAddress}
                        onChange={handleInputChange}
                        className={inputClass}
                        rows={4}
                        placeholder="Enter Student's Full Address"
                      />
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* --- Step 2 & 3 Simplified for Space --- */}
            {activeStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-primary rounded-full"></div>
                  <h2
                    className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"
                      }`}
                  >
                    Academic Records
                  </h2>
                </div>
                {/* Acedemc year and student type dropdown  */}
                <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/*Select Student Type Dropdown*/}
                  <div className="">
                    <label className={labelClass}>Select Student Type <span className="text-red-500">*</span></label>
                    <select
                      name="admissionType"
                      value={formData.admissionType}
                      onChange={handleInputChange}
                      className={inputClass}
                    >
                      <option value="">Select Student Type</option>
                      {admissionType.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/*Select Acedemic Dropdown*/}
                  <div className="">
                    <label className={labelClass}>Select Academic Year <span className="text-red-500">*</span></label>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      className={inputClass}
                    >
                      <option value="">Select Year</option>
                      {acedemicYear.map((acedemicYear) => (
                        <option key={acedemicYear.id} value={acedemicYear.id}>
                          {acedemicYear.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/*Branch Dropdown */}
                <div className="mb-4">
                  {/* Select Branch */}
                  <div>
                    <label className={labelClass}>Select Branch<span className="text-red-500">*</span></label>
                    <select
                      name="branchinfo"
                      value={getSelectedBranch}
                      onChange={(e) => {
                        const selectedId = Number(e.target.value);

                        const selectedBranchObj = getBranch.find(
                          (b) => b.id === selectedId
                        );

                        console.log("SELECTED BRANCH:", selectedBranchObj);

                        setSelectedBranch(selectedId);

                        setFormData((prev) => ({
                          ...prev,
                          board: selectedBranchObj?.boardId
                            ? Number(selectedBranchObj.boardId)
                            : null,
                          medium: selectedBranchObj?.mediumId
                            ? Number(selectedBranchObj.mediumId)
                            : null,

                          boardName: selectedBranchObj?.boardName || "",
                          mediumName: selectedBranchObj?.mediumName || "",

                          gradeApplyingfor: "",
                          streamApplyingFor: null
                        }));
                      }}
                      className={`${inputClass} + overflow-x-auto`}
                    >
                      <option value="">Select Branch</option>
                      {getBranch.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.campusName}  -  {branch.boardName}  -  {branch.mediumName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Board,medium,grade,year */}
                <div
                  className={`grid grid-cols-1
                    ${formData.gradeApplyingfor && streams.length > 0 ? "md:grid-cols-4" : "md:grid-cols-3"
                    } gap-6`}
                >
                  {/* Board */}
                  <div>
                    <label className={labelClass}>Board</label>
                    <input
                      type="text"
                      name="board"
                      value={formData.boardName}
                      className={inputClass}
                      readOnly
                      disabled={!getSelectedBranch}
                    />
                  </div>
                  {/* Medium */}
                  <div>
                    <label className={labelClass}>Medium</label>
                    <input
                      type="text"
                      name="medium"
                      value={formData.mediumName}
                      className={inputClass}
                      readOnly
                      disabled={!getSelectedBranch}
                    />
                  </div>
                  {/*Select Grade Dropdown*/}
                  <div>
                    <label className={labelClass}>Grade Applying For <span className="text-red-500">*</span></label>
                    <select
                      name="gradeApplyingfor"
                      value={formData.gradeApplyingfor}
                      onChange={handleInputChange}
                      className={inputClass}
                      disabled={!getSelectedBranch}
                    >
                      <option value="">Select Grade</option>
                      {grades.map((grade) => (
                        <option key={grade.id} value={grade.id}>
                          {grade.gradeName}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* Stream */}
                  {/* Stream → ONLY show when grade selected */}
                  {formData.gradeApplyingfor && streams.length > 0 && (
                    <div>
                      <label className={labelClass}>Stream</label>
                      <select
                        name="streamApplyingFor"
                        value={formData.streamApplyingFor}
                        onChange={handleInputChange}
                        className={inputClass}
                        disabled={!getSelectedBranch}
                      >
                        <option value="">Select Stream</option>
                        {streams.map((stream) => {
                          return (
                            <option key={stream.id} value={stream.id}>{stream.name}</option>
                          )
                        })}
                      </select>
                    </div>
                  )}
                </div>

                {/* Previous School Dropdown - Always Visible */}
                <div className="mb-6">
                  <label className={labelClass}>Previous School Records<span className="text-red-500">*</span></label>
                  <select
                    name="previousSchoolAvailable"
                    value={formData.previousSchoolAvailable || ""}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="">Select Option</option>
                    <option value={true}>Yes</option>
                    <option value={false}>No</option>
                  </select>
                </div>

                {/* Previous Academic Record Fields - Only Visible if "Yes" */}
                {formData.previousSchoolAvailable === true && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      {/* Previous School Name */}
                      <div>
                        <label className={labelClass}>Previous School Name</label>
                        <input
                          type="text"
                          name="previousSchoolName"
                          value={formData.previousSchoolName}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="Enter Previous School Name"
                        />
                      </div>
                      {/* Class Last Studied */}
                      <div>
                        <label className={labelClass}>Class Last Studied</label>
                        <input
                          type="text"
                          name="passedClass"
                          value={formData.passedClass}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="Enter Class"
                        />
                      </div>
                      {/* Year of Passing */}
                      <div>
                        <label className={labelClass}>Year of Passing</label>
                        <select
                          name="yearOfPassing"
                          value={formData.yearOfPassing}
                          onChange={handleInputChange}
                          className={inputClass}
                        >
                          <option value="">Select Year</option>
                          {Array.from({ length: 20 }, (_, i) => {
                            const year = new Date().getFullYear() - i;
                            return (
                              <option key={year} value={year.toString()}>
                                {year}
                              </option>
                            );
                          })}
                        </select>

                      </div>
                    </div>
                    {/* Select Percdentage or Grade Dropdown */}
                    <div className="md:col-span-3 mb-6">
                      <label className={labelClass}>Percentage / Grade</label>
                      <div className="flex gap-3 w-full">
                        <select
                          name="preResultType"
                          value={preResultType}
                          onChange={(e) => {
                            setPreResultType(e.target.value);

                            setFormData(prev => ({
                              ...prev,
                              preResult: ""
                            }));
                          }}
                          className={`${inputClass} w-1/2`}
                        >
                          <option value="">Select</option>
                          <option value="percentage">Percentage</option>
                          <option value="grade">Grade</option>
                        </select>

                        {preResultType && (
                          <input
                            type={preResultType === "percentage" ? "number" : "text"}
                            name="preResult"
                            value={formData.preResult}
                            onChange={handleInputChange}
                            className={`${inputClass} w-1/2`}
                            placeholder={
                              preResultType === "percentage"
                                ? "Enter Percentage"
                                : "Enter Grade"
                            }
                          />
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Board */}
                      <div>
                        <label className={labelClass}>Board</label>
                        <input
                          type="text"
                          name="preBoard"
                          value={formData.preBoard}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="Enter Board Name"
                        />
                      </div>
                      {/* Medium */}
                      <div>
                        <label className={labelClass}>Medium</label>
                        <input
                          type="text"
                          name="preMedium"
                          value={formData.preMedium}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="Enter Medium Name"
                        />
                      </div>
                      {/* Stream */}
                      <div>
                        <label className={labelClass}>Stream</label>
                        <select
                          name="preStream"
                          value={formData.preStream}
                          onChange={handleInputChange}
                          className={inputClass}
                        >
                          <option value="">Select Stream</option>
                          <option value="Science">Science</option>
                          <option value="Commerce">Commerce</option>
                          <option value="Arts">Arts</option>
                        </select>
                      </div>

                      {/* <input
                        type="text"
                        name="preResult"
                        value={formData.preResult}
                        onChange={handleInputChange}
                        className={`${inputClass} w-1/2`}
                        placeholder="Enter Percentage/Grade"
                      /> */}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-primary rounded-full"></div>
                  <h2
                    className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"
                      }`}
                  >
                    Parent / Guardian Details
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className={labelClass}>Parent/Guardian Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="parentName"
                        value={formData.parentName}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Parent/Guardian Full Name"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Relationship <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        name="relationship"
                        value={formData.relationship}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="e.g. Father, Mother, Guardian"
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <label className={labelClass}>Mobile Number (OTP Verified) <span className="text-red-500">*</span></label>
                      <div className="flex gap-2">
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="Enter Mobile Number"
                        />
                        <button
                          type="button"
                          className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs hover:brightness-110 transition-all"
                          onClick={() => {/* TODO: Implement OTP send logic */ }}
                        >
                          Generate OTP
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Email ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Email ID"
                      />
                    </div>
                  </div>
                  {/* Address */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Full Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={inputClass}
                      rows={4}
                      placeholder="Enter Full Residential Address"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-primary rounded-full"></div>
                  <h2
                    className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}
                  >
                    Transport or Hostel Details
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">


                  <div>
                    <label className={labelClass}>Transportation Required? <span className="text-red-500">*</span></label>
                    <select
                      name="transportRequired"
                      value={formData.transportRequired}
                      onChange={handleInputChange}
                      className={inputClass}
                    >
                      <option value="">Select</option>
                      <option value={true}>Yes</option>
                      <option value={false}>No</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Hostel Required? <span className="text-red-500">*</span></label>
                    <select
                      name="hostelRequired"
                      value={formData.hostelRequired}
                      onChange={handleInputChange}
                      className={inputClass}
                    >
                      <option value="">Select</option>
                      <option value={true}>Yes</option>
                      <option value={false}>No</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Improved Navigation */}
        <div className="mt-10 flex justify-between items-center">
          <button
            type="button"
            onClick={handleBack}
            className={`group px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center gap-3 transition-all ${activeStep === 0
              ? "opacity-0 pointer-events-none"
              : isDark
                ? "text-gray-400 hover:text-white"
                : "text-gray-500 hover:text-gray-900"
              }`}
          >
            <ChevronLeft
              size={18}
              className="group-hover:-translate-x-1 transition-transform"
            />{" "}
            Back
          </button>

          {activeStep === steps.length - 1 ? (
            <button
              type="submit"
              className="px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-green-600 hover:bg-green-500 text-white shadow-xl shadow-green-500/20 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
            >
              Complete Registration <Save size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); handleNext(); }}
              className="px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-primary hover:brightness-110 text-white shadow-xl shadow-primary/30 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
            >
              Next Step <ArrowRight size={18} />
            </button>
          )}
        </div>
      </form >
    </div >
  );
};

export default StudentEnquiry;

