// import { createSlice } from "@reduxjs/toolkit";

// const colorSlice = createSlice({
//   name: "color",
//   initialState: {
//     mode: "light",
//     bgColor: "#FDFBF7",
//   },
//   reducers: {
//     changeColor: (state, action) => {
//       state.bgColor = action.payload;
//     },
    
//     setThemeMode: (state, action) => {
//       const newMode = action.payload;
//       state.mode = newMode;
      
//       if (newMode === "dark") {
//         state.bgColor = "#0A0A0A"; 
//       } else {
//         state.bgColor = "#FDFBF7";
//       }
//     },

//     toggleTheme: (state) => {
//       if (state.mode === "light") {
//         state.mode = "dark";
//         state.bgColor = "#0A0A0A";
//       } else {
//         state.mode = "light";
//         state.bgColor = "#FDFBF7";
//       }
//     }
//   }
// });

// export const { changeColor, setThemeMode, toggleTheme } = colorSlice.actions;
// export default colorSlice.reducer;


import { createSlice } from "@reduxjs/toolkit";

/**
 * Helper to sync the HTML class with the theme mode.
 * This ensures Tailwind's dark: classes and your custom scrollbar styles work.
 */
const updateDOM = (mode) => {
  if (typeof window !== "undefined") {
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
};

// Initialize state from LocalStorage to prevent "Theme Reset" on refresh
const savedTheme = localStorage.getItem("theme") || "light";
const savedBg = localStorage.getItem("bgColor") || (savedTheme === "dark" ? "#0A0A0A" : "#FDFBF7");

// Apply the class immediately on load
updateDOM(savedTheme);

const colorSlice = createSlice({
  name: "color",
  initialState: {
    mode: savedTheme,
    bgColor: savedBg,
  },
  reducers: {
    changeColor: (state, action) => {
      state.bgColor = action.payload;
      localStorage.setItem("bgColor", action.payload);
    },

    setThemeMode: (state, action) => {
      const newMode = action.payload;
      state.mode = newMode;
      
      // Automatic background switching
      if (newMode === "dark") {
        state.bgColor = "#0A0A0A";
      } else {
        state.bgColor = "#FDFBF7";
      }

      // Persist to LocalStorage
      localStorage.setItem("theme", newMode);
      localStorage.setItem("bgColor", state.bgColor);
      
      // Update the <html> tag for Tailwind
      updateDOM(newMode);
    },

    toggleTheme: (state) => {
      const nextMode = state.mode === "light" ? "dark" : "light";
      
      state.mode = nextMode;
      state.bgColor = nextMode === "dark" ? "#0A0A0A" : "#FDFBF7";

      // Persist & Sync
      localStorage.setItem("theme", nextMode);
      localStorage.setItem("bgColor", state.bgColor);
      updateDOM(nextMode);
    }
  }
});

export const { changeColor, setThemeMode, toggleTheme } = colorSlice.actions;
export default colorSlice.reducer;