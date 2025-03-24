import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import "./Reporting.css";

const Reporting = () => {
  const [activeTab, setActiveTab] = useState("resultBrowser");

  return (
    <div className="container-ems">
      <Sidebar />
      <main className="content-main">
        {/* Filter Bar (Tabs) */}
        <div className="filter-bar">
          <button
            className={activeTab === "resultBrowser" ? "active" : ""}
            onClick={() => setActiveTab("resultBrowser")}
          >
            Result Browser
          </button>
          <button
            className={activeTab === "reports" ? "active" : ""}
            onClick={() => setActiveTab("reports")}
          >
            Reports
          </button>
          <button
            className={activeTab === "reportSchedule" ? "active" : ""}
            onClick={() => setActiveTab("reportSchedule")}
          >
            Report Schedule
          </button>
        </div>

        {/* Content Section */}
        <section className="section-info">
          <h2>{activeTab.replace(/^./, (str) => str.toUpperCase())}</h2>
          <div className="card-container">
            {activeTab === "resultBrowser" && (
              <>
                <div className="form-group">
                  <label>Filter by Result Location</label>
                  <input type="text" name="resultLocation" />
                </div>
                <div className="form-group">
                  <label>Filter by Time</label>
                  <input type="datetime-local" name="time" />
                </div>
                <div className="form-group">
                  <label>Filter by Category</label>
                  <select name="category">
                    <option value="error">Error</option>
                    <option value="warning">Warning</option>
                  </select>
                </div>
                <button className="edit-btn">Apply</button>
              </>
            )}

            {activeTab === "reports" && (
              <>
                <div className="form-group">
                  <label>Report Set Name</label>
                  <input type="text" name="reportSetName" />
                </div>
                <div className="form-group">
                  <label>Comments</label>
                  <textarea name="comments"></textarea>
                </div>
                <button className="edit-btn">Save</button>
              </>
            )}

            {activeTab === "reportSchedule" && (
              <>
                <div className="form-group">
                  <label>Report Schedule Name</label>
                  <input type="text" name="reportScheduleName" />
                </div>
                <div className="form-group">
                  <label>First Generation Time</label>
                  <input type="datetime-local" name="firstGenerationTime" />
                </div>
                <div className="form-group">
                  <label>Recurrence</label>
                  <select name="recurrence">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <button className="edit-btn">Save</button>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Reporting;