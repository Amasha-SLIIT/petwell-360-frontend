import axios from "axios";

const API_URL = "http://localhost:5000/reviews"; 

// Add Review
export const addReview = async (reviewData) => {
  try {
    const response = await axios.post(API_URL, reviewData);
    return response.data;
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
};

// Get All Reviews
export const getAllReviews = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error;
  }
};

// Update Review
export const updateReview = async (id, updatedData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updatedData);
    return response.data;
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
};

// Delete Review
export const deleteReview = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`);
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};
