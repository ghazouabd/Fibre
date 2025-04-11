import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import './EMSServer.css';
import { FaUser } from "react-icons/fa";
import axios from 'axios';

const EMSServer = () => {
    const userName = localStorage.getItem("userName") || "User";
    const [settingsData, setSettingsData] = useState({
        ems_ip: '',
        ems_freq: '',
        ems_network: '',
        email_ip: '',
        email_port: '',
        email_protocol: '',
        sender_email: '',
        auth_required: false,
        email_user: '',
        email_password: '',
        email_confirm: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [hasExistingConfig, setHasExistingConfig] = useState(false);

    useEffect(() => {
        fetchEMSSettings();
    }, []);

    const fetchEMSSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/ems-config', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data) {
                setSettingsData(response.data);
                setHasExistingConfig(true);
            }
        } catch (error) {
            console.error('Error fetching EMS settings:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettingsData({
            ...settingsData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const method = hasExistingConfig ? 'put' : 'post';
            
            await axios[method]('http://localhost:5000/api/ems-config', settingsData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setIsEditing(false);
            setShowSuccess(true);
            setHasExistingConfig(true);
            setTimeout(() => setShowSuccess(false), 2000);
            fetchEMSSettings();
        } catch (error) {
            console.error('Error saving EMS settings:', error);
            alert('Failed to save configuration');
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const createInputField = (label, name, type = "text", placeholder = "") => (
        <div className="form-group">
            <label className="form-label">{label}</label>
            <input
                className="form-input"
                type={type}
                name={name}
                value={settingsData[name] || ""}
                onChange={handleChange}
                placeholder={placeholder}
                readOnly={!isEditing}
            />
        </div>
    );

    return (
        <div className="server-settings-container">
            <div className="header">
                <header className="server-header">
                    <Link to="/Home" className="server-logo">FAST</Link>
                    <FaUser className="server-icon" />
                    <span>{userName}</span>
                    <h1 className="server-title">- EMS Server</h1>
                </header>

                <div className="header-spacer"></div>
                <Navbar />
            </div>
            <main className="server-main-content">
                <div className="server-forms-wrapper">
                    <fieldset className="server-config-box">
                        <legend>EMS Server Config</legend>
                        {createInputField("IP Address / Host:", "ems_ip")}
                        {createInputField("Polling Frequency (hrs):", "ems_freq", "number", "24")}
                        <div className="form-group">
                            <label className="form-label">Network Type:</label>
                            <select
                                className="form-input"
                                name="ems_network"
                                value={settingsData.ems_network || ""}
                                onChange={handleChange}
                                disabled={!isEditing}
                            >
                                <option value="">--Select--</option>
                                <option value="LAN">LAN</option>
                                <option value="WAN">WAN</option>
                            </select>
                        </div>
                    </fieldset>

                    <fieldset className="server-config-box">
                        <legend>Email Server Config</legend>
                        {createInputField("IP Address / Host:", "email_ip")}
                        {createInputField("Port:", "email_port", "number")}
                        <div className="form-group">
                            <label className="form-label">Server Protocol:</label>
                            <select
                                className="form-input"
                                name="email_protocol"
                                value={settingsData.email_protocol || ""}
                                onChange={handleChange}
                                disabled={!isEditing}
                            >
                                <option value="">--Select--</option>
                                <option value="SMTP">SMTP</option>
                                <option value="IMAP">IMAP</option>
                            </select>
                        </div>
                        {createInputField("Sender Email:", "sender_email", "email", "noreply@example.com")}
                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="auth_required"
                                    checked={settingsData.auth_required || false}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                />
                                Require Authentication
                            </label>
                        </div>
                        {createInputField("User Login:", "email_user")}
                        {createInputField("Password:", "email_password", "password")}
                        {createInputField("Confirm Password:", "email_confirm", "password")}
                    </fieldset>
                </div>

                <div className="server-buttonns">
                    {isEditing ? (
                        <button onClick={handleSave} className="save-buttonn">Apply</button>
                    ) : (
                        <button onClick={handleEdit} className="edit-buttonn">Edit</button>
                    )}
                    {showSuccess && <p className="success-notice">Configuration saved successfully!</p>}
                </div>
            </main>
        </div>
    );
};

export default EMSServer;