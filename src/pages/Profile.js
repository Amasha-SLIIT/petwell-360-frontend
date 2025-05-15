import React, { useState, useEffect } from "react";
import { 
  Container, Typography, TextField, Button, Box, Paper, Grid, 
  Avatar, Divider, Alert, Dialog, DialogActions, DialogContent, 
  DialogContentText, DialogTitle, CircularProgress, Tabs, Tab,
  Card, CardContent, Chip, Select, MenuItem, FormControl, InputLabel,
  FormHelperText
} from "@mui/material";
import { Pets, Event, Person, Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { format, addDays } from "date-fns";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import axios from 'axios';
import { getUserAppointments, getAvailableTimeSlots, editAppointment } from '../services/appointmentService';
import '../styles/profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  
  // New state for editing appointments
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    petId: '',
    petName: '',
    petType: '',
    services: [],
    appointmentFrom: '',
    appointmentTo: ''
  });
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [dateForSlots, setDateForSlots] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    
    // Check if we have a valid ID (could be _id or id depending on your backend)
    const userId = parsedUser._id || parsedUser.id;
    
    if (!userId) {
      console.error("No valid user ID found in stored user data");
      navigate('/login');
      return;
    }
    
    // Populate form with user data
    setFormData({
      firstName: parsedUser.firstName || '',
      lastName: parsedUser.lastName || '',
      email: parsedUser.email || '',
      address: parsedUser.address || '',
      phoneNumber: parsedUser.phoneNumber || ''
    });
    
    // Fetch latest user data from API
    fetchUserProfile(userId);
    
    // Fetch user appointments
    fetchUserAppointments();
  }, [navigate]);
  
  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true);
      // Check if userId is defined before making the request
      if (!userId) {
        console.error("User ID is undefined");
        setError('User ID is missing. Please log in again.');
        localStorage.removeItem('user'); // Clear invalid user data
        navigate('/login');
        return;
      }
      
      const response = await axios.get(`http://localhost:5000/auth/profile/${userId}`);
      
      // Update local storage with latest user data
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      
      // Update form data
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email || '',
        address: response.data.address || '',
        phoneNumber: response.data.phoneNumber || ''
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUserAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const data = await getUserAppointments();
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setError('Failed to load appointment data');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    const userId = user._id || user.id;
    if (!userId) {
      setError('User ID is missing. Please log in again.');
      setLoading(false);
      return;
    }
    
    try {
      const response = await axios.put(`http://localhost:5000/auth/profile/${userId}`, formData);
      
      // Update local storage with updated user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      setSuccess('Profile updated successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    setLoading(true);
    
    const userId = user._id || user.id;
    if (!userId) {
      setError('User ID is missing. Please log in again.');
      setLoading(false);
      setOpenDeleteDialog(false);
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/auth/profile/${userId}`);
      
      // Clear local storage and redirect to home
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete account');
      console.error("Delete error:", error);
      setOpenDeleteDialog(false);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getAppointmentStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };
  
  // New functions for editing appointments
  const handleEditAppointment = (appointment) => {
    // Set the appointment being edited
    setEditingAppointment(appointment);
    
    // Format the date from the appointment to fetch available slots
    const appointmentDate = new Date(appointment.appointmentFrom);
    const formattedDate = format(appointmentDate, 'yyyy-MM-dd');
    setDateForSlots(formattedDate);
    
    // Set initial form data with current appointment details
    setEditFormData({
      petId: appointment.petId._id,
      petName: appointment.petName,
      petType: appointment.petType,
      services: appointment.services,
      appointmentFrom: appointment.appointmentFrom,
      appointmentTo: appointment.appointmentTo
    });
    
    // Fetch available time slots for the date
    fetchAvailableSlots(formattedDate);
    
    // Open the edit dialog
    setOpenEditDialog(true);
  };
  
  const fetchAvailableSlots = async (date) => {
    try {
      setSlotsLoading(true);
      const slots = await getAvailableTimeSlots(date);
      
      // Mark the current slot as available for the appointment being edited
      if (editingAppointment) {
        const editingFrom = new Date(editingAppointment.appointmentFrom).getTime();
        const editingTo = new Date(editingAppointment.appointmentTo).getTime();
        
        slots.forEach(slot => {
          if (
            new Date(slot.from).getTime() === editingFrom && 
            new Date(slot.to).getTime() === editingTo
          ) {
            slot.available = true;
          }
        });
      }
      
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Error fetching slots:", error);
      setError('Failed to load available time slots');
    } finally {
      setSlotsLoading(false);
    }
  };
  
  const handleSlotDateChange = (e) => {
    const newDate = e.target.value;
    setDateForSlots(newDate);
    fetchAvailableSlots(newDate);
    setSelectedSlot(null);
  };
  
  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setEditFormData(prev => ({
      ...prev,
      appointmentFrom: slot.from,
      appointmentTo: slot.to
    }));
  };
  
  const handleServiceChange = (e) => {
    const { value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      services: value
    }));
  };
  
  const handleEditFormSubmit = async () => {
    try {
      setLoading(true);
      
      if (!selectedSlot) {
        setError('Please select a time slot');
        setLoading(false);
        return;
      }
      
      const updatedAppointment = await editAppointment(
        editingAppointment._id, 
        editFormData
      );
      
      setSuccess('Appointment updated successfully');
      setOpenEditDialog(false);
      
      // Refresh appointments list
      fetchUserAppointments();
    } catch (error) {
      console.error("Error updating appointment:", error);
      setError(error.response?.data?.message || 'Failed to update appointment');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return (
      <Box className="loading-container">
        <CircularProgress />
        <Typography>Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <Box className="profile-page">
      <Header />
      <Container maxWidth="lg" className="profile-container">
        <Paper elevation={3} className="profile-paper">
          <Box className="profile-header">
            <Avatar className="profile-avatar">
              {user?.firstName?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="h4" className="profile-title">
              My Profile
            </Typography>
          </Box>
          
          <Divider className="profile-divider" />
          
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            centered
            className="profile-tabs"
          >
            <Tab icon={<Person />} label="Personal Info" />
            <Tab icon={<Event />} label="Appointments" />
            <Tab icon={<Pets />} label="My Pets" />
          </Tabs>
          
          {/* Personal Info Tab */}
          {activeTab === 0 && (
            <Box className="tab-content">
              {error && <Alert severity="error" className="profile-alert">{error}</Alert>}
              {success && <Alert severity="success" className="profile-alert">{success}</Alert>}
              
              <form onSubmit={handleSubmit} className="profile-form">
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="First Name"
                      name="firstName"
                      fullWidth
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="profile-input"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Last Name"
                      name="lastName"
                      fullWidth
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="profile-input"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      fullWidth
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="profile-input"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Address"
                      name="address"
                      fullWidth
                      value={formData.address}
                      onChange={handleChange}
                      className="profile-input"
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Phone Number"
                      name="phoneNumber"
                      fullWidth
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="profile-input"
                    />
                  </Grid>
                  
                  <Grid item xs={12} className="profile-actions">
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                      disabled={loading}
                      className="update-button"
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      color="error"
                      onClick={() => setOpenDeleteDialog(true)}
                      className="delete-button"
                    >
                      Delete Account
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Box>
          )}
          
          {/* Appointments Tab */}
          {activeTab === 1 && (
            <Box className="tab-content">
              <Typography variant="h6" className="section-title">
                My Appointments
              </Typography>
              
              {error && <Alert severity="error" className="profile-alert">{error}</Alert>}
              {success && <Alert severity="success" className="profile-alert">{success}</Alert>}
              
              {appointmentsLoading ? (
                <Box className="loading-container">
                  <CircularProgress size={30} />
                  <Typography>Loading appointments...</Typography>
                </Box>
              ) : appointments.length > 0 ? (
                <Grid container spacing={3} className="appointments-container">
                  {appointments.map((appointment) => (
                    <Grid item xs={12} sm={6} md={4} key={appointment._id}>
                      <Card className="appointment-card">
                        <CardContent>
                          <Box className="appointment-header">
                            <Typography variant="h6" className="pet-name">
                              {appointment.petName}
                            </Typography>
                            <Chip
                              label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              color={getAppointmentStatusColor(appointment.status)}
                              size="small"
                              className="status-chip"
                            />
                          </Box>
                          
                          <Typography variant="body2" color="textSecondary" className="pet-type">
                            {appointment.petType}
                          </Typography>
                          
                          <Divider className="appointment-divider" />
                          
                          <Box className="appointment-details">
                            <Typography variant="body2" className="appointment-detail">
                              <strong>Date:</strong> {format(new Date(appointment.appointmentFrom), 'MMMM d, yyyy')}
                            </Typography>
                            <Typography variant="body2" className="appointment-detail">
                              <strong>Time:</strong> {format(new Date(appointment.appointmentFrom), 'h:mm a')} - {format(new Date(appointment.appointmentTo), 'h:mm a')}
                            </Typography>
                            <Typography variant="body2" className="appointment-detail">
                              <strong>Services:</strong> {appointment.services.join(', ')}
                            </Typography>
                            {appointment.doctorId && (
                              <Typography variant="body2" className="appointment-detail">
                                <strong>Doctor:</strong> {appointment.doctorId.firstName} {appointment.doctorId.lastName}
                              </Typography>
                            )}
                          </Box>
                          
                          <Divider className="appointment-divider" />
                          
                          <Box className="appointment-actions">
                            {appointment.status === 'pending' && (
                              <>
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  size="small"
                                  startIcon={<Edit />}
                                  onClick={() => handleEditAppointment(appointment)}
                                  sx={{ mr: 1 }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  onClick={() => navigate(`/appointments?id=${appointment._id}`)}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {appointment.status === 'completed' && (
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                onClick={() => navigate(`/appointments?id=${appointment._id}`)}
                                fullWidth
                              >
                                View Details
                              </Button>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box className="empty-state">
                  <Typography variant="body1" align="center">
                    You don't have any appointments yet.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/appointments')}
                    className="book-button"
                  >
                    Book an Appointment
                  </Button>
                </Box>
              )}
            </Box>
          )}
          
          {/* My Pets Tab */}
          {activeTab === 2 && (
            <Box className="tab-content">
              <Typography variant="h6" className="section-title">
                My Pets
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate('/appointments')}
                className="add-pet-button"
              >
                Add New Pet
              </Button>
              
              <Typography variant="body2" color="textSecondary" align="center">
                Manage your pets in the Appointments section
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
      
      {/* Delete Account Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        className="delete-dialog"
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="error" disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Appointment Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
        className="edit-appointment-dialog"
      >
        <DialogTitle>Edit Appointment</DialogTitle>
        <DialogContent>
          {editingAppointment ? (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="subtitle1">
                  Pet: {editingAppointment.petName} ({editingAppointment.petType})
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="services-label">Services</InputLabel>
                  <Select
                    labelId="services-label"
                    multiple
                    value={editFormData.services}
                    onChange={handleServiceChange}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    <MenuItem value="Check-up">Check-up</MenuItem>
                    <MenuItem value="Vaccination">Vaccination</MenuItem>
                    <MenuItem value="Grooming">Grooming</MenuItem>
                    <MenuItem value="Dental Care">Dental Care</MenuItem>
                    <MenuItem value="Surgery">Surgery</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Select Date"
                  type="date"
                  fullWidth
                  value={dateForSlots}
                  onChange={handleSlotDateChange}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: format(new Date(), 'yyyy-MM-dd') }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Available Time Slots
                </Typography>
                
                {slotsLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : availableSlots.length > 0 ? (
                  <Grid container spacing={1} sx={{ mt: 1 }}>
                    {availableSlots.map((slot, index) => {
                      const isSelected = selectedSlot && 
                        new Date(selectedSlot.from).getTime() === new Date(slot.from).getTime();
                      
                      return (
                        <Grid item xs={6} sm={4} md={3} key={index}>
                          <Button
                            variant={isSelected ? "contained" : "outlined"}
                            color={isSelected ? "primary" : slot.available ? "primary" : "error"}
                            disabled={!slot.available}
                            fullWidth
                            onClick={() => handleSlotSelect(slot)}
                            sx={{ mb: 1 }}
                          >
                            {format(new Date(slot.from), 'h:mm a')}
                          </Button>
                        </Grid>
                      );
                    })}
                  </Grid>
                ) : (
                  <Alert severity="info">No available slots for this date.</Alert>
                )}
                
                {availableSlots.length > 0 && !selectedSlot && (
                  <FormHelperText error>Please select a time slot</FormHelperText>
                )}
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleEditFormSubmit} 
            color="primary" 
            variant="contained"
            disabled={loading || !selectedSlot}
          >
            {loading ? 'Updating...' : 'Update Appointment'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <Footer />
    </Box>
  );
};

export default Profile;

