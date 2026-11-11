// node screenshot.mjs <url> [label] [width]
// Saves full-page screenshots to ./temporary screenshots/screenshot-N[-label].png
import { mkdir, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const PUPPETEER_DIR = process.env.PUPPETEER_DIR;
const require = createRequire(PUPPETEER_DIR ? join(PUPPETEER_DIR, 'x.js') : import.meta.url);
const puppeteer = require('puppeteer-core');

const findChrome = () => {
  const base = join(homedir(), '.cache/puppeteer/chrome');
  if (!existsSync(base)) return undefined;
  const { readdirSync } = require('node:fs');
  const dir = readdirSync(base).sort().pop();
  return join(base, dir, 'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing');
};

const [url = 'http://localhost:3000', label, width = '1440'] = process.argv.slice(2);
const outDir = './temporary screenshots';
await mkdir(outDir, { recursive: true });
const n = (await readdir(outDir)).filter(f => f.startsWith('screenshot-')).length + 1;
const name = `screenshot-${n}${label ? '-' + label : ''}.png`;

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || findChrome(), headless: true });
const page = await browser.newPage();
await page.setViewport({ width: +width, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
// Reveal scroll-triggered content before capturing
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
  document.querySelectorAll('img[loading=lazy]').forEach(img => img.loading = 'eager');
  await Promise.all([...document.images].map(img => img.complete ? 0 : new Promise(r => { img.onload = img.onerror = r; })));
  window.scrollTo(0, 0);
  document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-in'));
});
await new Promise(r => setTimeout(r, 1200));
await page.screenshot({ path: join(outDir, name), fullPage: true });
await browser.close();
console.log(join(outDir, name));
