import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../hooks/authSlice";
import colorReducer from "../hooks/colorSlice";
import campusReducer from "../hooks/campusSlice";
import permissionsReducer from "../hooks/permissionsSlice";
import tabsReducer from "../hooks/tabsSlice";
import themeReducer from "../hooks/themeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    campus: campusReducer,
    permissions: permissionsReducer,
    color: colorReducer,
    tabs: tabsReducer,
    theme: themeReducer,
  },
});
