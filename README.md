# Foobar 10.0 - Event Management Platform

A mobile-first web app for college event discovery, registration, waitlists, team invites, attendance, and admin management.

## Current Direction

This project is now web-first. Capacitor and the checked-in Android shell have been removed so development and testing can happen through normal web deployment instead of repeated APK builds.

The app is also PWA-ready with a manifest and a conservative service worker. It can be installed from supported mobile browsers, while core data flows still rely on live Firebase connectivity.

## Tech Stack

- React + Vite
- Tailwind CSS
- Firebase Auth
- Firestore real-time data
- Firebase Storage initialized for future poster/media uploads
- Firebase Cloud Functions scaffolded but not yet implemented

## Features

- Google sign-in through Firebase Auth for web
- User onboarding with registration number, class, and department
- Real-time event dashboard
- Individual and team event registration
- Waitlist support
- Team invites and invite responses
- User profile and registered events
- Admin event creation and editing
- Participant management
- Attendance marking
- CSV export

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

Any static hosting that supports Vite SPAs works. Firebase Hosting, Vercel, Netlify, and Cloudflare Pages are all suitable.

For BrowserRouter routes such as `/dashboard` or `/admin`, configure the host to rewrite all app routes to `index.html`.

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
