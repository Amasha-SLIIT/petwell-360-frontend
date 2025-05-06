import React, { useEffect, useState } from "react";
import axios from "../axios";
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Paper,
  Divider,
  CircularProgress,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import PetOwnerHeader from "../Components/PetOwnerHeader";
import StaffHeader from "../Components/StaffHeader";
import Footer from "../Components/Footer";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [loadingPets, setLoadingPets] = useState(false);
  const navigate = useNavigate();

  // Get user role from localStorage
  const userRole = localStorage.getItem("userRole");
    
  // Determine which header to show based on user role
  const Header = userRole === "admin" || userRole === "staff" ? StaffHeader : PetOwnerHeader;

  // Check if user is pet owner
  const isPetOwner = !(userRole === "admin" || userRole === "staff");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("http://localhost:5000/auth/user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setUser(res.data);
        if (isPetOwner) {
          fetchUserPets();
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchUserPets = async () => {
      setLoadingPets(true);
      try {
        const res = await axios.get("http://localhost:5000/auth/pets", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        setPets(res.data);
      } catch (error) {
        console.error("Error fetching pets:", error);
      } finally {
        setLoadingPets(false);
      }
    };

    fetchUser();
  }, [isPetOwner]);

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box
      sx={{
        minHeight: "100vh",
        pt: "70px",
      }}
    >
      <Header /> 
      <Box sx={{ px: { xs: 2, sm: 4 }, py: 6, maxWidth: 1000, mx: "auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Cover Image */}
          <Paper
            elevation={6}
            sx={{ borderRadius: "12px 12px 0 0", overflow: "hidden", height: 180 }}
          >
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1350&q=80"
              alt="Cover"
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
            />
          </Paper>

          {/* Profile Card */}
          <Paper
            elevation={3}
            sx={{
              p: 4,
              mt: -8,
              position: "relative",
              borderRadius: "0 0 12px 12px",
            }}
          >
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              sx={{ position: "absolute", top: -56, left: 24 }}
            >
              <Avatar
                src="https://cdn-icons-png.flaticon.com/128/149/149071.png"
                alt="User Avatar"
                sx={{ width: 112, height: 112, border: "4px solid #ffffff", boxShadow: 3 }}
              />
            </motion.div>

            <Box sx={{ mt: 8 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                    {user.firstName} {user.lastName}
                  </Typography>
                  {user.username && (
                    <Typography
                      variant="body1"
                      sx={{ fontStyle: "italic" }}
                    >
                      @{user.username}
                    </Typography>
                  )}
                </Box>
                {isPetOwner && (
                  <Box>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => navigate("/registerpet")}
                      sx={{ mr: 2 }}
                    >
                      Add Pet
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => navigate("/CrudTable")}
                    >
                      View All Pets
                    </Button>
                  </Box>
                )}
              </Box>

              <Divider sx={{ mb: 4 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Email
                  </Typography>
                  <Typography sx={{ mb: 2 }}>
                    {user.email}
                  </Typography>

                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Phone
                  </Typography>
                  <Typography sx={{ mb: 2 }}>
                    {user.phoneNumber || "Not provided"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Address
                  </Typography>
                  <Typography sx={{ mb: 2 }}>
                    {user.address || "Not provided"}
                  </Typography>

                  {user.joinDate && (
                    <>
                      <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                        Joined
                      </Typography>
                      <Typography sx={{ mb: 2 }}>
                        {user.joinDate}
                      </Typography>
                    </>
                  )}
                </Grid>
              </Grid>

              {isPetOwner && (
                <>
                  <Typography variant="h5" sx={{ mt: 4, fontWeight: "bold" }}>
                    My Pets
                  </Typography>
                  {loadingPets ? (
                    <CircularProgress sx={{ mt: 2 }} />
                  ) : pets.length > 0 ? (
                    <TableContainer component={Paper} sx={{ mt: 2, mb: 4 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Pet Name</TableCell>
                            <TableCell>Species</TableCell>
                            <TableCell>Age</TableCell>
                            <TableCell>Medical History</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {pets.map((pet) => (
                            <TableRow key={pet._id}>
                              <TableCell>{pet.petName}</TableCell>
                              <TableCell>{pet.species}</TableCell>
                              <TableCell>{pet.age}</TableCell>
                              <TableCell>{pet.medicalHistory}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography sx={{ mt: 2 }}>
                      No pets registered yet.
                    </Typography>
                  )}
                </>
              )}
            </Box>
          </Paper>
        </motion.div>
      </Box>
      <Footer />
    </Box>
  );
};

export default ProfilePage;