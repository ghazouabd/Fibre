import sys
import numpy as np
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
import datetime
from PyQt5.QtWidgets import (QApplication, QMainWindow, QVBoxLayout, QWidget,
                            QLabel, QPushButton, QFileDialog, QMessageBox,
                            QInputDialog, QHBoxLayout, QTableWidget, QTableWidgetItem)
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.backends.backend_qt5agg import NavigationToolbar2QT as NavigationToolbar
from matplotlib.figure import Figure
from matplotlib import ticker
import os
import copy
import struct
from pySorReader import sorReader
from matplotlib.backends.backend_pdf import PdfPages
import requests


class FiberAnalyzer(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("OTDR Trace Analyzer")
        self.setGeometry(100, 100, 1200, 1000)
        self.distance = None
        self.amplitude = None
        self.reference_curve = None
        self.original_amplitude = None
        self.sor_data = None
        self.modified_events = None
        self.thresholds = {
            'Sensitive': 0.05,
            'Normal': 0.1,
            'Coarse': 0.5,
            'Break': 4.0
        }
        self.alarms = []
        self.zoom_mode = False
        self.last_adjusted_index = None
        
        # Email configuration
        self.email_config = {
            'enabled': True,
            'smtp_server': 'smtp.gmail.com',
            'smtp_port': 587,
            'smtp_username': '#insert your mail##',  
            'smtp_password': '##insert your app password ##',  
            'recipients': ['mail1','mail2','mail3'],
            'sender_name': 'OTDR Fault Detection System'
        }

        self.main_widget = QWidget()
        self.setCentralWidget(self.main_widget)
        self.layout = QVBoxLayout(self.main_widget)

        self.file_label = QLabel("No file loaded")
        self.load_button = QPushButton("Load OTDR File (.sor)")
        self.load_button.clicked.connect(self.load_file)
        self.reset_curve_button = QPushButton("Reset Curve")
        self.reset_curve_button.clicked.connect(self.reset_curve)
        self.reset_curve_button.setEnabled(False)
        self.save_button = QPushButton("Save as PDF")
        self.save_button.clicked.connect(self.save_as_pdf)
        self.save_button.setEnabled(False)
        self.save_sor_button = QPushButton("Save Dual-Curve SOR")
        self.save_sor_button.clicked.connect(self.save_dual_curve_sor)
        self.save_sor_button.setEnabled(False)
        
        # Add test email button
        self.test_email_button = QPushButton("Test Email")
        self.test_email_button.clicked.connect(self.test_email)

        button_layout = QHBoxLayout()
        button_layout.addWidget(self.load_button)
        button_layout.addWidget(self.reset_curve_button)
        button_layout.addWidget(self.save_button)
        button_layout.addWidget(self.save_sor_button)
        button_layout.addWidget(self.test_email_button)

        self.figure = Figure(figsize=(10, 5), dpi=100)
        self.canvas = FigureCanvas(self.figure)
        self.ax = self.figure.add_subplot(111)
        self.ax.set_xlabel("Distance (km)")
        self.ax.set_ylabel("Amplitude (dB)")
        self.ax.set_title("OTDR Measurement Trace")
        self.ax.grid(True, linestyle='--', alpha=0.5)

        self.toolbar = NavigationToolbar(self.canvas, self)

        self.event_table = QTableWidget()
        self.event_table.setColumnCount(20)
        self.event_table.setHorizontalHeaderLabels([
            'Event', 'Type', 'Pos (km)', 'Len (km)', 'Level (dB)', 'Loss (dB)', 'Attn (dB/km)',
            'Refl (dB)', 'Peak (dB)', 'Cum Loss (dB)',
            'Mod Type', 'Mod Pos (km)', 'Mod Len (km)', 'Mod Level (dB)', 'Mod Loss (dB)',
            'Mod Attn (dB/km)', 'Mod Refl (dB)', 'Mod Peak (dB)', 'Mod Cum Loss (dB)', 'Delta (dB)'
        ])
        self.event_table.setStyleSheet("font-size: 9pt;")
        self.event_table.horizontalHeader().setStretchLastSection(True)
        
        # Set initial column widths
        for i, width in enumerate([50, 100, 80, 80, 80, 80, 100, 100, 100, 100,
                                  100, 80, 80, 80, 80, 100, 100, 100, 100, 80]):
            self.event_table.setColumnWidth(i, width)

        self.layout.addWidget(self.file_label)
        self.layout.addLayout(button_layout)
        self.layout.addWidget(self.toolbar)
        self.layout.addWidget(self.canvas)
        self.layout.addWidget(QLabel("Event Table (Original vs Modified):"))
        self.layout.addWidget(self.event_table)

        self.canvas.mpl_connect('button_press_event', self.on_click)
        self.canvas.mpl_connect('scroll_event', self.on_scroll)
        self.canvas.mpl_connect('draw_event', self.on_draw)

    def test_email(self):
        """Test sending an email directly from the application"""
        print("\n=== TESTING EMAIL NOTIFICATION ===")
        
        # Create sample alarm data
        test_alarm = {
            "eventType": "TEST_NOTIFICATION",
            "severity": "Normal",
            "location": "5.00 km",
            "amplitude": -25.5,
            "deviation": 0.75,
            "threshold": 0.1,
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "file": "test_file.sor"
        }
        
        # Call the notification function
        result = self.send_email_notification(test_alarm)
        
        if result:
            QMessageBox.information(self, "Email Test", "Test email sent successfully!")
        else:
            QMessageBox.warning(self, "Email Test", "Failed to send test email. Check the console for details.")

    def reset_curve(self):
        if self.original_amplitude is not None:
            self.amplitude = self.original_amplitude.copy()
            self.modified_events = copy.deepcopy(self.sor_data.jsonoutput['events'])
            self.last_adjusted_index = None
            self.plot_data()
            self.update_event_table()
            QMessageBox.information(self, "Reset", "Curve reset to original values")

    def load_file(self):
        options = QFileDialog.Options()
        file_name, _ = QFileDialog.getOpenFileName(
            self, "Open OTDR File", "", "OTDR Files (*.sor);;All Files (*)",
            options=options)
        if file_name:
            try:
                self.sor_data = sorReader(file_name)
                self.distance = np.array([d[0] for d in self.sor_data.dataset]) / 1000
                self.amplitude = np.array([d[1] for d in self.sor_data.dataset])
                self.original_amplitude = self.amplitude.copy()
                self.reference_curve = self.original_amplitude.copy()
                self.modified_events = copy.deepcopy(self.sor_data.jsonoutput['events'])
                self.last_adjusted_index = None
                self.file_label.setText(f"Loaded: {os.path.basename(file_name)}")
                self.reset_curve_button.setEnabled(True)
                self.save_button.setEnabled(True)
                self.save_sor_button.setEnabled(True)
                self.plot_data()
                self.update_event_table()
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Could not load file: {str(e)}")

    def plot_data(self):
        self.ax.clear()
        self.alarms = []
        if self.distance is None or self.amplitude is None:
            return
            
        # Plot the original curve
        self.ax.plot(self.distance, self.amplitude, 'b-',
                   label='Current Trace', linewidth=1.2, alpha=0.9)
                   
        # Plot the adjusted portion in red if there is one
        if self.last_adjusted_index is not None:
            self.ax.plot(self.distance[self.last_adjusted_index:],
                       self.amplitude[self.last_adjusted_index:],
                       'r-', linewidth=1.5, alpha=0.9,
                       label='Adjusted Portion')
                       
        if self.reference_curve is not None:
            self.ax.plot(self.distance, self.reference_curve, 'g--',
                       label='Reference Trace', linewidth=0.8, alpha=0.7)
                       
        # Add event markers if we have events
        if self.sor_data is not None and hasattr(self.sor_data, 'jsonoutput') and 'events' in self.sor_data.jsonoutput:
            events = self.sor_data.jsonoutput['events']
            for ev_num, ev_data in events.items():
                pos_km = ev_data['eventPoint_m'] / 1000
                loc = self.sor_data.return_index(self.sor_data.dataset, ev_data['eventPoint_m'])
                if loc is not None:
                    self.ax.plot(pos_km, loc, 'ro', markersize=5)
                    # Add event number text
                    self.ax.text(pos_km, loc, str(ev_num),
                               color='black', fontsize=8,
                               bbox=dict(facecolor='white', alpha=0.7, edgecolor='none'))
                               
        colors = {'Sensitive': 'limegreen', 'Normal': 'orange',
                 'Coarse': 'red', 'Break': 'black'}
                 
        for name, value in self.thresholds.items():
            self.ax.axhline(y=-value, color=colors[name], linestyle=':',
                          linewidth=1.0, alpha=0.7,
                          label=f'{name} Threshold ({value} dB)')
                          
        self._set_axis_limits()
        self.ax.legend(loc='upper right', fontsize=9)
        self.ax.xaxis.set_major_locator(ticker.MaxNLocator(10))
        self.ax.yaxis.set_major_locator(ticker.MaxNLocator(10))
        self.canvas.draw()
        self.analyze_alarms()

    def _set_axis_limits(self):
        x_min = 0
        x_max = max(self.distance) * 1.02
        self.ax.set_xlim(x_min, x_max)
        y_min = min(np.min(self.amplitude),
                   np.min(self.reference_curve) if self.reference_curve is not None else np.min(self.amplitude))
        y_max = max(np.max(self.amplitude),
                   np.max(self.reference_curve) if self.reference_curve is not None else np.max(self.amplitude))
        y_padding = max(2.0, (y_max - y_min) * 0.2)
        self.ax.set_ylim(y_min - y_padding, y_max + y_padding)

    def analyze_alarms(self):
        if self.amplitude is None or self.reference_curve is None:
            return
        diff = self.amplitude - self.reference_curve
        for i, (dist, amp, d) in enumerate(zip(self.distance, self.amplitude, diff)):
            if d < -self.thresholds['Break']:
                self.alarms.append(('Break', dist, -d))
            elif d < -self.thresholds['Coarse']:
                self.alarms.append(('Coarse', dist, -d))
            elif d < -self.thresholds['Normal']:
                self.alarms.append(('Normal', dist, -d))
            elif d < -self.thresholds['Sensitive']:
                self.alarms.append(('Sensitive', dist, -d))

    def update_event_table(self):
        if self.sor_data is None or not hasattr(self.sor_data, 'jsonoutput') or 'events' not in self.sor_data.jsonoutput:
            return
        events = self.sor_data.jsonoutput['events']
        modified_events = self.modified_events if self.modified_events is not None else events
        
        # Sort events by their position
        sorted_events = sorted(events.items(), key=lambda x: x[1]['eventPoint_m'])
        sorted_mod_events = sorted(modified_events.items(), key=lambda x: x[1]['eventPoint_m']) if self.modified_events else sorted_events
        
        self.event_table.setRowCount(len(sorted_events))
        cumulative_loss = 0
        mod_cumulative_loss = 0
        
        for row, ((ev_num, ev_data), (mod_ev_num, mod_ev_data)) in enumerate(zip(sorted_events, sorted_mod_events), start=1):
            # Original event data
            pos_km = ev_data['eventPoint_m'] / 1000
            loc = self.sor_data.return_index(self.sor_data.dataset, ev_data['eventPoint_m'])
            
            # Modified event data
            mod_pos_km = mod_ev_data['eventPoint_m'] / 1000
            mod_loc = None
            if loc is not None:
                if self.last_adjusted_index is not None and pos_km >= self.distance[self.last_adjusted_index]:
                    mod_loc = loc + (self.amplitude[self.last_adjusted_index] - self.original_amplitude[self.last_adjusted_index])
                else:
                    mod_loc = loc
                    
            # Fill original data columns
            self.event_table.setItem(row-1, 0, QTableWidgetItem(f"{row}.0"))
            self.event_table.setItem(row-1, 1, QTableWidgetItem(ev_data['eventType']))
            self.event_table.setItem(row-1, 2, QTableWidgetItem(f"{pos_km:.4f}"))
            
            # Calculate length between events for original
            length = "-"
            if row > 1:
                prev_pos = sorted_events[row-2][1]['eventPoint_m'] / 1000
                length = f"{pos_km - prev_pos:.4f}"
            self.event_table.setItem(row-1, 3, QTableWidgetItem(length))
            self.event_table.setItem(row-1, 4, QTableWidgetItem(f"{loc:.3f}" if loc is not None else "-"))
            
            # Handle splice loss and cumulative loss for original
            splice_loss = ev_data['spliceLoss_dB']
            if splice_loss != 0:
                cumulative_loss += splice_loss
                self.event_table.setItem(row-1, 5, QTableWidgetItem(f"{splice_loss:.3f}"))
            else:
                self.event_table.setItem(row-1, 5, QTableWidgetItem("-"))
                
            # Calculate attenuation if possible for original
            attenuation = "-"
            if row > 1 and length != "-" and float(length) > 0 and splice_loss != 0:
                attenuation = f"{splice_loss / float(length):.3f}"
            self.event_table.setItem(row-1, 6, QTableWidgetItem(attenuation))
            
            # Handle reflection data for original
            refl_loss = ev_data['reflectionLoss_dB']
            self.event_table.setItem(row-1, 7, QTableWidgetItem(f"{refl_loss:.2f}" if refl_loss != 0 else "-"))
            
            # Calculate reflective peak if significant for original
            reflective_peak = "-"
            if refl_loss < -40:
                reflective_peak = f"{abs(refl_loss):.2f}"
            self.event_table.setItem(row-1, 8, QTableWidgetItem(reflective_peak))
            self.event_table.setItem(row-1, 9, QTableWidgetItem(f"{cumulative_loss:.3f}"))
            
            # Fill modified data columns
            self.event_table.setItem(row-1, 10, QTableWidgetItem(mod_ev_data['eventType']))
            self.event_table.setItem(row-1, 11, QTableWidgetItem(f"{mod_pos_km:.4f}"))
            
            # Calculate length between events for modified
            mod_length = "-"
            if row > 1:
                prev_mod_pos = sorted_mod_events[row-2][1]['eventPoint_m'] / 1000
                mod_length = f"{mod_pos_km - prev_mod_pos:.4f}"
            self.event_table.setItem(row-1, 12, QTableWidgetItem(mod_length))
            self.event_table.setItem(row-1, 13, QTableWidgetItem(f"{mod_loc:.3f}" if mod_loc is not None else "-"))
            
            # Handle splice loss and cumulative loss for modified
            mod_splice_loss = mod_ev_data['spliceLoss_dB']
            if mod_splice_loss != 0:
                mod_cumulative_loss += mod_splice_loss
                self.event_table.setItem(row-1, 14, QTableWidgetItem(f"{mod_splice_loss:.3f}"))
            else:
                self.event_table.setItem(row-1, 14, QTableWidgetItem("-"))
                
            # Calculate attenuation if possible for modified
            mod_attenuation = "-"
            if row > 1 and mod_length != "-" and float(mod_length) > 0 and mod_splice_loss != 0:
                mod_attenuation = f"{mod_splice_loss / float(mod_length):.3f}"
            self.event_table.setItem(row-1, 15, QTableWidgetItem(mod_attenuation))
            
            # Handle reflection data for modified
            mod_refl_loss = mod_ev_data['reflectionLoss_dB']
            self.event_table.setItem(row-1, 16, QTableWidgetItem(f"{mod_refl_loss:.2f}" if mod_refl_loss != 0 else "-"))
            
            # Calculate reflective peak if significant for modified
            mod_reflective_peak = "-"
            if mod_refl_loss < -40:
                mod_reflective_peak = f"{abs(mod_refl_loss):.2f}"
            self.event_table.setItem(row-1, 17, QTableWidgetItem(mod_reflective_peak))
            self.event_table.setItem(row-1, 18, QTableWidgetItem(f"{mod_cumulative_loss:.3f}"))
            
            # Calculate delta between original and modified
            delta = mod_splice_loss - splice_loss if splice_loss != 0 and mod_splice_loss != 0 else 0
            self.event_table.setItem(row-1, 19, QTableWidgetItem(f"{delta:.3f}" if delta != 0 else "-"))
            
        self.event_table.resizeColumnsToContents()

    def send_email_notification(self, alarm_data, pdf_path=None):
        """Send email notification about detected faults"""
        if not self.email_config['enabled']:
            print("Email notifications are disabled")
            return False

        try:
            print(f"\n--- SENDING EMAIL NOTIFICATION ({alarm_data['severity']}) ---")
            
            # Define severity colors
            severity_colors = {
                'Sensitive': '#5cb85c',  # Green
                'Sensible': '#5cb85c',   # Green
                'Normal': '#f0ad4e',     # Yellow
                'Coarse': '#d9534f',     # Red
                'Grossier': '#d9534f',   # Red
                'Break': '#292b2c',      # Black
                'Rupture': '#292b2c'     # Black
            }
            severity_color = severity_colors.get(alarm_data['severity'], '#007bff')  # Default to blue
            
            # Create basic email with multipart
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"ALERTE: Détection de défaut fibre optique - {alarm_data['severity']}"
            msg['From'] = self.email_config['smtp_username']
            msg['To'] = ', '.join(self.email_config['recipients'])
            
            # Plain text version
            plain_text = f"""
ALERTE: Détection de défaut fibre optique

Un défaut a été détecté à la position {alarm_data['location']} avec une déviation de {alarm_data['deviation']:.2f} dB.

Détails:
- Type: {alarm_data['eventType']}
- Sévérité: {alarm_data['severity']}
- Position: {alarm_data['location']}
- Amplitude: {alarm_data['amplitude']:.2f} dB
- Déviation: {alarm_data['deviation']:.2f} dB
- Seuil: {alarm_data['threshold']:.2f} dB
- Date/Heure: {alarm_data['timestamp']}
- Fichier: {alarm_data['file']}

Veuillez prendre les mesures nécessaires.
"""
            msg.attach(MIMEText(plain_text, 'plain'))
            
            # HTML version
            html_text = f"""
<html>
<body>
    <h2 style="color: {severity_color};">ALERTE: Détection de défaut fibre optique - {alarm_data['severity']}</h2>
    <p>Un défaut a été détecté à la position <strong>{alarm_data['location']}</strong> avec une déviation de <strong>{alarm_data['deviation']:.2f} dB</strong>.</p>
    
    <h3>Détails:</h3>
    <table border="1" cellpadding="5" cellspacing="0">
        <tr><td><strong>Type:</strong></td><td>{alarm_data['eventType']}</td></tr>
        <tr><td><strong>Sévérité:</strong></td><td style="color: {severity_color}; font-weight: bold;">{alarm_data['severity']}</td></tr>
        <tr><td><strong>Position:</strong></td><td>{alarm_data['location']}</td></tr>
        <tr><td><strong>Amplitude:</strong></td><td>{alarm_data['amplitude']:.2f} dB</td></tr>
        <tr><td><strong>Déviation:</strong></td><td>{alarm_data['deviation']:.2f} dB</td></tr>
        <tr><td><strong>Seuil:</strong></td><td>{alarm_data['threshold']:.2f} dB</td></tr>
        <tr><td><strong>Date/Heure:</strong></td><td>{alarm_data['timestamp']}</td></tr>
        <tr><td><strong>Fichier:</strong></td><td>{alarm_data['file']}</td></tr>
    </table>
    
    <p>Veuillez prendre les mesures nécessaires.</p>
    
    <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p>Ce message a été généré automatiquement par le système de surveillance OTDR. Veuillez ne pas répondre à cet email.</p>
    </div>
</body>
</html>
"""
            msg.attach(MIMEText(html_text, 'html'))
            
            # Attach the PDF if provided
            if pdf_path and os.path.exists(pdf_path):
                print(f"Attaching PDF: {pdf_path}")
                try:
                    with open(pdf_path, 'rb') as file:
                        pdf_attachment = MIMEApplication(file.read(), _subtype='pdf')
                        pdf_attachment.add_header('Content-Disposition', 'attachment',
                                               filename=os.path.basename(pdf_path))
                        msg.attach(pdf_attachment)
                    print("PDF attached successfully")
                except Exception as pdf_error:
                    print(f"Error attaching PDF: {pdf_error}")
            else:
                print(f"No PDF to attach or PDF not found: {pdf_path}")
            
            # Connect and send
            print("Connecting to SMTP server...")
            with smtplib.SMTP(self.email_config['smtp_server'], self.email_config['smtp_port']) as server:
                print("Starting TLS...")
                server.ehlo()
                server.starttls()
                server.ehlo()
                
                print(f"Logging in...")
                server.login(self.email_config['smtp_username'], self.email_config['smtp_password'])
                
                print("Sending email...")
                server.send_message(msg)
                print("Message sent!")
                
            print(f"Email notification sent to: {', '.join(self.email_config['recipients'])}")
            return True
            
        except Exception as e:
            print(f"Failed to send email notification: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return False

    def on_click(self, event):
        """Handle point modification - shift all points to the right downward by same amount"""
        if (event.inaxes != self.ax or self.distance is None or
            event.button != 1 or self.toolbar.mode != ''):
            return
            
        x_data = self.distance
        y_data = self.amplitude
        click_x = event.xdata
        click_y = event.ydata
        
        # Find the nearest point on the curve
        distances = np.sqrt((x_data - click_x)**2 + (y_data - click_y)**2)
        min_dist_idx = np.argmin(distances)
        min_dist = distances[min_dist_idx]
        
        # If click is too far from the curve, ignore it
        if min_dist > 0.1 and abs(y_data[min_dist_idx] - click_y) > 1.0:
            return
            
        current_dist = x_data[min_dist_idx]
        current_amp = y_data[min_dist_idx]
        
        # Get the adjustment value from user
        adjustment, ok = QInputDialog.getDouble(
            self, "Adjust Subsequent Points",
            f"Current: {current_amp:.2f} dB at {current_dist:.2f} km\n"
            "Adjust all points to the right by (negative to decrease):",
            value=0.0, decimals=2, min=-10, max=10)
            
        if ok:
            # Apply the adjustment to all points to the right of the clicked point
            self.amplitude[min_dist_idx:] += adjustment
            self.last_adjusted_index = min_dist_idx
            
            # Adjust event points that are to the right of the clicked point
            if self.sor_data is not None and hasattr(self.sor_data, 'jsonoutput') and 'events' in self.sor_data.jsonoutput:
                events = self.sor_data.jsonoutput['events']
                for ev_num, ev_data in events.items():
                    pos_m = ev_data['eventPoint_m']
                    pos_km = pos_m / 1000
                    if pos_km >= current_dist:
                        # Find the index in the dataset for this event
                        for i, (dist_m, _) in enumerate(self.sor_data.dataset):
                            if dist_m == pos_m:
                                # Adjust the corresponding amplitude value
                                if i >= min_dist_idx:
                                    self.sor_data.dataset[i] = (dist_m, self.sor_data.dataset[i][1] + adjustment)
                                break
                        # Also adjust the modified_events copy
                        if ev_num in self.modified_events:
                            self.modified_events[ev_num]['spliceLoss_dB'] += adjustment
                            
            self.plot_data()
            self.update_event_table()
            
            # Check thresholds at the modified point
            if self.reference_curve is not None:
                diff = self.amplitude[min_dist_idx] - self.reference_curve[min_dist_idx]
                for name, value in sorted(self.thresholds.items(), key=lambda x: x[1], reverse=True):
                    if diff < -value:
                        # Create alarm data
                        alarm_data = {
                            "eventType": "AMPLITUDE_DROP",
                            "severity": name,
                            "location": f"{current_dist:.2f} km",
                            "amplitude": float(self.amplitude[min_dist_idx]),
                            "deviation": float(-diff),
                            "threshold": float(value),
                            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                            "file": os.path.basename(self.file_label.text().replace("Loaded: ", ""))
                        }
                        
                        print(f"\n=== THRESHOLD CROSSED: {name} ===")
                        print(f"Position: {current_dist:.2f} km, Deviation: {-diff:.2f} dB")
                        
                        # Save PDF for this alarm specifically
                        pdf_path = None
                        try:
                            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                            fault_name = f"fault_{timestamp}_{name}_{current_dist:.2f}km"
                            self.faults_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../frontend/public/faults'))
                            os.makedirs(self.faults_dir, exist_ok=True)
                            pdf_path = os.path.join(self.faults_dir, f"{fault_name}.pdf")
                            self._save_fault_pdf(pdf_path, alarm_data)
                            print(f"PDF saved to: {pdf_path}")
                        except Exception as e:
                            print(f"Failed to save fault PDF: {str(e)}")
                            pdf_path = None
                        
                        # Send email notification with PDF
                        email_sent = self.send_email_notification(alarm_data, pdf_path)
                        self.save_notification_to_server(alarm_data)
                        
                        # Show message to user
                        email_status = "Notification email sent to monitoring team." if email_sent else "Failed to send notification email."
                        QMessageBox.information(
                            self, "Threshold Alert",
                            f"{name} level threshold crossed at {current_dist:.2f} km\n"
                            f"Deviation: {-diff:.2f} dB (threshold: {value} dB)\n"
                            f"{email_status}"
                        )
                        break

    def _save_fault_pdf(self, file_name, alarm_data):
        """Save a PDF report for a specific fault"""
        with PdfPages(file_name) as pdf:
            # 1. Main plot page
            pdf_fig = Figure(figsize=(10, 6), dpi=100)
            pdf_ax = pdf_fig.add_subplot(111)
            
            # Plot the trace
            pdf_ax.plot(self.distance, self.amplitude, 'b-',
                       label='Courbe actuelle', linewidth=0.8, alpha=0.9)
                       
            # Plot the adjusted portion if there is one
            if hasattr(self, 'last_adjusted_index') and self.last_adjusted_index is not None:
                pdf_ax.plot(self.distance[self.last_adjusted_index:],
                          self.amplitude[self.last_adjusted_index:],
                          'r-', linewidth=1.5, alpha=0.9,
                          label='Partie ajustée')
                          
            if self.reference_curve is not None:
                pdf_ax.plot(self.distance, self.reference_curve, 'g--',
                          label='Courbe de référence', linewidth=0.8, alpha=0.7)
                          
            # Add thresholds
            threshold_translation = {
                'Sensitive': 'Sensible',
                'Normal': 'Normal',
                'Coarse': 'Grossier',
                'Break': 'Rupture'
            }
            
            colors = {
                'Sensitive': 'limegreen', 'Sensible': 'limegreen',
                'Normal': 'orange',
                'Coarse': 'red', 'Grossier': 'red',
                'Break': 'black', 'Rupture': 'black'
            }
            
            for name, value in self.thresholds.items():
                french_name = threshold_translation.get(name, name)
                color = colors.get(name, 'black')
                pdf_ax.axhline(y=-value, color=color, linestyle=':', linewidth=1.0, alpha=0.7,
                            label=f'Seuil {french_name} ({value} dB)')
                            
            # Mark the alarm point
            alarm_distance = float(alarm_data['location'].replace(' km', ''))
            alarm_idx = np.argmin(np.abs(self.distance - alarm_distance))
            pdf_ax.plot(self.distance[alarm_idx], self.amplitude[alarm_idx],
                      'ro', markersize=8, alpha=1.0, label='Point de défaut')
                      
            # Add title with alarm info
            pdf_ax.set_xlabel("Distance (km)")
            pdf_ax.set_ylabel("Amplitude (dB)")
            pdf_ax.set_title(f"Défaut détecté - {alarm_data['severity']} - {alarm_data['location']}")
            pdf_ax.grid(True, linestyle='--', alpha=0.5)
            pdf_ax.legend(loc='upper right', fontsize=9)
            
            # Zoom in around the alarm point
            margin = 2.0  # Show 2km before and after fault
            x_min = max(0, alarm_distance - margin)
            x_max = min(max(self.distance), alarm_distance + margin)
            pdf_ax.set_xlim(x_min, x_max)
            
            # Auto-set y limits for good visibility
            points_in_view = np.where((self.distance >= x_min) & (self.distance <= x_max))[0]
            if len(points_in_view) > 0:
                y_values = [self.amplitude[points_in_view]]
                if self.reference_curve is not None:
                    y_values.append(self.reference_curve[points_in_view])
                y_min = min([np.min(y) for y in y_values])
                y_max = max([np.max(y) for y in y_values])
                y_padding = (y_max - y_min) * 0.2
                pdf_ax.set_ylim(y_min - y_padding, y_max + y_padding)
                
            pdf_fig.tight_layout()
            pdf.savefig(pdf_fig)
            
            # 2. Alarm details page
            pdf_fig = Figure(figsize=(10, 6), dpi=100)
            pdf_ax = pdf_fig.add_subplot(111)
            pdf_ax.axis('off')
            
            # Add title
            pdf_fig.suptitle("Détails du défaut détecté", fontsize=16, y=0.95)
            
            # Create table with alarm details
            table_data = [
                ["Type de défaut:", alarm_data['eventType']],
                ["Sévérité:", alarm_data['severity']],
                ["Position:", alarm_data['location']],
                ["Amplitude:", f"{alarm_data['amplitude']:.2f} dB"],
                ["Déviation:", f"{alarm_data['deviation']:.2f} dB"],
                ["Seuil:", f"{alarm_data['threshold']:.2f} dB"],
                ["Date/Heure:", alarm_data['timestamp']],
                ["Fichier source:", alarm_data['file']]
            ]
            
            table = pdf_ax.table(
                cellText=table_data,
                cellLoc='left',
                loc='center',
                cellColours=[['#f8f9fa']*2]*len(table_data)
            )
            
            # Style the table
            table.auto_set_font_size(False)
            table.set_fontsize(12)
            table.scale(1, 2)
            for key, cell in table.get_celld().items():
                cell.set_text_props(wrap=True)
                if key[1] == 0:  # First column
                    cell.set_text_props(weight='bold')
                    
            pdf_fig.tight_layout()
            pdf.savefig(pdf_fig)
            
        return file_name

    def on_draw(self, event):
        """Track when zoom/pan occurs by checking if limits changed"""
        self.zoom_mode = False

    def on_scroll(self, event):
        """Handle mouse wheel zooming"""
        if not event.inaxes:
            return
            
        xlim = self.ax.get_xlim()
        ylim = self.ax.get_ylim()
        zoom_factor = 0.1 if event.button == 'up' else -0.1
        x_center = event.xdata
        y_center = event.ydata
        new_x_width = (xlim[1] - xlim[0]) * (1 - zoom_factor)
        new_y_height = (ylim[1] - ylim[0]) * (1 - zoom_factor)
        self.ax.set_xlim([
            x_center - new_x_width/2,
            x_center + new_x_width/2
        ])
        self.ax.set_ylim([
            y_center - new_y_height/2,
            y_center + new_y_height/2
        ])
        self.canvas.draw()

    def save_as_pdf(self):
        """Save the current plot and alarm information to PDF in the faults directory"""
        if self.distance is None:
            QMessageBox.warning(self, "Pas de données", "Aucune donnée à sauvegarder")
            return
            
        # Créer le dossier faults s'il n'existe pas
        self.faults_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../frontend/public/faults'))
        os.makedirs(self.faults_dir, exist_ok=True)
        
        # Demander le nom de fichier
        file_base, ok = QInputDialog.getText(self, "Nom du rapport", "Entrez le nom du fichier PDF (sans extension) :")
        if not ok or not file_base.strip():
            return
            
        file_name = os.path.join(self.faults_dir, f"{file_base.strip()}.pdf")
        
        try:
            # Create a translation dictionary for threshold names
            threshold_translation = {
                'Sensitive': 'Sensible',
                'Normal': 'Normal',
                'Coarse': 'Grossier',
                'Break': 'Rupture'
            }
            
            # Unified color dictionary for both English and French keys
            colors = {
                'Sensitive': 'limegreen', 'Sensible': 'limegreen',
                'Normal': 'orange',
                'Coarse': 'red', 'Grossier': 'red',
                'Break': 'black', 'Rupture': 'black'
            }
            
            with PdfPages(file_name) as pdf:
                # 1. Tracé principal
                pdf_fig = Figure(figsize=(10, 6), dpi=100)
                pdf_ax = pdf_fig.add_subplot(111)
                
                # Plot the trace
                pdf_ax.plot(self.distance, self.amplitude, 'b-',
                          label='Courbe actuelle', linewidth=0.8, alpha=0.9)
                          
                # Plot the adjusted portion if there is one
                if hasattr(self, 'last_adjusted_index') and self.last_adjusted_index is not None:
                    pdf_ax.plot(self.distance[self.last_adjusted_index:],
                              self.amplitude[self.last_adjusted_index:],
                              'r-', linewidth=1.5, alpha=0.9,
                              label='Partie ajustée')
                              
                if self.reference_curve is not None:
                    pdf_ax.plot(self.distance, self.reference_curve, 'g--',
                              label='Courbe de référence', linewidth=0.8, alpha=0.7)
                              
                # Add event markers if available
                if hasattr(self, 'sor_data') and self.sor_data is not None and hasattr(self.sor_data, 'jsonoutput') and 'events' in self.sor_data.jsonoutput:
                    events = self.sor_data.jsonoutput['events']
                    for ev_num, ev_data in events.items():
                        pos_km = ev_data['eventPoint_m'] / 1000
                        loc = self.sor_data.return_index(self.sor_data.dataset, ev_data['eventPoint_m'])
                        if loc is not None:
                            pdf_ax.plot(pos_km, loc, 'ro', markersize=5)
                            pdf_ax.text(pos_km, loc, str(ev_num),
                                      color='black', fontsize=8,
                                      bbox=dict(facecolor='white', alpha=0.7, edgecolor='none'))
                                      
                # Add thresholds
                for name, value in self.thresholds.items():
                    # Get the French translation of the threshold name
                    french_name = threshold_translation.get(name, name)
                    # Get the color from our unified dictionary
                    color = colors.get(name, 'black')
                    pdf_ax.axhline(y=-value, color=color, linestyle=':', linewidth=1.0, alpha=0.7,
                                  label=f'Seuil {french_name} ({value} dB)')
                                  
                # Mark alarm points
                for alarm_type, dist, loss in self.alarms:
                    # Get the French translation of the alarm type if needed
                    french_alarm_type = threshold_translation.get(alarm_type, alarm_type)
                    # Get the color
                    color = colors.get(alarm_type, 'black')
                    pdf_ax.plot(dist, self.amplitude[np.argmin(np.abs(self.distance - dist))],
                              'o', color=color, markersize=6, alpha=0.8)
                              
                # Set labels and style
                pdf_ax.set_xlabel("Distance (km)")
                pdf_ax.set_ylabel("Amplitude (dB)")
                pdf_ax.set_title("Tracé de mesure OTDR")
                pdf_ax.grid(True, linestyle='--', alpha=0.5)
                pdf_ax.legend(loc='upper right', fontsize=9)
                
                # Match current view
                xlim = self.ax.get_xlim()
                ylim = self.ax.get_ylim()
                pdf_ax.set_xlim(xlim)
                pdf_ax.set_ylim(ylim)
                
                pdf_fig.tight_layout()
                pdf.savefig(pdf_fig)
                
                # 2. Add event table page if available
                if hasattr(self, 'sor_data') and self.sor_data is not None and hasattr(self.sor_data, 'jsonoutput') and 'events' in self.sor_data.jsonoutput:
                    pdf_fig = Figure(figsize=(10, 6), dpi=100)
                    pdf_ax = pdf_fig.add_subplot(111)
                    pdf_ax.axis('off')
                    
                    # Get event data
                    events = self.sor_data.jsonoutput['events']
                    modified_events = self.modified_events if hasattr(self, 'modified_events') and self.modified_events is not None else events
                    sorted_events = sorted(events.items(), key=lambda x: x[1]['eventPoint_m'])
                    sorted_mod_events = sorted(modified_events.items(), key=lambda x: x[1]['eventPoint_m']) if hasattr(self, 'modified_events') and self.modified_events else sorted_events
                    
                    # Create table data
                    table_data = [["Événement", "Type", "Pos (km)", "Perte (dB)", "Réfl (dB)",
                                  "Mod Type", "Mod Pos (km)", "Mod Perte (dB)", "Mod Réfl (dB)", "Delta (dB)"]]
                                  
                    cumulative_loss = 0
                    mod_cumulative_loss = 0
                    
                    for (ev_num, ev_data), (mod_ev_num, mod_ev_data) in zip(sorted_events, sorted_mod_events):
                        pos_km = ev_data['eventPoint_m'] / 1000
                        mod_pos_km = mod_ev_data['eventPoint_m'] / 1000
                        
                        # Original data
                        splice_loss = ev_data['spliceLoss_dB']
                        if splice_loss != 0:
                            cumulative_loss += splice_loss
                        refl_loss = ev_data['reflectionLoss_dB']
                        
                        # Modified data
                        mod_splice_loss = mod_ev_data['spliceLoss_dB']
                        if mod_splice_loss != 0:
                            mod_cumulative_loss += mod_splice_loss
                        mod_refl_loss = mod_ev_data['reflectionLoss_dB']
                        
                        # Delta
                        delta = mod_splice_loss - splice_loss if splice_loss != 0 and mod_splice_loss != 0 else 0
                        
                        table_data.append([
                            str(ev_num),
                            ev_data['eventType'],
                            f"{pos_km:.4f}",
                            f"{splice_loss:.3f}" if splice_loss != 0 else "-",
                            f"{refl_loss:.2f}" if refl_loss != 0 else "-",
                            mod_ev_data['eventType'],
                            f"{mod_pos_km:.4f}",
                            f"{mod_splice_loss:.3f}" if mod_splice_loss != 0 else "-",
                            f"{mod_refl_loss:.2f}" if mod_refl_loss != 0 else "-",
                            f"{delta:.3f}" if delta != 0 else "-"
                        ])
                    
                    # Add table to figure
                    table = pdf_ax.table(
                        cellText=table_data,
                        colLabels=None,
                        loc='center',
                        cellLoc='center'
                    )
                    
                    # Style the table
                    table.auto_set_font_size(False)
                    table.set_fontsize(8)
                    table.scale(1, 1.2)
                    
                    pdf_fig.tight_layout()
                    pdf.savefig(pdf_fig)
                
                # 3. Tableau des alarmes (si présent)
                if self.alarms:
                    pdf_fig = Figure(figsize=(10, 6), dpi=100)
                    pdf_ax = pdf_fig.add_subplot(111)
                    pdf_ax.axis('off')
                    
                    pdf_fig.text(0.1, 0.9, "Rapport des alarmes OTDR", fontsize=16, fontweight='bold')
                    
                    sorted_alarms = sorted(self.alarms, key=lambda x: x[1])
                    table_data = [["Type d'alarme", "Distance (km)", "Perte (dB)"]]
                    
                    for alarm in sorted_alarms:
                        # Translate alarm type to French if needed
                        french_alarm = threshold_translation.get(alarm[0], alarm[0])
                        table_data.append([french_alarm, f"{alarm[1]:.3f}", f"{alarm[2]:.2f}"])
                    
                    table = pdf_ax.table(
                        cellText=table_data,
                        colLabels=None,
                        loc='center',
                        cellLoc='center'
                    )
                    
                    table.auto_set_font_size(False)
                    table.set_fontsize(10)
                    table.scale(1, 1.5)
                    
                    pdf_fig.tight_layout()
                    pdf.savefig(pdf_fig)
                    
            QMessageBox.information(self, "Succès", f"Rapport enregistré dans le dossier 'faults' sous le nom : {file_base.strip()}.pdf")
            
        except Exception as e:
            QMessageBox.critical(self, "Erreur", f"Impossible de sauvegarder le PDF : {str(e)}")

    def save_dual_curve_sor(self):
        """Save both reference and modified curves to a new .sor file"""
        if self.sor_data is None:
            QMessageBox.warning(self, "No Data", "No data to save")
            return
            
        options = QFileDialog.Options()
        file_name, _ = QFileDialog.getSaveFileName(
            self, "Save Dual-Curve SOR File", "", "SOR Files (*.sor);;All Files (*)",
            options=options)
            
        if file_name:
            try:
                # Create a deep copy of the original data to modify
                dual_curve_sor = copy.deepcopy(self.sor_data)
                
                # Create a combined dataset with both curves
                combined_dataset = []
                ref_curve = self.reference_curve if self.reference_curve is not None else self.original_amplitude
                
                for i, (dist, _) in enumerate(dual_curve_sor.dataset):
                    if i < len(self.amplitude) and i < len(ref_curve):
                        # Add reference curve point
                        combined_dataset.append((dist, ref_curve[i]))
                        # Add modified curve point with small distance offset
                        combined_dataset.append((dist + 0.1, self.amplitude[i]))  # 0.1m offset
                
                dual_curve_sor.dataset = combined_dataset
                
                # Update events to mark which curve they belong to
                if hasattr(dual_curve_sor, 'jsonoutput') and 'events' in dual_curve_sor.jsonoutput:
                    original_events = dual_curve_sor.jsonoutput['events']
                    modified_events = self.modified_events if self.modified_events is not None else original_events
                    
                    # Create combined events dictionary
                    combined_events = {}
                    next_event_num = max(int(k) for k in original_events.keys()) + 1 if original_events else 1
                    
                    # Add original events (reference curve)
                    for ev_num, ev_data in original_events.items():
                        combined_events[ev_num] = copy.deepcopy(ev_data)
                        combined_events[ev_num]['curve_type'] = 'reference'
                    
                    # Add modified events with new numbers and small position offset
                    for ev_num, ev_data in modified_events.items():
                        new_ev_num = str(next_event_num)
                        combined_events[new_ev_num] = copy.deepcopy(ev_data)
                        combined_events[new_ev_num]['curve_type'] = 'modified'
                        combined_events[new_ev_num]['eventPoint_m'] += 0.1  # 0.1m offset
                        next_event_num += 1
                    
                    dual_curve_sor.jsonoutput['events'] = combined_events
                
                # Update the raw file data with the modified information
                raw_data = bytearray(dual_curve_sor.rawdecodedfile)
                
                # Find the DataPts section
                data_pts_start = dual_curve_sor.SecLocs["DataPts"][0] if "DataPts" in dual_curve_sor.SecLocs else None
                
                if data_pts_start:
                    # Convert dataset to binary format
                    data_bytes = bytearray()
                    for dist, amp in dual_curve_sor.dataset:
                        # Convert distance to 4 bytes (meters)
                        dist_bytes = int(dist).to_bytes(4, byteorder='little', signed=False)
                        # Convert amplitude to 4 bytes (dB * 1000 as signed integer)
                        amp_bytes = int(amp * -1000).to_bytes(4, byteorder='little', signed=True)
                        data_bytes.extend(dist_bytes)
                        data_bytes.extend(amp_bytes)
                    
                    # Update the DataPts section header
                    data_section_header = b'DataPts' + len(data_bytes).to_bytes(4, byteorder='little')
                    
                    # Find the next section to determine DataPts section length
                    next_section = self.GetNext("DataPts")
                    data_pts_end = dual_curve_sor.SecLocs[next_section][0] if next_section else len(raw_data)
                    
                    # Replace the DataPts section in the raw data
                    new_data_section = data_section_header + data_bytes
                    raw_data[data_pts_start:data_pts_end] = new_data_section
                
                # Update the GenParams section to indicate this is a dual-curve file
                if "GenParams" in dual_curve_sor.SecLocs:
                    gen_params_start = dual_curve_sor.SecLocs["GenParams"][0]
                    next_section = self.GetNext("GenParams")
                    gen_params_end = dual_curve_sor.SecLocs[next_section][0] if next_section else len(raw_data)
                    
                    # Add note about dual curves to the comment field
                    original_comment = dual_curve_sor.jsonoutput.get('comment', '')
                    modified_comment = f"Dual-curve file: {original_comment}"
                    comment_bytes = modified_comment.encode('utf-8') + b'\x00'
                    
                    # Update the comment in the raw data
                    comment_pos = raw_data.find(original_comment.encode('utf-8'), gen_params_start, gen_params_end)
                    if comment_pos != -1:
                        raw_data[comment_pos:comment_pos+len(original_comment)] = comment_bytes
                
                # Write the modified file
                with open(file_name, 'wb') as f:
                    f.write(raw_data)
                
                QMessageBox.information(self, "Success", f"Dual-curve SOR file saved to {file_name}")
                
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Could not save dual-curve SOR: {str(e)}")

    def GetNext(self, key):
        """Helper method to get next section"""
        if not hasattr(self, 'SecLocs') or key not in self.SecLocs:
            return None
        index = self.SecLocs[key][0]
        next_key = None
        next_index = float('inf')
        for k, v in self.SecLocs.items():
            if k == key or not v:
                continue
            if index < v[0] < next_index:
                next_index = v[0]
                next_key = k
        return next_key
    def save_notification_to_server(self, alarm_data):
        try:
            url = 'http://localhost:5000/api/notifications'
            response = requests.post(url, json=alarm_data)
            if response.status_code == 201:
                print("Notification saved to server successfully")
            else:
                print("Failed to save notification to server:", response.text)
        except Exception as e:
            print("Error sending notification to server:", e)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle('Fusion')
    window = FiberAnalyzer()
    window.show()
    sys.exit(app.exec_())
