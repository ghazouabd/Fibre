import React from "react";
import { FaSearch, FaUser, FaCog, FaSun, FaRegCalendar } from "react-icons/fa";
import "styled-components";
import Sidebar from "../../components/Sidebar";
import "../EMS/Usermanagement.css";

const UserManagement = () => {
  return (
    <div className="container-ems">
      <Sidebar/>
      <main className="content-main">
        <header className="header-bar">
          <div className="search-box">
            <input type="text" placeholder="Search..." />
            <FaSearch className="icon-search" />
          </div>
          <div className="icon-group">
            <FaSun />
            <FaRegCalendar />
            <FaCog />
          </div>
        </header>
        <section className="section-info">
          <h2>User Information</h2>
          <div className="card-container">
            <div className="info-card"></div>
            <div className="info-card"></div>
          </div>
        </section>
      </main>
    </div>
  );
};





export default UserManagement;
