# ⚡ PC Build Manager

Drag-and-drop PC build tracker with real-time sync across all your devices.

## Setup (15 minutes total)

### Step 1: Create Firebase project (3 min)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Create a project** → name it `pc-builder` → click Continue
3. **Skip** Google Analytics → click Create Project
4. Once created, click the **</>** (Web) icon on the project overview page
5. Name it `pc-builder` → click **Register app**
6. You'll see a `firebaseConfig` object — **copy it**
7. Open `src/firebase.js` and paste your config values over the placeholder text
8. In the Firebase console sidebar: **Build → Firestore Database → Create Database**
9. Choose **Start in test mode** → pick any region → click **Create**

### Step 2: Push to GitHub (2 min)

```bash
# Create a new repo on github.com (click + → New repository)
# Name it "pc-builder", keep it public or private, DON'T add README

# Then in your terminal:
cd pc-builder
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pc-builder.git
git push -u origin main
```

### Step 3: Deploy to Vercel (2 min)

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click **Add New → Project**
3. Find and **Import** your `pc-builder` repo
4. Leave all settings as default (Vercel auto-detects React)
5. Click **Deploy**
6. Wait ~60 seconds — you get a live URL like `pc-builder-xyz.vercel.app`

### Done!

Open the URL on any computer or phone. Add parts, create builds, drag parts onto builds. Everything syncs in real-time through Firebase.

Every time you push to GitHub, Vercel auto-redeploys.

## How it works

- **Builder** — drag parts from the sidebar onto builds. Cost auto-calculates. Enter sale price to see profit.
- **Parts** — full inventory list. Add parts with cost, type, condition, source.
- **Dashboard** — KPIs and per-build performance table.
- **Sync** — green "Synced" badge means Firebase is connected. All changes appear instantly on other devices.

## Firestore security (do this before going public)

The test mode rules expire after 30 days. To keep it working:

1. Firebase Console → Firestore → Rules
2. Replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

For a personal tool this is fine. If you want login protection later, ask me and I'll add Firebase Auth.
