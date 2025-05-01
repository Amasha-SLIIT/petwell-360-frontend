import React from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  AppBar,
  Toolbar,
  TextField,
  IconButton,
  Avatar,
  Grid,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PetsIcon from "@mui/icons-material/Pets";
import ArticleIcon from "@mui/icons-material/Article";
import EventIcon from "@mui/icons-material/Event";
import "@fontsource/poppins";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const Home = () => {
  return (
    <Box sx={{ backgroundColor: "#fafafa", minHeight: "150vh", paddingBottom: 10 }}>
      
      {/* Navbar */}
      <Header />

      {/* Page Title */}
      <Container maxWidth="lg" sx={{ textAlign: "center", py: 4 }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Typography variant="h3" sx={{ fontWeight: "bold", color: "#1565C0" }}>
            Welcome to PetWell 360
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#616161", mt: 1 }}>
            Your one-stop solution for pet care and veterinary services.
          </Typography>
        </motion.div>
      </Container>

      {/* Main Sections */}
      <Container maxWidth="lg">
  <Grid container spacing={3} justifyContent="center">
    {[
      {
        title: "Reviews",
        icon: <PetsIcon sx={{ fontSize: 50, color: "#1565C0" }} />,
        desc: "See what pet owners are saying about our services.",
        img: "https://plus.unsplash.com/premium_photo-1661915652986-fe818e1973f9?w=600&auto=format&fit=crop&q=60",
        link: "/Reviews",  // Link for the Reviews section
      },
      { 
        title: "Articles", 
        icon: <ArticleIcon sx={{ fontSize: 50, color: "#1565C0" }} />, 
        desc: "Read expert pet care tips and health advice.", 
        img: "https://images.unsplash.com/photo-1476242906366-d8eb64c2f661?w=600&auto=format&fit=crop&q=60" 
      },
      { 
        title: "Appointments", 
        icon: <EventIcon sx={{ fontSize: 50, color: "#1565C0" }} />, 
        desc: "Manage and book your pet’s next visit easily.", 
        img: "https://plus.unsplash.com/premium_photo-1661440335182-88ecf5ca7023?w=600&auto=format&fit=crop&q=60" 
      },
    ].map((item, index) => (
      <Grid item xs={12} sm={6} md={4} key={index} sx={{ minHeight: "400px" }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5, delay: index * 0.2 }}
          whileHover={{ scale: 1.05 }}
        >
          {/* Wrap the entire card with the Link */}
          <Link to={item.link} style={{ textDecoration: "none" }}>
            <Card
              sx={{
                backgroundColor: "#DBEBF4",
                borderRadius: 3,
                boxShadow: 3,
                height: "100%",
                transition: "0.3s",
                "&:hover": { boxShadow: 6, transform: "scale(1.05)" },
              }}
            >
              <CardMedia component="img" height="200" image={item.img} alt={item.title} />
              <CardContent sx={{ textAlign: "center" }}>
                {item.icon}
                <Typography variant="h6" sx={{ fontWeight: "bold", mt: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2">{item.desc}</Typography>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </Grid>
    ))}
  </Grid>
</Container>




      {/* Signup Section */}
<Container maxWidth="md" sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    whileHover={{ scale: 1.02 }}
  >
    <Box
      sx={{
        background: "#1565C0",
        borderRadius: "20px",
        boxShadow: "0 8px 32px rgba(31, 38, 135, 0.37)",
        padding: 6,
        textAlign: "center",
        color: "white",
        maxWidth: "600px",
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>
        Join PetWell 360 Today! 🐾
      </Typography>

      <Typography variant="body1" sx={{ mb: 3 }}>
        Get the best care for your pets with expert articles, easy appointment scheduling, and trusted reviews from fellow pet owners.
      </Typography>

      <Button
        variant="contained"
        sx={{
          background: "white",
          color: "#1565C0",
          borderRadius: "10px",
          fontSize: "18px",
          fontWeight: "bold",
          padding: "12px 24px",
          transition: "0.3s",
          "&:hover": {
            background: "#eeeeee",
            transform: "scale(1.05)",
          },
        }}
      >
        Sign Up Now
      </Button>
    </Box>
  </motion.div>
</Container>



      {/* Login Section */}
      <LoginCard />

      {/* Footer */}
      <Box sx={{ backgroundColor: "#d7d7d7", color: "#424242", textAlign: "center", py: 3, mt: 6 }}>
        <Typography variant="body2">&copy; 2025 PetWell 360. All rights reserved.</Typography>
      </Box>
    </Box>
  );
};

const LoginCard = () => {
  return (
    <Container maxWidth="sm" sx={{ mt: 8, display: "flex", justifyContent: "center" }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ scale: 1.02 }}
      >
        <Box
          sx={{
            background: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            boxShadow: "0 1px 4px rgba(31, 38, 135, 0.37)",
            padding: 4,
            width: "350px",
            textAlign: "center",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            animation: "float 3s ease-in-out infinite",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "#1565C0", mb: 2 }}>
            Welcome Back! 👋
          </Typography>

          <Typography variant="body2" sx={{ color: "#424242", mb: 3 }}>
            Log in to continue managing your pet's care.
          </Typography>

          <TextField variant="outlined" fullWidth label="Email" sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.6)", borderRadius: "10px" }} />
          <TextField variant="outlined" fullWidth type="password" label="Password" sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.6)", borderRadius: "10px" }} />

          <Button
            variant="contained"
            fullWidth
            sx={{
              background: "linear-gradient(135deg, #1565C0, #0D47A1)",
              color: "#fff",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "bold",
              padding: "12px",
              transition: "0.3s",
              "&:hover": { background: "#0D47A1", transform: "scale(1.05)" },
            }}
          >
            Log In
          </Button>

          <Typography variant="body2" sx={{ mt: 2, color: "#616161" }}>
            Don't have an account?{" "}
            <span style={{ color: "#1565C0", fontWeight: "bold", cursor: "pointer" }}>
              Sign up
            </span>
          </Typography>
        </Box>
      </motion.div>
    </Container>

      
  );
  <Footer />
};

export default Home;
