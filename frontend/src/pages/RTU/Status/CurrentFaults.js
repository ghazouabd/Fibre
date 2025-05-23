import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import './CurrentFaults.css'; 
import { FaUser , FaHome } from "react-icons/fa";
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import backgroundVideo from '../../../assets/videos/fibre.mp4';
import { io } from "socket.io-client";


const CurrentFaults = () => {
    const userName = localStorage.getItem("userName") || "User";
    const [loading, setLoading] = useState(false);
    const [latestPdf, setLatestPdf] = useState(null);
    const [notifications, setNotifications] = useState([]);
      
    
    const runPythonScript2 = async () => {
        try {
          setLoading(true);
          const res = await axios.get('http://localhost:5000/api/python/run-interact');
          alert("Détection lancée");
        } catch (err) {
          console.error(err);
          alert("Erreur lors de l'exécution du script.");
        } finally {
          setLoading(false);
        }
      };
      

      const fetchLatestPdf = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/latest-faults');
          setLatestPdf(response.data.latestPdf);
        } catch (error) {
          console.error("Erreur PDF:", error);
          alert("Aucun rapport disponible");
        }
      };
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
        <div className="c-container">
            {/* Header avec espacement */}


        <div className="header"> 
          
            <header className="c-header">
                <Link to="/Home" className="c-logo">OptiTrack</Link>
                <Link to="/Onboard" className="s-link">
                                        <FaHome className="s-icon" size={20} />
                                        </Link>
                <div className="notif-user">
                  <FaUser className="s-icon" />
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                </div>
                <span>{userName}</span>
                <h1 className="c-title">- Current Faults</h1>
            </header>
            
            {/* Espacement entre header et navbar */}
            <div className="c-spacer"></div>
            
            <Navbar />
            </div>
            <main className="opt-content">
            <div className="action-buttons">
          <button type="button" className="detectt-btn" disabled={loading} onClick={runPythonScript2}>
            {loading ? 'Processing...' : 'Detect a fault'}
          </button>

          <button onClick={fetchLatestPdf} className="pdf-button">
            Show Faults
          </button>
        </div>
        {latestPdf && (
          <div className="pdff-viewer">
            <div className="pdff-info">
              Faults  : {latestPdf.replace('.pdf', '')}
            </div>
            <iframe
              title="Rapport OTDR"
              src={`http://localhost:5000/faults/${latestPdf}`}
            />
          </div>
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

export default CurrentFaults;