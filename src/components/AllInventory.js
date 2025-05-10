import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaPencilAlt, FaTrashAlt } from "react-icons/fa";
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
    const location = useLocation();
    const highlightRef = useRef(null);

    useEffect(() => {
        function getInventory() {
            axios.get("http://localhost:5000/inventory/")
                .then((res) => {
                    setInventory(res.data);
                    setFilteredInventory(res.data);
                })
                .catch((err) => {
                    console.error("Error fetching inventory:", err);
                    alert(err.message);
                });
        }
        getInventory();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const highlightId = params.get("highlight");
        if (highlightId && highlightRef.current) {
            highlightRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            highlightRef.current.classList.add("highlight");
            setTimeout(() => {
                highlightRef.current?.classList.remove("highlight");
            }, 3000);
        }
    }, [location.search, filteredInventory]);

    const filterByCategory = (category) => {
        setSelectedCategory(category);
        if (category) {
            setFilteredInventory(inventory.filter(item => item.category.toLowerCase() === category.toLowerCase()));
        } else {
            setFilteredInventory(inventory);
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
                setInventory(inventory.filter(item => item._id !== id));
                setFilteredInventory(filteredInventory.filter(item => item._id !== id));
            })
            .catch((err) => {
                console.error("Error deleting inventory:", err);
                alert(err.message);
            });
    };

    const handleUsageInput = (id) => {
        const used = prompt("How many units were used today?");
        if (!used || isNaN(used) || used <= 0) return alert("Please enter a valid number");

        axios.post(`http://localhost:5000/inventory/${id}/add-usage`, { usedCount: Number(used) })
            .then((res) => {
                alert("Usage added successfully");
                setInventory((prev) => prev.map(item => item._id === id ? res.data : item));
                setFilteredInventory((prev) => prev.map(item => item._id === id ? res.data : item));
            })
            .catch((err) => {
                console.error("Error updating usage:", err);
                alert(err.response?.data?.message || "Error updating usage");
            });
    };

    return (
        <div className="all-inventory-container">
            <div className="header">
                <h1>All Inventory</h1>
                <button className="add-inventory-btn" onClick={handleAddInventoryClick}>
                    Add Inventory
                </button>
            </div>

            <div className="main-content">
                <div className="sidebar">
                    <h3>Categories</h3>
                    <a href="#" onClick={() => filterByCategory(null)}>All</a>
                    {categories.map(category => (
                        <a key={category} href="#" onClick={() => filterByCategory(category)}>
                            {category}
                        </a>
                    ))}
                </div>

                <div className="inventory-grid">
                    {filteredInventory.length > 0 ? (
                        filteredInventory.map((item) => (
                            <div
                                key={item._id}
                                ref={location.search.includes(item._id) ? highlightRef : null}
                                className="inventory-card"
                            >
                                <img
                                    src={`http://localhost:5000/uploads/${item.image}`}
                                    alt={item.name}
                                />
                                <h2>{item.name}</h2>
                                <p><strong>Category:</strong> {item.category}</p>
                                <p><strong>Quantity:</strong> {item.quantity}</p>
                                <p><strong>Threshold:</strong> {item.threshold}</p>

                                <div className="icon-container">
                                    <button className="update-btn" onClick={() => handleUpdateClick(item._id)}>
                                        <FaPencilAlt />
                                    </button>
                                    <button className="delete-btn" onClick={() => handleDeleteClick(item._id)}>
                                        <FaTrashAlt className="trash-icon" />
                                    </button>
                                    <button onClick={() => handleUsageInput(item._id)}>Add Usage</button>
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
