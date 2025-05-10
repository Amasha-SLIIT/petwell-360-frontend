import React, { useState } from "react";
import { Box, Container, TextField, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import axios from "../axios";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: '',
    role: 'petowner'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/register', formData);
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('userRole', response.data.user.role);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert(error.response?.data?.message || 'Registration failed. Please try again.');

    }
  };


  return (
    <>
      <Box sx={{ background: "#f5f5f5", minHeight: "100vh", pt: 10 }}>
        <Container maxWidth="sm">
          <form onSubmit={handleSubmit}>
          <TextField
        name="firstName"
        label="First Name"
        value={formData.firstName}
        onChange={handleChange}
        required
        fullWidth
        margin="normal"
      />
      <TextField
        name="lastName"
        label="Last Name"
        value={formData.lastName}
        onChange={handleChange}
        required
        fullWidth
        margin="normal"
      />
      <TextField
        name="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        fullWidth
        margin="normal"
      />
      <TextField
        name="password"
        label="Password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        required
        fullWidth
        margin="normal"
      />
      <TextField
        name="phoneNumber"
        label="Phone Number"
        value={formData.phoneNumber}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <TextField
        name="address"
        label="Address"
        value={formData.address}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Role</InputLabel>
        <Select
          name="role"
          value={formData.role}
          onChange={handleChange}
          label="Role"
        >
          <MenuItem value="petowner">Pet Owner</MenuItem>
          <MenuItem value="staff">Staff Member</MenuItem>
          <MenuItem value="admin">Administrator</MenuItem>
        </Select>
      </FormControl>
      <Button type="submit" variant="contained" color="primary">
        Register
      </Button>
          </form>
        </Container>
      </Box>
    </>
  );


}
export default Register;