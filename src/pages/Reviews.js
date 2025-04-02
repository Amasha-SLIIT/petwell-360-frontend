import { useState, useEffect } from "react";
import { Container, Typography, Box, Card, CardContent, TextField, Button, Grid, Rating } from "@mui/material";
import { motion } from "framer-motion";
import axios from "axios";
import "@fontsource/poppins"; 
import "@fontsource/pacifico"; 

const API_URL = "http://localhost:5000/reviews"; // Backend API URL

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [loggedInUser, setLoggedInUser] = useState("");
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
  const token = localStorage.getItem("authToken"); 

  console.log("JWT Token:", token);

    if (!token) {
      console.log("No token found. User might not be logged in.");
      return;
    }else{
      console.log(" token found !!!! User is logged in.");
    }

    try {
      const response = await axios.get("http://localhost:5000/auth/user", {headers: { Authorization: `Bearer ${token}` },});
      console.log(response.data.id);

      setLoggedInUser(response.data.id); 
      console.log("LoggedInUser:", loggedInUser);


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
      console.error("Please enter a review and select a rating.", loggedInUser, review, rating);
      return;
    }
  
    const token = localStorage.getItem("authToken");
  
    if (!token) {
      console.error("No token found. User might not be logged in.");
      alert("Log in to submit a review.");
      return; 
    }
  
    try {
      const reviewData = {
        ownerID: loggedInUser,
        description: review,
        rating: rating,
      };
  
      console.log("Review Data:", reviewData);
  
      // Define the config object with token before making the request
      const config = {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      };
  
      // Send a POST request to submit the review with the token
      const response = await axios.post("http://localhost:5000/reviews", reviewData, config);
      console.log("Review submitted:", response.data);
  
      // Reset form state after successful submission
      setReview("");
      setRating(0);
      setEditingReviewId(null); // Reset editing state
      fetchReviews(); // Refresh reviews after submission
    } catch (error) {
      console.error("Error saving review:", error.response?.data || error.message);
    }
  };
  


// Update Review Function
const handleUpdate = async () => {
  if (!editingReviewId || !review || rating === 0) {
    console.error("Please enter a review and select a rating.");
    return;
  }

  const token = localStorage.getItem("authToken");

  if (!token) {
    alert("Log in to update a review.");
    return;
  }

  try {
    const updatedReview = { description: review, rating: rating };

    // Send PUT request to update the review
    await axios.put(`${API_URL}/${editingReviewId}`, updatedReview, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Review updated successfully.");
    setReview("");
    setRating(0);
    setEditingReviewId(null);
    fetchReviews(); // Refresh the reviews list
  } catch (error) {
    console.error("Error updating review:", error.response?.data || error.message);
  }
};


// Delete Review Function
const handleDelete = async (id) => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    alert("Log in to delete a review.");
    return;
  }

  try {
    await axios.delete(`${API_URL}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Review deleted successfully.");
    fetchReviews(); // Refresh the reviews list
  } catch (error) {
    console.error("Error deleting review:", error.response?.data || error.message);
  }
};


  const maxLength = 200;
  const remainingCharacters = maxLength - review.length;
  

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
  {reviews.map((r) => {
    console.log("Review Object:", review);
    console.log("Review Owner ID:", review.id);
    

    Object.keys(review).forEach(key => console.log(key));


    return (
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
              {console.log("Review Owner:", r._id, "Logged-in User:", loggedInUser)}
             
              {r.ownerID && loggedInUser._id && String(r.ownerID) === String(loggedInUser._id) && (
                <>

                       
                  <Button
                    variant="text"
                    sx={{ color: "#1565C0", textTransform: "none", fontSize: "14px", ml: 1 }}
                    onClick={() => {
                      setEditingReviewId(r._id); // Set the editing review id
                      setReview(r.description);  // Set the review description
                      setRating(r.rating);       // Set the rating
                    }}
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
    );
  })}
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
          inputProps={{
            maxLength: maxLength, // Set character limit
          }}
        />

        <Typography variant="body2" sx={{ color: remainingCharacters < 0 ? "red" : "gray", fontSize: "12px" }}>
          {remainingCharacters} characters remaining
        </Typography>


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
          onClick={editingReviewId ? handleUpdate : handleSubmit} // Check if editing
        >
          {editingReviewId ? "Update Review" : "Submit Review"}
       
       </Button>

      </Box>
    </Container>
  );
}
