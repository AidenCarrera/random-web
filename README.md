# Random Webs

Random Webs is my collection of small interactive websites built with Next.js. Every page explores a different idea, from music tools and visualizers to simulations, games, and other experiments that I thought would be fun to build.

The home page sends you to a random site and keeps track of the ones you've already visited. All site information lives in a single registry that's also used to generate metadata, the sitemap, validation scripts, and automated tests.

## Stack

- Next.js 16 and React 19
- TypeScript 6
- Tailwind CSS 4 and CSS Modules
- Tone.js and Framer Motion
- Three.js and Matter.js
- Playwright

## Requirements

- Node.js 24.x (`.node-version` contains `24`)
- pnpm 11.x (the project pins pnpm 11.12.0)
- FFmpeg on `PATH` if you plan to normalize audio

## Setup

```bash
git clone https://github.com/AidenCarrera/random-webs.git
cd random-webs
pnpm install
pnpm dev
```

The development server runs at http://localhost:3000.

To make the development server available to phones and other devices on your local network, run:

```bash
pnpm dev:mobile
```

Then open `http://<your-computer's-local-IP>:3000` on the other device. Your firewall may prompt you to allow Node.js access to private networks.

For local metadata and origin settings, copy `.env.example` to `.env.local`.

| Variable              | Use                                                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `SITE_URL`            | Base URL for metadata, canonical links, the sitemap, and robots output. Server-side only. Use `http://localhost:3000` for local development. |
| `ALLOWED_DEV_ORIGINS` | Optional comma-separated origins allowed by the Next.js development server.                                                                  |

## Commands

| Command                      | What it does                                                      |
| ---------------------------- | ----------------------------------------------------------------- |
| `pnpm dev`                   | Starts the development server.                                    |
| `pnpm dev:mobile`            | Starts the development server for mobile testing.                 |
| `pnpm build`                 | Creates a production build.                                       |
| `pnpm start`                 | Starts an existing production build.                              |
| `pnpm format:check`          | Checks formatting with Prettier.                                  |
| `pnpm lint`                  | Runs ESLint.                                                      |
| `pnpm typecheck`             | Runs TypeScript without emitting files.                           |
| `pnpm validate:websites`     | Checks registry entries, pages, layouts, and metadata wiring.     |
| `pnpm check`                 | Runs formatting, linting, type checking, and website validation.  |
| `pnpm test:smoke`            | Runs Playwright against the development server.                   |
| `pnpm test:smoke:production` | Builds the app and runs Playwright against the production server. |
| `pnpm open:websites`         | Opens registered websites alphabetically in the default browser.  |
| `pnpm normalize:lofi`        | Normalizes top-level Lofi Pixel Study audio files with FFmpeg.    |

## Testing

Install Playwright's Chromium browser after installing dependencies:

```bash
pnpm exec playwright install chromium
```

`pnpm test:smoke` reuses a running development server or starts one on port 3100. It checks every registered site for a successful response, a document title, console errors, and uncaught page errors. There are also interaction tests for Algo Race, Boids Simulator, Falling Sand, Fluid Simulation, Fractal Explorer, Lofi Pixel Study, Olo Terminal, Repository Visualizer, Solar System, and Zen Garden, plus a server-render check for the home page and the not-found route.

```bash
# Limit the registry-wide route checks to sites changed since HEAD
pnpm test:smoke --changed

# Test a server that is already running
pnpm test:smoke --base-url http://localhost:3000

# Pass options through to Playwright
pnpm test:smoke --headed

# Build and test the production server
pnpm test:smoke:production
```

The GitHub Actions workflow runs a frozen install, formatting, linting, type checking, website validation, a production build, and the Chromium smoke tests on pushes to `main` and on pull requests. The smoke tests run against the production build made earlier in the job, and the Playwright HTML report is uploaded as an artifact when they fail.

## Opening sites manually

Start the development server first, then run one of these commands:

```bash
# Open every registered site
pnpm open:websites

# Open sites with staged, unstaged, or untracked changes
pnpm open:websites --changed

# Print the changed URLs without opening them
pnpm open:websites --changed --dry-run

# Point the script at another server
pnpm open:websites --base-url http://localhost:3100
```

The changed-site check watches `src/app/<route>/` and `public/<route>/`.

## Adding a site

1. Create `src/app/<route>/page.tsx`. Route names must use lowercase kebab-case.
2. Create `src/app/<route>/layout.tsx` and call `createWebsiteMetadata("/<route>")`.
3. Add the site to `WEBSITES` in `src/lib/websites.ts`. Include its path, title, blurb, accent classes, SEO title, and description.
4. Put route-specific public files in `public/<route>/`. Shared fonts belong in `public/fonts/`.
5. Use Tailwind for small styles and `styles.module.css` for route-specific CSS.
6. Run `pnpm check` and the relevant smoke tests.

Every registered site needs both `page.tsx` and `layout.tsx`. `pnpm validate:websites` catches missing files, metadata mismatches, duplicate paths, and unregistered routes. `/dev` is the only page route intentionally left out of the registry.

## Developer index

`/dev` shows an alphabetical list of every registered site. It's hidden from search indexing and can be unlocked with `olo`. The browser remembers the unlock, making it easier to test.

## Audio normalization

`pnpm normalize:lofi` processes top-level `.mp3`, `.wav`, `.ogg`, and `.m4a` files in `public/lofi-pixel-study/`. It uses FFmpeg's two-pass loudness normalization, targets -14 LUFS, and writes new files to `public/lofi-pixel-study/normalized/`. Existing output files are skipped.

```bash
# See which files would be processed
pnpm normalize:lofi --dry-run

# Normalize the files
pnpm normalize:lofi

# List every available option
pnpm normalize:lofi --help
```

## Structure

```text
.github/workflows/ci.yml    CI workflow
public/                     Static files, assets, and fonts
scripts/                    Maintenance and test scripts
src/app/                    Routes, layouts, and route components
src/components/             Shared React components
src/lib/websites.ts         Website registry, metadata, and shared site configuration
src/lib/websiteMetadata.ts  Shared metadata helper
tests/                      Playwright smoke and interaction tests
```
