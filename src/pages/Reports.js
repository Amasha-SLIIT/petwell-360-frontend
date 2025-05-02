import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

const BASE_URL = 'http://localhost:5000/api';
const USER_ID = '67de6c4e84c7f4b9cc949703';

const Reports = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    upcomingAppointments: 0,
    cancelledAppointments: 0,
    serviceDistribution: [],
    monthlyStats: []
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
    const now = new Date();
    const serviceCount = {};
    const monthlyData = {};

    appointments.forEach(apt => {
      // Count services
      apt.services.forEach(service => {
        serviceCount[service] = (serviceCount[service] || 0) + 1;
      });

      // Monthly statistics
      const date = new Date(apt.appointmentFrom);
      const monthYear = format(date, 'MMM yyyy');
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + 1;
    });

    setStats({
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(apt => new Date(apt.appointmentTo) < now).length,
      upcomingAppointments: appointments.filter(apt => new Date(apt.appointmentFrom) > now).length,
      cancelledAppointments: appointments.filter(apt => apt.status === 'cancelled').length,
      serviceDistribution: Object.entries(serviceCount).map(([service, count]) => ({
        service,
        count
      })),
      monthlyStats: Object.entries(monthlyData).map(([month, count]) => ({
        month,
        count
      }))
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Appointment Statistics Report', 14, 20);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'PPP')}`, 14, 30);
    
    // Summary Statistics
    doc.setFontSize(14);
    doc.text('Summary Statistics', 14, 40);
    
    const summaryData = [
      ['Total Appointments', stats.totalAppointments],
      ['Completed Appointments', stats.completedAppointments],
      ['Upcoming Appointments', stats.upcomingAppointments],
      ['Cancelled Appointments', stats.cancelledAppointments]
    ];
    
    doc.autoTable({
      startY: 45,
      head: [['Metric', 'Count']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Service Distribution
    doc.setFontSize(14);
    doc.text('Service Distribution', 14, doc.autoTable.previous.finalY + 10);
    
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 15,
      head: [['Service', 'Count']],
      body: stats.serviceDistribution.map(item => [item.service, item.count]),
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Monthly Statistics
    doc.setFontSize(14);
    doc.text('Monthly Statistics', 14, doc.autoTable.previous.finalY + 10);
    
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 15,
      head: [['Month', 'Appointments']],
      body: stats.monthlyStats.map(item => [item.month, item.count]),
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
        {/* Summary Cards */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">Total Appointments</Typography>
            <Typography variant="h4">{stats.totalAppointments}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">Completed</Typography>
            <Typography variant="h4">{stats.completedAppointments}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">Upcoming</Typography>
            <Typography variant="h4">{stats.upcomingAppointments}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">Cancelled</Typography>
            <Typography variant="h4">{stats.cancelledAppointments}</Typography>
          </Paper>
        </Grid>

        {/* Service Distribution Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Service Distribution</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.serviceDistribution}>
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

        {/* Monthly Statistics Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" mb={2}>Monthly Appointments</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.monthlyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports; 