import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          TuteDude <span className="highlight">Learn</span>
        </Link>

        <ul className="nav-menu">
          {currentUser ? (
            <>
              <li className="nav-item">
                <Link to="/tutorials" className="nav-link">Tutorials</Link>
              </li>
              <li className="nav-item">
                <span className="nav-welcome">Welcome, {currentUser.username}</span>
              </li>
              <li className="nav-item">
                <button className="logout-button" onClick={handleLogout}>Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/signup" className="nav-link signup">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;