import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import './NetworkSetup.css';
import { FaUser } from "react-icons/fa";
import axios from 'axios';

const NetworkSetup = () => {
    const userName = localStorage.getItem("userName") || "User";
    const [formData, setFormData] = useState({
        fixedAddress: false,
        rearIp: '',
        rearSubnet: '',
        rearGateway: '',
        rearMac: '',
        rearPrimaryDns: '',
        rearSecondaryDns: '',
        localIp: '',
        localSubnet: '',
        localMac: '',
        emsHost: '',
        emsFrequency: '',
        emsTopology: '',
        emailHost: '',
        emailPort: '',
        serverType: '',
        emailSender: '',
        authRequired: false,
        emailUser: '',
        emailPassword: '',
        emailConfirmPassword: ''
    });
    const [isEditable, setIsEditable] = useState(false);
    const [showMessage, setShowMessage] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchNetworkConfig();
    }, []);

    const fetchNetworkConfig = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/network-config', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.success && response.data.config) {
                setFormData(response.data.config);
            }
        } catch (error) {
            console.error('Error fetching network config:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Exclure le champ de confirmation de mot de passe avant l'envoi
            const { emailConfirmPassword, ...dataToSave } = formData;
            
            await axios.put('http://localhost:5000/api/network-config', dataToSave, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setIsEditable(false);
            setMessage('Configuration saved successfully!');
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 2000);
        } catch (error) {
            console.error('Error saving network config:', error);
            setMessage('Failed to save configuration');
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 2000);
        }
    };

    const handleEdit = () => {
        setIsEditable(true);
    };

    const renderInput = (label, name, type = "text", placeholder = "") => (
        <div className="input-row">
            <label>{label}</label>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={formData[name] || ""}
                onChange={handleInputChange}
                readOnly={!isEditable}
            />
        </div>
    );

    return (
        <div className="network-container">
            <div className="header">
                <header className="network-header">
                    <Link to="/Home" className="network-logo">FAST</Link>
                    <FaUser className="network-icon" />
                    <span>{userName}</span>
                    <h1 className="networK-title">- Network Setup</h1>
                </header>

                <div className="header-spacer"></div>
                <Navbar />
            </div>
            
            <main className="network-content">
                <div className="network-form">
                    <fieldset className="form-section">
                        <legend>Rear Ethernet Adapter</legend>
                        <label>
                            <input
                                type="checkbox"
                                name="fixedAddress"
                                checked={formData.fixedAddress || false}
                                onChange={handleInputChange}
                                disabled={!isEditable}
                            /> Fixed address
                        </label>
                        {renderInput("IP Address:", "rearIp", "text", "10.25.41.30")}
                        {renderInput("Subnet mask:", "rearSubnet", "text", "255.255.255.0")}
                        {renderInput("Gateway:", "rearGateway", "text", "10.254.254.254")}
                        {renderInput("MAC address:", "rearMac", "text", "00:0b:ab:2a:f7:17")}
                        {renderInput("Primary DNS:", "rearPrimaryDns")}
                        {renderInput("Secondary DNS:", "rearSecondaryDns")}
                    </fieldset>

                    <fieldset className="form-section">
                        <legend>Local Access Port</legend>
                        {renderInput("IP Address:", "localIp", "text", "192.168.0.1")}
                        {renderInput("Subnet mask:", "localSubnet", "text", "255.255.0.0")}
                        {renderInput("MAC address:", "localMac", "text", "00:0b:ab:2a:f7:18")}
                    </fieldset>

                    <fieldset className="form-section">
                        <legend>EMS Server Configuration</legend>
                        {renderInput("IP Address / Host Name:", "emsHost")}
                        {renderInput("Regular frequency (hrs):", "emsFrequency", "number", "24")}
                        <div className="input-row">
                            <label>Network topology:</label>
                            <select
                                name="emsTopology"
                                value={formData.emsTopology || ""}
                                onChange={handleInputChange}
                                disabled={!isEditable}
                            >
                                <option value="">--Select--</option>
                                <option value="LAN">LAN</option>
                                <option value="WAN">WAN</option>
                            </select>
                        </div>
                    </fieldset>

                    <fieldset className="form-section">
                        <legend>E-Mail Server Configuration</legend>
                        {renderInput("IP Address / Host Name:", "emailHost")}
                        {renderInput("Port:", "emailPort", "number")}
                        <div className="input-row">
                            <label>Server type:</label>
                            <select
                                name="serverType"
                                value={formData.serverType || ""}
                                onChange={handleInputChange}
                                disabled={!isEditable}
                            >
                                <option value="">--Select--</option>
                                <option value="SMTP">SMTP</option>
                                <option value="IMAP">IMAP</option>
                            </select>
                        </div>
                        {renderInput("Sender e-mail address:", "emailSender", "email", "NqmsSystem@noreply.com")}
                        <div className="input-row">
                            <label>
                                <input
                                    type="checkbox"
                                    name="authRequired"
                                    checked={formData.authRequired || false}
                                    onChange={handleInputChange}
                                    disabled={!isEditable}
                                /> Authentication required
                            </label>
                        </div>
                        {renderInput("User name:", "emailUser")}
                        {renderInput("Password:", "emailPassword", "password")}
                        {renderInput("Confirm password:", "emailConfirmPassword", "password")}
                    </fieldset>

                    <div className="form-buttonss">
                        <button type="button" onClick={handleSave} disabled={!isEditable}>Save</button>
                        <button type="button" onClick={handleEdit} disabled={isEditable}>Edit</button>
                        {showMessage && <span className="message">{message}</span>}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NetworkSetup;