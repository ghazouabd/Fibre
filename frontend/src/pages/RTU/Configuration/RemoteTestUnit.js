import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import './RemoteTestUnit.css'; 
import { FaUser , FaHome } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import axios from "axios";


const RemoteTestUnit = () => {
    const userName = localStorage.getItem("userName") || "User";
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        Hostname: "",
        Ipadress: "",
        
      });
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        const fetchUserData = async () => {
          try {
            const token = localStorage.getItem("token");
            
            const response = await axios.get("http://localhost:5000/api/auth/profile", {
              headers: { Authorization: `Bearer ${token}` }
            });
            setUserData({
              name: response.data.name || "",
              email: response.data.email || "",
              Hostname: response.data.Hostname || "",
              Ipadress: response.data.Ipadress || "",
            
            });
            setLoading(false);
          } catch (error) {
            console.error("Error fetching user data:", error);
            setLoading(false);
          }
        };
    
        fetchUserData();
      }, []);

      const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
      };
      const handleSubmit = async (e) => {
        e.preventDefault();
        try {
          const token = localStorage.getItem("token");
          
          if (!token) {
            throw new Error("No authentication token found");
          }
    
          // Ne pas envoyer les champs en lecture seule
          const updateData = {
            Ipadress: userData.Ipadress,
            Hostname: userData.Hostname,
            
          };
      
          const response = await axios.put(
            "http://localhost:5000/api/auth/update-profile",
            updateData,
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
      
          alert("Information applied successfully!");
          setEditMode(false);
          
          // Mettre à jour les données locales si nécessaire
          if (response.data.user) {
            localStorage.setItem("user", JSON.stringify(response.data.user));
          }
        } catch (error) {
          console.error("Error details:", {
            message: error.message,
            response: error.response?.data
          });
          
          const errorMessage = error.response?.data?.message || 
                             error.message || 
                             "Failed to apply information";
          alert(errorMessage);
          
          // Déconnexion si le token est invalide
          if (error.response?.status === 401) {
            localStorage.removeItem("token");
            // Redirection vers la page de login si nécessaire
          }
        }
      };
    

    return (
        <div className="remote-container">
            {/* Header avec espacement */}


        <div className="header"> 
            <header className="remote-header">
                <Link to="/Home" className="remote-logo">FAST</Link>
                <FaUser className="remote-icon" />
                    <span>{userName}</span>
                <h1 className="remote-title">- Remote Test Unit</h1>
            </header>
            
            {/* Espacement entre header et navbar */}
            <div className="header-spacer"></div>
            
            <Navbar />
            </div>

            {/* Contenu spécifique à la page */}
            <main className="remote-content">
                
                <div className="header-section">
                    <h2>Remote Test Unit Configuration</h2>
                    <button 
                        onClick={() => setEditMode(!editMode)}
                        className="r-edit-button"
                    >
                        {editMode ? "Cancel" : "Configure"}
                    </button>
                </div>
                
                <div className="card-container">
                    <div className="remote-test-unit-form">
                        {editMode ? (
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label>Host Name</label>
                                    <input
                                        type="text"
                                        name="Hostname"
                                        value={userData.Hostname}
                                        onChange={handleInputChange}
                                        placeholder="Enter host name"
                                    />
                                </div>
                                
                               
                                
                                <div className="form-group">
                                    <label>IP Address/Host Name</label>
                                    <input
                                        type="text"
                                        name="Ipadress"
                                        value={userData.Ipadress}
                                        onChange={handleInputChange}
                                        placeholder="Enter IP address or host name"
                                    />
                                </div>
                                
                                <button type="submit" className="r-save-button">
                                    Apply
                                </button>
                            </form>
                        ) : (
                            <div className="remote-test-unit-display">
                                <div className="info-item">
                                    <span className="info-label">Host Name:</span>
                                    <span className="info-value">{userData.Hostname || "Not configured"}</span>
                                </div>
                                
                                <div className="info-item">
                                    <span className="info-label">IP Address/Host Name:</span>
                                    <span className="info-value">{userData.Ipadress || "Not configured"}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>





                {/* Ajoutez ici le contenu de votre page */}
            </main>
        </div>
    );
}

export default RemoteTestUnit;