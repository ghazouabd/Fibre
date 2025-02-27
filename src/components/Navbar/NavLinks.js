import React from 'react';
import { HashLink } from 'react-router-hash-link';

const NavLinks = () => {
    return (
        <>
          
            
            <HashLink className="px-4 font-extrabold text-gray-500 hover:text-blue-900" smooth to="/#rtu-management">
                RTU Management
            </HashLink>
            <HashLink className="px-4 font-extrabold text-gray-500 hover:text-blue-900" smooth to="/user-management">
                EMS Management
            </HashLink>
            
            <HashLink className="text-white bg-blue-900 hover:bg-blue-800 inline-flex items-center justify-center w-auto px-6 py-3 shadow-xl rounded-xl" smooth to="/Loginsignup">
                LOGIN
            </HashLink>
        </>
    );
};

export default NavLinks;

