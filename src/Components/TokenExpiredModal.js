import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const TokenExpiredModal = ({ open, onClose }) => {
  const navigate = useNavigate();

  const handleClose = () => {
    onClose();
    navigate("/login");
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Session Expired
        </Typography>
        <Typography sx={{ mb: 3 }}>
          Your session has expired. Please log in again.
        </Typography>
        <Button
          variant="contained"
          onClick={handleClose}
          fullWidth
        >
          Go to Login
        </Button>
      </Box>
    </Modal>
  );
};

export default TokenExpiredModal;