import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import './CurrentFaults.css'; 
import { FaUser , FaHome } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import axios from "axios";


const CurrentFaults = () => {
    const userName = localStorage.getItem("userName") || "User";
    

    return (
        <div className="c-container">
            {/* Header avec espacement */}


        <div className="header"> 
            <header className="c-header">
                <Link to="/Home" className="c-logo">FAST</Link>
                <FaUser className="c-icon" />
                    <span>{userName}</span>
                <h1 className="c-title">- Current Faults</h1>
            </header>
            
            {/* Espacement entre header et navbar */}
            <div className="c-spacer"></div>
            
            <Navbar />
            </div>
            
        </div>
    );
}

export default CurrentFaults;