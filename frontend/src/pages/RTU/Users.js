import React, { useState } from "react";
import Sidebar1 from "../../components/Sidebar1";
import "../RTU/Users.css";

const Users = () => {
  const [currentView, setCurrentView] = useState("userProfile");

  return (
    <div className="users-management-container">
      <Sidebar1 />
      <main className="users-main-content">
        {/* Navigation tabs */}
        <div className="users-navigation-tabs">
          <button 
            className={currentView === "userProfile" ? "tab-active" : ""} 
            onClick={() => setCurrentView("userProfile")}
          >
            User Profile
          </button>
          
        </div>

        {/* Content area */}
        <section className="users-content-section">
          <div className="users-content-header">
            <h2>{currentView.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</h2>
          </div>
          
          <div className="users-view-container">
            {currentView === "userProfile" && (
              <div className="user-profile-view">User Profile Content</div>
            )}
            
          </div>
        </section>
      </main>
    </div>
  );
};

export default Users;