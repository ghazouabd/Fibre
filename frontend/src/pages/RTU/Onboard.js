import React , { useState, useEffect }from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import './Onboard.css'; 
import { FaUser, FaHome } from "react-icons/fa";
import backgroundVideo from '../../assets/videos/fibre-1.mp4';
import {  useMemo } from "react";
import { io } from "socket.io-client";
import axios from 'axios';


const Onboard = () => {
    const userName = localStorage.getItem("userName") || "User";
    const [notifications, setNotifications] = useState([]);


useEffect(() => {
        axios.get('http://localhost:5000/api/notifications')
          .then((res) => setNotifications(res.data))
          .catch((err) => console.error("Erreur chargement notifications:", err));
      
        const socket = io('http://localhost:5000');
        socket.on('newNotification', (notif) => {
          setNotifications((prev) => [notif, ...prev]);
        });
      
        return () => socket.disconnect();
      }, []);
      const unreadCount = useMemo(() => {
        return notifications.filter(notif => !notif.read).length;
      }, [notifications]);

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
                <div className="notif-user">
     <FaUser className="s-icon" />
    {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
 </div>
                <span>{userName}</span>
            </header>
            
            {/* Spacer */}
            <div className="header-spacer"></div>
            
            <Navbar />
        </div>
    );
}

export default Onboard;