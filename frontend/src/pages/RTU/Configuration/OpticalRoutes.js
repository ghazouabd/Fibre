import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../../../components/Navbar';
import './OpticalRoutes.css';
import { Link ,useNavigate } from 'react-router-dom';
import { FaUser,FaHome } from "react-icons/fa";
import backgroundVideo from '../../../assets/videos/fibre.mp4';


const OpticalRoutes = () => {
  const navigate = useNavigate();

  const userName = localStorage.getItem("userName") || "User";
  const token = localStorage.getItem("token");

  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState("OTH S/N:40290");
  const [ports, setPorts] = useState(Array(8).fill({ state: '', color: 'gray' }));
  const [selectedPortIndex, setSelectedPortIndex] = useState(null);
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/optical-routes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.config) {
          const config = res.data.config;
          setName(config.name || "");
          setOtdr(config.otdr || {});
          setOtau(config.otau || {});
          setPorts(config.ports || Array(8).fill({ state: '', color: 'gray' }));
        }
      } catch (error) {
        console.error("Erreur de récupération de la config :", error);
      }
    };
  
    fetchConfig();
  }, []);

  const [otdr, setOtdr] = useState({
    serial: "423402",
    model: "OTDR 1550/1625 nm (SM)",
    wavelength2: "1550 nm",
    fiber2: "singlemode B fiber"
  });

  const [otau, setOtau] = useState({
    serial: "24107",
    hostedBy: "OTH-700 Optical Test Head 40290",
    connection: "exfobus:0.0.1.0",
    ports: 0,
    selectedPorts: [],
    detectionStatus: "undetected"
  });

  const handlePortClick = (index) => {
    setSelectedPortIndex(index);
  };

  const handlePortStateChange = (state) => {
    let color;
    switch (state.toLowerCase()) {
      case 'detected': color = 'green'; break;
      case 'undetected': color = 'lightgray'; break;
      case 'skipped': color = 'orange'; break;
      case 'force detection': color = 'red'; break;
      default: color = 'gray';
    }

    const updatedPorts = [...ports];
    updatedPorts[selectedPortIndex] = { state, color };
    setPorts(updatedPorts);
    setSelectedPortIndex(null);
  };

  const handleChange = (e, section, field) => {
    const value = e.target.value;
    if (section === 'otdr') setOtdr({ ...otdr, [field]: value });
    else if (section === 'otau') setOtau({ ...otau, [field]: value });
  };

  const handleConfigure = () => setEditMode(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const config = { name, otdr, otau, ports };
    try {
      const res = await axios.put('http://localhost:5000/api/optical-routes', config, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Configuration saved successfully");
    } catch (error) {
      console.error(error);
      alert("Error saving configuration");
    }
    setEditMode(false);
  };

  
  return (
    <div className="opt-container">
      
      <div className="header">
        <header className="opt-header">
          <Link to="/Home" className="opt-logo">OptiTrack</Link>
          <Link to="/Onboard" className="s-link">
                                  <FaHome className="s-icon" size={20} />
                                  </Link>
          <FaUser className="network-icon" />
          <span>{userName}</span>
          <h1 className="opt-title">- Optical Routes</h1>
        </header>
        <div className="header-spacer"></div>
        <Navbar />
      </div>

      <main className="opt-content">
        <div className="header-section">
          <h2>Routes Configuration</h2>
          <button onClick={handleConfigure} className="configure-button">Configure</button>
        </div>

        <form onSubmit={handleSubmit} className="test-table">
          <div className="form-row name-row">
            <label>Name:</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} disabled={!editMode} />
          </div>

          <fieldset className="test-section">
            <legend>OTDR</legend>
            <div className="form-row">
              <label>Serial number:</label>
              <input value={otdr.serial} onChange={(e) => handleChange(e, 'otdr', 'serial')} disabled={!editMode} />
            </div>
            <div className="form-row">
              <label>Model name:</label>
              <input value={otdr.model} onChange={(e) => handleChange(e, 'otdr', 'model')} disabled={!editMode} />
            </div>
            <div className="form-row">
              <label>Wavelength 2:</label>
              <input value={otdr.wavelength2} onChange={(e) => handleChange(e, 'otdr', 'wavelength2')} disabled={!editMode} />
              <span>on</span>
              <input value={otdr.fiber2} onChange={(e) => handleChange(e, 'otdr', 'fiber2')} disabled={!editMode} />
            </div>
          </fieldset>

          <fieldset className="test-section">
            <legend>OTAU</legend>
            <div className="form-row">
              <label>Serial number:</label>
              <input value={otau.serial} onChange={(e) => handleChange(e, 'otau', 'serial')} disabled={!editMode} />
              <label>Connection:</label>
              <input value={otau.connection} onChange={(e) => handleChange(e, 'otau', 'connection')} disabled={!editMode} />
            </div>

            <div className="port-selector">
              <h3>Which Port ?</h3>
              <div className="ports">
                {ports.map((port, index) => (
                  <div key={index} className="port-wrapper">
                    <button
                      className="port-button"
                      style={{ backgroundColor: port.color }}
                      onClick={(e) => {
                        e.preventDefault();
                        if (editMode) handlePortClick(index);
                      }}
                    >
                      {index + 1}
                    </button>
                    {editMode && selectedPortIndex === index && (
                      <div className="state-options">
                        <label>État:</label>
                        <select onChange={(e) => handlePortStateChange(e.target.value)} defaultValue="">
                          <option value="" disabled>State ?</option>
                          <option value="detected">Detected</option>
                          <option value="undetected">Undetected</option>
                          <option value="skipped">Skipped</option>
                          <option value="force detection">Force Detection</option>
                        </select>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </fieldset>

          {editMode && <button type="submit" className="save-button">Apply</button>}
        </form>
        <button className="navigate-button" onClick={() => navigate('/reporting/Search')}>
        Analyze routes
        </button>

      </main>
      <div className="video-background">
                                  <video autoPlay loop muted playsInline>
                                      <source src={backgroundVideo} type="video/mp4" />
                                      Your browser does not support the video tag.
                                  </video>
                                  
                                 
                      </div>
    </div>
  );
};

export default OpticalRoutes;
