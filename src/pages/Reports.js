import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment-timezone';

const BASE_URL = 'http://localhost:5000/api';
const USER_ID = '67de6c4e84c7f4b9cc949703';
const timezone = 'America/New_York';

const Reports = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    serviceStats: {},
    timeSlotStats: {},
    twoWeekPeriods: [],
    averageAppointmentsPerTwoWeeks: 0,
    busiestTimeSlots: []
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/users/${USER_ID}/appointments`);
      setAppointments(response.data);
      calculateStats(response.data);
    } catch (err) {
      setError('Failed to fetch appointment data');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (appointments) => {
    const serviceStats = {};
    const timeSlotStats = {};
    const twoWeekPeriods = [];
    const currentDate = moment().tz(timezone);
    
    // Initialize two-week periods for the last 6 months
    for (let i = 0; i < 12; i++) {
      const startDate = currentDate.clone().subtract(i * 14, 'days');
      const endDate = startDate.clone().add(13, 'days');
      twoWeekPeriods.push({
        start: startDate,
        end: endDate,
        count: 0
      });
    }

    appointments.forEach(appointment => {
      // Service type statistics
      appointment.services.forEach(service => {
        serviceStats[service] = (serviceStats[service] || 0) + 1;
      });

      // Time slot statistics
      const appointmentTime = moment(appointment.appointmentFrom).tz(timezone);
      const hour = appointmentTime.hour();
      const timeSlot = `${hour}:00 - ${hour + 1}:00`;
      timeSlotStats[timeSlot] = (timeSlotStats[timeSlot] || 0) + 1;

      // Two-week period statistics
      const appointmentDate = moment(appointment.appointmentFrom).tz(timezone);
      twoWeekPeriods.forEach(period => {
        if (appointmentDate.isBetween(period.start, period.end, 'day', '[]')) {
          period.count++;
        }
      });
    });

    // Calculate averages
    const totalAppointments = appointments.length;
    const averageAppointmentsPerTwoWeeks = totalAppointments / twoWeekPeriods.length;
    
    // Find busiest time slots
    const busiestTimeSlots = Object.entries(timeSlotStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    setStats({
      totalAppointments,
      serviceStats,
      timeSlotStats,
      twoWeekPeriods,
      averageAppointmentsPerTwoWeeks,
      busiestTimeSlots
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Appointment Statistics Report', 14, 20);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Generated on: ${moment().format('MMMM D, YYYY')}`, 14, 30);
    
    // Service Statistics
    doc.setFontSize(16);
    doc.text('Service Type Statistics', 14, 40);
    
    const serviceData = Object.entries(stats.serviceStats).map(([service, count]) => [
      service,
      count,
      `${((count/stats.totalAppointments)*100).toFixed(2)}%`
    ]);
    
    autoTable(doc, {
      startY: 45,
      head: [['Service', 'Count', 'Percentage']],
      body: serviceData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Time Slot Statistics
    doc.setFontSize(16);
    doc.text('Busiest Time Slots', 14, doc.lastAutoTable.finalY + 10);
    
    const timeSlotData = stats.busiestTimeSlots.map(([timeSlot, count]) => [
      timeSlot,
      count,
      `${((count/stats.totalAppointments)*100).toFixed(2)}%`
    ]);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [['Time Slot', 'Count', 'Percentage']],
      body: timeSlotData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Two-Week Period Statistics
    doc.setFontSize(16);
    doc.text('Two-Week Period Statistics', 14, doc.lastAutoTable.finalY + 10);
    
    doc.setFontSize(12);
    doc.text(`Average appointments per two weeks: ${stats.averageAppointmentsPerTwoWeeks.toFixed(2)}`, 
      14, doc.lastAutoTable.finalY + 20);
    
    const periodData = stats.twoWeekPeriods.map((period, index) => [
      `Period ${index + 1}`,
      `${period.start.format('MMM D')} - ${period.end.format('MMM D')}`,
      period.count
    ]);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 30,
      head: [['Period', 'Date Range', 'Appointments']],
      body: periodData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    doc.save('appointment_report.pdf');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Appointment Reports
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={generatePDF}
          startIcon={<span>📄</span>}
        >
          Download PDF Report
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Service Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Service Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(stats.serviceStats).map(([service, count]) => ({
                service,
                count
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="service" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Time Slot Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Time Slot Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={Object.entries(stats.timeSlotStats).map(([timeSlot, count]) => ({
                timeSlot,
                count
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timeSlot" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Two-Week Period Statistics */}
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Two-Week Period Statistics</Typography>
            <Typography variant="subtitle1" mb={2}>
              Average appointments per two weeks: {stats.averageAppointmentsPerTwoWeeks.toFixed(2)}
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Period</TableCell>
                    <TableCell>Date Range</TableCell>
                    <TableCell align="right">Appointments</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stats.twoWeekPeriods.map((period, index) => (
                    <TableRow key={index}>
                      <TableCell>Period {index + 1}</TableCell>
                      <TableCell>
                        {period.start.format('MMM D')} - {period.end.format('MMM D')}
                      </TableCell>
                      <TableCell align="right">{period.count}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports; 