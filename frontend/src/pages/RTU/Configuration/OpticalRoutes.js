// OpticalRoutes.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import './OpticalRoutes.css';
import { FaUser } from "react-icons/fa";

const OpticalRoutes = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [name, setName] = useState("OTH S/N:40290");

  const [newRoute, setNewRoute] = useState({
    name: '',
    port: '',
    wavelength: '',
    range: '',
    pulse: '',
    duration: ''
  });

  const userName = localStorage.getItem("userName") || "User";

  const [otdr, setOtdr] = useState({
    serial: "423402",
    model: "OTDR 1550/1625 nm (SM)",
    wavelength1: "1550 nm",
    fiber1: "singlemode B fiber",
    wavelength2: "1625 nm",
    fiber2: "singlemode B fiber"
  });

  const [otau, setOtau] = useState({
    serial: "24107",
    hostedBy: "OTH-700 Optical Test Head 40290",
    connection: "exfobus:0.0.1.0",
    ports: 0,
    selectedPorts: []
  });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setShowRouteForm(true);
      console.log("Fichier sélectionné:", file.name);
    }
  };

  const handleRouteChange = (e) => {
    const { name, value } = e.target;
    setNewRoute(prev => ({ ...prev, [name]: value }));
  };

  const addRoute = () => {
    if (newRoute.name && newRoute.port) {
      setRoutes([...routes, newRoute]);
      setNewRoute({
        name: '',
        port: '',
        wavelength: '',
        range: '',
        pulse: '',
        duration: ''
      });
    }
  };

  const handleChange = (e, section, field) => {
    const value = e.target.value;
    if (section === 'otdr') {
      setOtdr({ ...otdr, [field]: value });
    } else if (section === 'otau') {
      setOtau({ ...otau, [field]: value });
    }
  };

  const handlePortClick = (portNumber) => {
    if (!editMode) return;

    const newSelectedPorts = [...otau.selectedPorts];
    const portIndex = newSelectedPorts.indexOf(portNumber);

    if (portIndex === -1) {
      newSelectedPorts.push(portNumber);
    } else {
      newSelectedPorts.splice(portIndex, 1);
    }

    setOtau({
      ...otau,
      selectedPorts: newSelectedPorts,
      ports: newSelectedPorts.length
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Information applied successfully!");
    setEditMode(false);
    setShowRouteForm(false); // hide route form after applying
  };

  const handleDetectClick = () => {
    document.getElementById('file-upload').click();
  };

  return (
    <div className="opt-container">
      <div className="header">
        <header className="opt-header">
          <Link to="/Home" className="opt-logo">FAST</Link>
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
          <button onClick={() => setEditMode(true)} className="edit-button">
            Configure
          </button>
        </div>

        <form onSubmit={handleSubmit} className="opt-table">
          {/* nom */}
          <div className="form-row name-row">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!editMode}
            />
          </div>

          {/* otdr */}
          <fieldset className="opt-section">
            <legend>OTDR</legend>
            <div className="form-row">
              <label>Serial number:</label>
              <input value={otdr.serial} onChange={(e) => handleChange(e, 'otdr', 'serial')} disabled={!editMode} />
            </div>
            <div className="form-row">
              <label>Model name:</label>
              <input value={otdr.model} onChange={(e) => handleChange(e, 'otdr', 'model')} disabled={!editMode} />
            </div>
            <div className="wavelength-section">
              <h4>Wavelength Configuration</h4>
              <div className="form-row">
                <label>Wavelength 1:</label>
                <input value={otdr.wavelength1} onChange={(e) => handleChange(e, 'otdr', 'wavelength1')} disabled={!editMode} />
                <span>on</span>
                <input value={otdr.fiber1} onChange={(e) => handleChange(e, 'otdr', 'fiber1')} disabled={!editMode} />
              </div>
              <div className="form-row">
                <label>Wavelength 2:</label>
                <input value={otdr.wavelength2} onChange={(e) => handleChange(e, 'otdr', 'wavelength2')} disabled={!editMode} />
                <span>on</span>
                <input value={otdr.fiber2} onChange={(e) => handleChange(e, 'otdr', 'fiber2')} disabled={!editMode} />
              </div>
            </div>
          </fieldset>

          {/* otau */}
          <fieldset className="opt-section">
            <legend>OTAU</legend>
            <div className="form-row">
              <label>Serial number:</label>
              <input value={otau.serial} onChange={(e) => handleChange(e, 'otau', 'serial')} disabled={!editMode} />
              <label>Connection:</label>
              <input value={otau.connection} onChange={(e) => handleChange(e, 'otau', 'connection')} disabled={!editMode} />
            </div>
            <div className="form-row">
              <label>Hosted by:</label>
              <input value={otau.hostedBy} onChange={(e) => handleChange(e, 'otau', 'hostedBy')} disabled={!editMode} />
              <label>Number of ports:</label>
              <input type="number" value={otau.ports} readOnly className="read-only-input" />
            </div>

            <div className="port-grid">
              {[...Array(8)].map((_, i) => {
                const portNumber = i + 1;
                const isSelected = otau.selectedPorts.includes(portNumber);
                return (
                  <button
                    key={i}
                    className={`port ${isSelected ? 'detected' : 'undetected'}`}
                    onClick={() => handlePortClick(portNumber)}
                    type="button"
                    disabled={!editMode}
                  >
                    {portNumber}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="detect-btn"
              disabled={!editMode}
              onClick={handleDetectClick}
            >
              Detect
            </button>

            <input
              type="file"
              id="file-upload"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept=".SOR,.csv"
            />

            {selectedFile && (
              <div className="file-info">
                Fichier sélectionné: {selectedFile.name}
                <button onClick={() => setSelectedFile(null)} className="clear-file-btn">×</button>
              </div>
            )}

            <div className="legend">
              <span className="legend-item detected">Detected</span>
              <span className="legend-item undetected">Undetected</span>
              <span className="legend-item skipped">Skipped</span>
              <span className="legend-item forced">Force Detection</span>
            </div>

            {/* add route inline */}
            {editMode && showRouteForm && (
              <div className="route-inline-form">
                <h4>Configure New Route</h4>
                <div className="form-row horizontal">
                  <input type="text" name="name" placeholder="Name" value={newRoute.name} onChange={handleRouteChange} />
                  <input type="text" name="port" placeholder="Port" value={newRoute.port} onChange={handleRouteChange} />
                  <input type="text" name="wavelength" placeholder="Wavelength" value={newRoute.wavelength} onChange={handleRouteChange} />
                  <input type="text" name="range" placeholder="Range" value={newRoute.range} onChange={handleRouteChange} />
                  <input type="text" name="pulse" placeholder="Pulse" value={newRoute.pulse} onChange={handleRouteChange} />
                  <input type="text" name="duration" placeholder="Duration" value={newRoute.duration} onChange={handleRouteChange} />
                  <button type="button" className="add-route-btn" onClick={addRoute}>Add</button>
                </div>
              </div>
            )}
          </fieldset>

          {/* table routes */}
          <fieldset className="opt-section">
            <legend>Routes</legend>
            {routes.length === 0 ? (
              <p className="no-routes">No routes configured</p>
            ) : (
              <table className="routes-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Port</th>
                    <th>Wavelength</th>
                    <th>Range (km)</th>
                    <th>Pulse</th>
                    <th>Duration (s)</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route, index) => (
                    <tr key={index}>
                      <td>{route.name}</td>
                      <td>{route.port}</td>
                      <td>{route.wavelength}</td>
                      <td>{route.range}</td>
                      <td>{route.pulse}</td>
                      <td>{route.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </fieldset>

          {editMode && <button type="submit" className="save-button">Apply</button>}
        </form>
      </main>
    </div>
  );
};

export default OpticalRoutes;
