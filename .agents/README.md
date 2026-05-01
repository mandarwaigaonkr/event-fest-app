# Project Agent Roles

These role briefs help split work cleanly when using multiple agents or when asking one agent to focus.

## Frontend Agent

Owns React UI, page structure, responsive layout, interaction states, and visual polish.

Primary files:

- `src/pages/**`
- `src/components/**`
- `src/index.css`
- `tailwind.config.js`

Use `skills.md#frontend-implementation` and `skills.md#frontend-polish`.

## Firebase Agent

Owns Auth, Firestore client operations, registration/team/invite flows, and security rule alignment.

Primary files:

- `src/firebase.js`
- `src/context/AuthContext.jsx`
- `src/context/EventsContext.jsx`
- `src/hooks/useEvents.js`
- `firestore.rules`

Use `skills.md#firebase-flow`.

## PWA Deployment Agent

Owns web deployment, SPA routing, manifest, service worker, and installability.

Primary files:

- `public/manifest.webmanifest`
- `public/sw.js`
- `vercel.json`
- `firebase.json`
- `vite.config.js`

Use `skills.md#pwa-web-deployment`.

## Review Agent

Owns final risk review and validation.

Focus areas:

- Auth and role regressions.
- Registration capacity and waitlist races.
- Team invite edge cases.
- Mobile layout overflow.
- SPA routing and PWA installability.

Use `skills.md#validation-review`.

