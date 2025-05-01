import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const BASE_URL = 'http://localhost:5000/api';
const USER_ID = '67de6c4e84c7f4b9cc949703';

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
    appointmentTo: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appointmentsRes, petsRes] = await Promise.all([
          axios.get(`${BASE_URL}/users/${USER_ID}/appointments`),
          axios.get(`${BASE_URL}/users/${USER_ID}/pets`)
        ]);
        setAppointments(appointmentsRes.data);
        setPets(petsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleModalOpen = async () => {
    try {
      const slotsRes = await axios.get(`${BASE_URL}/appointments/available-slots`);
      setAvailableSlots(slotsRes.data);
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      alert('Failed to fetch available time slots. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateSelect = (date) => {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    setSelectedDate(localDate);
    setSelectedTimeSlot(null);
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
    availableSlots.forEach(slot => {
      if (slot.isAvailable) {
        const date = new Date(slot.from);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        dates.add(localDate.toISOString().split('T')[0]);
      }
    });
    return Array.from(dates).map(date => new Date(date));
  };

  const getAvailableTimeSlots = () => {
    if (!selectedDate) return [];
    
    const selectedDateStr = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];

    return availableSlots.filter(slot => {
      if (!slot.isAvailable) return false;
      
      const slotDate = new Date(slot.from);
      const localSlotDate = new Date(slotDate.getTime() - slotDate.getTimezoneOffset() * 60000)
        .toISOString()
        .split('T')[0];
      
      return localSlotDate === selectedDateStr;
    });
  };

  const formatTimeSlot = (slot) => {
    const from = new Date(slot.from);
    const to = new Date(slot.to);
    return `${from.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${to.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handleEditAppointment = async (appointment) => {
    try {
      const slotsRes = await axios.get(`${BASE_URL}/appointments/available-slots`);
      setAvailableSlots(slotsRes.data);
      setEditingAppointment(appointment);
      setFormData({
        petId: appointment.petId._id,
        services: appointment.services[0],
        appointmentFrom: appointment.appointmentFrom,
        appointmentTo: appointment.appointmentTo
      });
      setSelectedDate(new Date(appointment.appointmentFrom));
      setIsEditMode(true);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error preparing edit:', error);
      alert('Failed to prepare edit. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTimeSlot) {
      alert('Please select a time slot');
      return;
    }
    try {
      if (isEditMode) {
        await axios.put(`${BASE_URL}/appointments/${editingAppointment._id}`, {
          ...formData,
          userId: USER_ID,
          services: [formData.services]
        });
      } else {
        await axios.post(`${BASE_URL}/appointments`, {
          ...formData,
          userId: USER_ID,
          services: [formData.services]
        });
      }
      
      // Fetch updated appointments list
      const appointmentsRes = await axios.get(`${BASE_URL}/users/${USER_ID}/appointments`);
      setAppointments(appointmentsRes.data);
      
      // Reset form
      setFormData({
        petId: '',
        services: '',
        appointmentFrom: '',
        appointmentTo: ''
      });
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Failed to save appointment. Please try again.');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingAppointment(null);
    setFormData({
      petId: '',
      services: '',
      appointmentFrom: '',
      appointmentTo: ''
    });
    setSelectedDate(null);
    setSelectedTimeSlot(null);
  };

  const handleDeleteAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }
    try {
      await axios.delete(`${BASE_URL}/appointments/${appointmentId}`);
      setAppointments(appointments.filter(apt => apt._id !== appointmentId));
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <button
          onClick={handleModalOpen}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Create Appointment
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pet Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((appointment) => {
              const fromDate = new Date(appointment.appointmentFrom);
              const toDate = new Date(appointment.appointmentTo);
              
              return (
                <tr key={appointment._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{appointment.petId?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{appointment.services[0]}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{fromDate.toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {fromDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {toDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleEditAppointment(appointment)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteAppointment(appointment._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4">
              {isEditMode ? 'Edit Appointment' : 'Create New Appointment'}
            </h2>
            <div className="overflow-y-auto flex-grow">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="petId">
                    Pet
                  </label>
                  <select
                    id="petId"
                    name="petId"
                    value={formData.petId}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Select Pet</option>
                    {pets.map(pet => (
                      <option key={pet._id} value={pet._id}>{pet.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="services">
                    Service Type
                  </label>
                  <select
                    id="services"
                    name="services"
                    value={formData.services}
                    onChange={handleInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Select Service</option>
                    <option value="OPD">OPD</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Grooming">Grooming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Select Date
                  </label>
                  <DatePicker
                    selected={selectedDate}
                    onChange={handleDateSelect}
                    includeDates={getAvailableDates()}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholderText="Select available date"
                    required
                    dateFormat="MMMM d, yyyy"
                  />
                </div>
                {selectedDate && (
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Available Time Slots
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                      {getAvailableTimeSlots().length > 0 ? (
                        getAvailableTimeSlots().map((slot, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleTimeSlotSelect(slot)}
                            className={`p-2 rounded ${
                              selectedTimeSlot?.from === slot.from
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {formatTimeSlot(slot)}
                          </button>
                        ))
                      ) : (
                        <div className="col-span-2 text-center text-gray-500 py-4">
                          No available time slots for this date
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </div>
            <div className="flex justify-end mt-4 pt-4 border-t">
              <button
                type="button"
                onClick={handleModalClose}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                disabled={!selectedTimeSlot}
              >
                {isEditMode ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsTable; 