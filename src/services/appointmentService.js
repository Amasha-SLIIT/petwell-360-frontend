import axios from 'axios';

const API_URL = 'http://localhost:5000/appointments';

// Helper to get user ID from localStorage
const getUserIdFromLocalStorage = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? (user._id || user.id) : null;
};

export const getAvailableTimeSlots = async (date) => {
  try {
    const response = await axios.get(`${API_URL}/available-slots?date=${date}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching time slots:', error);
    throw error;
  }
};

export const createAppointment = async (appointmentData) => {
  try {
    // Add userId from localStorage
    const userId = getUserIdFromLocalStorage();
    const response = await axios.post(API_URL, {
      ...appointmentData,
      userId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const editAppointment = async (id, appointmentData) => {
  try {
    const userId = getUserIdFromLocalStorage();
    const response = await axios.put(`${API_URL}/${id}`, {
      ...appointmentData,
      userId
    });
    return response.data;
  } catch (error) {
    console.error('Error editing appointment:', error);
    throw error;
  }
};
export const getUserAppointments = async () => {
  try {
    const userId = getUserIdFromLocalStorage();
    const response = await axios.get(`${API_URL}/user?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    throw error;
  }
};

export const getDoctorAppointments = async () => {
  try {
    const doctorId = getUserIdFromLocalStorage();
    const response = await axios.get(`${API_URL}/doctor?doctorId=${doctorId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor appointments:', error);
    throw error;
  }
};

export const getAppointmentDetails = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    throw error;
  }
};

export const updateAppointmentStatus = async (id, data) => {
  try {
    const doctorId = getUserIdFromLocalStorage();
    const response = await axios.put(`${API_URL}/${id}/status`, {
      ...data,
      doctorId
    });
    return response.data;
  } catch (error) {
    console.error('Error updating appointment status:', error);
    throw error;
  }
};

export const cancelAppointment = async (id) => {
  try {
    const userId = getUserIdFromLocalStorage();
    const response = await axios.put(`${API_URL}/${id}/cancel`, { userId });
    return response.data;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

export const addTreatmentHistory = async (appointmentId, data) => {
  try {
    const doctorId = getUserIdFromLocalStorage();
    const response = await axios.post(`${API_URL}/${appointmentId}/treatment`, {
      ...data,
      createdBy: doctorId
    });
    return response.data;
  } catch (error) {
    console.error('Error adding treatment history:', error);
    throw error;
  }
};

export const getTreatmentHistory = async (appointmentId) => {
  try {
    const response = await axios.get(`${API_URL}/${appointmentId}/treatment`);
    return response.data;
  } catch (error) {
    console.error('Error fetching treatment history:', error);
    throw error;
  }
};

export const getUserPets = async () => {
  try {
    const userId = getUserIdFromLocalStorage();
    const response = await axios.get(`${API_URL}/pets/user?userId=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user pets:', error);
    throw error;
  }
};

export const createPet = async (petData) => {
  try {
    const ownerId = getUserIdFromLocalStorage();
    const response = await axios.post(`${API_URL}/pets`, {
      ...petData,
      ownerId
    });
    return response.data;
  } catch (error) {
    console.error('Error creating pet:', error);
    throw error;
  }
};
