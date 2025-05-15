import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Grid, Paper, Button, Stepper, Step, StepLabel,
  TextField, Select, MenuItem, FormControl, InputLabel, FormHelperText,
  Card, CardContent, Divider, Chip, IconButton, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle, CircularProgress,
  FormGroup, FormControlLabel, Checkbox, Alert, Snackbar
} from '@mui/material';
import { 
  CalendarMonth, AccessTime, Pets, MedicalServices, Add, 
  ArrowForward, CheckCircle, Cancel, Save
} from '@mui/icons-material';
import { format, addMinutes, isToday, isBefore, isAfter, startOfDay } from 'date-fns';
import Header from '../Components/Header';
import Footer from '../Components/Footer';
import { useNavigate } from 'react-router-dom';
import { 
  getAvailableTimeSlots, createAppointment, getUserAppointments, 
  cancelAppointment, getUserPets, createPet 
} from '../services/appointmentService';
import '../styles/Appointments.css';

const Appointments = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [userAppointments, setUserAppointments] = useState([]);
  const [userPets, setUserPets] = useState([]);
  const [openPetDialog, setOpenPetDialog] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Date and time select options
  const [availableDates, setAvailableDates] = useState([]);

  // Form states
  const [appointmentData, setAppointmentData] = useState({
    petId: '',
    services: [],
    appointmentDate: '',
    selectedSlot: null
  });

  const [newPetData, setNewPetData] = useState({
    name: '',
    type: '',
    breed: '',
    age: '',
    weight: '',
    medicalHistory: ''
  });

  // Form validation
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    
    // Fetch user's appointments and pets
    fetchUserData();

    // Generate available dates (next 30 days)
    generateAvailableDates();
  }, [navigate]);

  const generateAvailableDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip past dates
      if (!isBefore(startOfDay(date), startOfDay(today))) {
        dates.push(date);
      }
    }
    
    setAvailableDates(dates);
  };

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const [appointmentsData, petsData] = await Promise.all([
        getUserAppointments(),
        getUserPets()
      ]);
      
      setUserAppointments(appointmentsData);
      setUserPets(petsData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      showNotification('Failed to load your data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeSlots = async (dateString) => {
    if (!dateString) return;
    
    setLoading(true);
    try {
      const slots = await getAvailableTimeSlots(dateString);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching time slots:', error);
      showNotification('Failed to load available time slots', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const dateString = e.target.value;
    
    // Reset selected slot when date changes
    setAppointmentData({
      ...appointmentData,
      appointmentDate: dateString,
      selectedSlot: null
    });
    
    // Only fetch slots if date is valid
    if (dateString) {
      fetchTimeSlots(dateString);
    } else {
      setTimeSlots([]);
    }
  };

  const handleSelectTimeSlot = (slot) => {
    setAppointmentData({
      ...appointmentData,
      selectedSlot: slot
    });
  };

  const handleServiceChange = (event) => {
    const { value, checked } = event.target;
    let updatedServices = [...appointmentData.services];
    
    if (checked) {
      updatedServices.push(value);
    } else {
      updatedServices = updatedServices.filter(service => service !== value);
    }
    
    setAppointmentData({
      ...appointmentData,
      services: updatedServices
    });
    
    // Clear validation error
    if (updatedServices.length > 0 && errors.services) {
      setErrors({
        ...errors,
        services: ''
      });
    }
  };

  const handlePetChange = (event) => {
    setAppointmentData({
      ...appointmentData,
      petId: event.target.value
    });
    
    // Clear validation error
    if (event.target.value && errors.petId) {
      setErrors({
        ...errors,
        petId: ''
      });
    }
  };

  const handleNewPetChange = (e) => {
    const { name, value } = e.target;
    setNewPetData({
      ...newPetData,
      [name]: value
    });
    
    // Clear validation error
    if (value && errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateAppointmentStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0: // Pet selection
        if (!appointmentData.petId) {
          newErrors.petId = 'Please select a pet or add a new one';
        }
        break;
      case 1: // Service selection
        if (appointmentData.services.length === 0) {
          newErrors.services = 'Please select at least one service';
        }
        break;
      case 2: // Date selection
        if (!appointmentData.appointmentDate) {
          newErrors.appointmentDate = 'Please select a date';
        }
        break;
      case 3: // Time slot selection
        if (!appointmentData.selectedSlot) {
          newErrors.selectedSlot = 'Please select an available time slot';
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateNewPetForm = () => {
    const newErrors = {};
    
    if (!newPetData.name.trim()) {
      newErrors.name = 'Pet name is required';
    }
    
    if (!newPetData.type.trim()) {
      newErrors.type = 'Pet type is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateAppointmentStep(activeStep)) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmitAppointment = async () => {
    // Final validation
    if (!validateAppointmentStep(activeStep)) {
      return;
    }
    
    setLoading(true);
    try {
      const { petId, services, selectedSlot } = appointmentData;
      
      // Find pet details
      const selectedPet = userPets.find(pet => pet._id === petId);
      
      const appointmentDetails = {
        petId,
        petName: selectedPet.name,
        petType: selectedPet.type,
        services,
        appointmentFrom: selectedSlot.from,
        appointmentTo: selectedSlot.to
      };
      
      await createAppointment(appointmentDetails);
      showNotification('Appointment booked successfully!');
      
      // Reset form and fetch updated appointments
      resetAppointmentForm();
      fetchUserData();
      
      // Go to confirmation step
      setActiveStep(4);
    } catch (error) {
      console.error('Error booking appointment:', error);
      showNotification('Failed to book appointment. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewPet = async () => {
    if (!validateNewPetForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const result = await createPet(newPetData);
      showNotification('Pet added successfully!');
      
      // Add new pet to the list and select it
      setUserPets([...userPets, result.pet]);
      setAppointmentData({
        ...appointmentData,
        petId: result.pet._id
      });
      
      // Close the dialog and reset form
      setOpenPetDialog(false);
      setNewPetData({
        name: '',
        type: '',
        breed: '',
        age: '',
        weight: '',
        medicalHistory: ''
      });
    } catch (error) {
      console.error('Error adding pet:', error);
      showNotification('Failed to add pet. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCancelDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setOpenCancelDialog(true);
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return;
    
    setLoading(true);
    try {
      await cancelAppointment(selectedAppointment._id);
      showNotification('Appointment cancelled successfully');
      
      // Update the appointments list
      fetchUserData();
      setOpenCancelDialog(false);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      showNotification('Failed to cancel appointment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetAppointmentForm = () => {
    setAppointmentData({
      petId: '',
      services: [],
      appointmentDate: '',
      selectedSlot: null
    });
    setActiveStep(0);
    setTimeSlots([]);
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box className="step-content">
            <Typography variant="h6" gutterBottom>
              Select your pet
            </Typography>
            
            {userPets.length > 0 ? (
              <FormControl fullWidth error={!!errors.petId}>
                <InputLabel id="pet-select-label">Choose Pet</InputLabel>
                <Select
                  labelId="pet-select-label"
                  id="pet-select"
                  value={appointmentData.petId}
                  label="Choose Pet"
                  onChange={handlePetChange}
                >
                  {userPets.map(pet => (
                    <MenuItem key={pet._id} value={pet._id}>
                      {pet.name} ({pet.type})
                    </MenuItem>
                  ))}
                </Select>
                {errors.petId && <FormHelperText>{errors.petId}</FormHelperText>}
              </FormControl>
            ) : (
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                You don't have any pets registered yet. Please add a pet to continue.
              </Typography>
            )}
            
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Add />}
              onClick={() => setOpenPetDialog(true)}
              sx={{ mt: 2 }}
            >
              Add New Pet
            </Button>
          </Box>
        );
      
      case 1:
        return (
          <Box className="step-content">
            <Typography variant="h6" gutterBottom>
              Select services
            </Typography>
            
            <FormControl component="fieldset" error={!!errors.services}>
              <FormGroup>
                {['OPD', 'Surgery', 'Vaccination', 'Grooming'].map((service) => (
                  <FormControlLabel
                    key={service}
                    control={
                      <Checkbox
                        checked={appointmentData.services.includes(service)}
                        onChange={handleServiceChange}
                        value={service}
                      />
                    }
                    label={service}
                  />
                ))}
              </FormGroup>
              {errors.services && <FormHelperText>{errors.services}</FormHelperText>}
            </FormControl>
          </Box>
        );
      
      case 2:
        return (
          <Box className="step-content">
            <Typography variant="h6" gutterBottom>
              Select a date
            </Typography>
            
            <FormControl fullWidth error={!!errors.appointmentDate}>
              <InputLabel id="appointment-date-label">Appointment Date</InputLabel>
              <Select
                labelId="appointment-date-label"
                id="appointment-date"
                value={appointmentData.appointmentDate}
                label="Appointment Date"
                onChange={handleDateChange}
              >
                {availableDates.map((date, index) => (
                  <MenuItem key={index} value={format(date, 'yyyy-MM-dd')}>
                    {format(date, 'EEEE, MMMM d, yyyy')}
                  </MenuItem>
                ))}
              </Select>
              {errors.appointmentDate && <FormHelperText>{errors.appointmentDate}</FormHelperText>}
            </FormControl>
          </Box>
        );
      
      case 3:
        return (
          <Box className="step-content">
            <Typography variant="h6" gutterBottom>
              Select a time slot
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                <CircularProgress />
              </Box>
            ) : timeSlots.length > 0 ? (
              <Box className="time-slots-container">
                <Grid container spacing={2}>
                  {timeSlots.map((slot, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Button
                        variant={appointmentData.selectedSlot === slot ? 'contained' : 'outlined'}
                        color={slot.available ? 'primary' : 'error'}
                        disabled={!slot.available}
                        fullWidth
                        onClick={() => handleSelectTimeSlot(slot)}
                        className="time-slot-button"
                      >
                        {format(new Date(slot.from), 'h:mm a')}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
                {errors.selectedSlot && (
                  <FormHelperText error>{errors.selectedSlot}</FormHelperText>
                )}
              </Box>
            ) : appointmentData.appointmentDate ? (
              <Typography variant="body1" color="error">
                No available slots for the selected date. Please try another date.
              </Typography>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Please select a date first to view available time slots.
              </Typography>
            )}
          </Box>
        );
      
      case 4:
        return (
          <Box className="step-content confirmation-step">
            <Typography variant="h6" gutterBottom align="center">
              Appointment Confirmed!
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <CheckCircle color="success" sx={{ fontSize: 64 }} />
            </Box>
            
            <Typography variant="body1" paragraph align="center">
              Your appointment has been successfully booked. You can view and manage your
              appointments in the "My Appointments" section below.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={resetAppointmentForm}
              >
                Book Another Appointment
              </Button>
            </Box>
          </Box>
        );
      
      default:
        return null;
    }
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

  return (
    <Box className="appointments-page">
      <Header />
      
      <Container maxWidth="lg" className="main-container">
        <Box className="page-header">
          <Typography variant="h4" component="h1">
            Appointments
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Book and manage your pet's appointments
          </Typography>
        </Box>
        
        <Grid container spacing={4}>
          {/* Appointment Booking Form */}
          <Grid item xs={12}>
            <Paper elevation={3} className="booking-form">
              <Typography variant="h5" component="h2" gutterBottom>
                Book New Appointment
              </Typography>
              
              <Stepper activeStep={activeStep} alternativeLabel className="appointment-stepper">
                <Step key="pet">
                  <StepLabel>Select Pet</StepLabel>
                </Step>
                <Step key="service">
                  <StepLabel>Select Services</StepLabel>
                </Step>
                <Step key="date">
                  <StepLabel>Select Date</StepLabel>
                </Step>
                <Step key="time">
                  <StepLabel>Select Time</StepLabel>
                </Step>
              </Stepper>
              
              <Box className="stepper-content">
                {getStepContent(activeStep)}
                
                <Box className="stepper-actions">
                  <Button
                    disabled={activeStep === 0 || activeStep === 4}
                    onClick={handleBack}
                  >
                    Back
                  </Button>
                  
                  {activeStep < 3 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                    >
                      Next
                    </Button>
                  ) : activeStep === 3 ? (
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmitAppointment}
                      disabled={loading}
                    >
                      {loading ? 'Booking...' : 'Book Appointment'}
                    </Button>
                  ) : null}
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          {/* My Appointments */}
          <Grid item xs={12}>
            <Paper elevation={3} className="my-appointments">
              <Typography variant="h5" component="h2" gutterBottom>
                My Appointments
              </Typography>
              
              {loading && userAppointments.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : userAppointments.length > 0 ? (
                <Grid container spacing={3}>
                  {userAppointments.map((appointment) => (
                    <Grid item xs={12} md={6} lg={4} key={appointment._id}>
                      <Card className="appointment-card">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="h6" component="h3">
                              {appointment.petName}
                            </Typography>
                            <Chip
                              label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              color={getAppointmentStatusColor(appointment.status)}
                              size="small"
                            />
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {appointment.petType}
                          </Typography>
                          
                          <Divider sx={{ my: 1.5 }} />
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CalendarMonth fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {format(new Date(appointment.appointmentFrom), 'MMMM d, yyyy')}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {format(new Date(appointment.appointmentFrom), 'h:mm a')} - {format(new Date(appointment.appointmentTo), 'h:mm a')}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <MedicalServices fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {appointment.services.join(', ')}
                            </Typography>
                          </Box>
                          
                          <Divider sx={{ my: 1.5 }} />
                          
                          {appointment.status === 'pending' || appointment.status === 'confirmed' ? (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Cancel />}
                              onClick={() => handleOpenCancelDialog(appointment)}
                              fullWidth
                            >
                              Cancel Appointment
                            </Button>
                          ) : null}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: 'background.paper' }}>
                  <Typography variant="body1" paragraph>
                    You don't have any appointments yet.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Use the booking form above to schedule an appointment for your pet.
                  </Typography>
                </Paper>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
      
      {/* Add Pet Dialog */}
      <Dialog
        open={openPetDialog}
        onClose={() => setOpenPetDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Pet</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Pet Name"
                name="name"
                value={newPetData.name}
                onChange={handleNewPetChange}
                fullWidth
                required
                error={!!errors.name}
                helperText={errors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required error={!!errors.type}>
                <InputLabel>Pet Type</InputLabel>
                <Select
                  name="type"
                  value={newPetData.type}
                  onChange={handleNewPetChange}
                  label="Pet Type"
                >
                  <MenuItem value="Dog">Dog</MenuItem>
                  <MenuItem value="Cat">Cat</MenuItem>
                  <MenuItem value="Bird">Bird</MenuItem>
                  <MenuItem value="Rabbit">Rabbit</MenuItem>
                  <MenuItem value="Hamster">Hamster</MenuItem>
                  <MenuItem value="Fish">Fish</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
                {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Breed"
                name="breed"
                value={newPetData.breed}
                onChange={handleNewPetChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Age (years)"
                name="age"
                type="number"
                value={newPetData.age}
                onChange={handleNewPetChange}
                fullWidth
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Weight (kg)"
                name="weight"
                type="number"
                value={newPetData.weight}
                onChange={handleNewPetChange}
                fullWidth
                InputProps={{ inputProps: { min: 0, step: 0.1 } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Medical History"
                name="medicalHistory"
                value={newPetData.medicalHistory}
                onChange={handleNewPetChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPetDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddNewPet}
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Pet'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Cancel Appointment Dialog */}
      <Dialog
        open={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
      >
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this appointment? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>No, Keep It</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleCancelAppointment}
            disabled={loading}
          >
            {loading ? 'Cancelling...' : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      <Footer />
    </Box>
  );
};

export default Appointments;
