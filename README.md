# Foobar 10.0 - Event Management Platform

A modern, mobile-first Progressive Web App (PWA) for comprehensive college event discovery, team registrations, waitlists, and administration.

## 🛠 Tech Stack

- **Frontend:** React + Vite
- **Styling:** Tailwind CSS + Framer Motion (for smooth UI transitions)
- **Authentication:** Firebase Auth (Google Sign-in with strict domain enforcement)
- **Database:** Firestore (Real-time data synchronization and global state listeners)
- **Hosting:** Vercel (SPA optimized) / Firebase Hosting

---

## 👥 User Functionality & Guidelines

The platform is designed to provide a seamless experience for students to discover and participate in events.

### 1. Authentication & Onboarding
- **Strict Login:** All users must log in using their official Christ University domain email addresses.
- **Smart Onboarding:** Registration numbers are automatically extracted from the user's Google display name. Users provide their Class and Department during onboarding.
- **Data Integrity:** To maintain security and prevent impersonation, profile fields cannot be modified after the initial onboarding.

### 2. Event Discovery & Dashboard
- **Real-time Dashboard:** View all active events, their capacities, timings, and venues in real-time.
- **Event Types:** Clearly distinguish between Individual and Team-based events.

### 3. Registration System
- **Individual Events:** Simple one-click registration process.
- **Team Events:** 
  - Create a team and become the Team Leader.
  - Send direct invites to teammates using their registered email addresses.
  - Team members receive invites in their dashboard and must accept them to secure their spot.
- **Waitlists:** If an event hits its capacity, subsequent registrations are safely queued on a waitlist. If spots open up, the system handles capacity accordingly.

### 4. User Profile & Management
- **My Events:** A dedicated space to track all registered events and their current status (Confirmed, Waitlisted, etc.).
- **Invitations:** View and manage pending team invites.

---

## 🛡️ Admin Roles & Management

Administrators have elevated privileges to oversee the entire event lifecycle.

### Granting Admin Access
By default, all new accounts are standard participants. To promote a user to an Admin, update their Firestore user document:
- **Collection:** `users`
- **Document:** The user's Firebase UID
- **Field:** `role`
- **Value:** `admin`

### Admin Capabilities
- **Event Creation & Editing:** Full control over event details, including capacity limits, team size constraints, descriptions, and scheduling.
- **Real-time Monitoring:** Track registration counts and waitlist numbers live from the admin dashboard.
- **Participant Management:** 
  - View comprehensive lists of registered individuals and teams.
  - Identify team leaders and pending invites.
- **Attendance Tracking:** Mark user attendance directly through the platform during the event.
- **Data Export:** Export participant lists and attendance records to CSV for post-event reporting.

---

## 🚀 Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

## 🌐 Deployment Notes
The app is optimized for Vercel with a pre-configured `vercel.json` to handle Single Page Application (SPA) routing, ensuring direct links to `/dashboard` or `/admin` resolve correctly without 404 errors. It is fully PWA-ready and can be installed natively on mobile devices directly from the browser.
