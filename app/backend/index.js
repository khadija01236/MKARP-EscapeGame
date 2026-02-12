const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();

const FLAG_OPTIONS = {
    '01': ['GG_PADAWAN', 'GG_NOOBMASTER', 'GG_NEO', 'GG_MARIO'],
    '02': ['BUILD_GREEN', 'GIT_MERGED', 'CI_OK', 'SHIP_IT'],
    '03': ['CRITICAL_TEMP', 'ITS_OVER_9000', 'RED_ALERT', 'MELTDOWN_AVERTED'],
    '04': ['INVENTORY_FULL', 'LOOT_SECURED', 'BAG_OF_HOLDING', 'ITEM_GET'],
    '05': ['ARC_REACTOR', 'POWER_UP', 'ENERGY_FULL', 'CHARGE_COMPLETE'],
    '06': ['FORTY_TWO', 'DONT_PANIC', 'ANSWER_42', 'H2G2_OK'],
    '07': ['KONAMI_CODE', 'UPUPDOWNDOWN', 'SECRET_UNLOCKED', 'EXTRA_LIFE'],
    '08': ['USE_THE_FORCE', 'SABER_READY', 'JEDI_MODE', 'SITH_MODE'],
    '09': ['NEW_HIGH_SCORE', 'TOP_1', 'GG_WP', 'LEGENDARY_RUN'],
    '10': ['YOU_SHALL_PASS', 'ONE_RING', 'ROOT_ACCESS', 'FINAL_BOSS_DOWN'],
};

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
        let flag = null;
        if (success) {
            const options = FLAG_OPTIONS[levelString] || ['GG'];
            flag = options[Math.floor(Math.random() * options.length)];
        }

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