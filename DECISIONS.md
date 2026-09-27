# DECISIONS.md — Bitacora

## Session 1 — Packet

- Wrote `docs/PACKET.md` before any code, per the assignment's own no-packet-no-code rule.
- Product: a colectivo route-association-owned compliance and coverage ledger, directly implementing Emilio's individual declaration in the team's final Week 7 Blueprint (the compliance-and-planning layer, fed only by data the route association already owns, sold downstream to SITRAMyTEM/Edomex or CDMX's SEMOVI only by consent).
- Named the exact user as a route-association administrator (Don Refugio), not a government body, specifically so the Blueprint's shadow clause (measured party owns the record first) is load-bearing in the product itself, not just a policy statement.
- Generated the packet's mockup image with this session's available AI image-generation tool (two screens: association dashboard, consent-to-share screen), not a hand-drawn wireframe.
- Scope cut locked in: simulated telemetry only, simulated Gov role only, no automated penalty/enforcement of any kind ever, one association only this week.
- Dragon Stack satisfied: geodata/maps (Leaflet + route/unit geodata), ML (ping-interval gap/anomaly scoring), sensors/telemetry (simulated GPS ping generator).
- Tomorrow's first move: get Emilio's sign-off on the packet, then scaffold the Next.js + Supabase app following the same working pattern as Simulacro (Amparo/Comprobante/Escudo/Cuaderno lineage), reusing the dedicated Simulacro-style fresh OAuth client policy (never reuse a shared client without checking usage first).
