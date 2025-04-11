import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import './AdHocTest.css'; 
import { FaUser , FaHome } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import axios from "axios";


const AdHocTest = () => {
    const userName = localStorage.getItem("userName") || "User";
    

    return (
        <div className="ad-container">
            {/* Header avec espacement */}


        <div className="header"> 
            <header className="ad-header">
                <Link to="/Home" className="ad-logo">FAST</Link>
                <FaUser className="ad-icon" />
                    <span>{userName}</span>
                <h1 className="ad-title">- Ad Hoc Test</h1>
            </header>
            
            {/* Espacement entre header et navbar */}
            <div className="ad-spacer"></div>
            
            <Navbar />
            </div>
            
        </div>
    );
}

export default AdHocTest;