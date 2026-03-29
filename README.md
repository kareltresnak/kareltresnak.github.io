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
