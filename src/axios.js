import axios from "axios";

const axiosInstance = axios.create();

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      const message = error.response.data.message;

      if (message === "Token expired" || message === "Invalid token") {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("authToken");
        window.location.href = "./Login"; 
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
