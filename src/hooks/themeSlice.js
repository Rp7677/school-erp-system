import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: localStorage.getItem("themeMode") || "light",
  primaryColor: localStorage.getItem("brandColor") || "#FBCB84", 
};

export const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    toggleMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem("themeMode", state.mode);
    },
    setPrimaryColor: (state, action) => {
      state.primaryColor = action.payload;
      localStorage.setItem("brandColor", action.payload);
    },
  },
});

export const { toggleMode, setPrimaryColor } = themeSlice.actions;
export default themeSlice.reducer;