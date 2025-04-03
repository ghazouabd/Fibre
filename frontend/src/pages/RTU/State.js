import React, { useState } from "react";
import Sidebar1 from "../../components/Sidebar1";
import "./State.css";

const State = () => {
  const [currentView, setCurrentView] = useState("overview");

  return (
    <div className="state-monitoring-container">
      <Sidebar1 />
      <main className="state-main-content">
        {/* Navigation tabs */}
        <div className="state-nav-tabs">
          <button 
            className={currentView === "overview" ? "state-tab-active" : ""}
            onClick={() => setCurrentView("overview")}
          >
            Overview
          </button>
          <button 
            className={currentView === "realTime" ? "state-tab-active" : ""}
            onClick={() => setCurrentView("realTime")}
          >
            Real-Time Data
          </button>
          <button 
            className={currentView === "history" ? "state-tab-active" : ""}
            onClick={() => setCurrentView("history")}
          >
            History
          </button>
          <button 
            className={currentView === "events" ? "state-tab-active" : ""}
            onClick={() => setCurrentView("events")}
          >
            Events
          </button>
          <button 
            className={currentView === "analytics" ? "state-tab-active" : ""}
            onClick={() => setCurrentView("analytics")}
          >
            Analytics
          </button>
        </div>

        {/* Content area */}
        <section className="state-content-section">
          <div className="state-content-header">
            <h2>
              {currentView.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </h2>
          </div>
          
          <div className="state-data-container">
            <div className="state-view-content">
              {`${currentView} monitoring content`}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default State;