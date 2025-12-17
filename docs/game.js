let dbMain = [], dbSpare = [];
let questions = [], spares = [];
let board = Array(29).fill(0);
let currentPlayer = 1; // 1 = Oranžoví, 2 = Modří
let currentField = null;
let isGameReady = false;

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
    // 1. Určení barev a textů
    const pName = currentPlayer === 1 ? "ORANŽOVÍ" : "MODŘÍ";
    // Definice barev: Oranžová vs. Modrá
    const pColor = currentPlayer === 1 ? "#ff8800" : "#00aaff"; 
    
    // 2. Aktualizace textového indikátoru
    const indicator = document.getElementById("active-player-name");
    indicator.textContent = pName;
    indicator.style.color = pColor;
    indicator.style.textShadow = `0 0 20px ${pColor}`;
    indicator.style.borderColor = pColor;
    indicator.style.boxShadow = `0 0 15px ${pColor}, inset 0 0 10px ${pColor}`;

    // 3. DYNAMICKÁ ZMĚNA PRSTENCE (Energetické pole)
    const ring = document.querySelector(".board-energy-ring");
    if (ring) {
        // Toto přepíše proměnnou v CSS a kruh změní barvu
        ring.style.setProperty('--ring-color', pColor);
    }
    
    // 4. Aktualizace počítadla otázek
    const deckInfo = document.getElementById("deck-info");
    if (isGameReady) {
        deckInfo.innerText = `ZÁSOBNÍK: ${questions.length} | ROZSTŘEL: ${spares.length}`;
        deckInfo.style.color = pColor;
    }
}
function onFieldClick(id) {
    if(!isGameReady || board[id] !== 0) return;
    if(questions.length === 0) { alert("Došly otázky!"); return; }
    
    currentField = id;
    const q = questions.pop();
    showModal(q.q, q.a);
    updateStatus();
}

function showModal(q, a) {
    document.getElementById("question-text").textContent = q;
    document.getElementById("correct-answer").textContent = a;
    
    const overlay = document.getElementById("modal-overlay");
    overlay.style.display = "flex";
    
    document.getElementById("btn-reveal").style.display = "inline-block";
    document.getElementById("answer-wrapper").style.display = "none";
    
    startTimer();
}

let timerInterval;
function startTimer() {
    let t = 20;
    const el = document.getElementById("timer");
    el.textContent = t;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        t--;
        el.textContent = t;
        if(t <= 0) clearInterval(timerInterval);
    }, 1000);
}

function revealAnswer() {
    document.getElementById("btn-reveal").style.display = "none";
    document.getElementById("answer-wrapper").style.display = "block";
    clearInterval(timerInterval);
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
    
    // Reset modálu pro novou otázku
    document.getElementById("question-text").textContent = q.q;
    document.getElementById("correct-answer").textContent = q.a;
    document.getElementById("btn-reveal").style.display = "inline-block";
    document.getElementById("answer-wrapper").style.display = "none";
    startTimer();
    updateStatus();
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
}

// Inicializace po načtení
window.onload = () => {
    initGame();
    // Zamkneme desku na začátku (vizuálně)
    document.getElementById("game-board").classList.add("board-locked");
};

// --- FUNKCE PRO ZÁSOBNÍK (DALŠÍ KOLO) ---
function startNewRound() {
    // 1. Resetujeme pouze herní stav, ne data otázek
    board.fill(0); // Vymaže obsazení polí
    currentField = null;
    currentPlayer = 1; // Začínají opět Oranžoví
    
    // 2. Skryjeme vítěznou obrazovku
    document.getElementById("victory-overlay").style.display = "none";
    
    // 3. Překreslíme čistou desku
    drawBoard();
    updateStatus();
    
    // 4. Info pro tebe do konzole
    console.log(`Nové kolo zahájeno. V zásobníku zbývá: ${questions.length} otázek.`);
    alert("Nové kolo připraveno! Otázky ze zásobníku pokračují.");
}
