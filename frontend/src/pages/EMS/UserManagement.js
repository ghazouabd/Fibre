import React, { useState } from "react";
import { FaSearch, FaUser, FaCog, FaSun, FaRegCalendar } from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import "../EMS/Usermanagement.css";

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState("userinfo");

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
          <h2>{activeTab.replace(/^./, (str) => str.toUpperCase())}</h2>
          <div className="card-container">
            {activeTab === "userinfo" && (
              <>
                
              </>
            )}
            {activeTab === "notif" && (
              <>
               
              </>
            )}
            {activeTab === "usergroup" && (
              <>
                
              </>
            )}
            {activeTab === "duty" && (
              <>
                
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserManagement;
