import { Routes, Route, Navigate } from "react-router-dom";
import StaffRouter from "./StaffRouter";
// import StudentRouter from "./StudentRouter";

//Login skeleton Imports
import { lazy,Suspense } from "react";
import Loginskeleton from ".././components/common/LoginSkeleton";
import LoginSkeleton from ".././components/common/LoginSkeleton";

const LoginPage = lazy(()=>import("../features/auth/pages/LoginPage") )
const ResetPassword = lazy(()=>import("../features/auth/pages/ResetPassword") )

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={ <Suspense fallback={<Loginskeleton />}><LoginPage /></Suspense>} />
      <Route path="/reset-password" element={ <Suspense fallback={<Loginskeleton />}><ResetPassword /></Suspense>} />
      <Route path="/" element={<Suspense fallback={<LoginSkeleton />}><Navigate to="/login" replace /></Suspense>} />

      <Route path="/staff/*" element={<StaffRouter />} />

      {/* <Route path="/student/*" element={<StudentRouter />} /> */}

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRouter;
