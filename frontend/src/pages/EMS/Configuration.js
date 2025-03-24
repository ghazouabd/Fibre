import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import "./Configuration.css";

const Configuration = () => {
  const [activeTab, setActiveTab] = useState("rtu");

  return (
    <div className="container-ems">
      <Sidebar />
      <main className="content-main">
        {/* Filter Bar (Tabs) */}
        <div className="filter-bar">
          <button
            className={activeTab === "rtu" ? "active" : ""}
            onClick={() => setActiveTab("rtu")}
          >
            RTU Configuration
          </button>
          <button
            className={activeTab === "network" ? "active" : ""}
            onClick={() => setActiveTab("network")}
          >
            Network Configuration
          </button>
          <button
            className={activeTab === "connection" ? "active" : ""}
            onClick={() => setActiveTab("connection")}
          >
            Connection
          </button>
          <button
            className={activeTab === "alarm" ? "active" : ""}
            onClick={() => setActiveTab("alarm")}
          >
            Alarm Types
          </button>
          <button
            className={activeTab === "system" ? "active" : ""}
            onClick={() => setActiveTab("system")}
          >
            System Settings
          </button>
          <button
            className={activeTab === "optical" ? "active" : ""}
            onClick={() => setActiveTab("optical")}
          >
            Optical Routes
          </button>
        </div>

        {/* Content Section */}
        <section className="section-info">
          <h2>{activeTab.replace(/^./, (str) => str.toUpperCase())}</h2>
          <div className="card-container">
            {activeTab === "rtu" && (
              <>
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" name="name" defaultValue="RTU4421" />
                </div>
                <div className="form-group">
                  <label>Comments</label>
                  <textarea name="comments"></textarea>
                </div>
                <div className="form-group">
                  <label>Contact Person</label>
                  <input type="text" name="contactPerson" defaultValue="user1" />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input type="text" name="phoneNumber" defaultValue="323-032-0982" />
                </div>
                <div className="form-group">
                  <label>Site *</label>
                  <select name="site" defaultValue="Somerset">
                    <option value="Somerset">Somerset</option>
                    <option value="New York">New York</option>
                    <option value="Los Angeles">Los Angeles</option>
                  </select>
                </div>
                <div className="form-group">
                  <input type="checkbox" name="offline" />
                  <label>Offline</label>
                </div>
                <button className="edit-btn">Edit</button>
              </>
            )}

            {activeTab === "network" && (
              <>
                <div className="form-group">
                  <label>Host Name *</label>
                  <input type="text" name="name" defaultValue="RTU4421" disabled />
                </div>
                <div className="form-group">
                  <input type="checkbox" name="fixedAddress" defaultChecked />
                  <label>Fixed Address</label>
                </div>
                <div className="form-group">
                  <label>IP Address</label>
                  <input type="text" name="ipAddress" defaultValue="172.16.66.165" />
                </div>
                <div className="form-group">
                  <label>Subnet Mask</label>
                  <input type="text" name="subnetMask" defaultValue="255.255.0.0" />
                </div>
                <div className="form-group">
                  <label>Gateway</label>
                  <input type="text" name="gateway" defaultValue="172.16.65.254" />
                </div>
                <div className="form-group">
                  <label>Mac Address</label>
                  <input type="text" name="macAddress" defaultValue="00:0C:29:3A:AB:47" disabled />
                </div>
                <button className="edit-btn">Edit</button>
              </>
            )}

            {activeTab === "connection" && (
              <>
                <div className="form-group">
                  <label>Server IP/Host Name *</label>
                  <input type="text" name="serverIp" defaultValue="172.16.66.200" />
                </div>
                <div className="form-group">
                  <label>Network Topology *</label>
                  <select name="networkTopology" defaultValue="LAN">
                    <option value="LAN">LAN</option>
                    <option value="WAN">WAN</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Regular Frequency (hrs.) *</label>
                  <input type="number" name="frequency" defaultValue="24" />
                </div>
                <div className="form-group">
                  <label>Public IP Address</label>
                  <input type="text" name="publicIp" />
                </div>
                <button className="edit-btn">Edit</button>
              </>
            )}

            {activeTab === "alarm" && (
              <>
                <div className="form-group">
                  <label>Alarm Type *</label>
                  <select name="alarmType" defaultValue="FiberFault">
                    <option value="FiberFault">Fiber Fault</option>
                    <option value="RTU_AVAILABILITY">RTU Availability</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Severity *</label>
                  <select name="severity" defaultValue="Low">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Automatic Events</label>
                  <input type="checkbox" name="automaticEvents" defaultChecked />
                </div>
                <div className="form-group">
                  <label>Alert Sending</label>
                  <input type="checkbox" name="alertSending" defaultChecked />
                </div>
                <button className="edit-btn">Edit</button>
              </>
            )}

            {activeTab === "system" && (
              <>
                <div className="form-group">
                  <label>System Name *</label>
                  <input type="text" name="systemName" defaultValue="EMS System" />
                </div>
                <div className="form-group">
                  <label>System Version</label>
                  <input type="text" name="systemVersion" defaultValue="1.0.2" disabled />
                </div>
                <div className="form-group">
                  <label>Database Size</label>
                  <input type="text" name="databaseSize" defaultValue="500 MB" disabled />
                </div>
                <div className="form-group">
                  <label>System Uptime</label>
                  <input type="text" name="uptime" defaultValue="120 days" disabled />
                </div>
                <button className="edit-btn">Edit</button>
              </>
            )}

            {activeTab === "optical" && (
              <>
                <div className="form-group">
                  <label>Optical Route Name *</label>
                  <input type="text" name="opticalRouteName" defaultValue="OTH1 P001" />
                </div>
                <div className="form-group">
                  <label>Wavelength (nm) *</label>
                  <input type="number" name="wavelength" defaultValue="1550" />
                </div>
                <div className="form-group">
                  <label>Fiber Length (km) *</label>
                  <input type="number" name="fiberLength" defaultValue="10.5" />
                </div>
                <div className="form-group">
                  <label>Test Setup</label>
                  <select name="testSetup" defaultValue="Monitoring">
                    <option value="Monitoring">Monitoring</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <button className="edit-btn">Edit</button>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Configuration;