import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './Onboard.css'; 
import { FaUser, FaHome } from "react-icons/fa";
import backgroundVideo from '../../assets/videos/fibre.mp4'; // Replace with your video path

const Onboard = () => {
    const userName = localStorage.getItem("userName") || "User";
    return (
        <div className="onboard-container">
            {/* Video Background */}
            <div className="video-background">
                <video autoPlay loop muted playsInline>
                    <source src={backgroundVideo} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                
                {/* Centered Text Overlay */}
                <div className="video-overlay">
                    <h1>Remote Test Unit</h1>
                    <p>Real-time monitoring for enhanced network reliability and performance.</p>
                </div>
            </div>

            {/* Header */}
            <header className="onboard-header">
                <Link to="/Home" className="onboard-logo">OptiTrack</Link>
                <FaUser className="user-icon" />
                <span>{userName}</span>
            </header>
            
            {/* Spacer */}
            <div className="header-spacer"></div>
            
            <Navbar />
        </div>
    );
}

export default Onboard;