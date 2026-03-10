// ==========================================
// BEZPEČNOSTNÍ VRSTVA (XSS OCHRANA)
// ==========================================
function sanitize(str) {
    if (!str) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        "/": '&#x2F;'
    };
    const reg = /[&<>"'/]/ig;
    return str.replace(reg, (match) => (map[match]));
}

const KNIHY_DB = [
    { id: 1, dilo: "Ilias", autor: "Homér", druh: "epika", obdobi: "do18" },
    { id: 2, dilo: "Romeo a Julie", autor: "William Shakespeare", druh: "drama", obdobi: "do18" },
    { id: 3, dilo: "Kytice", autor: "Karel Jaromír Erben", druh: "lyrika", obdobi: "19" },
    { id: 4, dilo: "Máj", autor: "Karel Hynek Mácha", druh: "lyrika", obdobi: "19" },
    { id: 5, dilo: "Povídky malostranské", autor: "Jan Neruda", druh: "epika", obdobi: "19" },
    { id: 6, dilo: "Oliver Twist", autor: "Charles Dickens", druh: "epika", obdobi: "19" },
    { id: 7, dilo: "Slezské písně", autor: "Petr Bezruč", druh: "lyrika", obdobi: "cz20" },
    { id: 8, dilo: "Krysař", autor: "Viktor Dyk", druh: "epika", obdobi: "cz20" },
    { id: 9, dilo: "R. U. R.", autor: "Karel Čapek", druh: "drama", obdobi: "cz20" },
    { id: 10, dilo: "Osudy dobrého vojáka Švejka", autor: "Jaroslav Hašek", druh: "epika", obdobi: "cz20" },
    { id: 11, dilo: "Proměna", autor: "Franz Kafka", druh: "epika", obdobi: "svet20" },
    { id: 12, dilo: "Na západní frontě klid", autor: "Erich Maria Remarque", druh: "epika", obdobi: "svet20" },
    { id: 13, dilo: "Stařec a moře", autor: "Ernest Hemingway", druh: "epika", obdobi: "svet20" },
    { id: 14, dilo: "Spalovač mrtvol", autor: "Ladislav Fuks", druh: "epika", obdobi: "cz20" },
    { id: 15, dilo: "Vyšetřování ztráty třídní knihy", autor: "Smoljak, Svěrák", druh: "drama", obdobi: "cz20" },
    { id: 16, dilo: "Píseň o Viktorce", autor: "Jaroslav Seifert", druh: "lyrika", obdobi: "cz20" },
    { id: 17, dilo: "Smrt je mým řemeslem", autor: "Robert Merle", druh: "epika", obdobi: "svet20" },
    { id: 18, dilo: "Farma zvířat", autor: "George Orwell", druh: "epika", obdobi: "svet20" },
    { id: 19, dilo: "Ostře sledované vlaky", autor: "Bohumil Hrabal", druh: "epika", obdobi: "cz20" },
    { id: 20, dilo: "Báječná léta pod psa", autor: "Michal Viewegh", druh: "epika", obdobi: "cz20" },
    { id: 21, dilo: "Král Oidipus", autor: "Sofokles", druh: "drama", obdobi: "do18" },
    { id: 22, dilo: "Bible pro děti", autor: "Hadaway, Atcheson", druh: "epika", obdobi: "do18" },
    { id: 23, dilo: "Lakomec", autor: "Moliére", druh: "drama", obdobi: "do18" },
    { id: 24, dilo: "Revizor", autor: "Nikolaj V. Gogol", druh: "drama", obdobi: "19" },
    { id: 25, dilo: "Tyrolské elegie", autor: "Karel Havlíček Borovský", druh: "lyrika", obdobi: "19" },
    { id: 26, dilo: "Jáma a kyvadlo", autor: "Edgar Allan Poe", druh: "epika", obdobi: "19" },
    { id: 27, dilo: "O myších a lidech", autor: "John Steinbeck", druh: "epika", obdobi: "svet20" },
    { id: 28, dilo: "Rozmarné léto", autor: "Vladislav Vančura", druh: "epika", obdobi: "cz20" },
    { id: 29, dilo: "Válka s mloky", autor: "Karel Čapek", druh: "epika", obdobi: "cz20" },
    { id: 30, dilo: "451 stupňů Fahrenheita", autor: "Ray Bradbury", druh: "epika", obdobi: "svet20" },
    { id: 31, dilo: "Audience", autor: "Václav Havel", druh: "drama", obdobi: "cz20" },
    { id: 32, dilo: "Kníška", autor: "Karel Kryl", druh: "lyrika", obdobi: "cz20" },
    { id: 33, dilo: "Zbabělci", autor: "Josef Škvorecký", druh: "epika", obdobi: "cz20" },
    { id: 34, dilo: "Žert", autor: "Milan Kundera", druh: "epika", obdobi: "cz20" },
    { id: 35, dilo: "Chrám Matky Boží v Paříži", autor: "Victor Hugo", druh: "epika", obdobi: "19" },
    { id: 36, dilo: "Robinson Crusoe", autor: "Daniel Defoe", druh: "epika", obdobi: "do18" },
    { id: 37, dilo: "Malý princ", autor: "Antoine de Saint-Exupéry", druh: "epika", obdobi: "svet20" },
    { id: 38, dilo: "Němá barikáda", autor: "Jan Drda", druh: "epika", obdobi: "cz20" },
    { id: 39, dilo: "Smrt krásných srnců", autor: "Ota Pavel", druh: "epika", obdobi: "cz20" },
    { id: 40, dilo: "Misery", autor: "Stephen King", druh: "epika", obdobi: "svet20" },
    { id: 41, dilo: "Společenstvo Prstenu", autor: "J.R.R. Tolkien", druh: "epika", obdobi: "svet20" },
    { id: 42, dilo: "Občanský průkaz", autor: "Petr Šabach", druh: "epika", obdobi: "cz20" },
    { id: 43, dilo: "Den trifidů", autor: "John Wyndham", druh: "epika", obdobi: "svet20" },
    { id: 44, dilo: "Edison", autor: "Vítězslav Nezval", druh: "lyrika", obdobi: "cz20" },
    { id: 45, dilo: "Zkrocení zlé ženy", autor: "William Shakespeare", druh: "drama", obdobi: "do18" },
    { id: 46, dilo: "Strakonický dudák", autor: "Josef Kajetán Tyl", druh: "drama", obdobi: "19" },
    { id: 47, dilo: "Babička", autor: "Božena Němcová", druh: "epika", obdobi: "19" },
    { id: 48, dilo: "Balady a romance", autor: "Jan Neruda", druh: "lyrika", obdobi: "19" },
    { id: 49, dilo: "Nový epochální výlet pana Broučka", autor: "Svatopluk Čech", druh: "epika", obdobi: "19" },
    { id: 50, dilo: "Bylo nás pět", autor: "Karel Poláček", druh: "epika", obdobi: "cz20" },
    { id: 51, dilo: "Maryša", autor: "Alois a Vilém Mrštíkové", druh: "drama", obdobi: "19" },
    { id: 52, dilo: "Nikola Šuhaj loupežník", autor: "Ivan Olbracht", druh: "epika", obdobi: "cz20" },
    { id: 53, dilo: "Saturnin", autor: "Zdeněk Jirotka", druh: "epika", obdobi: "cz20" },
    { id: 54, dilo: "České nebe", autor: "Smoljak, Svěrák", druh: "drama", obdobi: "cz20" },
    { id: 55, dilo: "Postřižiny", autor: "Bohumil Hrabal", druh: "epika", obdobi: "cz20" },
    { id: 56, dilo: "Hana", autor: "Alena Mornštajnová", druh: "epika", obdobi: "cz20" },
    { id: 57, dilo: "Tankový prapor", autor: "Josef Škvorecký", druh: "epika", obdobi: "cz20" },
    { id: 58, dilo: "Memento", autor: "Radek John", druh: "epika", obdobi: "cz20" },
    { id: 59, dilo: "Jeden den Ivana Děnisoviče", autor: "Alexandr Solženicyn", druh: "epika", obdobi: "svet20" },
    { id: 60, dilo: "Alchymista", autor: "Paulo Coelho", druh: "epika", obdobi: "svet20" },
    { id: 61, dilo: "Tartuffe", autor: "Moliére", druh: "drama", obdobi: "do18" },
    { id: 62, dilo: "Modlitba pro K. Horovitzovou", autor: "Arnošt Lustig", druh: "epika", obdobi: "cz20" },
    { id: 63, dilo: "Pes baskervillský", autor: "Arthur Conan Doyle", druh: "epika", obdobi: "svet20" },
    { id: 64, dilo: "Vražda v Orient-expresu", autor: "Agatha Christie", druh: "epika", obdobi: "svet20" },
    { id: 65, dilo: "Velký Gatsby", autor: "Francis Scott Fitzgerald", druh: "epika", obdobi: "svet20" },
    { id: 66, dilo: "Pýcha a předsudek", autor: "Jane Austenová", druh: "epika", obdobi: "19" }
];

const MAPA_OBDOBI = { "do18": "Do konce 18. st.", "19": "19. století", "cz20": "ČR 20. a 21. st.", "svet20": "Svět 20. a 21. st." };
const REQUIREMENTS = { do18: 2, "19": 3, svet20: 4, cz20: 5, lyrika: 2, epika: 2, drama: 2 };
const STORAGE_KEY = 'kanon_selekce_state';

const state = { 
    selectedIds: new Set(), 
    filters: { obdobi: null, druh: null }, 
    searchQuery: "",
    student: { name: "", dob: "", klasa: "", year: "" }
};

const elements = {
    tableBody: document.getElementById('table-body'),
    searchBox: document.getElementById('search-box'),
    btnReset: document.getElementById('btn-reset'),
    btnClear: document.getElementById('btn-clear'),
    btnExport: document.getElementById('btn-export'),
    statTotal: document.getElementById('stat-total'),
    myList: document.getElementById('my-list'),
    btnScrollTop: document.getElementById('btn-scroll-top'),
    inputName: document.getElementById('student-name'),
    inputDob: document.getElementById('student-dob'),
    inputClass: document.getElementById('student-class'),
    inputYear: document.getElementById('student-year')
};

// ==========================================
// STATELESS TRANSFER A NOTIFIKACE
// ==========================================

let currentShareUrl = "";

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

window.generateShareLink = function() {
    if (state.selectedIds.size === 0) {
        showToast("⚠️ Vyberte alespoň jednu knihu pro sdílení.");
        return;
    }
    
    // Sort zajišťuje deterministické URL (vždy stejný odkaz pro stejné knihy)
    const ids = Array.from(state.selectedIds).sort((a, b) => a - b).join('-');
    const baseUrl = window.location.origin + window.location.pathname;
    currentShareUrl = `${baseUrl}?p=${ids}`;

    document.getElementById("share-modal").style.display = "flex";

    const qrBox = document.getElementById("qr-code-box");
    qrBox.innerHTML = ""; 
    
    // Generování ve vysokém rozlišení s vyšší redundancí chyb (Level M)
    new QRCode(qrBox, {
        text: currentShareUrl,
        width: 400, 
        height: 400,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.M 
    });
};

window.closeShareModal = function() {
    document.getElementById("share-modal").style.display = "none";
};

window.copyShareUrl = function() {
    navigator.clipboard.writeText(currentShareUrl).then(() => {
        showToast("✅ Odkaz zkopírován do schránky");
        closeShareModal();
    }).catch(err => {
        console.error("Schránka selhala: ", err);
        showToast("❌ Chyba při kopírování");
    });
};

window.downloadQR = function() {
    const qrCanvas = document.querySelector("#qr-code-box canvas");
    if (!qrCanvas) {
        showToast("⚠️ QR kód se ještě nevygeneroval.");
        return;
    }
    
    // Vytvoříme kompozitní plátno pro vpečení bílého okraje (Quiet Zone)
    const padding = 40; // Ochranná zóna 40px
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = qrCanvas.width + (padding * 2);
    exportCanvas.height = qrCanvas.height + (padding * 2);
    
    const ctx = exportCanvas.getContext("2d");
    
    // Krok 1: Vylití absolutní bílou
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    
    // Krok 2: Vložení surového QR kódu doprostřed
    ctx.drawImage(qrCanvas, padding, padding);
    
    // Krok 3: Export kompozitu
    const imgData = exportCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = imgData;
    a.download = "maturita-vyber-qr.png";
    a.click();
    
    showToast("⬇️ Stahování zahájeno");
};

function loadStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    const payload = params.get('p');
    
    if (payload) {
        const ids = payload.split('-').map(Number);
        let loadedCount = 0;
        
        ids.forEach(id => {
            if (KNIHY_DB.some(k => k.id === id)) {
                state.selectedIds.add(id);
                loadedCount++;
            }
        });

        window.history.replaceState({}, document.title, window.location.pathname);
        
        if (loadedCount > 0) {
            setTimeout(() => {
                showToast(`✅ Úspěšně načteno ${loadedCount} knih ze sdíleného odkazu.`);
            }, 500);
        }
    }
}

// ======= LOCAL STORAGE: SERIALIZACE A DESERIALIZACE =======
function saveState() {
    const stateToSave = {
        selectedIds: Array.from(state.selectedIds),
        filters: state.filters,
        student: state.student
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
}

function loadState() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (Array.isArray(parsed.selectedIds)) {
                state.selectedIds = new Set(parsed.selectedIds.map(Number));
            }
            if (parsed.filters) state.filters = parsed.filters;
            if (parsed.student) {
                state.student = parsed.student;
                elements.inputName.value = state.student.name || "";
                elements.inputDob.value = state.student.dob || "";
                elements.inputClass.value = state.student.klasa || "";
                elements.inputYear.value = state.student.year || "";
            }
        } catch (error) {
            localStorage.removeItem(STORAGE_KEY);
        }
    }
}

[
    { el: elements.inputName, key: 'name' },
    { el: elements.inputDob, key: 'dob' },
    { el: elements.inputClass, key: 'klasa' },
    { el: elements.inputYear, key: 'year' }
].forEach(bind => {
    bind.el.addEventListener('input', (e) => {
        state.student[bind.key] = e.target.value;
        saveState();
    });
});

// ======= NATIVNÍ TAB FOCUS TRAP =======
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== elements.searchBox) {
        if (document.activeElement.tagName === 'INPUT') return; 
        e.preventDefault();
        elements.searchBox.focus();
        return;
    }

    if (e.key === 'Tab') {
        const focusable = Array.from(document.querySelectorAll(
            'input, .accordion-summary, #table-body tr[tabindex="0"], .sidebar button:not([disabled])'
        )).filter(el => el !== null && (el.offsetWidth > 0 || el.offsetHeight > 0));

        if (focusable.length === 0) return;

        const firstEl = focusable[0];
        const lastEl = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
        }
    }
});

function renderTable() {
    const q = state.searchQuery.toLowerCase();
    const filtered = KNIHY_DB.filter(kniha => {
        if (state.filters.obdobi && state.filters.obdobi !== kniha.obdobi) return false;
        if (state.filters.druh && state.filters.druh !== kniha.druh) return false;
        if (q && !(kniha.dilo.toLowerCase().includes(q) || kniha.autor.toLowerCase().includes(q))) return false;
        return true;
    });

    elements.tableBody.innerHTML = filtered.map((kniha, index) => {
        const isSelected = state.selectedIds.has(kniha.id);
        const tIndex = index === 0 ? "0" : "-1";
        return `
            <tr data-id="${kniha.id}" class="${isSelected ? 'selected' : ''}" tabindex="${tIndex}">
                <td>${kniha.id}</td>
                <td>${isSelected ? '✔ ' : ''}${kniha.dilo}</td>
                <td>${kniha.autor}</td>
                <td>${kniha.druh}</td>
                <td>${MAPA_OBDOBI[kniha.obdobi]}</td>
            </tr>
        `;
    }).join('');
}

function updateStatsAndSidebar() {
    const stats = { do18: 0, "19": 0, svet20: 0, cz20: 0, lyrika: 0, epika: 0, drama: 0 };
    
    state.selectedIds.forEach(id => {
        const kniha = KNIHY_DB.find(k => k.id === id);
        if (kniha) {
            stats[kniha.obdobi]++; 
            stats[kniha.druh]++;
        } else {
            state.selectedIds.delete(id);
        }
    });

    const total = state.selectedIds.size;
    let isFullyValid = total === 20;
    
    for (const key in REQUIREMENTS) {
        if ((stats[key] || 0) < REQUIREMENTS[key]) {
            isFullyValid = false;
            break;
        }
    }

    elements.statTotal.textContent = total;
    
    const box = document.getElementById('stat-total-container');
    if (isFullyValid) {
        box.style.borderColor = "var(--accent-green)";
    } else if (total === 20) {
        box.style.borderColor = "var(--accent-red)";
    } else {
        box.style.borderColor = "var(--border)";
    }

    if (isFullyValid) {
        elements.btnExport.removeAttribute('disabled');
    } else {
        elements.btnExport.setAttribute('disabled', 'true');
    }

    document.querySelectorAll('.filter-btn').forEach(btn => {
        const type = btn.parentElement.dataset.type;
        const val = btn.dataset.val;
        if (state.filters[type] === val) btn.classList.add('active');
        else btn.classList.remove('active');

        const badge = btn.querySelector('.badge');
        const current = stats[val] || 0;
        const req = REQUIREMENTS[val];
        badge.textContent = `${current}/${req}`;
        badge.className = `badge ${current >= req ? 'ok' : 'fail'}`;
    });

    if (total === 0) {
        elements.myList.innerHTML = "<em>Zatím prázdno...</em>";
    } else {
        const sortedSelected = Array.from(state.selectedIds)
            .map(id => KNIHY_DB.find(k => k.id === id))
            .sort((a, b) => a.id - b.id);
        
        elements.myList.innerHTML = sortedSelected.map(k => 
            `<div class="selected-item">
                <div class="selected-item-info">
                    <strong>${k.id}. ${k.dilo}</strong>
                    <small>${k.autor}</small>
                </div>
                <button type="button" class="remove-btn" data-id="${k.id}" aria-label="Odstranit">×</button>
            </div>`
        ).join('');
    }
}

window.toggleBook = function(id) {
    if (state.selectedIds.has(id)) {
        state.selectedIds.delete(id);
    } else {
        if (state.selectedIds.size >= 20) {
            showToast("⚠️ Kapacita naplněna (20). Odstraňte některé dílo.");
            return;
        }
        state.selectedIds.add(id);
    }
    
    const focusedRow = document.activeElement;
    const focusedId = focusedRow && focusedRow.tagName === 'TR' ? focusedRow.dataset.id : null;
    
    renderTable();
    updateStatsAndSidebar();
    saveState(); 

    if (focusedId) {
        const rows = Array.from(elements.tableBody.querySelectorAll('tr'));
        rows.forEach(r => r.setAttribute('tabindex', '-1'));
        const rowToFocus = elements.tableBody.querySelector(`tr[data-id="${focusedId}"]`);
        if (rowToFocus) {
            rowToFocus.setAttribute('tabindex', '0');
            rowToFocus.focus();
        } else if (rows.length > 0) {
            rows[0].setAttribute('tabindex', '0');
        }
    }
}

elements.myList.addEventListener('click', (e) => {
    const btn = e.target.closest('.remove-btn');
    if (btn) toggleBook(parseInt(btn.dataset.id, 10));
});

elements.tableBody.addEventListener('click', (e) => {
    const tr = e.target.closest('tr');
    if (tr) toggleBook(parseInt(tr.dataset.id, 10));
});

elements.tableBody.addEventListener('keydown', (e) => {
    const currentTr = e.target.closest('tr');
    if (!currentTr) return;

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        const nextTr = currentTr.nextElementSibling;
        if (nextTr) {
            currentTr.setAttribute('tabindex', '-1');
            currentTr.setAttribute('tabindex', '0');
            nextTr.focus();
            nextTr.scrollIntoView({ block: 'nearest' });
        }
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevTr = currentTr.previousElementSibling;
        if (prevTr) {
            currentTr.setAttribute('tabindex', '-1');
            currentTr.setAttribute('tabindex', '0');
            prevTr.focus();
            prevTr.scrollIntoView({ block: 'nearest' });
        }
    } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleBook(parseInt(currentTr.dataset.id, 10));
    }
});

elements.searchBox.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderTable();
});

elements.searchBox.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        state.searchQuery = "";
        elements.searchBox.value = "";
        renderTable();
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const firstRow = elements.tableBody.querySelector('tr');
        if (firstRow) firstRow.focus();
    }
});

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.parentElement.dataset.type;
        const val = btn.dataset.val;
        state.filters[type] = (state.filters[type] === val) ? null : val;
        renderTable();
        updateStatsAndSidebar();
        saveState(); 
    });
});

elements.btnReset.addEventListener('click', () => {
    state.filters = { obdobi: null, druh: null };
    state.searchQuery = "";
    elements.searchBox.value = "";
    renderTable();
    updateStatsAndSidebar();
    saveState(); 
});

elements.btnClear.addEventListener('click', () => {
    if (confirm("Opravdu chceš vymazat celý seznam? (Osobní údaje zůstanou zachovány)")) {
        state.selectedIds.clear();
        renderTable();
        updateStatsAndSidebar();
        saveState(); 
    }
});

// ======= 1:1 GENERÁTOR PDF S XSS SANITIZACÍ =======
elements.btnExport.addEventListener('click', () => {
    if (elements.btnExport.disabled) return;

    const selectedBooks = Array.from(state.selectedIds)
        .map(id => KNIHY_DB.find(k => k.id === id))
        .sort((a, b) => a.id - b.id);

    const buckets = { do18: [], "19": [], svet20: [], cz20: [], dalsi: [] };
    const limits = { do18: 2, "19": 3, svet20: 4, cz20: 5 };
    const counts = { do18: 0, "19": 0, svet20: 0, cz20: 0 };

    selectedBooks.forEach(k => {
        if (counts[k.obdobi] < limits[k.obdobi]) {
            buckets[k.obdobi].push(k);
            counts[k.obdobi]++;
        } else {
            buckets.dalsi.push(k);
        }
    });

    let counter = 1; 

    const renderRows = (books) => {
        return books.map(k => `
            <tr>
                <td class="col-c">${counter++}.</td>
                <td class="col-cs">${k.id}</td>
                <td class="col-autor">${k.autor}</td>
                <td class="col-nazev">${k.dilo}</td>
            </tr>
        `).join('');
    };

    const printHtml = `
        <table class="official-table">
            <colgroup>
                <col style="width: 5%;">
                <col style="width: 5%;">
                <col style="width: 40%;">
                <col style="width: 50%;">
            </colgroup>
            <tbody>
                <tr>
                    <td colspan="4" class="title-cell">
                        <table class="header-layout">
                            <tr>
                                <td class="header-logo-col">
                                    <img src="spspb-logo-2000px.png" class="print-logo" alt="Znak SPŠ">
                                </td>
                                <td class="header-text-col">
                                    Střední průmyslová škola a Vyšší odborná škola Příbram II,Hrabákova 271<br>
                                    Seznam literárních děl: <strong>MATURITNÍ ZKOUŠKA Z ČJL - ústní část</strong>
                                </td>
                                <td class="header-spacer-col"></td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr><td colspan="3" class="info-label">jméno a příjmení:</td><td class="info-value">${sanitize(state.student.name)}</td></tr>
                <tr><td colspan="3" class="info-label">datum narození:</td><td class="info-value">${sanitize(state.student.dob)}</td></tr>
                <tr><td colspan="3" class="info-label">třída:</td><td class="info-value">${sanitize(state.student.klasa)}</td></tr>
                <tr><td colspan="3" class="info-label">školní rok:</td><td class="info-value">${sanitize(state.student.year)}</td></tr>

                <tr class="col-headers">
                    <td class="col-c">č.</td>
                    <td class="col-cs">č.s.</td>
                    <td class="col-autor">autor:</td>
                    <td class="col-nazev">název díla:</td>
                </tr>

                <tr class="subheader"><td colspan="4">Světová a česká literatura do konce 18.století</td></tr>
                ${renderRows(buckets.do18)}

                <tr class="subheader"><td colspan="4">Světová a česká literatura 19.století</td></tr>
                ${renderRows(buckets['19'])}

                <tr class="subheader"><td colspan="4">Světová literatura 20. a 21. století</td></tr>
                ${renderRows(buckets.svet20)}

                <tr class="subheader"><td colspan="4">Česká literatura 20. a 21. století</td></tr>
                ${renderRows(buckets.cz20)}

                <tr class="subheader"><td colspan="4">Další četba</td></tr>
                ${renderRows(buckets.dalsi)}

                <tr>
                    <td colspan="3" class="footer-cell">podpis:</td>
                    <td class="footer-cell">zkontroloval:</td>
                </tr>
            </tbody>
        </table>
    `;

    const printArea = document.getElementById('print-area');
    printArea.innerHTML = printHtml;

    const logoImg = printArea.querySelector('.print-logo');
    if (logoImg) {
        if (logoImg.complete) {
            window.print();
        } else {
            logoImg.onload = () => window.print();
            logoImg.onerror = () => {
                logoImg.style.display = 'none';
                window.print();
            };
        }
    } else {
        window.print();
    }
});

let deferredPrompt;
const installBtn = document.getElementById('btn-pwa-install');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.hidden = false;
});

if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            console.log('PWA: Aplikace byla nainstalována');
        }
        deferredPrompt = null;
        installBtn.hidden = true;
    });
}

window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.hidden = true;
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        elements.btnScrollTop?.classList.add('visible');
    } else {
        elements.btnScrollTop?.classList.remove('visible');
    }
}, { passive: true });

elements.btnScrollTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.onload = () => {
    loadState(); 
    loadStateFromURL(); 
    elements.searchBox.focus(); 
    renderTable(); 
    updateStatsAndSidebar();
};
