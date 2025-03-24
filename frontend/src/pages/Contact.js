import React, { useState } from 'react';
import NavBar from '../components/Navbar/NavBar';
import Footer from '../components/Footer';
import { useDocTitle } from '../components/CustomHook';
import axios from 'axios';
import Notiflix from 'notiflix';

const Contact = () => {
    useDocTitle('Fiber Optic Monitoring | Report Technical Issue');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [location, setLocation] = useState({ lat: null, lng: null });
    const [issueDescription, setIssueDescription] = useState('');
    const [severity, setSeverity] = useState('Low');
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const clearErrors = () => {
        setErrors([]);
    };

    const clearInput = () => {
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setAddress('');
        setLocation({ lat: null, lng: null });
        setIssueDescription('');
        setSeverity('Low');
        setFiles([]);
    };

    const handleFileUpload = (e) => {
        setFiles([...e.target.files]);
    };

    const handleLocationChange = (e) => {
        const { name, value } = e.target;
        setLocation((prev) => ({ ...prev, [name]: value }));
    };

    const submitIssue = (e) => {
        e.preventDefault();
        setLoading(true);
        document.getElementById('submitBtn').disabled = true;

        let fData = new FormData();
        fData.append('first_name', firstName);
        fData.append('last_name', lastName);
        fData.append('email', email);
        fData.append('phone_number', phone);
        fData.append('address', address);
        fData.append('latitude', location.lat);
        fData.append('longitude', location.lng);
        fData.append('issue_description', issueDescription);
        fData.append('severity', severity);
        files.forEach((file) => fData.append('files', file));

        axios({
            method: 'post',
            url: process.env.REACT_APP_ISSUE_REPORT_API,
            data: fData,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then(function (response) {
                setLoading(false);
                document.getElementById('submitBtn').disabled = false;
                clearInput();
                Notiflix.Report.success('Success', 'Issue reported successfully!', 'Okay');
            })
            .catch(function (error) {
                setLoading(false);
                document.getElementById('submitBtn').disabled = false;
                const { response } = error;
                if (response.status === 500) {
                    Notiflix.Report.failure('An error occurred', response.data.message, 'Okay');
                }
                if (response.data.errors !== null) {
                    setErrors(response.data.errors);
                }
            });
    };

    return (
        <>
            <div>
                <NavBar />
            </div>
            <div id="report-issue" className="flex justify-center items-center mt-8 w-full bg-white py-12 lg:py-24">
                <div className="container mx-auto my-8 px-4 lg:px-20" data-aos="zoom-in">
                    <form onSubmit={submitIssue}>
                        <div className="w-full bg-white p-8 my-4 md:px-12 lg:w-9/12 lg:pl-20 lg:pr-40 mr-auto rounded-2xl shadow-2xl">
                            <div className="flex">
                                <h1 className="font-bold text-center lg:text-left text-blue-900 uppercase text-4xl">
                                    Report a Technical Issue
                                </h1>
                            </div>
                            <p className="text-gray-600 mt-2">
                                Please provide details about the issue you are experiencing with the fiber optic network.
                            </p>
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 mt-5">
                                {/* User Information */}
                                <div>
                                    <input
                                        name="first_name"
                                        className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                                        type="text"
                                        placeholder="First Name*"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        onKeyUp={clearErrors}
                                    />
                                    {errors.first_name && (
                                        <p className="text-red-500 text-sm">{errors.first_name}</p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        name="last_name"
                                        className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                                        type="text"
                                        placeholder="Last Name*"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        onKeyUp={clearErrors}
                                    />
                                    {errors.last_name && (
                                        <p className="text-red-500 text-sm">{errors.last_name}</p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        name="email"
                                        className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                                        type="email"
                                        placeholder="Email*"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyUp={clearErrors}
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm">{errors.email}</p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        name="phone_number"
                                        className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                                        type="number"
                                        placeholder="Phone*"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        onKeyUp={clearErrors}
                                    />
                                    {errors.phone_number && (
                                        <p className="text-red-500 text-sm">{errors.phone_number}</p>
                                    )}
                                </div>
                                {/* Issue Details */}
                                <div>
                                    <input
                                        name="address"
                                        className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                                        type="text"
                                        placeholder="Address*"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        onKeyUp={clearErrors}
                                    />
                                    {errors.address && (
                                        <p className="text-red-500 text-sm">{errors.address}</p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        name="latitude"
                                        className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                                        type="text"
                                        placeholder="Latitude"
                                        value={location.lat || ''}
                                        onChange={handleLocationChange}
                                    />
                                </div>
                                <div>
                                    <input
                                        name="longitude"
                                        className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                                        type="text"
                                        placeholder="Longitude"
                                        value={location.lng || ''}
                                        onChange={handleLocationChange}
                                    />
                                </div>
                                <div>
                                    <select
                                        name="severity"
                                        className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                                        value={severity}
                                        onChange={(e) => setSeverity(e.target.value)}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <textarea
                                        name="issue_description"
                                        placeholder="Issue Description*"
                                        className="w-full h-32 bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                                        value={issueDescription}
                                        onChange={(e) => setIssueDescription(e.target.value)}
                                        onKeyUp={clearErrors}
                                    ></textarea>
                                    {errors.issue_description && (
                                        <p className="text-red-500 text-sm">{errors.issue_description}</p>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="file"
                                        name="files"
                                        multiple
                                        onChange={handleFileUpload}
                                        className="w-full bg-gray-100 text-gray-900 mt-2 p-3 rounded-lg focus:outline-none focus:shadow-outline"
                                    />
                                </div>
                            </div>
                            <div className="my-2 w-1/2 lg:w-2/4">
                                <button
                                    type="submit"
                                    id="submitBtn"
                                    className="uppercase text-sm font-bold tracking-wide bg-gray-500 hover:bg-blue-900 text-gray-100 p-3 rounded-lg w-full focus:outline-none focus:shadow-outline"
                                >
                                    {loading ? (
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        </div>
                                    ) : (
                                        'Submit Issue'
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Contact;