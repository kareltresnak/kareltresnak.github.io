# 📂 Academic & Software Projects

Professional portfolio of informatics projects focused on automation, educational tools, distributed architectures, and cyber security.

---

## 📚 OMEGA: Examination Canon Management System (v7.1.0 Enterprise)
**Live Demos:** 
* [🏛️ Institutional Edition (SPŠPB)](https://kareltresnak.github.io/MAT-CETBA/?theme=spspb) – Full institutional branding; persistent UI anchor.
* [🦀 Rust Edition](https://kareltresnak.github.io/MAT-CETBA/?theme=default) – High-contrast "Rust" aesthetic; branding-on-demand. <br>

**Repository:** [📂 Source Code](https://github.com/kareltresnak/kareltresnak.github.io/tree/main/docs/MAT-CETBA)

**Target:** Students of SPŠ a VOŠ Příbram

Originally a local protocol generator, OMEGA has been architecturally elevated into a **fully automated, serverless system utilizing distributed edge infrastructure (PWA + Cloudflare Workers)**. The application handles asynchronous distribution of study materials between administrators and end-nodes utilizing a Zero-Trust security model, while maintaining pixel-perfect emulation of printed state documents.

### ⚙️ Core Architecture & Security (Edge & Backend)

* **Serverless CI/CD Pipeline:** Database writes occur asynchronously via an isolated V8 Isolate (Cloudflare Worker) with a direct connection to the GitHub REST API. This eliminates the need for manual file manipulation and guarantees instantaneous state propagation.
* **Zero-Trust Authentication:** All authorization verification is processed strictly server-side (Pre-flight validation). The frontend Auth Modal merely acts as a password transport vehicle; privileges do not exist in the client's local memory until verified by a cryptographic key in the cloud.
* **Brute-Force Shield (Stateful Lockout):** Deployed a Cloudflare KV (Key-Value) store as high-speed RAM for attack vector logging. The system applies $O(\log n)$ limitation: 5 consecutive failed attempts trigger a 15-minute cryptographic IP lockout (HTTP 429), pushing the time complexity of a breach limitlessly toward infinity.
* **Intelligent Cache Routing (Split Architecture):** Refactored the Service Worker to a Dual-Cache topology. The core database (`data-spspb.js`) bypasses the monolithic cache, utilizing *Network-First* routing to eliminate stale data delivery. The App Shell retains a *Cache-First* strategy, guaranteeing $\mathcal{O}(1)$ load times and 100% offline availability.

### 🎨 Frontend Engineering & State Management

* **Geometric Protocol Emulation (Pixel-Perfect):** Engineered a high-fidelity print engine utilizing absolute coordinate positioning ($X, Y$). The generated A4 PDF is 1:1 visually indistinguishable from official, legally mandated state forms.
* **Cryptographic Database Integrity:** Integrated a 32-bit FNV-style hashing protocol (`generateDbHash`) to calculate unique checksums of the institutional database. Ensures strict **Memory Integrity** by automatically detecting curriculum mutations and preventing cross-version data corruption in `LocalStorage`.
* **Kinematic Transitions & Stateful UI:** Implementation of a dual-mode engine (Light/Dark) utilizing an explicit state machine via the `data-theme` attribute. Features hardware-accelerated global transitions with a $600ms$ `ease-in-out` curve and an iOS-style "Pill Switcher".
* **Depth Topography (Z-Axis UI):** Visual hierarchy overhaul in Light Mode using "Cards on Canvas" patterns. Utilizes high-contrast Forest Green anchors and Zebra striping in data tables to optimize visual scannability.
* **Zero-Knowledge Privacy:** Personally Identifiable Information (PII) is stored exclusively in `LocalStorage` with zero telemetry. Includes a custom XSS (Cross-Site Scripting) mitigation layer for input sanitization.

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