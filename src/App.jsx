// import React, { useEffect } from "react";
// import { useDispatch } from "react-redux";
// import AppRouter from "./router/AppRouter";
// import { logout } from "./hooks/authSlice"; // adjust path if needed

// function App() {
//   const dispatch = useDispatch();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     const role = localStorage.getItem("role");

//     if (!token || !role) {
//       dispatch(logout());
//     }
//   }, [dispatch]);

//   return <AppRouter />;
// }

// export default App;

import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import AppRouter from "./router/AppRouter";
import { logout } from "./hooks/authSlice";
import { setSelectedCampus, setIsSuperAdmin } from "./hooks/campusSlice";
import { fetchPermissions } from "./hooks/permissionsSlice";
import { clearTabs } from "./hooks/tabsSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const savedCampus = localStorage.getItem("selectedCampus");
    const isSuperAdmin = localStorage.getItem("isSuperAdmin");

    if (!token || !role) {
      dispatch(logout());
      dispatch(clearTabs()); // Clear all user tabs
      return;
    }

    // 🔥 Restore campus
    if (savedCampus) {
      dispatch(setSelectedCampus(Number(savedCampus)));
    }

    // 🔥 Restore super admin
    if (isSuperAdmin === "true") {
      dispatch(setIsSuperAdmin(true));
    }

    // 🔥 Fetch permissions only if NOT super admin
    if (savedCampus && isSuperAdmin !== "true") {
      dispatch(fetchPermissions(savedCampus));
    }


  }, [dispatch]);


  return <AppRouter />;
}

export default App;
