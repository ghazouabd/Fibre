import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AOS from "aos";
import "aos/dist/aos.css";
import "./index.css";

// Pages
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import DemoProduct from "./pages/DemoProduct";
import Portfolio from "./components/Portfolio";

// EMS Pages
import UserManagement from "./pages/EMS/UserManagement";
import Topology from "./pages/EMS/Topology";
import Configuration from "./pages/EMS/Configuration";
import Monitoring from "./pages/EMS/Monitoring";
import Reporting from "./pages/EMS/Reporting";

import LoginSignupForm from "./pages/LoginSignupForm";
import Users from "./pages/RTU/Users";
import ConfigurationRTU from "./pages/RTU/ConfigurationRTU";
import State from "./pages/RTU/State";

import { useDocTitle } from "./components/CustomHook";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  useEffect(() => {
    AOS.init({
      once: true,
      duration: 1000,
      easing: "ease-out-cubic",
    });
  }, []);

  useDocTitle("P2M");

  return (
    <Router>
      <ScrollToTop>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/get-demo" element={<DemoProduct />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/Loginsignup" element={<LoginSignupForm />} />

          {/* EMS Routes */}
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/topology" element={<Topology />} />
          <Route path="/configuration" element={<Configuration />} />
          <Route path="/monitoring" element={<Monitoring />} />
          
          <Route path="/reporting" element={<Reporting />} />
          <Route path="/users" element={<Users />} />
          <Route path="/configurationRTU" element={<ConfigurationRTU />} />
          <Route path="/stateRTU" element={<State />} />


        </Routes>
      </ScrollToTop>
    </Router>
  );
}

export default App;
