import React, { useState, useEffect } from 'react';
import axios from '../axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  Container,Box,Typography,Button,Paper,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Dialog,DialogTitle,DialogContent,DialogActions,
  TextField,Select,MenuItem,FormControl,InputLabel,Grid,FormHelperText,styled,Stack,Tooltip
} from '@mui/material';
import { useNavigate } from "react-router-dom";

const BASE_URL = 'http://localhost:5000/api';
//const USER_ID = '6814af430f3f336f4fbd2400';

const StyledDatePicker = styled(DatePicker)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  fontSize: theme.typography.fontSize,
  '&::placeholder': {
    color: theme.palette.text.secondary,
    opacity: 1,
    fontSize: theme.typography.fontSize,
  },
  '&:focus': {
    outline: 'none',
    borderColor: theme.palette.primary.main,
  }
}));

const AppointmentsTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [formData, setFormData] = useState({
    petId: '',
    services: '',
    appointmentFrom: '',
    appointmentTo: '',
    paymentMethod: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    amount: 0
  });

  //i added
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  //i added
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("authToken");
      if (!token){
        console.error("No auth token found. Redirecting to login.");
        navigate("/login");
        return;
      }
      
      try {
        const res = await axios.get("http://localhost:5000/auth/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.role !== "petowner") {
          alert("Access restricted to pet owners.");
          navigate("/");
          return;
        }
        setUserId(res.data.id);
      } catch (err) {
        console.error("User fetch error", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("authToken");
          navigate("/login");
        }
      }
    };
  
    fetchUser();
  }, [navigate]);
  

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        console.log("Starting to fetch data...");
        const token = localStorage.getItem("authToken");
        const [appointmentsRes, petsRes] = await Promise.all([
          axios.get(`${BASE_URL}/users/${userId}/appointments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${BASE_URL}/users/${userId}/pets`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        
        console.log('Appointments response:', appointmentsRes.data);
        console.log('Pets response:', petsRes.data);
        
        setAppointments(appointmentsRes.data);
        setPets(petsRes.data);

      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("authToken");
          navigate("/login");
        } else {
          alert(`Failed to fetch data: ${error.response?.data?.message || "Please try again."}`);
        }
      }
    };
    fetchData();
  }, [userId, navigate]);


  // Add a useEffect to monitor appointments state changes
  useEffect(() => {
    console.log('Appointments state updated:', appointments);
  }, [appointments]);

  const handleModalOpen = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const slotsRes = await axios.get(`${BASE_URL}/appointments/available-slots`, {
        headers: { Authorization: `Bearer ${token}` },
      });      
      // Sort slots by date and time
      const sortedSlots = slotsRes.data.sort((a, b) => {
        return new Date(a.from) - new Date(b.from);
      });
      console.log('Available slots:', sortedSlots); // Debug log
      setAvailableSlots(sortedSlots);
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching available slots:", error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("authToken");
        navigate("/login");
      } else {
        alert("Failed to fetch available time slots. Please try again.");
      }
    }
  };

  const formatCardNumber = (value) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    // Group into 4s
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validate card number and CVV to only accept numbers
    if (name === 'cardNumber') {
      // Remove any non-numeric characters and store only digits
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else if (name === 'cvv') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else if (name === 'expiryDate') {
      // Format expiry date as MM/YY
      let formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
      }
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleDateSelect = (date) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    setSelectedDate(localDate);
    
    // Reset selected time slot when date changes
    setSelectedTimeSlot(null);
    
    // Update form data with new date
    if (isEditMode && editingAppointment) {
      setFormData(prev => ({
        ...prev,
        appointmentFrom: '',
        appointmentTo: ''
      }));
    }
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
    setFormData(prev => ({
      ...prev,
      appointmentFrom: slot.from,
      appointmentTo: slot.to
    }));
  };

  const getAvailableDates = () => {
    const dates = new Set();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 14); // Set max date to 14 days from today
    maxDate.setHours(23, 59, 59, 999); // Set to end of the day

    availableSlots.forEach(slot => {
      if (slot.isAvailable) {
        const date = new Date(slot.from);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        localDate.setHours(0, 0, 0, 0); // Set to start of the day for comparison
        
        // Only include dates within the 14-day window
        if (localDate >= today && localDate <= maxDate) {
          dates.add(localDate.toISOString().split('T')[0]);
        }
      }
    });
    return Array.from(dates).map(date => new Date(date));
  };

  const getAvailableTimeSlots = () => {
    if (!selectedDate) return [];
    
    const selectedDateStr = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];

    console.log('Selected date:', selectedDateStr); // Debug log
    console.log('Available slots:', availableSlots); // Debug log

    const filteredSlots = availableSlots.filter(slot => {
      if (!slot.isAvailable) return false;
      
      const slotDate = new Date(slot.from);
      const localSlotDate = new Date(slotDate.getTime() - slotDate.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];
      
      console.log('Slot date:', localSlotDate); // Debug log
      
      return localSlotDate === selectedDateStr;
    });

    console.log('Filtered slots:', filteredSlots); // Debug log
    return filteredSlots;
  };

  const formatTimeSlot = (slot) => {
    const from = new Date(slot.from);
    const to = new Date(slot.to);
    return `${from.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${to.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const canEditAppointment = (appointment) => {
    const appointmentTime = new Date(appointment.appointmentFrom);
    const now = new Date();
    const hoursUntilAppointment = (appointmentTime - now) / (1000 * 60 * 60);
    return hoursUntilAppointment > 6;
  };

  const handleEditAppointment = async (appointment) => {
    if (!canEditAppointment(appointment)) {
      alert('Appointments can only be edited more than 24 hours before the scheduled time.');
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      const slotsRes = await axios.get(`${BASE_URL}/appointments/available-slots`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableSlots(slotsRes.data);
      setEditingAppointment(appointment);
      
      // Set initial form data with current appointment details
      setFormData({
        petId: appointment.petId._id,
        services: appointment.services[0],
        appointmentFrom: appointment.appointmentFrom,
        appointmentTo: appointment.appointmentTo,
        paymentMethod: "",
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        amount: 500,
      });
      
      // Set initial date and time slot
      const appointmentDate = new Date(appointment.appointmentFrom);
      setSelectedDate(appointmentDate);
      
      // Find and set the initial time slot
      const initialSlot = slotsRes.data.find(slot => 
        slot.from === appointment.appointmentFrom && 
        slot.to === appointment.appointmentTo
      );
      setSelectedTimeSlot(initialSlot);
      
      setIsEditMode(true);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error preparing edit:', error);
      alert('Failed to prepare edit. Please try again.');
    }
  };

  const isValidExpiryDate = (expiry) => {
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return { isValid: false, message: 'Invalid date format. Use MM/YY' };
    
    const [mm, yy] = expiry.split('/').map(Number);
    if (mm < 1 || mm > 12) return { isValid: false, message: 'Invalid month. Month must be between 01 and 12' };
    
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    if (yy < currentYear || (yy === currentYear && mm < currentMonth)) {
      return { isValid: false, message: 'Card has expired' };
    }
    
    return { isValid: true, message: '' };
  };

  const isFormValid = () => {
    if (isEditMode) {
      return (
        formData.petId &&
        formData.services &&
        selectedDate &&
        selectedTimeSlot
      );
    } else {
      const expiryValidation = isValidExpiryDate(formData.expiryDate);
      return (
        formData.petId &&
        formData.services &&
        selectedDate &&
        selectedTimeSlot &&
        formData.paymentMethod &&
        formData.cardNumber &&
        formData.cardNumber.length === 16 &&
        formData.cvv &&
        formData.cvv.length === 3 &&
        expiryValidation.isValid
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Starting appointment submission...');
    console.log('Form data:', formData);
    console.log('Selected time slot:', selectedTimeSlot);
    
    if (!selectedTimeSlot) {
      alert('Please select a time slot');
      return;
    }
    if (!isEditMode && !formData.paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    if (!isEditMode) {
      if (!formData.cardNumber || formData.cardNumber.length !== 16) {
        alert('Please enter a valid 16-digit card number');
        return;
      }
      const expiryValidation = isValidExpiryDate(formData.expiryDate);
      if (!expiryValidation.isValid) {
        alert(expiryValidation.message);
        return;
      }
      if (!formData.cvv || formData.cvv.length !== 3) {
        alert('Please enter a valid 3-digit CVV');
        return;
      }
    }

    try {
      const token = localStorage.getItem("authToken");
      if (isEditMode) {
        console.log('Editing existing appointment...');
        
        // Prepare the update request
        const updateRequest = {
          userId,
          petId: formData.petId,
          services: [formData.services],
          appointmentFrom: selectedTimeSlot.from,
          appointmentTo: selectedTimeSlot.to
        };

        console.log('Sending update request:', updateRequest);

      
        const updateResponse = await axios.put(`${BASE_URL}/appointments/${editingAppointment._id}`, updateRequest, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Update response:", updateResponse.data);
          
          // Fetch updated appointments list
          const appointmentsRes = await axios.get(`${BASE_URL}/users/${userId}/appointments`, {
            headers: { Authorization: `Bearer ${token}` },
          });          
          setAppointments(appointmentsRes.data);
          
          // Reset form and close modal
          setFormData({
            petId: '',
            services: '',
            appointmentFrom: '',
            appointmentTo: '',
            paymentMethod: '',
            cardNumber: '',
            expiryDate: '',
            cvv: '',
            amount: 500
          });
          setSelectedDate(null);
          setSelectedTimeSlot(null);
          setIsModalOpen(false);
          setIsEditMode(false);
          setEditingAppointment(null);
        
      } else {
        console.log('Creating new appointment...');
        const appointmentData = {
          petId: formData.petId,
          services: [formData.services],
          appointmentFrom: selectedTimeSlot.from,
          appointmentTo: selectedTimeSlot.to,
          userId,
          payment: {
            amount: 500,
            paymentMethod: formData.paymentMethod,
            cardNumber: formData.cardNumber,
            expiryDate: formData.expiryDate,
            cvv: formData.cvv
          }
        };

        console.log("Sending appointment data:", appointmentData);
        const appointmentResponse = await axios.post(`${BASE_URL}/appointments`, appointmentData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Appointment created successfully:", appointmentResponse.data);

        console.log("Fetching updated appointments list...");
        const appointmentsRes = await axios.get(`${BASE_URL}/users/${userId}/appointments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Updated appointments:", appointmentsRes.data);
        setAppointments(appointmentsRes.data);
      }
      
      // Reset form
      setFormData({
        petId: '',
        services: '',
        appointmentFrom: '',
        appointmentTo: '',
        paymentMethod: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        amount: 500
      });
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error('Error saving appointment:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("authToken");
        navigate("/login");
      } else {
        alert(error.response?.data?.message || "Failed to save appointment. Please try again.");
      }    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingAppointment(null);
    setFormData({
      petId: '',
      services: '',
      appointmentFrom: '',
      appointmentTo: '',
      paymentMethod: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      amount: 0
    });
    setSelectedDate(null);
    setSelectedTimeSlot(null);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${BASE_URL}/appointments/${appointmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(appointments.filter(apt => apt._id !== appointmentId));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("authToken");
        navigate("/login");
      } else {
        alert("Failed to cancel appointment. Please try again.");
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Appointments
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleModalOpen}
        >
          Create Appointment
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ fontSize: '1.1rem' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600 ,color: "#fff"}}>Pet Name</TableCell>
              <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600 ,color: "#fff"}}>Service</TableCell>
              <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600 ,color: "#fff"}}>Date</TableCell>
              <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600 ,color: "#fff"}}>Time</TableCell>
              <TableCell sx={{ fontSize: '1.1rem', fontWeight: 600 ,color: "#fff"}}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ fontSize: '1.1rem' }}>
                  No appointments found
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((appointment) => {
                const fromDate = new Date(appointment.appointmentFrom);
                const toDate = new Date(appointment.appointmentTo);
                const canEdit = canEditAppointment(appointment);
                
                return (
                  <TableRow key={appointment._id}>
                    <TableCell sx={{ fontSize: '1.1rem' }}>{appointment.petId?.petName || 'N/A'}</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem' }}>{appointment.services[0]}</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem' }}>{fromDate.toLocaleDateString()}</TableCell>
                    <TableCell sx={{ fontSize: '1.1rem' }}>
                      {fromDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {toDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell sx={{ fontSize: '1.1rem' }}>
                      <Tooltip
                        title={canEdit ? '' : 'Too close! You can only edit appointments more than 6 hours in advance.'}
                        arrow
                        placement="top"
                      >
                        <span>
                          <Button
                            onClick={() => handleEditAppointment(appointment)}
                            disabled={!canEdit}
                            color={canEdit ? "primary" : "inherit"}
                            sx={{ mr: 1 }}
                          >
                            Edit
                          </Button>
                        </span>
                      </Tooltip>
                      <Button
                        onClick={() => handleDeleteAppointment(appointment._id)}
                        color="error"
                      >
                        Cancel
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={isModalOpen} 
        onClose={handleModalClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h5" sx={{ fontWeight: 500 }}>
            {isEditMode ? 'Edit Appointment' : 'Create New Appointment'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ overflow: 'auto' }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Stack spacing={3}>
              <FormControl fullWidth>
                <Typography variant="body1" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Select Pet
                </Typography>
                <Select
                  labelId="pet-label"
                  id="petId"
                  name="petId"
                  value={formData.petId}
                  onChange={handleInputChange}
                  required
                  displayEmpty
                >
                  <MenuItem value="">Select Pet</MenuItem>
                  {pets.map(pet => (
                    <MenuItem key={pet._id} value={pet._id}>{pet.petName}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <Typography variant="body1" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Select Service
                </Typography>
                <Select
                  labelId="service-label"
                  id="services"
                  name="services"
                  value={formData.services}
                  onChange={handleInputChange}
                  required
                  displayEmpty
                >
                  <MenuItem value="">Select Service</MenuItem>
                  <MenuItem value="OPD">OPD</MenuItem>
                  <MenuItem value="Surgery">Surgery</MenuItem>
                  <MenuItem value="Vaccination">Vaccination</MenuItem>
                  <MenuItem value="Grooming">Grooming</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <Typography variant="body1" sx={{ mb: 0.5, fontWeight: 500 }}>
                  Select Date
                </Typography>
                <StyledDatePicker
                  selected={selectedDate}
                  onChange={handleDateSelect}
                  includeDates={getAvailableDates()}
                  placeholderText="Select available date"
                  required
                  dateFormat="MMMM d, yyyy"
                />
              </FormControl>

              {selectedDate && (
                <FormControl fullWidth>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>Available Time Slots</Typography>
                  <Grid container spacing={1}>
                    {getAvailableTimeSlots().length > 0 ? (
                      getAvailableTimeSlots().map((slot, index) => (
                        <Grid item xs={6} key={index}>
                          <Button
                            fullWidth
                            variant={selectedTimeSlot?.from === slot.from ? "contained" : "outlined"}
                            onClick={() => handleTimeSlotSelect(slot)}
                            color={selectedTimeSlot?.from === slot.from ? "primary" : "inherit"}
                            sx={{ 
                              height: '40px',
                              textTransform: 'none',
                              fontSize: '0.875rem'
                            }}
                          >
                            {formatTimeSlot(slot)}
                          </Button>
                        </Grid>
                      ))
                    ) : (
                      <Grid item xs={12}>
                        <Typography align="center" color="text.secondary">
                          No available time slots for this date
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </FormControl>
              )}

              {!isEditMode && (
                <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>Payment Details</Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <Select
                      labelId="payment-method-label"
                      id="paymentMethod"
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                      required
                      displayEmpty
                    >
                      <MenuItem value="">Select Payment Method</MenuItem>
                      <MenuItem value="credit_card">Credit Card</MenuItem>
                      <MenuItem value="debit_card">Debit Card</MenuItem>
                    </Select>
                  </FormControl>

                  {formData.paymentMethod && (
                    <>
                      <TextField
                        fullWidth
                        label="Card Number"
                        id="cardNumber"
                        name="cardNumber"
                        value={formatCardNumber(formData.cardNumber)}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        inputProps={{ maxLength: 19 }}
                        required
                        sx={{ mb: 2 }}
                      />

                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="Expiry Date"
                            id="expiryDate"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            inputProps={{ maxLength: 5 }}
                            required
                            error={formData.expiryDate && isValidExpiryDate(formData.expiryDate).message === 'Card has expired'}
                            helperText={
                              formData.expiryDate && isValidExpiryDate(formData.expiryDate).message === 'Card has expired'
                                ? 'Card has expired'
                                : ''
                            }
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            label="CVV"
                            id="cvv"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            inputProps={{ maxLength: 3 }}
                            required
                          />
                        </Grid>
                      </Grid>

                      <TextField
                        fullWidth
                        label="Amount"
                        id="amount"
                        name="amount"
                        value={500}
                        InputProps={{ readOnly: true }}
                        sx={{ mb: 1 }}
                      />
                      <FormHelperText>
                        Advanced payment to make the appointment(500 LKR)
                      </FormHelperText>
                    </>
                  )}
                </Box>
              )}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={handleModalClose} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={!isFormValid()}
          >
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AppointmentsTable; 