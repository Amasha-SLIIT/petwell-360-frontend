// Header.js
import React from "react";
import { AppBar, Toolbar, Typography, Button, IconButton, Avatar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <AppBar position="static" sx={{ backgroundColor: "#1565C0", boxShadow: 2 }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
          PetWell 360
        </Typography>
        <Button color="inherit" component={Link} to="/">Home</Button>
        <Button color="inherit" component={Link} to="/login">Login</Button>
        <Button color="inherit" component={Link} to="/appointments">Appointments</Button>
        <Button color="inherit" component={Link} to="/contact">Contact</Button>
        <Button color="inherit" component={Link} to="/profile" sx={{ textTransform: "none", ml: 2 }}>  {/* add correct link */}
          <Avatar
            alt="User Profile"
            src="https://cdn-icons-png.flaticon.com/128/149/149071.png"
            sx={{ width: 32, height: 32, mr: 1 }}
          />
          Profile
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
