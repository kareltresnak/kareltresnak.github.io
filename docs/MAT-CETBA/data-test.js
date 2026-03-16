// =====================================================================
// KONFIGURACE PROSTŘEDÍ: SPŠ a VOŠ PŘÍBRAM (VÝCHOZÍ)
// =====================================================================

window.OMEGA_CONFIG = {
    LAST_UPDATE: "16. 3. 2026",
    REQUIREMENTS: { do18: 2, "19": 3, svet20: 4, cz20: 5, lyrika: 2, epika: 2, drama: 2 },
    
    FORM_HTML: `
        <div class="input-group">
            <input type="text" id="student-name" class="styled-input" placeholder="Jméno a příjmení" autocomplete="name">
            <input type="text" id="student-dob" class="styled-input" placeholder="Datum narození (např. 1. 1. 2005)" autocomplete="bday">
            <div class="input-row">
                <input type="text" id="student-class" class="styled-input" placeholder="Třída (např. 4.A)">
                <input type="text" id="student-year" class="styled-input" placeholder="Školní rok">
            </div>
        </div>
    `,
    RULES_HTML: "",
    FORM_FIELDS: ['name', 'dob', 'class', 'year'],

    renderPdf: function(selectedBooks, student, sanitize) {
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
                    <td class="col-autor">${sanitize(k.autor)}</td>
                    <td class="col-nazev">${sanitize(k.dilo)}</td>
                </tr>
            `).join('');
        };

        return `
            <style>
                @page { size: A4 portrait; margin: 0 !important; }
                
                @media print {
                    body > * { display: none !important; }
                    body > #print-area { display: block !important; }
                    body, html { margin: 0 !important; padding: 0 !important; background: white !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }

                .print-page {
                    /* Topologie A4 formátu */
                    width: 210mm !important; 
                    min-height: 297mm !important;
                    margin: 0 auto;
                    padding: 20mm 15mm; 
                    background: white !important;
                    color: black !important;
                    font-family: 'Times New Roman', 'Arial', sans-serif !important; 
                    position: relative;
                    box-sizing: border-box;
                }

                /* 📐 ANTI-FRACTURE PROTOKOL: Ochrana proti zlomení textu */
                .official-table { width: 100%; border-collapse: collapse; }
                .official-table tr { 
                    page-break-inside: avoid; 
                    break-inside: avoid; 
                }
                .official-table .subheader { 
                    page-break-after: avoid; 
                    break-after: avoid; 
                }
            </style>
            
            <div class="print-page">
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
                                        <td class="header-logo-col"><img src="spspb-logo-2000px.png" class="print-logo" alt="Znak SPŠ"></td>
                                        <td class="header-text-col">
                                            Střední průmyslová škola a Vyšší odborná škola Příbram II, Hrabákova 271<br>
                                            Seznam literárních děl: <strong>MATURITNÍ ZKOUŠKA Z ČJL - ústní část</strong>
                                        </td>
                                        <td class="header-spacer-col"></td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                        <tr><td colspan="3" class="info-label">jméno a příjmení:</td><td class="info-value">${sanitize(student.name)}</td></tr>
                        <tr><td colspan="3" class="info-label">datum narození:</td><td class="info-value">${sanitize(student.dob)}</td></tr>
                        <tr><td colspan="3" class="info-label">třída:</td><td class="info-value">${sanitize(student.class)}</td></tr>
                        <tr><td colspan="3" class="info-label">školní rok:</td><td class="info-value">${sanitize(student.year)}</td></tr>

                        <tr class="col-headers">
                            <td class="col-c">č.</td><td class="col-cs">č.s.</td><td class="col-autor">autor:</td><td class="col-nazev">název díla:</td>
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
            </div>
        `;
    },

    KNIHY_DB: [
        { id: 1, dilo: "Romeo a Julie", autor: "William Shakespeare", druh: "drama", obdobi: "do18" },
        { id: 2, dilo: "Kytice", autor: "Karel Jaromír Erben", druh: "lyrika", obdobi: "19" },
        { id: 3, dilo: "Máj", autor: "Karel Hynek Mácha", druh: "lyrika", obdobi: "19" },
        { id: 4, dilo: "Povídky malostranské", autor: "Jan Neruda", druh: "epika", obdobi: "19" },
        { id: 5, dilo: "Oliver Twist", autor: "Charles Dickens", druh: "epika", obdobi: "19" },
        { id: 6, dilo: "Slezské písně", autor: "Petr Bezruč", druh: "lyrika", obdobi: "cz20" },
        { id: 7, dilo: "Krysař", autor: "Viktor Dyk", druh: "epika", obdobi: "cz20" },
        { id: 8, dilo: "R. U. R.", autor: "Karel Čapek", druh: "drama", obdobi: "cz20" },
        { id: 9, dilo: "Osudy dobrého vojáka Švejka", autor: "Jaroslav Hašek", druh: "epika", obdobi: "cz20" },
        { id: 10, dilo: "Proměna", autor: "Franz Kafka", druh: "epika", obdobi: "svet20" },
        { id: 11, dilo: "Na západní frontě klid", autor: "Erich Maria Remarque", druh: "epika", obdobi: "svet20" },
        { id: 12, dilo: "Stařec a moře", autor: "Ernest Hemingway", druh: "epika", obdobi: "svet20" },
        { id: 13, dilo: "Spalovač mrtvol", autor: "Ladislav Fuks", druh: "epika", obdobi: "cz20" },
        { id: 14, dilo: "Vyšetřování ztráty třídní knihy", autor: "Smoljak, Svěrák", druh: "drama", obdobi: "cz20" },
        { id: 15, dilo: "Píseň o Viktorce", autor: "Jaroslav Seifert", druh: "lyrika", obdobi: "cz20" },
        { id: 16, dilo: "Smrt je mým řemeslem", autor: "Robert Merle", druh: "epika", obdobi: "svet20" },
        { id: 17, dilo: "Farma zvířat", autor: "George Orwell", druh: "epika", obdobi: "svet20" },
        { id: 18, dilo: "Ostře sledované vlaky", autor: "Bohumil Hrabal", druh: "epika", obdobi: "cz20" },
        { id: 19, dilo: "Báječná léta pod psa", autor: "Michal Viewegh", druh: "epika", obdobi: "cz20" },
        { id: 20, dilo: "Král Oidipus", autor: "Sofokles", druh: "drama", obdobi: "do18" },
        { id: 21, dilo: "Bible pro děti", autor: "Hadaway, Atcheson", druh: "epika", obdobi: "do18" },
        { id: 22, dilo: "Lakomec", autor: "Moliére", druh: "drama", obdobi: "do18" },
        { id: 23, dilo: "Revizor", autor: "Nikolaj V. Gogol", druh: "drama", obdobi: "19" },
        { id: 24, dilo: "Tyrolské elegie", autor: "Karel Havlíček Borovský", druh: "lyrika", obdobi: "19" },
        { id: 25, dilo: "Jáma a kyvadlo", autor: "Edgar Allan Poe", druh: "epika", obdobi: "19" },
        { id: 26, dilo: "O myších a lidech", autor: "John Steinbeck", druh: "epika", obdobi: "svet20" },
        { id: 27, dilo: "Rozmarné léto", autor: "Vladislav Vančura", druh: "epika", obdobi: "cz20" },
        { id: 28, dilo: "Válka s mloky", autor: "Karel Čapek", druh: "epika", obdobi: "cz20" },
        { id: 29, dilo: "451 stupňů Fahrenheita", autor: "Ray Bradbury", druh: "epika", obdobi: "svet20" },
        { id: 30, dilo: "Audience", autor: "Václav Havel", druh: "drama", obdobi: "cz20" },
        { id: 31, dilo: "Kníška", autor: "Karel Kryl", druh: "lyrika", obdobi: "cz20" },
        { id: 32, dilo: "Zbabělci", autor: "Josef Škvorecký", druh: "epika", obdobi: "cz20" },
        { id: 33, dilo: "Žert", autor: "Milan Kundera", druh: "epika", obdobi: "cz20" },
        { id: 34, dilo: "Chrám Matky Boží v Paříži", autor: "Victor Hugo", druh: "epika", obdobi: "19" },
        { id: 35, dilo: "Robinson Crusoe", autor: "Daniel Defoe", druh: "epika", obdobi: "do18" },
        { id: 36, dilo: "Malý princ", autor: "Antoine de Saint-Exupéry", druh: "epika", obdobi: "svet20" },
        { id: 37, dilo: "Němá barikáda", autor: "Jan Drda", druh: "epika", obdobi: "cz20" },
        { id: 38, dilo: "Smrt krásných srnců", autor: "Ota Pavel", druh: "epika", obdobi: "cz20" },
        { id: 39, dilo: "Misery", autor: "Stephen King", druh: "epika", obdobi: "svet20" },
        { id: 40, dilo: "Společenstvo Prstenu", autor: "J.R.R. Tolkien", druh: "epika", obdobi: "svet20" },
        { id: 41, dilo: "Občanský průkaz", autor: "Petr Šabach", druh: "epika", obdobi: "cz20" },
        { id: 42, dilo: "Den trifidů", autor: "John Wyndham", druh: "epika", obdobi: "svet20" },
        { id: 43, dilo: "Edison", autor: "Vítězslav Nezval", druh: "lyrika", obdobi: "cz20" },
        { id: 44, dilo: "Zkrocení zlé ženy", autor: "William Shakespeare", druh: "drama", obdobi: "do18" },
        { id: 45, dilo: "Strakonický dudák", autor: "Josef Kajetán Tyl", druh: "drama", obdobi: "19" },
        { id: 46, dilo: "Babička", autor: "Božena Němcová", druh: "epika", obdobi: "19" },
        { id: 47, dilo: "Balady a romance", autor: "Jan Neruda", druh: "lyrika", obdobi: "19" },
        { id: 48, dilo: "Nový epochální výlet pana Broučka", autor: "Svatopluk Čech", druh: "epika", obdobi: "19" },
        { id: 49, dilo: "Bylo nás pět", autor: "Karel Poláček", druh: "epika", obdobi: "cz20" },
        { id: 50, dilo: "Maryša", autor: "Alois a Vilém Mrštíkové", druh: "drama", obdobi: "19" },
        { id: 51, dilo: "Nikola Šuhaj loupežník", autor: "Ivan Olbracht", druh: "epika", obdobi: "cz20" },
        { id: 52, dilo: "Saturnin", autor: "Zdeněk Jirotka", druh: "epika", obdobi: "cz20" },
        { id: 53, dilo: "České nebe", autor: "Smoljak, Svěrák", druh: "drama", obdobi: "cz20" },
        { id: 54, dilo: "Postřižiny", autor: "Bohumil Hrabal", druh: "epika", obdobi: "cz20" },
        { id: 55, dilo: "Hana", autor: "Alena Mornštajnová", druh: "epika", obdobi: "cz20" },
        { id: 56, dilo: "Tankový prapor", autor: "Josef Škvorecký", druh: "epika", obdobi: "cz20" },
        { id: 57, dilo: "Memento", autor: "Radek John", druh: "epika", obdobi: "cz20" },
        { id: 58, dilo: "Jeden den Ivana Děnisoviče", autor: "Alexandr Solženicyn", druh: "epika", obdobi: "svet20" },
        { id: 59, dilo: "Alchymista", autor: "Paulo Coelho", druh: "epika", obdobi: "svet20" },
        { id: 60, dilo: "Tartuffe", autor: "Moliére", druh: "drama", obdobi: "do18" },
        { id: 61, dilo: "Modlitba pro K. Horovitzovou", autor: "Arnošt Lustig", druh: "epika", obdobi: "cz20" },
        { id: 62, dilo: "Pes baskervillský", autor: "Arthur Conan Doyle", druh: "epika", obdobi: "svet20" },
        { id: 63, dilo: "Vražda v Orient-expresu", autor: "Agatha Christie", druh: "epika", obdobi: "svet20" },
        { id: 64, dilo: "Velký Gatsby", autor: "Francis Scott Fitzgerald", druh: "epika", obdobi: "svet20" },
        { id: 65, dilo: "Pýcha a předsudek", autor: "Jane Austenová", druh: "epika", obdobi: "19" },
        { id: 66, dilo: "Kvantová mechanika v Rustu", autor: "Karel Třešňák", druh: "epika", obdobi: "cz20" }
    ]
};