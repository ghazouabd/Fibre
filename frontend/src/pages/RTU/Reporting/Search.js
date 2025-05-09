import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import './Search.css'; 
import { FaUser,FaHome } from "react-icons/fa";
import React, { useState } from "react";
import axios from "axios";
import backgroundVideo from '../../../assets/videos/fibre.mp4';
import { useEffect, useMemo } from "react";
import { io } from "socket.io-client";


const Search = () => {
    const [notifications, setNotifications] = useState([]);

    const userName = localStorage.getItem("userName") || "User";
    const [routes, setRoutes] = useState([]);
    const [showRoutes, setShowRoutes] = useState(false);
    const [loadingStates, setLoadingStates] = useState({});
    const [pdfStates, setPdfStates] = useState({});
    const [latestPdf, setLatestPdf] = useState(null);
    const [showFullReport, setShowFullReport] = useState(false);

    const runPythonScript1 = async (routeId) => {
        try {
            setLoadingStates(prev => ({ ...prev, [routeId]: true }));
            await axios.get('http://localhost:5000/api/python/run-consumer');
            setTimeout(() => {
                setPdfStates(prev => ({ 
                    ...prev, 
                    [routeId]: `report_${routeId}_${Date.now()}.pdf` 
                }));
                setLoadingStates(prev => ({ ...prev, [routeId]: false }));
            }, 1500);
        } catch (err) {
            console.error(err);
            setLoadingStates(prev => ({ ...prev, [routeId]: false }));
        }
    };

    const fetchLatestPdf = async (routeId = null) => {
        try {
            const response = await axios.get('http://localhost:5000/api/latest-report');
            if (routeId) {
                setPdfStates(prev => ({ ...prev, [routeId]: response.data.latestPdf }));
            } else {
                setLatestPdf(response.data.latestPdf);
                setShowFullReport(true);
            }
        } catch (error) {
            console.error("Erreur PDF:", error);
        }
    };

    const fetchRoutes = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/routes');
            setRoutes(response.data);
            setShowRoutes(!showRoutes);
        } catch (error) {
            console.error("Erreur lors de la récupération des routes:", error);
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
        <div className="s-container"><div className="video-background">
                                    <video autoPlay loop muted playsInline>
                                        <source src={backgroundVideo} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                    
                                   
                        </div>
            <div className="header"> 
                <header className="s-header">
                    <Link to="/Home" className="s-logo">OptiTrack</Link>
                    <Link to="/Onboard" className="s-link">
                                            <FaHome className="s-icon" size={20} />
                                            </Link>
                    <div className="notif-user">
                                      <FaUser className="s-icon" />
                                      {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                                    </div>
                    <span>{userName}</span>
                    <h1 className="s-title">- Search</h1>
                </header>
                
                <div className="s-spacer"></div>
                
                <Navbar />
            </div>
            
            <main className="s-content">
                <button onClick={fetchRoutes} className="routes-button">
                    {showRoutes ? 'Hide Routes' : 'Show Available Routes'}
                </button>

                {showRoutes && (
                    <div className="routes-table-container">
                        <table className="routes-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Port</th>
                                    <th>State</th>
                                    <th>Date</th>
                                    <th>Test Information</th>
                                    <th>Actions</th>
                                    <th>Report</th>
                                </tr>
                            </thead>
                            <tbody>
                                {routes.map((route) => (
                                    <tr key={route._id}>
                                        <td>{route.nom}</td>
                                        <td>{route.port}</td>
                                        <td className={`state-${route.state.toLowerCase()}`}>
                                            {route.state}
                                        </td>
                                        <td>{new Date(route.date).toLocaleString()}</td>
                                        <td>
                                            {typeof route.test_information === 'object' 
                                                ? JSON.stringify(route.test_information)
                                                : route.test_information}
                                        </td>
                                        <td className="actions-cell">
                                            <button 
                                                onClick={() => runPythonScript1(route._id)} 
                                                disabled={loadingStates[route._id]}
                                                className="table-detect-btn"
                                            >
                                                {loadingStates[route._id] ? 'Processing...' : 'Detect'}
                                            </button>
                                            <button 
                                                onClick={() => fetchLatestPdf(route._id)} 
                                                className="table-pdf-btn"
                                            >
                                                Show Report
                                            </button>
                                        </td>
                                        <td className="pdf-preview-cell">
                                            {pdfStates[route._id] && (
                                                <iframe
                                                    title={`Report-${route._id}`}
                                                    src={`http://localhost:5000/reports/${pdfStates[route._id]}`}
                                                    className="table-pdf-viewer"
                                                />
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        <div className="full-report-button-container">
                            <button 
                                onClick={() => fetchLatestPdf()} 
                                className="full-pdf-button"
                            >
                                Show More Details
                            </button>
                        </div>
                    </div>
                )}
                
                {showFullReport && latestPdf && (
                    <div className="full-pdf-viewer">
                        <div className="pdf-info">
                            Actual Report of: {latestPdf.replace('.pdf', '')}
                        </div>
                        <iframe
                            title="Full Test Report"
                            src={`http://localhost:5000/reports/${latestPdf}`}
                            className="full-pdf-iframe"
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

export default Search;