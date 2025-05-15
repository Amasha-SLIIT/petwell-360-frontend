import { useState, useEffect } from "react";
import { Container, Typography, Box, Card, CardContent, TextField, Button, Grid, Rating } from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import "@fontsource/poppins"; // Import Poppins font
import "@fontsource/pacifico"; // Import Pacifico font

const API_URL = "http://localhost:5000/reviews"; // Backend API URL

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);

  // Fetch Reviews from Backend
  const fetchReviews = async () => {
    try {
      const response = await axios.get(API_URL);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  // Fetch logged-in user details using the JWT token
  const fetchUser = async () => {
    const token = localStorage.getItem("authToken"); // Retrieve JWT token

    if (!token) {
      console.log("No token found. User might not be logged in.");
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoggedInUser(response.data); // Set logged-in user
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  useEffect(() => {
    fetchUser(); // Fetch logged-in user details
    fetchReviews(); // Fetch reviews from backend
  }, []);

  // Submit Review to Backend
  const handleSubmit = async () => {
    if (!loggedInUser || !review || rating === 0) {
      console.error("Please enter a review and select a rating.");
      return;
    }

    const token = localStorage.getItem("authToken"); // Retrieve token

    if (!token) {
      console.error("No token found. User might not be logged in.");
      alert("You must be logged in to submit a review.");
      return; // Stop execution if there's no token
    }

    try {
      const reviewData = {
        ownerID: loggedInUser?.ownerID,
        description: review,
        rating: rating,
      };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in headers
        },
      };

      if (editingReviewId) {
        // If editing, send a PUT request with token
        await axios.put(`${API_URL}/${editingReviewId}`, reviewData, config);
      } else {
        // Otherwise, send a POST request with token
        await axios.post(API_URL, reviewData, config);
      }

      setReview("");
      setRating(0);
      setEditingReviewId(null); // Reset editing state
      fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error("Error saving review:", error.response?.data || error.message);
    }
  };

  // Update review
  const handleEdit = (review) => {
    setReview(review.description);
    setRating(review.rating);
    setEditingReviewId(review._id); // Store the review ID being edited
  };

  // Delete review
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchReviews(); // Refresh reviews
    } catch (error) {
      console.error("Error deleting review:", error.response?.data || error.message);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, fontFamily: "Poppins, sans-serif" }}>
      {/* Header */}
      <Typography
        variant="h3"
        sx={{
          textAlign: "center",
          fontWeight: "bold",
          mb: 4,
          color: "#1565C0",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        PetWell 360{" "}
        <span style={{ fontFamily: "Pacifico, cursive", fontWeight: "normal" }}>Reviews</span> 🐶🐾
      </Typography>

      {/* Ribbon Background */}
      <Box
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          top: "20%",
          height: "85%",
          backgroundImage: `url('https://images.pexels.com/photos/6235240/pexels-photo-6235240.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          zIndex: -1,
          opacity: 0.7,
        }}
      />

      {/* Reviews List */}
      <Grid container spacing={3}>
        {reviews.map((r) => (
          <Grid item xs={12} key={r._id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card sx={{ borderRadius: "15px", boxShadow: 3, background: "white", zIndex: 1 }}>
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#1565C0", fontFamily: "Poppins, sans-serif" }}
                  >
                    {r.ownerName ? r.ownerName : "Anonymous"}
                  </Typography>
                  <Typography variant="body1">{r.description}</Typography>
                  <Typography variant="body2" sx={{ color: "#757575", fontSize: "12px" }}>
                    {new Date(r.createdAt).toLocaleString()}
                  </Typography>

                  {/* EDIT AND DELETE BUTTONS */}
                  {r.ownerID?._id && loggedInUser?.ownerID === r.ownerID._id && (
                    <>
                      <Button
                        variant="text"
                        sx={{ color: "#1565C0", textTransform: "none", fontSize: "14px", ml: 1 }}
                        onClick={() => handleEdit(r)}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="text"
                        sx={{ color: "red", textTransform: "none", fontSize: "14px", ml: 1 }}
                        onClick={() => handleDelete(r._id)}
                      >
                        Delete
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Review Form */}
      <Box
        sx={{
          mt: 6,
          p: 4,
          background: "#ffffff",
          borderRadius: "15px",
          boxShadow: 3,
          textAlign: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 3,
            fontWeight: "normal",
            color: "#1565C0",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          <span style={{ fontFamily: "Pacifico, cursive" }}>Leave a Review</span> ✨
        </Typography>

        <TextField
          label="Your Review"
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          sx={{ mb: 3, fontFamily: "Poppins, sans-serif" }}
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        {/* Rating Selection */}
        <Box sx={{ mb: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Typography variant="body1" sx={{ mb: 1, fontFamily: "Poppins, sans-serif" }}>
            Select Rating:
          </Typography>
          <Rating
            name="review-rating"
            value={rating}
            precision={0.5} // Allows half-star ratings
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
            size="large"
          />
        </Box>

        <Button
          variant="contained"
          sx={{
            background: "#1565C0",
            color: "white",
            borderRadius: "10px",
            fontSize: "16px",
            padding: "10px 20px",
            transition: "0.3s",
            "&:hover": { background: "#0d47a1", transform: "scale(1.05)" },
            fontFamily: "Poppins, sans-serif",
          }}
          onClick={handleSubmit}
        >
          Submit Review
        </Button>
      </Box>
    </Container>
  );
}
