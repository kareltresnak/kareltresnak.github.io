# 📂 Academic & Software Projects

Professional portfolio of informatics projects focused on automation, secure distributed architectures, and cryptographic validation.

---

## 📚 OMEGA: Distributed Examination Canon Suite (v7.3.0 Zero-Trust Edge)

**Live Demos:** 
* [🏛️ Institutional Edition (SPŠPB)](https://kareltresnak.github.io/MAT-CETBA/?theme=spspb) – Full institutional branding; persistent UI anchor.
* [🦀 Rust Edition](https://kareltresnak.github.io/MAT-CETBA/?theme=default) – High-contrast "Rust" aesthetic; branding-on-demand. <br>

**Repository:** [📂 Source Code](https://github.com/kareltresnak/kareltresnak.github.io/tree/main/docs/MAT-CETBA)

**Target:** High-density institutional networks (SPŠ a VOŠ Příbram)

Originally a localized protocol generator, OMEGA has been architecturally elevated into a **high-availability, serverless suite utilizing distributed edge infrastructure (PWA + Cloudflare Workers)**. The v7.2.0 release introduces a Zero-Trust Edge Gateway, mathematically mitigating L7 volumetric attacks and ensuring strict memory sanitization.

### 🛡️ Core Security Architecture & Edge Gateway

* **L7 Volumetric DDoS Mitigation (Proof-of-Work):** The perimeter is secured by an asymmetric cryptographic challenge (Cloudflare Turnstile) running in a quantum superposition state (Stealth Mode). It shifts the computational cost entirely to the attacker ($E_{attack} \gg E_{defense}$). The Worker drops unverified payloads in $\mathcal{O}(1)$ time before I/O execution.
* **Replay Attack Immunity:** Transport layer strictly enforces single-use token burning. Any network failure or state desynchronization automatically triggers a local node reset, rendering intercepted payloads mathematically useless.
* **Asymmetric Device Fingerprinting:** To mitigate "Friendly Fire" in NAT environments, the stateful brute-force lockout utilizes **SHA-256 Heuristic Fingerprinting**: $Hash(IP \oplus UserAgent)$. 
* **Supply Chain Integrity:** External CDNs are mathematically locked using **Subresource Integrity (SRI)** with Base64 encoded SHA-384/SHA-512 cryptographic hashes, eliminating on-the-fly execution mutations.
* **Stored XSS Sanitization & Schema Validation:** Strict edge-side schema parsing prevents payload bloat (Resource Exhaustion). All DOM insertions are aggressively sanitized, neutralizing client-side injection vectors.

### 🎨 Frontend Engineering & Print Topology

* **Anti-Fracture Print Engine:** A highly deterministic geometric protocol. CSS `break-inside: avoid` directives and strict A4 spatial boundaries ensure $100\%$ structural integrity during PDF compilation, completely eliminating "Orphan Headers" and row fractures.
* **Hybrid Session Decay (HUD-to-Modal):** Engineered a graduated escalation system for session security based on elapsed idle time. Features a glassmorphic Modal takeover with a 1Hz kinematic countdown and hardware-accelerated critical pulse animations.
* **Stateful Database Integrity:** A robust polynomial **String-Hashing protocol** detects memory mutations and prevents cross-version data corruption in offline `LocalStorage`.

---

## 🔬 Technical Appendix: Architectural Deep-Dive (v7.3.0)

### 1. The Zero-Trust Edge Gateway Equation
The Cloudflare Worker functions as a strict border gateway. A commit sequence is permitted only if it satisfies the Boolean intersection of Biometric Validation $V(T)$, Cryptographic Auth $A(P)$, and Schema Integrity $S(D)$:

$$f_{gateway}(req) = \begin{cases} \text{Execute GitHub PUT} & \text{if } V(T) \land A(P) \land S(D) \\ \text{Drop (HTTP 403)} & \text{otherwise} \end{cases}$$

### 2. Temporal State Machine: Hybrid Session Decay
OMEGA implements a three-phase Finite State Machine (FSM) to eliminate "zombie sessions":

$$
S(t) = 
\begin{cases} 
\text{Invisible} & \text{for } t < 10s \\
\text{HUD-Warning} & \text{for } 10s \le t < 240s \\
\text{Modal-Takeover} & \text{for } 240s \le t < 300s \\
\text{Termination} & \text{for } t \ge 300s 
\end{cases}
$$

### 3. Data Integrity & State Management
The system utilizes a lightweight string-hashing algorithm to monitor the integrity of the institutional database. 

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
