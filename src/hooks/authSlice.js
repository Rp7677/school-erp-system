// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import api from "../config/api";

// export const loginUser = createAsyncThunk(
//   "auth/loginUser",
//   async (payload, { rejectWithValue }) => {
//     try {
//       const { data } = await api.post("/auth/login", payload);

//       localStorage.setItem("token", data.token);
//       localStorage.setItem("role", data.role);
//       localStorage.setItem("user_id", data.user_id);

//       return data;
//     } catch (err) {
//       return rejectWithValue("Invalid credentials");
//     }
//   }
// );

// const initialState = {
//   loading: false,
//   token: localStorage.getItem("token"),
//   role: localStorage.getItem("role"),
//   user_id: localStorage.getItem("user_id"),
//   error: null,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     logout: (state) => {
//       localStorage.clear();
//       state.token = null;
//       state.role = null;
//       state.user_id = null;
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(loginUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.loading = false;
//         state.token = action.payload.token;
//         state.role = action.payload.role;
//         state.user_id = action.payload.user_id;
//       })
//       .addCase(loginUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { logout } = authSlice.actions;
// export default authSlice.reducer;


// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import api from "../config/api";

// export const loginUser = createAsyncThunk(
//   "auth/loginUser",
//   async (payload, { rejectWithValue }) => {
//     try {
//       const { data } = await api.post("/auth/login", payload);
//       return data; // ⬅️ NO localStorage here
//     } catch (err) {
//       return rejectWithValue("Invalid credentials");
//     }
//   }
// );

// const initialState = {
//   loading: false,
//   token: localStorage.getItem("token"),
//   role: localStorage.getItem("role"),
//   user_id: localStorage.getItem("user_id"),
//   passwordResetRequired:
//     JSON.parse(localStorage.getItem("passwordResetRequired")) || false,
//   error: null,
// };


// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     logout: (state) => {
//       localStorage.clear();
//       state.token = null;
//       state.role = null;
//       state.user_id = null;
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(loginUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.loading = false;
      
//         const {
//           token,
//           activeRole,
//           userId,
//           passwordResetRequired,
//         } = action.payload;
      
//         state.token = token;
//         state.role = activeRole;
//         state.user_id = userId;
//         state.passwordResetRequired = false;
      
//         localStorage.setItem("token", token);
//         localStorage.setItem("role", activeRole);
//         localStorage.setItem("user_id", userId);
//         localStorage.setItem(
//           "passwordResetRequired",
//           JSON.stringify(passwordResetRequired)
//         );
//       })      
//       .addCase(loginUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { logout } = authSlice.actions;
// export default authSlice.reducer;

// =====================================================================================
// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import api from "../config/api";

// export const loginUser = createAsyncThunk(
//   "auth/loginUser",
//   async (payload, { rejectWithValue }) => {
//     try {
//       // payload contains { identifier, password, user_type }
//       const { data } = await api.post("/auth/login", payload);
      
//       // We combine the API response with the user_type from the request
//       // so the app knows if this is a STAFF or STUDENT session.
//       return { ...data, role: payload.user_type };
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || "Invalid credentials");
//     }
//   }
// );

// export const resetPassword = createAsyncThunk(
//   "auth/resetPassword",
//   async (payload, { rejectWithValue }) => {
//     try {
//       const { data } = await api.post("/auth/reset-password", payload); 
//       return data; 
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || "Password reset failed");
//     }
//   }
// );

// const initialState = {
//   loading: false,
//   token: localStorage.getItem("token"),
//   role: localStorage.getItem("role"),
//   user_id: localStorage.getItem("user_id"),
//   passwordResetRequired: JSON.parse(localStorage.getItem("passwordResetRequired")) || false,
//   error: null,
//   successMessage: null,
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     logout: (state) => {
//       localStorage.clear();
//       state.token = null;
//       state.role = null;
//       state.user_id = null;
//       state.error = null;
//       state.passwordResetRequired = false;
//     },
//     clearError: (state) => {
//         state.error = null;
//         state.successMessage = null;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(loginUser.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         const { token, userId, passwordResetRequired, role } = action.payload;
      
//         state.loading = false;
//         state.token = token;
//         state.role = role;
//         state.user_id = userId;
//         state.passwordResetRequired = passwordResetRequired;
      
//         localStorage.setItem("token", token);
//         localStorage.setItem("role", role);
//         localStorage.setItem("user_id", userId);
//         localStorage.setItem("passwordResetRequired", JSON.stringify(passwordResetRequired));
//       })      
//       .addCase(loginUser.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       .addCase(resetPassword.fulfilled, (state, action) => {
//         state.loading = false;
//         state.successMessage = action.payload.message;
//         if (action.payload.logout) {
//             localStorage.clear();
//             return initialState;
//         }
//         state.passwordResetRequired = false;
//         localStorage.setItem("passwordResetRequired", JSON.stringify(false));
//       })
//   },
// });

// export const { logout, clearError } = authSlice.actions;
// export default authSlice.reducer;




import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../config/api";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/login", payload);
      return { ...data, role: payload.user_type };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Invalid credentials");
    }
  }
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/auth/reset-password", payload);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Password reset failed");
    }
  }
);

const initialState = {
  loading: false,
  token: localStorage.getItem("token"),
  role: localStorage.getItem("role"),
  user_id: localStorage.getItem("user_id"),
  passwordResetRequired: JSON.parse(localStorage.getItem("passwordResetRequired")) || false,
  error: null,
  successMessage: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.clear();
      state.token = null;
      state.role = null;
      state.user_id = null;
      state.error = null;
      state.passwordResetRequired = false;
      state.successMessage = null;
    },
    clearError: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const { token, userId, passwordResetRequired, role } = action.payload;
        state.loading = false;
        state.token = token;
        state.role = role;
        state.user_id = userId;
        state.passwordResetRequired = passwordResetRequired;

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);
        localStorage.setItem("user_id", userId);
        localStorage.setItem("passwordResetRequired", JSON.stringify(passwordResetRequired));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        
        if (action.payload.logout) {
          // IMPORTANT: Clear state immediately to trigger ProtectedRoute redirect
          localStorage.clear();
          state.token = null;
          state.role = null;
          state.user_id = null;
          state.passwordResetRequired = false;
          state.successMessage = "Password reset successful. Please login again.";
        } else {
          state.successMessage = action.payload.message;
          state.passwordResetRequired = false;
          localStorage.setItem("passwordResetRequired", JSON.stringify(false));
        }
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;