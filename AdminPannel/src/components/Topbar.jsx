import React, { useState, useEffect, useRef } from 'react';
import { 
  FaTachometerAlt, 
  FaBoxes, 
  FaShoppingBag, 
  FaChartLine, 
  FaUsers,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaPowerOff,
  FaUserShield
} from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../Style/Topbar.css';

const Topbar = ({ onLogout, userName }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentUserName, setCurrentUserName] = useState('');
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  // Get user name from localStorage and props, and update when they change
  useEffect(() => {
    const savedUserName = localStorage.getItem('userName');
    if (userName) {
      setCurrentUserName(userName);
    } else if (savedUserName) {
      setCurrentUserName(savedUserName);
    } else {
      setCurrentUserName('User');
    }
  }, [userName]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);
  
  const toggleDropdown = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    // Clear all authentication data from localStorage
    localStorage.removeItem('userName');
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    
    // Clear all authentication data from sessionStorage
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userData');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('isLoggedIn');
    
    // Reset user name state
    setCurrentUserName('User');
    
    // Close dropdown
    setDropdownOpen(false);
    
    // Call parent logout handler if provided
    if (onLogout) {
      onLogout();
    }
    
    // Redirect to login page
    navigate('/login');
  };

  return (
    <div className="topbar">
      {/* Left Logo/Title */}
      <div className="topbar-left">
        <div className="logo-container">
          <div className="logo-shape"></div>
          <h4 className="topbar-title">Baba<span>Hub</span></h4>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="menu-toggle" onClick={toggleMenu}>
        {menuOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Center Menu */}
      <div className={`topbar-menu ${menuOpen ? 'show' : ''}`}>
        <Link 
          to="/dashboard" 
          className={`menu-item ${location.pathname === '/dashboard' ? 'active' : ''}`} 
          onClick={closeMenu}
        >
          <FaTachometerAlt className="menu-icon" />
          <span>Dashboard</span>
          <div className="active-indicator"></div>
        </Link>
        <Link 
          to="/products" 
          className={`menu-item ${location.pathname === '/products' ? 'active' : ''}`} 
          onClick={closeMenu}
        >
          <FaBoxes className="menu-icon" />
          <span>Products</span>
          <div className="active-indicator"></div>
        </Link>
        <Link 
          to="/orders" 
          className={`menu-item ${location.pathname === '/orders' ? 'active' : ''}`} 
          onClick={closeMenu}
        >
          <FaShoppingBag className="menu-icon" />
          <span>Orders</span>
          <span className="badge">5</span>
          <div className="active-indicator"></div>
        </Link>
        <Link 
          to="/customers" 
          className={`menu-item ${location.pathname === '/customers' ? 'active' : ''}`} 
          onClick={closeMenu}
        >
          <FaUsers className="menu-icon" />
          <span>Customers</span>
          <div className="active-indicator"></div>
        </Link>
        <Link 
          to="/reports" 
          className={`menu-item ${location.pathname === '/reports' ? 'active' : ''}`} 
          onClick={closeMenu}
        >
          <FaChartLine className="menu-icon" />
          <span>Reports</span>
          <div className="active-indicator"></div>
        </Link>
        <Link 
          to="/super-admin" 
          className={`menu-item ${location.pathname === '/super-admin' ? 'active' : ''}`} 
          onClick={closeMenu}
        >
          <FaUserShield className="menu-icon" />
          <span>Super Admin</span>
          <div className="active-indicator"></div>
        </Link>
      </div>

      {/* Right Side Controls */}
      <div className="topbar-right">
        {/* User Profile Dropdown */}
        <div className="dropdown-container" ref={dropdownRef}>
          <div className="user-profile" onClick={handleProfileClick} ref={profileRef}>
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face" 
              alt="User" 
              className="user-avatar" 
            />
            <div className="user-info">
              <div className="user-name">{currentUserName}</div>
              <small className="user-role">Super Admin</small>
            </div>
            <div className="dropdown-arrow-container" onClick={toggleDropdown}>
              <FaChevronDown className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`} />
            </div>
          </div>
          
          {dropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" 
                  alt="User" 
                  className="dropdown-user-avatar" 
                />
                <div className="dropdown-user-info">
                  <div className="dropdown-user-name">{currentUserName}</div>
                  <div className="dropdown-user-email">admin@babahub.com</div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                <FaUser className="dropdown-icon" />
                <span>My Profile</span>
              </Link>
              <Link to="/settings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                <FaCog className="dropdown-icon" />
                <span>Settings</span>
              </Link>
              <Link to="/super-admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                <FaUserShield className="dropdown-icon" />
                <span>Super Admin Panel</span>
              </Link>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout" onClick={handleLogout}>
                <FaSignOutAlt className="dropdown-icon" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Logout Button - Visible on mobile */}
        <button 
          className="logout-btn mobile-logout" 
          onClick={handleLogout}
          title="Logout"
        >
          <FaPowerOff />
        </button>
      </div>
    </div>
  );
};

export default Topbar;