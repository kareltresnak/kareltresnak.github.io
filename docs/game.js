// ==========================================
// HLAVNÍ PROMĚNNÉ A NASTAVENÍ
// ==========================================

let dbMain = [];
let dbSpare = [];
let questions = [];
let spares = [];

let board = Array(29).fill(0);
let currentPlayer = 1; // 1 = Oranžoví, 2 = Modří
let currentField = null;
let isGameReady = false;
let voiceEnabled = true;
let timerInterval;

// Proměnné pro logiku kradení otázky
let isStealing = false; // Zda právě odpovídá druhý tým (kradení)
let tempPlayer = 0;     // Kdo odpovídá v rámci kradení

const neighbors = {
    1:[2,3], 2:[1,3,4,5], 3:[1,2,5,6], 4:[2,5,7,8], 5:[2,3,4,6,8,9], 6:[3,5,9,10],
    7:[4,8,11,12], 8:[4,5,7,9,12,13], 9:[5,6,8,10,13,14], 10:[6,9,14,15],
    11:[7,12,16,17], 12:[7,8,11,13,17,18], 13:[8,9,12,14,18,19], 14:[9,10,13,15,19,20], 15:[10,14,20,21],
    16:[11,17,22,23], 17:[11,12,16,18,23,24], 18:[12,13,17,19,24,25], 19:[13,14,18,20,25,26], 20:[14,15,19,21,26,27], 21:[15,20,27,28],
    22:[16,23], 23:[16,17,22,24], 24:[17,18,23,25], 25:[18,19,24,26], 26:[19,20,25,27], 27:[20,21,26,28], 28:[21,27]
};

// ==========================================
// KLÍČOVÉ FUNKCE
// ==========================================

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

window.onload = () => {
    initGame();
    const boardEl = document.getElementById("game-board");
    if(boardEl) boardEl.classList.add("board-locked");
};

function initGame() {
    drawBoard();
    updateStatus();
}

function startNewRound() {
    if(!confirm("Opravdu chcete restartovat celou hru?")) return;

    board = Array(29).fill(0); 
    currentPlayer = 1;
    isStealing = false;

    const hexes = document.querySelectorAll('.hex');
    hexes.forEach(hex => {
        hex.classList.remove('player1', 'player2', 'black-active');
    });

    if (dbMain.length > 0) {
        questions = shuffleArray([...dbMain]); 
        spares = shuffleArray([...dbSpare]);
        cyberSpeak("Restart systému. Otázky byly promíchány.");
    } else {
        questions = [];
        spares = [];
        cyberSpeak("Systém restartován. Zásobník je prázdný.");
    }

    document.getElementById("modal-overlay").style.display = "none";
    document.getElementById("victory-overlay").style.display = "none";
    document.getElementById("datacenter-overlay").style.display = "none";
    
    if (timerInterval) clearInterval(timerInterval);
    updateStatus();
}

// ==========================================
// HRACÍ DESKA
// ==========================================

function drawBoard() {
    const svg = document.getElementById("game-board");
    svg.innerHTML = "";
    const rows = [1, 2, 3, 4, 5, 6, 7];
    let count = 1;
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
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (i * 60 - 30) * Math.PI / 180;
        points.push(`${x + 35 * Math.cos(angle)},${y + 35 * Math.sin(angle)}`);
    }

    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", points.join(" "));
    poly.setAttribute("class", "hex");
    
    if(board[id] === 1) poly.classList.add("player1");
    else if(board[id] === 2) poly.classList.add("player2");
    else if(board[id] === 3) poly.classList.add("black-active");

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y + 5);
    text.setAttribute("class", "hex-text");
    text.textContent = id;

    g.appendChild(poly);
    g.appendChild(text);
    g.onclick = () => onFieldClick(id);
    svg.appendChild(g);
}

function onFieldClick(id) {
    if (!isGameReady) return;
    const isFree = board[id] === 0;
    const isBlack = board[id] === 3;

    if (!isFree && !isBlack) return; 

    if (isFree && questions.length === 0) { alert("Došly základní otázky!"); return; }
    if (isBlack && spares.length === 0) { alert("Došly náhradní otázky!"); return; }

    currentField = id;
    let qObj;
    let isSpare = false;

    // Reset proměnných pro kradení
    isStealing = false;
    tempPlayer = currentPlayer; 

    if (isBlack) {
        qObj = spares.pop();
        isSpare = true; 
    } else {
        qObj = questions.pop();
        isSpare = false;
    }

    showModal(qObj.q, qObj.a, isSpare);
    updateStatus(); // Aktualizace barev (ringu)
}

// ==========================================
// MODÁL, ČASOVAČ A KRADENÍ
// ==========================================

function showModal(q, a, isSpare = false) {
    // Reset UI modálu
    document.getElementById("question-text").textContent = q;
    document.getElementById("correct-answer").textContent = a;
    document.getElementById("modal-overlay").style.display = "flex";
    
    document.getElementById("btn-reveal").style.display = "inline-block";
    document.getElementById("answer-wrapper").style.display = "none";
    document.getElementById("steal-wrapper").style.display = "none"; // Skrýt kradení
    document.getElementById("timer").style.display = "flex"; // Zobrazit časovač

    // Vizuál pro černé pole
    const labelEl = document.getElementById("question-label");
    if (isSpare) {
        labelEl.textContent = "// ROZSTŘEL (ANO/NE) //";
        labelEl.style.color = "#ff3f34";
        cyberSpeak("Černé pole. Rozstřel: " + q);
    } else {
        labelEl.textContent = "// PŘÍCHOZÍ DATA //";
        labelEl.style.color = "var(--neon-blue)";
        cyberSpeak("Otázka: " + q);
    }

    startTimer(isSpare);
}

function startTimer(isSpare) {
    let t = 20; // 20 sekund
    const el = document.getElementById("timer");
    el.textContent = t;
    
    clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        t--;
        el.textContent = t;
        
        if(t <= 0) {
            clearInterval(timerInterval);
            handleTimeout(isSpare); // Čas vypršel -> řešíme co dál
        }
    }, 1000);
}

// --- LOGIKA PO VYPRŠENÍ ČASU ---
function handleTimeout(isSpare) {
    if (isSpare || isStealing) {
        // Pokud je to rozstřel (černé pole) nebo už je to kradená otázka,
        // nemůže se znovu krást -> rovnou odhalit
        revealAnswer();
    } else {
        // Normální otázka -> nabídnout kradení
        document.getElementById("timer").style.display = "none"; // Skrýt čas
        document.getElementById("steal-wrapper").style.display = "block"; // Zobrazit volbu
        document.getElementById("btn-reveal").style.display = "none"; // Skrýt tlačítko pro normální odhalení
        
        const opponentName = currentPlayer === 1 ? "MODŘÍ" : "ORANŽOVÍ";
        cyberSpeak("Čas vypršel. Chtějí odpovídat " + opponentName + "?");
    }
}

// --- FUNKCE PRO TLAČÍTKA V KRADENÍ ---
function stealQuestion(wantToSteal) {
    document.getElementById("steal-wrapper").style.display = "none";
    
    if (wantToSteal) {
        // Soupeř chce odpovídat
        isStealing = true;
        tempPlayer = currentPlayer === 1 ? 2 : 1; // Dočasně přepneme aktivního hráče (jen pro barvy)
        
        // Změna barev UI na barvy zloděje
        updateStatus(true); 
        
        document.getElementById("timer").style.display = "flex";
        document.getElementById("btn-reveal").style.display = "inline-block";
        
        cyberSpeak("Odpovídá druhý tým.");
        startTimer(false); // Restart časovače (už nejde znovu ukrást, viz handleTimeout)
    } else {
        // Soupeř nechce -> zobrazit odpověď a brát jako chybu původního hráče
        document.getElementById("btn-reveal").style.display = "inline-block";
        revealAnswer();
    }
}

function revealAnswer() {
    document.getElementById("btn-reveal").style.display = "none";
    document.getElementById("steal-wrapper").style.display = "none";
    document.getElementById("answer-wrapper").style.display = "block";
    clearInterval(timerInterval);

    const answerEl = document.getElementById("correct-answer");
    animateDecode(answerEl);
    
    // Pokud jsme kradli a vypršel čas i podruhé, rovnou označujeme jako fail
    // (tlačítka Schválit/Zamítnout zůstávají pro moderátora)
}

function finalizeTurn(success) {
    document.getElementById("modal-overlay").style.display = "none";
    
    const isSpare = board[currentField] === 3; // Bylo to černé pole?

    if (isSpare) {
        // --- LOGIKA PRO ČERNÉ POLE ---
        if (success) {
            // Správně -> Získává ten, kdo je na tahu (current)
            board[currentField] = currentPlayer;
            currentPlayer = currentPlayer === 1 ? 2 : 1; // Změna tahu
        } else {
            // Špatně -> Pole získává SOUPEŘ
            const opponent = currentPlayer === 1 ? 2 : 1;
            board[currentField] = opponent;
            // A hráč hraje ZNOVU (tzn. neměníme currentPlayer)
            cyberSpeak("Chyba na černém poli. Pole získává soupeř, hrajete znovu.");
        }
    } else {
        // --- LOGIKA PRO NORMÁLNÍ OTÁZKU ---
        if (success) {
            if (isStealing) {
                // Pokud ukradl a odpověděl správně -> získává pole zloděj (tempPlayer)
                board[currentField] = tempPlayer;
            } else {
                // Normální výhra
                board[currentField] = currentPlayer;
            }
        } else {
            // Chyba -> Pole zčerná
            board[currentField] = 3; 
        }
        
        // U normálních otázek se tah vždy střídá (i po kradení)
        currentPlayer = currentPlayer === 1 ? 2 : 1;
    }

    drawBoard();
    updateStatus();
    if(success) checkWin(currentPlayer === 1 ? 2 : 1); // Kontrola pro toho, kdo právě získal pole
}

// ==========================================
// VÝHERNÍ LOGIKA
// ==========================================

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
            setTimeout(() => triggerVictory(p), 300);
            return;
        }
    }
}

function triggerVictory(winnerId) {
    const overlay = document.getElementById("victory-overlay");
    const winnerNameEl = document.getElementById("winner-name");
    const wName = winnerId === 1 ? "ORANŽOVÍ" : "MODŘÍ";

    if (winnerId === 1) {
        winnerNameEl.textContent = "ORANŽOVÍ";
        overlay.classList.add("win-orange");
        overlay.classList.remove("win-blue");
    } else {
        winnerNameEl.textContent = "MODŘÍ";
        overlay.classList.add("win-blue");
        overlay.classList.remove("win-orange");
    }
    overlay.style.display = "flex";
    cyberSpeak("Vítězí " + wName);
}

// ==========================================
// DATOVÉ CENTRUM
// ==========================================
// (Zůstává stejné jako v původní verzi, jen zkráceně zde pro kontext)
function openDataCenter() { document.getElementById("datacenter-overlay").style.display = "flex"; checkIntegrity(); }
function closeDataCenter() { 
    document.getElementById("datacenter-overlay").style.display = "none"; 
    if (questions.length > 0) isGameReady = true;
    updateStatus();
}
function checkIntegrity() { /* ... kód z minula ... */ }
function loadXMLInCenter(input) { /* ... kód z minula ... */ }
function addQFromCenter() { /* ... kód z minula ... */ }
function downloadXML() { /* ... kód z minula ... */ }

// ==========================================
// VIZUÁLNÍ EFEKTY A UPDATE STATUSU
// ==========================================

function updateStatus(forceStealColor = false) {
    // Určení, koho zobrazovat jako "aktivního" (pro barvy UI)
    // Pokud se krade (isStealing nebo forceStealColor), používáme tempPlayer
    let activeP = currentPlayer;
    if (isStealing || forceStealColor) {
        activeP = tempPlayer;
    }

    const pName = activeP === 1 ? "ORANŽOVÍ" : "MODŘÍ";
    const pColor = activeP === 1 ? "#ff8800" : "#00aaff";
    
    const indicator = document.getElementById("active-player-name");
    if (indicator) {
        indicator.textContent = pName;
        indicator.style.color = pColor;
        indicator.style.textShadow = `0 0 20px ${pColor}`;
        indicator.style.borderColor = pColor;
        indicator.style.boxShadow = `0 0 15px ${pColor}, inset 0 0 10px ${pColor}`;
    }

    const ring = document.querySelector(".board-energy-ring");
    if (ring) ring.style.setProperty('--ring-color', pColor);

    const modal = document.getElementById("modal-content");
    if (modal) {
        modal.style.borderColor = pColor;
        modal.style.boxShadow = `0 0 50px ${pColor}, inset 0 0 30px ${pColor}`;
    }
    
    const deckInfo = document.getElementById("deck-info");
    if (deckInfo && questions.length > 0) {
        deckInfo.textContent = `ZÁSOBNÍK: ${questions.length} | ROZSTŘEL: ${spares.length}`;
    }
}

function animateDecode(element) {
    const originalText = element.textContent;
    const chars = "XYZ10!@#";
    let iteration = 0;
    let interval = setInterval(() => {
        element.textContent = originalText.split("").map((l, i) => {
            if(i < iteration) return originalText[i];
            return chars[Math.floor(Math.random() * chars.length)];
        }).join("");
        if(iteration >= originalText.length){ clearInterval(interval); element.textContent = originalText; }
        iteration += 1 / 2; 
    }, 30); 
}

// ==========================================
// ZVUK & MATRIX
// ==========================================
let availableVoices = [];
window.speechSynthesis.onvoiceschanged = () => { availableVoices = window.speechSynthesis.getVoices(); };

function cyberSpeak(text) {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance();
    msg.text = text;
    msg.rate = 1.1; msg.pitch = 0.8; 
    window.speechSynthesis.speak(msg);
}

function toggleVoice() {
    voiceEnabled = !voiceEnabled;
    const btn = document.getElementById("btn-voice");
    btn.innerHTML = voiceEnabled ? '<span class="btn-icon">🔊</span> ZVUK: ZAP' : '<span class="btn-icon">🔇</span> ZVUK: VYP';
}

// Matrix kód zůstává stejný
const canvas = document.getElementById('matrix-bg');
if(canvas) { /* ... kód z minula pro matrix ... */ }
