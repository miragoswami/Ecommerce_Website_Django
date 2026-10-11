import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});


// ==========================================
// 1. ADD ACCESS TOKEN TO EVERY REQUEST
// ==========================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// ==========================================
// 2. AUTOMATIC TOKEN REFRESH
// ==========================================

let isRefreshing = false;

let failedRequestsQueue = [];


// Process requests waiting for new token
const processQueue = (error, token = null) => {
  failedRequestsQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedRequestsQueue = [];
};


api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {

    const originalRequest = error.config;


    // Only handle 401 errors
    if (
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }


    // Do not refresh the refresh-token request itself
    if (
      originalRequest.url?.includes("token/refresh/")
    ) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      window.location.href = "/login";

      return Promise.reject(error);
    }


    originalRequest._retry = true;


    const refreshToken =
      localStorage.getItem("refresh_token");


    // No refresh token
    if (!refreshToken) {

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      window.location.href = "/login";

      return Promise.reject(error);
    }


    // ==========================================
    // IF ANOTHER REQUEST IS ALREADY REFRESHING
    // ==========================================

    if (isRefreshing) {

      return new Promise((resolve, reject) => {

        failedRequestsQueue.push({
          resolve,
          reject,
        });

      })
        .then((newAccessToken) => {

          originalRequest.headers.Authorization =
            `Bearer ${newAccessToken}`;

          return api(originalRequest);

        });
    }


    // ==========================================
    // START TOKEN REFRESH
    // ==========================================

    isRefreshing = true;


    try {

      // Use axios directly here.
      // Do not use api.post() here.

      const response = await axios.post(
        "http://127.0.0.1:8000/api/token/refresh/",
        {
          refresh: refreshToken,
        }
      );


      const newAccessToken =
        response.data.access;


      // Save new access token
      localStorage.setItem(
        "access_token",
        newAccessToken
      );


      // Save new refresh token if backend sends one
      if (response.data.refresh) {

        localStorage.setItem(
          "refresh_token",
          response.data.refresh
        );

      }


      // Give new token to waiting requests
      processQueue(
        null,
        newAccessToken
      );


      // Retry original request
      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);


    } catch (refreshError) {

      processQueue(
        refreshError,
        null
      );


      // Refresh token is invalid/expired
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");

      window.location.href = "/login";

      return Promise.reject(refreshError);


    } finally {

      isRefreshing = false;

    }

  }
);


export default api;