import { Routes, Route, Navigate, useLocation } from "react-router-dom"; // Fixed import
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";

// Layout & Guards
import StaffLayout from "../features/staff/layout/StaffLayout";
import ProtectedRoute from "../components/common/ProtectedRoute";
import PermissionRoute from "./PermissionRoute";
import { fetchUserCampuses } from "../hooks/campusSlice";

// Pages
import Dashboard from "../features/staff/pages/Dashboard";
import UserProfile from "../features/staff/pages/UserProfile";
import CreateCampus from "../features/staff/pages/Campuses/CreateCampus";
import AdminDashboard from "../features/staff/pages/AdminDashboard";

// import AssignRolestostaff from "../features/staff/pages/Manage Staff/AssignRolestostaff_Backup";
import CreateStaff from "../features/staff/pages/Manage Staff/CreateStaff";
// import CampusAccess from "../features/staff/pages/Manage Staff/CampusAccess_Backup";
import Displaystaff2 from "../features/staff/pages/Manage Staff/Displaystaff2";


// ********************************** Role Confirguration ************************************************
import CreateRole from "../features/staff/pages/Roles Configuration/Global Roles Config/CreateRole";
import ViewRole from "../features/staff/pages/Roles Configuration/Global Roles Config/ViewRole";
import EditRole from "../features/staff/pages/Roles Configuration/Global Roles Config/EditRole";
import CreateCampusRole from "../features/staff/pages/Roles Configuration/Campus Roles Config/CreateCampusRole";
import ViewCampusRole from "../features/staff/pages/Roles Configuration/Campus Roles Config/ViewCampusRole";
import EditCampusRole from "../features/staff/pages/Roles Configuration/Campus Roles Config/EditCampusRole";


// ********************************** Admission Cycle ************************************************
import CreateAdmissionCycle from "../features/staff/pages/AdmissionCycle/CreateAdmissionCycle";
import CreateAdmissionCycleforBranchGrade from "../features/staff/pages/AdmissionCycle/CreateAdmissionCycleforBranchGrade";
// ***************************************************************************************************

// ********************************** Fees Cycle ***************************************************
import FeesCategory from "../features/staff/pages/Fees/FeesCategory";
import FeesHead from "../features/staff/pages/Fees/FeesHead";
import BankAccount from "../features/staff/pages/Fees/BankAccount";
import FeesBankMapping from "../features/staff/pages/Fees/FeesBankMapping";
import FeeStructureType from "../features/staff/pages/Fees/FeeStructureType";
import FeeStructure from "../features/staff/pages/Fees/FeeStructure";
import FeesDueDates from "../features/staff/pages/Fees/FeesDueDates";
import CreateLateFeePolicy from "../features/staff/pages/Fees/CreateLateFeePolicy";
import CreateLateFeeMapping from "../features/staff/pages/Fees/CreateLateFeeMapping";
import AssignFeetoStrudent from "../features/staff/pages/Fees/AssignFeetoStrudent";
import CampusPaymentConfig from "../features/staff/pages/Fees/CampusPaymentConfig";
import StudentPaymentPreference from "../features/staff/pages/Fees/StudentPaymentPreference";
import StudentsPreviewforNACH from "../features/staff/pages/Fees/StudentsPreviewforNACH";
import CreateNachBatch from "../features/staff/pages/Fees/CreateNachBatch";


import FeesConfigurationGuide from "../features/staff/pages/FeesConfiguration/FeesConfigurationGuide";
import FeeMasterManager from "../features/staff/pages/FeesConfiguration/FeeMasterManager";
import FeeStructureAndDueDates from "../features/staff/pages/FeesConfiguration/FeeStructureAndDueDates";
import FeePolicyAndMapping from "../features/staff/pages/FeesConfiguration/FeePolicyAndMapping";
import CampusPaymentConfiguration from "../features/staff/pages/FeesConfiguration/CampusPaymentConfiguration";
import StudentPaymentPreferences from "../features/staff/pages/FeesConfiguration/StudentPaymentPreferences";
import NACHUnifiedManager from "../features/staff/pages/FeesConfiguration/NACHUnifiedManager";
import FeePaymentCard from "../features/staff/pages/FeesConfiguration/FeePaymentCard";
import PaymentPreferenceManager from "../features/staff/pages/FeesConfiguration/PaymentPreferenceManager";
import LateFeeManager from "../features/staff/pages/FeesConfiguration/LateFeeManager";
// ***************************************************************************************************


// ********************************** Academic Setup ***************************************************
import AcademicSetupGuide from "../features/staff/pages/BranchConfiguration/AcademicSetupGuide";
import CreateBoard from "../features/staff/pages/BranchConfiguration/CreateBoard";
import CreateMedium from "../features/staff/pages/BranchConfiguration/CreateMedium";
import AcademicLevel from "../features/staff/pages/BranchConfiguration/AcademicLevel";
import CreateBranchConfiguration from "../features/staff/pages/BranchConfiguration/CreateBranchConfiguration";
import CreateAcademicYear from "../features/staff/pages/BranchConfiguration/CreateAcademicYear";
import CreateAcademicYearConfiguration from "../features/staff/pages/BranchConfiguration/CreateAcademicYearConfiguration";
import FullConfigurationStructure from "../features/staff/pages/BranchConfiguration/FullConfigurationStructure";
// ***************************************************************************************************


import StudentAdmission from "../features/staff/pages/StudentAdmission/StudentAdmission";
import StudentEnquiry from "../features/staff/pages/StudentAdmission/StudentEnquiry";
import StaffDashboard from "../features/staff/pages/StaffDashboard";
import AdmissionDashboard from "../features/staff/pages/StudentAdmission/AdmissionDashboard";
// import AdminStaffManagement from "../features/staff/pages/Campuses/AdminStaffManagement";
import StudentDashboard from "../features/student/pages/Dashboard";
import InquiryPanel from "../features/staff/pages/StudentAdmission/InquiryPanel";

// Admission Approval Workflow
import StudentProfile from "../features/staff/pages/AdmissionApproval/StudentProfile";
import StudentList from "../features/staff/pages/AdmissionApproval/StudentList";
import DocumentConfiguration from "../features/staff/pages/DocumentManagement/DocumentConfiguration";
import DocumentMaster from "../features/staff/pages/DocumentManagement/DocumentMaster";

const StaffRouter = () => {
  const { superAdmin } = useSelector((state) => state.campus);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    dispatch(fetchUserCampuses());
  }, [dispatch]);

  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route element={<StaffLayout />}>
        <Route index element={<Navigate to={superAdmin ? "dashboard" : "staffdashboard"} replace />} />

          {/* Dashboards */}
          {superAdmin ? (
            <>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="admindashboard" element={<AdminDashboard />} />
            </>
          ) : (
            <Route path="staffdashboard" element={<StaffDashboard />} />
          )}

          <Route path="UserProfile" element={<UserProfile />} />

          {/* ********************* Campuses ********************* */}
          {/* Campuses */}
          <Route
            path="campus/create-campus"
            element={
              superAdmin ? (
                <CreateCampus />
              ) : (
                <PermissionRoute requiredPermission="CAMPUS_VIEW">
                  <CreateCampus/>
                </PermissionRoute>
              )
            }
          />

           {/* Display staff 2 */}
           <Route
            path="managestaff/displaystaff2"
            element={
              superAdmin ? (
                <Displaystaff2/>
              ) : (
                <PermissionRoute requiredPermission="CAMPUS_VIEW">
                  <Displaystaff2 />
                </PermissionRoute>
              )
            }
          />

          {/* Display Management */}
          {/* <Route
            path="managestaff/displaystaff"
            element={
              superAdmin ? (
                <DisplayStaff/>
              ) : (
                <PermissionRoute requiredPermission="CAMPUS_VIEW">
                  <DisplayStaff />
                </PermissionRoute>
              )
            }
          />
          {/* Assign Roles to staff */}
          {/* <Route
            path="managestaff/assignrolestostaff"
            element={
              superAdmin ? (
                <AssignRolestostaff/>
              ) : (
                <PermissionRoute requiredPermission="CAMPUS_VIEW">
                  <AssignRolestostaff />
                </PermissionRoute>
              )
            }
          />  */}
          
           {/* Create Staff Management */}
          <Route
            path="managestaff/createstaff"
            element={
              superAdmin ? (
                <CreateStaff/>
              ) : (
                <PermissionRoute requiredPermission="CAMPUS_VIEW">
                  <CreateStaff />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="globalroles/create-role"
            element={<CreateRole />}
          />
          <Route path="globalroles/view-role" element={<ViewRole />} />
          <Route path="globalroles/edit-role/:id" element={<EditRole />} />

          <Route
            path="campusroles/createcampusroles"
            element={
              superAdmin ? (
                <CreateCampusRole />
              ) : (
                <PermissionRoute requiredPermission="CAMPUS_VIEW">
                  <CreateCampusRole />
                </PermissionRoute>
              )
            }
          />

                    {/* View Campus Roles */}
                    <Route
            path="campusroles/viewcampusroles"
            element={
              superAdmin ? (
                <ViewCampusRole />
              ) : (
                <PermissionRoute requiredPermission="CAMPUS_VIEW">
                  <ViewCampusRole />
                </PermissionRoute>
              )
            }
          />
          {/* Edit Campus Role */}
          <Route
            path="campusroles/editcampusrole/:campusId/:id"
            element={
              superAdmin ? (
                <EditCampusRole />
              ) : (
                <PermissionRoute requiredPermission="CAMPUS_VIEW">
                  <EditCampusRole />
                </PermissionRoute>
              )
            }
          />

          {/* ********************* Academic Setup ********************* */}

          

          {/* ********************* Admission Cycle ********************* */}
          <Route
            path="admissioncycle/Create-Admission-Cycle"
            element={
              superAdmin ? (
                <CreateAdmissionCycle />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <CreateAdmissionCycle />
                </PermissionRoute>
              )
            }
          />
          <Route
            path="admissioncycle/create-admission-cycle-for-branchGrade"
            element={
              superAdmin ? (
                <CreateAdmissionCycleforBranchGrade />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <CreateAdmissionCycleforBranchGrade />
                </PermissionRoute>
              )
            }
          />

          {/* ********************* Fees Cycle ********************* */}

          <Route
            path="feescycle/add-fees-category"
            element={
              superAdmin ? (
                <FeesCategory />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <FeesCategory />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="feescycle/create-fees-head"
            element={
              superAdmin ? (
                <FeesHead />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <FeesHead />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="feescycle/bank-account"
            element={
              superAdmin ? (
                <BankAccount />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <BankAccount />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="feescycle/fees-bank-mapping"
            element={
              superAdmin ? (
                <FeesBankMapping />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <FeesBankMapping />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="feescycle/fee-structure-type"
            element={
              superAdmin ? (
                <FeeStructureType />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <FeeStructureType />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="feescycle/fee-structure"
            element={
              superAdmin ? (
                <FeeStructure />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <FeeStructure />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="feescycle/fees-due-dates"
            element={
              superAdmin ? (
                <FeesDueDates />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <FeesDueDates />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="feescycle/create-late-fee-policy"
            element={
              superAdmin ? (
                <CreateLateFeePolicy />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <CreateLateFeePolicy />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="feescycle/create-late-fee-mapping"
            element={
              superAdmin ? (
                <CreateLateFeeMapping />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <CreateLateFeeMapping />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="feescycle/assign-fee-to-strudent"
            element={
              superAdmin ? (
                <AssignFeetoStrudent />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <AssignFeetoStrudent />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="feescycle/campus-payment-config"
            element={
              superAdmin ? (
                <CampusPaymentConfig />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <CampusPaymentConfig />
                </PermissionRoute>
              )
            }
          />
          
          <Route
            path="feescycle/student-payment-preference"
            element={
              superAdmin ? (
                <StudentPaymentPreference />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <StudentPaymentPreference />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="feescycle/students-preview-for-NACH"
            element={
              superAdmin ? (
                <StudentsPreviewforNACH />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <StudentsPreviewforNACH />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="feescycle/create-nach-batch"
            element={
              superAdmin ? (
                <CreateNachBatch />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <CreateNachBatch />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="FeesConfiguration/FeesConfigurationGuide"
            element={
              superAdmin ? (
                <FeesConfigurationGuide />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <FeesConfigurationGuide />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="FeesConfiguration/FeeMasterManager"
            element={
              superAdmin ? (
                <FeeMasterManager />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <FeeMasterManager />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="FeesConfiguration/FeeStructureAndDueDates"
            element={
              superAdmin ? (
                <FeeStructureAndDueDates />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <FeeStructureAndDueDates />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="FeesConfiguration/FeePolicyAndMapping"
            element={
              superAdmin ? (
                <FeePolicyAndMapping />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <FeePolicyAndMapping />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="FeesConfiguration/CampusPaymentConfiguration"
            element={
              superAdmin ? (
                <CampusPaymentConfiguration />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <CampusPaymentConfiguration />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="FeesConfiguration/StudentPaymentPreferences"
            element={
              superAdmin ? (
                <StudentPaymentPreferences />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <StudentPaymentPreferences />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="FeesConfiguration/NACHUnifiedManager"
            element={
              superAdmin ? (
                <NACHUnifiedManager />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <NACHUnifiedManager />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="FeesConfiguration/FeePaymentCard"
            element={
              superAdmin ? (
                <FeePaymentCard />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <FeePaymentCard />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="FeesConfiguration/PaymentPreferenceManager"
            element={
              superAdmin ? (
                <PaymentPreferenceManager />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <PaymentPreferenceManager />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="FeesConfiguration/LateFeeManager"
            element={
              superAdmin ? (
                <LateFeeManager />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <LateFeeManager />
                </PermissionRoute>
              )
            }
          />



          {/* ********************* Academic Setup ********************* */}

          <Route
            path="AcademicSetup/Academic-Setup-Guide"
            element={
              superAdmin ? (
                <AcademicSetupGuide />
              ) : (
                <PermissionRoute requiredPermission="create_board">
                  <AcademicSetupGuide />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="AcademicSetup/create-board"
            element={
              superAdmin ? (
                <CreateBoard />
              ) : (
                <PermissionRoute requiredPermission="create_board">
                  <CreateBoard />
                </PermissionRoute>
              )
            }
          />
          <Route
            path="AcademicSetup/create-medium"
            element={
              superAdmin ? (
                <CreateMedium />
              ) : (
                <PermissionRoute requiredPermission="create_board">
                  <CreateMedium />
                </PermissionRoute>
              )
            }
          />
          <Route
            path="AcademicSetup/academic-level"
            element={
              superAdmin ? (
                <AcademicLevel />
              ) : (
                <PermissionRoute requiredPermission="create_board">
                  <AcademicLevel />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="AcademicSetup/create-branch-configuration"
            element={
              superAdmin ? (
                <CreateBranchConfiguration />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <CreateBranchConfiguration />
                </PermissionRoute>
              )
            }
          />
          
          <Route
            path="AcademicSetup/create-academic-year"
            element={
              superAdmin ? (
                <CreateAcademicYear />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <CreateAcademicYear />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="AcademicSetup/create-academic-year-configuration"
            element={
              superAdmin ? (
                <CreateAcademicYearConfiguration />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <CreateAcademicYearConfiguration />
                </PermissionRoute>
              )
            }
          />

          <Route
            path="AcademicSetup/full-configuration-structure"
            element={
              superAdmin ? (
                <FullConfigurationStructure />
              ) : (
                <PermissionRoute requiredPermission="ROLE_CREATE">
                  <FullConfigurationStructure />
                </PermissionRoute>
              )
            }
          />

          {/* Enrollment / Admission & Student */}
          <Route
            path="admission/student-enquiry-details"
            element={<InquiryPanel />}
          />
           <Route
            path="admission/student-enquiry"
            element={<StudentEnquiry />}
          />
          <Route
            path="admission/admission-dashboard"
            element={<AdmissionDashboard />}
          />
          <Route
            path="admission/student-admission"
            element={<StudentAdmission />}
          />
          
          {/* Admission Approval Workflow */}
          <Route
            path="admission/student-profile"
            element={
                <StudentProfile />
            }
          />
          <Route
            path="admission/studentlist"
            element={
                <StudentList/>
            }
          />
          
          
          {/* Document Management */}
          <Route
            path="document-management/document-config"
            element={<DocumentConfiguration />}
          />
          <Route
            path="document-management/document-master"
            element={<DocumentMaster />}
          />
          
          <Route 
            path="student/dashboard" 
            element={
              <PermissionRoute requiredPermission="ROLE_CREATE">
                <StudentDashboard />
              </PermissionRoute>
            }
          />

        </Route>
      </Route>
    </Routes>
  );
};

export default StaffRouter;
