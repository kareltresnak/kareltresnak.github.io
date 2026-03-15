# 📂 Academic & Software Projects

Professional portfolio of informatics projects focused on automation, educational tools, distributed architectures, and cyber security.

---

## 📚 OMEGA: Distributed Examination Canon Suite (v7.2.0 Enterprise)

**Live Demos:** 
* [🏛️ Institutional Edition (SPŠPB)](https://kareltresnak.github.io/MAT-CETBA/?theme=spspb) – Full institutional branding; persistent UI anchor.
* [🦀 Rust Edition](https://kareltresnak.github.io/MAT-CETBA/?theme=default) – High-contrast "Rust" aesthetic; branding-on-demand. <br>

**Repository:** [📂 Source Code](https://github.com/kareltresnak/kareltresnak.github.io/tree/main/docs/MAT-CETBA)

**Target:** Students of SPŠ a VOŠ Příbram

Originally a local protocol generator, OMEGA has been architecturally elevated into a **high-availability, serverless suite utilizing distributed edge infrastructure (PWA + Cloudflare Workers)**. The v7.2.0 release introduces advanced temporal state management and asymmetric security models designed for high-density institutional networks (NAT).

### ⚙️ Core Architecture & Security (Edge & Backend)

* **Asymmetric Device Fingerprinting:** To mitigate "Friendly Fire" in NAT environments, the lockout system utilizes **SHA-256 Heuristic Fingerprinting**. The identity is calculated as $Hash(IP \oplus UserAgent)$, isolating lockouts to specific hardware nodes while maintaining access for authorized faculty members.
* **Serverless CI/CD Pipeline:** Database writes occur asynchronously via a V8 Isolate (Cloudflare Worker) with a direct connection to the GitHub REST API. This ensures $\mathcal{O}(1)$ commit overhead and instantaneous global state propagation.
* **Zero-Trust Authentication:** Authorization is processed strictly server-side. The frontend acts merely as a transport layer for encrypted payloads; session secrets never persist in the client’s unencrypted memory.
* **Stateful Brute-Force Shield:** Cloudflare KV store serves as a high-speed persistence layer for logging failed vectors. 5 consecutive failures trigger a 15-minute cryptographic lockout ($HTTP \ 429$), rendering brute-force attacks computationally non-viable.

### 🎨 Frontend Engineering & Temporal UX

* **Hybrid Session Decay (HUD-to-Modal):** Engineered a graduated escalation system for session security based on elapsed idle time ($t$):
    * **Phase 1 ($t < 240s$):** Stealth mode; persistent HUD timer in the peripheral UI.
    * **Phase 2 ($t \geq 240s$):** Glassmorphic Modal takeover with a 1Hz kinematic countdown and critical pulse animation for $t \geq 280s$.
* **Platform-Agnostic Typeahead Engine:** Eliminated native `<datalist>` inconsistencies in favor of a custom, reactive **Autocomplete Module**. Features real-time substring matching, institutional data-fill heuristics, and iOS-optimized touch interaction.
* **Mobile View Isolation:** Hard-coded UI Lockdown utilizing `!important` CSS injection via JS. Guarantees absolute isolation of the Admin Portal from the student-facing DOM tree.
* **Stateful Database Integrity:** A robust **String-Hashing protocol** (`generateDbHash`) ensures **Memory Integrity**. Detects curriculum mutations and prevents cross-version data corruption in `LocalStorage` without breaking backwards compatibility.
* **Geometric Protocol Emulation:** High-fidelity print engine utilizing absolute coordinate positioning. The generated A4 PDF is 1:1 visually indistinguishable from legally mandated state forms.

---

## 🔬 Technical Appendix: Architectural Deep-Dive (v7.2.0)

### 1. Asymmetric Security & Fingerprinting
Identity of a node is defined as a unique hash $H$:
$$H = \text{SHA-256}(IP_{ext} \parallel UA_{raw} \parallel \text{salt})$$

This ensures that the collision probability $P(C)$ between two different devices within the same network is negligible: $P(C) \approx 2^{-256}$.

### 2. Temporal State Machine: Hybrid Session Decay
OMEGA implements a three-phase Finite State Machine (FSM) to eliminate "zombie sessions":

$$
S(t) = 
\begin{cases} 
\text{Invisible} & \text{pro } t < 10s \\
\text{HUD-Warning} & \text{pro } 10s \le t < 240s \\
\text{Modal-Takeover} & \text{pro } 240s \le t < 300s \\
\text{Termination} & \text{pro } t \ge 300s 
\end{cases}
$$

### 3. Data Integrity & State Management
The system utilizes a lightweight **String-Hashing** algorithm to monitor the integrity of the institutional database. This ensures that any curriculum updates trigger a notification, prompting the user to synchronize their local list with the new standard.

```javascript
function generateDbHash(db) {
    const str = db.map(k => k.id + k.dilo).join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0; 
    }
    return hash.toString(36);
}
```
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
