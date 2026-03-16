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

const MAPA_OBDOBI = { "do18": "Do konce 18. st.", "19": "19. století", "cz20": "ČR 20. a 21. st.", "svet20": "Svět 20. a 21. st." };
const STORAGE_KEY = 'kanon_selekce_state'; // Opět jen jeden pevný klíč
const KNIHY_DB = window.OMEGA_CONFIG.KNIHY_DB;
const REQUIREMENTS = window.OMEGA_CONFIG.REQUIREMENTS;

/* ==========================================
   OMEGA TELEMETRY ENGINE
   ========================================== */
const OMEGA_VERSION = '7.0.0-dev'; // Změněno na dev verzi

function trackOmegaEvent(eventName, eventData = {}) {
    if (typeof umami !== 'undefined') {
        umami.track(eventName, { version: OMEGA_VERSION, ...eventData });
    }
}

// ==========================================
// INSTITUCIONÁLNÍ BRANDING A THEME ENGINE
// ==========================================

// 1. Dynamická injekce loga (Pouze pro SPŠPB režim)
const currentRozcestnik = localStorage.getItem('omega_theme') || 'default';
if (currentRozcestnik === 'spspb') {
    const brandEl = document.querySelector('.brand');
    if (brandEl && !document.getElementById('brand-logo')) {
        // Vložení loga před text nadpisu s optickým zarovnáním
        brandEl.innerHTML = `<img id="brand-logo" src="spspb-logo-2000px.png" alt="SPŠ Logo" style="height: 1.1em; vertical-align: text-bottom; margin-right: 8px; border-radius: 2px;">` + brandEl.innerHTML;
    }
}

// 2. State Machine pro Dark/Light Mode
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

function applyColorTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('omega_color_theme', theme);
}

// Inicializace při startu: 1. LocalStorage -> 2. OS Preference -> 3. Dark default
const savedColorTheme = localStorage.getItem('omega_color_theme');
const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
const initialTheme = savedColorTheme || (systemPrefersLight ? 'light' : 'dark');
applyColorTheme(initialTheme);

// Event Listener na tlačítko
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        applyColorTheme(currentTheme === 'light' ? 'dark' : 'light');

        // 🎯 TELEMETRIE: Změna motivu
        trackOmegaEvent('Theme_Switched', { mode: nextTheme });

    });
}
// ==========================================


function generateDbHash(db) {
    const str = db.map(k => k.id + k.dilo).join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; 
    }
    return hash.toString(36); // Generuje např. "1j4k2a"
}
const DB_VERSION = generateDbHash(KNIHY_DB);


// Dynamická injekce formuláře a navázání event listenerů
document.getElementById('dynamic-form-container').innerHTML = window.OMEGA_CONFIG.FORM_HTML;

const rulesContainer = document.getElementById('school-rules');
if (rulesContainer) {
    rulesContainer.innerHTML = window.OMEGA_CONFIG.RULES_HTML || "";
}
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
    const currentTheme = localStorage.getItem('omega_theme') || 'default';
    const baseUrl = window.location.origin + window.location.pathname;
    currentShareUrl = `${baseUrl}?theme=${currentTheme}&v=${DB_VERSION}&p=${ids}`;

    document.getElementById("share-modal").style.display = "flex";

    const qrBox = document.getElementById("qr-code-box");
    qrBox.innerHTML = ""; 
    
    new QRCode(qrBox, {
        text: currentShareUrl,
        width: 400, 
        height: 400,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.M 
    });

    trackOmegaEvent('Share_QR_Created', { books_count: state.selectedIds.size });

};

window.closeShareModal = function() {
    document.getElementById("share-modal").style.display = "none";
};

window.copyShareUrl = function() {
    navigator.clipboard.writeText(currentShareUrl).then(() => {
        showToast("✅ Odkaz zkopírován do schránky");
        trackOmegaEvent('Share_Link_Copied');
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
    
    const padding = 40; 
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = qrCanvas.width + (padding * 2);
    exportCanvas.height = qrCanvas.height + (padding * 2);
    
    const ctx = exportCanvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    ctx.drawImage(qrCanvas, padding, padding);
    
    const imgData = exportCanvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = imgData;
    a.download = "maturita-vyber-qr.png";
    a.click();
    
    showToast("⬇️ Stahování zahájeno");
};

// ==========================================
// PREVIEW SANDBOX (SMART IMPORT ENGINE)
// ==========================================

function loadStateFromURL() {
    const params = new URLSearchParams(window.location.search);
    const payload = params.get('p');
    const currentTheme = localStorage.getItem('omega_theme') || 'default';
    const incomingVersion = params.get('v');
    
    if (!payload) return;

    trackOmegaEvent('Import_Loaded', { method: 'URL_Payload' });

    const ids = payload.split('-').map(Number);
    const validIds = ids.filter(id => KNIHY_DB.some(k => k.id === id));
    
    if (validIds.length === 0) return;

    // Odstranění payload parametru z URL (ponechá pouze aktivní téma)
    window.history.replaceState({}, document.title, window.location.pathname + "?theme=" + currentTheme);

    // 🛡️ HARD BLOCK: Kontrola kompatibility odkazů
    if (incomingVersion !== DB_VERSION) {
        document.getElementById('outdated-modal').style.display = 'flex';
        return; // Zastaví celý import
    }

    // Krok 1: Výpočet nových děl
    const newBooksCount = validIds.filter(id => !state.selectedIds.has(id)).length;
    
    if (newBooksCount === 0 && state.selectedIds.size === validIds.length) {
        setTimeout(() => showToast("ℹ️ Odkaz obsahuje identický seznam, jaký už máte."), 500);
        return;
    }

    // Krok 2: Vykreslení Preview Modalu
    showPreviewModal(validIds, newBooksCount);
}

function showPreviewModal(importedIds, newCount) {
    const modal = document.getElementById("preview-modal");
    const metaEl = document.getElementById("preview-meta");
    const listEl = document.getElementById("preview-list");
    const validationEl = document.getElementById("preview-validation");

    const importedBooks = importedIds.map(id => KNIHY_DB.find(k => k.id === id)).sort((a, b) => a.id - b.id);

    // Virtuální simulace platnosti cizího seznamu
    const stats = { do18: 0, "19": 0, svet20: 0, cz20: 0, lyrika: 0, epika: 0, drama: 0 };
    importedBooks.forEach(k => {
        stats[k.obdobi]++;
        stats[k.druh]++;
    });

    const isFullyValid = importedIds.length === 20 && 
                         stats.do18 >= REQUIREMENTS.do18 && stats["19"] >= REQUIREMENTS["19"] && 
                         stats.svet20 >= REQUIREMENTS.svet20 && stats.cz20 >= REQUIREMENTS.cz20 &&
                         stats.lyrika >= REQUIREMENTS.lyrika && stats.epika >= REQUIREMENTS.epika && stats.drama >= REQUIREMENTS.drama;

    // Metainformace s přesnou analytikou
    let text = `Odkaz obsahuje <strong>${importedIds.length} děl</strong>`;
    if (state.selectedIds.size > 0) {
        text += ` (z toho ${newCount} děl ve vašem seznamu není).`;
    } else {
        text += ".";
    }
    metaEl.innerHTML = text;

    // Vykreslení validace s institucionálními barvami
    if (isFullyValid) {
        validationEl.innerHTML = `<span style="background: rgba(34, 197, 94, 0.1); color: var(--accent-green); padding: 4px 8px; border-radius: 4px; border: 1px solid var(--accent-green); font-size: 0.8rem; font-weight: bold;">✅ Seznam splňuje všechna maturitní kritéria</span>`;
    } else {
        validationEl.innerHTML = `<span style="background: rgba(239, 68, 68, 0.1); color: var(--accent-red); padding: 4px 8px; border-radius: 4px; border: 1px solid var(--accent-red); font-size: 0.8rem; font-weight: bold;">⚠️ Odkaz NESPLŇUJE všechna kritéria</span>`;
    }

    // Vykreslení posuvného seznamu
    listEl.innerHTML = importedBooks.map((k) => {
        const alreadyHave = state.selectedIds.has(k.id);
        return `<div style="padding: 6px 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;">
            <span style="color: ${alreadyHave ? 'var(--text-muted)' : 'var(--text-main)'};">
                <strong>${k.id}.</strong> ${k.dilo} <small style="opacity:0.7">(${k.autor})</small>
            </span>
            ${alreadyHave ? '<span style="font-size: 0.7rem; color: var(--accent-green);">Již máte</span>' : '<span style="font-size: 0.7rem; color: var(--accent-primary-light);">Nové</span>'}
        </div>`;
    }).join('');

    modal.style.display = "flex";

    // Akce: PŘEPSAT SEZNAM
    document.getElementById("btn-import-replace").onclick = () => {
        state.selectedIds.clear();
        importedIds.forEach(id => state.selectedIds.add(id));
        finalizeImport(`✅ Seznam přepsán. Načteno ${importedIds.length} děl.`);
    };

    // Akce: DOPLNIT CHYBĚJÍCÍ (Sloučení)
    document.getElementById("btn-import-merge").onclick = () => {
        let addedCount = 0;
        let overflow = false;
        importedIds.forEach(id => {
            if (state.selectedIds.size < 20) {
                if (!state.selectedIds.has(id)) {
                    state.selectedIds.add(id);
                    addedCount++;
                }
            } else if (!state.selectedIds.has(id)) {
                overflow = true;
            }
        });
        
        let msg = `✅ Doplněno ${addedCount} nových děl.`;
        if (overflow) msg += " (Některá z odkazu přeskočena kvůli limitu 20).";
        if (addedCount === 0 && !overflow) msg = "ℹ️ Žádná nová díla nebyla přidána.";
        finalizeImport(msg);
    };
}

function finalizeImport(toastMsg) {
    saveState();
    renderTable();
    updateStatsAndSidebar();
    closePreviewModal();
    setTimeout(() => showToast(toastMsg), 300);
}

window.closePreviewModal = function() {
    document.getElementById("preview-modal").style.display = "none";
};


// ======= LOCAL STORAGE: SERIALIZACE A DESERIALIZACE =======
function saveState() {
    const stateToSave = {
        v: DB_VERSION, // 🛡️ Uložení otisku aktuálních osnov
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
            
            // 🛡️ OCHRANA INTEGRITY PAMĚTI
            if (parsed.v && parsed.v !== DB_VERSION) {
                console.warn("Detekována mutace osnov (Hash Mismatch). Paměť vymazána.");
                localStorage.removeItem(STORAGE_KEY);
                setTimeout(() => showToast("⚠️ Maturitní seznam byl školou aktualizován. Váš výběr byl z bezpečnostních důvodů resetován."), 1000);
                return; // Tvrdé ukončení načítání mrtvých dat
            }

            if (Array.isArray(parsed.selectedIds)) {
                // Převod pole zpět na Set a vynucení číselného typu (ID jsou Int)
                state.selectedIds = new Set(parsed.selectedIds.map(Number));
            }
            
            if (parsed.filters) state.filters = parsed.filters;
            if (parsed.student) {
                state.student = parsed.student;
                window.OMEGA_CONFIG.FORM_FIELDS.forEach(key => {
                    const el = document.getElementById(`student-${key}`);
                    if (el) el.value = state.student[key] || "";
                });
            }
        } catch (error) {
            localStorage.removeItem(STORAGE_KEY);
        }
    }
}

// Data-binding pro osobní údaje
window.OMEGA_CONFIG.FORM_FIELDS.forEach(key => {
    const el = document.getElementById(`student-${key}`);
    if (el) {
        el.addEventListener('input', (e) => {
            state.student[key] = e.target.value;
            saveState();
        });
    }
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
    const q = state.searchQuery.toLowerCase().trim();
    const filtered = KNIHY_DB.filter(kniha => {
        if (state.filters.obdobi && state.filters.obdobi !== kniha.obdobi) return false;
        if (state.filters.druh && state.filters.druh !== kniha.druh) return false;
        if (q && !(kniha.dilo.toLowerCase().includes(q) || kniha.autor.toLowerCase().includes(q))) return false;
        return true;
    });

    const tableEl = document.getElementById('data-table');
    const emptyStateEl = document.getElementById('empty-search-state');

    // UX: Empty State Logic
    if (filtered.length === 0) {
        tableEl.style.display = 'none';
        emptyStateEl.style.display = 'block';
        elements.tableBody.innerHTML = '';
        return;
    } else {
        tableEl.style.display = 'table';
        emptyStateEl.style.display = 'none';
    }

    // UX: Funkce pro zvýraznění textu (Highlighting)
    const highlight = (text) => {
        if (!q) return text;
        const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    };

    elements.tableBody.innerHTML = filtered.map((kniha, index) => {
        const isSelected = state.selectedIds.has(kniha.id);
        const tIndex = index === 0 ? "0" : "-1";
        return `
            <tr data-id="${kniha.id}" class="${isSelected ? 'selected' : ''}" tabindex="${tIndex}">
                <td>${kniha.id}</td>
                <td>${isSelected ? '✔ ' : ''}${highlight(kniha.dilo)}</td>
                <td>${highlight(kniha.autor)}</td>
                <td>${kniha.druh}</td>
                <td>${MAPA_OBDOBI[kniha.obdobi]}</td>
            </tr>
        `;
    }).join('');
}

// OMEGA Kvantové vyhledávání (Debouncing)
let searchTelemetryTimeout;
elements.searchBox.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderTable();

    // 🎯 TELEMETRIE: Vyhledávání (odešle se, až když uživatel na 1.5s přestane psát)
    clearTimeout(searchTelemetryTimeout);
    if (state.searchQuery.trim().length > 1) {
        searchTelemetryTimeout = setTimeout(() => {
            trackOmegaEvent('Search_Used', { query_length: state.searchQuery.length });
            
            // Sledování slepých uliček
            if (document.getElementById('empty-search-state').style.display === 'block') {
                trackOmegaEvent('Search_Zero_Results');
            }
        }, 1500);
    }
});

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
    // ======= INVERSION OF CONTROL: EXTERNÍ VALIDACE =======
    let customErrorsHtml = "";
    const selectedBooks = Array.from(state.selectedIds).map(id => KNIHY_DB.find(k => k.id === id));

    if (typeof window.OMEGA_CONFIG.customValidation === 'function') {
        const validation = window.OMEGA_CONFIG.customValidation(selectedBooks);
        if (!validation.isValid) {
            isFullyValid = false; // Tvrďák blokující export
            customErrorsHtml = validation.errors.map(err => `<div>❌ ${err}</div>`).join('');
        }
    }

    const errorBox = document.getElementById('validation-errors');
    if (errorBox) {
        errorBox.innerHTML = customErrorsHtml;
        errorBox.style.display = customErrorsHtml ? "block" : "none";
    }
    // ======================================================
    elements.statTotal.textContent = total;
    
    const box = document.getElementById('stat-total-container');
    if (isFullyValid) {
        box.style.borderColor = "var(--accent-green)";
    } else if (total === 20) {
        box.style.borderColor = "var(--accent-red)";
    } else {
        box.style.borderColor = "var(--border)";
    }
    const navBadge = document.getElementById('nav-badge-count');
    if (navBadge) {
        navBadge.textContent = total;
        if (isFullyValid) {
            navBadge.style.backgroundColor = "var(--accent-green)";
            navBadge.style.color = "#000";
        } else if (total === 20) {
            navBadge.style.backgroundColor = "var(--accent-red)";
            navBadge.style.color = "#fff";
        } else {
            navBadge.style.backgroundColor = "var(--border)";
            navBadge.style.color = "#fff";
        }
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

// ======= ASYNCHRONNÍ DESTRUKCE STAVU (GRANULÁRNÍ) =======

// Modul 1: Výmaz samotných knih
const clearListLogic = () => {
    state.selectedIds.clear();
    renderTable();
    updateStatsAndSidebar();
};

// Modul 2: Výmaz PII (osobních údajů) - Robustní verze
const clearDataLogic = () => {
    // 1. Reset vnitřního stavu
    state.student = { name: "", dob: "", klasa: "", year: "" };

    // 2. Bezpečný výmaz inputů (jen těch, které v dané škole existují)
    window.OMEGA_CONFIG.FORM_FIELDS.forEach(key => {
        const el = document.getElementById(`student-${key}`);
        if (el) el.value = "";
    });
};

// Hlavní trigger (otevře okno, i když je seznam prázdný, protože mohou chtít smazat údaje)
elements.btnClear.addEventListener('click', () => {
    document.getElementById("clear-modal").style.display = "flex";
});

window.closeClearModal = function() {
    document.getElementById("clear-modal").style.display = "none";
};

// Akce A: Jen knihy
document.getElementById("btn-clear-list").addEventListener('click', () => {
    if (state.selectedIds.size === 0) {
        showToast("ℹ️ Váš seznam knih je již prázdný.");
    } else {
        clearListLogic();
        saveState();
        showToast("🗑️ Seznam knih byl úspěšně vymazán.");
    }
    closeClearModal();
});

// Akce B: Jen osobní údaje
document.getElementById("btn-clear-data").addEventListener('click', () => {
    clearDataLogic();
    saveState();
    closeClearModal();
    showToast("🗑️ Osobní údaje byly vymazány.");
});

// Akce C: Nukleární reset (Vše)
document.getElementById("btn-clear-all").addEventListener('click', () => {
    clearListLogic();
    clearDataLogic();
    saveState();
    closeClearModal();
    showToast("☢️ Kompletní paměť byla vymazána.");
});

// ======= GENERÁTOR DOKUMENTŮ =======
elements.btnExport.addEventListener('click', () => {
    if (elements.btnExport.disabled) return;

    const selectedBooks = Array.from(state.selectedIds)
        .map(id => KNIHY_DB.find(k => k.id === id))
        .sort((a, b) => a.id - b.id);

    const printArea = document.getElementById('print-area');
    
    // 1. Okamžitá injekce HTML
    printArea.innerHTML = window.OMEGA_CONFIG.renderPdf(selectedBooks, state.student, sanitize);
    
    // 2. Krátká prodleva pro mobilní telefony i PC, aby prohlížeč stihl vykreslit tabulku a CSS!
    setTimeout(() => {
        trackOmegaEvent('Export_PDF_Generated', { books_count: state.selectedIds.size });
        window.print();
    }, 150);
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

// ==========================================
// AUTO-DETEKCE VERZE (Z CACHE API)
// ==========================================

// Zobrazení času poslední aktualizace
const auditEl = document.getElementById('audit-trail-date');
if (auditEl && window.OMEGA_CONFIG.LAST_UPDATE) {
    auditEl.innerHTML = `AKTUALIZOVÁNO: <span style="white-space: nowrap;"><strong>${window.OMEGA_CONFIG.LAST_UPDATE}</strong></span>`;
}

if ('caches' in window) {
    caches.keys().then(keys => {
        const cacheName = keys.find(key => key.includes('SPS_Selekce_MAT_CETBY'));
        if (cacheName) {
            const version = cacheName.split('_').pop(); 
            const versionEl = document.getElementById('app-version-val');
            if (versionEl) {
                versionEl.textContent = version;
            }
        }
    }).catch(err => console.error("Nelze načíst verzi z Cache API:", err));
}

// ======= MOBILE NAVIGATION ENGINE =======
const mobileTabs = document.querySelectorAll('.nav-tab');

mobileTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.target;
        
        // 1. Změna aktivního tlačítka
        mobileTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // 2. Přepnutí View (výměna CSS třídy na body)
        if (target === 'sidebar') {
            document.body.classList.remove('mobile-view-main');
            document.body.classList.add('mobile-view-sidebar');
        } else {
            document.body.classList.remove('mobile-view-sidebar');
            document.body.classList.add('mobile-view-main');
        }
        
        // 3. Posun nahoru při přepnutí
        window.scrollTo({ top: 0, behavior: 'instant' });
    });
});

window.onload = () => {
    loadState(); 
    loadStateFromURL(); 
    
    // SMART AUTOFOCUS: Zabrání vyskočení klávesnice na dotykových zařízeních
    // Focus se provede pouze pokud má zařízení přesný ukazatel (myš)
    if (window.matchMedia("(pointer: fine)").matches) {
        elements.searchBox.focus(); 
    }
    
    renderTable(); 
    updateStatsAndSidebar();

    // --- ⏱️ KONTROLA EXPIRACE RELACE ---
    if (sessionStorage.getItem('omega_session_expired') === 'true') {
        sessionStorage.removeItem('omega_session_expired'); // Ihned smazat, ať to nevyskakuje při dalším F5
        const timeoutModal = document.getElementById('omega-timeout-modal');
        if (timeoutModal) timeoutModal.style.display = 'flex';
    }
    // -----------------------------------

    // 🎯 TELEMETRIE: Otevření aplikace
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    trackOmegaEvent('App_Opened', { 
        platform: isPWA ? 'PWA_Installed' : 'Web_Browser',
        theme: localStorage.getItem('omega_theme') || 'default'
    });
};

/* ==========================================
   OMEGA ADMIN ENGINE v7.1.0 (Enterprise)
   ========================================== */

const OMEGA_ADMIN_CONFIG = {
    WORKER_URL: "https://spspb-mat-cet.tresnakkarel77.workers.dev"
};

let stagingQueue = [];
let deleteQueue = [];
let sessionPassword = "";
let pendingExportPayload = null;

// --- ⏳ SECURITY: HYBRIDNÍ SESSION DECAY (HUD -> MODAL) ---
let adminIdleTime = 0;
const ADMIN_IDLE_LIMIT = 300; 
const ADMIN_IDLE_HUD_START = 10;   // Zobrazení HUD (4:50)
const ADMIN_IDLE_MODAL_START = 240; // Bod zlomu: Modál (1:00)

let decayInterval = null;

const resetDecayTimer = () => {
    adminIdleTime = 0;
    const hud = document.getElementById('omega-idle-timer-small');
    const modal = document.getElementById('omega-session-modal');
    if (hud) hud.style.display = 'none';
    if (modal) modal.style.display = 'none';
};

// Senzory aktivity
['mousemove', 'keypress', 'click', 'touchstart'].forEach(ev => 
    window.addEventListener(ev, resetDecayTimer)
);

const formatDecayTime = (s) => 
    `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

decayInterval = setInterval(() => {
    const portal = document.getElementById('omega-admin-portal');
    if (portal && portal.style.display === 'block') {
        adminIdleTime++;
        const timeRemaining = ADMIN_IDLE_LIMIT - adminIdleTime;

        if (adminIdleTime >= ADMIN_IDLE_LIMIT) {
            clearInterval(decayInterval);
            isSafeToExit = true; 
            sessionStorage.setItem('omega_session_expired', 'true');
            window.location.href = window.location.pathname;
            return;
        }

        const hud = document.getElementById('omega-idle-timer-small');
        const modal = document.getElementById('omega-session-modal');
        const hudVal = document.getElementById('idle-time-val-small');
        const modalVal = document.getElementById('session-timer-val');

        // --- ZÓNA 3: MODÁL (Poslední minuta: 01:00 - 00:00) ---
        if (adminIdleTime >= ADMIN_IDLE_MODAL_START) {
            if (hud) hud.style.display = 'none';
            if (modal) {
                modal.style.display = 'flex';
                modalVal.textContent = formatDecayTime(timeRemaining);
                
                // Kritický vizuální puls (posledních 20s)
                if (timeRemaining <= 20) {
                    modalVal.style.color = '#da2128';
                    document.getElementById('omega-session-card').style.boxShadow = '0 0 30px rgba(218, 33, 40, 0.3)';
                }
            }
        } 
        // --- ZÓNA 2: HUD (Od 4:50 do 1:01) ---
        else if (adminIdleTime >= ADMIN_IDLE_HUD_START) {
            if (modal) modal.style.display = 'none';
            if (hud) {
                hud.style.display = 'flex';
                hudVal.textContent = formatDecayTime(timeRemaining);
            }
        }
    }
}, 1000);

// --- 🤖 CUSTOM AUTOCOMPLETE & HEURISTICS ---
let unikatniAutori = [];

function initAuthorAutocomplete() {
    // 1. Vytažení a seřazení autorů z DB
    unikatniAutori = [...new Set(window.OMEGA_CONFIG.KNIHY_DB.map(k => k.autor))].sort((a, b) => a.localeCompare(b, 'cs'));
    
    const input = document.getElementById('admin-autor');
    const dropdown = document.getElementById('custom-author-dropdown');
    if (!input || !dropdown) return;

    // 2. Renderovací funkce
    const renderDropdown = (query) => {
        const hledano = query.trim().toLowerCase();
        // Pokud je prázdno, ukážeme všechny. Jinak filtrujeme.
        const filtered = hledano ? unikatniAutori.filter(a => a.toLowerCase().includes(hledano)) : unikatniAutori;
        
        if (filtered.length === 0) {
            dropdown.style.display = 'none';
            return;
        }

        dropdown.innerHTML = filtered.map(autor => {
            // Zvýraznění shodujícího se textu (Highlighting)
            const regex = new RegExp(`(${hledano})`, 'gi');
            const highlighted = hledano ? autor.replace(regex, '<strong style="color: var(--accent-primary, #e67e22); font-weight: 900;">$1</strong>') : autor;
            
            return `<div class="autocomplete-item" style="padding: 12px 15px; cursor: pointer; border-bottom: 1px solid var(--border); font-size: 0.9rem; color: var(--text-main); transition: background 0.1s;" onmouseover="this.style.background='var(--bg-active)'" onmouseout="this.style.background='transparent'" data-val="${autor}">${highlighted}</div>`;
        }).join('');
        
        dropdown.style.display = 'flex';
    };

    // 3. Posluchače událostí (Otevření při kliknutí a psaní)
    input.addEventListener('focus', () => renderDropdown(input.value));
    
    input.addEventListener('input', (e) => {
        renderDropdown(e.target.value);
        
        // Původní heuristika období (Auto-fill)
        const hledanyAutor = e.target.value.trim().toLowerCase();
        const nalezeneDilo = window.OMEGA_CONFIG.KNIHY_DB.find(k => k.autor.toLowerCase() === hledanyAutor);
        if (nalezeneDilo) {
            const obdobiSelect = document.getElementById('admin-obdobi');
            if (obdobiSelect && obdobiSelect.value !== nalezeneDilo.obdobi) {
                obdobiSelect.value = nalezeneDilo.obdobi;
                obdobiSelect.style.transition = "background-color 0.3s";
                obdobiSelect.style.backgroundColor = "var(--bg-active)";
                setTimeout(() => obdobiSelect.style.backgroundColor = "transparent", 600);
            }
        }
    });

    // 4. Výběr autora kliknutím/dotykem
    dropdown.addEventListener('click', (e) => {
        const item = e.target.closest('.autocomplete-item');
        if (item) {
            input.value = item.dataset.val;
            dropdown.style.display = 'none';
            
            // Uměle vyvoláme input event, aby heuristika doplnila období i po kliknutí myší
            input.dispatchEvent(new Event('input'));
            
            // UX Kinetika: Přepneme focus na další pole (Druh)
            document.getElementById('admin-druh')?.focus();
        }
    });

    // 5. Zavření při kliknutí mimo (Click-away listener)
    document.addEventListener('click', (e) => {
        if (e.target !== input && e.target !== dropdown && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

function navrhniDalsiVolneId() {
    const dbSize = window.OMEGA_CONFIG.KNIHY_DB.length;
    const qSize = typeof stagingQueue !== 'undefined' ? stagingQueue.length : 0;
    const dSize = typeof deleteQueue !== 'undefined' ? deleteQueue.length : 0;
    const idInput = document.getElementById('admin-index');
    if (idInput) idInput.value = dbSize - dSize + qSize + 1;
}

// --- 🚪 EGRESS PROTOKOL (Úniková cesta) ---

let isSafeToExit = false;

window.attemptAdminExit = function() {
    // Pokud je fronta prázdná, odejdeme rovnou (žádný modál neotravuje)
    if (stagingQueue.length === 0 && deleteQueue.length === 0) {
        isSafeToExit = true;
        window.location.href = window.location.pathname;
    } else {
        // Pokud jsou změny, otevřeme náš hezký Custom Modál
        document.getElementById('omega-exit-modal').style.display = 'flex';
    }
};

window.confirmAdminExit = function() {
    // Uživatel potvrdil zahození změn v našem modálu -> deaktivujeme nativní dialog a odejdeme
    isSafeToExit = true;
    window.location.href = window.location.pathname;
};

window.closeExitModal = function() {
    document.getElementById('omega-exit-modal').style.display = 'none';
};

// Tento nativní blok chytá POUZE pokusy o zavření celého panelu/prohlížeče
window.addEventListener('beforeunload', (e) => {
    if (!isSafeToExit && (stagingQueue.length > 0 || deleteQueue.length > 0)) {
        e.preventDefault();
        e.returnValue = 'Máte neuložená díla ve frontě.';
    }
});

// --- 🚀 ZERO-TRUST BRÁNA ---

const adminUrlParams = new URLSearchParams(window.location.search);
if (adminUrlParams.get('mat_cet_admin') === 'true') {
    // --- NUKLEÁRNÍ UI LOCKDOWN ---
    const appElements = ['.layout', 'header', '.mobile-nav', 'footer', '.brand', 'main'];
    appElements.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.style.setProperty('display', 'none', 'important');
    });
    
    document.body.style.setProperty('overflow-y', 'auto', 'important');
    document.body.style.setProperty('padding-bottom', '0', 'important');
    // ------------------------------
    
    const authModal = document.getElementById('omega-auth-modal');
    const passInput = document.getElementById('admin-password-input');
    const errorMsg = document.getElementById('auth-error-msg');
    const submitBtn = document.getElementById('btn-auth-submit');
    const cancelBtn = document.getElementById('btn-auth-cancel');

    authModal.style.display = 'flex';
    passInput.focus();

    // 🔐 OMEGA AUTHENTICATION ENGINE (Zero-Trust Edition)
    const unlockAdminPortal = async () => {
        const inputVal = passInput.value;
        
        // 1. Extrakce kryptografického důkazu (Turnstile) z přihlašovacího okna
        const authTurnstileInput = document.querySelector('#omega-auth-modal [name="cf-turnstile-response"]');
        const turnstileToken = authTurnstileInput ? authTurnstileInput.value : null;

        if (!turnstileToken) {
            errorMsg.innerHTML = "⚠️ Vyčkejte na ověření Cloudflare (bezpečnostní check).";
            errorMsg.style.display = 'block';
            return;
        }

        if (!inputVal) {
            errorMsg.innerHTML = "⚠️ Zadejte administrátorské heslo.";
            errorMsg.style.display = 'block';
            return;
        }

        errorMsg.style.display = 'none';
        submitBtn.disabled = true;
        submitBtn.innerHTML = "⌛ Ověřuji přes Edge...";

        try {
            // 2. Odeslání asymetrického payloadu (Heslo + Důkaz) na Worker
            const response = await fetch(OMEGA_ADMIN_CONFIG.WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    password: inputVal,
                    cf_token: turnstileToken
                })
            });

            if (response.ok) {
                // 3. ÚSPĚCH
                sessionPassword = inputVal;
                authModal.style.display = 'none';
                document.getElementById('omega-admin-portal').style.display = 'block';
                initAuthorAutocomplete();
                navrhniDalsiVolneId();
                if (typeof trackOmegaEvent === 'function') trackOmegaEvent('Admin_Portal_Accessed');
            } else {
                // 4. SELHÁNÍ (Heslo nebo Token)
                const data = await response.json();
                errorMsg.innerHTML = "❌ " + (data.error || "Přístup odepřen.");
                errorMsg.style.display = 'block';
                passInput.value = "";
                passInput.focus();
            }
        } catch (err) {
            errorMsg.innerHTML = "⚠️ Server nedostupný (CORS/Internet).";
            errorMsg.style.display = 'block';
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Vstoupit";
            
            // 🛡️ Bezpečnostní destrukce: Exaktní reset konkrétního uzlu
            if (typeof turnstile !== 'undefined') {
                try {
                    // Zamíříme přesně na přihlašovací widget
                    turnstile.reset('#omega-auth-ts');
                } catch (e) {
                    turnstile.reset(); // Fallback
                }
                
                // 🔄 Vizuální reset stavového automatu
                const statusEl = document.getElementById('ts-status-auth');
                if (statusEl) {
                    statusEl.innerHTML = "⏳ Generuji nový klíč...";
                    statusEl.style.color = "var(--accent-primary, #e67e22)";
                }
            }
        }};

    submitBtn.onclick = unlockAdminPortal;
    passInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') unlockAdminPortal(); });
    cancelBtn.onclick = () => { window.location.href = "?"; };
}

// --- 🎛️ UI: SEGMENTED CONTROL ---

window.switchAdminMode = function(mode) {
    const addForm = document.getElementById('admin-form-add');
    const removeForm = document.getElementById('admin-form-remove');
    const tabAdd = document.getElementById('tab-add');
    const tabRemove = document.getElementById('tab-remove');

    if (mode === 'add') {
        addForm.style.display = 'grid';
        removeForm.style.display = 'none';
        tabAdd.style.borderBottom = '2px solid var(--accent-primary)';
        tabAdd.style.opacity = '1';
        tabRemove.style.borderBottom = '2px solid transparent';
        tabRemove.style.opacity = '0.5';
    } else if (mode === 'remove') {
        addForm.style.display = 'none';
        removeForm.style.display = 'grid';
        tabAdd.style.borderBottom = '2px solid transparent';
        tabAdd.style.opacity = '0.5';
        tabRemove.style.borderBottom = '2px solid var(--accent-red, #da2128)';
        tabRemove.style.opacity = '1';
    }
};

// --- ⌨️ UX ERGONOMIE: Kinetika klávesnice ---
['admin-dilo', 'admin-autor', 'admin-index'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                // Odeslat jen pokud jsme v záložce "Přidat dílo"
                const addForm = document.getElementById('admin-form-add');
                if (addForm && addForm.style.display !== 'none') {
                    addToStagingQueue();
                }
            }
        });
    }
});

const deleteInput = document.getElementById('admin-delete-id');
if (deleteInput) {
    deleteInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addToDeleteQueue();
        }
    });
}

// --- ⚙️ REAKTIVNÍ FRONT CONTROLLER ---

window.addToStagingQueue = function() {
    // Extrémní sanitizace MS Word odpadu (Chytré uvozovky, Zero-width znaky)
    const dilo = document.getElementById('admin-dilo').value
        .replace(/[\u200B-\u200D\uFEFF]/g, '') // Odstranění neviditelných znaků
        .replace(/[“”„]/g, '"').replace(/[‘’]/g, "'") // Normalizace uvozovek
        .trim().replace(/\s+/g, ' '); // Zploštění mezer
        
    const autor = document.getElementById('admin-autor').value
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/[“”„]/g, '"').replace(/[‘’]/g, "'")
        .trim().replace(/\s+/g, ' ');

    const obdobi = document.getElementById('admin-obdobi').value;
    const druh = document.getElementById('admin-druh').value;
    const targetId = parseInt(document.getElementById('admin-index').value, 10);

    if (!dilo || !autor || isNaN(targetId) || targetId < 1) {
        showToast("⚠️ Vyplňte všechna pole a zadejte platné Cílové ID.");
        return;
    }
    
    let posunuto = 0;
    stagingQueue.forEach(item => {
        if (item.targetId >= targetId) {
            item.targetId += 1;
            posunuto++;
        }
    });

    stagingQueue.push({ targetId, dilo, autor, obdobi, druh });
    renderStagingQueue();
    
    if (posunuto > 0) {
        const textDila = posunuto === 1 ? "Následujícímu 1 dílu" : `Následujícím ${posunuto} dílům`;
        showToast(`➕ Vloženo na pozici ${targetId}. ${textDila} se zvýšilo ID o 1.`);
    } else {
        showToast(`➕ Dílo úspěšně zařazeno na konec seznamu.`);
    }
    
    document.getElementById('admin-dilo').value = "";
    document.getElementById('admin-dilo').focus();
    navrhniDalsiVolneId(); 
};

window.addToDeleteQueue = function() {
    const idInput = document.getElementById('admin-delete-id');
    const idVal = parseInt(idInput.value);
    
    if (isNaN(idVal) || idVal < 1 || idVal > window.OMEGA_CONFIG.KNIHY_DB.length) {
        showToast("⚠️ Zadejte platné ID existujícího díla.");
        return;
    }
    
    if (!deleteQueue.includes(idVal)) {
        deleteQueue.push(idVal);
        
        let posunuto = 0;
        stagingQueue.forEach(item => {
            if (item.targetId > idVal) {
                item.targetId -= 1;
                posunuto++;
            }
        });

        renderStagingQueue();
        navrhniDalsiVolneId();
        
        if (posunuto > 0) {
            const textDila = posunuto === 1 ? "Následujícímu 1 dílu" : `Následujícím ${posunuto} dílům`;
            showToast(`🗑️ ID ${idVal} odstraněno. ${textDila} ve frontě se snížilo ID o 1.`);
        } else {
            showToast(`🗑️ Dílo ID ${idVal} bude odstraněno ze seznamu.`);
        }
    } else {
        showToast("⚠️ Toto dílo už je ve frontě pro smazání.");
    }
    idInput.value = "";
};

window.removeFromQueue = function(index, type) {
    if (type === 'add') {
        const removedTargetId = stagingQueue[index].targetId;
        stagingQueue.splice(index, 1);
        
        let posunuto = 0;
        stagingQueue.forEach(item => {
            if (item.targetId > removedTargetId) {
                item.targetId -= 1;
                posunuto++;
            }
        });

        if (posunuto > 0) {
            const textDila = posunuto === 1 ? "Následujícímu 1 dílu" : `Následujícím ${posunuto} dílům`;
            showToast(`ℹ️ Přidání zrušeno. ${textDila} ve frontě se snížilo ID o 1.`);
        } else {
            showToast(`ℹ️ Přidání díla bylo zrušeno.`);
        }
    }
    
    if (type === 'delete') {
        const restoredId = deleteQueue[index];
        deleteQueue.splice(index, 1);
        
        let posunuto = 0;
        stagingQueue.forEach(item => {
            if (item.targetId >= restoredId) {
                item.targetId += 1;
                posunuto++;
            }
        });

        if (posunuto > 0) {
            const textDila = posunuto === 1 ? "Následujícímu 1 dílu" : `Následujícím ${posunuto} dílům`;
            showToast(`ℹ️ Smazání zrušeno. ${textDila} ve frontě se zvýšilo ID o 1.`);
        } else {
            showToast(`ℹ️ Smazání díla ID ${restoredId} bylo zrušeno.`);
        }
    }
    
    renderStagingQueue();
    navrhniDalsiVolneId();
};

window.renderStagingQueue = function() {
    const container = document.getElementById('staging-queue-list');
    let html = "";
    const badgeStyle = "display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 0.7rem; font-weight: bold; margin-right: 12px; letter-spacing: 0.5px; text-transform: uppercase;";

    const sortedDeleteQueue = [...deleteQueue].sort((a, b) => a - b);
    const sortedStagingQueue = [...stagingQueue].sort((a, b) => a.targetId - b.targetId);

    sortedDeleteQueue.forEach((id) => {
        const originalIndex = deleteQueue.indexOf(id); 
        const kniha = window.OMEGA_CONFIG.KNIHY_DB.find(k => k.id === id);
        const nazev = kniha ? kniha.dilo : "Neznámé dílo";
        
        html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 8px; background: rgba(218, 33, 40, 0.05); border: 1px solid rgba(218, 33, 40, 0.2); border-radius: 6px;">
            <div style="display: flex; align-items: center;">
                <span style="${badgeStyle} background: rgba(218, 33, 40, 0.1); color: var(--accent-red, #da2128);">Odebrat ID ${id}</span>
                <strong style="color: var(--text-main); font-size: 0.95rem;">${nazev}</strong>
            </div>
            <button type="button" onclick="removeFromQueue(${originalIndex}, 'delete')" style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: 4px; padding: 4px 10px; cursor: pointer; color: var(--text-muted); font-size: 0.75rem; font-weight: bold;">Zrušit</button>
        </div>`;
    });

    sortedStagingQueue.forEach((item) => {
        const originalIndex = stagingQueue.findIndex(b => b.targetId === item.targetId);
        
        html += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; margin-bottom: 8px; background: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 6px;">
            <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
                <span style="${badgeStyle} background: rgba(34, 197, 94, 0.1); color: #16a34a;">Nové ID ${item.targetId}</span>
                <strong style="color: var(--text-main); font-size: 0.95rem;">${item.dilo}</strong>
                <span style="color: var(--text-muted); font-size: 0.85rem; margin-left: 4px;">(${item.autor})</span>
            </div>
            <button type="button" onclick="removeFromQueue(${originalIndex}, 'add')" style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: 4px; padding: 4px 10px; cursor: pointer; color: var(--text-muted); font-size: 0.75rem; font-weight: bold;">Zrušit</button>
        </div>`;
    });

    if (html === "") {
        html = `
        <div style="text-align: center; padding: 1rem 0; opacity: 0.5;">
            <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">📥</div>
            <em style="color: var(--text-muted); font-size: 0.9rem;">Zatím nebyla připravena žádná díla...</em>
        </div>`;
        container.style.border = "1px dashed var(--border)";
        container.style.background = "transparent";
    } else {
        container.style.border = "none";
        container.style.background = "transparent";
    }
    
    container.innerHTML = html;
};

// --- 🚑 DISASTER RECOVERY & AUTO-SNAPSHOT ---

const createAutoSnapshot = async () => {
    try {
        const res = await fetch('data-spspb.js');
        const content = await res.text();
        const dateStr = new Date().toISOString().slice(0,10);
        const blob = new Blob([content], { type: "text/javascript" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `data-spspb-zaloha-${dateStr}.js`;
        link.click();
    } catch (e) {
        console.error("Auto-záloha selhala.", e);
    }
};

// --- 🚑 DISASTER RECOVERY (Two-Step Verification) ---

let pendingRecoveryPayload = null; // Buffer pro záložní data

window.executeDisasterRecovery = async function(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const text = await file.text();
        if (!text.includes('window.OMEGA_CONFIG')) {
            throw new Error("Soubor neobsahuje platnou OMEGA databázi.");
        }
        
        // Místo nativního confirm() uložíme payload do RAM a otevřeme vlastní UI
        pendingRecoveryPayload = text;
        document.getElementById('omega-recovery-modal').style.display = 'flex';
        document.getElementById('recovery-step-1').style.display = 'block';
        document.getElementById('recovery-step-2').style.display = 'none';

    } catch (err) {
        showToast("❌ Chyba při čtení zálohy: " + err.message);
    }
    
    event.target.value = ''; // Reset file inputu
};

// Logika pro dvoufázový modál
window.showRecoveryStep2 = function() {
    document.getElementById('recovery-step-1').style.display = 'none';
    document.getElementById('recovery-step-2').style.display = 'block';
};

window.closeRecoveryModal = function() {
    document.getElementById('omega-recovery-modal').style.display = 'none';
    pendingRecoveryPayload = null; // Bezpečnostní výmaz RAM
    showToast("ℹ️ Obnova ze zálohy byla zrušena.");
};

window.executeFinalRecovery = function() {
    // 1. 🛡️ ZERO-TRUST BARIÉRA: Získání tokenu z administračního uzlu
    const turnstileInput = document.querySelector('#omega-export-ts [name="cf-turnstile-response"]');
    const turnstileToken = turnstileInput ? turnstileInput.value : null;

    if (!turnstileToken) {
        showToast("⚠️ Bezpečnostní systém Edge ještě nevygeneroval podpis. Vyčkejte sekundu a zkuste to znovu.");
        return;
    }

    // 2. 💾 KOPIE DO BEZPEČÍ: Vytáhneme payload před destrukcí
    const payloadToPush = pendingRecoveryPayload;

    // 3. 🧹 LOKÁLNÍ ÚKLID: Zavřeme modál napřímo (bez vyvolání Toastu o zrušení)
    document.getElementById('omega-recovery-modal').style.display = 'none';
    pendingRecoveryPayload = null; // Bezpečnostní výmaz RAM
    
    // 4. 🚀 TRANSPORT: Odeslání plných dat + důkazu
    pushToCloudflare(payloadToPush, turnstileToken); 
};

// --- 🧬 OMEGA EXPORT ENGINE (Zero-Trust Edition) ---

window.prepareDatabaseExport = async function() {
    // 1. 🛡️ ZERO-TRUST BARIÉRA: Extrakce Turnstile Tokenu
    const turnstileInput = document.querySelector('[name="cf-turnstile-response"]');
    const turnstileToken = turnstileInput ? turnstileInput.value : null;

    if (!turnstileToken) {
        showToast("⚠️ Bezpečnostní systém Cloudflare vás ještě neověřil. Zkuste to za okamžik znovu.");
        console.warn("OMEGA Edge Security: Chybí Turnstile token.");
        return; // Zastaví exekuci, modál se vůbec neotevře
    }

    // 2. Kontrola logiky aplikace
    if (stagingQueue.length === 0 && deleteQueue.length === 0) {
        showToast("⚠️ Fronta změn je prázdná. Připravte alespoň jedno dílo.");
        return;
    }

    await createAutoSnapshot();

    let origBooks = window.OMEGA_CONFIG.KNIHY_DB.filter(k => !deleteQueue.includes(k.id));
    let newDb = [];
    let origPtr = 0; 
    let pendingBooks = [...stagingQueue]; 
    const finalSize = origBooks.length + pendingBooks.length;

    for (let currentId = 1; currentId <= finalSize; currentId++) {
        const newBookIndex = pendingBooks.findIndex(b => b.targetId === currentId);
        if (newBookIndex !== -1) {
            const newBook = pendingBooks[newBookIndex];
            newDb.push({ id: currentId, dilo: newBook.dilo, autor: newBook.autor, druh: newBook.druh, obdobi: newBook.obdobi });
            pendingBooks.splice(newBookIndex, 1); 
        } else if (origPtr < origBooks.length) {
            const oldBook = origBooks[origPtr];
            newDb.push({ id: currentId, dilo: oldBook.dilo, autor: oldBook.autor, druh: oldBook.druh, obdobi: oldBook.obdobi });
            origPtr++; 
        }
    }
    
    if (pendingBooks.length > 0) {
        pendingBooks.forEach(orphan => {
            newDb.push({ id: newDb.length + 1, dilo: orphan.dilo, autor: orphan.autor, druh: orphan.druh, obdobi: orphan.obdobi });
        });
    }

    const bezpecnyText = (str) => str.replace(/"/g, '\\"');

    const formattedDbString = "[\n" + newDb.map(k => 
        `        { id: ${k.id}, dilo: "${bezpecnyText(k.dilo)}", autor: "${bezpecnyText(k.autor)}", druh: "${k.druh}", obdobi: "${k.obdobi}" }`
    ).join(",\n") + "\n    ]";

    const today = new Date().toLocaleDateString('cs-CZ');

    pendingExportPayload = `// =====================================================================
// KONFIGURACE PROSTŘEDÍ: SPŠ a VOŠ PŘÍBRAM (VÝCHOZÍ)
// =====================================================================

window.OMEGA_CONFIG = {
    LAST_UPDATE: "${today}",
    REQUIREMENTS: { do18: 2, "19": 3, svet20: 4, cz20: 5, lyrika: 2, epika: 2, drama: 2 },
    
    FORM_HTML: \`
        <div class="input-group">
            <input type="text" id="student-name" class="styled-input" placeholder="Jméno a příjmení" autocomplete="name">
            <input type="text" id="student-dob" class="styled-input" placeholder="Datum narození (např. 1. 1. 2005)" autocomplete="bday">
            <div class="input-row">
                <input type="text" id="student-class" class="styled-input" placeholder="Třída (např. 4.A)">
                <input type="text" id="student-year" class="styled-input" placeholder="Školní rok">
            </div>
        </div>
    \`,
    RULES_HTML: "",
    FORM_FIELDS: ['name', 'dob', 'class', 'year'],

    renderPdf: ${window.OMEGA_CONFIG.renderPdf.toString()},

    KNIHY_DB: ${formattedDbString}
};`;

    const modal = document.getElementById('omega-confirm-modal');
    const summary = document.getElementById('confirm-modal-summary');
    
    summary.innerHTML = `
        • Počet děl k odstranění: <strong style="color: var(--accent-red)">${deleteQueue.length}</strong><br>
        • Počet nových děl k přidání: <strong style="color: var(--accent-green)">${stagingQueue.length}</strong><br>
        • Výsledný počet knih v DB: <strong>${newDb.length}</strong>
    `;

    modal.style.display = 'flex';
    
    document.getElementById('btn-final-execute').onclick = () => {
        closeConfirmModal();
        // 3. 🛡️ TRANSPORTNÍ VRSTVA: Přidáváme token jako druhý argument
        pushToCloudflare(pendingExportPayload, turnstileToken);
    };
};

window.closeConfirmModal = function() {
    document.getElementById('omega-confirm-modal').style.display = 'none';
};

// --- 🌐 CLOUDFLARE TRANSPORT (Zero-Trust Edition) ---

function pushToCloudflare(fileContent, turnstileToken) {
    const modal = document.getElementById('admin-confirmation-modal');
    const msgEl = document.getElementById('admin-confirmation-msg');
    const downloadBtn = document.getElementById('btn-actual-download');
    
    modal.style.display = 'flex';
    msgEl.innerHTML = `⏳ <strong>Kompiluji databázi a ověřuji identitu přes Edge...</strong><br>Prosím, nezavírejte okno.`;
    if (downloadBtn) downloadBtn.style.display = 'none';

    fetch(OMEGA_ADMIN_CONFIG.WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 🛡️ ZERO-TRUST: Integrace tokenu do tělíčka požadavku
        body: JSON.stringify({ 
            fileContent: fileContent, 
            password: sessionPassword,
            cf_token: turnstileToken 
        })
    })
    .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Neznámá chyba serveru.");
        
        msgEl.innerHTML = `✅ <strong>AKTUALIZACE ÚSPĚŠNÁ!</strong><br>Databáze byla exaktně zapsána do repozitáře.<br><br><span style="color:var(--accent-primary)">Změny se plně propagují za cca 30-60 sekund.</span>`;
        
        stagingQueue = [];
        deleteQueue = [];
        renderStagingQueue();
        if (typeof navrhniDalsiVolneId === 'function') navrhniDalsiVolneId();
        
        // 🛡️ Bezpečnostní reset pro EXPORT widget (Exaktní zacílení v paměti DOMu)
        if (typeof turnstile !== 'undefined') {
            try { turnstile.reset('#omega-export-ts'); } catch (e) { turnstile.reset(); }
            const statusEl = document.getElementById('ts-status-export');
            if (statusEl) {
                statusEl.innerHTML = "⏳ Zajišťuji kryptografický podpis pro zápis...";
                statusEl.style.color = "var(--accent-primary, #e67e22)";
            }
        }
    })
    .catch((error) => {
        msgEl.innerHTML = `❌ <strong>BEZPEČNOSTNÍ NEBO SÍŤOVÁ CHYBA:</strong><br>${error.message}`;
        if (downloadBtn) {
            downloadBtn.style.display = 'block';
            downloadBtn.textContent = "Zavřít a vygenerovat nový podpis";
            // Obrana proti Replay Attack: Zavřeme okno a nutíme uživatele vygenerovat čerstvý token.
            downloadBtn.onclick = () => {
                if (typeof closeAdminConfirmationModal === 'function') {
                    closeAdminConfirmationModal();
                } else {
                    modal.style.display = 'none';
                }
            }; 
        }
        
        // 🛡️ Bezpečnostní reset pro EXPORT widget při chybě
        if (typeof turnstile !== 'undefined') {
            try { turnstile.reset('#omega-export-ts'); } catch (e) { turnstile.reset(); }
            const statusEl = document.getElementById('ts-status-export');
            if (statusEl) {
                statusEl.innerHTML = "⏳ Generuji nový klíč po chybě...";
                statusEl.style.color = "var(--accent-primary, #e67e22)";
            }
        }
    });
}

window.closeAdminConfirmationModal = function() {
    document.getElementById('admin-confirmation-modal').style.display = 'none';
};

// --- 🕵️ STEALTH GATEWAY ---
(function() {
    const buildNode = document.getElementById('app-build-info');
    if (!buildNode) return;

    let interactionCount = 0;
    let interactionTimer = null;

    buildNode.addEventListener('click', () => {
        interactionCount++;
        buildNode.style.opacity = "0.7";
        setTimeout(() => buildNode.style.opacity = "1", 100);
        clearTimeout(interactionTimer);

        if (interactionCount >= 5) {
            window.location.search = atob("P21hdF9jZXRfYWRtaW49dHJ1ZQ=="); 
        }

        interactionTimer = setTimeout(() => {
            interactionCount = 0;
        }, 1500);
    });
})();

// ==========================================
// 🛡️ ZERO-TRUST: EDGE CALLBACK LISTENERS
// ==========================================

window.turnstileSuccessAuth = function(token) {
    const statusEl = document.getElementById('ts-status-auth');
    if (statusEl) {
        statusEl.innerHTML = "✅ Pásmo zajištěno";
        statusEl.style.color = "var(--accent-green, #22c55e)";
    }
};

window.turnstileExpiredAuth = function() {
    const statusEl = document.getElementById('ts-status-auth');
    if (statusEl) {
        statusEl.innerHTML = "⚠️ Kryptografický klíč vypršel. Obnovuji...";
        statusEl.style.color = "var(--accent-red, #da2128)";
    }
    // Turnstile se sám pokusí o auto-refresh, pokud je v interakčním módu.
};

window.turnstileSuccessExport = function(token) {
    const statusEl = document.getElementById('ts-status-export');
    if (statusEl) {
        statusEl.innerHTML = "✅ Podpis připraven. Můžete bezpečně zapsat data.";
        statusEl.style.color = "var(--accent-green, #22c55e)";
    }
};

window.turnstileExpiredExport = function() {
    const statusEl = document.getElementById('ts-status-export');
    if (statusEl) {
        statusEl.innerHTML = "⚠️ Platnost podpisu vypršela. Obnovuji...";
        statusEl.style.color = "var(--accent-red, #da2128)";
    }
};