import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

function App() {
  // --- ÉTATS (STATES) ---
  const [code, setCode] = useState('def reparer_systeme(a, b):\n    # Mission : Retourner la somme de a et b\n    return ');
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [output, setOutput] = useState('');
  const [inputFlag, setInputFlag] = useState('');
  const [gameFinished, setGameFinished] = useState(false);

  // --- LOGIQUE DU TIMER ---
  useEffect(() => {
    if (timeLeft <= 0 || gameFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, gameFinished]);

  // --- ACTIONS ---
  const runCode = async () => {
    setOutput('Exécution des tests unitaires en cours...');
    try {
      const response = await axios.post('http://localhost:5000/run', {
        code: code,
        level: level
      });

      setOutput(response.data.output);

      if (response.data.success) {
        setOutput(prev => prev + `\n\n✅ SUCCÈS ! FLAG GÉNÉRÉ : ${response.data.flag}`);
      }
    } catch (err) {
      setOutput("ERREUR : Impossible de contacter le serveur backend (port 5000).");
    }
  };

  const checkFlag = () => {
    // Vérifie si le flag entré correspond au format du niveau actuel
    if (inputFlag.includes(`FLAG_LVL0${level}_`)) {
      if (level < 3) {
        const nextLevel = level + 1;
        setLevel(nextLevel);
        setInputFlag('');
        setOutput(`ACCÈS NIVEAU 0${nextLevel} AUTORISÉ...`);
        
        // Mise à jour de l'énoncé selon le niveau suivant
        if(nextLevel === 2) {
            setCode('def inverser_signal(data):\n    # Mission : Inverser la chaîne de caractères\n    return ');
        } else if (nextLevel === 3) {
            setCode('def extraire_ip(logs):\n    # Mission : Extraire les adresses IP\n    return ');
        }
      } else {
        setGameFinished(true);
      }
    } else {
      alert("FLAG INVALIDE.");
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Calcul du score exponentiel
  const finalScore = (Math.pow(level, 2) * 100) + timeLeft;

  // --- RENDU (UI) ---
  return (
    <div style={{ backgroundColor: '#1a1a1a', color: '#00ff00', minHeight: '100vh', fontFamily: 'monospace', padding: '20px' }}>
      
      {gameFinished ? (
        /* ÉCRAN DE VICTOIRE FINAL */
        <div style={{ textAlign: 'center', paddingTop: '100px', border: '2px dashed #00ff00', margin: '50px', paddingBottom: '50px' }}>
          <h1 style={{ fontSize: '4rem', color: '#00ff00', textShadow: '0 0 10px #00ff00' }}>MISSION RÉUSSIE</h1>
          <p style={{ fontSize: '2rem' }}>ACCÈS TOTAL OBTENU</p>
          <p style={{ fontSize: '1.5rem', color: '#fff' }}>GRADE : <span style={{ fontWeight: 'bold' }}>ROOT_ADMIN</span></p>
          
          <div style={{ border: '2px solid #00ff00', display: 'inline-block', padding: '30px', marginTop: '20px', backgroundColor: '#000' }}>
            <p style={{ fontSize: '2rem', margin: 0 }}>SCORE FINAL : {finalScore} PTS</p>
            <p style={{ fontSize: '1.2rem', marginTop: '10px' }}>TEMPS RESTANT : {formatTime(timeLeft)}</p>
          </div>
          <br />
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '40px', padding: '15px 40px', backgroundColor: '#00ff00', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            REBOOT SYSTEM
          </button>
        </div>
      ) : (
        /* INTERFACE DE JEU (TERMINAL) */
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '2px solid #00ff00', marginBottom: '20px' }}>
            <span style={{ fontWeight: 'bold' }}>SYSTEM_K-RAMP v1.0.4 - [NIVEAU 0{level}]</span>
            <span style={{ color: timeLeft < 60 ? '#ff0000' : '#00ff00', fontWeight: 'bold', fontSize: '1.2rem' }}>
                TEMPS RESTANT: {formatTime(timeLeft)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '20px', height: '65vh' }}>
            {/* Zone Éditeur */}
            <div style={{ flex: 2, border: '1px solid #333', boxShadow: '0 0 15px rgba(0,255,0,0.1)' }}>
              <Editor
                height="100%"
                defaultLanguage="python"
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value)}
                options={{ fontSize: 16, minimap: { enabled: false } }}
              />
            </div>

            {/* Zone Console */}
            <div style={{ flex: 1, backgroundColor: '#000', padding: '15px', border: '1px solid #00ff00', overflowY: 'auto' }}>
              <h3 style={{ marginTop: 0, borderBottom: '1px solid #00ff00', paddingBottom: '5px' }}>CONSOLE_LOGS:</h3>
              <pre style={{ whiteSpace: 'pre-wrap', color: '#00cc00', fontSize: '14px' }}>{output}</pre>
            </div>
          </div>

          {/* Zone de Contrôle Basse */}
          <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button 
              onClick={runCode} 
              className="btn-patch"
              style={{ padding: '20px 40px', backgroundColor: '#00ff00', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
            >
              EXÉCUTER LE PATCH
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#000', padding: '15px', border: '1px solid #00ff00' }}>
              <label style={{ fontSize: '0.9rem' }}>SAISIR LE FLAG DE DÉVERROUILLAGE :</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  value={inputFlag}
                  onChange={(e) => setInputFlag(e.target.value)}
                  placeholder="FLAG_LVL..."
                  style={{ backgroundColor: '#111', color: '#00ff00', border: '1px solid #00ff00', padding: '10px', width: '250px', outline: 'none' }}
                />
                <button 
                  onClick={checkFlag}
                  style={{ backgroundColor: '#00ff00', color: '#000', border: 'none', padding: '10px 20px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  VALIDER
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;