# 📂 Academic & Software Projects

Professional portfolio of informatics projects focused on automation, educational tools, and system architecture.

---

## 📚 Selekce Maturitní Četby
**Live Demo:** [🏛️ SPŠ a VOŠ Příbram](https://kareltresnak.github.io/MAT-CETBA/?theme=spspb) | [ DEFAULT ](https://kareltresnak.github.io/MAT-CETBA/?theme=default) <br>
**Repository:** [📂 Source Code](https://github.com/kareltresnak/kareltresnak.github.io/tree/main/docs/MAT-CETBA)

**Target:** Students of SPŠ a VOŠ Příbram

A high-performance **Progressive Web App (PWA)** engineered to automate the bureaucratic process of compiling official Czech "Maturita" exam protocols. Built on a modular **Zero-Dependency** architecture, it features a bespoke institutional configuration designed to match the specific requirements and visual identity of SPŠPB.

### ⚙️ Technical Highlights

* **Stateful UI & Kinematic Transitions:** Implementation of a dual-mode engine (Light/Dark) utilizing an explicit state machine via the `data-theme` attribute. Features hardware-accelerated global transitions with an **$600ms$ `ease-in-out` curve** for seamless luminance shifts and a custom-engineered iOS-style "Pill Switcher" for intuitive theme toggling.
* **Cryptographic Database Integrity:** Integrated a 32-bit FNV-style hashing protocol (`generateDbHash`) to calculate unique checksums of the institutional book database. This ensures strict **Memory Integrity** by automatically detecting curriculum mutations and preventing cross-version data corruption in `LocalStorage`.
* **Institutional Logic Validation:** Developed context-aware validation algorithms tailored to the SPŠPB maturitní kánon. The system enforces category quotas and institution-specific rules while maintaining real-time feedback through a reactive UI.
* **Geometric Protocol Emulation (Pixel-Perfect):** Engineered a high-fidelity print engine that produces A4 documents with **1:1 visual parity** to official school protocols. Utilizing absolute coordinate positioning ($X, Y$), the system ensures that the generated PDF is indistinguishable from the mandated paper forms.
* **Hloubková Topografie (Z-Axis UI):** Visual hierarchy overhaul in Light Mode using "Cards on Canvas" patterns. Utilizes high-contrast **Forest Green anchors** (matching SPŠPB official web), Mint Green highlights, and Zebra striping in data tables to optimize scannability and eliminate visual fatigue.
* **Version-Aware URL Serialization:** Stateless transfer mechanism where the selection and institutional context are serialized into a deterministic URL payload. Integrated **Hash Matching** blocks incoming imports if the shared link belongs to an outdated version of the school's book list.
* **Zero-Knowledge Privacy:** Strict local-only data pipeline. Personally Identifiable Information (PII) is stored exclusively in `LocalStorage` with zero backend telemetry. Includes a custom **XSS (Cross-Site Scripting) mitigation layer** for input sanitization.
* **PWA & Offline-First Architecture:** Integrated Service Worker (`sw.js`) with cache-first strategies, providing 100% offline uptime and real-time version stamping in the UI via the Cache API.

---

## 🎮 AZ Kvíz: Cyber Arena
**Live Demo:** [🔗 Live Demo](https://kareltresnak.github.io/AZ-KVIZ/) | [📂 Source Code](https://github.com/kareltresnak/kareltresnak.github.io/tree/main/docs/AZ-KVIZ)

Digital implementation of the iconic Czech TV game, redesigned with a cyberpunk aesthetic and focus on modularity.

### ⚙️ Technical Highlights
* **Data Architecture:** Custom XML parser allowing for modular dataset management and easy extension of the question database.
* **UI/UX:** High-contrast neon-industrial design utilizing CSS Blur-filters and hardware-accelerated animations.
* **Logic Separation:** Strict decoupling of game mechanics from the content layer, enabling the injection of custom educational datasets.

**Dataset Schema:**
```xml
<kviz>
  <otazka>
    <text>V kterém roce vznikl projekt OMEGA?</text>
    <odpoved>2026</odpoved>
  </otazka>
</kviz>
