# 📖 Dear Diary — Kroxt BaaS × React Native Dogfooding Project

> A real-world personal diary app built with **Expo (React Native)** and **Kroxt BaaS** — demonstrating how to wire authentication, database collections, and real-time subscriptions into a production-quality mobile app.

---

## What is this?

**Dear Diary** is a dogfooding reference app created by the Kroxt team to showcase how developers can integrate **Kroxt BaaS** into a React Native project from scratch.

It covers the full lifecycle of a Kroxt-powered app:

| Feature | Kroxt API used |
|---|---|
| User registration | `baas.auth.register()` |
| Send OTP email after signup | Kroxt sends automatically on register |
| Verify OTP code | `baas.communication.verifyOtp()` |
| Email/password login | `baas.auth.login()` |
| Session persistence | `baas.auth.getCachedUser()` |
| Sign out | `baas.auth.logout()` |
| Create a diary entry | `baas.collection("lists").create()` |
| Read all diary entries | `baas.collection("lists").find()` |
| Read a single entry | `baas.collection("lists").get(id)` |
| Edit a diary entry | `baas.collection("lists").update(id, data)` |
| Delete a diary entry | `baas.collection("lists").delete(id)` |
| Live updates without polling | `baas.realtime.collection("lists").subscribe()` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) v56 (React Native) |
| Routing | [Expo Router](https://expo.github.io/router) v4 (file-based) |
| Backend | [Kroxt BaaS](https://kroxt-baas.vercel.app) via `npm install @kroxt/baas-sdk` |
| Session Storage | `@react-native-async-storage/async-storage` |
| Language | TypeScript |

---

## Project Structure

```
src/
├── app/                  # Expo Router screens (file-based routing)
│   ├── _layout.tsx       # Root Stack navigator + animated splash screen
│   ├── index.tsx         # Login screen
│   ├── register.tsx      # Registration screen (name, email, password)
│   ├── otp.tsx           # OTP verification screen
│   ├── list.tsx          # Entry list (with realtime subscription)
│   ├── new.tsx           # Create new diary entry
│   └── detail.tsx        # View / edit / delete a diary entry
│
├── components/
│   ├── AppSplash.tsx     # Animated in-app splash screen
│   ├── MoodChip.tsx      # Mood selector pill (happy / neutral / sad)
│   ├── PrimaryButton.tsx # Button with loading state + glass variant
│   ├── RubberStampBadge.tsx # Decorative icon stamp
│   └── UnderlineInput.tsx   # Text input with eye-toggle for passwords
│
├── constants/
│   └── theme.ts          # Design system — colors, fonts, spacing
│
├── utils/
│   └── mockData.ts       # Mock data seams (for UI-only development)
│
├── config.ts             # Reads env vars, throws if missing
└── kroxt.ts              # Kroxt BaaS client singleton
```

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/kroxt/dear-diary-rn.git
cd dear-diary-rn
npm install
```

### 2. Create your Kroxt project

1. Sign up at [kroxt-baas.vercel.app](https://kroxt-baas.vercel.app)
2. Create a new project
3. Copy your **Project ID** and **API Key** from the dashboard

### 3. Set your environment variables

Create a `.env` file at the root of the project:

```env
EXPO_PUBLIC_KROXT_PROJECT_ID=your_project_id_here
EXPO_PUBLIC_KROXT_API_KEY=your_api_key_here
```

> **Why `EXPO_PUBLIC_` prefix?**
> Expo only exposes env vars to the JS bundle if they are prefixed with `EXPO_PUBLIC_`. This is handled automatically — you just need to set them.

### 4. Set up your Kroxt collection

In your Kroxt dashboard, create a collection named **`lists`** with the following fields:

| Field | Type | Notes |
|---|---|---|
| `title` | String | Optional — entry heading |
| `body` | String | Required — main diary text |
| `mood` | String | `"happy"` or `"neutral"` or `"sad"` |
| `date` | String | Formatted date string, e.g. `"August 9, 2026"` |

### 5. Run the app

```bash
npx expo start
```

Scan the QR code with **Expo Go** on your phone, or press `a` for Android emulator / `i` for iOS simulator.

---

## How Kroxt is Wired In

### Client Setup — `src/kroxt.ts`

```ts
import { Kroxt } from "@kroxt/baas-sdk";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KROXT_API_KEY, KROXT_PROJECT_ID } from "./config";

export const baas = new Kroxt({
  projectId: KROXT_PROJECT_ID,
  apiKey: KROXT_API_KEY,
  storage: AsyncStorage, // Persists the auth session on device
  debug: true,
});

export default baas;
```

The `baas` client is a singleton — import it into any screen that needs backend access.

---

### Authentication

**Register** (`src/app/register.tsx`):
```ts
await baas.auth.register({ name, email, password });
router.push({ pathname: '/otp', params: { email } });
```

**Verify OTP** (`src/app/otp.tsx`):
```ts
await baas.communication.verifyOtp({ email, purpose: 'register', code });
router.replace('/list');
```

**Login** (`src/app/index.tsx`):
```ts
const session = await baas.auth.login({ email, password });
if (session.user) router.push('/list');
```

**Get current user** (`src/app/list.tsx`):
```ts
const user = await baas.auth.getCachedUser();
setUsername(user.displayName || user.name);
```

**Logout** (`src/app/list.tsx`):
```ts
await baas.auth.logout();
router.replace('/');
```

---

### OTP Verification — `baas.communication`

After registration, Kroxt automatically sends a 6-digit OTP email to the user. The app then calls `baas.communication.verifyOtp()` to validate the code and activate the account.

**Verify the OTP code** (`src/app/otp.tsx`):
```ts
const res = await baas.communication.verifyOtp({
  email: email,        // Passed from the register screen via router params
  purpose: "signup",   // Must match the purpose set during registration
  code: fullCode,      // 6-digit string joined from individual input fields
});

if (res.success) {
  router.push('/list');
} else {
  setError(res.message || 'Invalid verification code.');
}
```

**UX details implemented on the OTP screen:**
- 6 individual digit input boxes with auto-advance focus on each keystroke
- Backspace steps focus back to the previous field automatically
- A live countdown timer (`0:47 → 0:00`) before the Resend button becomes active
- The email address is displayed dynamically in the subtitle (passed as a route param from the register screen)
- Full guard: if `email` is missing (e.g. direct deep link), an error is shown before any API call is made

**Resend flow** (timer-gated):
```ts
const handleResend = () => {
  if (timer > 0) return;   // Button is disabled while countdown is active
  setTimer(59);             // Reset countdown
  // Call baas.communication to trigger a new OTP send here
};
```

---

### Database (Collections)

**Create** (`src/app/new.tsx`):
```ts
await baas.collection("lists").create({
  title: "My first entry",
  body: "Dear Diary, today was incredible...",
  mood: "happy",
  date: "August 9, 2026",
});
```

**Read all** (`src/app/list.tsx`):
```ts
const docs = await baas.collection("lists").find();
const entries = docs.map(doc => ({
  id: doc._id,
  title: doc.data.title,
  body: doc.data.body,
  mood: doc.data.mood,
  date: doc.data.date,
}));
```

> **Important:** Kroxt returns `Document<T>[]` from `.find()` and `.get()`.
> User data lives under `doc.data`, and the document ID is `doc._id`.

**Read one** (`src/app/detail.tsx`):
```ts
const doc = await baas.collection("lists").get(id);
```

**Update** (`src/app/detail.tsx`):
```ts
await baas.collection("lists").update(entry.id, {
  title: editTitle,
  body: editBody,
  mood: editMood,
});
```

**Delete** (`src/app/detail.tsx`):
```ts
await baas.collection("lists").delete(entry.id);
```

---

### Real-Time Subscriptions

The entry list subscribes to live database changes so any create, update, or delete reflects instantly — no polling or manual refresh needed (`src/app/list.tsx`):

```ts
useEffect(() => {
  const channel = baas.realtime.collection("lists").subscribe();

  channel.on("created", (doc) => {
    setEntries(prev => [mapDoc(doc), ...prev]);
  });

  channel.on("updated", (doc) => {
    setEntries(prev => prev.map(e => e.id === doc._id ? mapDoc(doc) : e));
  });

  channel.on("deleted", ({ documentId }) => {
    setEntries(prev => prev.filter(e => e.id !== documentId));
  });

  return () => channel.unsubscribe(); // Clean up on unmount
}, []);
```

---

## UX Patterns Worth Noting

### Skeleton Loading
The list screen renders animated placeholder cards while the initial fetch is in progress, using React Native's built-in `Animated` API — no extra packages needed.

### Instant Detail Navigation
Entry fields (`title`, `body`, `mood`, `date`) are passed as route params when tapping a card, so the detail screen renders **immediately** without a network fetch. A `baas.collection.get(id)` call is used only as a fallback for deep links.

### Loading States on Every Action
Every button that triggers a network call shows a loading indicator:
- Login, Register — spinner inside `PrimaryButton`
- Save (new and edit) — header button text changes to `Saving...`
- Delete — `Delete` text swaps for a red spinner
- Logout — icon and text swaps for a red spinner

### In-App Splash Screen
Since Expo Go cannot display custom native splash screens, an animated in-app splash (`AppSplash.tsx`) renders over the entire navigator on first launch — feather icon springs in, title slides up, fades out — then unmounts itself cleanly.

---

## Building for Production

To get a real custom splash screen and app icon (instead of the in-app workaround):

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure your project
eas build:configure

# Build for Android (APK for testing)
eas build --platform android --profile preview

# Build for iOS (requires Apple Developer account)
eas build --platform ios --profile preview
```

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_KROXT_PROJECT_ID` | Yes | Your Kroxt project ID |
| `EXPO_PUBLIC_KROXT_API_KEY` | Yes | Your Kroxt API key |
| `EXPO_PUBLIC_NODE_ENV` | Optional | `development` or `production` |

---

## License

MIT — free to use as a reference implementation or starting point for your own Kroxt-powered React Native app.

---

Built with love by the Kroxt team · https://kroxt-baas.vercel.app
