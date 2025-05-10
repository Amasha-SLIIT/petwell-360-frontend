import React, { useState } from "react";
import '../styles/login.css';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Checkbox,
  FormControlLabel,
  Link
} from "@mui/material";
import Header from "../components/PetOwnerHeader";
import Footer from "../components/Footer";
import axios from "../axios";
import { Link as RouterLink } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/auth/login', { email, password });

      console.log("Login response data:", response.data);


      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userRole', response.data.user.role);
        localStorage.setItem('userName', `${response.data.user.firstName} ${response.data.user.lastName}`);
        window.location.href = '/';
      } else {
        console.error("No token received");
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <Box sx={{ background: "linear-gradient(to right,rgb(75, 107, 143),rgb(255, 255, 255))", minHeight: "100vh",  }}>
      <Header />
      <Container maxWidth="sm" sx={{ pt: 10, pb: 8,}}>
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{
            backgroundColor: "#fff",
            borderRadius: 4,
            boxShadow: 4,
            padding: { xs: 4, sm: 6 },
            display: "flex",
            flexDirection: "column",
            gap: 2,
            backgroundColor:"transparent",
            backgroundColor: "rgba(255, 255, 255, 0.7)",

            
          }}
        >
          <Typography variant="h4" align="center" sx={{ color: "#1565C0", fontWeight: "bold" }}>
            Welcome Back!
          </Typography>
          <Typography variant="body2" align="center" sx={{ color: "#424242", fontWeight:"bold"}}>
            Log in to manage appointments, view reviews, and more.
          </Typography>
          <Typography variant="h6" align="center" sx={{ color: "#424242", mb: 1 }}>
            🐾 Trusted by pet owners nationwide
          </Typography>

          {error && (
            <Typography color="error" align="center">
              {error}
            </Typography>
          )}

          <TextField
            label="Email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            fullWidth
            type="password"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <FormControlLabel
              control={<Checkbox size="small" />}
              label="Remember me"
            />
            <Link
              component={RouterLink}
              to="/forgot-password"
              underline="hover"
              sx={{ color: "#1565C0", fontWeight: 500 }}
            >
              Forgot Password?
            </Link>
          </Box>

          <Button
            variant="contained"
            type="submit"
            fullWidth
            sx={{
              background: "linear-gradient(135deg, #1565C0, #0D47A1)",
              color: "#fff",
              fontWeight: "bold",
              borderRadius: "12px",
              padding: "12px",
              "&:hover": {
                background: "#0D47A1",
                transform: "scale(1.02)",
              },
            }}
          >
            Log In
          </Button>

          <Typography variant="body2" align="center" sx={{ color: "#757575" }}>
            Or login with
          </Typography>

          <Button
            variant="outlined"
            fullWidth
            sx={{ borderColor: "#DB4437", color: "#DB4437" }}
          >
            Continue with Google
          </Button>
          <Button
            variant="outlined"
            fullWidth
            sx={{ borderColor: "#4267B2", color: "#4267B2" }}
          >
            Continue with Facebook
          </Button>

          <Typography variant="body2" align="center" sx={{ mt: 1 }}>
            Don’t have an account?{" "}
            <Link
              component={RouterLink}
              to="/register"
              underline="hover"
              sx={{ color: "#1565C0", fontWeight: "bold" }}
            >
              Sign up here
            </Link>
          </Typography>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
};

export default Login;
