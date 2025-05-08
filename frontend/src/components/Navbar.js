import React, { useState,useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const [showConfigSubmenu, setShowConfigSubmenu] = useState(false);
  const [showStatusSubmenu, setShowStatusSubmenu] = useState(false);
  const [showReportingSubmenu, setShowReportingSubmenu] = useState(false);
  const [showManualSubmenu, setShowManualSubmenu] = useState(false);
  
  // Add notification count state
  
  const navItems = [
    { label: 'Configuration', hasDropdown: true },
    { label: 'Status', hasDropdown: true },
    { label: 'Reporting', hasDropdown: true },
    { label: 'Manual Test', hasDropdown: true },
    { label: 'Notifications', hasDropdown: true }
  ];
  
  const configSubItems = [
    { label: 'Remote Test Unit', path: '/configuration/Remote-Test-Unit' },
    { label: 'Network Setup', path: '/configuration/Network-Setup' },
    { label: 'Optical Routes', path: '/configuration/Optical-Routes' },
    { label: 'Users', path: '/configuration/users' },
    { label: 'EMS Server', path: '/configuration/EMS-Server' },
    { label: 'Threshold Sets', path: '/configuration/Threshold-Sets' },

  ];
  
  const statusSubItems = [
    { label: 'Current Faults', path: '/status/Current-Faults' },
  ];
  
  const reportingSubItems = [
    { label: 'Search', path: '/reporting/Search' },
  ];
  
  const manualSubItems = [
    { label: 'Ad Hoc Test', path: '/manual-test/ad-hoc-test' },
  ];
  

  const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  const fetchUnread = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/notifications');
      const unread = res.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Erreur récupération des notifications non lues", err);
    }
  };

  fetchUnread(); // appel initial

  const interval = setInterval(fetchUnread, 30000); // toutes les 30s
  return () => clearInterval(interval);
}, []);
  return (
    <div className="navbar-container">
      <nav className="navbar">
        {navItems.map((item, index) => {
          const isConfig = item.label === 'Configuration';
          const isStatus = item.label === 'Status';
          const isReporting = item.label === 'Reporting';
          const isManual = item.label === 'Manual Test';
          const isNotifications = item.label === 'Notifications';
          
          return (
            <div
              key={index}
              className={`nav-item-container ${item.hasDropdown ? 'has-dropdown' : ''}`}
              onMouseEnter={() => {
                if (isConfig) setShowConfigSubmenu(true);
                if (isStatus) setShowStatusSubmenu(true);
                if (isReporting) setShowReportingSubmenu(true);
                if (isManual) setShowManualSubmenu(true);
              }}
              onMouseLeave={() => {
                if (isConfig) setShowConfigSubmenu(false);
                if (isStatus) setShowStatusSubmenu(false);
                if (isReporting) setShowReportingSubmenu(false);
                if (isManual) setShowManualSubmenu(false);
              }}
            >
              {isNotifications ? (
  <Link
    to="/notifications/notifications"
    className={`nav-item ${location.pathname === '/notifications/notifications' ? 'active' : ''}`}
  >
    {item.label}
    {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
  </Link>
) : (
  <Link
    to="#"
    className={`nav-item ${location.pathname.startsWith(item.label.toLowerCase()) ? 'active' : ''}`}
  >
    {item.label}
    {item.hasDropdown && <span className="dropdown-arrow">▼</span>}
  </Link>
)}

             

              {/* Configuration submenu */}
              {isConfig && showConfigSubmenu && (
                <div className="submenu">
                  {configSubItems.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      to={subItem.path}
                      className={`submenu-item ${location.pathname === subItem.path ? 'active' : ''}`}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Status submenu */}
              {isStatus && showStatusSubmenu && (
                <div className="submenu">
                  {statusSubItems.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      to={subItem.path}
                      className={`submenu-item ${location.pathname === subItem.path ? 'active' : ''}`}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Reporting submenu */}
              {isReporting && showReportingSubmenu && (
                <div className="submenu">
                  {reportingSubItems.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      to={subItem.path}
                      className={`submenu-item ${location.pathname === subItem.path ? 'active' : ''}`}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
              
              {/* Manual Test submenu */}
              {isManual && showManualSubmenu && (
                <div className="submenu">
                  {manualSubItems.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      to={subItem.path}
                      className={`submenu-item ${location.pathname === subItem.path ? 'active' : ''}`}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
              
        
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default Navbar;