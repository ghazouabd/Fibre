// AdHocTest.js
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import './AdHocTest.css';
import { FaUser } from "react-icons/fa";
import React, { useState, useEffect } from "react";
import axios from "axios";

const AdHocTest = () => {
    const userName = localStorage.getItem("userName") || "User";
    const token = localStorage.getItem("token");
    const [loading, setLoading] = useState(false);
    const [latestPdf, setLatestPdf] = useState(null);
    const [editMode, setEditMode] = useState(false);

    // État pour les paramètres de test
    const [testSettings, setTestSettings] = useState({
        wavelength: "1550.0 nm (B)",
        resolution: "Normal",
        duration: "15",
        ior: "1.4683",
        rbs: "-81.87",
        helixFactor: "0",
        spliceLoss: "0.02",
        reflectance: "-72",
        endFiber: "4"
    });

    // Charger la configuration existante
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const res = await axios.get("http://localhost:5000/api/ad-hoc-tests", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.data.config) {
                    setTestSettings(res.data.config.settings);
                }
            } catch (error) {
                console.error("Erreur de récupération de la config :", error);
            }
        };
        fetchConfig();
    }, []);

    const handleConfigure = () => setEditMode(true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('http://localhost:5000/api/ad-hoc-tests', 
                { settings: testSettings }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Configuration sauvegardée !");
            setEditMode(false);
        } catch (error) {
            console.error(error);
            alert("Erreur de sauvegarde");
        }
    };

    const handleChange = (e) => {
        setTestSettings({
            ...testSettings,
            [e.target.name]: e.target.value
        });
    };

    const runDetection = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/python/run-consumer');
            if (res.data.success) alert("Détection réussie !");
        } catch (err) {
            console.error(err);
            alert("Erreur de détection");
        } finally {
            setLoading(false);
        }
    };

    const fetchLatestPdf = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/latest-report');
            setLatestPdf(response.data.latestPdf);
        } catch (error) {
            console.error("Erreur PDF:", error);
            alert("Aucun rapport disponible");
        }
    };

    return (
        <div className="ad-container">
            <div className="header">
                <header className="ad-header">
                    <Link to="/Home" className="ad-logo">FAST</Link>
                    <FaUser className="ad-icon" />
                    <span>{userName}</span>
                    <h1 className="ad-title">- Ad Hoc Test</h1>
                </header>
                <div className="ad-spacer"></div>
                <Navbar />
            </div>

            <main className="ad-content">
                <div className="header-section">
                    <h2>Test Ad Hoc parameters</h2>
                    <button onClick={handleConfigure} className="configure-button">
                        {editMode ? "Cancel" : "Configure"}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="test-table">
                    {/* Section Acquisition */}
                    <fieldset className="test-section">
                    <h2>OTH:1 P001</h2>
                        <legend>Acquisition settings </legend>
                        <div className="form-row">
                            <label>Wavelength :</label>
                            <select 
                                name="wavelength"
                                value={testSettings.wavelength}
                                onChange={handleChange}
                                disabled={!editMode}
                            >
                                <option>1550.0 nm (B)</option>
                                <option>1625.0 nm (B)</option>
                            </select>
                        </div>
                        
                        <div className="form-row">
                            <label>Resolution:</label>
                            <select 
                                name="resolution"
                                value={testSettings.resolution}
                                onChange={handleChange}
                                disabled={!editMode}
                            >
                                <option>Normal</option>
                                <option>High</option>
                            </select>
                        </div>

                        <div className="form-row">
                            <label>Duration :(s):</label>
                            <input
                                type="number"
                                name="duration"
                                value={testSettings.duration}
                                onChange={handleChange}
                                disabled={!editMode}
                            />
                        </div>
                    </fieldset>

                    {/* Section Route optique */}
                    <fieldset className="test-section">
                        <legend>Optical route Settings</legend>
                        <div className="form-row">
                            <label>IOR:</label>
                            <input
                                type="number"
                                step="0.0001"
                                name="ior"
                                value={testSettings.ior}
                                onChange={handleChange}
                                disabled={!editMode}
                            />
                        </div>

                        <div className="form-row">
                            <label>RBS (dB/ns):</label>
                            <input
                                type="number"
                                step="0.01"
                                name="rbs"
                                value={testSettings.rbs}
                                onChange={handleChange}
                                disabled={!editMode}
                            />
                        </div>

                        <div className="form-row">
                            <label>Average helix factor (%):</label>
                            <input
                                type="number"
                                name="helixFactor"
                                value={testSettings.helixFactor}
                                onChange={handleChange}
                                disabled={!editMode}
                            />
                        </div>
                    </fieldset>

                    {/* Section Analyse */}
                    <fieldset className="test-section">
                        <legend>Analysis settings</legend>
                        <div className="form-row">
                            <label>Splice loss threshold (dB):</label>
                            <input
                                type="number"
                                step="0.01"
                                name="spliceLoss"
                                value={testSettings.spliceLoss}
                                onChange={handleChange}
                                disabled={!editMode}
                            />
                        </div>

                        <div className="form-row">
                            <label>Reflectance threshold (dB):</label>
                            <input
                                type="number"
                                name="reflectance"
                                value={testSettings.reflectance}
                                onChange={handleChange}
                                disabled={!editMode}
                            />
                        </div>

                        <div className="form-row">
                            <label>End-od-fiber threshold (dB):</label>
                            <input
                                type="number"
                                name="endFiber"
                                value={testSettings.endFiber}
                                onChange={handleChange}
                                disabled={!editMode}
                            />
                        </div>
                    </fieldset>

                    {editMode && <button type="submit" className="save-button">Apply</button>}
                </form>

                <div className="action-buttons">
                    <button 
                        type="button" 
                        className="detect-btn" 
                        onClick={runDetection}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : 'Test'}
                    </button>

                    <button onClick={fetchLatestPdf} className="pdf-button">
                        Show report
                    </button>
                </div>

                {latestPdf && (
                    <div className="pdf-viewer">
                        <div className="pdf-info">
                            Actual test of  : {latestPdf.replace('.pdf', '')}
                        </div>
                        <iframe
                            title="Rapport de test"
                            src={`http://localhost:5000/reports/${latestPdf}`}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdHocTest;