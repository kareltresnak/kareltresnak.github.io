# 📂 Academic & Software Projects

Professional portfolio of informatics projects focused on automation, educational tools, and system architecture.

---

## 📚 Selekce Maturitní Četby
[🔗 Live Demo](https://kareltresnak.github.io/MAT-CETBA/) | [📂 Source Code](https://github.com/kareltresnak/kareltresnak.github.io/tree/main/docs/MAT-CETBA)

**Target:** Students of SPŠ a VOŠ Příbram

A high-performance **Single Page Application (SPA)** designed to streamline the complex process of selecting books for the Czech "Maturita" exam. This project was developed as a modern web alternative to static book lists.

### ⚙️ Technical Highlights
* **State Persistence:** Implementation of `LocalStorage` for client-side data retention, ensuring the user's progress is saved across sessions without the need for a backend.
* **Navigation Architecture:** Full keyboard navigation support using the **Roving Tabindex** pattern for enhanced accessibility (a11y).
* **Responsive Design:** Optimized for diverse device viewports, including specific optimizations for Pixel 7 and Zenbook Fold.
* **Print Engine:** Custom CSS `@media print` logic for zero-dependency A4 PDF generation, optimized for high data density on a single page.
* **Validation Logic:** Real-time algorithmic checking of complex exam requirements (genre distribution and historical period quotas).

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
