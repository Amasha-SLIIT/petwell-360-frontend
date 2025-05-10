import { useState, useEffect } from "react";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; 
import dayjs from "dayjs";
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
  CircularProgress,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "../axios";
import Header from "../components/PetOwnerHeader";
import Footer from "../components/Footer";
import "@fontsource/poppins";
import "@fontsource/pacifico";

const API_URL = "http://localhost:5000/reviews";

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [review, setReview] = useState("");
  const [rating, setRating] = useState(0);
  const [loggedInUser, setLoggedInUser] = useState("");
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || 'petowner');  
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openSessionTimeoutModal, setOpenSessionTimeoutModal] = useState(false);
  const [filterRating, setFilterRating] = useState(0);
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyingToReviewId, setReplyingToReviewId] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);


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
    setLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:5000/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoggedInUser(res.data.id);
      setUserRole(res.data.role);
    } catch (err) {
      console.error("User fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      console.log("Fetched reviews:", res.data);
      let filtered = res.data;
  
      if (filterRating > 0) {
        filtered = filtered.filter((r) => r.rating >= filterRating);
      }
  
      if (sortOrder === "desc") {
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }else {
         filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      }
  
      setReviews(filtered);
    } catch (err) {
      console.error("Review fetch error", err);
    } finally {
      setLoading(false);
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
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingReviewId || !review || rating === 0) return;
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setOpenLoginModal(true);
      return;
    }
    
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
  };

  const handleReplyClick = (reviewId) => {
    setReplyingToReviewId(reviewId);
  };

  const handleReplySubmit = async () => {
    const token = localStorage.getItem("authToken");
    if (!token || !replyingToReviewId) return;
    try {
      await axios.post(`${API_URL}/${replyingToReviewId}/reply`, {
        reply: replyText,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReplyText("");
      setReplyingToReviewId(null);
      fetchReviews();
      setSnackbarMessage("Reply added successfully!");
      setOpenSnackbar(true);
    } catch (err) {
      console.error("Reply error", err);
    }
  };

  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  //report generation

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      setSnackbarMessage("Please select both start and end dates.");
      setOpenSnackbar(true);
      return;
    }
  
    // Convert to Day.js objects at start/end of day
    const start = dayjs(startDate).startOf('day');
    const end = dayjs(endDate).endOf('day');
  
    // Filter reviews within date range
    const filteredReviews = reviews.filter((r) => {
      const reviewDate = dayjs(r.createdAt);
      return reviewDate.isAfter(start.subtract(1, 'day')) && reviewDate.isBefore(end.add(1, 'day'));
    });
  
    // Check if any reviews exist in this range
    if (filteredReviews.length === 0) {
      setSnackbarMessage("No reviews found in the selected date range.");
      setOpenSnackbar(true);
      return;
    }
  
    // Calculate average rating
    const avgRating = filteredReviews.reduce((sum, r) => sum + r.rating, 0) / filteredReviews.length;
  
    // Create PDF
    const doc = new jsPDF();
    
    // Set font that supports star characters
    doc.setFont('helvetica', 'normal');
    
    // Title
    doc.setFontSize(18);
    doc.text("PetWell 360 - Review Report", 14, 20);
    
    // Date range
    doc.setFontSize(12);
    doc.text(`Date Range: ${start.format('YYYY-MM-DD')} to ${end.format('YYYY-MM-DD')}`, 14, 30);
  
    // Star rating function with proper Unicode characters
    const getStarRating = (rating) => {
      return '*'.repeat(Math.round(rating)) + ' '.repeat(5 - Math.round(rating));
    };
  
    // Table data
    const tableData = filteredReviews.map((r) => [
      r.ownerName || "Anonymous",
      getStarRating(r.rating),
      r.description.substring(0, 50) + (r.description.length > 50 ? "..." : ""),
      r.reply ? (r.reply.substring(0, 30) + (r.reply.length > 30 ? "..." : "")) : "N/A",
      dayjs(r.createdAt).format('YYYY-MM-DD'),
    ]);
  
    // Generate table
    autoTable(doc, {
      head: [["Name", "Rating", "Review", "Reply", "Date"]],
      body: tableData,
      startY: 40,
      styles: { 
        fontSize: 10,
        cellPadding: 4,
        halign: 'left',
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [33, 150, 243], // Blue header
        textColor: 255, // White text
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Name
        1: { cellWidth: 20, halign: 'center' }, // Rating (centered)
        2: { cellWidth: 45 }, // Review
        3: { cellWidth: 30 }, // Reply
        4: { cellWidth: 20 }  // Date
      }
    });
  
    // Footer of report
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`Report Summary: ${filteredReviews.length} reviews | Average Rating: ${avgRating.toFixed(1)}`, 14, finalY);
    
    doc.setFontSize(9);
    doc.text(`Generated on: ${dayjs().format('YYYY-MM-DD HH:mm')}`, 14, finalY + 8);
  
    doc.save(`Review_Report_${start.format("YYYYMMDD")}_to_${end.format("YYYYMMDD")}.pdf`);
  };

  console.log("Current user role:", userRole);
  return (
    <>
      <Box sx={{
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
      }} />

      <Header setOpenLogoutModal={setOpenLogoutModal} />
      <Container maxWidth="lg" sx={{ mt: 10, fontFamily: "Poppins, sans-serif" }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        )}

        <Typography variant="h3" sx={{ textAlign: "center", fontWeight: "bold", color: "#1565C0", mb: 4 }}>
          PetWell 360 <span style={{ fontFamily: "Pacifico, cursive", fontWeight: "lighter" }}>Reviews</span>
        </Typography>

        <Grid container spacing={4}>
          {userRole === 'petowner' && (
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
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="primary" /> : editingReviewId ? "Update Review" : "Submit Review"}
                </Button>
              </Box>
            </Grid>
          )}

          <Grid item xs={12} md={userRole === 'admin' ? 12 : 8}>
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
            

                {(userRole === 'admin' || userRole === 'staff') && (
                <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      slotProps={{ textField: { size: "small" } }}
                    />
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      slotProps={{ textField: { size: "small" } }}
                    />
                  </LocalizationProvider>
                  <Button 
                    variant="contained" 
                    onClick={handleGenerateReport}
                    sx={{ borderRadius: 2 }}
                  >
                    Generate PDF
                  </Button>
                </Box>
              )}


            <Grid container spacing={2}>
              {reviews.map((r) => (
                <Grid item xs={12} key={r._id}>
                  <motion.div 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <Card sx={{ borderRadius: 3, boxShadow: "0 6px 16px rgba(0,0,0,0.2)", backgroundColor: "rgba(255, 255, 255, 0.85)" }}>
                      <CardContent>
                        <Typography variant="h6">{r.ownerName || "Anonymous"}</Typography>
                        <Rating value={r.rating} readOnly precision={0.5} />
                        <Typography sx={{ mt: 1 }}>{r.description}</Typography>
                        {r.reply && (
                          <Typography sx={{ mt: 1, fontStyle: "italic", color: "#1565C0" }}>
                            Reply: {r.reply}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {new Date(r.createdAt).toLocaleString()}
                        </Typography>
                        {loggedInUser && String(r.ownerID) === String(loggedInUser) && (
                          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 1 }}>
                            <Button 
                              size="small" 
                              onClick={() => {
                                if (!loggedInUser) {
                                  setOpenLoginModal(true);
                                } else {
                                  setEditingReviewId(r._id);
                                  setReview(r.description);
                                  setRating(r.rating);
                                }
                              }}
                            >
                              Edit
                            </Button>
                            <Button 
                              size="small" 
                              color="error" 
                              onClick={() => {
                                if (!loggedInUser) {
                                  setOpenLoginModal(true);
                                } else {
                                  setReviewToDelete(r._id);
                                  setOpenDeleteModal(true);
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </Box>
                        )}
                        {userRole === 'admin' && (
                          <Box sx={{ mt: 2 }}>
                            <Button 
                              size="small" 
                              onClick={() => {
                                if (!loggedInUser) {
                                  setOpenLoginModal(true);
                                } else {
                                  handleReplyClick(r._id);
                                }
                              }}
                            >
                              Reply
                            </Button>
                            {replyingToReviewId === r._id && (
                              <Box sx={{ mt: 1 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  label="Your reply"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                />
                                <Button 
                                  variant="contained" 
                                  sx={{ mt: 1 }} 
                                  onClick={handleReplySubmit}
                                >
                                  Submit Reply
                                </Button>
                              </Box>
                            )}
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

        <Snackbar 
          open={openSnackbar} 
          autoHideDuration={3000} 
          onClose={handleSnackbarClose} 
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert 
            severity={snackbarMessage.includes("successfully") || snackbarMessage.includes("deleted") ? "success" : "warning"} 
            onClose={handleSnackbarClose}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>

        {/* Session Timeout Modal */}
        <AnimatePresence>
          {openSessionTimeoutModal && (
            <Modal 
              open={openSessionTimeoutModal} 
              onClose={() => setOpenSessionTimeoutModal(false)}
            >
              <motion.div
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <motion.div variants={modalVariants}>
                  <Box sx={{
                    bgcolor: "white",
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 3,
                    textAlign: "center",
                    width: 400,
                  }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Your session has expired. Please log in again.
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={handleRedirect}
                    >
                      Go to Login
                    </Button>
                  </Box>
                </motion.div>
              </motion.div>
            </Modal>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {openDeleteModal && (
            <Modal 
              open={openDeleteModal} 
              onClose={() => setOpenDeleteModal(false)}
            >
              <motion.div
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <motion.div variants={modalVariants}>
                  <Box sx={{
                    bgcolor: "white",
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 3,
                    textAlign: "center",
                    width: 400,
                  }}>
                    <Typography variant="h6" gutterBottom>
                      Confirm Deletion
                    </Typography>
                    <Typography sx={{ mb: 3 }}>
                      Are you sure you want to delete this review?
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => setOpenDeleteModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="contained" 
                        color="error"
                        onClick={() => {
                          handleDelete(reviewToDelete);
                          setOpenDeleteModal(false);
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                </motion.div>
              </motion.div>
            </Modal>
          )}
        </AnimatePresence>

        {/* Login Modal */}
        <AnimatePresence>
          {openLoginModal && (
            <Modal 
              open={openLoginModal} 
              onClose={() => setOpenLoginModal(false)}
            >
              <motion.div
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <motion.div variants={modalVariants}>
                  <Box sx={{
                    bgcolor: "white",
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 3,
                    textAlign: "center",
                    width: 400,
                  }}>
                    <Typography variant="h6" gutterBottom>
                      Login Required
                    </Typography>
                    <Typography sx={{ mb: 3 }}>
                      You need to be logged in to perform this action.
                    </Typography>
                    <Button 
                      variant="contained" 
                      onClick={() => {
                        setOpenLoginModal(false);
                        navigate("/login");
                      }}
                    >
                      Go to Login
                    </Button>
                  </Box>
                </motion.div>
              </motion.div>
            </Modal>
          )}
        </AnimatePresence>

        {/* Logout Confirmation Modal */}
        <AnimatePresence>
          {openLogoutModal && (
            <Modal 
              open={openLogoutModal} 
              onClose={() => setOpenLogoutModal(false)}
            >
              <motion.div
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <motion.div variants={modalVariants}>
                  <Box sx={{
                    bgcolor: "white",
                    p: 4,
                    borderRadius: 2,
                    boxShadow: 3,
                    textAlign: "center",
                    width: 400,
                  }}>
                    <Typography variant="h6" gutterBottom>
                      Confirm Logout
                    </Typography>
                    <Typography sx={{ mb: 3 }}>
                      Are you sure you want to logout?
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                      <Button 
                        variant="outlined" 
                        onClick={() => setOpenLogoutModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => {
                          localStorage.removeItem("authToken");
                          setLoggedInUser("");
                          setUserRole('petowner');
                          setOpenLogoutModal(false);
                          navigate("/");
                        }}
                      >
                        Logout
                      </Button>
                    </Box>
                  </Box>
                </motion.div>
              </motion.div>
            </Modal>
          )}
        </AnimatePresence>
      </Container>
      {/* <Footer /> */}
    </>
  );
}