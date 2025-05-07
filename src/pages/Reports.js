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
  TableRow,
  Divider
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment-timezone';
import Footer from '../components/Footer';

const BASE_URL = 'http://localhost:5000/api';
const USER_ID = '67de6c4e84c7f4b9cc949703';
const timezone = 'America/New_York';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const formatTimeSlot = (hour, minute) => {
  const startHour = hour;
  const startMinute = minute;
  const endMinute = (startMinute + 30) % 60;
  const endHour = endMinute === 0 ? (startHour + 1) % 24 : startHour;
  
  const formatTime = (h, m) => {
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  };
  
  return `${formatTime(startHour, startMinute)} - ${formatTime(endHour, endMinute)}`;
};

const Reports = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    appointmentVolume: {
      daily: {},
      weekly: {},
      monthly: {},
      serviceType: {},
      perPet: {},
      singleVsMultiPet: {
        single: 0,
        multi: 0,
        total: 0
      }
    },
    scheduling: {
      peakHours: {},
      weekdayVsWeekend: {
        weekday: 0,
        weekend: 0
      },
      slotUtilization: {
        weekday: { total: 0, booked: 0 },
        weekend: { total: 0, booked: 0 }
      },
      popularDays: {},
      cancellationRate: {
        total: 0,
        cancelled: 0,
        byService: {}
      }
    },
    serviceInsights: {
      mostRequested: {},
      totalByService: {}
    },
    clientBehavior: {
      loyalty: {}
    }
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
    const newStats = {
      appointmentVolume: {
        daily: {},
        weekly: {},
        monthly: {},
        serviceType: {},
        perPet: {},
        singleVsMultiPet: {
          single: 0,
          multi: 0,
          total: 0
        }
      },
      scheduling: {
        peakHours: {},
        weekdayVsWeekend: {
          weekday: 0,
          weekend: 0
        },
        slotUtilization: {
          weekday: { total: 0, booked: 0 },
          weekend: { total: 0, booked: 0 }
        },
        popularDays: {},
        cancellationRate: {
          total: 0,
          cancelled: 0,
          byService: {}
        }
      },
      serviceInsights: {
        mostRequested: {},
        totalByService: {}
      },
      clientBehavior: {
        loyalty: {}
      }
    };

    appointments.forEach(appointment => {
      const appointmentDate = moment(appointment.appointmentFrom).tz(timezone);
      const dayOfWeek = appointmentDate.day();
      const hour = appointmentDate.hour();
      const minute = appointmentDate.minute();
      const dateKey = appointmentDate.format('YYYY-MM-DD');
      const weekKey = appointmentDate.format('YYYY-[W]WW');
      const monthKey = appointmentDate.format('YYYY-MM');
      const dayName = appointmentDate.format('dddd');
      const timeSlot = formatTimeSlot(hour, minute);

      // Appointment Volume Analysis
      newStats.appointmentVolume.daily[dateKey] = (newStats.appointmentVolume.daily[dateKey] || 0) + 1;
      newStats.appointmentVolume.weekly[weekKey] = (newStats.appointmentVolume.weekly[weekKey] || 0) + 1;
      newStats.appointmentVolume.monthly[monthKey] = (newStats.appointmentVolume.monthly[monthKey] || 0) + 1;

      // Service Type Analysis
      if (Array.isArray(appointment.services)) {
        appointment.services.forEach(service => {
          newStats.appointmentVolume.serviceType[service] = (newStats.appointmentVolume.serviceType[service] || 0) + 1;
          newStats.serviceInsights.totalByService[service] = (newStats.serviceInsights.totalByService[service] || 0) + 1;
        });
      }

      // Per Pet Analysis
      const petId = appointment.petId?._id || appointment.petId;
      if (petId) {
        const petIdStr = typeof petId === 'object' ? petId.toString() : petId;
        newStats.appointmentVolume.perPet[petIdStr] = (newStats.appointmentVolume.perPet[petIdStr] || 0) + 1;
      }

      // Single vs Multi Pet Analysis
      const userId = appointment.userId?._id || appointment.userId;
      if (userId) {
        const userIdStr = typeof userId === 'object' ? userId.toString() : userId;
        if (!newStats.appointmentVolume.singleVsMultiPet[userIdStr]) {
          const userPets = appointments
            .filter(a => {
              const aUserId = a.userId?._id || a.userId;
              return aUserId && (typeof aUserId === 'object' ? aUserId.toString() : aUserId) === userIdStr;
            })
            .map(a => {
              const aPetId = a.petId?._id || a.petId;
              return aPetId ? (typeof aPetId === 'object' ? aPetId.toString() : aPetId) : null;
            })
            .filter(Boolean);
          
          const uniquePets = new Set(userPets).size;
          if (uniquePets > 1) {
            newStats.appointmentVolume.singleVsMultiPet.multi++;
          } else {
            newStats.appointmentVolume.singleVsMultiPet.single++;
          }
          newStats.appointmentVolume.singleVsMultiPet.total++;
          newStats.appointmentVolume.singleVsMultiPet[userIdStr] = true;
        }
      }

      // Time Slot Analysis - Only include business hours (9 AM to 9 PM)
      if (hour >= 9 && hour < 21) { // Only include hours from 9 AM to 9 PM
        newStats.scheduling.peakHours[timeSlot] = (newStats.scheduling.peakHours[timeSlot] || 0) + 1;
      }

      // Weekday vs Weekend Analysis
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        newStats.scheduling.weekdayVsWeekend.weekend++;
      } else {
        newStats.scheduling.weekdayVsWeekend.weekday++;
      }

      // Slot Utilization
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      if (isWeekend) {
        newStats.scheduling.slotUtilization.weekend.total++;
        if (appointment.status === 'confirmed') {
          newStats.scheduling.slotUtilization.weekend.booked++;
        }
      } else {
        newStats.scheduling.slotUtilization.weekday.total++;
        if (appointment.status === 'confirmed') {
          newStats.scheduling.slotUtilization.weekday.booked++;
        }
      }

      // Popular Days
      newStats.scheduling.popularDays[dayName] = (newStats.scheduling.popularDays[dayName] || 0) + 1;

      // Cancellation Rate
      newStats.scheduling.cancellationRate.total++;
      if (appointment.status === 'cancelled') {
        newStats.scheduling.cancellationRate.cancelled++;
        if (Array.isArray(appointment.services)) {
          appointment.services.forEach(service => {
            newStats.scheduling.cancellationRate.byService[service] = (newStats.scheduling.cancellationRate.byService[service] || 0) + 1;
          });
        }
      }

      // Client Loyalty
      if (userId) {
        const userIdStr = typeof userId === 'object' ? userId.toString() : userId;
        newStats.clientBehavior.loyalty[userIdStr] = (newStats.clientBehavior.loyalty[userIdStr] || 0) + 1;
      }
    });

    setStats(newStats);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(20);
    doc.text('Appointment Statistics Report', 14, 20);
    
    // Date
    doc.setFontSize(12);
    doc.text(`Generated on: ${moment().format('MMMM D, YYYY')}`, 14, 30);
    
    // 1. Appointment Volume & Demand Analysis
    doc.setFontSize(16);
    doc.text('1. Appointment Volume & Demand Analysis', 14, 40);
    
    // Total Appointments
    doc.setFontSize(14);
    doc.text('Total Appointments:', 14, 50);
    const totalAppointments = appointments.length;
    doc.setFontSize(12);
    doc.text(`- Total: ${totalAppointments}`, 20, 60);
    doc.text(`- Daily Average: ${(totalAppointments / Object.keys(stats.appointmentVolume.daily).length).toFixed(2)}`, 20, 70);
    doc.text(`- Weekly Average: ${(totalAppointments / Object.keys(stats.appointmentVolume.weekly).length).toFixed(2)}`, 20, 80);
    doc.text(`- Monthly Average: ${(totalAppointments / Object.keys(stats.appointmentVolume.monthly).length).toFixed(2)}`, 20, 90);
    
    // Service Type Breakdown
    doc.setFontSize(14);
    doc.text('Appointments by Service Type:', 14, 100);
    const serviceData = Object.entries(stats.appointmentVolume.serviceType).map(([service, count]) => [
      service,
      count,
      `${((count/totalAppointments)*100).toFixed(2)}%`
    ]);
    
    autoTable(doc, {
      startY: 105,
      head: [['Service', 'Count', 'Percentage']],
      body: serviceData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Single vs Multi Pet Clients
    doc.setFontSize(14);
    doc.text('Client Distribution:', 14, doc.lastAutoTable.finalY + 10);
    const singlePetPercentage = (stats.appointmentVolume.singleVsMultiPet.single / stats.appointmentVolume.singleVsMultiPet.total) * 100;
    const multiPetPercentage = (stats.appointmentVolume.singleVsMultiPet.multi / stats.appointmentVolume.singleVsMultiPet.total) * 100;
    doc.setFontSize(12);
    doc.text(`- Single Pet Clients: ${singlePetPercentage.toFixed(2)}%`, 20, doc.lastAutoTable.finalY + 20);
    doc.text(`- Multi Pet Clients: ${multiPetPercentage.toFixed(2)}%`, 20, doc.lastAutoTable.finalY + 30);
    
    // 2. Time Slot & Scheduling Efficiency
    doc.setFontSize(16);
    doc.text('2. Time Slot & Scheduling Efficiency', 14, doc.lastAutoTable.finalY + 40);
    
    // Busiest Time Slots
    doc.setFontSize(14);
    doc.text('Busiest Time Slots:', 14, doc.lastAutoTable.finalY + 50);
    const busiestTimeSlots = Object.entries(stats.scheduling.peakHours)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    doc.setFontSize(12);
    busiestTimeSlots.forEach(([time, count], index) => {
      const percentage = ((count / totalAppointments) * 100).toFixed(2);
      doc.text(`- ${time}: ${count} appointments (${percentage}%)`, 20, doc.lastAutoTable.finalY + 60 + (index * 10));
    });
    doc.setFontSize(14);
    doc.text('Weekday vs Weekend Demand:', 14, doc.lastAutoTable.finalY + 60 + (busiestTimeSlots.length * 10) + 10);
    doc.setFontSize(12);
    doc.text(`- Weekday: ${stats.scheduling.weekdayVsWeekend.weekday} appointments`, 20, doc.lastAutoTable.finalY + 70 + (busiestTimeSlots.length * 10) + 10);
    doc.text(`- Weekend: ${stats.scheduling.weekdayVsWeekend.weekend} appointments`, 20, doc.lastAutoTable.finalY + 80 + (busiestTimeSlots.length * 10) + 10);
    
    // 3. Service-Specific Insights
    doc.setFontSize(16);
    doc.text('3. Service-Specific Insights', 14, doc.lastAutoTable.finalY + 90 + (busiestTimeSlots.length * 10) + 10);
    
    // Most Requested Service
    doc.setFontSize(14);
    doc.text('Most Requested Service:', 14, doc.lastAutoTable.finalY + 100 + (busiestTimeSlots.length * 10) + 10);
    const mostRequestedService = Object.entries(stats.serviceInsights.totalByService)
      .sort(([, a], [, b]) => b - a)[0];
    doc.setFontSize(12);
    doc.text(`- ${mostRequestedService[0]}: ${mostRequestedService[1]} appointments`, 20, doc.lastAutoTable.finalY + 110 + (busiestTimeSlots.length * 10) + 10);
    
    // 4. Client Behavior
    doc.setFontSize(16);
    doc.text('4. Client Behavior', 14, doc.lastAutoTable.finalY + 120 + (busiestTimeSlots.length * 10) + 10);
    
    // Top Clients
    doc.setFontSize(14);
    doc.text('Top Clients by Number of Visits:', 14, doc.lastAutoTable.finalY + 130 + (busiestTimeSlots.length * 10) + 10);
    const topClients = Object.entries(stats.clientBehavior.loyalty)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
    
    const topClientsData = topClients.map(([userId, visits], index) => [
      `Client ${index + 1}`,
      visits,
      `${((visits/totalAppointments)*100).toFixed(2)}%`
    ]);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 135 + (busiestTimeSlots.length * 10) + 10,
      head: [['Client', 'Visits', 'Percentage']],
      body: topClientsData,
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

  const totalAppointments = appointments.length;
  const cancellationRate = (stats.scheduling.cancellationRate.cancelled / totalAppointments) * 100;
  const slotUtilizationWeekday = (stats.scheduling.slotUtilization.weekday.booked / stats.scheduling.slotUtilization.weekday.total) * 100;
  const slotUtilizationWeekend = (stats.scheduling.slotUtilization.weekend.booked / stats.scheduling.slotUtilization.weekend.total) * 100;
  const singlePetPercentage = (stats.appointmentVolume.singleVsMultiPet.single / stats.appointmentVolume.singleVsMultiPet.total) * 100;
  const multiPetPercentage = (stats.appointmentVolume.singleVsMultiPet.multi / stats.appointmentVolume.singleVsMultiPet.total) * 100;

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

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* 1. Appointment Volume & Demand Analysis */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>1. Appointment Volume & Demand Analysis</Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Total Appointments</Typography>
              <Typography variant="body1">Total: {totalAppointments}</Typography>
              <Typography variant="body1">
                Daily Average: {(totalAppointments / Object.keys(stats.appointmentVolume.daily).length).toFixed(2)}
              </Typography>
              <Typography variant="body1">
                Weekly Average: {(totalAppointments / Object.keys(stats.appointmentVolume.weekly).length).toFixed(2)}
              </Typography>
              <Typography variant="body1">
                Monthly Average: {(totalAppointments / Object.keys(stats.appointmentVolume.monthly).length).toFixed(2)}
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Client Distribution</Typography>
              <Typography variant="body1">
                Single Pet Clients: {singlePetPercentage.toFixed(2)}%
              </Typography>
              <Typography variant="body1">
                Multi Pet Clients: {multiPetPercentage.toFixed(2)}%
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" mb={2}>Service Distribution</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(stats.appointmentVolume.serviceType).map(([service, count]) => ({
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

        {/* 2. Time Slot & Scheduling Efficiency */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>2. Time Slot & Scheduling Efficiency</Typography>
          
          <Typography variant="subtitle1" mb={2}>Busiest Time Slots</Typography>
          {/* Custom Legend */}
          <Box display="flex" alignItems="center" mb={1}>
            <Box width={20} height={20} bgcolor="#82ca9d" mr={1} borderRadius={1} />
            <Typography variant="body2" color="textSecondary">
              Appointments count
            </Typography>
          </Box>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={Object.entries(stats.scheduling.peakHours)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([time, count]) => ({
                  time,
                  count,
                  percentage: ((count / totalAppointments) * 100).toFixed(2)
                }))}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                label={{
                  value: 'Time Slot',
                  position: 'bottom',
                  offset: 0,
                  dy: 30
                }}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={60}
              />
              <YAxis
                allowDecimals={false}
                label={{ value: 'Appointments', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                formatter={(value, name, props) => [
                  `${value} appointments (${props.payload.percentage}%)`,
                  '' // No label
                ]}
              />
              <Bar dataKey="count" fill="#82ca9d">
                <LabelList dataKey="count" position="top" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" mb={2}>Weekday vs Weekend</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Weekday', value: stats.scheduling.weekdayVsWeekend.weekday },
                  { name: 'Weekend', value: stats.scheduling.weekdayVsWeekend.weekend }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                <Cell fill="#8884d8" />
                <Cell fill="#82ca9d" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* 3. Service-Specific Insights */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>3. Service-Specific Insights</Typography>
          
          <Typography variant="subtitle1" mb={2}>Most Requested Services</Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Object.entries(stats.serviceInsights.totalByService)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([service, count]) => ({
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

        {/* 4. Client Behavior */}
        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>4. Client Behavior</Typography>
          
          <Typography variant="subtitle1" mb={2}>Top Clients by Number of Visits</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Client</TableCell>
                  <TableCell align="right">Visits</TableCell>
                  <TableCell align="right">Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(stats.clientBehavior.loyalty)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([userId, visits], index) => (
                    <TableRow key={userId}>
                      <TableCell>Client {index + 1}</TableCell>
                      <TableCell align="right">{visits}</TableCell>
                      <TableCell align="right">
                        {((visits/totalAppointments)*100).toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
      <Footer />
    </Box>
  );
};

export default Reports; 