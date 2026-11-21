# Resistor Calculator

Find a resistor's value from its color bands. Select a band, pick its color, and the value
appears as soon as every band is set: `4.7 kΩ ±5%`.

**Use it:** https://zchumager.github.io/resistor-calculator/

- 3-, 4-, 5- and 6-band resistors (3-band = ±20%, 6-band adds the temperature coefficient)
- Only the colors that are valid for the selected band are offered, each with its name and
  meaning, so you don't have to tell brown from red by eye
- Copy the result, and the app remembers the last resistor you entered
- Works offline and installs as an app (PWA)
- Color code values follow IEC 60062:2016

## Install it on a Mac

1. Open https://zchumager.github.io/resistor-calculator/ in Google Chrome.
2. Click the install icon at the right end of the address bar (or **⋮ → Cast, save and share →
   Install page as app…**), then **Install**.
3. The app opens in its own window and appears in Launchpad and the Dock (right-click →
   **Options → Keep in Dock**). It works without an internet connection.

When a new version is published, the app shows **A new version is available** with a
**Reload** button.

To uninstall: open the app, then **⋮ → Uninstall Resistor Calculator**.

## Development

Requires Node.js 22 or newer (`.nvmrc` pins the version used here).

| Task | Command |
|---|---|
| Install dependencies | `npm ci` |
| Dev server | `npm run dev` → http://localhost:5173/resistor-calculator/ |
| Tests | `npm test` (`npm run test:watch` to keep running) |
| Lint | `npm run lint` |
| Production build | `npm run build` (also checks the service worker) |
| Preview the build | `npm run preview` → http://localhost:4173/resistor-calculator/ |

The service worker only runs in the production build, so test offline use and installing with
`npm run build && npm run preview`.

### Layout

- `src/lib/resistor.ts`: the color code table, `calculate()` and value formatting (no React)
- `src/state.ts`: app state and reducer; picks are kept per role, so changing the band count
  doesn't lose them
- `src/components/`: band-count selector, resistor drawing, color palette, result, copy button,
  update prompt
- `public/icon.svg`: the app icon; the PNG icons are generated from it at build time
  (`pwa-assets.config.ts`)
- `.github/workflows/deploy.yml`: on every push to `master`, lints, tests, builds and publishes
  to GitHub Pages

## History

Version 1 (2013) was a Firefox OS app built with jQuery. It's kept in the git history under the
tag `v1-firefox-os`. Version 2 is a rewrite in React and TypeScript as an installable web app.
