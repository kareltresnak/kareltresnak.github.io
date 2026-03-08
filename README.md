# 📂 Academic & Software Projects

Professional portfolio of informatics projects focused on automation, educational tools, and system architecture.

---

## 📚 Selekce Maturitní Četby
[🔗 Live Demo](https://kareltresnak.github.io/MAT-CETBA/) | [📂 Source Code](https://github.com/kareltresnak/kareltresnak.github.io/tree/main/docs/MAT-CETBA)

**Target:** Students of SPŠ a VOŠ Příbram

A high-performance **Progressive Web App (PWA)** engineered to automate the bureaucratic process of compiling the official Czech "Maturita" exam protocol. Built on a strict **Zero-Dependency Client-Side** architecture, it functions as a fully offline native application.

### ⚙️ Technical Highlights
* **Zero-Knowledge Privacy Shield:** Implementation of a strict local-only data pipeline. Personally Identifiable Information (PII) and application state are serialized exclusively via `LocalStorage` with absolutely no backend database, telemetry, or network traffic.
* **PWA & Offline-First Architecture:** Integrated Service Worker (`sw.js`) with caching strategies, providing 100% offline uptime and native installation capabilities on Android and iOS devices.
* **Pixel-Perfect Print Engine:** Engineered a 1:1 physical emulation of the official SPŠ Příbram protocol. The print DOM bypasses volatile browser print modules by utilizing structural nested HTML tables and `<colgroup>` matrices to enforce absolute geometric stability and locked typography.
* **Navigation Architecture:** Full keyboard navigation support using the **Roving Tabindex** pattern, focus-traps, and custom hotkeys (e.g., `/` for search) for fluid, mouse-free accessibility.
* **Algorithmic Validation:** Real-time evaluation engine dynamically parsing complex state against matrix requirements (genre distribution and chronological quotas).

---

## 🎮 AZ Kvíz: Cyber Arena
[🔗 Live Demo](https://kareltresnak.github.io/AZ-KVIZ/) | [📂 Source Code](https://github.com/kareltresnak/kareltresnak.github.io/tree/main/docs/AZ-KVIZ)

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
