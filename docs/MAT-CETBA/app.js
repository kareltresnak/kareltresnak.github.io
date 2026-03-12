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
const STORAGE_KEY = 'kanon_selekce_state';
const KNIHY_DB = window.OMEGA_CONFIG.KNIHY_DB;
const REQUIREMENTS = window.OMEGA_CONFIG.REQUIREMENTS;

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
    currentShareUrl = `${baseUrl}?theme=${currentTheme}&?p=${ids}`;

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
    
    if (!payload) return;

    // 🛡️ ANTI-KONTAMINAČNÍ ŠTÍT: Zákaz importu z jiné školy
    if (urlTheme && currentTheme !== 'default' && urlTheme !== currentTheme) {
        // Vyčistíme URL, aby se uživatel nezasekl ve smyčce, a odpálíme upozornění
        window.history.replaceState({}, document.title, window.location.pathname);
        document.getElementById('collision-modal').style.display = 'flex';
        return; // Tvrdé ukončení importu
    }

    const ids = payload.split('-').map(Number);
    const validIds = ids.filter(id => KNIHY_DB.some(k => k.id === id));
    
    if (validIds.length === 0) return;

    // Odstranění URL parametru, ať se necyklí po F5
    window.history.replaceState({}, document.title, window.location.pathname);

    // Krok 1: Výpočet nových děl (kolik z odkazu ještě nemám)
    const newBooksCount = validIds.filter(id => !state.selectedIds.has(id)).length;
    
    // Pokud sdílí úplně to samé, co už mám, tiše ignorujeme
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
                const safeIds = parsed.selectedIds.map(Number).slice(0, 20);
                state.selectedIds = new Set(safeIds);
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

// ======= GENERÁTOR DOKUMENTŮ (MODERNÍ ASYNC ENGINE) =======
elements.btnExport.addEventListener('click', () => {
    if (elements.btnExport.disabled) return;

    const selectedBooks = Array.from(state.selectedIds)
        .map(id => KNIHY_DB.find(k => k.id === id))
        .sort((a, b) => a.id - b.id);

    const printArea = document.getElementById('print-area');
    
    // Generování HTML obsahu z renderPdf
    printArea.innerHTML = window.OMEGA_CONFIG.renderPdf(selectedBooks, state.student, sanitize);
    
    // Krátká pauza pro vykreslení obrázků a následný tisk
    setTimeout(() => {
        window.print();
    }, 500);
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
};
