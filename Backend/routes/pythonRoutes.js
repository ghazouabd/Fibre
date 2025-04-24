const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const { spawn } = require('child_process');

const router = express.Router();

// Modifiez la route pour exécuter correctement le script
router.get('/run-consumer', (req, res) => {
  const scriptPath = path.join(__dirname, '../python/consumer.py');

  exec(`python "${scriptPath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erreur: ${error.message}`);
      return res.status(500).send(`Erreur: ${error.message}`);
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
    }

    console.log("STDOUT >>>", stdout);
    // Ajoutez cette ligne pour déclencher le rafraîchissement
    res.json({ success: true, message: "Script exécuté", output: stdout });
  });
});




// Route pour exécuter interact.py
router.get('/run-interact', (req, res) => {
  const pythonScriptPath = path.join(__dirname, '../python/interact.py'); // adapte le chemin si besoin

  const pythonProcess = spawn('python', [pythonScriptPath]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`interact.py terminé avec code ${code}`);
    if (code === 0) {
      res.status(200).json({ success: true, message: "Script exécuté avec succès" });
    } else {
      res.status(500).json({ success: false, message: "Erreur lors de l'exécution du script" });
    }
  });
});




module.exports = router;