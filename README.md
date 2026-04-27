# Foobar 10.0 - Event Management Platform

A mobile-first web app for college event discovery, registration, waitlists, team invites, attendance, and admin management.

## Current Direction

This project is now web-first. Capacitor and the checked-in Android shell have been removed so development and testing can happen through normal web deployment instead of repeated APK builds.

The app is fully PWA-ready with a manifest and a service worker. It can be installed from supported mobile browsers, delivering a native-like experience while relying on live Firebase connectivity for core data flows.

## Tech Stack

- React + Vite
- Tailwind CSS
- Firebase Auth
- Firestore real-time data
- Firebase Storage (initialized for media uploads)
- Firebase Cloud Functions (scaffolded)

## Features & Recent Improvements

- **Authentication & Security:** Google sign-in with strict domain enforcement, preventing unauthorized access. Mobile sign-in flows have been optimized for seamless performance across all browsers. Hardened Firestore security rules prevent profile manipulation and unauthorized event edits.
- **User Onboarding:** Streamlined onboarding capturing registration number, class, and department, extracting info automatically from Google profiles where possible.
- **Event Dashboard & Registration:** Real-time dashboard with individual and team event registration capabilities, complete with waitlist support.
- **Team Management:** Robust invite system, capacity limits, and team role management with accurate registration count tracking and state handling.
- **Admin Dashboard:** Event creation/editing, participant management, attendance tracking, and CSV exports.
- **Performance Optimization Architecture:** 
  - **Bundle Size:** Reduced initial bundle size via code-splitting and manual chunking.
  - **Database Efficiency:** Minimized Firestore database reads by consolidating listeners into a global state.
  - **UI Performance:** Smooth UI transitions and interactions using component memoization and refined state deduplication.

## Local Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Build for production:

   ```bash
   npm run build
   ```

5. Preview the production build:

   ```bash
   npm run preview
   ```

## Firebase Setup Notes

- Add your deployed web domain to Firebase Auth authorized domains.
- Enable the Google provider in Firebase Auth.
- Deploy `firestore.rules` before using the optimized collection group registration listener.
- Firestore is the source of truth for live app state; the service worker only caches the app shell and static assets.

## Deployment

The platform is optimized for Vercel deployment with a pre-configured `vercel.json` for proper Single Page Application (SPA) routing. It also supports Firebase Hosting, Netlify, and Cloudflare Pages.

For standard hosts, ensure BrowserRouter routes (e.g., `/dashboard` or `/admin`) are rewritten to `index.html`.

Vercel configuration (already included):

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Firebase Hosting example:

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ]
  }
}
```

## Admin Configuration

New users are created as standard participants. To grant admin access, update the user document in Firestore:

- Collection: `users`
- Document: the user's Firebase UID
- Field: `role`
- Value: `admin`

## Future Native Options

If app store distribution becomes necessary later, keep this web app as the primary product and wrap it as a distribution layer:

- Android: Trusted Web Activity or a fresh Capacitor shell
- iOS: PWA install path first, native wrapper only if App Store distribution is required
