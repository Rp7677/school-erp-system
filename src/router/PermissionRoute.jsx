import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const PermissionRoute = ({ children, requiredPermission }) => {
  const permissions = useSelector(
    (state) => state.permissions?.permissions || []
  );
  const { superAdmin } = useSelector((state) => state.campus);
  
  console.log("PermissionRoute check:", { permissions, requiredPermission, superAdmin });

  const location = useLocation();

  // Super admins bypass permission checks
  if (superAdmin) {
    return children;
  }

  // Check if user has the required permission
  if (!permissions.includes(requiredPermission)) {
    return (
      <Navigate
        to="/staffdashboard"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
};

export default PermissionRoute;
