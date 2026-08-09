# Prompt: Build the Diary App Frontend (UI Only, Mock Data)

Copy everything below into your AI coding agent (Claude Code, Cursor, etc.) inside your already-scaffolded project.

---

## Context

This is a React Native (Expo) app — a personal diary where a user writes dated entries. **Build the frontend only.** Do not install, initialize, or call `@kroxt/baas-sdk` anywhere in this pass — no auth calls, no database calls, no real network requests of any kind. Every screen should work end-to-end against **local mock/in-memory data** so the full app is clickable and demoable on its own. The Kroxt backend integration will be wired up separately, by hand, afterward — leave clearly marked seams for that (see "Where the backend will plug in" below), but do not attempt the integration yourself.

---

## UI Style Spec — "Ink & Parchment"

This is the diary app's own visual identity — distinct from any other branding. Follow it exactly; don't default to a generic Material/iOS look.

### Colors
```
paper        #F1EAD8   — main background
paperDim     #E7DEC6   — secondary/dim background
ink          #2F4538   — primary text, primary buttons, icons
inkFaint     #5C6E5E   — secondary text, placeholders, hints
ochre        #C97F2B   — accent color, used sparingly (secondary CTAs, links, active states)
ochreDeep    #A5651C   — pressed/darker accent state
moodHappy    #C97F2B
moodNeutral  #8E8267
moodSad      #5B6B8C
danger       #8C3A2B   — errors, destructive actions
line         rgba(47, 69, 56, 0.18)  — hairline dividers, input underlines
white        #FFFDF8   — card surfaces, text on dark fills
```

### Typography
- **Display/headings:** a serif face (Georgia as a safe cross-platform default; swap for a loaded custom serif like Lora if using `expo-font`) — used for screen titles, entry titles. Weight 700.
- **Body/UI:** system sans-serif for everything else — labels, inputs, body text, buttons.
- Sizes: xs 12 / sm 14 / base 16 / lg 20 / xl 26 / xxl 32

### Signature elements (use these — they're what makes this app recognizable, not generic)
- **Rubber-stamp badge:** a circular outline (2px border, accent or ink color) containing a small icon, often rotated slightly (e.g. -6deg) — used on auth screens and empty states. Evokes a diary/journal stamp, not a generic app icon.
- **Underline inputs, not boxed inputs:** text fields are plain text with a 2px bottom border (`line` color, or `ink`/`ochre` when focused) — no filled backgrounds, no rounded input boxes. This is a deliberate "writing on paper" feel.
- **Ruled/paper texture cues:** favor hairline dividers and generous whitespace over cards-on-cards; when cards are used (e.g. entry list items), keep them white (`#FFFDF8`) with a thin `line`-color border, not shadows.
- **Mood chips:** pill-shaped, colored border matching the mood color, filled with that color only when selected — text white when filled, mood-color when unfilled.
- **Primary buttons:** solid `ink` background, white text, 10px corner radius. Reserve `ochre` fill for the single most "committing" action per flow (e.g. Create account, not Cancel).

### Tone of copy (apply throughout)
- Warm, plain, first-person-adjacent but not twee. "Dear diary" / "Welcome back. Your pages are waiting." / "No entries yet — write your first one."
- Errors are direct and human, not technical: "Write something before saving" not "Validation failed: body field empty."
- Empty states are an invitation, not an apology.

Reference the two mockup files already produced (auth screens: Login, Register, OTP; and the theme token file from the earlier code pass) if they're available in this project's assets — match them exactly rather than reinterpreting the style.

---

## Screens to build (frontend only, mock data)

### 1. Login
Email + password fields (underline style), primary "Open my diary" button, rotated stamp badge with a feather/pen icon, link to Register. On submit with any non-empty input, simulate a successful login (no real auth) and navigate to the Entry List.

### 2. Register
Email, password, confirm password fields, ochre-filled "Create my diary" button, link back to Login. Include simple client-side validation (passwords match, password length ≥ 8) using local state only — no backend check.

### 3. OTP Verification
6-digit code input (individual underlined boxes, matching the mockup), "Verify code" button, resend timer text ("Resend code in 0:47"). Simulate verification with mock logic (e.g. any 6 digits entered succeeds, or hardcode a specific mock code) and navigate onward.

### 4. Entry List
Reads from a local mock array of diary entries (create ~5-6 realistic sample entries with varied moods and dates, hardcoded in a mock data file). Most recent first. Each card shows date, title (if present), mood dot, and a 2-line preview of the body. Empty state (stamp icon + "No entries yet — write your first one") should also be buildable/toggleable for demo purposes (e.g. a way to view it with the mock array emptied). Floating circular "+" button (ink background) navigates to New Entry.

### 5. New Entry
Title (optional), mood picker (three chips: Good day / Just okay / Rough day), body text area, Save/Cancel in the header. On save, add the entry to the local mock array (in-memory state is fine — persistence isn't required this pass) and navigate back to the list.

### 6. Entry Detail / Edit
View a single mock entry; Edit and Delete actions in the header. Edit toggles the same fields as New Entry inline. Delete shows a confirmation alert before removing the entry from local mock state.

---

## Where the backend will plug in (leave these seams, don't implement them)

In each relevant screen/file, leave a clearly marked comment showing where a real Kroxt call will eventually replace the mock logic, e.g.:

```ts
// MOCK — replace with real Kroxt call later:
// await baas.auth.login({ email, password })
function mockLogin(email: string, password: string) {
  return Promise.resolve({ success: true });
}
```

Structure the mock data access behind simple functions (e.g. `getMockEntries()`, `saveMockEntry()`, `deleteMockEntry()`) in a single `mockData.ts` file, rather than scattering inline arrays across screens — this makes it easy to swap the internals for real Kroxt calls later without changing every screen's UI code.

---

## What NOT to do
- Do not install or import `@kroxt/baas-sdk` anywhere in this pass
- Do not make any real network calls
- Do not implement real authentication, persistence, or security — all of that comes later against the real backend
- Do not default to a generic/Material look — every screen must follow the Ink & Parchment spec above
- Do not skip the empty state, loading state is not needed this pass since there's no real async latency, but keep the code structured so a loading state could be added later without a rewrite

## Deliverable
When done, provide:
1. A list of every screen built and confirmation it runs against mock data end-to-end (login → OTP → list → new entry → detail → edit/delete)
2. Confirmation the UI style spec was followed (colors, typography, signature elements) rather than a generic default
3. Where the mock data lives and how it's structured, so wiring it to real Kroxt calls later is a clean swap