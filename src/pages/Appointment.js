import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppointmentsTable from '../components/AppointmentsTable';
import Footer from '../components/Footer';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Grid,
  Stack
} from '@mui/material';

const USER_ID = '67de6c4e84c7f4b9cc949703';
const BASE_URL = 'http://localhost:5000/api';

const formatDateTime = (dateTimeString) => {
  try {
    let date;

    if (dateTimeString.includes('T')) {
      date = new Date(dateTimeString);
    } else {
      const isoFormattedString = dateTimeString.replace(' ', 'T');
      date = new Date(isoFormattedString);
    }

    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateTimeString);
      return {
        formatted: 'Invalid Date',
        isoDate: ''
      };
    }

    return {
      formatted: date.toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      isoDate: date.toISOString().split('T')[0]
    };
  } catch (error) {
    console.error('Error formatting date:', error);
    return {
      formatted: 'Invalid Date',
      isoDate: ''
    };
  }
};

// Pets Management
const PetManagement = () => {
  const [pets, setPets] = useState([]);
  const [newPet, setNewPet] = useState({ name: '', type: '' });
  const [selectedPet, setSelectedPet] = useState(null);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/users/${USER_ID}/pets`);
        setPets(response.data);
      } catch (error) {
        console.error('Error fetching pets:', error);
      }
    };
    fetchPets();
  }, []);

  const handleAddPet = async (e) => {
    e.preventDefault();
    // console.log(newPet)
    // if (newPet.name.find((n) => !Number.isNaN(n))) {
    //   alert('Name cannot contain numbers');
    //   return;
    // }
    // return
    try {
      const response = await axios.post(`${BASE_URL}/pets`, {
        ...newPet,
        userId: USER_ID
      });
      setPets([...pets, response.data]);
      setNewPet({ name: '', type: '' });
      window.location.reload();
    } catch (error) {
      console.error('Error adding pet:', error);
    }
  };

  const handleUpdatePet = async () => {
    try {
      await axios.put(`${BASE_URL}/pets/${selectedPet._id}`, {
        name: selectedPet.name
      });
      setPets(pets.map(pet =>
        pet._id === selectedPet._id ? selectedPet : pet
      ));
      setSelectedPet(null);
      window.location.reload();
    } catch (error) {
      console.error('Error updating pet:', error);
    }
  };

  const handleDeletePet = async (petId) => {
    console.log(petId)
    try {
      await axios.delete(`${BASE_URL}/pets/${petId}`);
      setPets(pets.filter(pet => pet._id !== petId));
      window.location.reload();
    } catch (error) {
      console.error('Error deleting pet:', error);
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Pet Management</Typography>

      <Paper component="form" onSubmit={selectedPet ? handleUpdatePet : handleAddPet} sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            placeholder="Pet Name"
            value={selectedPet ? selectedPet.name : newPet.name}
            onChange={(e) =>
              selectedPet
                ? setSelectedPet({ ...selectedPet, name: e.target.value })
                : setNewPet({ ...newPet, name: e.target.value })
            }
            required
            size="small"
          />
          {!selectedPet && (
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Pet Type</InputLabel>
              <Select
                value={newPet.type}
                onChange={(e) => setNewPet({ ...newPet, type: e.target.value })}
                label="Pet Type"
                required
              >
                <MenuItem value="">Select Pet Type</MenuItem>
                <MenuItem value="Cat">Cat</MenuItem>
                <MenuItem value="Dog">Dog</MenuItem>
              </Select>
            </FormControl>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
          >
            {selectedPet ? 'Update Pet' : 'Add Pet'}
          </Button>
          {selectedPet && (
            <Button
              type="button"
              onClick={() => setSelectedPet(null)}
              variant="contained"
              color="inherit"
            >
              Cancel
            </Button>
          )}
        </Stack>
      </Paper>

      <Stack spacing={2}>
        {pets.map(pet => (
          <Paper key={pet._id} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography>{pet.name} - {pet.type}</Typography>
              <Box>
                <Button
                  onClick={() => setSelectedPet(pet)}
                  variant="contained"
                  color="warning"
                  size="small"
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDeletePet(pet._id)}
                  variant="contained"
                  color="error"
                  size="small"
                >
                  Delete
                </Button>
              </Box>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [pets, setPets] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    petId: '',
    services: '',
    appointmentFrom: '',
    appointmentTo: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsRes, petsRes, slotsRes] = await Promise.all([
          axios.get(`${BASE_URL}/users/${USER_ID}/appointments`),
          axios.get(`${BASE_URL}/users/${USER_ID}/pets`),
          axios.get(`${BASE_URL}/appointments/available-slots`)
        ]);
        setAppointments(appointmentsRes.data);
        setPets(petsRes.data);

        const availableSlots = slotsRes.data.filter(slot => slot.isAvailable === true);
        setAvailableSlots(availableSlots);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  // Create appointment
  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BASE_URL}/appointments`, {
        ...newAppointment,
        userId: USER_ID,
        services: [newAppointment.services]
      });
      setAppointments([...appointments, response.data]);
      setNewAppointment({
        petId: '',
        services: '',
        appointmentFrom: '',
        appointmentTo: ''
      });
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Failed to create appointment. Please try again.');
    }
  };

  // Delete appointment
  const handleDeleteAppointment = async (appointmentId) => {
    try {
      await axios.delete(`${BASE_URL}/appointments/${appointmentId}`);
      setAppointments(appointments.filter(apt => apt._id !== appointmentId));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>Appointment Management</Typography>

      <Paper component="form" onSubmit={handleCreateAppointment} sx={{ p: 2, mb: 2 }}>
        <Stack spacing={2}>
          <FormControl fullWidth>
            <InputLabel>Select Pet</InputLabel>
            <Select
              value={newAppointment.petId}
              onChange={(e) => {
                setNewAppointment({ ...newAppointment, petId: e.target.value })
              }}
              label="Select Pet"
              required
            >
              <MenuItem value="">Select Pet</MenuItem>
              {pets.map(pet => (
                <MenuItem key={pet._id} value={pet._id}>{pet.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Select Service</InputLabel>
            <Select
              value={newAppointment.services}
              onChange={(e) => setNewAppointment({ ...newAppointment, services: e.target.value })}
              label="Select Service"
              required
            >
              <MenuItem value="">Select Service</MenuItem>
              <MenuItem value="OPD">OPD</MenuItem>
              <MenuItem value="Surgery">Surgery</MenuItem>
              <MenuItem value="Vaccination">Vaccination</MenuItem>
              <MenuItem value="Grooming">Grooming</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Select Time Slot</InputLabel>
            <Select
              value={newAppointment.appointmentFrom ? `${newAppointment.appointmentFrom}|${newAppointment.appointmentTo}` : ''}
              onChange={(e) => {
                const [from, to] = e.target.value.split('|');
                setNewAppointment({ ...newAppointment, appointmentFrom: from, appointmentTo: to });
              }}
              label="Select Time Slot"
              required
            >
              <MenuItem value="">Select Time Slot</MenuItem>
              {availableSlots.map((slot, index) => {
                const fromFormatted = formatDateTime(slot.from);
                const toFormatted = formatDateTime(slot.to);

                return (
                  <MenuItem
                    key={index}
                    value={`${slot.from}|${slot.to}`}
                  >
                    {fromFormatted.formatted} - {toFormatted.formatted}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
          >
            Create Appointment
          </Button>
        </Stack>
      </Paper>

      <Box>
        <Typography variant="h5" sx={{ mb: 2 }}>Your Appointments</Typography>
        {appointments.length === 0 ? (
          <Typography color="text.secondary">No appointments scheduled</Typography>
        ) : (
          <Stack spacing={2}>
            {appointments.map(apt => {
              const fromFormatted = formatDateTime(apt.appointmentFrom);
              const toFormatted = formatDateTime(apt.appointmentTo);

              return (
                <Paper key={apt._id} sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">{apt.petId.name ?? ''}</Typography>
                      <Typography>Service: {apt.services[0]}</Typography>
                      <Typography>Date: {fromFormatted.formatted} - {toFormatted.formatted}</Typography>
                    </Box>
                    <Button
                      onClick={() => handleDeleteAppointment(apt._id)}
                      variant="contained"
                      color="error"
                      size="small"
                    >
                      Cancel
                    </Button>
                  </Box>
                </Paper>
              );
            })}
          </Stack>
        )}
      </Box>
    </Box>
  );
};

const Appointment = () => {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <Container maxWidth="lg" sx={{ py: 4, flexGrow: 1 }}>
        <AppointmentsTable />
      </Container>
      <Footer />
    </Box>
  );
};

export default Appointment;