import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080"
  // ,
  // headers: {
  //   "Content-Type": "application/json",
  // },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const campusId = localStorage.getItem("selectedCampus");
    const isSuperAdmin = localStorage.getItem("superAdmin") === "true";

    console.log('Request config:', config.url, {
      hasToken: !!token,
      campusId,
      isSuperAdmin
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't set Content-Type for FormData - let browser set it automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Send campusId ONLY if not superAdmin
    if (!isSuperAdmin && campusId) {
      config.headers["X-Campus-Id"] = campusId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;