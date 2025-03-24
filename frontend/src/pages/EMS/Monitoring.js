import React, { useState } from "react";
import Sidebar from "../../components/Sidebar";
import {
  Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Paper,Select,MenuItem,TextField,Button,
} from "@mui/material";
import "./Monitoring.css";

const Monitoring = () => {
  const [data, setData] = useState([
    { id: 1, source: "OTH:1 P002/So...", type: "FiberFault", time: "2012-11-30 13:...", severity: "Medium", state: "Pending" },
    { id: 2, source: "OTH:1 P002/So...", type: "FiberFault", time: "2012-11-30 13:...", severity: "Medium", state: "Resolved" },
    { id: 3, source: "OTH:1 P001/So...", type: "FiberFault", time: "2012-11-30 13:...", severity: "High", state: "Resolved" }
  ]);

  // Fonction pour modifier un champ
  const handleChange = (id, field, value) => {
    setData(data.map(row => (row.id === id ? { ...row, [field]: value } : row)));
  };

  return (
    <div className="monitoring-container">
      <Sidebar />
      <div className="monitoring-content">
        <h1>Monitoring</h1>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow className="table-header">
                <TableCell>Primary Source</TableCell>
                <TableCell>Alarm Type</TableCell>
                <TableCell>Alarm Time</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>State</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  {/* Primary Source modifiable */}
                  <TableCell>
                    <TextField
                      value={row.source}
                      onChange={(e) => handleChange(row.id, "source", e.target.value)}
                    />
                  </TableCell>

                  {/* Alarm Type modifiable */}
                  <TableCell>
                    <TextField
                      value={row.type}
                      onChange={(e) => handleChange(row.id, "type", e.target.value)}
                    />
                  </TableCell>

                  {/* Alarm Time modifiable */}
                  <TableCell>
                    <TextField
                      type="datetime-local"
                      value={row.time}
                      onChange={(e) => handleChange(row.id, "time", e.target.value)}
                    />
                  </TableCell>

                  {/* Severity modifiable avec Select */}
                  <TableCell>
                    <Select
                      value={row.severity}
                      onChange={(e) => handleChange(row.id, "severity", e.target.value)}
                    >
                      <MenuItem value="Low">Low</MenuItem>
                      <MenuItem value="Medium">Medium</MenuItem>
                      <MenuItem value="High">High</MenuItem>
                    </Select>
                  </TableCell>

                  {/* State modifiable avec Select */}
                  <TableCell>
                    <Select
                      value={row.state}
                      onChange={(e) => handleChange(row.id, "state", e.target.value)}
                    >
                      <MenuItem value="Pending">Pending</MenuItem>
                      <MenuItem value="Resolved">Resolved</MenuItem>
                    </Select>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => alert(`Détails de l'alarme ${row.id}`)}>
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};

export default Monitoring;
