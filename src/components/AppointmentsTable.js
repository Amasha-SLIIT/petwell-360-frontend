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
    appointmentTo: '',
    paymentMethod: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    amount: 0
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
      console.error('Error fetching available slots:', error);
      alert('Failed to fetch available time slots. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Validate card number and CVV to only accept numbers
    if (name === 'cardNumber' || name === 'cvv') {
      // Remove any non-numeric characters
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
    
    // Check if previously selected time slot is still available for the new date
    if (selectedTimeSlot) {
      const availableSlotsForDate = getAvailableTimeSlots();
      const isSlotStillAvailable = availableSlotsForDate.some(
        slot => slot.from === selectedTimeSlot.from && slot.to === selectedTimeSlot.to
      );
      
      if (!isSlotStillAvailable) {
        alert('The previously selected time slot is not available for the new date. Please select a new time slot.');
        setSelectedTimeSlot(null);
      }
    } else {
      setSelectedTimeSlot(null);
    }
  };

  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
    setFormData(prev => ({
      ...prev,
      appointmentFrom: slot.from,
      appointmentTo: slot.to,
      amount: 500 // Set fixed amount of 500 LKR
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
    return hoursUntilAppointment > 24;
  };

  const handleEditAppointment = async (appointment) => {
    if (!canEditAppointment(appointment)) {
      alert('Appointments can only be edited more than 24 hours before the scheduled time.');
      return;
    }

    try {
      const slotsRes = await axios.get(`${BASE_URL}/appointments/available-slots`);
      setAvailableSlots(slotsRes.data);
      setEditingAppointment(appointment);
      setFormData({
        petId: appointment.petId._id,
        services: appointment.services[0],
        appointmentFrom: appointment.appointmentFrom,
        appointmentTo: appointment.appointmentTo,
        paymentMethod: '',
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        amount: 500
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
    if (!isEditMode && !formData.paymentMethod) {
      alert('Please select a payment method');
      return;
    }
    if (!isEditMode) {
      if (!formData.cardNumber || formData.cardNumber.length !== 16) {
        alert('Please enter a valid 16-digit card number');
        return;
      }
      if (!formData.expiryDate || !/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
        alert('Please enter a valid expiry date (MM/YY)');
        return;
      }
      if (!formData.cvv || formData.cvv.length !== 3) {
        alert('Please enter a valid 3-digit CVV');
        return;
      }
    }

    try {
      if (isEditMode) {
        // Check if any changes were made
        const hasPetChanged = formData.petId !== editingAppointment.petId._id;
        const hasServiceChanged = formData.services !== editingAppointment.services[0];
        const hasTimeSlotChanged = selectedTimeSlot.from !== editingAppointment.appointmentFrom;

        console.log('Change detection:', {
          pet: { changed: hasPetChanged, old: editingAppointment.petId._id, new: formData.petId },
          service: { changed: hasServiceChanged, old: editingAppointment.services[0], new: formData.services },
          timeSlot: { changed: hasTimeSlotChanged, old: editingAppointment.appointmentFrom, new: selectedTimeSlot.from }
        });

        if (!hasPetChanged && !hasServiceChanged && !hasTimeSlotChanged) {
          alert('No changes were made to the appointment.');
          return;
        }

        // Prepare the update request
        const updateRequest = {
          userId: USER_ID,
          petId: formData.petId,
          services: [formData.services],
          appointmentFrom: selectedTimeSlot.from,
          appointmentTo: selectedTimeSlot.to
        };

        console.log('Sending update request:', updateRequest);

        try {
          const updateResponse = await axios.put(`${BASE_URL}/appointments/${editingAppointment._id}`, updateRequest);
          console.log('Update response:', updateResponse.data);
        } catch (updateError) {
          console.error('Update error:', updateError);
          console.error('Update error response:', updateError.response);
          if (updateError.response) {
            throw new Error(`Failed to update appointment: ${updateError.response.data.message || 'Please try again.'}`);
          }
          throw new Error('Failed to update appointment. Please try again.');
        }
      } else {
        // Create new appointment
        const appointmentData = {
          petId: formData.petId,
          services: [formData.services],
          appointmentFrom: selectedTimeSlot.from,
          appointmentTo: selectedTimeSlot.to,
          userId: USER_ID,
          // Include payment information directly in the appointment data
          payment: {
            amount: 500,
            paymentMethod: formData.paymentMethod,
            cardNumber: formData.cardNumber,
            expiryDate: formData.expiryDate,
            cvv: formData.cvv
          }
        };

        console.log('Creating new appointment:', { 
          ...appointmentData, 
          payment: { 
            ...appointmentData.payment, 
            cardNumber: '****', 
            cvv: '***' 
          } 
        });

        const appointmentResponse = await axios.post(`${BASE_URL}/appointments`, appointmentData);
        console.log('Appointment created:', appointmentResponse.data);
      }
      
      // Fetch updated appointments list
      console.log('Fetching updated appointments list...');
      const appointmentsRes = await axios.get(`${BASE_URL}/users/${USER_ID}/appointments`);
      setAppointments(appointmentsRes.data);
      
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
        response: error.response,
        request: error.request
      });
      alert(error.message || 'Failed to save appointment. Please try again.');
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
              const canEdit = canEditAppointment(appointment);
              
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
                      className={`${canEdit ? 'text-blue-600 hover:text-blue-900' : 'text-gray-400 cursor-not-allowed'}`}
                      disabled={!canEdit}
                      title={!canEdit ? 'Can only edit appointments more than 24 hours before scheduled time' : ''}
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

                {/* Payment Section - Only show for new appointments */}
                {!isEditMode && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="paymentMethod">
                        Payment Method
                      </label>
                      <select
                        id="paymentMethod"
                        name="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={handleInputChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      >
                        <option value="">Select Payment Method</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="debit_card">Debit Card</option>
                      </select>
                    </div>

                    {formData.paymentMethod && (
                      <>
                        <div className="mb-4">
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cardNumber">
                            Card Number
                          </label>
                          <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="1234 5678 9012 3456"
                            maxLength={16}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="expiryDate">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              id="expiryDate"
                              name="expiryDate"
                              value={formData.expiryDate}
                              onChange={handleInputChange}
                              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                              placeholder="MM/YY"
                              maxLength={5}
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="cvv">
                              CVV
                            </label>
                            <input
                              type="text"
                              id="cvv"
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleInputChange}
                              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                              placeholder="123"
                              maxLength={3}
                              required
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="amount">
                            Amount
                          </label>
                          <input
                            type="number"
                            id="amount"
                            name="amount"
                            value={500}
                            readOnly
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-gray-100 leading-tight focus:outline-none focus:shadow-outline"
                          />
                          <p className="text-sm text-gray-500 mt-1">Fixed amount: 500 LKR</p>
                        </div>
                      </>
                    )}
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
                disabled={!selectedTimeSlot || (!isEditMode && !formData.paymentMethod)}
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