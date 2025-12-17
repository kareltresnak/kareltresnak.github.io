// --- STAV HRY A PROMĚNNÉ ---
// Výchozí pole jsou nyní prázdná - musí se nahrát
let dbMain = [];
let dbSpare = [];

let questions = [];
let spares = [];

// Stav herní plochy
// 0 = Volné, 1 = Oranž, 2 = Modrá, 3 = Černé
const board = new Array(29).fill(0);

let currentPlayer = 1; 
let currentField = null;
let timerInterval = null;
let timeLeft = 20;
let isGameReady = false; // Nová proměnná: Hra není připravena

const neighbors = [[],[2,3],[1,3,4,5],[1,2,5,6],[2,5,7,8],[2,3,4,6,8,9],[3,5,9,10],[4,8,11,12],[4,5,7,9,12,13],[5,6,8,10,13,14],[6,9,14,15],[7,12,16,17],[7,8,11,13,17,18],[8,9,12,14,18,19],[9,10,13,15,19,20],[10,14,20,21],[11,17,22,23],[11,12,16,18,23,24],[12,13,17,19,24,25],[13,14,18,20,25,26],[14,15,19,21,26,27],[15,20,27,28],[16,23],[16,17,22,24],[17,18,23,25],[18,19,24,26],[19,20,25,27],[20,21,26,28],[21,27]];

const svg = document.getElementById("game-board");
// Změna proměnné globálně pro celý dokument
document.documentElement.style.setProperty('--ring-color', pColor);
// --- INICIALIZACE ---
function initGame() {
    // Zamknout plochu při startu
    const boardEl = document.getElementById("game-board");
    boardEl.classList.add("board-locked");
    
    // Rozblikat tlačítko nahrát
    document.querySelector(".btn-file").classList.add("pulse-animation");
    
    // Nastavit status
    document.getElementById("deck-info").innerText = "⛔ ČEKÁM NA SOUBOR OTÁZEK";
    document.getElementById("deck-info").style.color = "#e74c3c";

    drawBoard();
    updateStatus();
}

// --- RENDEROVÁNÍ PLOCHY ---
function drawBoard() {
    svg.innerHTML = ''; 
    svg.innerHTML += '<defs><linearGradient id="grad-orange" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#f39c12"/><stop offset="100%" style="stop-color:#d35400"/></linearGradient><linearGradient id="grad-blue" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#3498db"/><stop offset="100%" style="stop-color:#2980b9"/></linearGradient></defs>';
    
    const r = 40; const h = Math.sqrt(3) * r;
    const startX = 325; const startY = 50;
    const structure = [[1], [2,3], [4,5,6], [7,8,9,10], [11,12,13,14,15], [16,17,18,19,20,21], [22,23,24,25,26,27,28]];

    structure.forEach((row, rIdx) => {
        const y = startY + (rIdx * h * 0.88);
        const rowWidth = row.length * h;
        const rowStartX = startX - (rowWidth / 2) + (h/2);
        row.forEach((id, cIdx) => {
            createHex(rowStartX + (cIdx * h), y, r, id);
        });
    });
}

function createHex(x, y, r, id) {
    let pts = "";
    for(let i=0; i<6; i++) {
        const angle = (60 * i - 30) * Math.PI / 180;
        pts += `${x + r * Math.cos(angle)},${y + r * Math.sin(angle)} `;
    }
    const hex = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    hex.setAttribute("points", pts);
    hex.setAttribute("class", "hex");
    
    const st = board[id];
    if(st === 1) hex.classList.add("player1");
    else if(st === 2) hex.classList.add("player2");
    else if(st === 3) hex.classList.add("black-active");

    hex.onclick = () => handleHexClick(id);

    const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txt.setAttribute("x", x); txt.setAttribute("y", y);
    txt.setAttribute("class", "hex-text");
    txt.setAttribute("dy", "0.35em");
    txt.textContent = id;

    svg.appendChild(hex);
    svg.appendChild(txt);
}

// --- LOGIKA KLIKNUTÍ ---
function handleHexClick(id) {
    // Pojistka: Pokud hra není ready, nic nedělej (i když CSS pointer-events to blokuje taky)
    if (!isGameReady) {
        alert("Nejdříve musíte nahrát soubor s otázkami!");
        return;
    }

    const st = board[id];
    
    if(st === 1 || st === 2) {
        alert("Toto pole je již obsazené!");
        return;
    }

    currentField = id;

    // Pokud nemáme otázky (což by se nemělo stát díky isGameReady, ale pro jistotu)
    if (questions.length === 0 && spares.length === 0) {
        alert("Došly otázky! Nahrajte nový soubor.");
        return;
    }

    // Černé pole -> Náhradní
    if (st === 3) {
        if(spares.length === 0) {
            // Pokud dojdou náhradní, recyklujeme
            spares = [...dbSpare].sort(()=>Math.random()-0.5);
        }
        showModal(spares.pop(), "ČERNÉ POLE (ANO / NE)");
    } else {
        // Bílé pole -> Hlavní
        if(questions.length === 0) {
             questions = [...dbMain].sort(()=>Math.random()-0.5);
        }
        showModal(questions.pop(), `Otázka o pole ${id}`);
    }
}

function loadSpareQuestion() {
    if (!isGameReady) return;
    if(spares.length === 0) spares = [...dbSpare].sort(()=>Math.random()-0.5);
    showModal(spares.pop(), "ČERNÉ POLE (ANO / NE)");
}

function showModal(qData, title) {
    const m = document.getElementById("modal-overlay");
    m.style.display = "flex";
    document.getElementById("question-label").textContent = title;
    document.getElementById("question-text").textContent = qData.q;
    document.getElementById("correct-answer").textContent = qData.a;
    
    document.getElementById("btn-reveal").style.display = "block";
    document.getElementById("answer-wrapper").style.display = "none";
    startTimer();
}

// --- ČASOVAČ ---
function startTimer() {
    timeLeft = 20;
    const t = document.getElementById("timer");
    t.textContent = timeLeft;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        t.textContent = timeLeft;
        if(timeLeft <= 0) {
            clearInterval(timerInterval);
            revealAnswer();
        }
    }, 1000);
}

function revealAnswer() {
    clearInterval(timerInterval);
    document.getElementById("btn-reveal").style.display = "none";
    document.getElementById("answer-wrapper").style.display = "block";
}

// --- VYHODNOCENÍ TAHU ---
function finalizeTurn(success) {
    document.getElementById("modal-overlay").style.display = "none";
    
    if (success) {
        board[currentField] = currentPlayer;
        checkWin(currentPlayer);
    } else {
        board[currentField] = 3;
    }

    currentPlayer = currentPlayer === 1 ? 2 : 1;
    drawBoard();
    updateStatus();
}

function updateStatus() {
    const pName = currentPlayer === 1 ? "ORANŽOVÍ" : "MODŘÍ";
    const pColor = currentPlayer === 1 ? "#ff8800" : "#00aaff"; 
    
    // 1. Jméno týmu
    const indicator = document.getElementById("active-player-name");
    indicator.textContent = pName;
    indicator.style.color = pColor;
    indicator.style.textShadow = `0 0 20px ${pColor}`;

    // 2. OPRAVA BARVY: Cílíme přímo na kontejner, který má definovanou proměnnou
    const ringElement = document.querySelector(".board-energy-ring");
    if (ringElement) {
        ringElement.style.setProperty('--ring-color', pColor);
    }

    // 3. POJISTKA ZOBRAZENÍ: Vynutíme zobrazení pole, pokud by náhodou zmizelo
    const boardEl = document.getElementById("game-board");
    if (boardEl) {
        boardEl.style.display = "block";
        boardEl.style.visibility = "visible";
        boardEl.style.opacity = "1";
    }
    
    const deckInfo = document.getElementById("deck-info");
    if (isGameReady) {
        deckInfo.innerText = `V ZÁSOBNÍKU: ${questions.length} | ROZSTŘEL: ${spares.length}`;
        deckInfo.style.color = pColor;
    }
}
// Funkce pro "Novou hru" z vítězné obrazovky (bez resetu otázek)
function startNewRound() {
    // Reset herního pole v paměti
    board.fill(0);
    currentField = null;
    currentPlayer = 1; // Začíná oranžový
    
    // Skrytí vítězné obrazovky
    document.getElementById("victory-overlay").style.display = "none";
    
    // Překreslení prázdné plochy
    drawBoard();
    updateStatus();
    
    console.log("Nové kolo spuštěno. Otázky v zásobníku zůstávají.");
}

// --- KONTROLA VÝHRY ---
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

// --- NAČÍTÁNÍ XML (ZDE SE ODEMYKÁ HRA) ---
function loadXML(input) {
    const f = input.files[0];
    if(!f) return;
    const r = new FileReader();
    r.onload = e => {
        const p = new DOMParser();
        const x = p.parseFromString(e.target.result, "text/xml");
        const n = x.getElementsByTagName("otazka");
        
        // Reset polí pro nová data
        const newMain = [];
        const newSpare = [];
        
        for(let el of n) {
            try {
                const t = el.getElementsByTagName("text")[0].textContent;
                const a = el.getElementsByTagName("odpoved")[0].textContent;
                const typ = el.getAttribute("typ");
                if(typ==="nahradni") newSpare.push({q:t, a:a}); else newMain.push({q:t, a:a});
            }catch(e){}
        }

        if (newMain.length === 0 && newSpare.length === 0) {
            alert("Chyba: V souboru nebyly nalezeny žádné otázky!");
            return;
        }

        // Uložení do globálních proměnných
        dbMain = [...newMain];
        dbSpare = [...newSpare];
        questions = [...dbMain].sort(()=>Math.random()-0.5);
        spares = [...dbSpare].sort(()=>Math.random()-0.5);

        // --- ODEMČENÍ HRY ---
        isGameReady = true;
        
        // Vizuální odemčení
        const boardEl = document.getElementById("game-board");
        boardEl.classList.remove("board-locked");
        boardEl.classList.add("board-active");

        // Zastavit blikání tlačítka
        document.querySelector(".btn-file").classList.remove("pulse-animation");
        drawBoard((;
        alert(`Úspěšně nahráno!\n${newMain.length} hlavních otázek\n${newSpare.length} náhradních otázek.\n\nHra začíná!`);
        updateStatus();
    };
    r.readAsText(f);
}

// Spuštění
initGame();
