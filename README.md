# Vortiqen — Company Website

The official website for **Vortiqen**, a software company building reliable, scalable,
intelligent digital products and engineering solutions.

Built with React 18, Vite, Tailwind CSS, Framer Motion, and Lucide.

---

## Design system

The visual language is Swiss/minimalist on a near-black canvas: hairline rules,
a strict type scale, generous whitespace, and a single restrained accent used
only for state and emphasis. Identity comes from geometry and typography rather
than from colour or gradients.

### Colour

All foreground/background pairs are verified against WCAG AA.

| Token | Value | Role |
| --- | --- | --- |
| `ink-0` | `#08090B` | Canvas |
| `ink-1` / `ink-2` / `ink-3` | `#0B0D10` / `#101317` / `#171B21` | Surface ladder |
| `fg-0` | `#F7F8F8` | Primary text — 18.7:1 on canvas |
| `fg-1` | `#AAB1BC` | Secondary text — 9.2:1 |
| `fg-2` | `#8A919D` | Tertiary / metadata — 6.3:1 |
| `accent` | `#4C7EFF` | Interactive state, emphasis — 5.4:1 |
| `accent-soft` | `#9DB8FF` | Accent text on dark — 10.2:1 |

> The accent fails 4.5:1 against white (3.66:1), so accent-filled surfaces use
> near-black labels. The primary button is white-on-near-black instead.

### Type

- **Display / headings** — Space Grotesk (geometric, technical)
- **Body / UI** — Inter
- **Metadata, eyebrows, tags** — JetBrains Mono

Scale is fluid via `clamp()`, defined in `tailwind.config.js`. Hero display type
runs 32px → 64px across 375px → 1440px and is sized so the three hero lines never
wrap, which the per-line mask reveal depends on.

### Motion

One vocabulary, defined once in `src/lib/motion.js`:

| Band | Duration | Used for |
| --- | --- | --- |
| Fast | 180ms | Hover, press, micro-interactions |
| Base | 320–420ms | Element entrances, state changes |
| Slow | 640–900ms | Section reveals, large objects |

Easing is expo-out (`cubic-bezier(0.16, 1, 0.3, 1)`) for arrivals and standard
(`cubic-bezier(0.4, 0, 0.2, 1)`) for UI. Larger objects travel further and
slower; small objects settle fast.

`prefers-reduced-motion` is honoured throughout: `MotionConfig reducedMotion="user"`
drops transform and layout animation globally, components owning continuous or
pointer-driven motion opt out via `useReducedMotion()`, and `index.css` neutralises
CSS-driven motion. The site is complete and readable with every animation removed.

---

## Structure

```text
frontend/
├── index.html                 # Meta, JSON-LD, font loading
├── tailwind.config.js         # Design tokens
├── public/favicon.svg
└── src/
    ├── components/
    │   ├── Navbar.jsx         # Fixed, compacts on scroll, mobile sheet
    │   ├── Hero.jsx           # Line-mask reveal, pointer + scroll parallax
    │   ├── HeroVisual.jsx     # Abstract aperture + service graph (SVG)
    │   ├── Intro.jsx          # Scroll-linked progressive statement reveal
    │   ├── Services.jsx       # Asymmetric 12-column grid
    │   ├── Process.jsx        # Sticky heading + scroll-driven pipeline rail
    │   ├── Work.jsx           # Native horizontal snap rail
    │   ├── Technology.jsx     # Interactive layered system diagram
    │   ├── About.jsx
    │   ├── CTA.jsx
    │   ├── Footer.jsx
    │   ├── EnquiryDialog.jsx  # Enquiry form: validation, states, focus trap
    │   └── ui/                # Button, Section, VortiqenMark
    ├── data/site.js           # All copy and content
    ├── hooks/                 # useScrolled, usePointer, useActiveSection,
    │                          # useEnquiry (dialog state + focus return)
    ├── lib/
    │   ├── motion.js          # Motion tokens and variants
    │   └── api.js             # The only place that talks to the API
    ├── App.jsx
    └── index.css              # Base, hairline primitives, reduced motion
```

Content lives entirely in `src/data/site.js`. It deliberately contains no
clients, logos, revenue, headcount, awards, testimonials, certifications, or
customer counts. The Work entries are labelled *capability area* — they describe
the kinds of systems built, not client case studies.

---

## Running the frontend alone

```bash
cd frontend
npm install
cp .env.example .env      # VITE_API_BASE_URL
npm run dev               # http://localhost:3000
npm run build
npm run preview
```

Requires Node 18+. The site renders without the API, but the "Start a Project"
enquiry form needs it — see **Running the full stack** below. "Talk to Vortiqen"
remains a `mailto:` to the address in `src/data/site.js`.

---

## Accessibility & UX

- Semantic landmarks, sequential headings, `aria-labelledby` on every section
- Skip-to-content link; visible `:focus-visible` rings never removed
- All interactive targets ≥44px; `Escape` closes the mobile sheet
- Horizontal work rail is native overflow with scroll-snap — keyboard scrollable,
  with arrow buttons as the pointer alternative to swiping
- No scroll-jacking; native scrolling is preserved throughout
- Verified with no horizontal overflow at 1440 / 1280 / 1024 / 768 / 390 / 375px

---

## Backend — Vortiqen API

FastAPI service backing the website's enquiry form.

```text
backend/app/
├── main.py                 # routes, CORS, lifespan posture logging
├── config.py               # env-driven settings, fail-safe defaults
├── schemas.py              # ContactCreate / ContactResponse / HealthResponse
└── services/
    ├── enquiries.py        # delivery policy (the anti-silent-success rule)
    ├── storage.py          # append-only JSONL store (fsync'd)
    ├── notifications.py    # webhook + SMTP channels
    └── rate_limit.py       # RateLimiter protocol + in-memory sliding window
```

### Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/` | Service identity |
| `GET` | `/api/health` | Readiness; `accepting_enquiries` is the field that matters |
| `POST` | `/api/contact` | Submit a business enquiry |

`POST /api/contact` takes `name`, `email`, `message` (required) plus optional
`company` and `service`, and a `company_website` honeypot that must stay empty.
It returns **201 only when the enquiry reached a destination a human will read** —
otherwise 502 with a generic message.

### Delivery policy

The previous implementation returned 201 with "check your email" while Sheets
was in dry-run, SMTP was unset and the webhook was empty. That is now impossible:

| Environment | Accepted destination |
| --- | --- |
| development / staging | The durable local JSONL file is enough. Channel failures are logged loudly but do not fail the request. |
| production | At least one **external** channel (webhook or SMTP) must succeed — unless `ALLOW_LOCAL_PERSISTENCE_IN_PRODUCTION=true`. Nothing configured → 502 and a `CRITICAL` log line. |

`ENVIRONMENT` defaults to `production` in code, so a deployment that forgets to
set it fails loudly instead of quietly accepting enquiries it cannot deliver.

### CORS

Exact origins only via `ALLOWED_ORIGINS`; `*` is rejected at startup, as are
plaintext non-localhost origins in production. `allow_credentials` is **off** —
the website sends plain JSON with no cookies, so the wildcard-plus-credentials
class of bug is removed rather than narrowed.

### Rate limiting

Sliding window per client key, configurable via `RATE_LIMIT_*`. `X-Forwarded-For`
is ignored unless `TRUSTED_PROXY_COUNT` says how many proxies sit in front; the
client is then taken from the **right** of the header, so a forged left-hand hop
cannot buy a fresh quota. The in-memory implementation satisfies a `RateLimiter`
protocol so a shared backend can replace it when the app runs multi-process.

---

## Frontend → backend

All traffic goes through one client — `src/lib/api.js`. No component calls
`fetch` directly.

```text
Browser → React (EnquiryDialog) → src/lib/api.js → FastAPI → JSONL + channels
                                                        ↓
                                        201 + reference → success UI
```

The "Start a Project" CTAs (navbar, hero, closing section) open
`EnquiryDialog`, which validates client-side, shows loading / success / error
states, blocks duplicate submissions, traps focus, closes on `Escape`, and
returns focus to the trigger.

`VITE_API_BASE_URL` selects the API origin; unset falls back to
`http://localhost:8000` in dev and same-origin in a build.

---

## Running the full stack

```bash
# Terminal 1 — API on :8000
cd backend
python -m venv venv && venv/bin/pip install -r requirements.txt
cp .env.example .env                    # sets ENVIRONMENT=development
venv/bin/uvicorn app.main:app --reload --port 8000

# Terminal 2 — website on :3000
cd frontend
npm install
cp .env.example .env                    # sets VITE_API_BASE_URL
npm run dev
```

Tests: `cd backend && venv/bin/python -m pytest`
