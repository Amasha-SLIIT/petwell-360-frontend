import React, { useState } from "react";
import '../styles/Style/Style.module.css';
import { useNavigate } from "react-router-dom";
import axios from "../axios";
import Header from "../Components/PetOwnerHeader";
import Footer from "../Components/Footer";




const PetRegister = () => {
  const [petName, setPetName] = useState("");
  const [species, setSpecies] = useState("");
  const [age, setAge] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");

  
  const [Care,setCare] =useState({

    petName:'',
    species:'',
    age:'',
    medicalHistory:'',
   
});

const navigate = useNavigate();


const handleChange = (event) => {
  setCare({ ...Care, [event.target.name]: event.target.value });
};

const handleSubmit = (event) => {
    event.preventDefault();

   
    axios.post('http://localhost:5000/auth/pets', Care, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })
        .then((response) => {
            console.log('Slot success:', response.data);
            alert("Your Slot added Created!");
            navigate('/Profile');
        })
        .catch((error) => {
            console.error('Error  :', error);
            alert(error.response?.data?.message || "Error to add a  slot!");
        });
};




  return (
    
    <div className="Reg" >
      <Header/>
      <h2>Pet Care Form</h2>
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
        
        <button type="submit">Submit</button>
      </form>
      <Footer/>
    </div>
  );
};

export default PetRegister;