# Decade Draft

Blind draft five mystery stocks per decade from the 1980s to 2020s. $50K invested. Can you beat the S&P 500?

Inspired by [82-0.com](https://www.82-0.com/) — the NBA decade draft game, reimagined for finance.

**Play online:** after you deploy (see below), your site will be at  
`https://YOUR-GITHUB-USERNAME.github.io/decade-draft/`

## Quick start (local)

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Publish to GitHub Pages (beginner guide)

Everything is already set up to auto-deploy when you push to GitHub. You only need to create the repo once and turn Pages on.

### Step 1 — Create a GitHub account and repository

1. Go to [github.com](https://github.com) and sign in (or create an account).
2. Click the **+** button (top right) → **New repository**.
3. Name it **`decade-draft`** (use this exact name so the live URL is predictable).
4. Leave it **Public**.
5. Do **not** check “Add a README” (you already have one in the project).
6. Click **Create repository**.

You’ll land on a page with setup instructions — you can ignore those; follow Step 2 below instead.

### Step 2 — Upload the project from your Mac

1. Open **Terminal** (Spotlight: press ⌘+Space, type `Terminal`, Enter).
2. Copy and paste these commands **one block at a time**, pressing Enter after each block.

Replace `YOUR-GITHUB-USERNAME` with your actual GitHub username.

```bash
cd ~/Desktop/decade-draft
```

```bash
git init
git add .
git commit -m "Initial commit: Decade Draft game"
```

```bash
git branch -M main
git remote add origin https://github.com/YOUR-GITHUB-USERNAME/decade-draft.git
git push -u origin main
```

The last command will ask you to sign in to GitHub in the browser. Complete that when prompted.

> **Note:** The game data file (`src/data/stock-data.json`, ~3 MB) is included so the site works without re-fetching stock prices on every deploy.

### Step 3 — Turn on GitHub Pages

1. On GitHub, open your **decade-draft** repository.
2. Click **Settings** (top tab).
3. In the left sidebar, click **Pages**.
4. Under **Build and deployment** → **Source**, choose **GitHub Actions** (not “Deploy from a branch”).
5. That’s it — no other settings needed on this screen.

### Step 4 — Wait for the deploy

1. Click the **Actions** tab at the top of your repo.
2. You should see a workflow run called **Deploy to GitHub Pages** (triggered by your push).
3. Wait until it shows a **green checkmark** (usually 1–2 minutes).
4. Open your site at:

   **`https://YOUR-GITHUB-USERNAME.github.io/decade-draft/`**

   (Replace `YOUR-GITHUB-USERNAME` with your username.)

### Updating the site later

After you change the game on your computer:

```bash
cd ~/Desktop/decade-draft
git add .
git commit -m "Describe what you changed"
git push
```

GitHub will rebuild and republish automatically within a couple of minutes.

### Troubleshooting

| Problem | What to try |
|--------|-------------|
| Blank page or broken styling | Make sure the repo is named `decade-draft`, or rename it and update nothing else — the deploy script reads the repo name automatically. |
| `git push` asks for password forever | Use GitHub’s browser login when Terminal prompts you, or install [GitHub Desktop](https://desktop.github.com/) and use it to push instead. |
| Actions tab shows a red X | Click the failed run, expand the red step, and read the error message. |
| Pages still says “None” for source | In Settings → Pages, set Source to **GitHub Actions**. |

## Refresh stock data (optional, for developers)

Historical prices are pre-fetched from Yahoo Finance and stored in `src/data/stock-data.json`.

```bash
npm run fetch-data
git add src/data/stock-data.json
git commit -m "Update stock data"
git push
```

## Disclaimer

For entertainment and education only. Not financial advice. Survivorship bias applies — the stock universe only includes companies with available price history.
