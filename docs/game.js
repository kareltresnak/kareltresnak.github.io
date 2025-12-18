let dbMain = [], dbSpare = [];
let questions = [], spares = [];
let board = Array(29).fill(0);
let currentPlayer = 1; // 1 = Oranžoví, 2 = Modří
let currentField = null;
let isGameReady = false;
// --- ROBUSTNÍ KONFIGURACE AI HLASU ---
let voiceEnabled = true;

// Pomocná proměnná pro uložení hlasů
let availableVoices = [];

// Načteme hlasy hned jak to půjde (Chrome hack)
window.speechSynthesis.onvoiceschanged = () => {
    availableVoices = window.speechSynthesis.getVoices();
    console.log(`Hlasy načteny: ${availableVoices.length} (Čeština dostupná: ${availableVoices.some(v => v.lang.includes('cs'))})`);
};

function cyberSpeak(text) {
    if (!voiceEnabled) return;

    // Zrušíme frontu, aby neblabolil staré věci
    window.speechSynthesis.cancel();

    // Pokud je seznam prázdný, zkusíme ho načíst znovu
    if (availableVoices.length === 0) {
        availableVoices = window.speechSynthesis.getVoices();
    }

    const msg = new SpeechSynthesisUtterance();
    msg.text = text;
    msg.volume = 1; 
    msg.rate = 1.1; 
    msg.pitch = 0.8; 

    // Hledáme český hlas
    const csVoice = availableVoices.find(v => v.lang.includes('cs') || v.lang.includes('cz'));
    
    if (csVoice) {
        msg.voice = csVoice;
        // console.log("Vybrán hlas:", csVoice.name); // Pro ladění
    } else {
        console.warn("Český hlas nenalezen, použiji výchozí.");
        msg.lang = 'cs-CZ'; // Doufáme, že systém pochopí aspoň toto
    }

    // Debuggování chyb
    msg.onerror = (e) => console.error("Chyba při mluvení:", e);
    
    window.speechSynthesis.speak(msg);
}
// Sousedé pro kontrolu (mapa sousedů v pyramidě)
const neighbors = {
    1:[2,3], 2:[1,3,4,5], 3:[1,2,5,6], 4:[2,5,7,8], 5:[2,3,4,6,8,9], 6:[3,5,9,10],
    7:[4,8,11,12], 8:[4,5,7,9,12,13], 9:[5,6,8,10,13,14], 10:[6,9,14,15],
    11:[7,12,16,17], 12:[7,8,11,13,17,18], 13:[8,9,12,14,18,19], 14:[9,10,13,15,19,20], 15:[10,14,20,21],
    16:[11,17,22,23], 17:[11,12,16,18,23,24], 18:[12,13,17,19,24,25], 19:[13,14,18,20,25,26], 20:[14,15,19,21,26,27], 21:[15,20,27,28],
    22:[16,23], 23:[16,17,22,24], 24:[17,18,23,25], 25:[18,19,24,26], 26:[19,20,25,27], 27:[20,21,26,28], 28:[21,27]
};

function initGame() {
    drawBoard();
    updateStatus();
}

function drawBoard() {
    const svg = document.getElementById("game-board");
    svg.innerHTML = "";
    const rows = [1, 2, 3, 4, 5, 6, 7];
    let count = 1;
    // Původní rozměry pro funkčnost
    const size = 38; 
    const dy = 60;
    const dx = 70;

    rows.forEach((rCount, rIdx) => {
        const startX = 325 - (rCount - 1) * (dx / 2);
        for (let i = 0; i < rCount; i++) {
            const x = startX + i * dx;
            const y = 50 + rIdx * dy;
            createHex(svg, x, y, count++);
        }
    });
}

function createHex(svg, x, y, id) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "hex-group");
    if(!isGameReady) {
        // V CSS se o zbytek postará třída board-locked
    }

    // Body pro hexagon
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (i * 60 - 30) * Math.PI / 180;
        points.push(`${x + 35 * Math.cos(angle)},${y + 35 * Math.sin(angle)}`);
    }

    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", points.join(" "));
    poly.setAttribute("class", "hex"); // Základní třída
    
    // Aplikace barev
    if(board[id] === 0) {
        // Volné pole (třída hex už má gradient v CSS)
    } else if(board[id] === 1) {
        poly.classList.add("player1");
    } else if(board[id] === 2) {
        poly.classList.add("player2");
    } else if(board[id] === 3) {
        poly.classList.add("black-active");
    }

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y + 5); // Jemná korekce vertikálně
    text.setAttribute("class", "hex-text");
    text.textContent = id;

    g.appendChild(poly);
    g.appendChild(text);
    
    g.onclick = () => onFieldClick(id);
    
    svg.appendChild(g);
}

function loadXML(input) {
    const f = input.files[0];
    if(!f) return;
    const r = new FileReader();
    r.onload = e => {
        const p = new DOMParser();
        const x = p.parseFromString(e.target.result, "text/xml");
        const n = x.getElementsByTagName("otazka");
        
        let newMain = [], newSpare = [];
        for(let el of n) {
            try {
                const t = el.getElementsByTagName("text")[0].textContent;
                const a = el.getElementsByTagName("odpoved")[0].textContent;
                const typ = el.getAttribute("typ");
                if(typ==="nahradni") newSpare.push({q:t, a:a}); else newMain.push({q:t, a:a});
            } catch(e){}
        }
        
        dbMain = [...newMain];
        dbSpare = [...newSpare];
        questions = [...dbMain].sort(()=>Math.random()-0.5);
        spares = [...dbSpare].sort(()=>Math.random()-0.5);
        
        isGameReady = true;
        
        // Odemčení desky - odstranění board-locked a přidání board-active
        const boardWrapper = document.getElementById("game-board");
        // boardWrapper je SVG, ale třídu board-locked/active dáváme obvykle na kontejner nebo přímo na SVG
        // V CSS je board-locked definováno, aplikujeme ho.
        boardWrapper.classList.remove("board-locked");
        boardWrapper.classList.add("board-active");

        document.querySelector(".btn-file").style.borderColor = "#00ff00";
        alert("Data nahrána! Aréna aktivována.");
        drawBoard();
        updateStatus();
    };
    r.readAsText(f);
}

function updateStatus() {
    // 1. Nastavení barev
    const pName = currentPlayer === 1 ? "ORANŽOVÍ" : "MODŘÍ";
    const pColor = currentPlayer === 1 ? "#ff8800" : "#00aaff";
    
    // 2. Indikátor nahoře
    const indicator = document.getElementById("active-player-name");
    if (indicator) {
        indicator.textContent = pName;
        indicator.style.color = pColor;
        indicator.style.textShadow = `0 0 20px ${pColor}`;
        indicator.style.borderColor = pColor;
        indicator.style.boxShadow = `0 0 15px ${pColor}, inset 0 0 10px ${pColor}`;
    }

    // 3. Energetický prstenec (Aréna)
    const ring = document.querySelector(".board-energy-ring");
    if (ring) {
        ring.style.setProperty('--ring-color', pColor);
    }

    // 4. Přebarvení okna s otázkou (Modál)
    const modal = document.getElementById("modal-content");
    if (modal) {
        modal.style.borderColor = pColor;
        modal.style.boxShadow = `0 0 50px ${pColor}, inset 0 0 30px ${pColor}`;
    }
    
    // 5. --- OPRAVA: Info o zásobníku ---
    const deckInfo = document.getElementById("deck-info");
    
    if (deckInfo) {
        // ZMĚNA: Ptáme se, jestli máme otázky, NE jestli je hra "ready"
        if (questions.length > 0) {
            deckInfo.textContent = `ZÁSOBNÍK: ${questions.length} | ROZSTŘEL: ${spares.length}`;
            deckInfo.style.color = "#2ecc71"; // Zelená (OK)
            deckInfo.style.textShadow = "0 0 10px rgba(46, 204, 113, 0.5)";
        } else {
            deckInfo.textContent = "Čekám na data...";
            deckInfo.style.color = "#95a5a6"; // Šedá (Čekání)
            deckInfo.style.textShadow = "none";
        }
    }
}
function onFieldClick(id) {
    const isFree = board[id] === 0;
    const isBlack = board[id] === 3;

    if (!isGameReady) return;
    // Kliknout jde jen na prázdné nebo černé pole
    if (!isFree && !isBlack) return; 

    // Kontrola, zda máme dostatek otázek v příslušném zásobníku
    if (isFree && questions.length === 0) { alert("Došly základní otázky!"); return; }
    if (isBlack && spares.length === 0) { alert("Došly náhradní otázky (ANO/NE)!"); return; }

    currentField = id;
    let qObj;
    let isSpare = false;

    // --- ROZHODOVÁNÍ O TYPU OTÁZKY ---
    if (isBlack) {
        // Klikl jsi na černé -> bere se náhradní (ANO/NE)
        qObj = spares.pop();
        isSpare = true; 
    } else {
        // Klikl jsi na prázdné -> bere se normální
        qObj = questions.pop();
        isSpare = false;
    }

    // Pošleme informaci do modálu (isSpare = true/false)
    showModal(qObj.q, qObj.a, isSpare);
    updateStatus();
}

function showModal(q, a, isSpare = false) {
    document.getElementById("question-text").textContent = q;
    document.getElementById("correct-answer").textContent = a;
    
    // Reset zobrazení (Schováme odpověď, ukážeme tlačítko)
    const overlay = document.getElementById("modal-overlay");
    overlay.style.display = "flex";
    document.getElementById("btn-reveal").style.display = "inline-block";
    document.getElementById("answer-wrapper").style.display = "none";
    
    // Spustíme odpočet (ten po skončení NIC neudělá, jen se zastaví - přesně jak chceš)
    startTimer();
    
    // --- AI HLAS a ZMĚNA NADPISU ---
    const labelEl = document.getElementById("question-label");

    if (isSpare) {
        // SPECIÁLNÍ REŽIM PRO ČERNÉ POLE
        if(labelEl) labelEl.textContent = "// ROZSTŘEL (ANO/NE) //";
        if(labelEl) labelEl.style.color = "#ff3f34"; // Červený text pro efekt
        
        cyberSpeak("Černé pole. Otázka Ano nebo Ne: " + q);
    } else {
        // KLASICKÝ REŽIM
        if(labelEl) labelEl.textContent = "// PŘÍCHOZÍ DATA //";
        if(labelEl) labelEl.style.color = "var(--neon-blue)";

        const prefixes = [
            "Příchozí data.", "Otázka zní:", "Analyzujte zadání:", 
            "Pozor, dotaz:", "Nová sekvence.", ""
        ];
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        cyberSpeak(randomPrefix + " " + q);
    }
    }

// --- OPRAVA ČASOVAČE (AUTO-ODHALENÍ) ---
let timerInterval;

function startTimer() {
    // 1. Nastavíme čas (20 sekund)
    let t = 20; 
    const el = document.getElementById("timer");
    if(el) el.textContent = t;
    
    // 2. Zrušíme starý interval, aby se nepraly
    clearInterval(timerInterval);
    
    // 3. Spustíme nový odpočet
    timerInterval = setInterval(() => {
        t--;
        if(el) el.textContent = t;
        
        // 4. KDYŽ ČAS VYPRŠÍ (nula)
        if(t <= 0) {
            clearInterval(timerInterval);
            // --- ZMĚNA: Automaticky odhalíme odpověď ---
            revealAnswer();
        }
    }, 1000);
}

function revealAnswer() {
    // 1. Schováme tlačítko a ukážeme kontejner
    document.getElementById("btn-reveal").style.display = "none";
    const ansWrapper = document.getElementById("answer-wrapper");
    ansWrapper.style.display = "block";
    
    // Zastavíme časovač
    clearInterval(timerInterval);

    // 2. Najdeme element s odpovědí
    const answerEl = document.getElementById("correct-answer");
    
    // 3. --- SPUŠTĚNÍ DEKÓDOVACÍ ANIMACE ---
    animateDecode(answerEl);

    // 4. --- AI HLAS (S malým zpožděním, aby to nezačalo dřív než animace) ---
    const answerText = answerEl.textContent;
    const ansPrefixes = ["Správná odpověď je:", "Řešení:", "Výsledek analýzy:", "Odpověď zní:", ""];
    const rnd = ansPrefixes[Math.floor(Math.random() * ansPrefixes.length)];
    
    // Počkáme 500ms, než se text trochu "vyloupne", pak začne mluvit
    setTimeout(() => {
        cyberSpeak(rnd + " " + answerText);
    }, 500);
}
function finalizeTurn(success) {
    document.getElementById("modal-overlay").style.display = "none";
    if(success) {
        board[currentField] = currentPlayer;
        checkWin(currentPlayer);
    } else {
        // Pokud odpověděli špatně, pole zčerná (blokováno)
        // V AZ kvízu se obvykle stává neutrálním nebo černým, zde dáme 3 (černá)
        board[currentField] = 3; 
    }
    
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    drawBoard();
    updateStatus();
}

function loadSpareQuestion() {
    if(spares.length === 0) { alert("Došly náhradní otázky!"); return; }
    const q = spares.pop();
    
    document.getElementById("question-text").textContent = q.q;
    document.getElementById("correct-answer").textContent = q.a;
    document.getElementById("btn-reveal").style.display = "inline-block";
    document.getElementById("answer-wrapper").style.display = "none";
    startTimer();
    updateStatus();

    // Hlas pro rozstřel
    cyberSpeak("Rozstřelová otázka. " + q.q);
}

// --- KONTROLA VÝHRY (S GRANDIOZNÍM FINÁLE) ---
function checkWin(p) {
    const sides = { L: [1,2,4,7,11,16,22], R: [1,3,6,10,15,21,28], B: [22,23,24,25,26,27,28] };
    const myFields = board.map((v,i) => v===p ? i : -1).filter(i=>i>0);
    if(myFields.length < 3) return;

    const visited = new Set();
    for(let start of myFields) {
        if(visited.has(start)) continue;
        const q = [start]; visited.add(start); const cluster = new Set([start]);
        let h = 0;
        while(h < q.length) {
            const curr = q[h++];
            (neighbors[curr]||[]).forEach(n => {
                if(board[n]===p && !visited.has(n)) {
                    visited.add(n); cluster.add(n); q.push(n);
                }
            });
        }
        
        let l=0, r=0, b=0;
        for(let f of cluster) {
            if(sides.L.includes(f)) l=1;
            if(sides.R.includes(f)) r=1;
            if(sides.B.includes(f)) b=1;
        }
        
        if(l&&r&&b) {
            // --- VÍTĚZSTVÍ! SPUSTIT GRANDIOZNÍ EFEKT ---
            setTimeout(() => {
                triggerVictory(p);
            }, 300); // Malá prodleva pro dokreslení posledního pole
            return;
        }
    }
}

// Nová funkce pro zobrazení vítězné obrazovky
function triggerVictory(winnerId) {
    const overlay = document.getElementById("victory-overlay");
    const winnerNameEl = document.getElementById("winner-name");
    
    // Nastavení textu a barev podle vítěze
    if (winnerId === 1) {
        winnerNameEl.textContent = "ORANŽOVÍ";
        overlay.classList.add("win-orange");
        overlay.classList.remove("win-blue");
    } else {
        winnerNameEl.textContent = "MODŘÍ";
        overlay.classList.add("win-blue");
        overlay.classList.remove("win-orange");
    }
    
    // Zobrazení overlaye (spustí CSS animace)
    overlay.style.display = "flex";
    cyberSpeak("Bitva ukončena. Vítězí " + wName);
}

// Inicializace po načtení
window.onload = () => {
    initGame();
    // Zamkneme desku na začátku (vizuálně)
    document.getElementById("game-board").classList.add("board-locked");
};

// --- FUNKCE PRO ZÁSOBNÍK (DALŠÍ KOLO) ---
function startNewRound() {
    // 1. Pojistka proti nechtěnému kliknutí
    if(!confirm("Opravdu chcete restartovat celou hru? Herní pole bude vyčištěno.")) return;

    // 2. Vymazání herního pole (logika)
    board = Array(28).fill(0); 
    
    // 3. Vymazání herního pole (grafika)
    const hexes = document.querySelectorAll('.hex');
    hexes.forEach(hex => {
        hex.classList.remove('orange', 'blue', 'black');
    });

    // 4. Reset hráče na začátek (Oranžoví)
    currentPlayer = 1;

    // 5. KLÍČOVÉ: Obnovení otázek ze zálohy a jejich ZAMÍCHÁNÍ
    // (Vezme data, co jste nahráli, a znovu je náhodně seřadí)
    if (typeof dbMain !== 'undefined' && dbMain.length > 0) {
        questions = shuffleArray([...dbMain]); 
        spares = shuffleArray([...dbSpare]);
        cyberSpeak("Restart systému. Otázky byly promíchány.");
    } else {
        questions = [];
        spares = [];
        cyberSpeak("Systém restartován. Žádná data v paměti.");
    }

    // 6. Schování všech oken (pokud by nějaké viselo)
    document.getElementById("modal-overlay").style.display = "none";
    document.getElementById("victory-overlay").style.display = "none";
    document.getElementById("datacenter-overlay").style.display = "none";
    
    // 7. Reset časovače
    if (typeof timerInterval !== 'undefined') clearInterval(timerInterval);

    // 8. Aktualizace textů a barev
    updateStatus();
}
function toggleVoice() {
    voiceEnabled = !voiceEnabled;
    const btn = document.getElementById("btn-voice");
    
    if(voiceEnabled) {
        btn.innerHTML = '<span class="btn-icon">🔊</span> Hlas: ZAP';
        btn.style.borderBottomColor = "#2ecc71"; // Zelená
        cyberSpeak("Hlasový modul aktivován.");
    } else {
        window.speechSynthesis.cancel(); // Okamžitě ztichne
        btn.innerHTML = '<span class="btn-icon">🔇</span> Hlas: VYP';
        btn.style.borderBottomColor = "#e74c3c"; // Červená
    }
}
// --- EFEKT DEKÓDOVÁNÍ TEXTU ---
function animateDecode(element) {
    const originalText = element.textContent;
    // Znaky, které budou problikávat (kybernetická abeceda)
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;':,./<>?";
    
    let iteration = 0;
    let interval = null;
    
    clearInterval(interval);
    
    interval = setInterval(() => {
        element.textContent = originalText
            .split("")
            .map((letter, index) => {
                // Pokud už jsme za hranicí iterace, ukaž správné písmeno
                if(index < iteration) {
                    return originalText[index];
                }
                // Jinak ukaž náhodný znak (prostor pro mezeru necháme prázdný)
                if(originalText[index] === ' ') return ' ';
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");
        
        // Konec animace
        if(iteration >= originalText.length){ 
            clearInterval(interval);
            element.textContent = originalText; // Pojistka pro správný text na konci
        }
        
        iteration += 1 / 2; // Rychlost odkrývání (menší číslo = pomalejší)
    }, 30); // Rychlost měnění znaků (v ms)
}
// --- CENTRÁLNÍ DATOVÉ CENTRUM ---

function openDataCenter() {
    document.getElementById("datacenter-overlay").style.display = "flex";
    checkIntegrity(); // Okamžitá kontrola počtů
}

function closeDataCenter() {
    document.getElementById("datacenter-overlay").style.display = "none";
    
    // Pokud máme data, HNUJEME hru kupředu
    if (questions.length > 0) {
        isGameReady = true; // DŮLEŽITÉ: Přepneme stav hry
        
        // Odemkneme grafiku
        const board = document.getElementById("game-board");
        if(board) {
            board.classList.remove("board-locked");
            board.classList.add("board-active");
        }
        
        // Spustíme aktualizaci textů
        updateStatus();
        cyberSpeak("Systém aktivní. Aréna připravena.");
    }
}

// Funkce pro kontrolu počtů (Červená/Zelená)
function checkIntegrity() {
    const mainCount = questions.length;
    const spareCount = spares.length;

    const indMain = document.getElementById("ind-main");
    const indSpare = document.getElementById("ind-spare");

    // Kontrola hlavních otázek (Cíl: 28)
    if (mainCount >= 28) {
        indMain.className = "status-indicator valid";
        indMain.innerText = `🟢 ZÁKLADNÍ OTÁZKY: ${mainCount} / 28 (OK)`;
    } else {
        indMain.className = "status-indicator invalid";
        indMain.innerText = `🔴 ZÁKLADNÍ OTÁZKY: ${mainCount} / 28 (CHYBÍ ${28 - mainCount})`;
    }

    // Kontrola černých polí (Cíl: 28)
    if (spareCount >= 28) {
        indSpare.className = "status-indicator valid";
        indSpare.innerText = `🟢 PRO ČERNÁ POLE: ${spareCount} / 28 (OK)`;
    } else {
        indSpare.className = "status-indicator invalid";
        indSpare.innerText = `🔴 PRO ČERNÁ POLE: ${spareCount} / 28 (CHYBÍ ${28 - spareCount})`;
    }
}

// Nahrání souboru uvnitř datového centra
function loadXMLInCenter(input) {
    const f = input.files[0];
    if(!f) return;
    const r = new FileReader();
    r.onload = e => {
        const p = new DOMParser();
        const x = p.parseFromString(e.target.result, "text/xml");
        const n = x.getElementsByTagName("otazka");
        
        let newMain = [], newSpare = [];
        for(let el of n) {
            try {
                const t = el.getElementsByTagName("text")[0].textContent;
                const a = el.getElementsByTagName("odpoved")[0].textContent;
                const typ = el.getAttribute("typ");
                if(typ === "nahradni") newSpare.push({q:t, a:a}); else newMain.push({q:t, a:a});
            } catch(err) {}
        }
        
        // Přepíšeme globální proměnné
        questions = newMain;
        spares = newSpare;
        
        checkIntegrity(); // Aktualizujeme kontrolky
        cyberSpeak("Data importována. Probíhá analýza integrity.");
        alert(`Nahráno: ${newMain.length} základních a ${newSpare.length} náhradních otázek.`);
    };
    r.readAsText(f);
}

// Ruční přidání otázky
function addQFromCenter() {
    const qText = document.getElementById("dc-q-text").value.trim();
    const qAns = document.getElementById("dc-q-ans").value.trim();
    const type = document.querySelector('input[name="dc-type"]:checked').value;

    if (!qText || !qAns) {
        alert("Chyba: Vyplňte otázku i odpověď.");
        return;
    }

    const newQ = { q: qText, a: qAns };

    if (type === "spare") {
        spares.push(newQ);
    } else {
        questions.push(newQ);
    }

    // Vyčistit pole
    document.getElementById("dc-q-text").value = "";
    document.getElementById("dc-q-ans").value = "";
    document.getElementById("dc-q-text").focus();
    
    checkIntegrity(); // Aktualizovat počty
    
    // Zvuková odezva
    const count = type === "spare" ? spares.length : questions.length;
    cyberSpeak(`Otázka přidána. Celkem ${count}.`);
}

// Export do XML
function downloadXML() {
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<kviz>\n';
    
    questions.forEach(q => {
        xmlContent += `    <otazka typ="zakladni">\n        <text>${q.q}</text>\n        <odpoved>${q.a}</odpoved>\n    </otazka>\n`;
    });

    spares.forEach(q => {
        xmlContent += `    <otazka typ="nahradni">\n        <text>${q.q}</text>\n        <odpoved>${q.a}</odpoved>\n    </otazka>\n`;
    });

    xmlContent += '</kviz>';

    const blob = new Blob([xmlContent], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "az_kviz_databaze.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    cyberSpeak("Databáze uložena na disk.");
}
// --- MATRIX EFEKT NA POZADÍ ---
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');

// Nastavení přes celou obrazovku
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*()_+=-{}[]|;:,.<>?/CYBERARENA";
const fontSize = 14;
const columns = canvas.width / fontSize;

// Pole pro kapky (každý sloupec má svou y-pozici)
const drops = [];
for (let x = 0; x < columns; x++) {
    drops[x] = 1;
}

function drawMatrix() {
    // Jemné zatmavování předchozího snímku (vytváří stopu)
    ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0F0"; // Zelený text (klasika)
    // Pokud chceš modrý styl Arény, odkomentuj tento řádek:
    // ctx.fillStyle = "#00aaff"; 

    ctx.font = fontSize + "px monospace";

    for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Reset kapky na začátek (s náhodností)
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        drops[i]++;
    }
}

// Spustíme animaci (30 snímků za sekundu)
setInterval(drawMatrix, 33);

// Oprava při změně velikosti okna
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
// --- POMOCNÁ FUNKCE: MÍCHÁNÍ (SHUFFLE) ---
// Důležité: Aby po nahrání souboru nešly otázky popořadě, ale náhodně
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- CENTRÁLNÍ DATOVÉ CENTRUM (Bez generátoru) ---

function openDataCenter() {
    document.getElementById("datacenter-overlay").style.display = "flex";
    checkIntegrity(); 
}

function closeDataCenter() {
    document.getElementById("datacenter-overlay").style.display = "none";
    
    // Pokud máme data, odemkneme hru
    if (questions.length > 0) {
        isGameReady = true; 
        
        const board = document.getElementById("game-board");
        if(board) {
            board.classList.remove("board-locked");
            board.classList.add("board-active");
        }
        
        updateStatus();
        cyberSpeak("Systém aktivní. Aréna připravena.");
    }
}

// Funkce pro kontrolu počtů (Červená/Zelená)
function checkIntegrity() {
    const mainCount = questions.length;
    const spareCount = spares.length;

    const indMain = document.getElementById("ind-main");
    const indSpare = document.getElementById("ind-spare");

    if (mainCount >= 28) {
        indMain.className = "status-indicator valid";
        indMain.innerText = `🟢 ZÁKLADNÍ OTÁZKY: ${mainCount} / 28 (OK)`;
    } else {
        indMain.className = "status-indicator invalid";
        indMain.innerText = `🔴 ZÁKLADNÍ OTÁZKY: ${mainCount} / 28 (CHYBÍ ${28 - mainCount})`;
    }

    if (spareCount >= 28) {
        indSpare.className = "status-indicator valid";
        indSpare.innerText = `🟢 PRO ČERNÁ POLE: ${spareCount} / 28 (OK)`;
    } else {
        indSpare.className = "status-indicator invalid";
        indSpare.innerText = `🔴 PRO ČERNÁ POLE: ${spareCount} / 28 (CHYBÍ ${28 - spareCount})`;
    }
}

// Nahrání souboru + MÍCHÁNÍ
function loadXMLInCenter(input) {
    const f = input.files[0];
    if(!f) return;
    const r = new FileReader();
    r.onload = e => {
        const p = new DOMParser();
        const x = p.parseFromString(e.target.result, "text/xml");
        const n = x.getElementsByTagName("otazka");
        
        let newMain = [], newSpare = [];
        for(let el of n) {
            try {
                const t = el.getElementsByTagName("text")[0].textContent;
                const a = el.getElementsByTagName("odpoved")[0].textContent;
                const typ = el.getAttribute("typ");
                if(typ === "nahradni") newSpare.push({q:t, a:a}); else newMain.push({q:t, a:a});
            } catch(err) {}
        }
        
        // ZDE PROBÍHÁ ZAMÍCHÁNÍ (aby nešly popořadě)
        questions = shuffleArray(newMain);
        spares = shuffleArray(newSpare);
        
        dbMain = [...questions]; 
        dbSpare = [...spares];
        
        checkIntegrity(); 
        cyberSpeak("Data importována a promíchána.");
    };
    r.readAsText(f);
}

// Ruční přidání otázky
function addQFromCenter() {
    const qText = document.getElementById("dc-q-text").value.trim();
    const qAns = document.getElementById("dc-q-ans").value.trim();
    const type = document.querySelector('input[name="dc-type"]:checked').value;

    if (!qText || !qAns) {
        alert("Chyba: Vyplňte otázku i odpověď.");
        return;
    }

    const newQ = { q: qText, a: qAns };

    if (type === "spare") {
        spares.push(newQ);
        dbSpare.push(newQ);
    } else {
        questions.push(newQ);
        dbMain.push(newQ);
    }

    document.getElementById("dc-q-text").value = "";
    document.getElementById("dc-q-ans").value = "";
    document.getElementById("dc-q-text").focus();
    
    checkIntegrity(); 
    cyberSpeak("Položka přidána.");
}

// Export do XML
function downloadXML() {
    let xmlContent = '<?xml version="1.0" encoding="UTF-8"?>\n<kviz>\n';
    
    questions.forEach(q => {
        xmlContent += `    <otazka typ="zakladni">\n        <text>${q.q}</text>\n        <odpoved>${q.a}</odpoved>\n    </otazka>\n`;
    });

    spares.forEach(q => {
        xmlContent += `    <otazka typ="nahradni">\n        <text>${q.q}</text>\n        <odpoved>${q.a}</odpoved>\n    </otazka>\n`;
    });

    xmlContent += '</kviz>';

    const blob = new Blob([xmlContent], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "az_kviz_databaze.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    cyberSpeak("Databáze uložena.");
}
