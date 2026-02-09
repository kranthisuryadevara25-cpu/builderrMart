# BuildMart AI – Deployment checklist

The app **builds successfully** and can be deployed. Use this checklist before going live.

---

## Pre-deployment checklist

### 1. Firebase (required)

- [ ] **Firestore** – Database created; **Rules** deployed (paste `firestore.rules` in Console → Firestore → Rules).
- [ ] **Authentication** – Email/Password sign-in method enabled.
- [ ] **Authorized domains** – In Firebase Console → Authentication → Settings → Authorized domains, add your production domain (e.g. `your-app.vercel.app`, `your-app.web.app`).

### 2. Environment variables (build-time)

Set these in your hosting platform (Vercel, Netlify, Firebase Hosting, etc.) so they are available **at build time** (Vite inlines `VITE_*` variables):

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Yes | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | e.g. `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | e.g. `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes | From Firebase config |
| `VITE_FIREBASE_APP_ID` | Yes | From Firebase config |
| `VITE_STRIPE_PUBLIC_KEY` | No | Only if you use Stripe checkout |

### 3. Build

```bash
npm install
npm run build
```

- **Client output:** `dist/public/` (static files: `index.html`, `assets/`)
- **Server output:** `dist/index.js` (optional; only needed if you run the Express server for non-Firebase features)

For **Firebase-only** (no Express), deploy only the **client** (see options below).

---

## Deployment options

### Option A: Firebase Hosting (recommended with Firebase backend)

1. Install CLI: `npm i -g firebase-tools` and `firebase login`
2. In project root: `firebase init hosting`
   - Public directory: **dist/public**
   - Single-page app: **Yes**
3. Set env vars for build (e.g. in CI or locally before build):
   ```bash
   export VITE_FIREBASE_API_KEY=...
   export VITE_FIREBASE_AUTH_DOMAIN=...
   # ... etc
   npm run build
   ```
4. Deploy: `firebase deploy`

### Option B: Vercel

1. Connect the repo to Vercel.
2. **Build command:** `npm run build`
3. **Output directory:** `dist/public`
4. **Environment variables:** Add all `VITE_FIREBASE_*` (and optional `VITE_STRIPE_PUBLIC_KEY`) in Vercel dashboard → Settings → Environment Variables.

### Option C: Netlify

1. Connect the repo.
2. **Build command:** `npm run build`
3. **Publish directory:** `dist/public`
4. **Environment variables:** Add all `VITE_FIREBASE_*` in Site settings → Build & deploy → Environment.

### Option D: Run full stack (Express + static)

If you still use the Express server (e.g. for some API routes):

1. Set `DATABASE_URL` and any server env vars.
2. `npm run build` then `npm start`.
3. Serve on the port set by `PORT` (default 5000). Use a process manager (e.g. PM2) and a reverse proxy in production.

---

## Optional before launch

- [ ] Remove or replace the Replit dev banner script in `client/index.html` if you don’t use Replit.
- [ ] Update browserslist: `npx update-browserslist-db@latest` (clears the build warning).
- [ ] Consider code-splitting to reduce the main JS chunk (build warns if > 500 kB).

---

## Summary

| Item | Status |
|------|--------|
| Production build | ✅ Passes |
| Firebase config (env) | ✅ You have `.env`; set same in hosting |
| Firestore rules | ⚠️ Deploy `firestore.rules` in Firebase Console |
| Auth + authorized domains | ⚠️ Enable Email/Password and add production domain |
| Deploy static client | ✅ Use `dist/public` with any static host |

Once Firebase (Firestore + Auth + authorized domain) and build-time env vars are set on your host, the application is **ready for deployment**.
