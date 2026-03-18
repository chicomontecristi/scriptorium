# THE SCRIPTORIUM — Setup Guide

## Run Locally (takes 3 minutes)

**Prerequisites:** Node.js 18+ installed on your machine.

```bash
# 1. Navigate to the project folder
cd path/to/scriptorium

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local — add your Resend API key and email addresses

# 4. Run development server
npm run dev
```

Open http://localhost:3000

---

## What You'll See

**/** — The Initiation Screen
  Boot sequence → platform title → "OPEN THE ARCHIVE" button

**/chapter/one** — Chapter One: The Sound Before the Sound
  Full reading surface with:
  - Ink Toolbar (left rail) — Ghost Ink + Signal Ink active
  - Annotatable text — select any text, apply ink, add notes
  - Margin World (right rail) — your annotations appear here
  - Signal Ink → Question Chamber modal (one question per chapter)
  - Completion Event when you reach the end

---

## Add Content

Open `lib/content/chapters.ts`

Replace the placeholder paragraphs with actual biography text. Each paragraph is:
```typescript
{
  index: 0,         // sequential number
  text: "...",      // the paragraph text
  isIndented: false // true = indent (all paragraphs after first in a section)
}
```

For section breaks (scene breaks):
```typescript
{ index: N, isSectionBreak: true, text: "" }
```

---

## Deploy to Vercel

**Step 1 — Create a GitHub repo**
Go to github.com → New repository → name it `scriptorium` → Create.
Then in PowerShell (inside the scriptorium folder):
```bash
git init
git add .
git commit -m "Initial build — The Scriptorium Phase 1"
git remote add origin https://github.com/YOUR_USERNAME/scriptorium.git
git push -u origin main
```

**Step 2 — Deploy on Vercel**
Go to vercel.com → Sign up with GitHub → New Project → Import your `scriptorium` repo → Deploy.
Vercel auto-detects Next.js. No config needed.

**Step 3 — Add environment variables**
In Vercel dashboard → Your project → Settings → Environment Variables:
- `RESEND_API_KEY` → your Resend key
- `SIGNAL_TO_EMAIL` → your email
- `SIGNAL_FROM_EMAIL` → signal@thescriptorium.com

**Step 4 — Custom domain (optional)**
Vercel dashboard → Your project → Settings → Domains → Add `thescriptorium.com`

---

## Signal Ink Email Setup

1. Go to resend.com → Create free account
2. Add your domain or use their test address
3. Get your API key
4. Add to `.env.local`:
   ```
   RESEND_API_KEY=re_your_key
   SIGNAL_TO_EMAIL=you@youremail.com
   SIGNAL_FROM_EMAIL=signal@thescriptorium.com
   ```

---

## Phase 1 Scope (what's built)

- [x] Initiation Screen with mechanical boot sequence
- [x] Reading surface with EB Garamond typography
- [x] Ghost Ink — private annotations, localStorage
- [x] Signal Ink — Question Chamber modal + email delivery
- [x] Margin World — annotation sidebar (My Ink layer)
- [x] Chapter completion detection + Completion Event
- [x] Ink Toolbar — all 6 ink types (Ghost + Signal active)
- [x] Chapter header + epigraph + section break system
- [x] Mechanical iris wipe chapter transition

## Phase 2 Next Steps

- [ ] User accounts (Clerk auth)
- [ ] PostgreSQL annotation persistence
- [ ] Author dashboard — question queue
- [ ] Community margins
- [ ] Post-chapter author transmissions (audio)
- [ ] Stripe — Codex Key purchase (Tier 1)
