import React from "react";
import { FaUser , FaHome } from "react-icons/fa";
import { Link, useLocation,useNavigate  } from "react-router-dom";
;const styles = `
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
  .home-link {
  display: flex;
  align-items: center; /* Alignement vertical */
  gap: 8px; /* Espace entre l'icône et le texte */
  text-decoration: none; /* Supprime le soulignement */
  color: white; /* Ajuste la couleur du texte */
  font-size: 18px; /* Ajuste la taille du texte */
  margin-bottom:20px;
}

.home-icon {
  font-size: 40px; /* Augmente la taille de l'icône */
}

.home-text {
  font-weight: bold;
}

  .home-icon:hover {
    transform: scale(1.15); /* Légère augmentation au survol */
  }

`;

const Sidebar = () => {
  const location = useLocation(); // Pour détecter la page active
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "User";
  const handleLogout = () => {
    if (window.confirm("Voulez-vous vraiment vous déconnecter ?")) {
      localStorage.clear(); // Vide tout le localStorage
      navigate("/Loginsignup");
    }
  };
  return (
    <>
      <style>{styles}</style>
      <aside className="sidebar">

      <Link to="/" className="home-link">
  <FaHome className="home-icon" />
  <span className="home-text">Accueil</span>
</Link>

        <div className="user-section">
          <FaUser className="user-icon" />
          <span>{userName}</span>
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
           
          </ul>
        </nav>
        <div className="bottom-links">
          <span>Help</span>
          <span onClick={handleLogout}>Log out</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
