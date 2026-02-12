const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();

// Middleware
app.use(cors()); 
app.use(bodyParser.json());

app.post('/run', (req, res) => {
    const { code, level } = req.body;
    
    // On s'assure que le niveau est au format "01", "02", etc.
    const levelString = level.toString().padStart(2, '0'); 
    
    // 1. Définition des chemins
    // tempPath : fichier temporaire où on écrit le code reçu du frontend
    const tempPath = path.join(__dirname, `temp_level${levelString}.py`);
    // testPath : chemin vers ton fichier test_level01.py dans le dossier Exercices
    const testPath = path.resolve(__dirname, '../../Exercices', `test_level${levelString}.py`);

    // Vérification de sécurité : le test existe-t-il ?
    if (!fs.existsSync(testPath)) {
        return res.status(404).json({ 
            success: false, 
            output: `ERREUR : Le fichier de test Exercices/test_level${levelString}.py est introuvable.` 
        });
    }

    // 2. Écriture du code du joueur sur le disque du serveur
    fs.writeFileSync(tempPath, code);

    // 3. Commande Docker
    // IMPORTANT : On monte le code du joueur sur /app/level${levelString}.py
    // pour que l'import "from level01 import ..." dans le test fonctionne.
    const dockerCmd = `docker run --rm \
        -v "${tempPath}:/app/level${levelString}.py" \
        -v "${testPath}:/app/test_script.py" \
        kramp-sandbox pytest /app/test_script.py`;

    console.log(`Exécution du Niveau ${levelString}...`);

    exec(dockerCmd, (error, stdout, stderr) => {
        // Nettoyage : on supprime le fichier temporaire
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

        // success est vrai si pytest retourne 0 (tous les tests passent)
        const success = !error;
        
        // Génération du flag dynamique
        const flag = success ? `FLAG_LVL${levelString}_${Math.random().toString(36).substring(7).toUpperCase()}` : null;

        res.json({ 
            success: success, 
            output: stdout || stderr, 
            flag: flag 
        });
    });
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`🚀 SERVEUR MKARP ACTIF SUR LE PORT ${PORT}`);
    console.log(`🛠️  PRET POUR LES TESTS UNITAIRES`);
    console.log(`========================================`);
});