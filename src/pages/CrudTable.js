import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../axios";
import '../styles/Style/CrudTable.module.css'
import Header from "../Components/PetOwnerHeader";
import Footer from "../Components/Footer";



const PetRegister = () => {
  const [Care, setCare] = useState({
    petName: '',
    species: '',
    age: '',
    medicalHistory: '',
  });

  const [petRecords, setPetRecords] = useState([]);
  const navigate = useNavigate();

  // Fetch all records when the component mounts
  useEffect(() => {
    axios.get('http://localhost:5000/auth/pets', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })
      .then((response) => {
        setPetRecords(response.data);
      })
      .catch((error) => {
        console.error('Error fetching pet records:', error);
      });
  }, []);

  const handleChange = (event) => {
    setCare({ ...Care, [event.target.name]: event.target.value });
  };

  

    // Create or update pet record
    const handleSubmit = (event) => {
      event.preventDefault();
    
      // Create or update pet record
      if (Care._id) {
        // If there is an ID, we are updating the record
        axios.put(`http://localhost:5000/auth/pets/${Care._id}`, Care)
          .then((response) => {
            console.log('Record updated:', response.data);
            alert("Pet record updated!");
            navigate('/');
            // Refresh records after update
            setPetRecords((prevRecords) => prevRecords.map((record) =>
              record._id === Care._id ? response.data : record
            ));
          })
          .catch((error) => {
            console.error('Error updating record:', error);
            alert("Error updating record!");
          });
      } else {
        // If there is no ID, we are creating a new record
        axios.post('http://localhost:5000/auth/pets', Care)
          .then((response) => {
            console.log('New record created:', response.data);
            alert("Pet record created!");
            setPetRecords((prevRecords) => [...prevRecords, response.data]); // Add new pet to the list
          })
          .catch((error) => {
            console.error('Error creating record:', error);
            alert("Error creating record!");
          });
      }
    
      // Reset form after submit
      setCare({
        petName: '',
        species: '',
        age: '',
        medicalHistory: '',
      });
    };
  
  

  const handleEdit = (record) => {
    setCare(record); // Populate form with record to edit
  };

  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/auth/pets/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
      }
    })
      .then((response) => {
        console.log('Record deleted:', response.data);
        alert("Pet record deleted!");
        setPetRecords((prevRecords) => prevRecords.filter((record) => record._id !== id));
      })
      .catch((error) => {
        console.error('Error deleting record:', error);
        alert("Error deleting record!");
      });
  };

  return (
    <div>
      <Header/>

      <h2>Pet Records</h2>
      <table>
        <thead>
          <tr>
            <th>Pet Name</th>
            <th>Species</th>
            <th>Age</th>
            <th>Medical History</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {petRecords.map((record) => (
            <tr key={record._id}>
              <td>{record.petName}</td>
              <td>{record.species}</td>s
              <td>{record.age}</td>
              <td>{record.medicalHistory}</td>
              <td>
              <Link to={`/Edit/${record._id}`}><button>Edit</button></Link>

                <button onClick={() => handleDelete(record._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Footer/>
    </div>
  );
};

export default PetRegister;
