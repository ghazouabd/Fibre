import React from "react";
import { FaUser } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const styles = `
  .sidebar {
    width: 250px;
    height: 100vh;
    padding: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    color: #fff;
    background: linear-gradient(to left, rgb(43, 70, 145), rgb(13, 38, 105)); /* Dégradé de bleu */
  }
  .user-section {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 18px;
    margin-bottom: 20px;
  }
  .menu ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .menu li {
    padding: 10px;
    cursor: pointer;
    transition: background 0.3s;
    border-radius: 20px;
    margin-bottom: 5px;
    text-align: center;
  }
  .menu li a {
    text-decoration: none;
    color: white;
    display: block;
  }
  .menu li:hover {
    background: rgb(121, 152, 207);
  }
  .menu .active {
    background: rgb(101, 141, 210);
    font-weight: bold;
  }
  .bottom-links {
    margin-top: auto;
    padding-top: 20px;
    border-top: 1px solid #4a5568;
  }
  .bottom-links span {
    display: block;
    padding: 10px;
    cursor: pointer;
    transition: background 0.3s;
    border-radius: 5px;
    text-align: center;
  }
  .bottom-links span:hover {
    background: #4a5568;
  }
`;

const Sidebar = () => {
  const location = useLocation(); // Pour détecter la page active

  return (
    <>
      <style>{styles}</style>
      <aside className="sidebar">
        <div className="user-section">
          <FaUser className="user-icon" />
          <span>User</span>
        </div>
        <nav className="menu">
          <ul>
            <li className={location.pathname === "/user-management" ? "active" : ""}>
              <Link to="/user-management">User Management</Link>
            </li>
            <li className={location.pathname === "/topology" ? "active" : ""}>
              <Link to="/topology">Topology</Link>
            </li>
            <li className={location.pathname === "/configuration" ? "active" : ""}>
              <Link to="/configuration">Configuration</Link>
            </li>
            <li className={location.pathname === "/monitoring" ? "active" : ""}>
              <Link to="/monitoring">Monitoring</Link>
            </li>
            <li className={location.pathname === "/reporting" ? "active" : ""}>
              <Link to="/reporting">Reporting</Link>
            </li>
            <li className={location.pathname === "/workstation" ? "active" : ""}>
              <Link to="/workstation">WorkStationAgent</Link>
            </li>
          </ul>
        </nav>
        <div className="bottom-links">
          <span>Help</span>
          <span>Log out</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
