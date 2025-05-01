import { useState, useEffect } from "react";
import {
  Container,
  Modal,
  Snackbar,
  Alert,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Rating,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "../axios";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "@fontsource/poppins";
import "@fontsource/pacifico";

const API_URL = "http://localhost:5000/reviews";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [loggedInUser, setLoggedInUser] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openSessionTimeoutModal, setOpenSessionTimeoutModal] = useState(false);
  const [filterRating, setFilterRating] = useState(0);
  const [sortOrder, setSortOrder] = useState("desc");

  const navigate = useNavigate();

  const maxLength = 200;
  const remainingCharacters = maxLength - review.length;

  const handleSnackbarClose = (_, reason) => {
    if (reason === "clickaway") return;
    setOpenSnackbar(false);
  };

  const handleRedirect = () => {
    navigate("/login", { replace: true });
    setOpenSessionTimeoutModal(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) setTimeout(() => setOpenSessionTimeoutModal(true), 100);
  }, []);

  const fetchUser = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoggedInUser(res.data.id);
    } catch (err) {
      console.error("User fetch error", err);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(API_URL);
      let filtered = res.data;

      if (filterRating > 0) {
        filtered = filtered.filter((r) => r.rating >= filterRating);
      }

      if (sortOrder === "desc") {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }

      setReviews(filtered);
    } catch (err) {
      console.error("Review fetch error", err);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchReviews();
  }, [filterRating, sortOrder]);

  const handleSubmit = async () => {
    if (!review || rating === 0) {
      setSnackbarMessage("Please provide both a rating and a review.");
      setOpenSnackbar(true);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      await axios.post(API_URL, {
        ownerID: loggedInUser,
        description: review,
        rating,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReview("");
      setRating(0);
      setSnackbarMessage("Review added successfully!");
      setOpenSnackbar(true);
      fetchReviews();
    } catch (err) {
      console.error("Submit error", err);
    }
  };

  const handleUpdate = async () => {
    if (!editingReviewId || !review || rating === 0) return;
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      await axios.put(`${API_URL}/${editingReviewId}`, {
        description: review,
        rating,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbarMessage("Review updated successfully!");
      setOpenSnackbar(true);
      setReview("");
      setRating(0);
      setEditingReviewId(null);
      fetchReviews();
    } catch (err) {
      console.error("Update error", err);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSnackbarMessage("Review deleted!");
        setOpenSnackbar(true);
        fetchReviews();
      } catch (err) {
        console.error("Delete error", err);
      }
    }
  };

  return (
    <>
        <Box
      sx={{
        position: "fixed",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundImage: `url('https://images.pexels.com/photos/6235240/pexels-photo-6235240.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        zIndex: -1,
        opacity: 0.3,
      }}
/>

      <Header />
      <Container maxWidth="lg" sx={{ mt: 10, fontFamily: "Poppins, sans-serif" }}>
        <Typography
          variant="h3"
          sx={{ textAlign: "center", fontWeight: "bold", color: "#1565C0", mb: 4 }}
        >
          PetWell 360 <span style={{ fontFamily: "Pacifico, cursive" }}>Reviews</span>
        </Typography>

        <Grid container spacing={4}>
          {/* Left Panel: Review Form */}
          <Grid item xs={12} md={4}>
            <Box sx={{ background: "#f9f9f9", p: 3, borderRadius: 3, boxShadow: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                {editingReviewId ? "Update Your Review" : "Leave a Review"}
              </Typography>
              <TextField
                label="Your Review"
                fullWidth
                multiline
                rows={3}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                inputProps={{ maxLength }}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color={remainingCharacters < 0 ? "error" : "textSecondary"}>
                {remainingCharacters} characters remaining
              </Typography>
              <Rating
                value={rating}
                onChange={(e, val) => setRating(val)}
                precision={0.5}
                sx={{ mt: 2 }}
              />
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 2, borderRadius: 2 }}
                onClick={editingReviewId ? handleUpdate : handleSubmit}
              >
                {editingReviewId ? "Update Review" : "Submit Review"}
              </Button>
            </Box>
          </Grid>

          {/* Right Panel: Filters + Review List */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <FormControl sx={{ minWidth: 120 }} size="small">
                <InputLabel>Min Rating</InputLabel>
                <Select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  label="Min Rating"
                >
                  <MenuItem value={0}>All</MenuItem>
                  <MenuItem value={3}>Above 3★</MenuItem>
                  <MenuItem value={4}>Above 4★</MenuItem>
                  <MenuItem value={5}>5★ only</MenuItem>
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 120 }} size="small">
                <InputLabel>Sort</InputLabel>
                <Select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  label="Sort"
                >
                  <MenuItem value="desc">Oldest First</MenuItem>
                  <MenuItem value="asc">Latest First</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Grid container spacing={2}>
              {reviews.map((r) => (
                <Grid item xs={12} key={r._id}>
                  <motion.div initial={{ opacity: 0, y: 30, }} animate={{ opacity: 1, y: 0,}} transition={{ duration: 0.5, ease: "easeOut" }}
>
                    <Card sx={{ borderRadius: 3,boxShadow: "0 6px 16px rgba(0,0,0,0.2)",backgroundColor: "rgba(255, 255, 255, 0.85)" }}>
                      <CardContent>
                        <Typography variant="h6">{r.ownerName || "Anonymous"}</Typography>
                        <Rating value={r.rating} readOnly precision={0.5} />
                        <Typography sx={{ mt: 1 }}>{r.description}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(r.createdAt).toLocaleString()}
                        </Typography>
                        {loggedInUser && String(r.ownerID) === String(loggedInUser) && (
                          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                            <Button size="small" onClick={() => {
                              setEditingReviewId(r._id);
                              setReview(r.description);
                              setRating(r.rating);
                            }}>Edit</Button>
                            <Button size="small" color="error" onClick={() => handleDelete(r._id)}>
                              Delete
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>

        {/* Snackbar */}
        <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={handleSnackbarClose} 
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
>
        <Alert
          severity={snackbarMessage.includes("successfully") || snackbarMessage.includes("deleted") ? "success" : "warning"}
          onClose={handleSnackbarClose}
        >
          {snackbarMessage}
        </Alert>
        </Snackbar>

        {/* Session Timeout Modal */}
        <Modal open={openSessionTimeoutModal} onClose={() => setOpenSessionTimeoutModal(false)}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "white",
              p: 3,
              borderRadius: 2,
              boxShadow: 3,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Your session has expired. Please log in again.
            </Typography>
            <Button variant="contained" onClick={handleRedirect}>Go to Login</Button>
          </Box>
        </Modal>
      </Container>
      <Footer />
    </>
  );
}
