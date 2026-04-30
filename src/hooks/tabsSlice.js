// import { createSlice } from "@reduxjs/toolkit";

// const initialState = {
//   tabs: JSON.parse(localStorage.getItem("activeTabs")) || [],
//   activePath: localStorage.getItem("activePath") || null,
// };

// const tabsSlice = createSlice({
//   name: "tabs",
//   initialState,
//   reducers: {
//     openTab: (state, action) => {
//       const { path, label } = action.payload;
//       if (!state.tabs.find((t) => t.path === path)) {
//         state.tabs.push({ path, label });
//       }
//       state.activePath = path;
//       localStorage.setItem("activeTabs", JSON.stringify(state.tabs));
//       localStorage.setItem("activePath", path);
//     },
//     closeTab: (state, action) => {
//       const pathToRemove = action.payload;
//       const index = state.tabs.findIndex((t) => t.path === pathToRemove);
//       state.tabs = state.tabs.filter((t) => t.path !== pathToRemove);

//       if (state.activePath === pathToRemove) {
//         const nextTab = state.tabs[index - 1] || state.tabs[0];
//         state.activePath = nextTab ? nextTab.path : null;
//       }
      
//       localStorage.setItem("activeTabs", JSON.stringify(state.tabs));
//       localStorage.setItem("activePath", state.activePath);
//     },
//     setActiveTab: (state, action) => {
//       state.activePath = action.payload;
//       localStorage.setItem("activePath", action.payload);
//     },
//     clearTabs: (state) => {
//       state.tabs = [];
//       state.activePath = null;
//       localStorage.removeItem("activeTabs");
//       localStorage.removeItem("activePath");
//     },
//   },
// });

// export const { openTab, closeTab, setActiveTab, clearTabs } = tabsSlice.actions;
// export default tabsSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  tabs: [],
  activePath: null,
};

const tabsSlice = createSlice({
  name: "tabs",
  initialState,
  reducers: {
    openTab: (state, action) => {
      const { path, label } = action.payload;

      if (!state.tabs.find((t) => t.path === path)) {
        state.tabs.push({ path, label });
      }

      state.activePath = path;
    },

    closeTab: (state, action) => {
      const pathToRemove = action.payload;
      const index = state.tabs.findIndex((t) => t.path === pathToRemove);

      state.tabs = state.tabs.filter((t) => t.path !== pathToRemove);

      if (state.activePath === pathToRemove) {
        if (state.tabs.length === 0) {
          state.activePath = null;
        } else if (index > 0) {
          state.activePath = state.tabs[index - 1].path;
        } else {
          state.activePath = state.tabs[0].path;
        }
      }
    },

    setActiveTab: (state, action) => {
      state.activePath = action.payload;
    },

    clearTabs: (state) => {
      state.tabs = [];
      state.activePath = null;
    },
  },
});

export const { openTab, closeTab, setActiveTab, clearTabs } = tabsSlice.actions;
export default tabsSlice.reducer;