import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./InventoryDashboard.css";

function InventoryDashboard() {
  const [stats, setStats] = useState({ mostUsed: [], leastUsed: [], lowStock: [] });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/inventory/usage-stats")
      .then((res) => {
        setStats(res.data || { mostUsed: [], leastUsed: [], lowStock: [] });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching inventory stats:", err);
        alert("Failed to load inventory stats.");
        setLoading(false);
      });
  }, []);

  const renderItems = (items, onClickHandler = null) => (
    <div className="dashboard-list">
      {items && items.length > 0 ? items.map(item => (
        <div
          key={item._id}
          className="dashboard-card"
          onClick={() => onClickHandler && onClickHandler(item._id)}
          style={{ cursor: onClickHandler ? "pointer" : "default" }}
        >
          <img src={`http://localhost:5000/uploads/${item.image}`} alt={item.name} />
          <div>
            <h3>{item.name}</h3>
            <p><strong>Category:</strong> {item.category}</p>
            <p><strong>Quantity:</strong> {item.quantity}</p>
            <p><strong>Usage Count:</strong> {item.usageCount || 0}</p>
          </div>
        </div>
      )) : <p>No data available</p>}
    </div>
  );

  const handleLowStockClick = (itemId) => {
    navigate(`/updateInventory/${itemId}`);
  };

  return (
    <div className="inventory-dashboard">
      <h1>Inventory Usage Dashboard</h1>

      {loading ? <p>Loading...</p> : (
        <>
          <div className="dashboard-sections">
  <div className="dashboard-box">
    <h2>🟢 Most Used Items</h2>
    {renderItems(stats.mostUsed)}
  </div>

  <div className="dashboard-box">
    <h2>🟡 Least Used Items</h2>
    {renderItems([...stats.leastUsed].sort((a, b) => (a.usageCount || 0) - (b.usageCount || 0)))}
  </div>

  <div className="dashboard-box">
    <h2>🔴 Low Stock Items</h2>
    {renderItems(stats.lowStock, handleLowStockClick)}
  </div>
</div>

        </>
      )}
    </div>
  );
}

export default InventoryDashboard;
