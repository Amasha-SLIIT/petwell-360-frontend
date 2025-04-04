import React from 'react';
import './Footer.css'; // Import your CSS for styling

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="social-icons">
          <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon instagram">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon facebook">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="mailto:yourmail@example.com" className="social-icon mail">
            <i className="fas fa-envelope"></i>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon twitter">
            <i className="fab fa-twitter"></i>
          </a>
        </div>
        <p>&copy; 2025 PetWell360. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
