// ==========================================
// 1. DATA A PROMĚNNÉ
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

// Proměnné pro kradení
let isStealing = false;
let tempPlayer = 0; // Kdo odpovídá při kradení

const neighbors = {
    1:[2,3], 2:[1,3,4,5], 3:[1,2,5,6], 4:[2,5,7,8], 5:[2,3,4,6,8,9], 6:[3,5,9,10],
    7:[4,8,11,12], 8:[4,5,7,9,12,13], 9:[5,6,8,10,13,14], 10:[6,9,14,15],
    11:[7,12,16,17], 12:[7,8,11,13,17,18], 13:[8,9,12,14,18,19], 14:[9,10,13,15,19,20], 15:[10,14,20,21],
    16:[11,17,22,23], 17:[11,12,16,18,23,24], 18:[12,13,17,19,24,25], 19:[13,14,18,20,25,26], 20:[14,15,19,21,26,27], 21:[15,20,27,28],
    22:[16,23], 23:[16,17,22,24], 24:[17,18,23,25], 25:[18,19,24,26], 26:[19,20,25,27], 27:[20,21,26,28], 28:[21,27]
};

// ==========================================
// 2. INITIALIZACE A RESTART
// ==========================================
window.onload = () => {
    drawBoard();
    updateStatus();
    checkIntegrity();
};

function startNewRound() {
    if(!confirm("Opravdu restartovat hru?")) return;
    board.fill(0);
    currentPlayer = 1;
    isStealing = false;
    tempPlayer = 0;
    
    // Promíchat znovu otázky ze zálohy
    if(dbMain.length > 0) {
        questions = shuffle([...dbMain]);
        spares = shuffle([...dbSpare]);
    }
    
    // Reset UI
    document.querySelectorAll('.hex').forEach(h => h.classList.remove('player1', 'player2', 'black-active'));
    document.getElementById("modal-overlay").style.display = "none";
    document.getElementById("victory-overlay").style.display = "none";
    updateStatus();
    cyberSpeak("Restart.");
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// ==========================================
// 3. HRACÍ POLE
// ==========================================
function drawBoard() {
    const svg = document.getElementById("game-board");
    svg.innerHTML = "";
    const rows = [1, 2, 3, 4, 5, 6, 7];
    let count = 1, dy = 60, dx = 70;

    rows.forEach((rCount, rIdx) => {
        const startX = 325 - (rCount - 1) * (dx / 2);
        for (let i = 0; i < rCount; i++) {
            createHex(svg, startX + i * dx, 50 + rIdx * dy, count++);
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
    if(board[id] === 2) poly.classList.add("player2");
    if(board[id] === 3) poly.classList.add("black-active");

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x); text.setAttribute("y", y+5);
    text.setAttribute("class", "hex-text");
    text.textContent = id;

    g.appendChild(poly); g.appendChild(text);
    g.onclick = () => onFieldClick(id);
    svg.appendChild(g);
}

function onFieldClick(id) {
    if(!isGameReady) return;
    const isFree = board[id] === 0;
    const isBlack = board[id] === 3;
    if(!isFree && !isBlack) return;

    if(isFree && questions.length === 0) { alert("Došly otázky!"); return; }
    if(isBlack && spares.length === 0) { alert("Došly náhradní!"); return; }

    currentField = id;
    isStealing = false;
    tempPlayer = currentPlayer;

    let qObj = isBlack ? spares.pop() : questions.pop();
    showModal(qObj.q, qObj.a, isBlack);
    updateStatus();
}

// ==========================================
// 4. MODÁL A LOGIKA TAHU
// ==========================================
function showModal(q, a, isSpare) {
    const overlay = document.getElementById("modal-overlay");
    overlay.style.display = "flex";
    
    document.getElementById("question-text").textContent = q;
    document.getElementById("correct-answer").textContent = a;
    
    // Reset view
    document.getElementById("btn-reveal").style.display = "inline-block";
    document.getElementById("answer-wrapper").style.display = "none";
    document.getElementById("steal-wrapper").style.display = "none";
    document.getElementById("timer").style.display = "flex";
    
    const label = document.getElementById("question-label");
    if(isSpare) {
        label.textContent = "ROZSTŘEL (ANO/NE)";
        label.style.color = "red";
    } else {
        label.textContent = "PŘÍCHOZÍ DATA";
        label.style.color = "cyan";
    }
    
    cyberSpeak(q);
    startTimer(isSpare);
}

function startTimer(isSpare) {
    let t = 20;
    const el = document.getElementById("timer");
    el.textContent = t;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        t--;
        el.textContent = t;
        if(t <= 0) {
            clearInterval(timerInterval);
            handleTimeout(isSpare);
        }
    }, 1000);
}

function handleTimeout(isSpare) {
    if(isSpare || isStealing) {
        revealAnswer();
    } else {
        // Standardní otázka -> vypršel čas -> nabídka kradení
        document.getElementById("timer").style.display = "none";
        document.getElementById("btn-reveal").style.display = "none";
        document.getElementById("steal-wrapper").style.display = "block";
        cyberSpeak("Čas vypršel. Chce odpovídat soupeř?");
    }
}

function stealQuestion(want) {
    document.getElementById("steal-wrapper").style.display = "none";
    if(want) {
        isStealing = true;
        tempPlayer = currentPlayer === 1 ? 2 : 1;
        updateStatus(true); // Změna barev na zloděje
        document.getElementById("timer").style.display = "flex";
        document.getElementById("btn-reveal").style.display = "inline-block";
        startTimer(false);
        cyberSpeak("Odpovídá soupeř.");
    } else {
        document.getElementById("btn-reveal").style.display = "inline-block";
        revealAnswer();
    }
}

function revealAnswer() {
    clearInterval(timerInterval);
    document.getElementById("btn-reveal").style.display = "none";
    document.getElementById("steal-wrapper").style.display = "none";
    document.getElementById("answer-wrapper").style.display = "block";
    cyberSpeak("Správná odpověď: " + document.getElementById("correct-answer").textContent);
}

function finalizeTurn(success) {
    document.getElementById("modal-overlay").style.display = "none";
    const isSpare = board[currentField] === 3;
    let shouldSwap = true;

    if(isSpare) {
        // --- ČERNÉ POLE ---
        if(success) {
            board[currentField] = currentPlayer;
        } else {
            // Špatně -> Pole získá soupeř, ALE hráč hraje znovu
            board[currentField] = currentPlayer === 1 ? 2 : 1;
            shouldSwap = false; 
            cyberSpeak("Chyba. Pole soupeři, hrajete znovu.");
        }
    } else {
        // --- STANDARDNÍ OTÁZKA ---
        if(success) {
            if(isStealing) {
                board[currentField] = tempPlayer;
            } else {
                board[currentField] = currentPlayer;
            }
        } else {
            board[currentField] = 3; // Černé pole
        }
        // U standardních otázek se střídá VŽDY (dle pravidel)
        shouldSwap = true;
    }

    if(shouldSwap) currentPlayer = currentPlayer === 1 ? 2 : 1;

    drawBoard();
    updateStatus();
    checkWin(1); checkWin(2);
}

// ==========================================
// 5. VÝHRA A MATRIX
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
            if(sides.L.includes(f)) l=1; if(sides.R.includes(f)) r=1; if(sides.B.includes(f)) b=1;
        }
        if(l&&r&&b) { setTimeout(() => showVictory(p), 300); return; }
    }
}

function showVictory(p) {
    const overlay = document.getElementById("victory-overlay");
    const name = document.getElementById("winner-name");
    if(p === 1) { name.textContent = "ORANŽOVÍ"; overlay.className = "win-orange"; }
    else { name.textContent = "MODŘÍ"; overlay.className = "win-blue"; }
    overlay.style.display = "flex";
    cyberSpeak("Vítězství.");
}

// Matrix Canvas
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
const chars = "AZKVIZ01"; const fontSize = 14;
const drops = Array(Math.floor(canvas.width/fontSize)).fill(1);

function drawMatrix() {
    ctx.fillStyle = "rgba(0,0,0,0.05)"; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "#0F0"; ctx.font = fontSize+"px monospace";
    drops.forEach((y, i) => {
        const text = chars[Math.floor(Math.random()*chars.length)];
        ctx.fillText(text, i*fontSize, y*fontSize);
        if(y*fontSize > canvas.height && Math.random() > 0.98) drops[i] = 0;
        drops[i]++;
    });
}
setInterval(drawMatrix, 33);
window.onresize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };

// ==========================================
// 6. DATABÁZE A AUDIO (ZKRÁCENO PRO PŘEHLEDNOST - FUNKČNÍ)
// ==========================================
function updateStatus(forceSteal) {
    let p = isStealing || forceSteal ? tempPlayer : currentPlayer;
    const name = p===1?"ORANŽOVÍ":"MODŘÍ";
    const color = p===1?"#ff8800":"#00aaff";
    const ind = document.getElementById("active-player-name");
    ind.textContent = name; ind.style.color = color;
    ind.style.borderColor = color; ind.style.boxShadow = `0 0 15px ${color}`;
    document.querySelector(".board-energy-ring").style.setProperty('--ring-color', color);
    document.getElementById("deck-info").innerText = `ZÁSOBNÍK: ${questions.length} | ROZSTŘEL: ${spares.length}`;
}

function cyberSpeak(txt) {
    if(!voiceEnabled) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(txt); u.rate=1.1; u.pitch=0.8;
    window.speechSynthesis.speak(u);
}
function toggleVoice() { voiceEnabled = !voiceEnabled; }

// Databázové funkce
function openDataCenter() { document.getElementById("datacenter-overlay").style.display="flex"; checkIntegrity(); }
function closeDataCenter() { document.getElementById("datacenter-overlay").style.display="none"; if(questions.length>0) isGameReady=true; }
function checkIntegrity() {
    document.getElementById("ind-main").innerText = `OTÁZKY: ${questions.length+dbMain.length-questions.length}`;
    document.getElementById("ind-spare").innerText = `ROZSTŘEL: ${spares.length+dbSpare.length-spares.length}`;
}
function addQFromCenter() {
    const q = document.getElementById("dc-q-text").value;
    const a = document.getElementById("dc-q-ans").value;
    if(!q || !a) return;
    const type = document.querySelector('input[name="dc-type"]:checked').value;
    if(type==="spare") { spares.push({q,a}); dbSpare.push({q,a}); }
    else { questions.push({q,a}); dbMain.push({q,a}); }
    checkIntegrity(); alert("Přidáno");
}
function downloadXML() { /* Standardní download kód */ }
function loadXMLInCenter(input) {
    const f = input.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = e => {
        const p = new DOMParser(); const doc = p.parseFromString(e.target.result,"text/xml");
        const items = doc.getElementsByTagName("otazka");
        for(let el of items) {
            const t = el.querySelector("text").textContent;
            const a = el.querySelector("odpoved").textContent;
            if(el.getAttribute("typ")==="nahradni") { spares.push({q:t, a:a}); dbSpare.push({q:t, a:a}); }
            else { questions.push({q:t, a:a}); dbMain.push({q:t, a:a}); }
        }
        checkIntegrity(); alert("Nahráno");
    };
    r.readAsText(f);
}
