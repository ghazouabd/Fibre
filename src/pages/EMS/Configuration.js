import React, { useState } from "react";
import "./Configuration.css";
import Sidebar from "../../components/Sidebar";

const Configuration = () => {
  const [config, setConfig] = useState({
    name: "RTU4421",
    comments: "",
    inventoryNumber: "",
    contactPerson: "user1",
    phoneNumber: "323-032-0982",
    site: "Somerset",
    offline: false,
    fixedAddress: true,
    ipAddress: "172.16.66.165",
    subnetMask: "255.255.0.0",
    gateway: "172.16.65.254",
    macAddress: "00:0C:29:3A:AB:47",
    serverIp: "172.16.66.200",
    networkTopology: "LAN",
    frequency: 24,
    publicIp: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig({
      ...config,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div className="config-container">
        <Sidebar/>
      <div className="section">
        <h3>RTU</h3>
        <div className="form-group">
          <label>Name *</label>
          <input type="text" name="name" value={config.name} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Comments</label>
          <textarea name="comments" value={config.comments} onChange={handleChange}></textarea>
        </div>
        <div className="form-group">
          <label>Contact Person</label>
          <input type="text" name="contactPerson" value={config.contactPerson} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input type="text" name="phoneNumber" value={config.phoneNumber} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Site *</label>
          <select name="site" value={config.site} onChange={handleChange}>
            <option value="Somerset">Somerset</option>
            <option value="New York">New York</option>
            <option value="Los Angeles">Los Angeles</option>
          </select>
        </div>
        <div className="form-group">
          <input type="checkbox" name="offline" checked={config.offline} onChange={handleChange} />
          <label>Offline</label>
        </div>
      </div>

      <div className="section">
        <h3>RTU Network Configuration</h3>
        <div className="form-group">
          <label>Host Name *</label>
          <input type="text" name="name" value={config.name} disabled />
        </div>
        <div className="form-group">
          <input type="checkbox" name="fixedAddress" checked={config.fixedAddress} onChange={handleChange} />
          <label>Fixed Address</label>
        </div>
        <div className="form-group">
          <label>IP Address</label>
          <input type="text" name="ipAddress" value={config.ipAddress} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Subnet Mask</label>
          <input type="text" name="subnetMask" value={config.subnetMask} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Gateway</label>
          <input type="text" name="gateway" value={config.gateway} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>MacAddress</label>
          <input type="text" name="macAddress" value={config.macAddress} disabled />
        </div>
      </div>

      <div className="section">
        <h3>Connection</h3>
        <div className="form-group">
          <label>Server IP/Host Name *</label>
          <input type="text" name="serverIp" value={config.serverIp} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Network Topology *</label>
          <select name="networkTopology" value={config.networkTopology} onChange={handleChange}>
            <option value="LAN">LAN</option>
            <option value="WAN">WAN</option>
          </select>
        </div>
        <div className="form-group">
          <label>Regular Frequency (hrs.) *</label>
          <input type="number" name="frequency" value={config.frequency} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Public IP Address</label>
          <input type="text" name="publicIp" value={config.publicIp} onChange={handleChange} />
        </div>
      </div>

     
      <button className="edit-btn">Edit</button>
    </div>
  );
};

export default Configuration;
