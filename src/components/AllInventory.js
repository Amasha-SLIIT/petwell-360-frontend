import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa"; // Import pencil and trash icons
import axios from "axios";
import "./allInventory.css"; 

function AllInventory() {
    const [inventory, setInventory] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);
    const [categories, setCategories] = useState([
        'Pet Food', 'Pet Medicine', 'Pet Toys', 'Pet Accessories', 'Pet Cleaning Supplies'
    ]);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        function getInventory() {
            axios.get("http://localhost:5000/inventory/")
                .then((res) => {
                    console.log("Fetched Inventory Data:", res.data);
                    setInventory(res.data);
                    setFilteredInventory(res.data); // Set filtered items to all initially
                })
                .catch((err) => {
                    console.error("Error fetching inventory:", err);
                    alert(err.message);
                });
        }
        getInventory();
    }, []);

    // Filter inventory based on selected category
    const filterByCategory = (category) => {
        setSelectedCategory(category);
        if (category) {
            // Convert both category and item.category to lowercase for case-insensitive comparison
            setFilteredInventory(inventory.filter(item => item.category.toLowerCase() === category.toLowerCase()));
        } else {
            setFilteredInventory(inventory); // Show all items if no category is selected
        }
    };
    

    const handleAddInventoryClick = () => {
        navigate("/addInventory");
    };

    const handleUpdateClick = (id) => {
        navigate(`/updateInventory/${id}`);
    };

    const handleDeleteClick = (id) => {
        axios.delete(`http://localhost:5000/inventory/${id}`)
            .then(() => {
                alert("Inventory deleted successfully!");
                setInventory(inventory.filter(item => item._id !== id)); // Remove item from the state
                setFilteredInventory(filteredInventory.filter(item => item._id !== id)); // Remove item from the filtered state
            })
            .catch((err) => {
                console.error("Error deleting inventory:", err);
                alert(err.message);
            });
    };

    return (
        <div className="all-inventory-container">
            {/* Header for All Inventory and Add Inventory Button */}
            <div className="header">
                <h1>All Inventory</h1>
                <button className="add-inventory-btn" onClick={handleAddInventoryClick}>
                    Add Inventory
                </button>
            </div>

            <div className="main-content">
                {/* Sidebar for Categories */}
                <div className="sidebar">
                    <h3>Categories</h3>
                    <a href="#" onClick={() => filterByCategory(null)}>All</a>
                    {categories.map(category => (
                        <a key={category} href="#" onClick={() => filterByCategory(category)}>
                            {category}
                        </a>
                    ))}
                </div>

                {/* Inventory Grid - Scrollable */}
                <div className="inventory-grid">
                    {filteredInventory.length > 0 ? (
                        filteredInventory.map((item) => (
                            <div key={item._id} className="inventory-card">
                                <img
                                    src={`http://localhost:5000/uploads/${item.image}`}
                                    alt={item.name}
                                />
                                <h2>{item.name}</h2>
                                <p><strong>Category:</strong> {item.category}</p>
                                <p><strong>Quantity:</strong> {item.quantity}</p>
                                <p><strong>Threshold:</strong> {item.threshold}</p>

                                <div className="icon-container">
                                    <button
                                        className="update-btn"
                                        onClick={() => handleUpdateClick(item._id)}
                                    >
                                        <FaPencilAlt />
                                    </button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDeleteClick(item._id)}
                                    >
                                        <FaTrashAlt className="trash-icon" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No inventory available.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AllInventory;
