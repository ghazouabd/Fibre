import sys
from PyQt5.QtWidgets import QApplication, QWidget, QVBoxLayout, QPushButton, QLabel, QFileDialog, QMessageBox
from pySorReader import sorReader
from pprint import pprint as pp

class SorFileProcessor(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Select SOR File")
        self.setGeometry(300, 300, 400, 120)

        layout = QVBoxLayout()

        self.label = QLabel("No file selected.")
        layout.addWidget(self.label)

        self.select_button = QPushButton("Select .sor File")
        self.select_button.clicked.connect(self.select_file)
        layout.addWidget(self.select_button)

        self.setLayout(layout)

    def select_file(self):
        file_name, _ = QFileDialog.getOpenFileName(self, "Open SOR File", "", "SOR Files (*.sor);;All Files (*)")
        
        if file_name:
            self.label.setText(f"Processing: {file_name}")
            try:
                # Lecture du fichier .sor
                c = sorReader(file_name)

                # Affiche les données dans la console
                print("\n--- JSON Output ---")
                pp(c.jsonoutput)

                # Export des fichiers
                c.jsondump()
                c.exportAsCsv()

                # Génération du graphique et PDF
                event_table = c.plotter(save_pdf=True)

                print("\n--- Event Table ---")
                print(event_table.to_string(index=False))

               
            except Exception as e:
                QMessageBox.critical(self, "Error", f"Failed to process the file:\n{str(e)}")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = SorFileProcessor()
    window.show()
    sys.exit(app.exec_())

