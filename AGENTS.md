# Agent Instructions

This project is a web-first React/Vite/Firebase Progressive Web App for college event discovery, registration, team invites, waitlists, attendance, and admin workflows.

## Current Architecture

- Frontend: React 18, Vite, React Router, Tailwind CSS.
- Auth and data: Firebase Auth and Firestore.
- Deployment target: browser/PWA first. Keep it installable from mobile browsers.
- Routing: `BrowserRouter`; production hosts must rewrite unknown routes to `index.html`.
- Removed native packaging: do not reintroduce Capacitor, Android, or APK workflows unless explicitly requested.

## Working Rules

- Preserve existing auth, onboarding, registration, team, invite, waitlist, and admin behavior.
- Prefer focused changes over broad rewrites.
- Keep Firestore reads and writes aligned with `firestore.rules`.
- Use real-time Firestore listeners where existing flows already depend on live updates.
- Keep stateful auth/Firestore flows online-first. Do not make offline behavior pretend writes succeeded.
- Do not commit, push, or run GitHub-side actions without explicit permission.

## Frontend Standards

- Keep the UI mobile-first, dense, and practical. This is an operational event app, not a marketing page.
- Use the existing Tailwind tokens from `tailwind.config.js` and CSS variables in `src/index.css`.
- Prefer existing motion helpers: `animate-fade-up`, `animate-fade-in`, `animate-scale-in`, `interactive-card`, and `pressable`.
- Keep motion subtle and fast. Respect `prefers-reduced-motion`.
- Avoid adding new UI libraries unless the need is concrete and approved.
- Use `@heroicons/react` for icons when an icon is needed.
- Do not rely on Framer Motion unless it is first added intentionally; it is mentioned in the README but is not currently installed.

## Important Files

- `src/App.jsx`: route definitions and providers.
- `src/firebase.js`: Firebase app, auth, persistence, and Firestore setup.
- `src/context/AuthContext.jsx`: auth/session/onboarding behavior.
- `src/context/EventsContext.jsx`: shared event state.
- `src/hooks/useEvents.js`: event, registration, invite, team, and admin data operations.
- `src/index.css`: design tokens, global styles, motion helpers.
- `firestore.rules`: Firestore authorization rules.
- `public/manifest.webmanifest` and `public/sw.js`: PWA shell.
- `vercel.json`: SPA fallback routing for Vercel.

## Validation

Run the narrowest checks that match the change:

```bash
npm run lint
npm run build
```

For Firestore rule changes, validate against the Firebase emulator when practical. If the local default Firebase CLI has Node compatibility problems, use `firebase-tools@13.35.1`.

