
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./allInventory.css"; // Reuse the same styles

function AllInventoryView() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [categories, setCategories] = useState([
    'Pet Food', 'Pet Medicine', 'Pet Toys', 'Pet Accessories', 'Pet Cleaning Supplies'
  ]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const highlightRef = useRef(null);

  useEffect(() => {
    axios.get("http://localhost:5000/inventory/")
      .then((res) => {
        setInventory(res.data);
        setFilteredInventory(res.data);
      })
      .catch((err) => {
        console.error("Error fetching inventory:", err);
        alert(err.message);
      });
  }, []);

  const filterByCategory = (category) => {
    setSelectedCategory(category);
    if (category) {
      setFilteredInventory(inventory.filter(item => item.category.toLowerCase() === category.toLowerCase()));
    } else {
      setFilteredInventory(inventory);
    }
  };

  return (
    <div className="all-inventory-container">
      <div className="header">
        <h1>Store</h1>
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
              <div key={item._id} className="inventory-card">
                <img
                  src={`http://localhost:5000/uploads/${item.image}`}
                  alt={item.name}
                />
                <h2>{item.name}</h2>
                <p className={item.quantity > 0 ? "in-stock" : "out-of-stock"}>
                  {item.quantity > 0 ? "In Stock" : "Out of Stock"}
                </p>
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

export default AllInventoryView;