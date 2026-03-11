// =====================================================================
// KONFIGURACE PROSTŘEDÍ: GYMNÁZIUM PŘÍBRAM
// Vektor: ?theme=gym
// =====================================================================

window.OMEGA_CONFIG = {
    // 1. MATURITNÍ POŽADAVKY
    REQUIREMENTS: { do18: 2, "19": 3, svet20: 4, cz20: 5, lyrika: 2, epika: 2, drama: 2 },
    
    // 2. MODULÁRNÍ FORMULÁŘ (Redukovaný o datum narození)
    FORM_HTML: `
        <div class="input-group">
            <input type="text" id="student-name" class="styled-input" placeholder="Jméno a příjmení" autocomplete="name">
            <div class="input-row">
                <input type="text" id="student-class" class="styled-input" placeholder="Třída (např. 4.A)">
                <input type="text" id="student-year" class="styled-input" placeholder="Školní rok">
            </div>
            <div style="margin-top: 10px; padding: 10px; background: rgba(230,81,0,0.1); border-left: 3px solid var(--accent-rust); font-size: 0.75rem; color: var(--text-muted);">
                <strong>Pozor na autory:</strong> Gymnázium povoluje max. 1 dílo od stejného autora (Výjimky: W. Shakespeare a K. Čapek - max 2, pokud se liší žánr).
            </div>
        </div>
    `,
    
    // 3. ID PRVKŮ FORMULÁŘE (Pro Auto-save)
    FORM_FIELDS: ['name', 'class', 'year'],

    renderPdf: function(selectedBooks, student, sanitize) {
        let rows = '';
        for (let i = 0; i < 20; i++) {
            let k = selectedBooks[i];
            let autor = k && k.autor !== "-" ? k.autor : "";
            let dilo = k ? k.dilo : "";
            rows += `
                <tr style="background: white !important;">
                    <td style="border: 1px solid black; text-align: center; height: 8.7mm; padding: 0 5px; font-size: 11pt !important; font-weight: bold !important; color: black !important;">${i + 1}</td>
                    <td style="border: 1px solid black; padding: 0 8px; font-size: 11pt !important; color: black !important;">${autor}</td>
                    <td style="border: 1px solid black; padding: 0 8px; font-size: 11pt !important; color: black !important;">${dilo}</td>
                </tr>
            `;
        }

        return `
            <style>
                @page { size: A4 portrait; margin: 0 !important; }
                
                @media print {
                    body, html { margin: 0 !important; padding: 0 !important; background: white !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }

                .print-page {
                    width: 210mm;
                    height: 297mm;
                    padding: 15mm 20mm;
                    background: white !important;
                    color: black !important;
                    font-family: 'Calibri', 'Arial', sans-serif !important;
                    position: relative;
                    box-sizing: border-box;
                    overflow: hidden;
                }

                .p-header { position: relative; height: 70px; margin-bottom: 15px; }
                .p-logo { position: absolute; left: 0; top: 0; height: 75px; width: auto; z-index: 2; }
                .p-school-name { 
                    position: absolute; left: 0; right: 0; top: 18px; 
                    text-align: center; font-size: 9pt; text-transform: uppercase; font-weight: normal;
                }
                .p-header-line { 
                    position: absolute; left: 85px; right: 0; top: 38px; 
                    border-bottom: 1px solid black; z-index: 1;
                }

                .p-titles { text-align: center; margin-bottom: 15px; }
                .p-h1 { font-size: 24pt; margin: 0 0 20px 0; font-weight: normal; letter-spacing: 0.5px; }
                .p-h2 { font-size: 13pt; margin: 0; line-height: 1.3; font-weight: normal; text-transform: uppercase; }

                .p-info-table { width: 95%; border-collapse: collapse; margin-bottom: 15px; margin-left: 10px; }
                .p-info-table td { border: none; padding: 0; vertical-align: bottom; font-size: 11pt; color: black; height: 22px; }
                .p-label { padding-right: 5px; white-space: nowrap; }
                .p-val { 
                    border-bottom: 1px solid black !important; 
                    padding: 0 5px 1px 5px !important; 
                    font-weight: normal;
                }

                /* Oprava: Minimalizace výšky a fixace ohraničení hlavičky */
                .p-main-table { width: 100%; border-collapse: collapse; border: 2.5pt solid black; margin-bottom: 15px; table-layout: fixed; }
                .p-main-table th { 
                    border: 1px solid black !important; 
                    border-bottom: 2.5pt solid black !important; 
                    border-right: 2.5pt solid black !important;
                    padding: 2px 8px !important;
                    text-align: left; 
                    font-weight: normal; 
                    font-size: 10pt; /* Mírně menší font pro úsporu místa */
                    background: white !important; 
                    color: black !important;
                    height: 16px !important;
                    white-space: nowrap; /* Zamezení zalomení textu */
                    vertical-align: middle;
                    text-transform: none !important;
                    letter-spacing: normal !important;
                }
                .p-col-1 { width: 15%; }
                .p-col-2 { width: 35%; }
                .p-col-3 { width: 50%; }
            </style>
            
            <div class="print-page">
                <div class="p-header">
                    <img src="gympb-logo.png" class="p-logo" onerror="this.style.display='none'">
                    <div class="p-school-name">GYMNÁZIUM, PŘÍBRAM, LEGIONÁŘŮ 402</div>
                    <div class="p-header-line"></div>
                </div>

                <div class="p-titles">
                    <div class="p-h1">SEZNAM ČETBY</div>
                    <div class="p-h2">K ÚSTNÍ ZKOUŠCE Z ČESKÉHO JAZYKA A LITERATURY<br>SPOLEČNÉ ČÁSTI MATURITNÍ ZKOUŠKY</div>
                </div>

                <table class="p-info-table">
                    <tr>
                        <td class="p-label" style="width: 1%;">Jméno:</td>
                        <td class="p-val" style="width: 45%;">${student.name || ""}</td>
                        <td class="p-label" style="width: 1%; padding-left: 15px;">Třída:</td>
                        <td class="p-val" style="width: 25%;">${student.class || ""}</td>
                        <td class="p-label" style="width: 1%; padding-left: 15px;">Školní rok:</td>
                        <td class="p-val" style="width: 25%;">${student.year || ""}</td>
                    </tr>
                </table>

                <table class="p-main-table">
                    <thead>
                        <tr>
                            <th class="p-col-1">Číslo otázky</th>
                            <th class="p-col-2">Autor</th>
                            <th class="p-col-3">Dílo</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>

                <div style="display: flex; justify-content: flex-end; margin-top: 60px;">
                    <div style="width: 220px; text-align: center;">
                        <div style="border-bottom: 1px solid black; height: 12px; margin-bottom: 4px;"></div>
                        <div style="font-size: 10pt;">podpis studenta</div>
                    </div>
                </div>
            </div>
        `;
    },

    // 4. DATABÁZE DĚL (Striktně dle oficiálního seznamu Gymnázia Příbram)
    KNIHY_DB: [
        // ==========================================
        // Světová a česká literatura do konce 18. století
        // ==========================================
        { id: 1, dilo: "Božská komedie", autor: "Alighieri Dante", druh: "epika", obdobi: "do18" },
        { id: 2, dilo: "Bible", autor: "-", druh: "epika", obdobi: "do18" },
        { id: 3, dilo: "Dekameron", autor: "Boccaccio, G.", druh: "epika", obdobi: "do18" },
        { id: 4, dilo: "Důmyslný rytíř Don Quijote de la Mancha", autor: "Cervantes, M.", druh: "epika", obdobi: "do18" },
        { id: 5, dilo: "Epos o Gilgamešovi", autor: "-", druh: "epika", obdobi: "do18" },
        { id: 6, dilo: "Utrpení mladého Werthera", autor: "Goethe, J. W.", druh: "epika", obdobi: "do18" },
        { id: 7, dilo: "Faust", autor: "Goethe, J. W.", druh: "drama", obdobi: "do18" },
        { id: 8, dilo: "Odysea", autor: "Homér", druh: "epika", obdobi: "do18" },
        { id: 9, dilo: "Vita Caroli", autor: "Karel IV.", druh: "epika", obdobi: "do18" },
        { id: 10, dilo: "Labyrint světa a ráj srdce", autor: "Komenský, J. A.", druh: "epika", obdobi: "do18" },
        { id: 11, dilo: "Legenda o sv. Kateřině", autor: "-", druh: "epika", obdobi: "do18" },
        { id: 12, dilo: "Vladař", autor: "Machiavelli, N.", druh: "epika", obdobi: "do18" },
        { id: 13, dilo: "Lakomec", autor: "Moliére", druh: "drama", obdobi: "do18" },
        { id: 14, dilo: "Tartuffe", autor: "Moliére", druh: "drama", obdobi: "do18" },
        { id: 15, dilo: "Hamlet", autor: "Shakespeare, W.", druh: "drama", obdobi: "do18" },
        { id: 16, dilo: "Král Lear", autor: "Shakespeare, W.", druh: "drama", obdobi: "do18" },
        { id: 17, dilo: "Othelo", autor: "Shakespeare, W.", druh: "drama", obdobi: "do18" },
        { id: 18, dilo: "Romeo a Julie", autor: "Shakespeare, W.", druh: "drama", obdobi: "do18" },
        { id: 19, dilo: "Sonety", autor: "Shakespeare, W.", druh: "lyrika", obdobi: "do18" },
        { id: 20, dilo: "Zkrocení zlé ženy", autor: "Shakespeare, W.", druh: "drama", obdobi: "do18" },
        { id: 21, dilo: "Oidipus", autor: "Sofokles", druh: "drama", obdobi: "do18" },
        { id: 22, dilo: "Gulliverovy cesty", autor: "Swift, J.", druh: "epika", obdobi: "do18" },
        { id: 23, dilo: "Tristan a Isolda (zpracování Bediéra)", autor: "-", druh: "epika", obdobi: "do18" },
        { id: 24, dilo: "Závěť", autor: "Villon, F.", druh: "lyrika", obdobi: "do18" },

        // ==========================================
        // Světová poezie a próza do 19. století
        // ==========================================
        { id: 25, dilo: "Pýcha a předsudek", autor: "Austenová, J.", druh: "epika", obdobi: "19" },
        { id: 26, dilo: "Otec Goriot", autor: "Balzac, H.", druh: "epika", obdobi: "19" },
        { id: 27, dilo: "Květy zla", autor: "Baudelaire, Ch.", druh: "lyrika", obdobi: "19" },
        { id: 28, dilo: "Alenka v kraji divů", autor: "Caroll, L.", druh: "epika", obdobi: "19" },
        { id: 29, dilo: "Nadějné vyhlídky", autor: "Dickens, Ch.", druh: "epika", obdobi: "19" },
        { id: 30, dilo: "Oliver Twist", autor: "Dickens, Ch.", druh: "epika", obdobi: "19" },
        { id: 31, dilo: "Idiot", autor: "Dostojevskij, F. M.", druh: "epika", obdobi: "19" },
        { id: 32, dilo: "Zločin a trest", autor: "Dostojevskij, F. M.", druh: "epika", obdobi: "19" },
        { id: 33, dilo: "Salambo", autor: "Flaubert, G.", druh: "epika", obdobi: "19" },
        { id: 34, dilo: "Paní Bovaryová", autor: "Flaubert, G.", druh: "epika", obdobi: "19" },
        { id: 35, dilo: "Bídníci", autor: "Hugo, V.", druh: "epika", obdobi: "19" },
        { id: 36, dilo: "Chrám Matky Boží v Paříži", autor: "Hugo, V.", druh: "epika", obdobi: "19" },
        { id: 37, dilo: "Miláček", autor: "Maupassant, G.", druh: "epika", obdobi: "19" },
        { id: 38, dilo: "Havran", autor: "Poe, E. A.", druh: "lyrika", obdobi: "19" },
        { id: 39, dilo: "Povídky", autor: "Poe, E. A.", druh: "epika", obdobi: "19" },
        { id: 40, dilo: "Evžen Oněgin", autor: "Puškin, A. S.", druh: "epika", obdobi: "19" },
        { id: 41, dilo: "Červený a černý", autor: "Stendhal", druh: "epika", obdobi: "19" },
        { id: 42, dilo: "Anna Kareninová", autor: "Tolstoj, L. N.", druh: "epika", obdobi: "19" },
        { id: 43, dilo: "Obraz Doriana Graye", autor: "Wilde, O.", druh: "epika", obdobi: "19" },
        { id: 44, dilo: "Zabiják", autor: "Zola, E.", druh: "epika", obdobi: "19" },

        // ==========================================
        // Česká poezie a próza 19. století
        // ==========================================
        { id: 45, dilo: "Svatý Xaverius", autor: "Arbes, J.", druh: "epika", obdobi: "19" },
        { id: 46, dilo: "Tajemné dálky", autor: "Březina, O.", druh: "lyrika", obdobi: "19" },
        { id: 47, dilo: "Nový epochální výlet pana Broučka...", autor: "Čech, S.", druh: "epika", obdobi: "19" },
        { id: 48, dilo: "Kytice", autor: "Erben, K. J.", druh: "lyrika", obdobi: "19" },
        { id: 49, dilo: "Křest sv. Vladimíra", autor: "Havlíček Borovský, K.", druh: "epika", obdobi: "19" },
        { id: 50, dilo: "Máj", autor: "Mácha, K. H.", druh: "lyrika", obdobi: "19" },
        { id: 51, dilo: "Cikáni", autor: "Mácha, K. H.", druh: "epika", obdobi: "19" },
        { id: 52, dilo: "Babička", autor: "Němcová, B.", druh: "epika", obdobi: "19" },
        { id: 53, dilo: "Divá Bára", autor: "Němcová, B.", druh: "epika", obdobi: "19" },
        { id: 54, dilo: "Balady a romance", autor: "Neruda, J.", druh: "lyrika", obdobi: "19" },
        { id: 55, dilo: "Písně kosmické", autor: "Neruda, J.", druh: "lyrika", obdobi: "19" },
        { id: 56, dilo: "Povídky malostranské", autor: "Neruda, J.", druh: "epika", obdobi: "19" },
        { id: 57, dilo: "Kalibův zločin", autor: "Rais, J. V.", druh: "epika", obdobi: "19" },
        { id: 58, dilo: "Kuře melancholik", autor: "Šlejhar, J. K.", druh: "epika", obdobi: "19" },
        { id: 59, dilo: "Okna v bouři", autor: "Vrchlický, J.", druh: "lyrika", obdobi: "19" },
        { id: 60, dilo: "Tři legendy o krucifixu", autor: "Zeyer, J.", druh: "epika", obdobi: "19" },

        // ==========================================
        // Světová a česká dramatická tvorba 19. – 21. století
        // ==========================================
        { id: 61, dilo: "Čekání na Godota", autor: "Beckett, S.", druh: "drama", obdobi: "svet20" },
        { id: 62, dilo: "Loupežník", autor: "Čapek, K.", druh: "drama", obdobi: "cz20" },
        { id: 63, dilo: "RUR", autor: "Čapek, K.", druh: "drama", obdobi: "cz20" },
        { id: 64, dilo: "Bílá nemoc", autor: "Čapek, K.", druh: "drama", obdobi: "cz20" },
        { id: 65, dilo: "Matka", autor: "Čapek, K.", druh: "drama", obdobi: "cz20" },
        { id: 66, dilo: "Ze života hmyzu", autor: "Čapkové, K. a J.", druh: "drama", obdobi: "cz20" },
        { id: 67, dilo: "Višňový sad", autor: "Čechov, A. P.", druh: "drama", obdobi: "svet20" },
        { id: 68, dilo: "Fyzikové", autor: "Durrenmatt, F.", druh: "drama", obdobi: "svet20" },
        { id: 69, dilo: "Revizor", autor: "Gogol. N. V.", druh: "drama", obdobi: "19" },
        { id: 70, dilo: "Largo desolato", autor: "Havel, V.", druh: "drama", obdobi: "cz20" },
        { id: 71, dilo: "Zahradní slavnost", autor: "Havel, V.", druh: "drama", obdobi: "cz20" },
        { id: 72, dilo: "Vernisáž", autor: "Havel, V.", druh: "drama", obdobi: "cz20" },
        { id: 73, dilo: "Domeček pro panenky (Nora)", autor: "Ibsen, H.", druh: "drama", obdobi: "19" },
        { id: 74, dilo: "Maryša", autor: "Mrštíkové, A. a V.", druh: "drama", obdobi: "19" },
        { id: 75, dilo: "Smrt obchodního cestujícího", autor: "Miller, A.", druh: "drama", obdobi: "svet20" },
        { id: 76, dilo: "Její pastorkyňa", autor: "Preissová, G.", druh: "drama", obdobi: "19" },
        { id: 77, dilo: "Cyrano z Bergeracu", autor: "Rostand, E.", druh: "drama", obdobi: "19" },
        { id: 78, dilo: "Pygmalion", autor: "Shaw, G. B.", druh: "drama", obdobi: "svet20" },
        { id: 79, dilo: "Strakonický dudák", autor: "Tyl, J. K.", druh: "drama", obdobi: "19" },
        { id: 80, dilo: "České nebe", autor: "Smoljak, L., Svěrák, Z.", druh: "drama", obdobi: "cz20" },
        { id: 81, dilo: "Dobytí seveního pólu", autor: "Smoljak, L., Svěrák, Z.", druh: "drama", obdobi: "cz20" },
        { id: 82, dilo: "Vest pocket revue", autor: "Voskovec, J., Werich, J.", druh: "drama", obdobi: "cz20" },
        { id: 83, dilo: "Balada z hadrů", autor: "Voskovec, J., Werich, J.", druh: "drama", obdobi: "cz20" },
        { id: 84, dilo: "Osel a stín", autor: "Voskovec, J., Werich, J.", druh: "drama", obdobi: "cz20" },
        { id: 85, dilo: "Noc na Karlštejně", autor: "Vrchlický, J.", druh: "drama", obdobi: "19" },
        { id: 86, dilo: "Jak je důležité míti Filipa", autor: "Wilde, O.", druh: "drama", obdobi: "19" },
        { id: 87, dilo: "Kočka na rozpálené plechové střeše", autor: "Williams, T.", druh: "drama", obdobi: "svet20" },

        // ==========================================
        // Česká a světová poezie 20. a 21. století
        // ==========================================
        { id: 88, dilo: "Slezské písně", autor: "Bezruč, P.", druh: "lyrika", obdobi: "cz20" },
        { id: 89, dilo: "Po nás ať přijde potopa", autor: "Gellner, F.", druh: "lyrika", obdobi: "cz20" },
        { id: 90, dilo: "Radosti života", autor: "Gellner, F.", druh: "lyrika", obdobi: "cz20" },
        { id: 91, dilo: "Příběhy", autor: "Holan, V.", druh: "lyrika", obdobi: "cz20" },
        { id: 92, dilo: "Noc s Hamletem", autor: "Holan, V.", druh: "lyrika", obdobi: "cz20" },
        { id: 93, dilo: "Blues pro bláznivou holku", autor: "Hrabě, V.", druh: "lyrika", obdobi: "cz20" },
        { id: 94, dilo: "Romance pro křídlovku", autor: "Hrubín, F.", druh: "lyrika", obdobi: "cz20" },
        { id: 95, dilo: "Hirošima", autor: "Hrubín, F.", druh: "lyrika", obdobi: "cz20" },
        { id: 96, dilo: "Dny v roce", autor: "Kolář, J.", druh: "lyrika", obdobi: "cz20" },
        { id: 97, dilo: "Kníška Karla Kryla", autor: "Kryl, K.", druh: "lyrika", obdobi: "cz20" },
        { id: 98, dilo: "Šibeniční písně", autor: "Morgenstern, Ch.", druh: "lyrika", obdobi: "svet20" },
        { id: 99, dilo: "Pantomima", autor: "Nezval, V.", druh: "lyrika", obdobi: "cz20" },
        { id: 100, dilo: "Edison", autor: "Nezval, V.", druh: "lyrika", obdobi: "cz20" },
        { id: 101, dilo: "Elegie", autor: "Orten, J.", druh: "lyrika", obdobi: "cz20" },
        { id: 102, dilo: "Býti básníkem", autor: "Seifert, J.", druh: "lyrika", obdobi: "cz20" },
        { id: 103, dilo: "Maminka", autor: "Seifert, J.", druh: "lyrika", obdobi: "cz20" },
        { id: 104, dilo: "Morový sloup", autor: "Seifert, J.", druh: "lyrika", obdobi: "cz20" },
        { id: 105, dilo: "Píseň o Viktorce", autor: "Seifert, J.", druh: "lyrika", obdobi: "cz20" },
        { id: 106, dilo: "Smuténka", autor: "Skácel, J.", druh: "lyrika", obdobi: "cz20" },
        { id: 107, dilo: "Co zbylo z anděla", autor: "Skácel, J.", druh: "lyrika", obdobi: "cz20" },
        { id: 108, dilo: "Měsíce", autor: "Toman, K.", druh: "lyrika", obdobi: "cz20" },
        { id: 109, dilo: "Těžká hodina", autor: "Wolker, J.", druh: "lyrika", obdobi: "cz20" },
        { id: 110, dilo: "Pokušení smrti", autor: "Zahradníček, J.", druh: "lyrika", obdobi: "cz20" },

        // ==========================================
        // Světová próza 20. a 21. století
        // ==========================================
        { id: 111, dilo: "Popraviště", autor: "Ajtmatov, Č.", druh: "epika", obdobi: "svet20" },
        { id: 112, dilo: "Šťastný Jim", autor: "Amis, K.", druh: "epika", obdobi: "svet20" },
        { id: 113, dilo: "Klaunovy názory", autor: "Böll, H.", druh: "epika", obdobi: "svet20" },
        { id: 114, dilo: "Mistr a Markétka", autor: "Bulgakov, M.", druh: "epika", obdobi: "svet20" },
        { id: 115, dilo: "451 stupňů Fahrenheita", autor: "Bradbury, R.", druh: "epika", obdobi: "svet20" },
        { id: 116, dilo: "Marťanská kronika", autor: "Bradbury, R.", druh: "epika", obdobi: "svet20" },
        { id: 117, dilo: "Cizinec", autor: "Camus, A.", druh: "epika", obdobi: "svet20" },
        { id: 118, dilo: "2001: Vesmírná odysea", autor: "Clarke, A. C.", druh: "epika", obdobi: "svet20" },
        { id: 119, dilo: "Alchymista", autor: "Coelho, P.", druh: "epika", obdobi: "svet20" },
        { id: 120, dilo: "Americká tragedie", autor: "Dreiser, T.", druh: "epika", obdobi: "svet20" },
        { id: 121, dilo: "Jméno růže", autor: "Eco, U.", druh: "epika", obdobi: "svet20" },
        { id: 122, dilo: "Velký Gatsby", autor: "Fitzgerald, F. S.", druh: "epika", obdobi: "svet20" },
        { id: 123, dilo: "Pán much", autor: "Golding, W.", druh: "epika", obdobi: "svet20" },
        { id: 124, dilo: "Plechový bubínek", autor: "Grass, G.", druh: "epika", obdobi: "svet20" },
        { id: 125, dilo: "Siddhártha", autor: "Hesse, H.", druh: "epika", obdobi: "svet20" },
        { id: 126, dilo: "Krásný nový svět", autor: "Huxley, A.", druh: "epika", obdobi: "svet20" },
        { id: 127, dilo: "Svět podle Garpa", autor: "Irving, J.", druh: "epika", obdobi: "svet20" },
        { id: 128, dilo: "Modlitba pro Owena Meanyho", autor: "Irving, J.", druh: "epika", obdobi: "svet20" },
        { id: 129, dilo: "Komu zvoní hrana", autor: "Hemingway, E.", druh: "epika", obdobi: "svet20" },
        { id: 130, dilo: "Stařec a moře", autor: "Hemingway, E.", druh: "epika", obdobi: "svet20" },
        { id: 131, dilo: "Odysseus", autor: "Joyce, J.", druh: "epika", obdobi: "svet20" },
        { id: 132, dilo: "Vyhoďme ho z kola ven", autor: "Kesey, K.", druh: "epika", obdobi: "svet20" },
        { id: 133, dilo: "Na cestě", autor: "Kerouac, J.", druh: "epika", obdobi: "svet20" },
        { id: 134, dilo: "Tulák po hvězdách", autor: "London, J.", druh: "epika", obdobi: "svet20" },
        { id: 135, dilo: "Sto roků samoty", autor: "Marquéz, G. G.", druh: "epika", obdobi: "svet20" },
        { id: 136, dilo: "Kronika ohlášené smrti", autor: "Marquéz, G. G.", druh: "epika", obdobi: "svet20" },
        { id: 137, dilo: "Cesta", autor: "McCarthy, C.", druh: "epika", obdobi: "svet20" },
        { id: 138, dilo: "Norské dřevo", autor: "Murakami, H.", druh: "epika", obdobi: "svet20" },
        { id: 139, dilo: "Lolita", autor: "Nabokov, V.", druh: "epika", obdobi: "svet20" },
        { id: 140, dilo: "1984", autor: "Orwell, G.", druh: "epika", obdobi: "svet20" },
        { id: 141, dilo: "Farma zvířat", autor: "Orwell, G.", druh: "epika", obdobi: "svet20" },
        { id: 142, dilo: "Doktor Živago", autor: "Pasternak, B.", druh: "epika", obdobi: "svet20" },
        { id: 143, dilo: "Na západní frontě klid", autor: "Remarque, E. M.", druh: "epika", obdobi: "svet20" },
        { id: 144, dilo: "Petr a Lucie", autor: "Rolland, R.", druh: "epika", obdobi: "svet20" },
        { id: 145, dilo: "Malý princ", autor: "Saint-Exupéry A. de", druh: "epika", obdobi: "svet20" },
        { id: 146, dilo: "Kdo chytá v žitě", autor: "Salinger, J. D.", druh: "epika", obdobi: "svet20" },
        { id: 147, dilo: "Zeď", autor: "Sartre, J. P.", druh: "epika", obdobi: "svet20" },
        { id: 148, dilo: "O myších a lidech", autor: "Steinbeck, J.", druh: "epika", obdobi: "svet20" },
        { id: 149, dilo: "Sophiina volba", autor: "Styron, W.", druh: "epika", obdobi: "svet20" },
        { id: 150, dilo: "Jeden den Ivana Denisoviče", autor: "Solženicyn, A.", druh: "epika", obdobi: "svet20" },
        { id: 151, dilo: "Osud člověka", autor: "Šolochov A. M.", druh: "epika", obdobi: "svet20" },
        { id: 152, dilo: "Hobit", autor: "Tolkien, J. R. R.", druh: "epika", obdobi: "svet20" },
        { id: 153, dilo: "Válka světů", autor: "Wells, H. G.", druh: "epika", obdobi: "svet20" },
        { id: 154, dilo: "Paní Dallowayová", autor: "Woolfová, V.", druh: "epika", obdobi: "svet20" },
        { id: 155, dilo: "Den trifidů", autor: "Wyndham, J.", druh: "epika", obdobi: "svet20" },

        // ==========================================
        // Česká próza 20. a 21. století
        // ==========================================
        { id: 156, dilo: "Zeptej se táty", autor: "Balabán. J.", druh: "epika", obdobi: "cz20" },
        { id: 157, dilo: "Indiánský běh", autor: "Boučková, T.", druh: "epika", obdobi: "cz20" },
        { id: 158, dilo: "Boží muka", autor: "Čapek, K.", druh: "epika", obdobi: "cz20" },
        { id: 159, dilo: "Anglické listy", autor: "Čapek, K.", druh: "epika", obdobi: "cz20" },
        { id: 160, dilo: "Továrna na absolutno", autor: "Čapek, K.", druh: "epika", obdobi: "cz20" },
        { id: 161, dilo: "Krakatit", autor: "Čapek, K.", druh: "epika", obdobi: "cz20" },
        { id: 162, dilo: "Válka s mloky", autor: "Čapek, K.", druh: "epika", obdobi: "cz20" },
        { id: 163, dilo: "Povídky z jedné kapsy", autor: "Čapek, K.", druh: "epika", obdobi: "cz20" },
        { id: 164, dilo: "Hrdý Budžes", autor: "Dousková, I.", druh: "epika", obdobi: "cz20" },
        { id: 165, dilo: "Němá barikáda", autor: "Drda, J.", druh: "epika", obdobi: "cz20" },
        { id: 166, dilo: "Krysař", autor: "Dyk, V.", druh: "epika", obdobi: "cz20" },
        { id: 167, dilo: "Rekviem", autor: "Durych, J.", druh: "epika", obdobi: "cz20" },
        { id: 168, dilo: "Spalovač mrtvol", autor: "Fuks, L.", druh: "epika", obdobi: "cz20" },
        { id: 169, dilo: "Petrolejové lampy", autor: "Havlíček, J.", druh: "epika", obdobi: "cz20" },
        { id: 170, dilo: "Žhář", autor: "Hostovský, E.", druh: "epika", obdobi: "cz20" },
        { id: 171, dilo: "Osudy dobrého vojáka Švejka", autor: "Hašek, J.", druh: "epika", obdobi: "cz20" },
        { id: 172, dilo: "Obsluhoval jsem anglického krále", autor: "Hrabal, B.", druh: "epika", obdobi: "cz20" },
        { id: 173, dilo: "Příliš hlučná samota", autor: "Hrabal, B.", druh: "epika", obdobi: "cz20" },
        { id: 174, dilo: "Perlička na dně", autor: "Hrabal, B.", druh: "epika", obdobi: "cz20" },
        { id: 175, dilo: "Ostře sledované vlaky", autor: "Hrabal, B.", druh: "epika", obdobi: "cz20" },
        { id: 176, dilo: "Saturnin", autor: "Jirotka, Z.", druh: "epika", obdobi: "cz20" },
        { id: 177, dilo: "Paměť mojí babičce", autor: "Hůlová, P.", druh: "epika", obdobi: "cz20" },
        { id: 178, dilo: "Proces", autor: "Kafka, F.", druh: "epika", obdobi: "cz20" },
        { id: 179, dilo: "Proměna", autor: "Kafka, F.", druh: "epika", obdobi: "cz20" },
        { id: 180, dilo: "Přítelkyně z domu smutku", autor: "Kantůrková, E.", druh: "epika", obdobi: "cz20" },
        { id: 181, dilo: "Kladivo na čarodějnice", autor: "Kaplický, V.", druh: "epika", obdobi: "cz20" },
        { id: 182, dilo: "U severní zdi", autor: "Klabouchová, P.", druh: "epika", obdobi: "cz20" },
        { id: 183, dilo: "Má veselá jitra", autor: "Klíma, I.", druh: "epika", obdobi: "cz20" },
        { id: 184, dilo: "Katyně", autor: "Kohout, P.", druh: "epika", obdobi: "cz20" },
        { id: 185, dilo: "Kde je zakopán pes", autor: "Kohout, P.", druh: "epika", obdobi: "cz20" },
        { id: 186, dilo: "Adelheid", autor: "Körner, V.", druh: "epika", obdobi: "cz20" },
        { id: 187, dilo: "Směšné lásky", autor: "Kundera, M.", druh: "epika", obdobi: "cz20" },
        { id: 188, dilo: "Nesnesitelná lehkost bytí", autor: "Kundera, M.", druh: "epika", obdobi: "cz20" },
        { id: 189, dilo: "Valčík na rozloučenou", autor: "Kundera, M.", druh: "epika", obdobi: "cz20" },
        { id: 190, dilo: "Žert", autor: "Kundera, M.", druh: "epika", obdobi: "cz20" },
        { id: 191, dilo: "Želary", autor: "Legátová, K.", druh: "epika", obdobi: "cz20" },
        { id: 192, dilo: "Jozova Hanula", autor: "Legátová, K.", druh: "epika", obdobi: "cz20" },
        { id: 193, dilo: "Navzdory básník zpívá", autor: "Loukotková, J.", druh: "epika", obdobi: "cz20" },
        { id: 194, dilo: "Modlitba pro Kateřinu Horovitzovou", autor: "Lustig, A.", druh: "epika", obdobi: "cz20" },
        { id: 195, dilo: "Smrt si říká Engelchen", autor: "Mňačko, L.", druh: "epika", obdobi: "cz20" },
        { id: 196, dilo: "Hana", autor: "Mornštajnová, A.", druh: "epika", obdobi: "cz20" },
        { id: 197, dilo: "Listopád", autor: "Mornštajnová, A.", druh: "epika", obdobi: "cz20" },
        { id: 198, dilo: "Nikola Šuhaj loupežník", autor: "Olbracht, I.", druh: "epika", obdobi: "cz20" },
        { id: 199, dilo: "Romeo, Julie a tma", autor: "Otčenášek, J.", druh: "epika", obdobi: "cz20" },
        { id: 200, dilo: "Jak jsem potkal ryby", autor: "Pavel, O.", druh: "epika", obdobi: "cz20" },
        { id: 201, dilo: "Smrt krásných srnců", autor: "Pavel, O.", druh: "epika", obdobi: "cz20" },
        { id: 202, dilo: "Na co umírají muži", autor: "Pecka, K.", druh: "epika", obdobi: "cz20" },
        { id: 203, dilo: "...a bude hůř", autor: "Pelc, J.", druh: "epika", obdobi: "cz20" },
        { id: 204, dilo: "Bylo nás pět", autor: "Poláček, K.", druh: "epika", obdobi: "cz20" },
        { id: 205, dilo: "Národní třída", autor: "Rudiš, J.", druh: "epika", obdobi: "cz20" },
        { id: 206, dilo: "Legenda Emöke", autor: "Škvorecký, J.", druh: "epika", obdobi: "cz20" },
        { id: 207, dilo: "Mirákl", autor: "Škvorecký, J.", druh: "epika", obdobi: "cz20" },
        { id: 208, dilo: "Zbabělci", autor: "Škvorecký, J.", druh: "epika", obdobi: "cz20" },
        { id: 209, dilo: "Vyhnání Gerty Schnirch", autor: "Tučková, K.", druh: "epika", obdobi: "cz20" },
        { id: 210, dilo: "Žítkovské bohyně", autor: "Tučková, K.", druh: "epika", obdobi: "cz20" },
        { id: 211, dilo: "Marketa Lazarová", autor: "Vančura, V.", druh: "epika", obdobi: "cz20" },
        { id: 212, dilo: "Rozmarné léto", autor: "Vančura, V.", druh: "epika", obdobi: "cz20" },
        { id: 213, dilo: "Báječná léta pod psa", autor: "Viewegh, M.", druh: "epika", obdobi: "cz20" }
    ],

    // 5. TVRDÁ VALIDACE (Přizpůsobena nové syntaxi autorů)
    customValidation: function(selectedBooks) {
        let errors = [];
        let authorMap = {};

        // Extrakce dat (anonymní autory jako "-" ignorujeme pro autorský limit)
        selectedBooks.forEach(k => {
            if (k.autor === "-") return; 
            
            if (!authorMap[k.autor]) authorMap[k.autor] = { count: 0, druhy: new Set() };
            authorMap[k.autor].count++;
            authorMap[k.autor].druhy.add(k.druh);
        });

        // Kontrola limitů
        for (const autor in authorMap) {
            const data = authorMap[autor];

            if (autor === "Čapek, K.") { 
                if (data.count > 2) {
                    errors.push(`<b>${autor}:</b> Povolena max. 2 díla.`);
                } else if (data.count === 2 && (!data.druhy.has("epika") || !data.druhy.has("drama"))) {
                    errors.push(`<b>${autor}:</b> Při 2 dílech musí být exaktně 1 próza (epika) a 1 drama.`);
                }
            } else if (autor === "Shakespeare, W.") { 
                if (data.count > 2) {
                    errors.push(`<b>${autor}:</b> Povolena max. 2 díla.`);
                } else if (data.count === 2 && (!data.druhy.has("lyrika") || !data.druhy.has("drama"))) {
                    errors.push(`<b>${autor}:</b> Při 2 dílech musí být exaktně 1 poezie (lyrika) a 1 drama.`);
                }
            } else {
                if (data.count > 1) {
                    errors.push(`<b>${autor}:</b> Povoleno striktně pouze 1 dílo.`);
                }
            }
        }

        return { isValid: errors.length === 0, errors: errors };
    }
}
