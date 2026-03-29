# System.Root // Infrastructure Gateway

This repository serves as the central routing node (`N_root`) for my distributed engineering and software portfolio. It functions as a static Reverse Proxy and Directory Index, directing traffic to independent, domain-isolated micro-applications.

## 🕸️ Network Topology

The architecture has been intentionally decoupled from a monolithic structure to prevent Split-Brain syndrome and reduce data entropy. The system is modeled as a directed acyclic graph (DAG) where this repository acts as the primary entry point:

`System.Root` $\rightarrow$ `Edge Nodes`

### Active Nodes ($V$)

1.  **[OMEGA Canon Suite](https://github.com/kareltresnak/MAT-CETBA)**
    *   **Vector:** `git://kareltresnak/MAT-CETBA`
    *   **Architecture:** Zero-Trust Edge compute.
    *   **Description:** A highly secure, distributed examination generator utilizing Cloudflare Workers, Turnstile cryptographic challenges, and physical print topology defense mechanisms.

2.  **[AZ-Kvíz Engine](https://github.com/kareltresnak/AZ-KVIZ)**
    *   **Vector:** `git://kareltresnak/AZ-KVIZ`
    *   **Architecture:** Client-side SPA.
    *   **Description:** Web-based interactive game logic simulator featuring complex DOM state manipulation and event-driven architecture.

## ⚙️ Technical Stack (Gateway)

This specific repository is intentionally lightweight to ensure zero-latency routing. It utilizes:
*   **Semantic HTML5** for structured payload delivery.
*   **CSS3 (Flexbox/Grid)** for deterministic, pixel-perfect spatial geometry.
*   **Inline SVG** for zero-latency, scale-invariant visual vectoring.
*   **GitHub Pages** for global edge distribution.

## 🔐 Audit Trail & Access
This is a read-only public proxy. Source code for individual nodes is maintained within their respective isolated repositories to adhere to the Single Source of Truth (SSOT) paradigm.