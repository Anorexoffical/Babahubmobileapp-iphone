import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import http from '../api/http';
import logo from "../assets/logo.png";
import '../Style/Login.css';

// Custom Toast Component
const CustomToast = ({ message, type = 'warning', onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose(), 300);
    }, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'warning' ? 'bg-warning' : 'bg-success';

  return (
    <div
      className={`custom-toast ${bgColor} text-white p-3 rounded shadow-lg ${isVisible ? 'toast-visible' : 'toast-hidden'}`}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        transition: 'opacity 0.3s ease-in-out',
        opacity: isVisible ? 1 : 0
      }}
    >
      {message}
    </div>
  );
};

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ userName: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showNotification = (message, type = 'warning') => setToast({ message, type });
  const closeToast = () => setToast(null);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.userName || !formData.password) {
      showNotification("Enter username and password");
      return;
    }

    setIsLoading(true);
    try {
      const response = await http.post("/api/users/login", {
        email: formData.userName,   
        password: formData.password,
        role: "admin"
      });

      // Save to localStorage for persistent authentication
      localStorage.setItem('userName', response.data.user.name);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      
      // Call the onLogin callback
      onLogin(response.data.user.name);

      navigate('/dashboard');
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || "Server error");
      showNotification("Username or Password is incorrect");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = '+923176988576';
    const message = encodeURIComponent('Hello, I would like to inquire about...');
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappURL, '_blank');
  };

  return (
    <>
      {toast && <CustomToast message={toast.message} type={toast.type} onClose={closeToast} />}
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <div className="row w-100">
          {/* Left Section */}
          <div className="col-md-6 d-flex flex-column justify-content-center align-items-center p-4">
            <img src={logo} alt="Illustration" className="img-fluid mb-3" style={{ maxWidth: '80%' }} />
            <p className="text-center text-secondary">
              Stay connected with Babahub
            </p>
          </div>

          {/* Right Section */}
          <div className="col-md-6 bg-white p-4 shadow-lg rounded">
            <form onSubmit={handleLogin}>
              <div className="mb-3">
                <input
                  type="text"
                  name="userName"
                  placeholder="Username or phone number"
                  value={formData.userName}
                  onChange={handleChange}
                  className="form-control form-control-lg custom-input"
                  disabled={isLoading}
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-control form-control-lg custom-input"
                  disabled={isLoading}
                />
              </div>
              <div className="d-grid">
                <button type="submit" className="btn btn-dark btn-lg mb-3 custom-button" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    'Log in'
                  )}
                </button>
              </div>
              <a href="./" className="text-decoration-none text-primary d-block text-center mb-3">
                Home page
              </a>
              <hr className="text-secondary" />
              <div className="d-grid">
                <button type="button" className="btn btn-primary btn-lg custom-button" onClick={handleWhatsAppClick}>
                  Contact with Anorex
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;