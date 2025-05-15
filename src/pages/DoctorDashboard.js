import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Button, TextField, Paper, 
  Table, TableBody, TableCell, TableContainer, TableHead, 
  TableRow, Dialog, DialogActions, DialogContent, DialogTitle, DialogContentText,
  IconButton, Grid, Card, CardContent, Snackbar, Alert, Divider,
  CircularProgress, Tabs, Tab, Avatar, Chip, FormControl, InputLabel,
  Select, MenuItem, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import { 
  Edit, Delete, Add, Close, Save, Article as ArticleIcon, 
  Logout, Person as PersonIcon, EventNote, MedicalServices,
  RemoveRedEye, LocalHospital, Check, Cancel as CancelIcon,
  AddCircle, Timeline, History
} from '@mui/icons-material';
import { createArticle, getAllArticles, updateArticle, deleteArticle } from '../services/articleService';
import {
  getDoctorAppointments, getAppointmentDetails, updateAppointmentStatus,
  addTreatmentHistory, getTreatmentHistory
} from '../services/appointmentService';
import { format } from 'date-fns';
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import '../styles/Articles.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ArticleReportGenerator from '../Components/reports/ArticleReportGenerator';
import AppointmentReportGenerator from '../Components/reports/AppointmentReportGenerator';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentArticle, setCurrentArticle] = useState({
    title: '',
    content: '',
    author: '',
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // State variables for profile management
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    phoneNumber: ''
  });
  const [openDeleteAccountDialog, setOpenDeleteAccountDialog] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  
  // State variables for appointment management
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [openAppointmentDialog, setOpenAppointmentDialog] = useState(false);
  const [openTreatmentDialog, setOpenTreatmentDialog] = useState(false);
  const [treatmentHistory, setTreatmentHistory] = useState([]);
  const [openTreatmentHistoryDialog, setOpenTreatmentHistoryDialog] = useState(false);
  const [treatmentData, setTreatmentData] = useState({
    diagnosis: '',
    treatment: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    notes: ''
  });

  useEffect(() => {
    const doctorData = localStorage.getItem('user');
    if (!doctorData) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(doctorData);
    setUser(parsedUser);
    
    // Initialize profile data
    setProfileData({
      firstName: parsedUser.firstName || '',
      lastName: parsedUser.lastName || '',
      email: parsedUser.email || '',
      address: parsedUser.address || '',
      phoneNumber: parsedUser.phoneNumber || ''
    });
    
    fetchArticles();
    
    // Fetch latest doctor profile data
    if (parsedUser._id || parsedUser.id) {
      fetchDoctorProfile(parsedUser._id || parsedUser.id);
    }
    
    // Fetch doctor appointments
    fetchDoctorAppointments();
  }, [navigate]);

  const fetchDoctorProfile = async (userId) => {
    try {
      setProfileLoading(true);
      const response = await axios.get(`http://localhost:5000/auth/profile/${userId}`);
      
      // Update local storage with latest user data
      localStorage.setItem('user', JSON.stringify(response.data));
      setUser(response.data);
      
      // Update profile data
      setProfileData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email || '',
        address: response.data.address || '',
        phoneNumber: response.data.phoneNumber || ''
      });
    } catch (error) {
      showNotification('Failed to load profile data', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchDoctorAppointments = async () => {
    try {
      setAppointmentsLoading(true);
      const appointments = await getDoctorAppointments();
      setAppointments(appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      showNotification('Failed to load appointments', 'error');
    } finally {
      setAppointmentsLoading(false);
    }
  };

  const fetchAppointmentDetails = async (appointmentId) => {
    try {
      setLoading(true);
      const appointment = await getAppointmentDetails(appointmentId);
      setSelectedAppointment(appointment);
      setOpenAppointmentDialog(true);
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      showNotification('Failed to load appointment details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTreatmentHistory = async (appointmentId) => {
    try {
      setLoading(true);
      const history = await getTreatmentHistory(appointmentId);
      setTreatmentHistory(history);
      setOpenTreatmentHistoryDialog(true);
    } catch (error) {
      console.error('Error fetching treatment history:', error);
      showNotification('Failed to load treatment history', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await getAllArticles();
      setArticles(data);
    } catch (error) {
      showNotification('Failed to fetch articles', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Article management
  const handleOpenDialog = (article = null) => {
    if (article) {
      setCurrentArticle(article);
      setEditMode(true);
    } else {
      setCurrentArticle({
        title: '',
        content: '',
        author: '',
      });
      setEditMode(false);
    }
    setOpenDialog(true);
    setErrors({});
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentArticle({
      ...currentArticle,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!currentArticle.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!currentArticle.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    if (!currentArticle.author.trim()) {
      newErrors.author = 'Author is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveArticle = async () => {
    if (!validateForm()) return;
    
    try {
      if (editMode) {
        await updateArticle(currentArticle._id, currentArticle);
        showNotification('Article updated successfully');
      } else {
        await createArticle(currentArticle);
        showNotification('Article created successfully');
      }
      
      handleCloseDialog();
      fetchArticles();
    } catch (error) {
      showNotification(`Failed to ${editMode ? 'update' : 'create'} article`, 'error');
    }
  };

  const handleDeleteArticle = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(id);
        showNotification('Article deleted successfully');
        fetchArticles();
      } catch (error) {
        showNotification('Failed to delete article', 'error');
      }
    }
  };

  // Profile management
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    
    const userId = user._id || user.id;
    if (!userId) {
      showNotification('User ID is missing. Please log in again.', 'error');
      setProfileLoading(false);
      return;
    }
    
    try {
      const response = await axios.put(`http://localhost:5000/auth/profile/${userId}`, profileData);
      
      // Update local storage with updated user data
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setUser(response.data.user);
      showNotification('Profile updated successfully');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    setProfileLoading(true);
    
    const userId = user._id || user.id;
    if (!userId) {
      showNotification('User ID is missing. Please log in again.', 'error');
      setProfileLoading(false);
      setOpenDeleteAccountDialog(false);
      return;
    }
    
    try {
      await axios.delete(`http://localhost:5000/auth/profile/${userId}`);
      
      // Clear local storage and redirect to home
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      showNotification(error.response?.data?.message || 'Failed to delete account', 'error');
      setOpenDeleteAccountDialog(false);
    } finally {
      setProfileLoading(false);
    }
  };

  // Appointment management
  const handleUpdateAppointmentStatus = async (id, status) => {
    try {
      setLoading(true);
      await updateAppointmentStatus(id, { status });
      showNotification(`Appointment ${status} successfully`);
      setOpenAppointmentDialog(false);
      fetchDoctorAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      showNotification('Failed to update appointment status', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTreatmentDialog = (appointment) => {
    setSelectedAppointment(appointment);
    // Reset treatment form
    setTreatmentData({
      diagnosis: '',
      treatment: '',
      medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
      notes: ''
    });
    setOpenTreatmentDialog(true);
  };

  const handleTreatmentInputChange = (e) => {
    const { name, value } = e.target;
    setTreatmentData({
      ...treatmentData,
      [name]: value
    });
  };

  const handleMedicationChange = (index, field, value) => {
    const updatedMedications = [...treatmentData.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    
    setTreatmentData({
      ...treatmentData,
      medications: updatedMedications
    });
  };

  const handleAddMedication = () => {
    setTreatmentData({
      ...treatmentData,
      medications: [
        ...treatmentData.medications,
        { name: '', dosage: '', frequency: '', duration: '' }
      ]
    });
  };

  const handleRemoveMedication = (index) => {
    const updatedMedications = [...treatmentData.medications];
    updatedMedications.splice(index, 1);
    
    setTreatmentData({
      ...treatmentData,
      medications: updatedMedications
    });
  };

  const validateTreatmentForm = () => {
    const newErrors = {};
    
    if (!treatmentData.diagnosis.trim()) {
      newErrors.diagnosis = 'Diagnosis is required';
    }
    
    if (!treatmentData.treatment.trim()) {
      newErrors.treatment = 'Treatment is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitTreatment = async () => {
    if (!validateTreatmentForm()) return;
    
    try {
      setLoading(true);
      await addTreatmentHistory(selectedAppointment._id, treatmentData);
      showNotification('Treatment record added successfully');
      
      // Update appointment status to completed
      await updateAppointmentStatus(selectedAppointment._id, { status: 'completed' });
      
      // Reset form and close dialog
      setTreatmentData({
        diagnosis: '',
        treatment: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
        notes: ''
      });
      setOpenTreatmentDialog(false);
      fetchDoctorAppointments();
      
      // After adding treatment, fetch and show the updated treatment history
      fetchTreatmentHistory(selectedAppointment._id);
    } catch (error) {
      console.error('Error adding treatment record:', error);
      showNotification('Failed to add treatment record', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Box className="doctor-dashboard">
      <Header />
      
      <Container maxWidth="lg" className="dashboard-container">
        <Box className="dashboard-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" className="dashboard-title">
              Doctor Dashboard
            </Typography>
            <Typography variant="subtitle1" className="dashboard-subtitle">
              Manage appointments, articles, and your profile
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Logout />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>

        <Divider className="dashboard-divider" sx={{ mb: 2 }} />
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          sx={{ mb: 3 }}
          variant="fullWidth"
        >
          <Tab icon={<EventNote />} label="Appointments" />
          <Tab icon={<ArticleIcon />} label="Articles" />
          <Tab icon={<PersonIcon />} label="My Profile" />
        </Tabs>
        
        {/* Appointments Tab */}
        {activeTab === 0 && (
          <Box className="appointments-section">
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Upcoming Appointments
                </Typography>
                
                {/* Add the Appointments Report Generator here */}
                <AppointmentReportGenerator 
                  appointments={appointments} 
                  doctorName={`${user?.firstName || ''} ${user?.lastName || ''}`}
                />
              </Box>
              
              {appointmentsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : appointments.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Pet Name</TableCell>
                        <TableCell>Owner</TableCell>
                        <TableCell>Date & Time</TableCell>
                        <TableCell>Services</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {appointments.map(appointment => (
                        <TableRow key={appointment._id}>
                          <TableCell>{appointment.petName}</TableCell>
                          <TableCell>
                            {appointment.userId.firstName} {appointment.userId.lastName}
                          </TableCell>
                          <TableCell>
                            {format(new Date(appointment.appointmentFrom), 'MMM d, yyyy')}
                            <br />
                            {format(new Date(appointment.appointmentFrom), 'h:mm a')} - 
                            {format(new Date(appointment.appointmentTo), 'h:mm a')}
                          </TableCell>
                          <TableCell>
                            {appointment.services.join(', ')}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              color={getAppointmentStatusColor(appointment.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              color="primary"
                              onClick={() => fetchAppointmentDetails(appointment._id)}
                              title="View Details"
                            >
                              <RemoveRedEye />
                            </IconButton>
                            
                            {appointment.status === 'confirmed' && (
                              <IconButton
                                color="success"
                                onClick={() => handleOpenTreatmentDialog(appointment)}
                                title="Add Treatment"
                              >
                                <LocalHospital />
                              </IconButton>
                            )}
                            
                            {/* Add Treatment History button - new */}
                            <IconButton
                              color="info"
                              onClick={() => fetchTreatmentHistory(appointment._id)}
                              title="Treatment History"
                            >
                              <History />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography>No appointments found</Typography>
                </Box>
              )}
            </Paper>
          </Box>
        )}
        
        {/* Articles Tab */}
        {activeTab === 1 && (
          <>
            <Box className="dashboard-actions">
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                className="add-article-btn"
              >
                New Article
              </Button>
              <ArticleReportGenerator 
                articles={articles} 
                doctorName={`${user?.firstName || ''} ${user?.lastName || ''}`} 
              />
            </Box>
            
            {loading ? (
              <Box className="loading-container">
                <CircularProgress />
                <Typography>Loading articles...</Typography>
              </Box>
            ) : articles.length === 0 ? (
              <Paper className="empty-state">
                <Typography variant="h6">No articles found</Typography>
                <Typography variant="body1">
                  Start by creating your first article using the "New Article" button.
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={3} className="articles-grid">
                <Grid item xs={12}>
                  <TableContainer component={Paper} className="articles-table">
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell width="25%">Title</TableCell>
                          <TableCell width="35%">Content Preview</TableCell>
                          <TableCell width="15%">Author</TableCell>
                          <TableCell width="15%">Date</TableCell>
                          <TableCell width="10%" align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {articles.map((article) => (
                          <TableRow key={article._id} className="article-row">
                            <TableCell className="article-title">{article.title}</TableCell>
                            <TableCell className="article-content">
                              {article.content.length > 100 
                                ? `${article.content.substring(0, 100)}...` 
                                : article.content}
                            </TableCell>
                            <TableCell>{article.author}</TableCell>
                            <TableCell>{formatDate(article.date)}</TableCell>
                            <TableCell align="center">
                              <IconButton 
                                color="primary" 
                                onClick={() => handleOpenDialog(article)}
                                className="edit-btn"
                              >
                                <Edit />
                              </IconButton>
                              <IconButton 
                                color="error" 
                                onClick={() => handleDeleteArticle(article._id)}
                                className="delete-btn"
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            )}
          </>
        )}
        
        {/* Profile Tab */}
        {activeTab === 2 && (
          <Paper elevation={3} className="profile-paper" sx={{ p: 3 }}>
            <Box className="profile-header" sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: 'primary.main' }}>
                {profileData?.firstName?.charAt(0) || 'D'}
              </Avatar>
              <Typography variant="h5">
                My Profile
              </Typography>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            {profileLoading && !user ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <form onSubmit={handleUpdateProfile}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="First Name"
                      name="firstName"
                      fullWidth
                      required
                      value={profileData.firstName}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Last Name"
                      name="lastName"
                      fullWidth
                      required
                      value={profileData.lastName}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      fullWidth
                      required
                      value={profileData.email}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Address"
                      name="address"
                      fullWidth
                      value={profileData.address}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      label="Phone Number"
                      name="phoneNumber"
                      fullWidth
                      value={profileData.phoneNumber}
                      onChange={handleProfileChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                      disabled={profileLoading}
                    >
                      {profileLoading ? 'Updating...' : 'Update Profile'}
                    </Button>
                    
                    <Button 
                      variant="outlined" 
                      color="error"
                      onClick={() => setOpenDeleteAccountDialog(true)}
                    >
                      Delete Account
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}
          </Paper>
        )}
      </Container>
      
      {/* Article Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        className="article-dialog"
      >
        <DialogTitle className="dialog-title">
          {editMode ? 'Edit Article' : 'Create New Article'}
          <IconButton 
            onClick={handleCloseDialog} 
            className="close-dialog-btn"
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers className="dialog-content">
          <TextField
            name="title"
            label="Title"
            fullWidth
            value={currentArticle.title}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            error={!!errors.title}
            helperText={errors.title}
            className="form-field"
          />
          <TextField
            name="content"
            label="Content"
            fullWidth
            multiline
            rows={8}
            value={currentArticle.content}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            error={!!errors.content}
            helperText={errors.content}
            className="form-field"
          />
          <TextField
            name="author"
            label="Author"
            fullWidth
            value={currentArticle.author}
            onChange={handleInputChange}
            margin="normal"
            variant="outlined"
            error={!!errors.author}
            helperText={errors.author}
            className="form-field"
          />
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button 
            onClick={handleCloseDialog} 
            color="inherit"
            startIcon={<Close />}
            className="cancel-btn"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveArticle} 
            color="primary" 
            variant="contained"
            startIcon={<Save />}
            className="save-btn"
          >
            {editMode ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Appointment Details Dialog */}
      <Dialog
        open={openAppointmentDialog}
        onClose={() => setOpenAppointmentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedAppointment ? (
          <>
            <DialogTitle>
              Appointment Details
              <IconButton
                onClick={() => setOpenAppointmentDialog(false)}
                aria-label="close"
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Pet Information</Typography>
                  <Typography variant="body1">
                    <strong>Name:</strong> {selectedAppointment.petName}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Type:</strong> {selectedAppointment.petType}
                  </Typography>
                  {selectedAppointment.petId.breed && (
                    <Typography variant="body1">
                      <strong>Breed:</strong> {selectedAppointment.petId.breed}
                    </Typography>
                  )}
                  {selectedAppointment.petId.age && (
                    <Typography variant="body1">
                      <strong>Age:</strong> {selectedAppointment.petId.age}
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Owner Information</Typography>
                  <Typography variant="body1">
                    <strong>Name:</strong> {selectedAppointment.userId.firstName} {selectedAppointment.userId.lastName}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Phone:</strong> {selectedAppointment.userId.phoneNumber || 'N/A'}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Email:</strong> {selectedAppointment.userId.email}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1">Appointment Details</Typography>
                  <Typography variant="body1">
                    <strong>Date:</strong> {format(new Date(selectedAppointment.appointmentFrom), 'EEEE, MMMM d, yyyy')}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Time:</strong> {format(new Date(selectedAppointment.appointmentFrom), 'h:mm a')} - {format(new Date(selectedAppointment.appointmentTo), 'h:mm a')}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Services:</strong> {selectedAppointment.services.join(', ')}
                  </Typography>
                  <Typography variant="body1">
                    <strong>Status:</strong> {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                  </Typography>
                  
                  {selectedAppointment.payment && (
                    <>
                      <Typography variant="body1">
                        <strong>Payment Amount:</strong> ${selectedAppointment.payment.amount}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Payment Status:</strong> {selectedAppointment.payment.status}
                      </Typography>
                    </>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              {selectedAppointment.status === 'pending' && (
                <>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={() => handleUpdateAppointmentStatus(selectedAppointment._id, 'cancelled')}
                    startIcon={<CancelIcon />}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    color="success" 
                    onClick={() => handleUpdateAppointmentStatus(selectedAppointment._id, 'confirmed')}
                    startIcon={<Check />}
                  >
                    Confirm
                  </Button>
                </>
              )}
              {selectedAppointment.status === 'confirmed' && (
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => {
                    setOpenAppointmentDialog(false);
                    handleOpenTreatmentDialog(selectedAppointment);
                  }}
                  startIcon={<LocalHospital />}
                >
                  Add Treatment
                </Button>
              )}
              {/* Show treatment history button for all appointments */}
              <Button 
                variant="outlined" 
                color="info" 
                onClick={() => {
                  setOpenAppointmentDialog(false);
                  fetchTreatmentHistory(selectedAppointment._id);
                }}
                startIcon={<History />}
              >
                Treatment History
              </Button>
            </DialogActions>
          </>
        ) : (
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        )}
      </Dialog>
      
      {/* Add Treatment Dialog */}
      <Dialog
        open={openTreatmentDialog}
        onClose={() => setOpenTreatmentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Add Treatment Record
          <IconButton
            onClick={() => setOpenTreatmentDialog(false)}
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedAppointment ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  name="diagnosis"
                  label="Diagnosis"
                  fullWidth
                  required
                  value={treatmentData.diagnosis}
                  onChange={handleTreatmentInputChange}
                  error={!!errors.diagnosis}
                  helperText={errors.diagnosis}
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="treatment"
                  label="Treatment"
                  fullWidth
                  required
                  multiline
                  rows={3}
                  value={treatmentData.treatment}
                  onChange={handleTreatmentInputChange}
                  error={!!errors.treatment}
                  helperText={errors.treatment}
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">Medications</Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="small"
                    startIcon={<AddCircle />}
                    onClick={handleAddMedication}
                  >
                    Add Medication
                  </Button>
                </Box>
                
                {treatmentData.medications.map((medication, index) => (
                  <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Medication Name"
                          fullWidth
                          size="small"
                          value={medication.name}
                          onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Dosage"
                          fullWidth
                          size="small"
                          value={medication.dosage}
                          onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Frequency"
                          fullWidth
                          size="small"
                          value={medication.frequency}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Duration"
                          fullWidth
                          size="small"
                          value={medication.duration}
                          onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Duration"
                          fullWidth
                          size="small"
                          value={medication.duration}
                          onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                        />
                      </Grid>
                    </Grid>
                    
                    {treatmentData.medications.length > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Button
                          color="error"
                          size="small"
                          onClick={() => handleRemoveMedication(index)}
                        >
                          Remove
                        </Button>
                      </Box>
                    )}
                  </Box>
                ))}
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  name="notes"
                  label="Additional Notes"
                  fullWidth
                  multiline
                  rows={3}
                  value={treatmentData.notes}
                  onChange={handleTreatmentInputChange}
                />
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenTreatmentDialog(false)} 
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitTreatment}
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Treatment Record'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Treatment History Dialog - Enhanced */}
      <Dialog
        open={openTreatmentHistoryDialog}
        onClose={() => setOpenTreatmentHistoryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Treatment History
          <IconButton
            onClick={() => setOpenTreatmentHistoryDialog(false)}
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : treatmentHistory.length > 0 ? (
            <>
              {/* Display all treatment history records */}
              {treatmentHistory.map((record, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Treatment on {format(new Date(record.createdAt), 'MMMM d, yyyy')}
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Diagnosis</Typography>
                      <Typography variant="body1" paragraph>{record.diagnosis}</Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Treated By</Typography>
                      <Typography variant="body1" paragraph>
                        Dr. {record.createdBy.firstName} {record.createdBy.lastName}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">Treatment</Typography>
                      <Typography variant="body1" paragraph>{record.treatment}</Typography>
                    </Grid>
                    
                    {record.medications && record.medications.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          Medications
                        </Typography>
                        
                        <List dense>
                          {record.medications.map((med, medIndex) => (
                            <ListItem key={medIndex}>
                              <ListItemIcon>
                                <LocalHospital fontSize="small" />
                              </ListItemIcon>
                              <ListItemText
                                primary={med.name}
                                secondary={`${med.dosage} - ${med.frequency} for ${med.duration}`}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Grid>
                    )}
                    
                    {record.notes && (
                      <Grid item xs={12}>
                        <Typography variant="body2" color="textSecondary">Additional Notes</Typography>
                        <Typography variant="body1">{record.notes}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              ))}
            </>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography>No treatment history found for this appointment.</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTreatmentHistoryDialog(false)}>
            Close
          </Button>
          {selectedAppointment && selectedAppointment.status === 'confirmed' && (
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<AddCircle />}
              onClick={() => {
                setOpenTreatmentHistoryDialog(false);
                handleOpenTreatmentDialog(selectedAppointment);
              }}
            >
              Add New Treatment
            </Button>
          )}
        </DialogActions>
      </Dialog>
      
      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={openDeleteAccountDialog}
        onClose={() => setOpenDeleteAccountDialog(false)}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete your account? This action cannot be undone and all your articles will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteAccountDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteAccount} color="error" disabled={profileLoading}>
            {profileLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification Snackbar */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      <Footer />
    </Box>
  );
};

export default DoctorDashboard;
