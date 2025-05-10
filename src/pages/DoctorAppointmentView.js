import React, { useEffect, useState } from 'react';
import axios from '../axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  styled,
} from '@mui/material';

const BASE_URL = 'http://localhost:5000/api';

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

const DoctorAppointmentView = () => {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();

  // Check user role and redirect if unauthorized
  useEffect(() => {
    const userRole = localStorage.getItem("userRole");
    if (userRole !== "staff" && userRole !== "admin") {
      navigate("/"); // Redirect pet owners or guests to homepage
    }
  }, [navigate]);

  const handleClick = () => {
    navigate('/appointments');
  };

  const formatDatetime = (input) => {
    const date = new Date(input);

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;

    return `${formattedDate} ${formattedTime}`;
  }

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/appointments`);
        const newData = res.data.map((a) => {
          return {
            ...a,
            appointmentFrom: formatDatetime(a.appointmentFrom),
            appointmentTo: formatDatetime(a.appointmentTo),
          }
        })
        setAppointments(newData);
      } catch (error) {
        console.error('Error fetching doctor appointments:', error);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <>
      <Container sx={{ py: 8 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography
            variant="h4"
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              color: "#0D47A1",
            }}
          >
            Appointments
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/Reports')}
            sx={{
              background: "linear-gradient(135deg, #1565C0, #0D47A1)",
              fontFamily: "Poppins, sans-serif",
              fontWeight: 600,
              px: 3,
              py: 1.2,
              borderRadius: "20px",
              "&:hover": {
                background: "linear-gradient(135deg, #1E88E5, #1565C0)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            Generate Report
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontFamily: "Poppins, sans-serif", fontSize: '1.1rem', fontWeight: 600, color: "#fff" }}>
                  Pet Owner
                </TableCell>
                <TableCell sx={{ fontFamily: "Poppins, sans-serif", fontSize: '1.1rem', fontWeight: 600, color: "#fff" }}>
                  Pet
                </TableCell>
                <TableCell sx={{ fontFamily: "Poppins, sans-serif", fontSize: '1.1rem', fontWeight: 600, color: "#fff" }}>
                  Service
                </TableCell>
                <TableCell sx={{ fontFamily: "Poppins, sans-serif", fontSize: '1.1rem', fontWeight: 600, color: "#fff" }}>
                  From
                </TableCell>
                <TableCell sx={{ fontFamily: "Poppins, sans-serif", fontSize: '1.1rem', fontWeight: 600, color: "#fff" }}>
                  To
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appt) => (
                <TableRow key={appt._id} sx={{ '&:hover': { backgroundColor: '#E3F2FD' } }}>
                  <TableCell sx={{ fontFamily: "Poppins, sans-serif", fontSize: '1rem' }}>
                    {appt.userId?.name || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "Poppins, sans-serif", fontSize: '1rem' }}>
                    {appt.petId?.name || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "Poppins, sans-serif", fontSize: '1rem' }}>
                    {appt.services.toString()}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "Poppins, sans-serif", fontSize: '1rem' }}>
                    {appt.appointmentFrom}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "Poppins, sans-serif", fontSize: '1rem' }}>
                    {appt.appointmentTo}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
      
    </>
  );
};

export default DoctorAppointmentView;