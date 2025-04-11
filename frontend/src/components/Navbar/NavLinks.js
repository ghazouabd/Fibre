import React from 'react';
import { HashLink } from 'react-router-hash-link';
import { useNavigate } from 'react-router-dom';

const NavLinks = () => {
    const navigate = useNavigate();
    
    const handleLogout = () => {
        if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
            localStorage.clear(); // Vide tout le localStorage
            navigate("/Loginsignup");
        }
    };

    // Vérifie si l'utilisateur est connecté
    const isLoggedIn = localStorage.getItem('token');

    return (
        <>
            <HashLink className="px-4 font-extrabold text-gray-500 hover:text-blue-900" smooth to="/Onboard">
                RTU Management
            </HashLink>

            {isLoggedIn && (
                <button 
                    onClick={handleLogout}
                    className="text-white bg-blue-900 hover:bg-blue-800 inline-flex items-center justify-center w-auto px-6 py-3 shadow-xl rounded-xl"
                >
                    LOG OUT
                </button>
            )}
        </>
    );
};

export default NavLinks;
