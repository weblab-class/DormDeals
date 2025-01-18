import React from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";

const NavBar = (props) => {
  return (
    <nav className="NavBar-container">
      <div className="NavBar-title">
        <Link to="/home" className="NavBar-link">
          Home
        </Link>
      </div>
      <div className="NavBar-linkContainer">
        <Link to={`/profile/${props.userId}`} className="NavBar-link">
          Profile
        </Link>
        {/* Add more navigation links as needed */}
      </div>
    </nav>
  );
};

export default NavBar;
