import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../config/api";

export const fetchUserCampuses = createAsyncThunk(
  "campus/fetchUserCampuses",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/api/user-context");
      return data;
    } catch (err) {
      return rejectWithValue("Failed to fetch campuses");
    }
  }
);

const initialState = {
  campuses: [],
  superAdmin: localStorage.getItem("isSuperAdmin") === "true" || false,
  loading: false,
  error: null,
  selectedCampus: localStorage.getItem("selectedCampus") || null,
};

const campusSlice = createSlice({
  name: "campus",
  initialState,
  reducers: {
    setSelectedCampus: (state, action) => {
      state.selectedCampus = action.payload;
      localStorage.setItem("selectedCampus", action.payload);
    },

    setIsSuperAdmin: (state, action) => {
      state.superAdmin = action.payload;
      localStorage.setItem("isSuperAdmin", action.payload);
    },

    clearCampuses: () => initialState
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserCampuses.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserCampuses.fulfilled, (state, action) => {
        state.loading = false;
        state.campuses = action.payload.campuses || [];
        state.superAdmin = action.payload.superAdmin || false;

        localStorage.setItem("superAdmin", state.superAdmin);

        if (!state.selectedCampus && action.payload.campuses?.length > 0) {
          state.selectedCampus = action.payload.campuses[0].campusId;
          localStorage.setItem("selectedCampus", state.selectedCampus);
        }

      })
      .addCase(fetchUserCampuses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSelectedCampus,setIsSuperAdmin, clearCampuses } = campusSlice.actions;
export default campusSlice.reducer;
