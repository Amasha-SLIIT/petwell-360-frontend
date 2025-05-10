import axios from "axios";

// Create a variable to store the setter function for the modal
let setTokenExpiredModal = null;

// Export a function to set the modal setter from components
export const setTokenExpiredModalSetter = (setter) => {
  setTokenExpiredModal = setter;
};

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});


axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      const message = error.response.data.message;

      if (message === "Token expired" || message === "Invalid token") {
        if (setTokenExpiredModal) {
          setTokenExpiredModal(true);
        } else {
          // Fallback to alert if modal setter isn't available
          alert("Your session has expired. Please log in again.");
        }
        localStorage.removeItem("authToken");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;