import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  User,
  Users,
  GraduationCap,
  FileText,
  Upload,
  ChevronRight,
  ChevronLeft,
  Save,
  CheckCircle2,
  Calendar,
  MapPin,
  Camera,
  X,
  Info,
  ArrowRight,
  Bus,
  HeartPulse,
  Home,
  PenLine,
  Eye,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import api from "../../../../config/api";
import AutoBreadcrumb from "../../../../components/common/AutoBreadcrumb";
import { useNavigate } from "react-router-dom";

const StudentAdmission = () => {


  const location = useLocation();
  const navigate = useNavigate();

  // Fetch Admission data from Counselor
  const editData = location.state?.admissionData;
  const isEdit = location.state?.isEdit;

  const themeMode = useSelector((state) => state.color.mode);
  const isDark = themeMode === "dark";

  const [inquiryLoaded, setInquiryLoaded] = useState(false);

  const { selectedCampus, campuses, superAdmin } = useSelector((state) => state.campus);
  const isSuperAdmin = superAdmin;
  console.log(isSuperAdmin);


  const [preResultType, setPreResultType] = useState("");
  const [activeStep, setActiveStep] = useState(0);


  //temparary campusid
  const [tempCampusId, setTempCampusId] = useState("");
  //Get Branch Id
  const [getSelectedBranch, setSelectedBranch] = useState("");
  //Get Branch
  const [getBranch, setBranch] = useState([]);
  //Get Stream
  const [streams, setStreams] = useState([]);
  //Get Academic Year
  const [academicYear, setAcademicYear] = useState([]);
  //Get Grades
  const [grades, setGrades] = useState([]);
  //Get Admission Type
  const [admissionType, setAdmissionType] = useState([]);
  //Fees Category
  const [feeCategory, setFeeCategory] = useState([]);
  // Fetch branch grades documents
  const [getBranchDocuments, setBranchDocuments] = useState([]);
  const [files, setFiles] = useState({});
  const [existingDocs, setExistingDocs] = useState([]);
  const [formData, setFormData] = useState({

    boardName: "",   // ✅ add this — for display only
    mediumName: "",  // ✅ add this — for display only

    // Enquiry link
    enquiryId: null,
    // admissionNumber: "",

    // Student Details
    studentName: "",
    studentMiddleName: "",
    studentLastName: "",
    dob: "",
    gender: "",
    nationality: "",
    religion: "",
    casteCategory: "",
    // subcaste: "",
    aadharNumber: "",
    // motherTongue: "",
    motherToungue: "",
    feeStructureTypeId: null,
    academicYear: "",
    studentType: "",
    anySibling: false,
    siblingName: "",
    siblingGrade: "",
    gradeApplyingfor: "",
    streamApplyingFor: "", // only for 11th/12th
    medium: "",
    board: "",
    bloodGroup: "",
    imageUrl: null, // generally set by backend upload

    // Last School Details
    lastSchool: "",
    lastClass: "",
    year: "",
    lastGrade: "",
    lastBoard: "",
    gradeApplied: "",
    lastMedium: "",
    lastStream: "",

    // Parent Details
    fatherName: "",
    fatherQualification: "",
    fatherOccupation: "",
    fatherorganizationName: "",
    fatherannualIncome: "",
    fatherAadhar: "",
    fatherMobile: "",
    fatherEmail: "",

    motherName: "",
    motherQualification: "",
    motherOccupation: "",
    motherorganizationName: "",
    motherannualIncome: "",
    motherAadhar: "",
    motherMobile: "",
    motherEmail: "",

    // Guardian Details (optional)
    guardianName: "",
    guardianQualification: "",
    guardianOccupation: "",
    guardianOrganizationName: "",
    guardianAnnualIncome: "",
    guardianAadhar: "",
    guardianMobile: "",
    guardianEmail: "",

    // Address Details
    address: "",
    city: "",
    area: "",
    state: "",
    pincode: "", // Backend field mapping
    permanentAddress: "",

    // Medical Details
    allergies: "",
    medicalConditions: "",
    specialNeeds: "",
    doctorName: "",
    doctorContact: "",

    // Transport Details
    transportRequired: false,
    pickupLocation: "",
    routeName: "",
    distanceFromSchool: "",

    // Hostel Details
    hostelRequired: false,
    localGuardianName: "",
    localGuardianContact: "",
    localGuardianAddress: "",

    // Declaration
    digitalSignatire: "", // Note: typo in backend DTO
    declarationDate: "",

    // Payment / system
    amount: null,
    createdBy: "",
  });


  let campusIdToUse;

  if (!isSuperAdmin) {
    campusIdToUse = selectedCampus;
    console.log("campusIdToUse (normal user)", campusIdToUse);
  } else {
    if (campuses.length === 1) {
      campusIdToUse = campuses[0].id || campuses[0].campusId;
    } else if (campuses.length > 1) {
      campusIdToUse = tempCampusId || selectedCampus;
      // ✅ No return here — let the page render normally
    }
    console.log("campusIdToUse (super admin)", campusIdToUse);
  }
  //Fetch Fees Category
  const fetchFeesCategory = async () => {
    try {
      if (!campusIdToUse) {
        console.log("Campus ID not available yet for fetching fee categories");
        return;
      }
      console.log(`Fetching fee categories for campus_id: ${campusIdToUse}`);

      const response = await api.get(`api/fees/structure-types?campus_id=${campusIdToUse}`);
      console.log("Fee categories response data:", response.data);
      setFeeCategory(response.data);
    } catch (error) {
      console.error("Error fetching fee categories:", error)
    }
  }

  useEffect(() => {
    fetchFeesCategory();
  }, [campusIdToUse])

  //Fetch Branch 
  const fetchBranch = async () => {
    try {
      const responseBranch = await api.get(`/api/branches/campus/${campusIdToUse}`);
      console.log("Raw branch response:", responseBranch.data);

      // Fetch grades for each branch to populate grades data
      const branchesWithGrades = await Promise.all(
        responseBranch.data.map(async (branch) => {
          try {
            const gradesResponse = await api.get(`/api/branches/${branch.id}/grades`);
            return {
              ...branch,
              grades: gradesResponse.data || []
            };
          } catch (error) {
            console.error(`Error fetching grades for branch ${branch.id}:`, error);
            return {
              ...branch,
              grades: []
            };
          }
        })
      );

      console.log("Branches with grades populated:", branchesWithGrades);
      setBranch(branchesWithGrades);
    } catch (error) {
      console.log(error);
    }
  }


  // Fetching Grade based on selected branch
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
  const fetchAcademicYear = async () => {
    try {
      const responseYear = await api.get("/api/academic-years/get-all-academic-year");
      setAcademicYear(responseYear.data);
      console.log(responseYear.data);
    } catch (error) {
      console.log(error);
    }
  }

  // fetch Admission Type
  const fetchAdmissionType = async () => {
    try {
      const response = await api.get('api/admission-types');
      setAdmissionType(response.data);
      console.log(response.data);

    } catch (error) {
      console.error(error);
    }
  }


  useEffect(() => {
    fetchAdmissionType();
  }, [])

  // Get grades according to branch
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
    fetchAcademicYear();
    if (campusIdToUse) {
      fetchBranch();
    }
  }, [campusIdToUse]);

  // Update campus data when tempCampusId changes (for super admin)
  useEffect(() => {
    if (tempCampusId && isSuperAdmin) {
      fetchAcademicYear();
      fetchBranch();
    }
  }, [tempCampusId]);


  useEffect(() => {
    if (getSelectedBranch) {
      fetchGrade();
    }
  }, [getSelectedBranch]);

  // Fetch grades for inquiry data if no branch is selected but campus is available
  useEffect(() => {
    if (location.state?.fromInquiry && campusIdToUse && !getSelectedBranch && grades.length === 0) {
      console.log("Fetching grades for inquiry data - campusId:", campusIdToUse);
      // First fetch branches for the campus, then get grades from first branch
      api.get(`/api/branches/campus/${campusIdToUse}`)
        .then(branchResponse => {
          console.log("Branches fetched:", branchResponse.data);
          if (branchResponse.data && branchResponse.data.length > 0) {
            // Get grades from the first branch
            const firstBranch = branchResponse.data[0];
            return api.get(`/api/branches/${firstBranch.id}/grades`);
          }
          throw new Error("No branches found for this campus");
        })
        .then(gradesResponse => {
          console.log("Grades fetched for inquiry:", gradesResponse.data);
          setGrades(gradesResponse.data);
        })
        .catch(error => {
          console.error("Error fetching grades for inquiry:", error);
        });
    }
  }, [location.state?.fromInquiry, campusIdToUse, getSelectedBranch, grades.length]);



  // Edit Student Details
  useEffect(() => {
    if (!editData) return;

    console.log("EDIT DATA RECEIVED:", editData);
    // Edit Student Data
    setFormData(prev => ({
      ...prev,
      enquiryId: editData.id || null,
      id: editData.id || null,
      studentName: editData.studentName || "",
      studentMiddleName: editData.studentMiddleName || "",
      studentLastName: editData.studentLastName || "",

      dob: editData.dob || "",
      gender: editData.gender
        ? editData.gender.charAt(0).toUpperCase() + editData.gender.slice(1).toLowerCase()
        : "",
      feeStructureTypeId: editData.feeStructureTypeId.id || null,
      studentType: editData.studentType?.id || "",
      anySibling: editData.anySibling || false,
      siblingName: editData.siblingName || "",
      siblingGrade: editData.siblingGrade || "",

      academicYear: editData.academicYearId?.id || null, // backend sends 'year'
      gradeApplyingfor: editData.gradeApplyingfor?.id || null,
      streamApplyingFor: editData.streamApplyingFor || null,
      branchinfo: editData.gradeApplyingfor?.branchId || null, // backend currently missing branchId

      medium: editData.medium?.id || null,
      board: editData.medium?.id || null,

      year: editData.yearOfPassing || "",

      lastBoard: editData.lastBoard || "",
      lastClass: editData.lastClass || "",
      lastGrade: editData.lastGrade || "",
      lastMedium: editData.lastMedium || "",
      lastSchool: editData.lastSchool || "",
      lastStream: editData.lastStream || "",

      localGuardianAddress: editData.localGuardianAddress || "",
      localGuardianContact: editData.localGuardianContact || "",
      localGuardianName: editData.localGuardianName || "",

      fatherName: editData.fatherName || "",
      fatherMobile: editData.fatherMobile || "",
      fatherEmail: editData.fatherEmail || "",
      fatherOccupation: editData.fatherOccupation || "",
      fatherQualification: editData.fatherQualification || "",
      fatherannualIncome: editData.fatherannualIncome || null,
      fatherorganizationName: editData.fatherorganizationName || "",
      fatherAadhar: editData.fatherAadhar || null,

      motherAadhar: editData.motherAadhar || null,
      motherMobile: editData.motherMobile || null,
      motherEmail: editData.motherEmail || "",
      motherName: editData.motherName || "",
      motherOccupation: editData.motherOccupation || "",
      motherQualification: editData.motherQualification || "",
      motherannualIncome: editData.motherannualIncome || null,
      motherorganizationName: editData.motherorganizationName || "",

      guardianAadhar: editData.guardianAadhar || null,
      guardianAnnualIncome: editData.guardianAnnualIncome || null,
      guardianEmail: editData.guardianEmail || "",
      guardianMobile: editData.guardianMobile || null,
      guardianName: editData.guardianName || "",
      guardianOccupation: editData.guardianOccupation || "",
      guardianOrganizationName: editData.guardianOrganizationName || "",
      guardianQualification: editData.guardianQualification || "",

      address: editData.studentFullAddress || editData.address || "",
      city: editData.city || "",
      area: editData.area || "",
      permanentAddress: editData.permanentAddress || "",

      transportRequired: editData.transportRequired || false,
      pickupLocation: editData.pickupLocation || "",
      routeName: editData.routeName || "",
      distanceFromSchool: editData.distanceFromSchool || "",

      hostelRequired: editData.hostelRequired || false,
      declarationDate: editData.dob || new Date().toISOString().split('T')[0],


      religion: editData.religion || "",
      casteCategory: editData.casteCategory || "",
      aadharNumber: editData.aadharNumber || "",
      motherToungue: editData.motherToungue || "",

      bloodGroup: editData.bloodGroup || "",
      doctorName: editData.doctorName || "",
      doctorContact: editData.doctorContact || "",
      allergies: editData.allergies || "",
      medicalConditions: editData.medicalConditions || "",
      specialNeeds: editData.specialNeeds || "",

      imageUrl: editData.imageUrl || "",
      digitalSignatire: editData.digitalSignatire || "",
      nationality: editData.nationality || "India",
      state: editData.state || "",
      pincode: editData.pincode || "",

      paymentId: editData.paymentId || "",
      paymentStatus: editData.paymentStatus || "",
      orderId: editData.orderId || "",
    }));

    setSelectedBranch(editData.gradeApplyingfor?.branchId);

    // ✅ DROPDOWN SUPPORT FIX
    if (editData.gradeApplyingfor?.branchId) {
      setSelectedBranch(editData.gradeApplyingfor.branchId);
    }

    if (editData.campusId?.id && isSuperAdmin) {
      setTempCampusId(editData.campusId.id);
    }

    setActiveStep(0);

  }, [editData, isSuperAdmin]);

  useEffect(() => {
    console.log("Inquiry data useEffect triggered");
    console.log("location.state:", location.state);
    console.log("grades.length:", grades.length);

    //run only once
    if (inquiryLoaded) {
      console.log("Inquiry already loaded, skipping");
      return;
    }

    if (
      !location.state?.fromInquiry ||
      !location.state?.inquiryData ||
      !grades.length ||
      !getBranch.length ||
      !academicYear.length
    ) {
      console.log("Skipping inquiry data load - missing required data");
      console.log("grades.length:", grades.length);
      console.log("getBranch.length:", getBranch.length);
      console.log("academicYear.length:", academicYear.length);
      return;
    }

    const inquiry = location.state.inquiryData;


    const hasPreviousSchool = !!(
      inquiry.previousSchoolName ||
      inquiry.passedClass ||
      inquiry.board ||
      inquiry.medium ||
      inquiry.preResult
    );

    // since they're set from branch selection
    const inquiryBoard = inquiry.board ? Number(inquiry.board) : null;
    const inquiryMedium = inquiry.medium ? Number(inquiry.medium) : null;

    const matchingGrade = grades.find(
      g => String(g.id) === String(inquiry.gradeApplyingfor) || g.name === inquiry.gradeApplyingfor
    );

    console.log("matchingGrade:", matchingGrade);
    console.log("inquiryBoard:", inquiryBoard);
    console.log("inquiryMedium:", inquiryMedium);

    // Find the branch that contains this grade
    let selectedBranchId = null;
    console.log("Looking for grade ID:", matchingGrade?.id);
    console.log("Available branches:", getBranch);

    if (matchingGrade && getBranch.length > 0) {
      console.log("Checking each branch for grade...");
      getBranch.forEach((branch, index) => {
        console.log(`Branch ${index}:`, branch);
        console.log(`Branch ${index} grades:`, branch.grades);

        if (branch.grades && branch.grades.some(grade => grade.id === matchingGrade.id)) {
          console.log("Found matching branch:", branch);
          selectedBranchId = branch.id;
        }
      });

      if (selectedBranchId) {
        console.log("Setting selected branch to:", selectedBranchId);
        setSelectedBranch(selectedBranchId);
      } else {
        console.log("No branch found with grade ID:", matchingGrade.id);
      }
    } else {
      console.log("Cannot find branch - matchingGrade:", matchingGrade, "getBranch.length:", getBranch.length);
    }

    // Set the stream if available
    const selectedStreamId = inquiry.streamApplyingFor ? Number(inquiry.streamApplyingFor) : null;
    console.log("Setting stream to:", selectedStreamId);

    // Set campus to inquiry campus if available
    if (inquiry.campusId && isSuperAdmin) {
      setTempCampusId(inquiry.campusId);
      console.log("Setting campus dropdown to:", inquiry.campusId);
    }

    //  const matchedYear = academicYear.find(
    //     y => y.name === inquiry.year
    //   );

    const matchedYear = academicYear.find(y => String(y.id) === String(inquiry.academicYearId));

    console.log("Inquiry year:", inquiry.year);
    console.log("Matched academic year:", matchedYear);

    //Setting Inquiry Data
    setFormData(prev => ({
      ...prev,
      enquiryId: inquiry.id || null,

      studentName: inquiry.name || "",
      studentMiddleName: inquiry.middleName || "",
      studentLastName: inquiry.lastName || "",
      dob: inquiry.dob || "",
      gender: inquiry.gender
        ? inquiry.gender.charAt(0).toUpperCase() + inquiry.gender.slice(1).toLowerCase()
        : "",

      studentType: inquiry.admissionType || null,
      anySibling: inquiry.anySibling || false,
      siblingName: inquiry.siblingName || "",
      siblingGrade: inquiry.siblingGrade || "",

      // Academic info
      academicYear: inquiry.year ? Number(inquiry.year) : null, // backend sends 'year'
      gradeApplyingfor: inquiry.gradeApplyingfor ? inquiry.gradeApplyingfor : null,
      streamApplyingFor: inquiry.streamApplyingFor ? Number(inquiry.streamApplyingFor) : null,
      branchinfo: inquiry.branchId ? Number(inquiry.branchId) : null,
      medium: inquiry.medium ? Number(inquiry.medium) : null,
      board: inquiry.board ? Number(inquiry.board) : null,

      lastSchool: inquiry.previousSchoolName || "",
      lastClass: inquiry.passedClass || "",
      year: inquiry.yearOfPassing || "",
      lastGrade: inquiry.preResult || "",
      lastBoard: inquiry.preBoard || "",
      lastMedium: inquiry.preMedium || "",
      lastStream: inquiry.preStream || "",

      fatherName: inquiry.parentName || "",
      fatherMobile: inquiry.phone || "",
      fatherEmail: inquiry.email || "",
      motherMobile: inquiry.phone || "",
      motherEmail: inquiry.email || "",

      address: inquiry.studentFullAddress || inquiry.address || "",
      city: inquiry.city || "",
      area: inquiry.area || "",
      permanentAddress: inquiry.studentFullAddress || inquiry.address || "",

      transportRequired: inquiry.transportRequired || false,
      hostelRequired: inquiry.hostelRequired || false,
      declarationDate: inquiry.declarationDate || new Date().toISOString().split('T')[0],

      nationality: inquiry.nationality || "India",
      // Don't load these fields from inquiry as they don't exist in inquiry data
      // religion: inquiry.religion || "",
      // casteCategory: inquiry.casteCategory || "",
      // aadharNumber: inquiry.aadharNumber || null,
      // motherToungue: inquiry.motherToungue || "",
      bloodGroup: inquiry.bloodGroup || "",
      imageUrl: null,
      state: inquiry.state || "",
      pincode: inquiry.pincode || "",
    }));


    if (getBranch.length > 0 && inquiry.board && inquiry.medium) {
      const matchingBranch = getBranch.find(
        b =>
          String(b.boardId) === String(inquiry.board) &&
          String(b.mediumId) === String(inquiry.medium)
      );

      if (matchingBranch) {
        console.log("Found matching branch from inquiry board/medium:", matchingBranch);

        setSelectedBranch(matchingBranch.id);

        setFormData(prev => ({
          ...prev,
          branchinfo: matchingBranch.id,
          boardName: matchingBranch.boardName || "",   // ✅ for display
          mediumName: matchingBranch.mediumName || "", // ✅ for display
        }));

      } else {
        console.log("No branch found matching board:", inquiry.board, "medium:", inquiry.medium);
      }
    }

    setInquiryLoaded(true);


    console.log("Inquiry year:", inquiry.year);
    console.log("Academic Year List:", academicYear);
    console.log("Inquiry data loaded into formData successfully");
    console.log("Final formData.academicYear:", formData.academicYear);
    console.log("Final formData.studentType:", formData.studentType);
    console.log("Final formData.branchinfo:", formData.branchinfo);
    console.log("Final formData.streamApplyingFor:", formData.streamApplyingFor);
    console.log("Final formData.gradeApplyingfor:", formData.gradeApplyingfor);
    // toast.success("Inquiry data loaded successfully!", {
    //   style: {
    //     borderRadius: "10px",
    //     background: isDark ? "#333" : "#fff",
    //     color: isDark ? "#fff" : "#333",
    //   },
    // });

  }, [location.state, grades, getBranch, academicYear]);

  const steps = [
    {
      id: 0,
      title: "Personal Details",
      icon: <User size={20} />,
      description: "Personal Details",
    },
    {
      id: 1,
      title: "Academic Details",
      icon: <Users size={20} />,
      description: "Contact Info",
    },
    {
      id: 2,
      title: "Contact Information",   // 👈 NEW STEP
      icon: <MapPin size={20} />,
      description: "Residential Details",
    },
    {
      id: 3,
      title: "Guardian Details",
      icon: <GraduationCap size={20} />,
      description: "School History",
    },
    {
      id: 4,
      title: "Health Records",   // 👈 NEW STEP
      icon: <HeartPulse size={20} />,
      description: "Medical Details",
    },
    {
      id: 5,
      title: "Transport/Hostel Details",
      icon: <Bus size={20} />,
    },
    {
      id: 6,
      title: "Documents Details",
      icon: <FileText size={20} />,
      description: "Verification",
    }
  ];

  // Calculate Progress
  const progress = ((activeStep + 1) / steps.length) * 100;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    let newValue = type === "checkbox" ? checked : value;

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
        previousSchoolAvailable: false,
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

  const handleFileChange = (e, docId, docName) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File must be under 2MB");
      return;
    }

    setFiles((prev) => ({
      ...prev,
      [docId]: file,
    }));

    toast.success(`${docName} uploaded!`, {
      style: {
        borderRadius: "10px",
        background: isDark ? "#333" : "#fff",
        color: isDark ? "#fff" : "#333",
      },
    });
  };

  const removeFile = (docId) => {
    setFiles((prev) => {
      const updated = { ...prev };
      delete updated[docId];
      return updated;
    });
  };
  const handleNext = () => {
    if (activeStep < steps.length - 1) setActiveStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (activeStep > 0) setActiveStep((prev) => prev - 1);
  };

  const handleStepClick = (index) => {
    setActiveStep(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
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

  // Fetch Documents According to branch
  const fetchBranchDocs = async () => {
    // /api/documents/mapping/{BranchGradeId=4}/{admissionType=1}/{fee_structure_type_id=2}
    try {
      console.log("branchGrade Id", formData.gradeApplyingfor);
      console.log("Student type Id", formData.studentType);
      console.log("Fee structure Type Id", formData.feeStructureTypeId);
      const { data } = await api.get(`/api/documents/mapping/${formData.gradeApplyingfor}/${formData.studentType}/${formData.feeStructureTypeId}`);
      console.log("Documetns As per Grades", data.documents);
      setBranchDocuments(data.documents);
    } catch (error) {
      console.log(error);
    }
  }

  const fetchExistingDocuments = async (admissionId) => {
    try {
      const response = await api.get(`/api/documents/${admissionId}`);
      setExistingDocs(response.data || []);
    } catch (error) {
      console.error('Error fetching existing documents:', error);
    }
  };

  useEffect(() => {
    if (formData.gradeApplyingfor &&
      formData.studentType &&
      formData.feeStructureTypeId
    ) {
      fetchBranchDocs();
    }
  }, [formData.gradeApplyingfor, formData.studentType, formData.feeStructureTypeId])

  useEffect(() => {
    if (isEdit && editData?.id) {
      fetchExistingDocuments(editData.id);
    }
  }, [isEdit]);

  useEffect(() => {
    if (getSelectedBranch && getBranch.length > 0 && !formData.boardName) {
      const branch = getBranch.find(b => Number(b.id) === Number(getSelectedBranch));
      if (branch) {
        setFormData(prev => ({
          ...prev,
          boardName: branch.boardName || "",
          mediumName: branch.mediumName || "",
          board: branch.boardId ? Number(branch.boardId) : prev.board,
          medium: branch.mediumId ? Number(branch.mediumId) : prev.medium,
        }));
      }
    }
  }, [getSelectedBranch, getBranch]);

  //Create New Admission
  const doAdmission = async () => {
    try {
      console.log("=== Starting Admission Process ===");

      const missingDocs = getBranchDocuments.filter(
        doc => doc.mandatory && !files[doc.id]
      );

      if (missingDocs.length > 0) {
        toast.error(`Please upload: ${missingDocs.map(d => d.name).join(", ")}`);
        return;
      }

      // Validate campusId and academicYear
      const campusIdValue = campusIdToUse;

      if (!campusIdValue) {
        toast.error('Please select a campus');
        return;
      }

      if (!formData.academicYear) {
        toast.error('Please select an academic year');
        return;
      }

      if (!formData.gradeApplyingfor) {
        toast.error('Please select a grade');
        return;
      }

      if (!formData.studentName || !formData.studentLastName) {
        toast.error('Please enter student first name and last name');
        return;
      }

      if (!formData.dob) {
        toast.error('Please enter date of birth');
        return;
      }

      if (!formData.gender) {
        toast.error('Please select gender');
        return;
      }
      // Create FormData object for multipart/form-data
      const formDataToSend = new FormData();

      // Prepare the data object for the 'data' part
      const admissionData = {
        ...Object.fromEntries(
          Object.entries(formData).filter(([key]) => key !== 'branchinfo')
        ),
        campusId: campusIdValue,
        academicYear: formData.academicYear ? Number(formData.academicYear) : null,
        studentType: formData.studentType ? Number(formData.studentType) : null,
        gradeApplyingfor: formData.gradeApplyingfor ? Number(formData.gradeApplyingfor) : null,
        streamApplyingFor: formData.streamApplyingFor ? Number(formData.streamApplyingFor) : null,

        medium: formData.medium ? Number(formData.medium) : null,
        board: formData.board ? Number(formData.board) : null,

        // Fix field names to match backend DTO
        // Note: branchinfo is NOT in the StudentAdmissionRequestDto, but backend might need it
        // branchinfo: formData.branchinfo,
        digitalSignatire: formData.digitalSignatire,

        // Add missing fields backend expects
        nationality: formData.nationality || "",
        bloodGroup: formData.bloodGroup || "",
        religion: formData.religion, // Keep as string, don't convert to null
        casteCategory: formData.casteCategory, // Keep as string, don't convert to null
        subcaste: formData.subcaste, // Keep as string, don't convert to null
        aadharNumber: formData.aadharNumber, // Keep as string, don't convert to null
        motherToungue: formData.motherToungue, // Keep as string, don't convert to null
        documentsVerified: false, // Default value
        amount: null, // Will be set by backend
        feeStructureTypeId: formData.feeStructureTypeId ? Number(formData.feeStructureTypeId) : null,

        // Map campusId
        // campusId: campusIdValue,
        // Remove deleted frontend fields
        previousSchoolAvailable: undefined,
        previousSchoolName: undefined,
        passedClass: undefined,
        yearOfPassing: undefined,
        preResult: undefined,
        preBoard: undefined,
        preMedium: undefined,
        preStream: undefined,
        parentDeclaration: undefined,
      };

      // clean empty strings (but keep specific fields as strings)
      const cleanData = Object.fromEntries(
        Object.entries(admissionData)
          .filter(([key]) => !['campusId'].includes(key)) // Remove campusId duplicate only
          .map(([key, value]) => {
            // Fields to keep as strings (don't convert to null)
            const keepAsString = ['religion', 'casteCategory', 'aadharNumber', 'motherToungue'];

            return [
              key,
              keepAsString.includes(key) ? value : (value === "" ? null : value)
            ];
          })
      );

      cleanData.campusId = campusIdValue;

      formDataToSend.append(
        "data",
        new Blob([JSON.stringify(cleanData)], {
          type: "application/json"
        })
      );

      for (let [key, value] of formDataToSend.entries()) {
        if (key === "data") {
          try {
            console.log(key, JSON.parse(value));
          } catch (e) {
            console.log(key, value);
          }
        } else if (value instanceof File) {
          console.log(key, {
            name: value.name,
            size: value.size,
            type: value.type,
            lastModified: value.lastModified
          });
        } else {
          console.log(key, value);
        }
      }

      // ✅ NEW — collect IDs into array, send as single JSON blob
      const documentTypeIds = [];

      getBranchDocuments.forEach(doc => {
        if (files[doc.id]) {
          formDataToSend.append("documents", files[doc.id]);
          documentTypeIds.push(doc.id);
        }
      });


      // Send all IDs as one JSON blob — Spring can now deserialize List<Long>
      formDataToSend.append(
        "document_type_ids",
        new Blob([JSON.stringify(documentTypeIds)], { type: "application/json" })
      );


      // Log FormData contents (for debugging)
      console.log("=== FORMDATA CONTENTS ===");
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`${key}:`, {
            name: value.name,
            size: value.size,
            type: value.type
          });
        } else {
          console.log(`${key}:`, value);
        }
      }
      console.log("=== END FORMDATA CONTENTS ===");
      // Send request
      const response = await api.post("/api/admission/initiate", formDataToSend);

      console.log("Response received:", response);
      toast.success('Admission initiated successfully!');
      console.log('Admission response:', response.data);
      navigate('/staff/admission/student-profile');
      // Optionally reset form or redirect
      // setFormData({...});
      // setActiveStep(0);

    } catch (error) {
      console.error('=== Admission Error Details ===');
      console.error('Full error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error headers:', error.response?.headers);

      // Show more detailed error message
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to initiate admission';

      toast.error(errorMessage);
    }
  }

  // Edit or Update Student
  // const updateAdmission = async () => {
  //   try {
  //     console.log("=== UPDATE MODE ===");

  //     const formDataToSend = new FormData();

  //     const updatedData = {
  //       ...formData,

  //       campusId: campusIdToUse,

  //       academicYear: formData.academicYear || null,
  //       gradeApplyingfor: formData.gradeApplyingfor
  //         ? Number(formData.gradeApplyingfor)
  //         : null,
  //       streamApplyingFor: formData.streamApplyingFor
  //         ? Number(formData.streamApplyingFor)
  //         : null,

  //       medium: formData.medium ? Number(formData.medium) : null,
  //       board: formData.board ? Number(formData.board) : null
  //     };

  //     console.log(updatedData);

  //     const cleanData = Object.fromEntries(
  //       Object.entries(updatedData).map(([key, value]) => [
  //         key,
  //         value === "" ? null : value
  //       ])
  //     );

  //     formDataToSend.append(
  //       "data",
  //       new Blob([JSON.stringify(cleanData)], {
  //         type: "application/json"
  //       })
  //     );

  //     getBranchDocuments.forEach(doc => {
  //       if (files[doc.id]) {
  //         formDataToSend.append("documents", files[doc.id]);
  //         formDataToSend.append("document_type_ids", doc.id);
  //       }
  //     });

  //     //  /api/admission/update/1
  //     // await api.put(`/api/admission/update/${editData.id}`, cleanData, {
  //     //   headers: {
  //     //     "Content-Type": "application/json"
  //     //   }
  //     // });
  //     await api.put(`/api/admission/update/${editData.id}`, formDataToSend);

  //     toast.success("Admission updated successfully!");
  //     await api.get(`/api/admission/allTempadmission/${campusIdToUse}`);
  //     navigate('/staff/admission/student-profile');

  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Update failed");
  //   }
  // };
  const updateAdmission = async () => {
    try {
      console.log("=== UPDATE MODE ===");

      const formDataToSend = new FormData();

      // Build data payload exactly like doAdmission
      const updatedData = {
        ...Object.fromEntries(
          Object.entries(formData).filter(([key]) => !['branchinfo', 'motherTongue'].includes(key))
        ),
        campusId: campusIdToUse,
        academicYear: formData.academicYear ? Number(formData.academicYear) : null,
        studentType: formData.studentType ? Number(formData.studentType) : null,
        gradeApplyingfor: formData.gradeApplyingfor ? Number(formData.gradeApplyingfor) : null,
        streamApplyingFor: formData.streamApplyingFor ? Number(formData.streamApplyingFor) : null,
        medium: formData.medium ? Number(formData.medium) : null,
        board: formData.board ? Number(formData.board) : null,
        feeStructureTypeId: formData.feeStructureTypeId ? Number(formData.feeStructureTypeId) : null,
        // Keep these as strings (same as initiate)
        religion: formData.religion,
        casteCategory: formData.casteCategory,
        aadharNumber: formData.aadharNumber,
        motherToungue: formData.motherToungue,
        documentsVerified: false,
        amount: null,
        // Strip frontend-only fields
        previousSchoolAvailable: undefined,
        previousSchoolName: undefined,
        passedClass: undefined,
        yearOfPassing: undefined,
        preResult: undefined,
        preBoard: undefined,
        preMedium: undefined,
        preStream: undefined,
        parentDeclaration: undefined,
      };

      const cleanData = Object.fromEntries(
        Object.entries(updatedData).map(([key, value]) => {
          const keepAsString = ['religion', 'casteCategory', 'aadharNumber', 'motherToungue'];
          return [key, keepAsString.includes(key) ? value : (value === "" ? null : value)];
        })
      );

      // Append data as JSON blob — same as initiate
      formDataToSend.append(
        "data",
        new Blob([JSON.stringify(cleanData)], { type: "application/json" })
      );

      const documentTypeIds = [];
      let hasNewFiles = false;
      console.log("Sample existingDoc fields:", existingDocs[0]);

      const resolveTypeId = (doc) =>
        doc.documentTypeId        // most common
        ?? doc.documentType?.id   // nested object
        ?? doc.typeId             // alternative
        ?? doc.docTypeId          // alternative
        ?? null;
      // 1. Existing docs — check if user uploaded a replacement file
      existingDocs.forEach(doc => {
        const typeId = resolveTypeId(doc);
        if (!typeId) {
          console.warn("Could not resolve typeId for existing doc:", doc);
          return;
        }
        if (files[Number(typeId)]) {
          console.log("Replacement file for typeId:", typeId);
          formDataToSend.append("documents", files[Number(typeId)]);
          documentTypeIds.push(Number(typeId));
          hasNewFiles = true;
        }
      });// 2. Newly added docs (not in existingDocs at all)
      getBranchDocuments.forEach(doc => {
        const docId = Number(doc.id);
        const isAlreadyInDb = existingDocs.some(
          ed => Number(resolveTypeId(ed)) === docId
        );
        if (!isAlreadyInDb && files[docId]) {
          console.log("New doc upload for typeId:", docId);
          formDataToSend.append("documents", files[docId]);
          documentTypeIds.push(docId);
          hasNewFiles = true;
        }
      });

      console.log("Final documentTypeIds:", documentTypeIds);
      console.log("hasNewFiles:", hasNewFiles);
      // Only append document parts if there are actual files to send
      // (backend has required=false so omitting entirely is safe now)
      if (hasNewFiles) {
        formDataToSend.append(
          "document_type_ids",
          new Blob([JSON.stringify(documentTypeIds)], { type: "application/json" })
        );
      }

      console.log("=== UPDATE PAYLOAD ===");
      for (let [key, value] of formDataToSend.entries()) {
        if (key === "data") {
          try { console.log(key, JSON.parse(await value.text())); } catch { console.log(key, value); }
        } else if (value instanceof File) {
          console.log(key, { name: value.name, size: value.size });
        } else {
          console.log(key, value);
        }
      }

      await api.put(`/api/admission/update/${editData.id}`, formDataToSend);
      toast.success("Admission updated successfully!");
      navigate('/staff/admission/student-profile');

    } catch (error) {
      console.error("Update error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Update failed";
      toast.error(errorMessage);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEdit) {
      updateAdmission();
    } else {
      doAdmission();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 font-sans">
      <Toaster position="top-center" />


      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-5 gap-4">
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
            Student <span className="text-primary">Enrollment</span>
          </h1>
          <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Please fill in the details accurately to process the application.
          </p>
          <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ml-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <AutoBreadcrumb />
          </p>
        </div>

        <div className="hidden md:block text-right">
          <div
            className={`text-xs font-bold mb-2 ${isDark ? "text-gray-500" : "text-gray-400"
              }`}
          >
            APPLICATION PROGRESS
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
                onClick={() => handleStepClick(index)}
                className={`flex-1 flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 cursor-pointer hover:scale-[1.02] ${isActive ? (isDark ? "bg-white/5" : "bg-gray-50") : isDark ? "hover:bg-white/5" : "hover:bg-gray-50"
                  }`}
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
      <form>
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
                    Student Profile
                  </h2>
                  {isSuperAdmin &&
                    <select
                      value={tempCampusId}
                      onChange={(e) => setTempCampusId(Number(e.target.value))}
                      className={`${inputClass} ${isDark ? "text-white" : "text-gray-800"}`}
                    >
                      <option value="">Select Campus</option>
                      {campuses.map(c => (
                        <option key={c.campusId} value={c.campusId}>{c.campusName}</option>
                      ))}
                    </select>
                  }
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                  <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                      <label className={labelClass}>
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Middle Name</label>
                      <input
                        type="text"
                        name="studentMiddleName"
                        value={formData.studentMiddleName}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter middle name (optional)"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="studentLastName"
                        value={formData.studentLastName}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Inquiry Number</label>
                      <input
                        type="text"
                        name="admissionNumber"
                        value={formData.enquiryId}
                        className={inputClass}
                        readOnly
                        disabled
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Date of Birth</label>
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
                    <div>
                      <label className={labelClass}>Gender</label>
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
                      {/* Debug: Show current gender value */}
                      {/* <div className="text-xs text-gray-500 mt-1">
                        Debug: formData.gender = "{formData.gender}"
                      </div> */}


                    </div>

                    <div>
                      <label className={labelClass}>Religion</label>
                      <input
                        type="text"
                        name="religion"
                        value={formData.religion}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Religion"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Caste Category</label>
                      <input
                        type="text"
                        name="casteCategory"
                        value={formData.casteCategory}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Caste Category"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Aadhaar Number</label>
                      <input
                        type="number"
                        name="aadharNumber"
                        value={formData.aadharNumber}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="XXXX XXXX XXXX"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Mother Tongue</label>
                      <input
                        type="text"
                        name="motherToungue"
                        value={formData.motherToungue}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Mother Tongue"
                      />
                    </div>
                    {/* Fees Category */}
                    <div className="">
                      <label className={labelClass}>Fee Category <span className="text-red-500">*</span></label>
                      <select
                        name="feeStructureTypeId"
                        value={formData.feeStructureTypeId}
                        onChange={handleInputChange}
                        className={inputClass}
                      >
                        <option value="">Select Fee Type</option>
                        {feeCategory.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {/*  Sibling Details*/}
                    <div className="">
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
                      name="studentType"
                      value={formData.studentType}
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
                  {/*Select Acedemic Year Dropdown*/}
                  <div className="">
                    <label className={labelClass}>Select Academic Year <span className="text-red-500">*</span></label>
                    <select
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleInputChange}
                      className={inputClass}
                    >
                      <option value="">Select Year</option>
                      {academicYear.map((academicYear) => (
                        <option key={academicYear.id} value={academicYear.id}>
                          {academicYear.name}
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
                      value={formData.branchinfo}
                      onChange={(e) => {
                        const selectedId = Number(e.target.value);

                        const selectedBranchObj = getBranch.find(
                          (b) => b.id === selectedId
                        );

                        console.log("SELECTED BRANCH:", selectedBranchObj);

                        setSelectedBranch(selectedId);

                        setFormData((prev) => ({
                          ...prev,
                          branchinfo: selectedId,
                          board: selectedBranchObj?.boardId
                            ? Number(selectedBranchObj.boardId)
                            : prev.board,
                          medium: selectedBranchObj?.mediumId
                            ? Number(selectedBranchObj.mediumId)
                            : prev.medium,

                          boardName: selectedBranchObj?.boardName || "",   // ✅ store name for display
                          mediumName: selectedBranchObj?.mediumName || "", // ✅ store name for display

                        }));
                      }}
                      className={`${inputClass} + overflow-x-auto`}
                    >
                      <option value="">Select Branch</option>
                      {getBranch.map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.campusName}.{branch.boardName}.{branch.mediumName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Board,medium,grade */}
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
                      value={formData.boardName || ""}
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
                      value={formData.mediumName || ""}
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
                        // onChange={handleInputChange}
                        onChange={(e) => {
                          const value = e.target.value;

                          setFormData(prev => ({
                            ...prev,
                            streamApplyingFor: value ? Number(value) : null
                          }));
                        }}
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
                    Address Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Full Address */}
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
                      <option value="DELHI">Delhi</option>
                      <option value="MUMBAI">Mumbai</option>
                      <option value="BANGALORE">Bangalore</option>
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
                      <option value="MILLENIUM">Millenium</option>
                      <option value="ADAJAN">Adajan</option>
                      <option value="OTHER">Other</option>
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

                  {/* State */}
                  <div>
                    <label className={labelClass}>
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={inputClass}
                      placeholder="Enter State"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Nationality</label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className={inputClass}
                      placeholder="Enter Nationality"
                    />
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className={labelClass}>
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className={inputClass}
                      placeholder="Enter Pincode"
                    />
                  </div>

                  {/* Permanent Address Dropdown */}
                  {/* <div> */}
                  {/* <label className={labelClass}>Address Same As Above <span className="text-red-500">*</span></label> */}
                  {/* <select
                      name="addressAsAbove"
                      value={setAddressAsAbove}
                      onChange={handleInputChange}
                      className={inputClass}
                    >
                      <option value="">Select</option>
                      <option value={true}>Yes</option>
                      <option value={false}>No</option>
                    </select> */}
                  {/* {addressAsAbove === false && ( */}
                  {/* <input
                        type="text"
                        name="area"
                        value={formData.area}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Area"
                      /> */}
                  {/* )} */}
                  {/* </div> */}

                  {/* Permanent Address */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      Permanent Address (if different)
                    </label>
                    <textarea
                      name="permanentAddress"
                      value={formData.permanentAddress}
                      onChange={handleInputChange}
                      className={inputClass}
                      rows={4}
                      placeholder="Enter Permanent Address (If Different From Above)"
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
                    className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"
                      }`}
                  >
                    Parent / Guardian Details
                  </h2>
                </div>

                {/* Father Details */}
                <div className="mb-10">
                  <h3 className={`text-lg font-bold mb-6 ${isDark ? "text-gray-200" : "text-gray-700"
                    }`}>
                    Father's Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className={labelClass}>Name</label>
                      <input
                        type="text"
                        name="fatherName"
                        value={formData.fatherName}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Father's Name"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Qualification</label>
                      <input
                        type="text"
                        name="fatherQualification"
                        value={formData.fatherQualification}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Qualification"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Occupation</label>
                      <input
                        type="text"
                        name="fatherOccupation"
                        value={formData.fatherOccupation}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Occupation"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Organization Name</label>
                      <input
                        type="text"
                        name="fatherorganizationName"
                        value={formData.fatherorganizationName}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Organization"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Annual Income</label>
                      <input
                        type="number"
                        name="fatherannualIncome"
                        value={formData.fatherannualIncome}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Annual Income"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Aadhar Number</label>
                      <input
                        type="number"
                        name="fatherAadhar"
                        value={formData.fatherAadhar}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="XXXX XXXX XXXX"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Mobile</label>
                      <input
                        type="tel"
                        name="fatherMobile"
                        value={formData.fatherMobile}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="+91 1234567890"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Email</label>
                      <input
                        type="email"
                        name="fatherEmail"
                        value={formData.fatherEmail}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Email"
                      />
                    </div>
                  </div>
                </div>

                {/* Mother Details */}

                <div className="mb-10">
                  <h3 className={`text-lg font-bold mb-6 ${isDark ? "text-gray-200" : "text-gray-700"
                    }`}>
                    Mother's Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className={labelClass}>Name</label>
                      <input
                        type="text"
                        name="motherName"
                        value={formData.motherName}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Mother's Name"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Qualification</label>
                      <input
                        type="text"
                        name="motherQualification"
                        value={formData.motherQualification}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Qualification"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Occupation</label>
                      <input
                        type="text"
                        name="motherOccupation"
                        value={formData.motherOccupation}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Occupation"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Organization Name</label>
                      <input
                        type="text"
                        name="motherorganizationName"
                        value={formData.motherorganizationName}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Organization"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Annual Income</label>
                      <input
                        type="number"
                        name="motherannualIncome"
                        value={formData.motherannualIncome}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Annual Income"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Aadhar Number</label>
                      <input
                        type="number"
                        name="motherAadhar"
                        value={formData.motherAadhar}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="XXXX XXXX XXXX"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Mobile</label>
                      <input
                        type="tel"
                        name="motherMobile"
                        value={formData.motherMobile}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="+91 1234567890"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Email</label>
                      <input
                        type="email"
                        name="motherEmail"
                        value={formData.motherEmail}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Email"
                      />
                    </div>
                  </div>
                </div>

                {/* Guardian Details */}
                <div>
                  <h3 className={`text-lg font-bold mb-6 ${isDark ? "text-gray-200" : "text-gray-700"
                    }`}>
                    Guardian's Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <label className={labelClass}>Name</label>
                      <input
                        type="text"
                        name="guardianName"
                        value={formData.guardianName}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Guardian's Name"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Qualification</label>
                      <input
                        type="text"
                        name="guardianQualification"
                        value={formData.guardianQualification}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Qualification"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Occupation</label>
                      <input
                        type="text"
                        name="guardianOccupation"
                        value={formData.guardianOccupation}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Occupation"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Organization Name</label>
                      <input
                        type="text"
                        name="guardianOrganizationName"
                        value={formData.guardianOrganizationName}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Organization"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Annual Income</label>
                      <input
                        type="number"
                        name="guardianAnnualIncome"
                        value={formData.guardianAnnualIncome}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Annual Income"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Aadhar Number</label>
                      <input
                        type="number"
                        name="guardianAadhar"
                        value={formData.guardianAadhar}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="XXXX XXXX XXXX"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Mobile</label>
                      <input
                        type="tel"
                        name="guardianMobile"
                        value={formData.guardianMobile}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="+91 1234567890"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Email</label>
                      <input
                        type="email"
                        name="guardianEmail"
                        value={formData.guardianEmail}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Enter Email"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-1 h-8 bg-primary rounded-full"></div>
                  <h2
                    className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"
                      }`}
                  >
                    Medical Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Blood Group */}
                  <div>
                    <label className={labelClass}>Blood Group</label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className={inputClass}
                    >
                      <option value="">Select Blood Group</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  {/* Any Allergies */}
                  <div>
                    <label className={labelClass}>Any Allergies</label>
                    <input
                      type="text"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      className={inputClass}
                      placeholder="Mention allergies (if any)"
                    />
                  </div>

                  {/* Medical Conditions */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>Medical Conditions</label>
                    <textarea
                      name="medicalConditions"
                      value={formData.medicalConditions}
                      onChange={handleInputChange}
                      className={inputClass}
                      rows={3}
                      placeholder="Mention any existing medical conditions"
                    />
                  </div>

                  {/* Special Needs */}
                  <div className="md:col-span-2">
                    <label className={labelClass}>Special Needs</label>
                    <textarea
                      name="specialNeeds"
                      value={formData.specialNeeds}
                      onChange={handleInputChange}
                      className={inputClass}
                      rows={3}
                      placeholder="Mention any special assistance required"
                    />
                  </div>

                  {/* Doctor Name */}
                  <div>
                    <label className={labelClass}>Doctor Name</label>
                    <input
                      type="text"
                      name="doctorName"
                      value={formData.doctorName}
                      onChange={handleInputChange}
                      className={inputClass}
                      placeholder="Enter Doctor Name"
                    />
                  </div>

                  {/* Doctor Contact */}
                  <div>
                    <label className={labelClass}>Doctor Contact</label>
                    <input
                      type="tel"
                      name="doctorContact"
                      value={formData.doctorContact}
                      onChange={handleInputChange}
                      className={inputClass}
                      placeholder="Enter Doctor Contact Number"
                    />
                  </div>

                </div>
              </div>
            )}

            {activeStep === 5 && (
              <>
                {/* Transport Details */}
                <div className="mb-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-8 bg-primary rounded-full"></div>
                    <h2
                      className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"
                        }`}
                    >
                      Transport Details
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Transport Required */}
                    <div className="md:col-span-2">
                      <label className={labelClass}>Transport Required?</label>
                      <div className="flex gap-4">
                        {["Yes", "No"].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, transportRequired: option === "Yes" })
                            }
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${formData.transportRequired === (option === "Yes")
                              ? "bg-primary text-white shadow-lg shadow-primary/20"
                              : isDark
                                ? "bg-[#242424] text-gray-400"
                                : "bg-gray-100 text-gray-600"
                              }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Conditional Fields */}
                    {formData.transportRequired && (
                      <>
                        <div>
                          <label className={labelClass}>Pickup Point</label>
                          <input
                            type="text"
                            name="pickupLocation"
                            value={formData.pickupLocation}
                            onChange={handleInputChange}
                            className={inputClass}
                            placeholder="Enter Pickup Location"
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Route</label>
                          <input
                            type="text"
                            name="routeName"
                            value={formData.routeName}
                            onChange={handleInputChange}
                            className={inputClass}
                            placeholder="Enter Route Number / Name"
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Distance from School (KM)</label>
                          <input
                            type="number"
                            name="distanceFromSchool"
                            value={formData.distanceFromSchool}
                            onChange={handleInputChange}
                            className={inputClass}
                            placeholder="Enter Distance"
                          />
                        </div>
                      </>
                    )}

                  </div>
                </div>
                {/* Hostel Details */}
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-8 bg-primary rounded-full"></div>
                    <h2
                      className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"
                        }`}
                    >
                      Hostel Details
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Hostel Required */}
                    <div className="md:col-span-2">
                      <label className={labelClass}>Hostel Required?</label>
                      <div className="flex gap-4">
                        {["Yes", "No"].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, hostelRequired: option === "Yes" })
                            }
                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${formData.hostelRequired === (option === "Yes")
                              ? "bg-primary text-white shadow-lg shadow-primary/20"
                              : isDark
                                ? "bg-[#242424] text-gray-400"
                                : "bg-gray-100 text-gray-600"
                              }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Conditional Fields */}
                    {formData.hostelRequired && (
                      <>
                        <div>
                          <label className={labelClass}>Local Guardian Name</label>
                          <input
                            type="text"
                            name="localGuardianName"
                            value={formData.localGuardianName}
                            onChange={handleInputChange}
                            className={inputClass}
                            placeholder="Enter Local Guardian Name"
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Local Guardian Contact</label>
                          <input
                            type="tel"
                            name="localGuardianContact"
                            value={formData.localGuardianContact}
                            onChange={handleInputChange}
                            className={inputClass}
                            placeholder="Enter Contact Number"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className={labelClass}>Address</label>
                          <textarea
                            name="localGuardianAddress"
                            value={formData.localGuardianAddress}
                            onChange={handleInputChange}
                            className={inputClass}
                            rows={3}
                            placeholder="Enter Local Guardian Address"
                          />
                        </div>
                      </>
                    )}

                  </div>
                </div>
              </>
            )}

            {activeStep === 6 && (
              <>
                {/* Existing Documents — only in edit mode */}
                {isEdit && existingDocs.length > 0 && (
                  <div className="mb-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                      <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                        Uploaded Documents
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {existingDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className={`p-5 rounded-2xl border flex items-center justify-between gap-4
                ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="text-primary shrink-0" size={18} />
                            <div className="min-w-0">
                              <p className={`font-semibold text-sm truncate ${isDark ? "text-white" : "text-gray-800"}`}>
                                {doc.documentName}
                              </p>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full
                    ${doc.status === 'APPROVED'
                                  ? "bg-green-500/10 text-green-600"
                                  : doc.status === 'REJECTED'
                                    ? "bg-red-500/10 text-red-600"
                                    : "bg-yellow-500/10 text-yellow-600"}`}>
                                {doc.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {/* View */}
                            <button
                              type="button"
                              onClick={() => window.open(doc.fileUrl, '_blank')}
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white transition"
                              title="View Document"
                            >
                              <Eye size={15} />
                            </button>

                            {/* Replace — clicking this uploads a new file for same doc type */}
                            <label
                              className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition cursor-pointer"
                              title="Replace Document"
                            >
                              <Upload size={15} />
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (!file) return;
                                  if (file.size > 2 * 1024 * 1024) {
                                    toast.error("File must be under 2MB");
                                    return;
                                  }
                                  // doc.documentTypeId links back to getBranchDocuments id
                                  const typeId = doc.documentTypeId || doc.id;
                                  setFiles(prev => ({ ...prev, [typeId]: file }));
                                  toast.success(`${doc.documentName} queued for replacement`);
                                }}
                              />
                            </label>

                            {/* Show replacement queued indicator */}
                            {files[doc.documentTypeId || doc.id] && (
                              <span className="text-xs text-green-600 font-bold">
                                New file ready
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Documents Uploads */}
                <div className="mb-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-8 bg-primary rounded-full"></div>
                    <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                      {isEdit ? "Add / Replace Documents" : "Documents Upload"}
                    </h2>
                  </div>

                  {/* Fetching Documents dynamically */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getBranchDocuments
                      .filter(doc => doc.active)
                      .filter(doc => {
                        if (!isEdit) return true;
                        // In edit mode, hide docs already uploaded — user can replace them via the top section
                        return !existingDocs.some(ed => Number(ed.documentTypeId) === Number(doc.id));
                      })
                      .map((doc) => (
                        <div
                          key={doc.id}
                          className={`p-6 rounded-2xl border-2 border-dashed
                          ${isDark ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"}`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className={`font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                              {doc.name}
                              {doc.mandatory
                                ? <span className="text-red-500 ml-1">*</span>
                                : <span className="text-green-500 ml-1">(Optional)</span>}
                            </h3>

                            {files[doc.id] && (
                              <button
                                type="button"
                                onClick={() => removeFile(doc.id)}
                                className="text-red-500 hover:scale-110 transition"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          {files[doc.id] ? (
                            <p className="text-sm text-green-600 font-medium">
                              ✓ {files[doc.id].name}
                            </p>
                          ) : (
                            <label className="w-full py-3 px-4 rounded-xl bg-primary text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer hover:brightness-110 transition-all">
                              {isEdit ? "Upload / Replace" : "Upload File"}
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={(e) => handleFileChange(e, doc.id, doc.name)}
                              />
                            </label>
                          )}
                        </div>
                      ))}
                  </div>

                  {/* Info Notice */}
                  <div className={`mt-10 p-5 rounded-2xl flex gap-4
        ${isDark
                      ? "bg-primary/5 border border-primary/20 text-primary"
                      : "bg-blue-50 border border-blue-100 text-blue-700"}`}
                  >
                    <Info className="shrink-0" />
                    <p className="text-sm leading-relaxed">
                      <strong>Important:</strong> Each file must be under 2MB.
                      Accepted formats: PDF, JPG, JPEG, PNG.
                      Originals must be presented during physical verification.
                    </p>
                  </div>
                </div>

                {/* Declaration */}
                <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-1 h-8 bg-primary rounded-full"></div>
                    <h2 className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-800"}`}>
                      Declaration
                    </h2>
                  </div>

                  <div className="space-y-6">
                    <div className={`p-6 rounded-2xl border
          ${isDark
                        ? "bg-white/5 border-white/10 text-gray-300"
                        : "bg-gray-50 border-gray-200 text-gray-700"}`}
                    >
                      <p className="text-sm leading-relaxed">
                        I hereby declare that the information provided above is true and correct to the best of my knowledge.
                        I understand that any false information may result in cancellation of admission.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.parentDeclaration}
                        onChange={(e) =>
                          setFormData({ ...formData, parentDeclaration: e.target.checked })
                        }
                        className="w-5 h-5 accent-primary"
                      />
                      <label className="text-sm font-medium">
                        I agree to the above declaration
                      </label>
                    </div>

                    <div>
                      <label className={labelClass}>Digital Signature (Parent Name)</label>
                      <input
                        type="text"
                        name="digitalSignatire"
                        value={formData.digitalSignatire}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="Type Parent / Guardian Full Name"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Date</label>
                      <input
                        type="date"
                        name="declarationDate"
                        value={formData.declarationDate}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
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
                type="button"
                onClick={handleSubmit}
                className="px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-green-600 hover:bg-green-500 text-white shadow-xl shadow-green-500/20 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
              >
                {isEdit ? "Update Admission" : "Complete Registration"} <Save size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest bg-primary hover:brightness-110 text-white shadow-xl shadow-primary/30 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
              >
                Next Step <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default StudentAdmission;
