import React, { useState } from "react";
import { Container, Typography, TextField, Button, Box, Alert, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import axios from 'axios';
import '../styles/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/auth/login', { 
        email, 
        password 
      });
      
      console.log("Login successful:", response.data);
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Redirect based on role
      if (response.data.user.role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/');
      }
      
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during login');
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-page">
      <Header />
      <Container maxWidth="sm" className="auth-container">
        <Paper elevation={3} className="auth-paper">
          <Typography variant="h4" className="auth-title">
            Welcome Back
          </Typography>
          
          {error && <Alert severity="error" className="auth-alert">{error}</Alert>}
          
          <form onSubmit={handleLogin} className="auth-form">
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
            />
            
            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
            />
            
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              disabled={loading}
              className="auth-button"
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          
          <Box className="auth-links">
            <Typography variant="body2">
              Don't have an account? 
              <Button 
                color="primary" 
                onClick={() => navigate('/register')}
                className="text-button"
              >
                Register
              </Button>
            </Typography>
          </Box>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
};

export default Login;
