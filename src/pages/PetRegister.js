import "../styles/Style/Style.module.css";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axios";
import Header from "../components/PetOwnerHeader";
import Footer from "../components/Footer";

const PetRegister = () => {
  const [petData, setPetData] = useState({
    petName: "",
    species: "",
    age: 0, // Initialize as number
    medicalHistory: "",
  });

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setPetData({
      ...petData,
      [name]: name === "age" ? (value === "" ? 0 : Number(value)) : value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await axios.post("/api/pets", petData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      alert("Pet registered successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error registering pet:", error.response?.data);
      alert(error.response?.data?.message || "Failed to register pet. Please try again.");
    }
  };

  return (
    <div className="Reg">
      <Header />
      <h2>Pet Registration</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="petName">Pet Name:</label>
        <input
          type="text"
          id="petName"
          name="petName"
          value={petData.petName}
          onChange={handleChange}
          required
        />

        <label htmlFor="species">Species:</label>
        <select
          id="species"
          name="species"
          value={petData.species}
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
          value={petData.age}
          onChange={handleChange}
          required
        />

        <label htmlFor="medicalHistory">Medical History:</label>
        <textarea
          id="medicalHistory"
          name="medicalHistory"
          value={petData.medicalHistory}
          onChange={handleChange}
          rows="4"
          required
        />

        <button type="submit">Register Pet</button>
      </form>
      <Footer />
    </div>
  );
};

export default PetRegister;