# 📂 Academic & Software Projects

Professional portfolio of informatics projects focused on automation, educational tools, and system architecture.

---

## 📚 Selekce Maturitní Četby
**Live Demos:** [🏛️ SPŠ a VOŠ Příbram](https://kareltresnak.github.io/MAT-CETBA/?theme=sps) | [🏫 Gymnázium Příbram](https://kareltresnak.github.io/MAT-CETBA/?theme=gympb) <br>
**Repository:** [📂 Source Code](https://github.com/kareltresnak/kareltresnak.github.io/tree/main/docs/MAT-CETBA)

**Target:** Institutional Students (SPŠ a VOŠ Příbram & Gymnázium Příbram, Legionářů 402)

A high-performance **Progressive Web App (PWA)** engineered to automate the bureaucratic process of compiling official Czech "Maturita" exam protocols. Built on a modular **Zero-Dependency** architecture, it supports multiple institutional configurations with distinct validation rules and protocol designs via deep-link parameters.

### ⚙️ Technical Highlights
* **Polymorphic Configuration Engine:** Implementation of a decoupled "Theme Injection" layer. The system dynamically swaps datasets, UI aesthetics, and validation matrices (e.g., author-specific quotas) based on persistent state or the `theme` URL parameter.
* **Institutional Logic Validation:** Developed complex, context-aware validation algorithms. For Gymnasium Příbram, this includes recursive author checking with specific exceptions (e.g., 2-book quotas for Shakespeare/Čapek based on genre differentiation).
* **Geometric Protocol Emulation (Pixel-Perfect):** Engineered a high-fidelity print engine that bypasses volatile browser rendering. By utilizing **Absolute Coordinate Positioning ($X, Y$)** and physical unit mapping (mm), the application produces documents with 1:1 visual parity to official paper protocols.
* **Stateless Transfer & Context-Aware Linking:** Engineered a zero-backend sharing mechanism. Application state (selected books + institutional context) is serialized into a deterministic URL payload. Integrated QR-engine with algorithmically calculated Quiet Zones ensures seamless cross-device transfer without data collision between schools.
* **Zero-Knowledge Privacy:** Strict local-only data pipeline. Personally Identifiable Information (PII) is serialized via `LocalStorage` with zero backend telemetry. Includes a custom **XSS (Cross-Site Scripting) mitigation layer** that sanitizes all user inputs before DOM injection.
* **Smart State Sandbox (Import Engine):** Developed an asynchronous preview environment that intercepts incoming URL payloads. It automatically evaluates the foreign dataset against complex institutional matrix requirements and offers safe merging capabilities with strict **Buffer Overflow protection**.
* **PWA & Offline-First Architecture:** Integrated Service Worker (`sw.js`) with cache-first strategies and semantic versioning, providing 100% offline uptime. Features dynamic Cache API querying for real-time Version Stamping in the UI.

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
