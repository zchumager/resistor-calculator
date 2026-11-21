// Fails the build if the generated service worker would cache nothing.
// Workbox throws when a URL is precached twice with different revisions, and the worker then
// installs without a cache, so the installed app stops working offline without any error.
import { readFileSync } from 'node:fs'

const sw = readFileSync(new URL('../dist/sw.js', import.meta.url), 'utf8')
const urls = [...sw.matchAll(/\{url:"([^"]+)",revision:/g)].map((m) => m[1])
const duplicates = urls.filter((url, i) => urls.indexOf(url) !== i)

const required = ['index.html', 'manifest.webmanifest', 'pwa-192x192.png', 'pwa-512x512.png']
const missing = required.filter((url) => !urls.includes(url))

if (duplicates.length || missing.length || !urls.some((u) => u.endsWith('.js'))) {
  console.error('Service worker precache is broken:', { duplicates, missing, urls })
  process.exit(1)
}
console.log(`Service worker precaches ${urls.length} files, no duplicates.`)
