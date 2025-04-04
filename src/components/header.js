/*import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import './Header.css'; // Import your CSS for styling

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="logo">
        <h1>PetWell360</h1>
      </div>
      <nav className="nav">
        <ul>
          <li><Link to="/home">Home</Link></li>
          <li><Link to="/AllInventory">Store</Link></li> {/* Navigate to AllInventory page }
          <li><Link to="/appointments">Appointments</Link></li>
          <li><Link to="/profile">Profile</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;*/

//lenoras header-----------------------------------------------------------

import React from "react";
import { AppBar, Toolbar, Typography, Button, IconButton, Avatar } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <AppBar position="fixed" sx={{ backgroundColor: "#1565C0", zIndex: 1100, boxShadow: 2 }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
          PetWell 360
        </Typography>
        <Button color="inherit" component={Link} to="/">Home</Button> 
        <Button color="inherit" component={Link} to="/AllInventory">Store</Button>
        <Button color="inherit" component={Link} to="/Reviews">Reviews</Button>
        <Button color="inherit" component={Link} to="/appointments">Appointments</Button>
        <Button color="inherit" component={Link} to="/contact">Contact</Button>
        
        <Button color="inherit" component={Link} to="/profile" sx={{ textTransform: "none", ml: 2 }}>
          <Avatar
            alt="User Profile"
            src="https://cdn-icons-png.flaticon.com/128/149/149071.png "
            sx={{ width: 32, height: 32, mr: 1 }}
          />
          Profile
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
