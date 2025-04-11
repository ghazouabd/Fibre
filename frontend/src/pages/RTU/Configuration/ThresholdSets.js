import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import './ThresholdSets.css';
import { FaUser } from "react-icons/fa";
import axios from 'axios';

const ThresholdSets = () => {
    const userName = localStorage.getItem("userName") || "User";
    const [thresholds, setThresholds] = useState({
        name: '',
        comments: '',
        sectionLoss: '0.1',
        reflectanceDegradation: '3',
        eventLoss: '0.1',
        injectionLevel: '2',
        linkTotalLoss: '1',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [hasExistingConfig, setHasExistingConfig] = useState(false);

    useEffect(() => {
        fetchThresholdSettings();
    }, []);

    const fetchThresholdSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/threshold-config', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data) {
                setThresholds(response.data);
                setHasExistingConfig(true);
            }
        } catch (error) {
            console.error('Error fetching threshold settings:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setThresholds({
            ...thresholds,
            [name]: value,
        });
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const method = hasExistingConfig ? 'put' : 'post';
            
            await axios[method]('http://localhost:5000/api/threshold-config', thresholds, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setIsEditing(false);
            setShowSuccess(true);
            setHasExistingConfig(true);
            setTimeout(() => setShowSuccess(false), 2000);
            fetchThresholdSettings();
        } catch (error) {
            console.error('Error saving threshold settings:', error);
            alert('Failed to save configuration');
        }
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const createInputField = (label, name, type = "text") => (
        <div className="threshold-form-group">
            <label className="threshold-form-label">{label}</label>
            <input
                className="threshold-form-input"
                type={type}
                name={name}
                value={thresholds[name] || ""}
                onChange={handleChange}
                readOnly={!isEditing}
            />
        </div>
    );

    const createTextAreaField = (label, name) => (
        <div className="threshold-form-group">
            <label className="threshold-form-label">{label}</label>
            <textarea
                className="threshold-form-input"
                name={name}
                value={thresholds[name] || ""}
                onChange={handleChange}
                rows="3"
                readOnly={!isEditing}
            />
        </div>
    );

    return (
        <div className="th-container">
            <div className="header">
                <header className="th-header">
                    <Link to="/Home" className="th-logo">FAST</Link>
                    <FaUser className="th-icon" />
                    <span>{userName}</span>
                    <h1 className="th-title">- Threshold Sets</h1>
                </header>

                <div className="th-header-spacer"></div>
                <Navbar />
            </div>
            <main className="th-main-content">
                <div className="threshold-form-wrapper">
                    <fieldset className="threshold-config-box">
                        <legend>Threshold Configuration</legend>
                        
                        {createInputField("Name:", "name")}
                        {createTextAreaField("Comments:", "comments")}
                        {createInputField("Section loss (dB):", "sectionLoss", "number")}
                        {createInputField("Event reflectance degradation (dB):", "reflectanceDegradation", "number")}
                        {createInputField("Event loss (dB):", "eventLoss", "number")}
                        {createInputField("Injection level (dB):", "injectionLevel", "number")}
                        {createInputField("Link total loss (dB):", "linkTotalLoss", "number")}

                        <div className="threshold-buttons">
                            {isEditing ? (
                                <button onClick={handleSave} className="threshold-save-button">Save</button>
                            ) : (
                                <button onClick={handleEdit} className="threshold-edit-button">Edit</button>
                            )}
                            {showSuccess && <p className="threshold-success-notice">Configuration saved successfully!</p>}
                        </div>
                    </fieldset>
                </div>
            </main>
        </div>
    );
};

export default ThresholdSets;