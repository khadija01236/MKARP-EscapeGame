import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import './App.css';

function App() {
  // --- ÉTATS (STATES) ---
  const LEVEL_TEMPLATES = {
    1: [
      'def reparer_systeme(a, b):',
      '    # [MKARP] Boot sequence: réparation du cœur de calcul',
      '    # MISSION : Retourner la somme de a et b',
      '    # Indice 1 : en Python, l\'addition c\'est +',
      '    # Indice 2 : return a + b',
      '    return ',
      '',
    ].join('\n'),
    2: [
      'def assembler_code(partie_A, partie_B):',
      '    # [Geek] Forge: assembler deux fragments comme un build CI',
      '    # MISSION : Retourner la concaténation de partie_A et partie_B',
      '    # Exemple : "CODE" + "123" -> "CODE123"',
      '    # Indice 1 : les chaînes se collent avec +',
      '    # Indice 2 : return partie_A + partie_B',
      '    return ',
      '',
    ].join('\n'),
    3: [
      'def alerte_surchauffe(temperature):',
      '    # [Geek] Réacteur en surchauffe (pense "critical hit")',
      '    # MISSION : Retourne True si temperature > 100, sinon False',
      '    # Indice 1 : une comparaison (>) renvoie déjà un booléen',
      '    # Indice 2 : return temperature > 100',
      '    return ',
      '',
    ].join('\n'),
    4: [
      'def compter_objets(inventaire):',
      '    # [Geek] Inventaire façon RPG: combien d\'items dans le sac ? ',
      '    # MISSION : Retourner le nombre d\'éléments dans la liste inventaire',
      '    # Indice 1 : len(...) donne la taille',
      '    # Indice 2 : return len(inventaire)',
      '    return ',
      '',
    ].join('\n'),
    5: [
      'def total_energie(liste_batteries):',
      '    # [Geek] Barres d\'énergie façon Metroid: total à afficher',
      '    # MISSION : Retourner la somme des nombres de liste_batteries',
      '    # Indice 1 : sum(...) additionne une liste de nombres',
      '    # Indice 2 : return sum(liste_batteries)',
      '    return ',
      '',
    ].join('\n'),
    6: [
      'def activer_bouclier(energie):',
      '    # [Geek] Protocole 42: bouclier ONLINE si énergie suffisante',
      '    # MISSION : Retourne True si energie >= 42, sinon False',
      '    # Indice 1 : >= compare deux nombres',
      '    # Indice 2 : return energie >= 42',
      '    return ',
      '',
    ].join('\n'),
    7: [
      'def verifier_konami(sequence):',
      '    # [Geek] Konami Code: UP UP DOWN DOWN LEFT RIGHT LEFT RIGHT B A',
      '    # MISSION : Retourne True si sequence est EXACTEMENT ce code, sinon False',
      '    # Indice 1 : compare la liste à une liste "attendue"',
      '    # Indice 2 : return sequence == ["UP", ...]',
      '    return ',
      '',
    ].join('\n'),
    8: [
      'def choisir_arme(cote):',
      '    # [Geek] Choix d\'arme: jedi/sith/neutral',
      '    # MISSION :',
      '    # - si cote == "jedi" -> "sabre_bleu"',
      '    # - si cote == "sith" -> "sabre_rouge"',
      '    # - sinon -> "blaster"',
      '    # Indice 1 : if / elif / else',
      '    return ',
      '',
    ].join('\n'),
    9: [
      'def meilleur_score(scores):',
      '    # [Geek] Leaderboard arcade: extraire le meilleur score',
      '    # MISSION : Retourner le maximum de la liste scores',
      '    # Si la liste est vide, retourne 0',
      '    # Indice 1 : max(...) donne le plus grand',
      '    # Indice 2 : pense au cas []',
      '    return ',
      '',
    ].join('\n'),
    10: [
      'def normaliser_code_acces(code):',
      '    # [Geek] SAS d\'accès façon vaisseau: on nettoie le badge',
      '    # MISSION : Retourne code en MAJUSCULES, sans espaces avant/après',
      '    # Exemple : "  mkArp-10  " -> "MKARP-10"',
      '    # Indice 1 : strip() enlève les espaces autour',
      '    # Indice 2 : upper() met en majuscules',
      '    return ',
      '',
    ].join('\n'),
  };

  const LEVEL_BRIEFING = {
    1: {
      title: 'Niveau 01 — Boot (Amateur)',
      text: 'Tu es l\'apprenti opérateur. Le cœur de calcul refuse de démarrer. Patch minimal requis avant T-10:00.',
    },
    2: {
      title: 'Niveau 02 — Build CI',
      text: 'Le pipeline est fragmenté. Assemble les modules avant que le système ne coupe la lumière (référence: build qui casse).',
    },
    3: {
      title: 'Niveau 03 — Surchauffe',
      text: 'Le réacteur atteint la zone rouge. Si ça dépasse le seuil, alerte immédiate (mode critical).',
    },
    4: {
      title: 'Niveau 04 — Inventaire RPG',
      text: 'Le sas réclame un inventaire propre. Compte les objets, sinon accès refusé.',
    },
    5: {
      title: 'Niveau 05 — Énergie',
      text: 'Les batteries sont dispersées. Additionne l\'énergie totale pour alimenter le système de survie.',
    },
    6: {
      title: 'Niveau 06 — Protocole 42',
      text: 'Le bouclier doit être activé avant l\'impact. Seuil de sécurité: 42 (parce que 42).',
    },
    7: {
      title: 'Niveau 07 — Konami',
      text: 'Un ancien module accepte un code secret. S\'il est exact, tu déverrouilles une voie express.',
    },
    8: {
      title: 'Niveau 08 — Armurerie',
      text: 'Choisis l\'arme selon ton alignement. Si tu hésites, prends le blaster.',
    },
    9: {
      title: 'Niveau 09 — Leaderboard',
      text: 'Le tableau des scores décide de la priorité des processus. Il faut le meilleur score (et gérer le vide).',
    },
    10: {
      title: 'Niveau 10 — SAS final',
      text: 'Dernier verrou: badge propre, sans espaces et en MAJUSCULES. Une fois validé, accès ROOT.',
    },
  };

  const [code, setCode] = useState(LEVEL_TEMPLATES[1]);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [output, setOutput] = useState('');
  const [inputFlag, setInputFlag] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [expectedFlag, setExpectedFlag] = useState(null);
  const [levelSuccessTimes, setLevelSuccessTimes] = useState([]); // [{ level: number, at: secondsElapsed }]

  // --- LOGIQUE DU TIMER ---
  useEffect(() => {
    if (!gameStarted || timeLeft <= 0 || gameFinished) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameStarted, timeLeft, gameFinished]);

  useEffect(() => {
    if (!gameStarted || gameFinished) return;
    if (timeLeft <= 0) {
      setGameLost(true);
    }
  }, [gameStarted, gameFinished, timeLeft]);

  const startGame = () => {
    setGameStarted(true);
    setGameFinished(false);
    setGameLost(false);
    setShowIntro(false);
    setLevel(1);
    setTimeLeft(600);
    setCode(LEVEL_TEMPLATES[1]);
    setOutput('');
    setInputFlag('');
    setExpectedFlag(null);
    setLevelSuccessTimes([]);
  };

  const goToIntro = () => {
    setShowIntro(true);
    setGameStarted(false);
    setGameFinished(false);
    setGameLost(false);
    setOutput('');
    setInputFlag('');
    setExpectedFlag(null);
    setLevelSuccessTimes([]);
  };

  const returnToHome = () => {
    const ok = window.confirm(
      'Quitter la partie et revenir à l\'accueil ?\n\nProgression non sauvegardée.'
    );
    if (!ok) return;

    setGameStarted(false);
    setShowIntro(false);
    setGameFinished(false);
    setGameLost(false);
    setOutput('');
    setInputFlag('');
    setExpectedFlag(null);
    setLevelSuccessTimes([]);
  };

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
        setExpectedFlag(response.data.flag);
        setOutput(prev => prev + `\n\n✅ SUCCÈS ! FLAG GÉNÉRÉ : ${response.data.flag}`);
      }
    } catch (err) {
      setOutput("ERREUR : Impossible de contacter le serveur backend (port 5000).");
    }
  };

  const checkFlag = () => {
    const entered = (inputFlag || '').trim();
    if (!expectedFlag) {
      alert('Aucun flag attendu : exécute le patch pour générer le flag.');
      return;
    }

    // Vérifie si le flag entré correspond au dernier flag généré pour ce niveau
    if (entered === expectedFlag) {
      const successAt = Math.max(0, 600 - timeLeft);
      setLevelSuccessTimes((prev) => {
        const next = prev.filter((t) => t.level !== level);
        next.push({ level, at: successAt });
        next.sort((a, b) => a.level - b.level);
        return next;
      });

      if (level < 10) {
        const nextLevel = level + 1;
        const nextLevelString = nextLevel.toString().padStart(2, '0');
        setLevel(nextLevel);
        setInputFlag('');
        setExpectedFlag(null);
        setOutput(`ACCÈS NIVEAU ${nextLevelString} AUTORISÉ...`);
        setCode(LEVEL_TEMPLATES[nextLevel]);
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

  const totalElapsed = Math.max(0, 600 - timeLeft);
  const previousLevelSolvedAt = levelSuccessTimes.find((t) => t.level === level - 1)?.at ?? 0;
  const currentLevelElapsed = Math.max(0, totalElapsed - previousLevelSolvedAt);

  const sortedSuccessTimes = [...levelSuccessTimes].sort((a, b) => a.level - b.level);
  const perLevelSummary = sortedSuccessTimes.map((t, idx) => {
    const prevAt = idx === 0 ? 0 : sortedSuccessTimes[idx - 1].at;
    return {
      level: t.level,
      at: t.at,
      duration: Math.max(0, t.at - prevAt),
    };
  });

  const finalTotalTime = gameLost ? 600 : (sortedSuccessTimes.find((t) => t.level === 10)?.at ?? totalElapsed);
  const finalScoreOutOf10 = gameFinished ? 10 : Math.min(10, sortedSuccessTimes.length);

  const levelString = level.toString().padStart(2, '0');

  const screenKey = gameFinished
    ? 'win'
    : gameLost
      ? 'lose'
      : showIntro
        ? 'intro'
        : !gameStarted
          ? 'home'
          : 'game';

  // --- RENDU (UI) ---
  return (
    <div style={{ backgroundColor: '#1a1a1a', color: '#00ff00', minHeight: '100vh', fontFamily: 'monospace', padding: '20px' }}>
      <div className="screenRoot" key={screenKey}>

      {gameFinished ? (
        /* ÉCRAN DE VICTOIRE FINAL */
        <div style={{ textAlign: 'center', paddingTop: '100px', border: '2px dashed #00ff00', margin: '50px', paddingBottom: '50px' }}>
          <h1 style={{ fontSize: '4rem', color: '#00ff00', textShadow: '0 0 10px #00ff00' }}>MISSION RÉUSSIE</h1>
          <p style={{ fontSize: '2rem' }}>ACCÈS TOTAL OBTENU</p>

          <div style={{ border: '2px solid #00ff00', display: 'inline-block', padding: '26px 30px', marginTop: '20px', backgroundColor: '#000', textAlign: 'left', minWidth: '520px' }}>
            <div style={{ fontSize: '1.7rem', margin: 0, color: '#00ff00', fontWeight: 'bold' }}>SCORE : {finalScoreOutOf10}/10</div>
            <div style={{ fontSize: '1.2rem', marginTop: '10px', color: '#fff' }}>TEMPS TOTAL : {formatTime(finalTotalTime)}</div>
            <div style={{ marginTop: '18px', color: '#fff', opacity: 0.95 }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>TEMPS PAR NIVEAU</div>
              {perLevelSummary.length === 0 ? (
                <div style={{ opacity: 0.9 }}>Aucun niveau enregistré.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
                  {perLevelSummary.map((row) => (
                    <React.Fragment key={row.level}>
                      <div>NIVEAU {row.level.toString().padStart(2, '0')} : {formatTime(row.duration)}</div>
                      <div style={{ opacity: 0.9 }}>VALIDÉ À : {formatTime(row.at)}</div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>
          <br />
          <button
            onClick={returnToHome}
            style={{ marginTop: '15px', padding: '12px 40px', backgroundColor: '#000', color: '#00ff00', fontWeight: 'bold', border: '1px solid #00ff00', cursor: 'pointer', fontSize: '1.1rem' }}
          >
            RETOUR À L'ACCUEIL
          </button>
        </div>
      ) : gameLost ? (
        /* ÉCRAN DE DÉFAITE (TIMEOUT) */
        <div style={{ textAlign: 'center', paddingTop: '120px', border: '2px dashed #ff0000', margin: '50px', paddingBottom: '80px' }}>
          <h1 style={{ fontSize: '3.2rem', color: '#ff0000', textShadow: '0 0 10px #ff0000' }}>MISSION ÉCHOUÉE</h1>
          <p style={{ fontSize: '1.5rem', color: '#fff', marginTop: '25px' }}>T-00:00 — Autodestruction déclenchée.</p>
          <div style={{ border: '2px solid #ff0000', display: 'inline-block', padding: '22px 26px', marginTop: '18px', backgroundColor: '#000', textAlign: 'left', minWidth: '520px' }}>
            <div style={{ fontSize: '1.5rem', margin: 0, color: '#ff0000', fontWeight: 'bold' }}>SCORE : {finalScoreOutOf10}/10</div>
            <div style={{ fontSize: '1.2rem', marginTop: '10px', color: '#fff' }}>TEMPS FINAL : {formatTime(finalTotalTime)}</div>
            <div style={{ marginTop: '16px', color: '#fff', opacity: 0.95 }}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>NIVEAUX VALIDÉS</div>
              {perLevelSummary.length === 0 ? (
                <div style={{ opacity: 0.9 }}>Aucun niveau validé.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
                  {perLevelSummary.map((row) => (
                    <React.Fragment key={row.level}>
                      <div>NIVEAU {row.level.toString().padStart(2, '0')} : {formatTime(row.duration)}</div>
                      <div style={{ opacity: 0.9 }}>VALIDÉ À : {formatTime(row.at)}</div>
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          </div>

          <p style={{ fontSize: '1.1rem', color: '#fff', opacity: 0.9, marginTop: '18px' }}>Le système a explosé. Reviens à l'accueil pour relancer une tentative.</p>
          <button
            onClick={returnToHome}
            style={{ marginTop: '50px', padding: '18px 55px', backgroundColor: '#ff0000', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1.3rem' }}
          >
            RETOUR À L'ACCUEIL
          </button>
        </div>
      ) : (!gameStarted && !showIntro) ? (
        /* ÉCRAN D'ACCUEIL */
        <div style={{ textAlign: 'center', paddingTop: '120px', border: '2px dashed #00ff00', margin: '50px', paddingBottom: '80px' }}>
          <h1 style={{ fontSize: '3rem', color: '#00ff00', textShadow: '0 0 10px #00ff00' }}>BIENVENUE SUR L'ESCAPE GAME</h1>
          <p style={{ fontSize: '1.3rem', color: '#fff', marginTop: '25px' }}>Tu as 10 minutes pour réparer le système via des tests unitaires.</p>
          <button
            onClick={goToIntro}
            style={{ marginTop: '50px', padding: '20px 60px', backgroundColor: '#00ff00', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1.4rem' }}
          >
            LANCER
          </button>
        </div>
      ) : showIntro ? (
        /* ÉCRAN DE MISE EN CONTEXTE */
        <div style={{ textAlign: 'center', paddingTop: '100px', border: '2px dashed #00ff00', margin: '50px', paddingBottom: '70px' }}>
          <h1 style={{ fontSize: '2.6rem', color: '#00ff00', textShadow: '0 0 10px #00ff00' }}>BRIEFING — INCIDENT K-RAMP</h1>
          <div style={{ maxWidth: '900px', margin: '30px auto 0', color: '#fff', fontSize: '1.2rem', lineHeight: 1.6, opacity: 0.95 }}>
            <p style={{ margin: 0 }}>
              Une IA de maintenance a corrompu les modules critiques. Dans <span style={{ fontWeight: 'bold' }}>10 minutes</span>,
              le réacteur passe en autodestruction.
            </p>
            <p style={{ marginTop: '18px' }}>
              Ton job : appliquer des patches ultra courts validés par tests unitaires. Chaque niveau débloqué te donne un flag.
            </p>
            <p style={{ marginTop: '18px' }}>
              Si le chrono tombe à zéro : <span style={{ fontWeight: 'bold', color: '#ff6666' }}>BOOM</span>.
            </p>
          </div>

          <div style={{ marginTop: '45px', display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <button
              onClick={startGame}
              style={{ padding: '18px 55px', backgroundColor: '#00ff00', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1.3rem' }}
            >
              COMMENCER
            </button>
            <button
              onClick={returnToHome}
              style={{ padding: '18px 40px', backgroundColor: '#000', color: '#00ff00', fontWeight: 'bold', border: '1px solid #00ff00', cursor: 'pointer', fontSize: '1.1rem' }}
            >
              RETOUR
            </button>
          </div>
        </div>
      ) : (
        /* INTERFACE DE JEU (TERMINAL) */
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '2px solid #00ff00', marginBottom: '20px' }}>
            <span style={{ fontWeight: 'bold' }}>SYSTEM_K-RAMP v1.0.4 - [NIVEAU {levelString}]</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button
                onClick={returnToHome}
                style={{ backgroundColor: '#000', color: '#00ff00', border: '1px solid #00ff00', padding: '8px 14px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                RETOUR
              </button>
              <span style={{ color: '#fff', opacity: 0.9, fontWeight: 'bold' }}>
                TEMPS NIVEAU: {formatTime(currentLevelElapsed)}
              </span>
              <span style={{ color: timeLeft < 60 ? '#ff0000' : '#00ff00', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  TEMPS RESTANT: {formatTime(timeLeft)}
              </span>
            </div>
          </div>

          <div style={{ marginBottom: '15px', border: '1px solid #00ff00', backgroundColor: '#000', padding: '12px 14px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
              BRIEFING: {LEVEL_BRIEFING[level]?.title ?? `Niveau ${levelString}`}
            </div>
            <div style={{ color: '#fff', opacity: 0.9, lineHeight: 1.4 }}>
              {LEVEL_BRIEFING[level]?.text ?? 'Patch le module et récupère le flag pour continuer.'}
            </div>
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
                  placeholder="GG_PADAWAN"
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
    </div>
  );
}

export default App;