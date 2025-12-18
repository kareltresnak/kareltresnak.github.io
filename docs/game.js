// ==========================================
// HLAVNÍ PROMĚNNÉ A NASTAVENÍ
// ==========================================

let dbMain = [];  // Záloha základních otázek (pro restart)
let dbSpare = []; // Záloha náhradních otázek (pro restart)
let questions = []; // Aktivní balíček základních
let spares = [];    // Aktivní balíček náhradních

let board = Array(29).fill(0); // Herní pole (indexy 1-28)
let currentPlayer = 1; // 1 = Oranžoví, 2 = Modří
let currentField = null;
let isGameReady = false;
let voiceEnabled = true;
let timerInterval;

// Mapa sousedů v pyramidě (pro kontrolu výhry)
const neighbors = {
    1:[2,3], 2:[1,3,4,5], 3:[1,2,5,6], 4:[2,5,7,8], 5:[2,3,4,6,8,9], 6:[3,5,9,10],
    7:[4,8,11,12], 8:[4,5,7,9,12,13], 9:[5,6,8,10,13,14], 10:[6,9,14,15],
    11:[7,12,16,17], 12:[7,8,11,13,17,18], 13:[8,9,12,14,18,19], 14:[9,10,13,15,19,20], 15:[10,14,20,21],
    16:[11,17,22,23], 17:[11,12,16,18,23,24], 18:[12,13,17,19,24,25], 19:[13,14,18,20,25,26], 20:[14,15,19,21,26,27], 21:[15,20,27,28],
    22:[16,23], 23:[16,17,22,24], 24:[17,18,23,25], 25:[18,19,24,26], 26:[19,20,25,27], 27:[20,21,26,28], 28:[21,27]
};

// ==========================================
// KLÍČOVÉ FUNKCE (RESTART, INIT, MÍCHÁNÍ)
// ==========================================

// Pomocná funkce: Náhodné míchání pole (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Inicializace po načtení stránky
window.onload = () => {
    initGame();
    // Zamkneme desku na začátku (vizuálně)
    const boardEl = document.getElementById("game-board");
    if(boardEl) boardEl.classList.add("board-locked");
};

function initGame() {
    drawBoard();
    updateStatus();
}

// --- FUNKCE PRO PLNÝ RESTART HRY ---
function startNewRound() {
    // 1. Pojistka
    if(!confirm("Opravdu chcete restartovat celou hru? Herní pole bude vyčištěno a otázky obnoveny.")) return;

    // 2. Reset logiky
    board = Array(29).fill(0); 
    currentPlayer = 1;

    // 3. Reset grafiky (Hrubá síla - odstraníme třídy barev)
    const hexes = document.querySelectorAll('.hex');
    hexes.forEach(hex => {
        hex.classList.remove('player1', 'player2', 'black-active'); // Odpovídá třídám v createHex
        // Pro jistotu, kdyby tam byly staré názvy
        hex.classList.remove('orange', 'blue', 'black'); 
    });

    // 4. Obnovení a zamíchání otázek ze zálohy
    if (dbMain.length > 0) {
        questions = shuffleArray([...dbMain]); 
        spares = shuffleArray([...dbSpare]);
        cyberSpeak("Restart systému. Otázky byly promíchány.");
    } else {
        questions = [];
        spares = [];
        cyberSpeak("Systém restartován. Zásobník je prázdný.");
    }

    // 5. Reset oken a časovačů
    document.getElementById("modal-overlay").style.display = "none";
    document.getElementById("victory-overlay").style.display = "none";
    document.getElementById("datacenter-overlay").style.display = "none";
    
    if (timerInterval) clearInterval(timerInterval);
    const timerEl = document.getElementById("timer");
    if(timerEl) timerEl.textContent = "";

    // 6. Update status panelu
    updateStatus();
}

// ==========================================
// VYKRESLOVÁNÍ A OVLÁDÁNÍ DESKY
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
    g.setAttribute("class", "hex-group");

    // Body pro hexagon
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (i * 60 - 30) * Math.PI / 180;
        points.push(`${x + 35 * Math.cos(angle)},${y + 35 * Math.sin(angle)}`);
    }

    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", points.join(" "));
    poly.setAttribute("class", "hex"); // Základní třída
    
    // Aplikace barev podle stavu pole
    if(board[id] === 1) {
        poly.classList.add("player1"); // Oranžová
    } else if(board[id] === 2) {
        poly.classList.add("player2"); // Modrá
    } else if(board[id] === 3) {
        poly.classList.add("black-active"); // Černá
    }

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
    const isFree = board[id] === 0;
    const isBlack = board[id] === 3;

    if (!isGameReady) return;
    // Kliknout jde jen na prázdné nebo černé pole
    if (!isFree && !isBlack) return; 

    // Kontrola zásobníků
    if (isFree && questions.length === 0) { alert("Došly základní otázky!"); return; }
    if (isBlack && spares.length === 0) { alert("Došly náhradní otázky (ANO/NE)!"); return; }

    currentField = id;
    let qObj;
    let isSpare = false;

    // Rozhodnutí o typu otázky
    if (isBlack) {
        qObj = spares.pop();
        isSpare = true; 
    } else {
        qObj = questions.pop();
        isSpare = false;
    }

    showModal(qObj.q, qObj.a, isSpare);
    updateStatus();
}

// ==========================================
// MODÁLNÍ OKNO OTÁZEK A ČASOVAČ
// ==========================================

function showModal(q, a, isSpare = false) {
    document.getElementById("question-text").textContent = q;
    document.getElementById("correct-answer").textContent = a;
    
    const overlay = document.getElementById("modal-overlay");
    overlay.style.display = "flex";
    document.getElementById("btn-reveal").style.display = "inline-block";
    document.getElementById("answer-wrapper").style.display = "none";
    
    startTimer();
    
    const labelEl = document.getElementById("question-label");

    if (isSpare) {
        if(labelEl) labelEl.textContent = "// ROZSTŘEL (ANO/NE) //";
        if(labelEl) labelEl.style.color = "#ff3f34";
        cyberSpeak("Černé pole. Otázka Ano nebo Ne: " + q);
    } else {
        if(labelEl) labelEl.textContent = "// PŘÍCHOZÍ DATA //";
        if(labelEl) labelEl.style.color = "var(--neon-blue)";

        const prefixes = ["Příchozí data.", "Otázka zní:", "Analyzujte zadání:", "Pozor, dotaz:", ""];
        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        cyberSpeak(randomPrefix + " " + q);
    }
}

function startTimer() {
    let t = 20; 
    const el = document.getElementById("timer");
    if(el) el.textContent = t;
    
    clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        t--;
        if(el) el.textContent = t;
        
        if(t <= 0) {
            clearInterval(timerInterval);
            revealAnswer(); // Auto odhalení
        }
    }, 1000);
}

function revealAnswer() {
    document.getElementById("btn-reveal").style.display = "none";
    const ansWrapper = document.getElementById("answer-wrapper");
    ansWrapper.style.display = "block";
    
    clearInterval(timerInterval);

    const answerEl = document.getElementById("correct-answer");
    animateDecode(answerEl); // Efekt

    const answerText = answerEl.textContent;
    const ansPrefixes = ["Správná odpověď je:", "Řešení:", "Výsledek:", ""];
    const rnd = ansPrefixes[Math.floor(Math.random() * ansPrefixes.length)];
    
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
        board[currentField] = 3; // Černé pole
    }
    
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    drawBoard();
    updateStatus();
}

// ==========================================
// VÝHERNÍ LOGIKA (BFS)
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
    cyberSpeak("Bitva ukončena. Vítězí " + wName);
}

// ==========================================
// DATOVÉ CENTRUM & SPRÁVA OTÁZEK
// ==========================================

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

// Import XML a míchání
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
        
        // ZAMÍCHÁNÍ (aby nešly popořadě jako v XML)
        questions = shuffleArray(newMain);
        spares = shuffleArray(newSpare);
        
        // Uložení zálohy
        dbMain = [...questions]; 
        dbSpare = [...spares];
        
        checkIntegrity(); 
        cyberSpeak("Data importována a promíchána.");
    };
    r.readAsText(f);
}

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

// ==========================================
// VIZUÁLNÍ EFEKTY A UPDATE STATUSU
// ==========================================

function updateStatus() {
    const pName = currentPlayer === 1 ? "ORANŽOVÍ" : "MODŘÍ";
    const pColor = currentPlayer === 1 ? "#ff8800" : "#00aaff";
    
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
    
    // Status zásobníku
    const deckInfo = document.getElementById("deck-info");
    if (deckInfo) {
        if (questions.length > 0) {
            deckInfo.textContent = `ZÁSOBNÍK: ${questions.length} | ROZSTŘEL: ${spares.length}`;
            deckInfo.style.color = "#2ecc71"; 
            deckInfo.style.textShadow = "0 0 10px rgba(46, 204, 113, 0.5)";
        } else {
            deckInfo.textContent = "Čekám na data...";
            deckInfo.style.color = "#95a5a6"; 
            deckInfo.style.textShadow = "none";
        }
    }
}

function animateDecode(element) {
    const originalText = element.textContent;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+-=[]{}|;':,./<>?";
    let iteration = 0;
    let interval = null;
    
    clearInterval(interval);
    
    interval = setInterval(() => {
        element.textContent = originalText
            .split("")
            .map((letter, index) => {
                if(index < iteration) return originalText[index];
                if(originalText[index] === ' ') return ' ';
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");
        
        if(iteration >= originalText.length){ 
            clearInterval(interval);
            element.textContent = originalText; 
        }
        iteration += 1 / 2; 
    }, 30); 
}

// ==========================================
// VOICE & AUDIO SYSTEM
// ==========================================
let availableVoices = [];
window.speechSynthesis.onvoiceschanged = () => {
    availableVoices = window.speechSynthesis.getVoices();
};

function cyberSpeak(text) {
    if (!voiceEnabled) return;
    window.speechSynthesis.cancel();
    if (availableVoices.length === 0) availableVoices = window.speechSynthesis.getVoices();

    const msg = new SpeechSynthesisUtterance();
    msg.text = text;
    msg.volume = 1; 
    msg.rate = 1.1; 
    msg.pitch = 0.8; 

    const csVoice = availableVoices.find(v => v.lang.includes('cs') || v.lang.includes('cz'));
    if (csVoice) msg.voice = csVoice;
    else msg.lang = 'cs-CZ';

    window.speechSynthesis.speak(msg);
}

function toggleVoice() {
    voiceEnabled = !voiceEnabled;
    const btn = document.getElementById("btn-voice");
    
    if(voiceEnabled) {
        btn.innerHTML = '<span class="btn-icon">🔊</span> Hlas: ZAP';
        btn.style.borderBottomColor = "#2ecc71";
        cyberSpeak("Hlasový modul aktivován.");
    } else {
        window.speechSynthesis.cancel();
        btn.innerHTML = '<span class="btn-icon">🔇</span> Hlas: VYP';
        btn.style.borderBottomColor = "#e74c3c";
    }
}

// ==========================================
// MATRIX POZADÍ
// ==========================================
const canvas = document.getElementById('matrix-bg');
if(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*()_+=-{}[]|;:,.<>?/CYBERARENA";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops = [];
    for (let x = 0; x < columns; x++) drops[x] = 1;

    function drawMatrix() {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#0F0"; // Zelený matrix
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < drops.length; i++) {
            const text = chars.charAt(Math.floor(Math.random() * chars.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }
    setInterval(drawMatrix, 33);
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
}
