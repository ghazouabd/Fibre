import React, { useState, useEffect } from "react";
import { FaSearch, FaUser, FaCog, FaSun, FaRegCalendar } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import "../EMS/Usermanagement.css";
import axios from "axios";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("userinfo");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    userType: "regular"
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);

  // Récupérer les données utilisateur au chargement
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
          phoneNumber: response.data.phoneNumber || "",
          address: response.data.address || "",
          userType: response.data.userType || "regular"
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
        phoneNumber: userData.phoneNumber,
        address: userData.address,
        userType: userData.userType
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
  
      alert("Profile updated successfully!");
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
                         "Failed to update profile";
      alert(errorMessage);
      
      // Déconnexion si le token est invalide
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        // Redirection vers la page de login si nécessaire
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container-ems">
      <Sidebar />
      <main className="content-main">
        {/* Barre supérieure */}
        
        {/* Barre de filtres (Onglets) */}
        <div className="filter-bar">
          <button className={activeTab === "userinfo" ? "active" : ""} onClick={() => setActiveTab("userinfo")}>
            User Info
          </button>
          <button className={activeTab === "notif" ? "active" : ""} onClick={() => setActiveTab("notif")}>
            Notifications
          </button>
          <button className={activeTab === "usergroup" ? "active" : ""} onClick={() => setActiveTab("usergroup")}>
            User Group
          </button>
          <button className={activeTab === "duty" ? "active" : ""} onClick={() => setActiveTab("duty")}>
            Duty Schedule
          </button>
        </div>

        {/* Contenu selon l'onglet sélectionné */}
        <section className="section-info">
          <div className="header-section">
            <h2>{activeTab.replace(/^./, (str) => str.toUpperCase())}</h2>
            {activeTab === "userinfo" && (
              <button 
                onClick={() => setEditMode(!editMode)}
                className="edit-button"
              >
                {editMode ? "Cancel" : "Edit"}
              </button>
            )}
          </div>
          
          <div className="card-container">
            {activeTab === "userinfo" && (
              <div className="user-info-form">
                {editMode ? (
                  <form onSubmit={handleSubmit}>
                    {/* Champs en lecture seule */}
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        name="name"
                        value={userData.name}
                        readOnly
                        className="read-only-input"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={userData.email}
                        readOnly
                        className="read-only-input"
                      />
                    </div>
                    
                    {/* Champs modifiables */}
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input
                        type="text"
                        name="phoneNumber"
                        value={userData.phoneNumber}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Address</label>
                      <textarea
                        name="address"
                        value={userData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>User Type</label>
                      <select
                        name="userType"
                        value={userData.userType}
                        onChange={handleInputChange}
                        disabled={userData.userType === "admin"} // Empêche la modification si admin
                      >
                        <option value="regular">Regular User</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    
                    <button type="submit" className="save-button">
                      Save Changes
                    </button>
                  </form>
                ) : (
                  <div className="user-info-display">
                    {/* Affichage en mode lecture */}
                    <div className="info-item">
                      <span className="info-label">Name:</span>
                      <span className="info-value">{userData.name}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{userData.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone Number:</span>
                      <span className="info-value">{userData.phoneNumber}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Address:</span>
                      <span className="info-value">{userData.address}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">User Type:</span>
                      <span className="info-value">{userData.userType}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Autres onglets... */}
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserManagement;