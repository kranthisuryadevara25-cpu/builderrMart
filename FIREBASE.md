# Firebase backend setup (BuildMart AI)

The app can run with **Firebase** as the full backend: Auth, Firestore, and optional Storage.

## 1. Create a Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com) and create a project (or use an existing one).
2. Enable **Authentication** → Sign-in method → **Email/Password**.
3. Create a **Firestore Database** (start in test mode for development, then deploy rules).
4. Optional: enable **Storage** for file uploads (e.g. construction images).

## 2. Get config and env

1. In Firebase Console: Project settings (gear) → **General** → **Your apps** → Add app (Web).
2. Copy the `firebaseConfig` object.
3. In the project root, copy `.env.example` to `.env` and fill in:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

## 3. Deploy Firestore rules

From the project root:

```bash
# If you use Firebase CLI
firebase deploy --only firestore:rules
```

Or in Firebase Console: **Firestore** → **Rules**, and paste the contents of `firestore.rules` (then publish).

## 4. Run the app

No Express/Node server or PostgreSQL is required for the Firebase backend.

```bash
npm install
npm run dev
# Or client-only: npx vite
```

Then open the app (e.g. `http://localhost:5173` when using Vite). If Firebase env vars are missing, the app shows a setup message.

## 5. What runs on Firebase

- **Auth**: Email/password sign-in; user profile (username, role) stored in Firestore `users/{uid}`.
- **Data**: Firestore collections: `users`, `categories`, `products`, `orders`, `quotes`, `bookings`, `discounts`, `marketing_materials`, `contractors`, `advances`, `pricing_rules`.
- **Features**: Login/register, categories/products CRUD, orders, quotes, bookings, discounts, vendor/admin panels, user profile.

## 6. Optional: Cloud Functions (AI, pricing, reports)

Features that previously called the Express API (e.g. AI construction image analysis, advanced pricing, export/import) are not yet implemented as callable Firebase Functions. You can:

- Add **Firebase Cloud Functions** and call them from the client via `httpsCallable`, or
- Run a small **Express server** only for those routes and keep the rest on Firebase.

## 7. Emulators (development)

To use Auth and Firestore emulators:

1. Install Firebase CLI and run `firebase init emulators`.
2. In `.env`: `VITE_FIREBASE_USE_EMULATOR=true`.
3. Start emulators: `firebase emulators:start --only auth,firestore`.
