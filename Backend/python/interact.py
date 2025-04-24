import sys
import numpy as np
from PyQt5.QtWidgets import (QApplication, QMainWindow, QVBoxLayout, QWidget, 
                            QLabel, QPushButton, QFileDialog, QMessageBox, 
                            QInputDialog, QHBoxLayout)
from matplotlib.backends.backend_qt5agg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.backends.backend_qt5agg import NavigationToolbar2QT as NavigationToolbar
from matplotlib.figure import Figure
import matplotlib.pyplot as plt
import os
from pySorReader import sorReader
from matplotlib.backends.backend_pdf import PdfPages

class FiberAnalyzer(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("OTDR Trace Analyzer")
        self.setGeometry(100, 100, 1200, 800)
        
        # Data storage
        self.distance = None
        self.amplitude = None
        self.reference_curve = None
        self.original_amplitude = None
        self.thresholds = {
            'Sensible': 0.05,
            'Normal': 0.1,
            'Grossier': 0.5,
            'Rupture': 4.0
        }
        self.alarms = []
        self.zoom_mode = False  # Track if we're in zoom mode
        
        # UI Setup
        self.main_widget = QWidget()
        self.setCentralWidget(self.main_widget)
        self.layout = QVBoxLayout(self.main_widget)
        
        # File controls
        self.file_label = QLabel("No file loaded")
        self.load_button = QPushButton("Load OTDR File (.sor)")
        self.load_button.clicked.connect(self.load_file)
        
        # Add reset curve button
        self.reset_curve_button = QPushButton("Reset Current Curve")
        self.reset_curve_button.clicked.connect(self.reset_current_curve)
        self.reset_curve_button.setEnabled(False)
        
        # Add save button
        self.save_button = QPushButton("Save as PDF")
        self.save_button.clicked.connect(self.save_as_pdf)
        self.save_button.setEnabled(False)
        
        # Button layout
        button_layout = QHBoxLayout()
        button_layout.addWidget(self.load_button)
        button_layout.addWidget(self.reset_curve_button)
        button_layout.addWidget(self.save_button)
        
        # Plot area
        self.figure = Figure(figsize=(10, 6), dpi=100)
        self.canvas = FigureCanvas(self.figure)
        self.ax = self.figure.add_subplot(111)
        self.ax.set_xlabel("Distance (km)")
        self.ax.set_ylabel("Amplitude (dB)")
        self.ax.set_title("OTDR Measurement Trace")
        self.ax.grid(True, linestyle='--', alpha=0.5)
        
        # Add navigation toolbar for zoom/pan
        self.toolbar = NavigationToolbar(self.canvas, self)
        
        # Add widgets to layout
        self.layout.addWidget(self.file_label)
        self.layout.addLayout(button_layout)
        self.layout.addWidget(self.toolbar)
        self.layout.addWidget(self.canvas)
        
        # Connect mouse events
        self.canvas.mpl_connect('button_press_event', self.on_click)
        self.canvas.mpl_connect('scroll_event', self.on_scroll)
        self.canvas.mpl_connect('draw_event', self.on_draw)  # Track zoom/pan actions
        self.selected_point = None
    
    def on_draw(self, event):
        """Track when zoom/pan occurs by checking if limits changed"""
        # This helps us detect when a zoom/pan operation completes
        self.zoom_mode = False
    
    def on_scroll(self, event):
        """Handle mouse wheel zooming"""
        if not event.inaxes:
            return
            
        # Get current limits
        xlim = self.ax.get_xlim()
        ylim = self.ax.get_ylim()
        
        # Calculate zoom factor (10% per scroll step)
        zoom_factor = 0.1 if event.button == 'up' else -0.1
        
        # Calculate new limits
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
    
    def load_file(self):
        """Load and display OTDR trace data using sorReader"""
        options = QFileDialog.Options()
        file_name, _ = QFileDialog.getOpenFileName(
            self, "Open OTDR File", "", "OTDR Files (*.sor);;All Files (*)", 
            options=options)
        
        if file_name:
            try:
                sor_data = sorReader(file_name)
                self.distance = np.array([d[0] for d in sor_data.dataset]) / 1000
                self.amplitude = np.array([d[1] for d in sor_data.dataset])
                self.original_amplitude = self.amplitude.copy()
                self.reference_curve = self.original_amplitude.copy()
                
                self.file_label.setText(f"Loaded: {os.path.basename(file_name)}")
                self.reset_curve_button.setEnabled(True)
                self.save_button.setEnabled(True)
                self.plot_data()
                
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Could not load file: {str(e)}")
    
    def reset_current_curve(self):
        """Reset the current curve to its original values"""
        if self.original_amplitude is not None:
            self.amplitude = self.original_amplitude.copy()
            self.plot_data()
            QMessageBox.information(self, "Curve Reset", "Current curve reset to original values")
    
    def plot_data(self):
        """Plot the OTDR trace with proper scaling"""
        self.ax.clear()
        self.alarms = []
        
        if self.distance is None or self.amplitude is None:
            return
            
        self.ax.plot(self.distance, self.amplitude, 'b-', 
                    label='Current Trace', linewidth=0.8, alpha=0.9)
        
        if self.reference_curve is not None:
            self.ax.plot(self.distance, self.reference_curve, 'g--', 
                        label='Reference Trace', linewidth=0.8, alpha=0.7)
        
        colors = {'Sensible': 'limegreen', 'Normal': 'orange', 
                 'Grossier': 'red', 'Rupture': 'black'}
        for name, value in self.thresholds.items():
            self.ax.axhline(y=-value, color=colors[name], linestyle=':', 
                           linewidth=1.0, alpha=0.7,
                           label=f'{name} Threshold ({value} dB)')
        
        self._set_axis_limits()
        self.ax.legend(loc='upper right', fontsize=9)
        self.ax.xaxis.set_major_locator(plt.MaxNLocator(10))
        self.ax.yaxis.set_major_locator(plt.MaxNLocator(10))
        
        self.canvas.draw()
        self.analyze_alarms()
    
    def _set_axis_limits(self):
        """Set appropriate axis limits for OTDR data"""
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
     """Analyze trace for threshold crossings without marking points"""
     if self.amplitude is None or self.reference_curve is None:
        return
        
     diff = self.amplitude - self.reference_curve
    
     # Clear any existing alarm markers (lines after the first two which are the traces)
     for artist in self.ax.lines[2:]:
        artist.remove()
    
     self.alarms = []  # Reset alarms list
    
     for i, (dist, amp, d) in enumerate(zip(self.distance, self.amplitude, diff)):
        if d < -self.thresholds['Rupture']:
            self.alarms.append(('Rupture', dist, -d))
        elif d < -self.thresholds['Grossier']:
            self.alarms.append(('Grossier', dist, -d))
        elif d < -self.thresholds['Normal']:
            self.alarms.append(('Normal', dist, -d))
        elif d < -self.thresholds['Sensible']:
            self.alarms.append(('Sensible', dist, -d))
    
     self.canvas.draw()
    
    def on_click(self, event):
   
     if (event.inaxes != self.ax or self.distance is None or 
        event.button != 1 or  # Left mouse button only
        self.toolbar.mode != ''):  # Check if any toolbar mode is active
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
    
     # Get the new amplitude value from user
     new_amp, ok = QInputDialog.getDouble(
        self, "Modify Amplitude",
        f"Current: {current_amp:.2f} dB at {current_dist:.2f} km\n"
        "New value (all points after this will be shifted by the same amount):",
        value=current_amp, decimals=2, min=-70, max=0)
    
     if ok:
        # Calculate the difference to apply
        diff = new_amp - current_amp
        
        # Apply this difference to all points after the selected point
        self.amplitude[min_dist_idx:] += diff
        
        # Update the plot and analyze alarms
        self.plot_data()
        
        # Check for threshold crossings at the modified point
        ref_value = self.reference_curve[min_dist_idx]
        point_diff = self.amplitude[min_dist_idx] - ref_value
        
        for name, value in sorted(self.thresholds.items(), key=lambda x: x[1], reverse=True):
            if point_diff < -value:
                QMessageBox.information(
                    self, "Threshold Alert",
                    f"{name} level threshold crossed at {current_dist:.2f} km\n"
                    f"Deviation: {-point_diff:.2f} dB (threshold: {value} dB)")
                break
    
    def save_as_pdf(self):
    
            if self.distance is None:
                QMessageBox.warning(self, "Pas de données", "Aucune donnée à sauvegarder")
                return

            # Créer le dossier faults s’il n’existe pas
            self.faults_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../frontend/public/faults'))
            os.makedirs(self.faults_dir, exist_ok=True)

            # Demander le nom de fichier
            file_base, ok = QInputDialog.getText(self, "Nom du rapport", "Entrez le nom du fichier PDF (sans extension) :")
            if not ok or not file_base.strip():
                return

            file_name = os.path.join(self.faults_dir, f"{file_base.strip()}.pdf")

            try:


                
                with PdfPages(file_name) as pdf:
                    # 1. Tracé principal
                    pdf_fig = plt.figure(figsize=(10, 6), dpi=100)
                    pdf_ax = pdf_fig.add_subplot(111)

                    pdf_ax.plot(self.distance, self.amplitude, 'b-', label='Courbe actuelle', linewidth=0.8, alpha=0.9)

                    if self.reference_curve is not None:
                        pdf_ax.plot(self.distance, self.reference_curve, 'g--', label='Courbe de référence', linewidth=0.8, alpha=0.7)

                    colors = {'Sensible': 'limegreen', 'Normal': 'orange', 'Grossier': 'red', 'Rupture': 'black'}
                    for name, value in self.thresholds.items():
                        pdf_ax.axhline(y=-value, color=colors[name], linestyle=':', linewidth=1.0, alpha=0.7,
                                    label=f'Seuil {name} ({value} dB)')

                    for alarm_type, dist, loss in self.alarms:
                        color = colors.get(alarm_type, 'black')
                        pdf_ax.plot(dist, self.amplitude[np.argmin(np.abs(self.distance - dist))],
                                    'o', color=color, markersize=6, alpha=0.8)

                    pdf_ax.set_xlabel("Distance (km)")
                    pdf_ax.set_ylabel("Amplitude (dB)")
                    pdf_ax.set_title("Tracé de mesure OTDR")
                    pdf_ax.grid(True, linestyle='--', alpha=0.5)
                    pdf_ax.legend(loc='upper right', fontsize=9)

                    xlim = self.ax.get_xlim()
                    ylim = self.ax.get_ylim()
                    pdf_ax.set_xlim(xlim)
                    pdf_ax.set_ylim(ylim)

                    pdf_fig.tight_layout()
                    pdf.savefig(pdf_fig)
                    plt.close(pdf_fig)

                    # 2. Tableau des alarmes (si présent)
                    if self.alarms:
                        pdf_fig = plt.figure(figsize=(10, 6), dpi=100)
                        pdf_fig.text(0.1, 0.9, "Rapport des alarmes OTDR", fontsize=16, fontweight='bold')

                        sorted_alarms = sorted(self.alarms, key=lambda x: x[1])
                        table_data = [["Type d'alarme", "Distance (km)", "Perte (dB)"]]
                        for alarm in sorted_alarms:
                            table_data.append([alarm[0], f"{alarm[1]:.3f}", f"{alarm[2]:.2f}"])

                        table = plt.table(cellText=table_data, colLabels=None, loc='center', cellLoc='center')
                        table.auto_set_font_size(False)
                        table.set_fontsize(10)
                        table.scale(1, 1.5)

                        ax = pdf_fig.gca()
                        ax.axis('off')

                        pdf_fig.tight_layout()
                        pdf.savefig(pdf_fig)
                        plt.close(pdf_fig)

                QMessageBox.information(self, "Succès", f"Rapport enregistré dans le dossier 'faults' sous le nom : {file_base.strip()}.pdf")

            except Exception as e:
                QMessageBox.critical(self, "Erreur", f"Impossible de sauvegarder le PDF : {str(e)}")


if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setStyle('Fusion')
    window = FiberAnalyzer()
    window.show()
    sys.exit(app.exec_())