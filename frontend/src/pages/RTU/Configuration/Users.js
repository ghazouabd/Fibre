import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../../components/Navbar';
import './Users.css'; 
import { FaUser } from "react-icons/fa";

const Users = () => {
    const userName = localStorage.getItem("userName") || "User";
    const [isLoading, setIsLoading] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);

    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        login: '',
        password: '',
        confirmPassword: '',
        language: 'English',
        timezone: 'GMT',
        units: 'Metric',
        email: '',
        phone: '',
        trapAddress: '',
        httpUrl: '',
        userRights: 'View'
    });

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/client-info', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setClients(data.clients);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addClient = async () => {
        if (formData.password !== formData.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/client-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    confirmPassword: undefined // Ne pas envoyer ce champ
                })
            });
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message);
            }
            
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
            
            // Réinitialiser le formulaire et rafraîchir la liste
            setFormData({
                firstName: '',
                middleName: '',
                lastName: '',
                login: '',
                password: '',
                confirmPassword: '',
                language: 'English',
                timezone: 'GMT',
                units: 'Metric',
                email: '',
                phone: '',
                trapAddress: '',
                httpUrl: '',
                userRights: 'View'
            });
            
            fetchClients();
        } catch (error) {
            console.error('Error adding client:', error);
            alert('Failed to add client: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const deleteClient = async (clientId) => {
        if (!window.confirm('Are you sure you want to delete this client?')) {
            return;
        }

        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/client-info/${clientId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message);
            }
            
            setDeleteSuccess(true);
            setTimeout(() => setDeleteSuccess(false), 3000);
            
            fetchClients();
        } catch (error) {
            console.error('Error deleting client:', error);
            alert('Failed to delete client: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClientSelect = (client) => {
        setSelectedClient(client);
        setFormData({
            ...client,
            password: '',
            confirmPassword: ''
        });
    };

    useEffect(() => {
        fetchClients();
    }, []);

    return (
        <div className="users-container">
            <div className="header">
                <header className="users-header">
                    <Link to="/Home" className="users-logo">FAST</Link>
                    <FaUser className="users-icon" />
                    <span>{userName}</span>
                    <h1 className="users-title">- Usres</h1>
                </header>

                <div className="header-spacer"></div>
                <Navbar />
            </div>

            <main className="users-content">
                <h1 className="h11">Users Management</h1>

                {isLoading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                        <p>Loading...</p>
                    </div>
                )}

                <div className="form-wrapper">
                    <form className="user-form">
                        <div className="form-grid">
                            {[
                                { label: 'First Name', name: 'firstName', required: true },
                                { label: 'Middle Name', name: 'middleName' },
                                { label: 'Last Name', name: 'lastName', required: true },
                                { label: 'Login', name: 'login', required: true },
                                { label: 'Password', name: 'password', type: 'password', required: true },
                                { label: 'Confirm password', name: 'confirmPassword', type: 'password', required: true },
                                { label: 'E-mail address', name: 'email', required: true },
                                { label: 'Mobile phone number', name: 'phone', required: true },
                                { label: 'Trap Receiver Address', name: 'trapAddress' },
                                { label: 'HTTP Post URL', name: 'httpUrl' },
                            ].map(({ label, name, type = 'text', required = false }) => (
                                <div key={name} className="form-group">
                                    <label>
                                        {label}:
                                        {required && <span className="required">*</span>}
                                    </label>
                                    <input 
                                        type={type}
                                        name={name}
                                        value={formData[name]}
                                        onChange={handleChange}
                                        placeholder={label}
                                        required={required}
                                    />
                                </div>
                            ))}

                            {/* Les sélecteurs restent les mêmes */}
                            <div className="form-group">
                                <label>Language:</label>
                                <select 
                                    name="language" 
                                    value={formData.language} 
                                    onChange={handleChange}
                                >
                                    <option>English</option>
                                    <option>French</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Time zone:</label>
                                <select 
                                    name="timezone" 
                                    value={formData.timezone} 
                                    onChange={handleChange}
                                >
                                    <option>GMT</option>
                                    <option>UTC</option>
                                    <option>CET</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Units:</label>
                                <select 
                                    name="units" 
                                    value={formData.units} 
                                    onChange={handleChange}
                                >
                                    <option>Metric</option>
                                    <option>Imperial</option>
                                </select>
                            </div>

                            <div className="form-group horizontal-group">
                                <label>User Rights:</label>
                                <div className="radio-options">
                                    <label>
                                        <input 
                                            type="radio" 
                                            name="userRights" 
                                            value="View" 
                                            checked={formData.userRights === 'View'} 
                                            onChange={handleChange}
                                        /> View
                                    </label>
                                    <label>
                                        <input 
                                            type="radio" 
                                            name="userRights" 
                                            value="Edit" 
                                            checked={formData.userRights === 'Edit'} 
                                            onChange={handleChange}
                                        /> Edit
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="form-buttons">
                            <button 
                                type="button" 
                                onClick={addClient}
                                disabled={isLoading}
                            >
                                {isLoading ? "Processing..." : "Add User"}
                            </button>
                            {selectedClient && (
                                <button 
                                    type="button" 
                                    onClick={() => deleteClient(selectedClient._id)}
                                    disabled={isLoading}
                                    className="delete-button"
                                >
                                    {isLoading ? "Processing..." : "Delete"}
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Liste des clients existants */}
                <div className="clients-list">
                    <h2>Existing Users</h2>
                    {clients.length > 0 ? (
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Login</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Rights</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map(client => (
                                    <tr 
                                        key={client._id} 
                                        className={selectedClient?._id === client._id ? 'selected' : ''}
                                        onClick={() => handleClientSelect(client)}
                                    >
                                        <td>{client.firstName} {client.lastName}</td>
                                        <td>{client.login}</td>
                                        <td>{client.email}</td>
                                        <td>{client.phone}</td>
                                        <td>{client.userRights}</td>
                                        <td>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteClient(client._id);
                                                }}
                                                className="delete-button"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No users found. Add your first user above.</p>
                    )}
                </div>

                {saveSuccess && (
                    <div className="success-message">
                        User added successfully!
                    </div>
                )}
                {deleteSuccess && (
                    <div className="success-message">
                        User deleted successfully!
                    </div>
                )}
            </main>
        </div>
    );
};

export default Users;