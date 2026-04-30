import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../features/student/pages/Dashboard";
import StudentFees from "../features/student/pages/fees/StudentFees";
import FeeDetails from "../features/student/pages/fees/FeeDetails";
import PaymentHistory from "../features/student/pages/fees/PaymentHistory";
import FeeReceipt from "../features/student/pages/fees/FeeReceipt";
import ProtectedRoute from "../components/common/ProtectedRoute";

const StudentRouter = () => {
  return (
    <Routes>
      {/* Default redirect to fees since dashboard is removed */}
      <Route path="/" element={<Navigate to="fees" replace />} />
      
      <Route
        path="dashboard"
        element={
          // <ProtectedRoute allowedRoles={["STUDENT"]}>
            <Dashboard />
          // </ProtectedRoute>
        }
      />
      <Route
        path="fees"
        element={
          // <ProtectedRoute allowedRoles={["STUDENT"]}>
            <StudentFees />
          // </ProtectedRoute>
        }
      />
      <Route
        path="fees/details/:feeId"
        element={
          // <ProtectedRoute allowedRoles={["STUDENT"]}>
            <FeeDetails />
          // </ProtectedRoute>
        }
      />
      <Route
        path="fees/payment-history"
        element={
          // <ProtectedRoute allowedRoles={["STUDENT"]}>
            <PaymentHistory />
          // </ProtectedRoute>
        }
      />
      <Route
        path="fees/receipt/:paymentId"
        element={
          // <ProtectedRoute allowedRoles={["STUDENT"]}>
            <FeeReceipt />
          // </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default StudentRouter;
