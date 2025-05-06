import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const StaffHeader = ({ setOpenLogoutModal }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const isLoggedIn = !!localStorage.getItem("authToken");

  const handleLogoutClick = () => {
    if (setOpenLogoutModal) {
      setOpenLogoutModal(true);
    } else {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      navigate("/login");
    }
    handleMenuClose();
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: "#1565C0", boxShadow: 2, height: 70 }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={handleMenuClick}>
          <MenuIcon />
        </IconButton>

        <Menu 
          anchorEl={anchorEl} 
          open={open} 
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
        >
          <MenuItem component={Link} to="/" onClick={handleMenuClose}>
            Home
          </MenuItem>
          <MenuItem component={Link} to="/appointments" onClick={handleMenuClose}>
            Appointments
          </MenuItem>
          <MenuItem component={Link} to="/AllInventory" onClick={handleMenuClose}>
            Inventory
          </MenuItem>
          <MenuItem component={Link} to="/reviews" onClick={handleMenuClose}>
            Reviews
          </MenuItem>
          {isLoggedIn ? (
            <MenuItem onClick={handleLogoutClick}>Logout</MenuItem>
          ) : (
            <MenuItem component={Link} to="/login" onClick={handleMenuClose}>
              Login
            </MenuItem>
          )}
        </Menu>

        <Typography 
          variant="h6" 
          sx={{ 
            flexGrow: 1, 
            
            fontFamily: "'Pacifico', cursive",
            cursor: 'pointer'
          }}
          onClick={() => navigate("/")}
        >
          PetWell 360 (Staff)
        </Typography>

        <Button 
          color="inherit" 
          component={Link} 
          to="/"
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          Home
        </Button>
        <Button 
          color="inherit" 
          component={Link} 
          to="/appointments"
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          Appointments
        </Button>
        <Button 
          color="inherit" 
          component={Link} 
          to="/AllInventory"
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          Inventory
        </Button>
        {isLoggedIn ? (
          <>
            <Button 
              color="inherit" 
              component={Link} 
              to="/profile" 
              sx={{ 
                textTransform: "none", 
                ml: 2,
                display: { xs: 'none', sm: 'flex' }
              }}
            >
              <Avatar
                alt="Staff Profile"
                src="https://cdn-icons-png.flaticon.com/128/149/149071.png"
                sx={{ width: 32, height: 32, mr: 1 }}
              />
              Staff Profile
            </Button>
            <Button 
              color="inherit" 
              onClick={handleLogoutClick}
              sx={{ 
                ml: 1,
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Logout
            </Button>
          </>
        ) : (
          <Button 
            color="inherit" 
            component={Link} 
            to="/login"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default StaffHeader;