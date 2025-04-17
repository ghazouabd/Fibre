const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');

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

module.exports = router;