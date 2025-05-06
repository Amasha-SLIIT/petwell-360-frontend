import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../axios";
import styles from '../styles/Style/Edit.module.css';
import Header from "../Components/PetOwnerHeader";
import Footer from "../Components/Footer";
import { Box } from "@mui/material"; // Add this for layout

const EditPet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [Care, setCare] = useState({
    petName: "",
    species: "",
    age: "",
    medicalHistory: "",
  });

  useEffect(() => {
    axios.get(`http://localhost:5000/auth/pets/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })
      .then((response) => {
        setCare(response.data);
      })
      .catch((error) => {
        console.error('Error fetching pet:', error);
      });
  }, [id]);

  const handleChange = (event) => {
    setCare({ ...Care, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    axios.put(`http://localhost:5000/auth/pets/${id}`, Care, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })
      .then(() => {
        alert("Pet updated successfully!");
        navigate("/CrudTable");
      })
      .catch((error) => {
        console.error("Error updating pet:", error);
        alert("Update failed!");
      });
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />
      <Box 
        component="main"
        sx={{ 
          flex: 1, 
          p: 3, 
          maxWidth: 800, 
          mx: "auto", 
          width: "100%" 
        }}
      >
        <div className={styles.Edi}>
          <h2>Edit Pet Details</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="petName">Pet Name:</label>
            <input
              type="text"
              id="petName"
              name="petName"
              value={Care.petName}
              onChange={handleChange}
              required
            />

            <label htmlFor="species">Species:</label>
            <select
              id="species"
              name="species"
              value={Care.species}
              onChange={handleChange}
              required
            >
              <option value="" disabled>Select Species</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Other">Other</option>
            </select>

            <label htmlFor="age">Age:</label>
            <input
              type="number"
              id="age"
              name="age"
              value={Care.age}
              onChange={handleChange}
              required
            />

            <label htmlFor="medicalHistory">Medical History:</label>
            <textarea
              id="medicalHistory"
              name="medicalHistory"
              value={Care.medicalHistory}
              onChange={handleChange}
              rows="4"
              required
            />

            <button type="submit">Update</button>
          </form>
        </div>
      </Box>
      <Footer />
    </Box>
  );
};

export default EditPet;