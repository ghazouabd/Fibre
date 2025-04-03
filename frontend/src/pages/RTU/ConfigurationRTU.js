import React, { useState } from "react";
import Sidebar1 from "../../components/Sidebar1";
import "./ConfigurationRTU.css";

const ConfigurationRTU = () => {
  const [currentTab, setCurrentTab] = useState("general");

  return (
    <div className="rtu-config-container">
      <Sidebar1 />
      <main className="rtu-main-content">
        {/* Main navigation tabs - Single level */}
        <div className="rtu-main-tabs">
          <button 
            className={currentTab === "general" ? "main-tab-active" : ""}
            onClick={() => setCurrentTab("general")}
          >
            General Config
          </button>
          <button 
            className={currentTab === "communication" ? "main-tab-active" : ""}
            onClick={() => setCurrentTab("communication")}
          >
            Communication
          </button>
          <button 
            className={currentTab === "alarms" ? "main-tab-active" : ""}
            onClick={() => setCurrentTab("alarms")}
          >
            Alarms
          </button>
          <button 
            className={currentTab === "parameters" ? "main-tab-active" : ""}
            onClick={() => setCurrentTab("parameters")}
          >
            Parameters
          </button>
          <button 
            className={currentTab === "deviceInfo" ? "main-tab-active" : ""}
            onClick={() => setCurrentTab("deviceInfo")}
          >
            Device Info
          </button>
        </div>

        {/* Content area */}
        <section className="rtu-content-section">
          <div className="rtu-content-header">
            <h2>
              {currentTab.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </h2>
          </div>
          
          <div className="rtu-view-container">
            <div className="rtu-config-content">
              {`${currentTab} configuration content`}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ConfigurationRTU;