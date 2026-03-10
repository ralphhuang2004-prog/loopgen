# ReLoop — Public Demo Deploy Guide
### Share a live link with friends in under 10 minutes

---

## What you're deploying

A fully working marketplace demo with **30 pre-loaded listings** across 5 categories, 5 demo seller profiles with bios, and complete UI flows. No backend required — it all runs from demo data until you connect Supabase.

Friends will see:
- A polished splash screen with "Explore the Demo →"
- A green branded beta banner (not a dev warning)
- 30 real-looking listings with photos, descriptions, tags, and seller bios
- All screens navigable: Home, Explore, Detail, Sell form, Chat, Profile, Settings
- Auth screens (accounts aren't live yet in demo mode — clearly communicated)

---

## Option A — Vercel (recommended, 5 minutes)

### Prerequisites
- Node.js 18+ installed (`node --version`)
- A Vercel account — free at vercel.com

### Step 1 — Install dependencies and test build locally
```bash
cd reloop-release
npm install
npm run build
# Should output: dist/ folder created, no errors
```

### Step 2 — Install Vercel CLI
```bash
npm install -g vercel
```

### Step 3 — Deploy
```bash
vercel
```
Answer the prompts:
- **Set up and deploy?** → `Y`
- **Which scope?** → select your account
- **Link to existing project?** → `N`
- **Project name?** → `reloop` (or `reloop-demo`)
- **In which directory is your code?** → `.` (current)
- **Want to override settings?** → `N`

Vercel auto-detects Vite and uses `vercel.json`. After ~30 seconds:
```
✅  Production: https://reloop-xxxxx.vercel.app  [copied to clipboard]
```

### Step 4 — Deploy to production URL
```bash
vercel --prod
```
This gives you a stable URL like `https://reloop.vercel.app` (if the name is free).

### Step 5 — Share
Send friends: `https://reloop.vercel.app`

They tap "Explore the Demo →" on the splash screen and get the full experience.

---

## Option B — Netlify (alternative, also 5 minutes)

### Step 1 — Install Netlify CLI and build
```bash
npm install -g netlify-cli
npm run build
```

### Step 2 — Deploy
```bash
netlify deploy --dir=dist --prod
```
Answer the prompts:
- **Create & configure a new site?** → `Yes`
- **Team?** → your team
- **Site name?** → `reloop-demo` (or leave blank for random)

After upload:
```
✅  Website URL: https://reloop-demo.netlify.app
```

> Note: Netlify SPA routing is handled by `_redirects`. It gets auto-created by
> the Vite build — but add this file to `public/_redirects` if you see 404 on refresh:
```
/*    /index.html   200
```

---

## Option C — GitHub Pages (free, no CLI needed)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "ReLoop beta demo"
git remote add origin https://github.com/YOUR_USERNAME/reloop.git
git push -u origin main
```

### Step 2 — Enable GitHub Pages
1. Repo → **Settings** → **Pages**
2. **Source:** GitHub Actions
3. Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with: { node-version: '18' }
      - run: npm install && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

URL will be: `https://YOUR_USERNAME.github.io/reloop/`

> Note: Update `vite.config.js` `base` to `'/reloop/'` for GitHub Pages subdirectory.

---

## Environment Variables (Vercel)

### Demo mode (no setup needed)
Deploy without any env vars → app uses 30 demo listings automatically.

### Live mode (connect real backend)
Once your Supabase project is ready, add these in Vercel:

1. Vercel dashboard → your project → **Settings** → **Environment Variables**
2. Add:
   - `VITE_SUPABASE_URL` = `https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGci...`
3. **Redeploy:** Vercel dashboard → **Deployments** → latest → **Redeploy**
4. The beta banner disappears and real auth/listings/chat activate

---

## The URL you'll get

| Platform | URL format | Example |
|----------|-----------|---------|
| Vercel   | `https://[project-name].vercel.app` | `https://reloop.vercel.app` |
| Netlify  | `https://[project-name].netlify.app` | `https://reloop-demo.netlify.app` |
| GitHub Pages | `https://[user].github.io/reloop/` | `https://jsmith.github.io/reloop/` |

Vercel also gives you a unique preview URL per deploy:
`https://reloop-[hash]-[team].vercel.app`

---

## Connecting a custom domain (reloop.app)

### On Vercel:
1. Buy `reloop.app` from your registrar (Cloudflare, Namecheap, etc.)
2. Vercel dashboard → your project → **Settings** → **Domains**
3. Click **Add Domain** → type `reloop.app`
4. Vercel gives you DNS records to add:
   ```
   Type: A       Name: @     Value: 76.76.21.21
   Type: CNAME   Name: www   Value: cname.vercel-dns.com
   ```
5. Add these at your registrar's DNS settings
6. Wait 5-60 minutes for propagation
7. Vercel auto-provisions an SSL certificate

Your demo becomes live at `https://reloop.app`

### On Netlify:
1. Netlify dashboard → your site → **Domain management** → **Add custom domain**
2. Follow same DNS steps — Netlify provides equivalent records

---

## Seeding demo data into Supabase (optional)

When you connect a real Supabase backend, the 30 demo listings only exist in the frontend fallback. To also seed them into your database:

1. Create 5 test accounts in Supabase Auth (Authentication → Users → Add user)
2. Copy their UUIDs
3. Open `seed.sql` and replace:
   - `<SELLER_1_UUID>` → VintageHunter's UUID
   - `<SELLER_2_UUID>` → RetroCollector's UUID
   - `<SELLER_3_UUID>` → StreetwearArchive's UUID
   - `<SELLER_4_UUID>` → FilmCameraClub's UUID
   - `<SELLER_5_UUID>` → RetroGamesStore's UUID
4. Run `seed.sql` in Supabase SQL Editor
5. Verify: `SELECT COUNT(*) FROM listings WHERE status = 'active';` → should return 30

---

## Files changed in this release

| File | Change |
|------|--------|
| `src/App.jsx` | 30 demo listings (12 Vintage, 6 Fashion, 5 Electronics, 4 Home, 3 Sports) |
| `src/App.jsx` | 5 demo seller profiles with bio, location, joined date |
| `src/App.jsx` | Detail screen shows seller bio from DEMO_SELLERS |
| `src/App.jsx` | DemoBanner: friendly green beta banner (was yellow dev warning) |
| `src/App.jsx` | Splash: "Explore the Demo →" (was "Browse as Guest") |
| `src/App.jsx` | Auth screen: friendly "demo build" message (was Supabase jargon) |
| `vercel.json` | NEW — SPA rewrite, asset caching, security headers |
| `seed.sql` | NEW — 30 listings ready to seed into Supabase when backend connects |
| `.env.example` | Updated with Vercel-specific instructions |

---

## Demo Listings Summary

| Category | Count | Price range | Sellers |
|----------|-------|-------------|---------|
| Vintage & Collectibles | 12 | $25–$140 | VintageHunter, RetroCollector, StreetwearArchive, FilmCameraClub, RetroGamesStore |
| Fashion | 6 | $65–$310 | StreetwearArchive |
| Electronics | 5 | $195–$750 | FilmCameraClub, RetroCollector, VintageHunter, RetroGamesStore |
| Home | 4 | $65–$190 | VintageHunter, RetroCollector |
| Sports | 3 | $480–$650 | RetroCollector, VintageHunter |
| **Total** | **30** | **$25–$750** | **5 sellers** |

Every listing has: title, price, category, subcategory, condition, location, Unsplash photo, and a real-sounding description. Vintage items also have tags (90s, Y2K, Retro, Vintage, Collector, Limited Edition).

---

*ReLoop Beta v0.1.0 — demo deploy guide*
