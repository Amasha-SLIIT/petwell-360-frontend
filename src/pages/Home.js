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
import "@fontsource/poppins";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const Home = () => {
  return (
    <Box sx={{ 
      backgroundColor: "#fafafa", 
      minHeight: "100vh",
      paddingTop: '70px',
      paddingBottom: 10 
    }}>
      {/* Fixed Header */}
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
          {[{
            title: "Reviews",
            icon: <PetsIcon sx={{ fontSize: 50, color: "#1565C0" }} />,
            desc: "See what pet owners are saying about our services.",
            img: "https://plus.unsplash.com/premium_photo-1661915652986-fe818e1973f9?w=600&auto=format&fit=crop&q=60",
            link: "/reviews",
          }, {
            title: "Articles",
            icon: <ArticleIcon sx={{ fontSize: 50, color: "#1565C0" }} />,
            desc: "Read expert pet care tips and health advice.",
            img: "https://images.unsplash.com/photo-1476242906366-d8eb64c2f661?w=600&auto=format&fit=crop&q=60"
          }, {
            title: "Appointments",
            icon: <EventIcon sx={{ fontSize: 50, color: "#1565C0" }} />,
            desc: "Manage and book your pet's next visit easily.",
            img: "https://plus.unsplash.com/premium_photo-1661440335182-88ecf5ca7023?w=600&auto=format&fit=crop&q=60",
            link: "/appointments"
          }].map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index} sx={{ minHeight: "400px" }}>
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <Link to={item.link || "#"} style={{ textDecoration: "none" }}>
                  <Card
                    sx={{
                      backgroundColor: "#DBEBF4",
                      borderRadius: 3,
                      boxShadow: 3,
                      height: "100%",
                      transition: "0.3s",
                      "&:hover": { boxShadow: 6 },
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
              Get the best care for your pets with expert articles, easy appointment scheduling, and trusted reviews.
            </Typography>
            <Button
              variant="contained"
              component={Link}
              to="/register"
              sx={{
                background: "white",
                color: "#1565C0",
                borderRadius: "10px",
                fontSize: "18px",
                fontWeight: "bold",
                padding: "12px 24px",
                "&:hover": {
                  background: "#eeeeee",
                },
              }}
            >
              Sign Up Now
            </Button>
          </Box>
        </motion.div>
      </Container>

      {/* Meet Our Experts */}
      <Typography variant="h4" sx={{ fontWeight: "bold", textAlign: "center", mt: 10, mb: 4 }}>
        Meet Our Experts 🩺
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        {[{
          name: "Dr. Olivia Raymond",
          role: "Veterinary Surgeon",
          img: "https://randomuser.me/api/portraits/women/65.jpg"
        }, {
          name: "Dr. Ethan Morris",
          role: "Animal Nutritionist",
          img: "https://randomuser.me/api/portraits/men/44.jpg"
        }, {
          name: "Dr. Mia Chen",
          role: "Pet Behavior Specialist",
          img: "https://randomuser.me/api/portraits/women/90.jpg"
        }].map((vet, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Card sx={{ textAlign: "center", borderRadius: 3, boxShadow: 2 }}>
              <CardMedia
                component="img"
                image={vet.img}
                alt={vet.name}
                sx={{ width: 120, height: 120, borderRadius: "50%", m: "auto", mt: 3 }}
              />
              <CardContent>
                <Typography variant="h6" fontWeight="bold">{vet.name}</Typography>
                <Typography variant="body2" color="textSecondary">{vet.role}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* How It Works */}
      <Typography variant="h4" sx={{ fontWeight: "bold", textAlign: "center", mt: 10, mb: 4 }}>
        How PetWell 360 Works 🔍
      </Typography>
      <Grid container spacing={3}>
        {[{
          step: "1",
          title: "Sign Up",
          desc: "Create an account to access all features."
        }, {
          step: "2",
          title: "Book & Manage",
          desc: "Schedule appointments and keep track of visits."
        }, {
          step: "3",
          title: "Explore & Review",
          desc: "Read articles and share your experiences."
        }].map((item, index) => (
          <Grid item xs={12} sm={4} key={index}>
            <Box sx={{ textAlign: "center", px: 2 }}>
              <Typography variant="h3" color="primary" fontWeight="bold">{item.step}</Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>{item.title}</Typography>
              <Typography variant="body2" sx={{ color: "#616161" }}>{item.desc}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default Home;
