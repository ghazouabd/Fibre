import React from "react";


const Ems = () => {
  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Fanalyzer</h2>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">Dashboard</a>
          <a href="#" className="nav-item">Markets</a>
          <a href="#" className="nav-item">Analytics</a>
          <a href="#" className="nav-item">Wallet</a>
          <a href="#" className="nav-item">Mail Box</a>
          <a href="#" className="nav-item">Transfers</a>
        </nav>
      </aside>
      
      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h1 className="header-title">User Management</h1>
          <input type="text" placeholder="Search..." className="search-box" />
        </header>

        {/* User Management Section */}
        <div className="user-management">
          <h2 className="section-title">User Details</h2>
          <div className="user-grid">
            <div>
              <label className="label">Login ID</label>
              <input className="input" value="root" readOnly />
            </div>
            <div>
              <label className="label">User Type</label>
              <input className="input" value="Regular User" readOnly />
            </div>
            <div>
              <label className="label">First Name</label>
              <input className="input" value="root" readOnly />
            </div>
            <div>
              <label className="label">Time Zone</label>
              <input className="input" value="GMT" readOnly />
            </div>
            <div>
              <label className="label">Middle Name</label>
              <input className="input" value="root" readOnly />
            </div>
            <div>
              <label className="label">Language</label>
              <input className="input" value="EN" readOnly />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Ems;

/* CSS (dashboard.css) */

.Ems-container {
  display: flex;
  height: 100vh;
  background-color: #1a1a2e;
  color: white;
}

.sidebar {
  width: 250px;
  background-color: #16213e;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.sidebar-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
}

.nav-item {
  padding: 10px;
  margin: 5px 0;
  border-radius: 5px;
  text-decoration: none;
  color: white;
  transition: background 0.3s;
}

.nav-item:hover, .nav-item.active {
  background-color: #0f3460;
}

.main-content {
  flex: 1;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-title {
  font-size: 28px;
  font-weight: bold;
}

.search-box {
  padding: 10px;
  border-radius: 5px;
  background-color: #0f3460;
  color: white;
  border: none;
}

.user-management {
  background-color: #0f3460;
  padding: 20px;
  border-radius: 10px;
}

.section-title {
  font-size: 20px;
  margin-bottom: 15px;
}

.user-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.label {
  font-size: 14px;
  margin-bottom: 5px;
  display: block;
}

.input {
  width: 100%;
  padding: 8px;
  border-radius: 5px;
  border: none;
  background-color: #1a1a2e;
  color: white;
}
