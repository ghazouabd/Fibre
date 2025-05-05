import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import './CurrentFaults.css'; 
import { FaUser, FaHome, FaBell } from "react-icons/fa";
import axios from "axios";

const CurrentFaults = () => {
    const userName = localStorage.getItem("userName") || "User";
    const [loading, setLoading] = useState(false);
    const [latestPdf, setLatestPdf] = useState(null);
    const [alarms, setAlarms] = useState([]);
    const [showAlarms, setShowAlarms] = useState(false);
    const [ws, setWs] = useState(null);
      
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

        // In your fetchAlarms function
    const fetchAlarms = async () => {
      try {
          const response = await axios.get('http://localhost:5000/api/alarms', {
              headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
              }
          });
          setAlarms(response.data);
      } catch (error) {
          console.error("Error fetching alarms:", error);
      }
    };

    useEffect(() => {
        // Request notification permission
        if ('Notification' in window) {
            Notification.requestPermission();
        }

        // Fetch initial alarms
        fetchAlarms();

        // Set up WebSocket connection
        const websocket = new WebSocket('ws://localhost:8080');
        setWs(websocket);

        websocket.onmessage = (event) => {
            const newAlarm = JSON.parse(event.data);
            setAlarms(prev => [newAlarm, ...prev]);
            
            // Show desktop notification
            if (Notification.permission === 'granted') {
                new Notification(`Fiber Alert: ${newAlarm.severity}`, {
                    body: `Amplitude drop of ${newAlarm.deviation.toFixed(2)} dB detected at ${newAlarm.location}`,
                    icon: '/path/to/icon.png'
                });
            }
        };

        return () => {
            if (websocket) websocket.close();
        };
    }, []);

    return (
        <div className="c-container">
            <div className="header"> 
                <header className="c-header">
                    <Link to="/Home" className="c-logo">FAST</Link>
                    <div className="c-icons">
                        <button 
                            className="alarm-button"
                            onClick={() => setShowAlarms(!showAlarms)}
                        >
                            <FaBell />
                            {alarms.length > 0 && (
                                <span className="alarm-badge">{alarms.length}</span>
                            )}
                        </button>
                        <FaUser className="c-icon" />
                        <span>{userName}</span>
                    </div>
                    <h1 className="c-title">- Current Faults</h1>
                </header>
                
                <div className="c-spacer"></div>
                <Navbar />
            </div>

            <main className="opt-content">
                {showAlarms && (
                    <div className="alarms-panel">
                        <h3>Active Alarms ({alarms.length})</h3>
                        <div className="alarms-list">
                            {alarms.length > 0 ? (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Severity</th>
                                            <th>Location</th>
                                            <th>Deviation</th>
                                            <th>Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alarms.map(alarm => (
                                            <tr 
                                                key={alarm._id} 
                                                className={`alarm-row alarm-${alarm.severity.toLowerCase()}`}
                                            >
                                                <td>{alarm.severity}</td>
                                                <td>{alarm.location}</td>
                                                <td>{alarm.deviation.toFixed(2)} dB</td>
                                                <td>{new Date(alarm.timestamp).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p>No active alarms</p>
                            )}
                        </div>
                    </div>
                )}

                <div className="action-buttons">
                    <button 
                        type="button" 
                        className="detectt-btn" 
                        disabled={loading} 
                        onClick={runPythonScript2}
                    >
                        {loading ? 'Processing...' : 'Detect a fault'}
                    </button>

                    <button onClick={fetchLatestPdf} className="pdf-button">
                        Show Faults
                    </button>
                </div>

                {latestPdf && (
                    <div className="pdff-viewer">
                        <div className="pdff-info">
                            Faults: {latestPdf.replace('.pdf', '')}
                        </div>
                        <iframe
                            title="Rapport OTDR"
                            src={`http://localhost:5000/faults/${latestPdf}`}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}

export default CurrentFaults;