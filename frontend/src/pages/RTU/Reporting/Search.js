import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import './Search.css'; 
import { FaUser , FaHome } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import axios from "axios";


const Search = () => {
    const userName = localStorage.getItem("userName") || "User";
    

    return (
        <div className="s-container">
            {/* Header avec espacement */}


        <div className="header"> 
            <header className="s-header">
                <Link to="/Home" className="s-logo">FAST</Link>
                <FaUser className="s-icon" />
                    <span>{userName}</span>
                <h1 className="s-title">- Search</h1>
            </header>
            
            {/* Espacement entre header et navbar */}
            <div className="s-spacer"></div>
            
            <Navbar />
            </div>
            
        </div>
    );
}

export default Search;