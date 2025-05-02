import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AppointmentsTable from './components/AppointmentsTable';
import Footer from './components/Footer';

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
    <div className="p-4">
      <h2 className="text-2xl mb-4">Pet Management</h2>

      {/*Pet Form */}
      <form onSubmit={selectedPet ? handleUpdatePet : handleAddPet} className="mb-4">
        <input
          type="text"
          placeholder="Pet Name"
          value={selectedPet ? selectedPet.name : newPet.name}
          onChange={(e) =>
            selectedPet
              ? setSelectedPet({ ...selectedPet, name: e.target.value })
              : setNewPet({ ...newPet, name: e.target.value })
          }
          className="border p-2 mr-2 mb-2"
          required
        />
        {!selectedPet && (
          <select
            value={newPet.type}
            onChange={(e) => setNewPet({ ...newPet, type: e.target.value })}
            className="border p-2 mr-2 mb-2"
            required
          >
            <option value="">Select Pet Type</option>
            <option value="Cat">Cat</option>
            <option value="Dog">Dog</option>
          </select>
        )}
        <button
          type="submit"
          className="bg-blue-500 text-white p-2"
        >
          {selectedPet ? 'Update Pet' : 'Add Pet'}
        </button>
        {selectedPet && (
          <button
            type="button"
            onClick={() => setSelectedPet(null)}
            className="bg-gray-500 text-white p-2 ml-2"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Pet List */}
      <div>
        {pets.map(pet => (
          <div key={pet._id} className="border p-2 mb-2 flex justify-between items-center">
            <span>{pet.name} - {pet.type}</span>
            <div>
              <button
                onClick={() => setSelectedPet(pet)}
                className="bg-yellow-500 text-white p-1 mr-2"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeletePet(pet._id)}
                className="bg-red-500 text-white p-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
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
    <div className="p-4">
      <h2 className="text-2xl mb-4">Appointment Management</h2>

      {/*Appointment Form */}
      <form onSubmit={handleCreateAppointment} className="mb-4 space-y-2">
        <select
          value={newAppointment.petId}
          onChange={(e) => {
            setNewAppointment({ ...newAppointment, petId: e.target.value })
          }}
          className="border p-2 w-full"
          required
        >
          <option value="">Select Pet</option>
          {pets.map(pet => (
            <option key={pet._id} value={pet._id}>{pet.name}</option>
          ))}
        </select>

        <select
          value={newAppointment.services}
          onChange={(e) => setNewAppointment({ ...newAppointment, services: e.target.value })}
          className="border p-2 w-full"
          required
        >
          <option value="">Select Service</option>
          <option value="OPD">OPD</option>
          <option value="Surgery">Surgery</option>
          <option value="Vaccination">Vaccination</option>
          <option value="Grooming">Grooming</option>
        </select>

        <select
          value={newAppointment.appointmentFrom ? `${newAppointment.appointmentFrom}|${newAppointment.appointmentTo}` : ''}
          onChange={(e) => {
            const [from, to] = e.target.value.split('|');
            setNewAppointment({ ...newAppointment, appointmentFrom: from, appointmentTo: to });
          }}
          className="border p-2 w-full"
          required
        >
          <option value="">Select Time Slot</option>
          {availableSlots.map((slot, index) => {
            const fromFormatted = formatDateTime(slot.from);
            const toFormatted = formatDateTime(slot.to);

            return (
              <option
                key={index}
                value={`${slot.from}|${slot.to}`}
              >
                {fromFormatted.formatted} - {toFormatted.formatted}
              </option>
            );
          })}
        </select>

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 w-full"
        >
          Create Appointment
        </button>
      </form>

      {/* Appointments List */}
      <div>
        <h3 className="text-xl mb-2">Your Appointments</h3>
        {appointments.length === 0 ? (
          <p className="text-gray-500">No appointments scheduled</p>
        ) : (
          appointments.map(apt => {
            const fromFormatted = formatDateTime(apt.appointmentFrom);
            const toFormatted = formatDateTime(apt.appointmentTo);

            return (
              <div key={apt._id} className="border p-2 mb-2 flex justify-between items-center">
                <div>
                  <p className="font-bold">{apt.petId.name ?? ''}</p>
                  <p>Service: {apt.services[0]}</p>
                  <p>Date: {fromFormatted.formatted} - {toFormatted.formatted}</p>
                </div>
                <button
                  onClick={() => handleDeleteAppointment(apt._id)}
                  className="bg-red-500 text-white p-1"
                >
                  Cancel
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8">PetWell 360</h1>
        <AppointmentsTable />
      </div>
      <Footer />
    </div>
  );
};

export default App;