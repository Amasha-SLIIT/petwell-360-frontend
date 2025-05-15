import React, { useState } from "react";
import { 
  Container, Typography, TextField, Button, Box, Alert, Paper,
  FormControl, InputLabel, Select, MenuItem, Grid, FormHelperText
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import axios from 'axios';
import '../styles/auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phoneNumber: '',
    role: 'petowner'
  });
  
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: ''
  });
  
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'firstName':
      case 'lastName':
        if (!value.trim()) {
          error = `${name === 'firstName' ? 'First' : 'Last'} name is required`;
        } else if (value.length < 2) {
          error = `${name === 'firstName' ? 'First' : 'Last'} name must be at least 2 characters`;
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) {
          error = 'Email is required';
        } else if (!emailRegex.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
        
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        } else if (!/[A-Z]/.test(value)) {
          error = 'Password must contain at least one uppercase letter';
        } else if (!/[0-9]/.test(value)) {
          error = 'Password must contain at least one number';
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
        
      case 'phoneNumber':
        const phoneRegex = /^\d{10}$/;
        if (value && !phoneRegex.test(value.replace(/[^0-9]/g, ''))) {
          error = 'Please enter a valid 10-digit phone number';
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Validate field on change
    const error = validateField(name, value);
    setErrors(prevErrors => ({
      ...prevErrors,
      [name]: error
    }));
    
    // Special case for confirmPassword - validate when password changes
    if (name === 'password') {
      const confirmError = validateField('confirmPassword', formData.confirmPassword);
      setErrors(prevErrors => ({
        ...prevErrors,
        confirmPassword: confirmError
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};
    
    // Validate all fields
    Object.keys(formData).forEach(field => {
      if (field !== 'address' && field !== 'role') { // Address is optional
        const error = validateField(field, formData[field]);
        newErrors[field] = error;
        if (error) {
          isValid = false;
        }
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    // Validate form before submission
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/auth/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        phoneNumber: formData.phoneNumber,
        role: formData.role
      });
      
      console.log("Registration successful:", response.data);
      
      // Redirect to login page after successful registration
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
      
    } catch (error) {
      setServerError(error.response?.data?.message || 'An error occurred during registration');
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-page">
      <Header />
      <Container maxWidth="md" className="auth-container">
        <Paper elevation={3} className="auth-paper">
          <Typography variant="h4" className="auth-title">
            Create an Account
          </Typography>
          
          {serverError && <Alert severity="error" className="auth-alert">{serverError}</Alert>}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="First Name"
                  name="firstName"
                  fullWidth
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="auth-input"
                  error={Boolean(errors.firstName)}
                />
                {errors.firstName && <FormHelperText error>{errors.firstName}</FormHelperText>}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Last Name"
                  name="lastName"
                  fullWidth
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="auth-input"
                  error={Boolean(errors.lastName)}
                />
                {errors.lastName && <FormHelperText error>{errors.lastName}</FormHelperText>}
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  fullWidth
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="auth-input"
                  error={Boolean(errors.email)}
                />
                {errors.email && <FormHelperText error>{errors.email}</FormHelperText>}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Password"
                  name="password"
                  type="password"
                  fullWidth
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="auth-input"
                  error={Boolean(errors.password)}
                />
                {errors.password && <FormHelperText error>{errors.password}</FormHelperText>}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  fullWidth
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="auth-input"
                  error={Boolean(errors.confirmPassword)}
                />
                {errors.confirmPassword && <FormHelperText error>{errors.confirmPassword}</FormHelperText>}
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  name="address"
                  fullWidth
                  value={formData.address}
                  onChange={handleChange}
                  className="auth-input"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Phone Number"
                  name="phoneNumber"
                  fullWidth
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="auth-input"
                  error={Boolean(errors.phoneNumber)}
                />
                {errors.phoneNumber && <FormHelperText error>{errors.phoneNumber}</FormHelperText>}
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth className="auth-input">
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="petowner">Pet Owner</MenuItem>
                    <MenuItem value="doctor">Doctor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>
          
          <Box className="auth-links">
            <Typography variant="body2">
              Already have an account? 
              <Button 
                color="primary" 
                onClick={() => navigate('/login')}
                className="text-button"
              >
                Login
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
};

export default Register;