# Foobar 10.0 — Event Management Platform 🚀

A modern, high-performance event management platform built for college fests and technical events. Built with React, Vite, TailwindCSS, and Firebase, this platform handles seamless user registration, atomic waitlist processing, and robust admin attendance tools.

## ✨ Key Features

### For Users
* **Dynamic Event Discovery**: Browse beautiful event cards with glassmorphic UI and real-time capacity tracking.
* **Smart Registrations & Waitlisting**: If an event is full, instantly join the waitlist. If a spot opens up, the system automatically promotes the oldest waitlisted user to registered status.
* **Dual Dashboard**: Track upcoming events and view past attended events with one click.
* **Theme Switching**: Fully customized Dark Mode and Light Mode with seamless transitions.
* **Profile Management**: Displays onboarding details (Registration Number, Class, Department).

### For Admins
* **Full Event Lifecycle**: Create, edit, and manage event details, capacities, and venues.
* **Take Attendance**: A dedicated, real-time bulk-attendance marking system with "Review & Submit" absentee warnings.
* **Data Export**: One-click download of filtered CSV files containing participant details (e.g., download a sheet of all "Present" attendees).
* **Participant Management**: Remove registrations or manually intervene directly from the dashboard.

## 🛠 Tech Stack

* **Frontend**: React (Vite), TailwindCSS, HeroIcons
* **Backend**: Firebase (Auth & Firestore)
* **Mobile**: Capacitor (Native Android)
* **CI/CD**: GitHub Actions (Cloud APK Building)

## 📦 Mobile App (APK) Auto-Build

We have configured a continuous integration pipeline using **GitHub Actions**. You do *not* need Android Studio installed locally!

1. Push your code to the `main` branch.
2. Go to the **Actions** tab in your GitHub repository.
3. Click the completed **"Build Android APK"** workflow.
4. Scroll to the bottom and download the **`Foobar10-App-Debug.zip`** artifact to get your fresh `.apk` file!

## 🚀 Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/event-fest-app.git
   cd event-fest-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Firebase Configuration:**
   Create a `.env` file in the root directory and add your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

## 🔐 Admin Configuration

By default, all new users are created as standard participants. To grant Admin privileges:
1. Open the Firebase Console.
2. Navigate to **Firestore Database** > `users` collection.
3. Find the desired user document and change their `role` field from `"user"` to `"admin"`.

---
*Built for the next generation of college fests.*
