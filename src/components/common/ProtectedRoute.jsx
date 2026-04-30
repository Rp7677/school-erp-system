// import { Navigate } from "react-router-dom";
// import { useSelector } from "react-redux";

// const ProtectedRoute = ({ allowedRoles, children }) => {
//   const { token, role, passwordResetRequired } = useSelector(
//     (state) => state.auth
//   );

//   console.log("ProtectedRoute", {
//     token,
//     role,
//     passwordResetRequired,
//   });
  

//   // 1️⃣ Not logged in
//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   // 2️⃣ Force password reset (BLOCK EVERYTHING)
//   if (passwordResetRequired) {
//     return <Navigate to="/reset-password" replace />;
//   }

//   // 3️⃣ Role-based protection
//   if (allowedRoles && !allowedRoles.includes(role)) {
//     return <Navigate to="/login" replace />;
//   }

//   // 4️⃣ Access granted
//   return children;
// };

// export default ProtectedRoute;

// import { Navigate, Outlet } from "react-router-dom";
// import { useSelector } from "react-redux";

// const ProtectedRoute = ({ allowedRoles }) => {
//   const { token, role, passwordResetRequired } = useSelector(
//     (state) => state.auth
//   );

//   console.log("ProtectedRoute", { token, role, passwordResetRequired });

//   // 1️⃣ Not logged in
//   if (!token) {
//     return <Navigate to="/login" replace />;
//   }

//   // 2️⃣ Force password reset (block everything)
//   if (passwordResetRequired) {
//     return <Navigate to="/reset-password" replace />;
//   }

//   // 3️⃣ Role-based protection
//   if (allowedRoles && !allowedRoles.includes(role)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   // 4️⃣ Access granted
//   return <Outlet />;
// };

// export default ProtectedRoute;

// import { Navigate, Outlet } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { useEffect, useState } from "react";
// import { logout } from "../../hooks/authSlice";

// const ProtectedRoute = ({ allowedRoles }) => {
//   const dispatch = useDispatch();
//   const { token, role, passwordResetRequired } = useSelector(
//     (state) => state.auth
//   );

//   const [forceLogout, setForceLogout] = useState(false);

//   useEffect(() => {
//     // Token missing or role missing → logout
//     if (!token || !role) {
//       dispatch(logout());
//       setForceLogout(true);
//     }

//     // Role mismatch → logout
//     if (allowedRoles && role && !allowedRoles.includes(role)) {
//       dispatch(logout());
//       setForceLogout(true);
//     }
//   }, [token, role, allowedRoles, dispatch]);


//   if (forceLogout) {
//     return <Navigate to="/login" replace />;
//   }

//   if (passwordResetRequired) {
//     return <Navigate to="/reset-password" replace />;
//   }

//   return <Outlet />;
// };

// export default ProtectedRoute;

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ allowedRoles }) => {
  const { token, role, passwordResetRequired } = useSelector(
    (state) => state.auth
  );
  const location = useLocation();

  // 1. Check if user is logged in
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check if password reset is forced 
  // (Don't redirect if they are already on the reset page)
  if (passwordResetRequired && location.pathname !== "/reset-password") {
    return <Navigate to="/reset-password" replace />;
  }

  // 3. Check for Role Authorization
  if (allowedRoles && !allowedRoles.includes(role)) {
    // If user doesn't have permission, kick to login or an unauthorized page
    return <Navigate to="/login" replace />;
  }

  // 4. Authorized: Render the child routes
  return <Outlet />;
};

export default ProtectedRoute;