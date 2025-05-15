import React, { useState, useEffect } from "react";
import { 
  AppBar, Toolbar, Typography, Button, IconButton, Avatar, 
  Box, Menu, MenuItem, Divider, useMediaQuery, useTheme, Drawer, List, ListItem,
  ListItemIcon, ListItemText
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";
import EventNoteIcon from "@mui/icons-material/EventNote";
import ArticleIcon from "@mui/icons-material/Article";
import RateReviewIcon from "@mui/icons-material/RateReview";
import LoginIcon from "@mui/icons-material/Login";
import PetsIcon from "@mui/icons-material/Pets";
import { Link, useNavigate, useLocation } from "react-router-dom";
import '../styles/header.css';

const Header = () => {
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    handleMenuClose();
    navigate('/login');
  };

  const handleProfileClick = () => {
    handleMenuClose();
    if (user?.role === 'doctor') {
      navigate('/doctor');
    } else if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/profile');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuId = 'primary-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      id={menuId}
      keepMounted
      open={Boolean(anchorEl)}
      onClose={handleMenuClose}
      PaperProps={{
        className: "header-menu"
      }}
    >
      <MenuItem onClick={handleProfileClick} className="menu-item">
        <PersonIcon className="menu-icon" />
        Profile
      </MenuItem>
      <Divider />
      <MenuItem onClick={handleLogout} className="menu-item">
        <LogoutIcon className="menu-icon" />
        Logout
      </MenuItem>
    </Menu>
  );

  const navItems = [
    { name: "Home", path: "/", icon: <HomeIcon /> },
    { name: "Appointments", path: "/appointments", icon: <EventNoteIcon /> },
    { name: "Articles", path: "/articles", icon: <ArticleIcon /> },
    { name: "Reviews", path: "/reviews", icon: <RateReviewIcon /> },
  ];

  const drawer = (
    <Box className="drawer-container">
      <Box className="drawer-header">
        <PetsIcon fontSize="large" color="primary" />
        <Typography variant="h6" className="drawer-title">
          PetWell 360
        </Typography>
      </Box>
      <Divider className="drawer-divider" />
      <List>
        {navItems.map((item) => (
          <ListItem 
            button
            key={item.name}
            component={Link} 
            to={item.path} 
            className={`drawer-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={handleDrawerToggle}
          >
            <ListItemIcon className="drawer-icon">
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
        
        <Divider className="drawer-divider" />
        
        {!user ? (
          <ListItem 
            button
            component={Link} 
            to="/login" 
            className="drawer-item"
            onClick={handleDrawerToggle}
          >
            <ListItemIcon className="drawer-icon">
              <LoginIcon />
            </ListItemIcon>
            <ListItemText primary="Login" />
          </ListItem>
        ) : (
          <>
            <ListItem 
              button
              onClick={() => {
                handleProfileClick();
                handleDrawerToggle();
              }} 
              className={`drawer-item ${isActive('/profile') || isActive('/doctor') || isActive('/admin') ? 'active' : ''}`}
            >
              <ListItemIcon className="drawer-icon">
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem 
              button
              onClick={() => {
                handleLogout();
                handleDrawerToggle();
              }} 
              className="drawer-item"
            >
              <ListItemIcon className="drawer-icon">
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" className="header">
        <Toolbar className="toolbar">
          <Box className="logo-section">
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={handleDrawerToggle}
              className="menu-button"
            >
              <MenuIcon />
            </IconButton>
            
            <Typography 
              variant="h6" 
              className="logo"
              component={Link}
              to="/"
            >
              <PetsIcon className="logo-icon" />
              PetWell 360
            </Typography>
          </Box>
          
          <Box className="nav-links">
            {navItems.map((item) => (
              <Button 
                key={item.name}
                color="inherit" 
                component={Link} 
                to={item.path} 
                className={`nav-button ${isActive(item.path) ? 'active' : ''}`}
              >
                {item.name}
              </Button>
            ))}
          </Box>
          
          <Box className="user-section">
            {!user ? (
              <Button 
                variant="contained"
                component={Link} 
                to="/login" 
                className="login-button"
                startIcon={!isSmallScreen && <LoginIcon />}
              >
                Login
              </Button>
            ) : (
              <Button
                className="profile-button"
                onClick={handleProfileMenuOpen}
                aria-controls={menuId}
                aria-haspopup="true"
              >
                <Avatar className="avatar">
                  {user.firstName?.charAt(0) || <AccountCircleIcon />}
                </Avatar>
                {!isSmallScreen && (
                  <Typography className="user-name">
                    {user.firstName} {user.lastName}
                  </Typography>
                )}
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      
      {renderMenu}
      
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        className="drawer"
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Header;
