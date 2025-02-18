import React from "react";
import Sidebar from "../../components/Sidebar"; // Assure-toi que le chemin est correct
import "./Monitoring.css";

const Monitoring = () => {
  return (
    <div className="monitoring-container">
      <Sidebar />
      <div className="monitoring-content">
        <h1>Monitoring</h1>
        <p>Bienvenue sur la page de monitoring.</p>
      </div>
    </div>
  );
};

export default Monitoring;
