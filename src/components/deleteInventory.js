import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa"; // Importing dustbin icon
import "./deleteInventory.css";
import axios from "axios";

function DeleteInventory() {
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        function getInventory() {
            axios.get("http://localhost:5000/inventory/")
                .then((res) => {
                    setInventory(res.data);
                })
                .catch((err) => {
                    console.error("Error fetching inventory:", err);
                    alert(err.message);
                });
        }
        getInventory();
    }, []);

    const navigate = useNavigate();

    const handleAddInventoryClick = () => {
        navigate("/addInventory");
    };

    // Function to delete an inventory item
    const handleDelete = (id, imageUrl) => {
        axios.delete(`http://localhost:5000/inventory/${id}`)
            .then(() => {
                if (imageUrl) {
                    const fileName = imageUrl.split("/").pop(); // Extract file name from URL
                    axios.delete(`http://localhost:5000/delete-image/${fileName}`); // Call API to delete image from server
                }
                setInventory(inventory.filter(item => item._id !== id)); // Remove item from UI
            })
            .catch((err) => {
                console.error("Error deleting inventory:", err);
                alert("Failed to delete inventory item.");
            });
    };
    return (
        <div className="delete-inventory-container">
            <h1>All Inventory</h1>
            <button className="add-inventory-btn" onClick={handleAddInventoryClick}>
                Add Inventory
            </button>

            <div className="inventory-grid">
                {inventory.length > 0 ? (
                    inventory.map((item) => (
                        <div key={item._id} className="inventory-card">
                            <h2>{item.name}</h2>
                            <p><strong>Quantity:</strong> {item.quantity}</p>
                            <p><strong>Threshold:</strong> {item.threshold}</p>
                            <button className="delete-btn" onClick={() => handleDelete(item._id)}>
                                <FaTrash className="trash-icon" />
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No inventory available.</p>
                )}
            </div>
        </div>
    );
}

export default DeleteInventory;
