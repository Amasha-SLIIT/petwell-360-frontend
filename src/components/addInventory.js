import './addInventory.css';
import React, { useState } from "react";
import axios from "axios";

function AddInventory() {
  const [name, setInventoryName] = useState("");
  const [category, setInventoryCategory] = useState("");
  const [quantity, setInventoryQuantity] = useState("");
  const [threshold, setInventoryThreshold] = useState(0);
  const [image, setImage] = useState(null); // State to hold the image file

  // Handle form submission
  function sendData(e) {
    e.preventDefault();

    // Check if all required fields are filled
    if (name && category && quantity > 0 && threshold > 0 && image) {
      const formData = new FormData(); // Create FormData object to handle file upload

      // Append data to the FormData object
      formData.append("name", name);
      formData.append("category", category);
      formData.append("quantity", quantity);
      formData.append("threshold", threshold);
      formData.append("image", image); // Append the image file

      // Send post request with FormData
      axios
        .post("http://localhost:5000/inventory/add", formData, {
          headers: {
            "Content-Type": "multipart/form-data", // Required for file upload
          },
        })
        .then(() => {
          alert("Item Added");
          // Clear form fields after submission
          setInventoryName("");
          setInventoryCategory("");
          setInventoryQuantity("");
          setInventoryThreshold(0);
          setImage(null);
         
          
        })
        .catch((err) => {
          // Handle error responses
          if (err.response) {
            alert("Error: " + err.response.data.message || err.response.statusText);
          } else if (err.request) {
            alert("Error: No response from server.");
          } else {
            alert("Error: " + err.message);
          }
        });
    } else {
      alert("Please fill out all fields with valid values.");
    }
  }

  // Handle threshold increment and decrement
  const incrementThreshold = () => setInventoryThreshold(threshold + 1);
  const decrementThreshold = () => setInventoryThreshold(threshold > 0 ? threshold - 1 : 0);

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file); // Store the selected file in state
    }
  };

  return (
    <div className="container">
      <h2>Add Inventory</h2>
      <form onSubmit={sendData}>
        <div className="mb-3">
          <label htmlFor="name">Inventory Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={name}
            onChange={(e) => setInventoryName(e.target.value)}
            placeholder="Enter Inventory name"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="category">Inventory Category</label>
          <select
            className="form-control"
            id="category"
            value={category}
            onChange={(e) => setInventoryCategory(e.target.value)}
          >
            <option value="">Select Category</option>
            <option value="pet food">Pet Food</option>
            <option value="pet medicine">Pet Medicine</option>
            <option value="pet toys">Pet Toys</option>
            <option value="pet accessories">Pet Accessories</option>
            <option value="pet cleaning supplies">Pet Cleaning Supplies</option>
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="quantity">Inventory Quantity</label>
          <input
            type="number"
            className="form-control"
            id="quantity"
            value={quantity}
            onChange={(e) => setInventoryQuantity(e.target.value)}
            min="1"
            placeholder="Enter Inventory quantity"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="threshold">Inventory Threshold</label>
          <div className="d-flex align-items-center">
            <button
              type="button"
              className="btn btn-secondary threshold-btn"
              onClick={decrementThreshold}
            >
              -
            </button>
            <span className="mx-3">{threshold}</span>
            <button
              type="button"
              className="btn btn-secondary threshold-btn"
              onClick={incrementThreshold}
            >
              +
            </button>
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="image">Upload Image</label>
          <input
            type="file"
            className="form-control"
            id="image"
            onChange={handleImageChange} // Handle image selection
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
}

export default AddInventory;
