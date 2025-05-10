import React from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PetsIcon from "@mui/icons-material/Pets";
import ArticleIcon from "@mui/icons-material/Article";
import EventIcon from "@mui/icons-material/Event";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import "@fontsource/poppins";
import PetOwnerHeader from "../components/PetOwnerHeader";
import StaffHeader from "../components/StaffHeader";
import Footer from "../components/Footer";

const Home = () => {
  // Get user role from localStorage
  const userRole = localStorage.getItem("userRole");
  console.log("user role : ", userRole);

  // Determine which header to show based on user role
  const Header = userRole === "admin" || userRole === "staff" ? StaffHeader : PetOwnerHeader;

  return (
    <Box sx={{ backgroundColor: "#F5F7FA", minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          height: { xs: "60vh", md: "70vh" },
          backgroundImage: "url(https://images.unsplash.com/photo-1583512603806-6cc94e6e7ec4?w=1920&auto=format&fit=crop&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: "#fff",
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "linear-gradient(135deg, rgba(137, 188, 247, 0.7), rgba(9, 70, 160, 0.7))",
            zIndex: 1,
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 2, px: { xs: 2, sm: 4 } }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography
              variant="h2"
              sx={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 700,
                color:"darkblue",
                fontSize: { xs: "2.5rem", md: "4rem" },
                mb: 2,
              }}
            >
              PetWell 360
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 300,
                mb: 4,
                maxWidth: "600px",
                mx: "auto",
              }}
            >
              Premium pet care with expert veterinary services, trusted reviews, and exclusive products.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/register"
              sx={{
                background: "linear-gradient(135deg, #FFD700, #FFA500)",
                color: "#0D47A1",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 600,
                fontSize: "1.1rem",
                px: 4,
                py: 1.5,
                borderRadius: "30px",
                "&:hover": {
                  background: "linear-gradient(135deg, #FFEA00, #FF9100)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              Join Now
            </Button>
          </motion.div>
        </Box>
      </Box>

      {/* Cards Section */}
      <Container maxWidth="lg" sx={{ py: 8, px: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: 700,
            textAlign: "center",
            color: "#0D47A1",
            mb: 6,
          }}
        >
          Discover Our Services
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          {[{
            title: "Reviews",
            icon: <PetsIcon sx={{ fontSize: 50, color: "#1565C0" }} />,
            desc: "Hear from happy pet owners about our exceptional care.",
            img: "https://plus.unsplash.com/premium_photo-1661915652986-fe818e1973f9?w=600&auto=format&fit=crop&q=60",
            link: "/reviews",
          }, {
            title: "Articles",
            icon: <ArticleIcon sx={{ fontSize: 50, color: "#1565C0" }} />,
            desc: "Explore expert tips for your pet’s health and happiness.",
            img: "https://images.unsplash.com/photo-1476242906366-d8eb64c2f661?w=600&auto=format&fit=crop&q=60",
            link: "/articles",
          }, {
            title: "Appointments",
            icon: <EventIcon sx={{ fontSize: 50, color: "#1565C0" }} />,
            desc: "Book and manage veterinary visits with ease.",
            img: "https://plus.unsplash.com/premium_photo-1661440335182-88ecf5ca7023?w=600&auto=format&fit=crop&q=60",
            link: userRole === "admin" || userRole === "staff" ? "/doctorAppointments" : "/appointments",
          }, {
            title: "Pet Store",
            icon: <ShoppingCartIcon sx={{ fontSize: 50, color: "#1565C0" }} />,
            desc: "Shop premium pet supplies and products.",
            img: "https://plus.unsplash.com/premium_photo-1726761692986-6bcde87fc2b8?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cGV0JTIwZm9vZHxlbnwwfHwwfHx8MA%3D%3D",           
            link: userRole === "admin" || userRole === "staff" ? "/inventoryDashboard" : "/petStore",
          }].map((item, index) => (
            <Grid item xs={12} sm={3} md={3} lg={3} key={index}>
              <Card
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.03, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)" }}
                sx={{
                  background: "linear-gradient(180deg, #FFFFFF, #E3F2FD)",
                  borderRadius: 4,
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  height: "100%",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                }}
              >
                <Link to={item.link || "#"} style={{ textDecoration: "none", color: "inherit" }}>
                  <CardMedia
                    component="img"
                    height="180"
                    image={item.img}
                    alt={item.title}
                    sx={{ objectFit: "cover", filter: "brightness(0.95)" }}
                  />
                  <CardContent sx={{ textAlign: "center", p: { xs: 2, sm: 3 } }}>
                    {item.icon}
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                        mt: 1.5,
                        color: "#0D47A1",
                        fontSize: { xs: "1rem", sm: "1.25rem" },
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                        color: "#616161",
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                      }}
                    >
                      {item.desc}
                    </Typography>
                  </CardContent>
                </Link>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Signup Section */}
      <Box sx={{ background: "linear-gradient(180deg, #E3F2FD, #F5F7FA)", py: 10 }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Box
              sx={{
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                p: { xs: 4, sm: 6 },
                textAlign: "center",
                border: "1px solid rgba(255, 255, 255, 0.3)",
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 700,
                  color: "#0D47A1",
                  mb: 2,
                }}
              >
                Join the PetWell 360 Family 🐾
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  color: "#616161",
                  mb: 4,
                  maxWidth: "500px",
                  mx: "auto",
                }}
              >
                Unlock premium pet care with expert advice, seamless scheduling, and top-quality products.
              </Typography>
              <Button
                variant="contained"
                component={Link}
                to="/register"
                sx={{
                  background: "linear-gradient(135deg, #1565C0, #0D47A1)",
                  color: "#fff",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  px: 4,
                  py: 1.5,
                  borderRadius: "30px",
                  "&:hover": {
                    background: "linear-gradient(135deg, #1E88E5, #1565C0)",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                Sign Up Now
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Experts Section */}
      <Box sx={{ py: 10, background: "linear-gradient(180deg, #F5F7FA, #E3F2FD)" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              textAlign: "center",
              color: "#0D47A1",
              mb: 6,
            }}
          >
            Meet Our Expert Team 🩺
          </Typography>
          <Grid container spacing={3} justifyContent="center">
            {[{
              name: "Dr. Olivia Raymond",
              role: "Veterinary Surgeon",
              img: "https://randomuser.me/api/portraits/women/65.jpg",
            }, {
              name: "Dr. Ethan Morris",
              role: "Animal Nutritionist",
              img: "https://randomuser.me/api/portraits/men/44.jpg",
            }, {
              name: "Dr. Mia Chen",
              role: "Pet Behavior Specialist",
              img: "https://randomuser.me/api/portraits/women/90.jpg",
            }].map((vet, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <Card
                  component={motion.div}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: idx * 0.2 }}
                  sx={{
                    textAlign: "center",
                    borderRadius: 3,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    background: "#fff",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    image={vet.img}
                    alt={vet.name}
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: "50%",
                      m: "auto",
                      mt: 3,
                      border: "3px solid #FFD700",
                      boxShadow: "0 0 10px rgba(255, 215, 0, 0.5)",
                    }}
                  />
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 600,
                        color: "#0D47A1",
                      }}
                    >
                      {vet.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: "Poppins, sans-serif",
                        color: "#616161",
                      }}
                    >
                      {vet.role}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box sx={{ py: 10, background: "#F5F7FA" }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              fontFamily: "Poppins, sans-serif",
              fontWeight: 700,
              textAlign: "center",
              color: "#0D47A1",
              mb: 6,
            }}
          >
            How PetWell 360 Works 🔍
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {[{
              step: "1",
              title: "Sign Up",
              desc: "Create your account to unlock all features.",
            }, {
              step: "2",
              title: "Book & Manage",
              desc: "Schedule and track your pet’s appointments effortlessly.",
            }, {
              step: "3",
              title: "Explore & Review",
              desc: "Access expert articles and share your feedback.",
            }].map((item, index) => (
              <Grid item xs={12} sm={4} md={4} key={index}>
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  sx={{
                    textAlign: "center",
                    p: 3,
                    borderRadius: 3,
                    background: "#fff",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #1565C0, #0D47A1)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 700,
                      fontSize: "1.5rem",
                      mx: "auto",
                      mb: 2,
                    }}
                  >
                    {item.step}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                      color: "#0D47A1",
                      mb: 1,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: "Poppins, sans-serif",
                      color: "#616161",
                    }}
                  >
                    {item.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      
    </Box>
  );
};

export default Home;