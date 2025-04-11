import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './Onboard.css'; 
import { FaUser , FaHome } from "react-icons/fa";


const Onboard = () => {
    const userName = localStorage.getItem("userName") || "User";
    return (
        <div className="onboard-container">
            {/* Header avec espacement */}
            <header className="onboard-header">
                <Link to="/Home" className="onboard-logo">FAST</Link>
                <FaUser className="user-icon" />
                    <span>{userName}</span>
                
            </header>
            
            {/* Espacement entre header et navbar */}
            <div className="header-spacer"></div>
            
            <Navbar />
            
            
        </div>
    );
}

export default Onboard;