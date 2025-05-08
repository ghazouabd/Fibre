import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import './Notifications.css'; 
import { FaUser } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import axios from "axios";
import backgroundVideo from '../../../assets/videos/fibre.mp4';
import { io } from 'socket.io-client';



const Notifications = () => {
    const userName = localStorage.getItem("userName") || "User";
    const [notifications, setNotifications] = useState([]);
    const socket = io('http://localhost:5000');

useEffect(() => {
  socket.on('newNotification', (notif) => {
    setNotifications((prev) => [notif, ...prev]);
  });

  return () => socket.disconnect();
}, []);
    useEffect(() => {
     
              axios.get('http://localhost:5000/api/notifications')
        .then((res) => {
            setNotifications(res.data); // données venant du modèle que tu as montré
        })
        .catch((err) => {
            console.error("Erreur chargement notifications:", err);
        });
    }, []);

    const markAsRead = (id) => {
        axios.put(`http://localhost:5000/api/notifications/${id}/read`)
            .then((res) => {
                setNotifications((prev) =>
                    prev.map((notif) =>
                        notif._id === id ? { ...notif, read: true } : notif
                    )
                );
            })
            .catch((err) => {
                console.error("Erreur lors du marquage comme lu:", err);
            });
    };

    return (
        <div className="s-container">
            <div className="header"> 
                <header className="s-header">
                    <Link to="/Home" className="s-logo">OptiTrack</Link>
                    <FaUser className="s-icon" />
                    <span>{userName}</span>
                    <h1 className="s-title">- Notifications</h1>
                </header>
                
                <div className="s-spacer"></div>
                <Navbar />
            </div>
            
            <main className="s-content">
                {notifications.length === 0 ? (
                    <p>Aucune notification.</p>
                ) : (
                    <table className="notif-table">
  <thead>
    <tr>
      <th>Gravité</th>
      <th>Lieu</th>
      <th>Type</th>
      <th>Amplitude</th>
      <th>Déviation</th>
      <th>Date</th>
    </tr>
  </thead>
  <tbody>
    {notifications.map((notif) => (
      <tr key={notif._id} className={notif.read ? 'read' : 'unread'} onClick={() => markAsRead(notif._id)}>
        <td><strong>{notif.severity}</strong></td>
        <td>{notif.location}</td>
        <td>{notif.eventType}</td>
        <td>{notif.amplitude} dB</td>
        <td>{notif.deviation} dB</td>
        <td>{notif.timestamp}</td>
      </tr>
    ))}
  </tbody>
</table>

                )}
            </main>
              <div className="video-background">
                                                          <video autoPlay loop muted playsInline>
                                                              <source src={backgroundVideo} type="video/mp4" />
                                                              Your browser does not support the video tag.
                                                          </video>
                                                          
                                                         
                                              </div>
        </div>
    );
}

export default Notifications;
