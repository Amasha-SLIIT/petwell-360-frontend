import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../axios";
import styles from "../styles/Style/Edit.module.css";
import Header from "../components/PetOwnerHeader";
import Footer from "../components/Footer";
import { Box } from "@mui/material";

const EditPet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [Care, setCare] = useState({
    petName: "",
    species: "",
    age: 0, // Initialize as number to match schema
    medicalHistory: "",
  });

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/pets/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      })
      .then((response) => {
        const { petName, species, age, medicalHistory } = response.data;
        setCare({
          petName: petName || "",
          species: species || "",
          age: age !== undefined ? age : 0, // Ensure age is a number
          medicalHistory: medicalHistory || "",
        });
      })
      .catch((error) => {
        console.error("Error fetching pet:", error);
        alert(`Failed to fetch pet: ${error.response?.data?.message || "Please try again."}`);
      });
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setCare((prev) => ({
      ...prev,
      [name]: name === "age" ? (value === "" ? 0 : Number(value)) : value, // Convert age to number
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    axios
      .put(`http://localhost:5000/api/pets/${id}`, Care, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      })
      .then(() => {
        alert("Pet updated successfully!");
        navigate("/CrudTable");
      })
      .catch((error) => {
        console.error("Error updating pet:", error);
        alert(`Update failed: ${error.response?.data?.message || "Please try again."}`);
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
          width: "100%",
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
              <option value="" disabled>
                Select Species
              </option>
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