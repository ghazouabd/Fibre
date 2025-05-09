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



import LoginSignupForm from "./pages/LoginSignupForm";

import { useDocTitle } from "./components/CustomHook";
import ScrollToTop from "./components/ScrollToTop";
import Onboard from "./pages/RTU/Onboard";
import RemoteTestUnit from "./pages/RTU/Configuration/RemoteTestUnit";
import NetworkSetup from "./pages/RTU/Configuration/NetworkSetup";
import OpticalRoutes from "./pages/RTU/Configuration/OpticalRoutes";
import Users from "./pages/RTU/Configuration/Users"
import EMSServer from "./pages/RTU/Configuration/EMSServer";
import ThresholdSets from "./pages/RTU/Configuration/ThresholdSets";
import CurrentFaults from "./pages/RTU/Status/CurrentFaults";
import Search from "./pages/RTU/Reporting/Search";
import AdHocTest from "./pages/RTU/ManualTest/AdHocTest";
import Notifications from "./pages/RTU/Notifications/Notifications";

function App() {
  useEffect(() => {
    AOS.init({
      once: true,
      duration: 1000,
      easing: "ease-out-cubic",
    });
  }, []);

  useDocTitle("OptiTrack");

  return (
    <Router>
      <ScrollToTop>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginSignupForm />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/get-demo" element={<DemoProduct />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/Loginsignup" element={<LoginSignupForm />} />
          <Route path="/Home" element={<Home />} />

          {/* RTU Routes */}
          
          

          <Route path="/Onboard" element={<Onboard />} />
          <Route path="/configuration/Remote-Test-Unit" element={<RemoteTestUnit />} />
          <Route path="/configuration/Network-Setup" element={<NetworkSetup />} />
          <Route path="/configuration/Optical-Routes" element={<OpticalRoutes />} />
          <Route path="/configuration/users" element={<Users />} />
          <Route path="/configuration/EMS-Server" element={< EMSServer/>} />
          <Route path="/configuration/Threshold-Sets" element={< ThresholdSets/>} />
          <Route path="/status/Current-Faults" element={< CurrentFaults/>} />
          <Route path="/reporting/Search" element={< Search/>} />
          <Route path="/manual-test/ad-hoc-test" element={< AdHocTest/>} />
          <Route path="/notifications/notifications" element={< Notifications/>} />



        </Routes>
      </ScrollToTop>
    </Router>
  );
}

export default App;
