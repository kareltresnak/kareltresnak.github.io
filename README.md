# 📂 Academic & Software Projects

Professional portfolio of informatics projects focused on automation, educational tools, and system architecture.

---

## 📚 Selekce Maturitní Četby
[🔗 Live Demo](https://kareltresnak.github.io/MAT-CETBA/) | [📂 Source Code](https://github.com/kareltresnak/kareltresnak.github.io/tree/main/docs/MAT-CETBA)

**Target:** Students of SPŠ a VOŠ Příbram

A high-performance **Progressive Web App (PWA)** engineered to automate the bureaucratic process of compiling the official Czech "Maturita" exam protocol. Built on a strict **Zero-Dependency Client-Side** architecture, it functions as a fully offline native application with decentralized state management.

### ⚙️ Technical Highlights
* **Zero-Knowledge Privacy & Security:** Implementation of a strict local-only data pipeline. Personally Identifiable Information (PII) is serialized exclusively via `LocalStorage` with zero backend telemetry. Includes a custom **XSS (Cross-Site Scripting) mitigation layer** that sanitizes all user inputs before DOM injection.
* **Stateless Transfer & Deep Linking:** Engineered a zero-backend sharing mechanism that serializes the application state into a deterministically sorted URL payload. Includes a composite-canvas engine generating high-resolution, print-ready QR codes (with algorithmically calculated Quiet Zones) for seamless cross-device optical data transfer.
* **Smart State Sandbox (Import Engine):** Developed an asynchronous preview environment that intercepts incoming URL payloads. It automatically evaluates the foreign dataset against complex matrix requirements (chronological and genre quotas) and offers safe merging capabilities with strict **Buffer Overflow protection** (capped at 20 items).
* **Defensive Programming:** Implemented an auto-healing boot routine that actively scans for and resolves corrupted or poisoned states in the local memory upon initialization.
* **PWA & Offline-First Architecture:** Integrated Service Worker (`sw.js`) with cache-first strategies and semantic versioning (`v4.x.x`), providing 100% offline uptime. Features dynamic Cache API querying for real-time Version Stamping in the UI.
* **OS-Delegated UI Mimicry:** Designed an adaptive user interface. Uses Weber-Fechner calibrated contrast for Dark Mode and delegates Light Mode rendering to the user's OS (`prefers-color-scheme`), providing an exact 1:1 colorimetric match with the official SPŠ Příbram digital ecosystem.
* **Pixel-Perfect Print Engine:** Engineered a physical emulation of the official school protocol. The print DOM bypasses volatile browser print modules by utilizing structural HTML tables and `<colgroup>` matrices to enforce absolute geometric stability.
* **Accessibility (A11y):** Full keyboard navigation support using the **Roving Tabindex** pattern, focus-traps, and custom hotkeys (e.g., `/` for search) for fluid, mouse-free interaction.

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
