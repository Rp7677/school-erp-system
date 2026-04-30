import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import api from "../config/api";

export const fetchPermissions = createAsyncThunk(
    "permissions/fetchPermissions",
    async (campusId, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/permissions");
      console.log(data.permissions + "data");
      return data.permissions;
    } catch (err) {
      return rejectWithValue("Failed to fetch permissions");
    }
  }
);

const initialState = {
    permissions: [],
    loading: false,
    error: null,
};

const permissionsSlice = createSlice({
    name:"permissions",
    initialState,
    reducers:{clearPermissions:(state) =>{
        state.permissions = [];
    }},
    extraReducers:(builder) =>{
        builder
        .addCase(fetchPermissions.pending, (state) =>{
            state.loading = true;
        })
        .addCase(fetchPermissions.fulfilled, (state, action) =>{
            state.loading = false;
            state.permissions = action.payload;
        })
        .addCase(fetchPermissions.rejected, (state, action) =>{
            state.loading = false;
            state.error = action.payload;
        });
    }
});

export const { clearPermissions } = permissionsSlice.actions;
export default permissionsSlice.reducer;
