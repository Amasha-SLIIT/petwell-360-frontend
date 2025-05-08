import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./updateInventory.css";

function UpdateInventory() {
    const [inventoryItem, setInventoryItem] = useState({
        name: "",
        category: "",
        quantity: "",
        threshold: 0,
    });
    const [image, setImage] = useState(null);

    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        axios
            .get(`http://localhost:5000/inventory/${id}`)
            .then((res) => {
                setInventoryItem(res.data);
            })
            .catch((err) => {
                console.error("Error fetching inventory item:", err);
                alert(err.message);
            });
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setInventoryItem((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
        }
    };

    const incrementThreshold = () => {
        setInventoryItem((prev) => ({
            ...prev,
            threshold: Number(prev.threshold) + 1,
        }));
    };

    const decrementThreshold = () => {
        setInventoryItem((prev) => ({
            ...prev,
            threshold: prev.threshold > 0 ? Number(prev.threshold) - 1 : 0,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!inventoryItem.name || inventoryItem.quantity < 0 || inventoryItem.threshold < 0) {
            alert("All fields must be filled correctly. Threshold must be greater than 0.");
            return;
        }

        const formData = new FormData();
        formData.append("name", inventoryItem.name);
        formData.append("category", inventoryItem.category);
        formData.append("quantity", inventoryItem.quantity);
        formData.append("threshold", inventoryItem.threshold);

        if (image) {
            formData.append("image", image);
        }

        axios
            .put(`http://localhost:5000/inventory/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })
            .then(() => {
                alert("Inventory updated successfully!");
                navigate("/allInventory");
            })
            .catch((err) => {
                console.error("Error updating inventory:", err);
                alert(err.message || "An error occurred while updating the inventory.");
            });
    };

    return (
        <div className="update-inventory-container">
            <h2>Update Inventory</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Product Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={inventoryItem.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category:</label>
                    <select
                        id="category"
                        name="category"
                        value={inventoryItem.category}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Select Category</option>
                        <option value="pet food">Pet Food</option>
                        <option value="pet medicine">Pet Medicine</option>
                        <option value="pet toys">Pet Toys</option>
                        <option value="pet accessories">Pet Accessories</option>
                        <option value="pet cleaning supplies">Pet Cleaning Supplies</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="quantity">Quantity:</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={inventoryItem.quantity}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="threshold">Threshold:</label>
                    <div className="d-flex align-items-center">
                        <button
                            type="button"
                            onClick={decrementThreshold}
                            className="btn btn-secondary threshold-btn"
                        >
                            -
                        </button>
                        <span className="mx-3">{inventoryItem.threshold}</span>
                        <button
                            type="button"
                            onClick={incrementThreshold}
                            className="btn btn-secondary threshold-btn"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="image">Product Image (Optional):</label>
                    {inventoryItem.imageUrl && (
                        <img src={inventoryItem.imageUrl} alt="Product" width="100" />
                    )}
                    <input type="file" id="image" onChange={handleImageChange} />
                </div>

                <button type="submit" className="btn btn-primary">
                    Update Inventory
                </button>
            </form>
        </div>
    );
}

export default UpdateInventory;
