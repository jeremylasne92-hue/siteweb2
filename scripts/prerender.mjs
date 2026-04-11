/**
 * Prerender script for AI SEO — renders SPA routes to static HTML
 * so that AI crawlers (GPTBot, ClaudeBot, PerplexityBot) can read content.
 *
 * Usage: node scripts/prerender.mjs
 * Runs after `vite build` and modifies files in frontend/dist/
 */

import { createRequire } from 'module';
import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = join(__dirname, '..', 'frontend');
const DIST_DIR = join(FRONTEND_DIR, 'dist');

// Resolve puppeteer from frontend/node_modules
const require = createRequire(join(FRONTEND_DIR, 'package.json'));
const puppeteer = require('puppeteer');
const PORT = 4173;

// Public routes to prerender (must match sitemap.xml)
const ROUTES = [
  '/',
  '/serie',
  '/a-propos',
  '/mouvement',
  '/cognisphere',
  '/echolink',
  '/partenaires',
  '/agenda',
  '/ressources',
  '/soutenir',
  '/contact',
  '/faq',
  '/politique-de-confidentialite',
  '/mentions-legales',
  '/cgu',
];

/**
 * Simple static file server for the built SPA
 */
function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);

      // SPA fallback: serve index.html for routes without file extensions
      if (!filePath.includes('.') || !existsSync(filePath)) {
        filePath = join(DIST_DIR, 'index.html');
      }

      try {
        const content = readFileSync(filePath);
        const ext = filePath.split('.').pop();
        const mimeTypes = {
          html: 'text/html',
          js: 'application/javascript',
          css: 'text/css',
          json: 'application/json',
          png: 'image/png',
          jpg: 'image/jpeg',
          svg: 'image/svg+xml',
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(PORT, () => {
      console.log(`  Static server on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

/**
 * Prerender a single route and save the HTML
 */
async function prerenderRoute(browser, route) {
  const page = await browser.newPage();

  // Block external resources to speed up rendering
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const type = req.resourceType();
    const url = req.url();
    // Block images/fonts/media and external requests (Unsplash, GA, etc.)
    if (['image', 'font', 'media'].includes(type) ||
        (!url.startsWith(`http://localhost:${PORT}`) && type !== 'script')) {
      req.abort();
    } else {
      req.continue();
    }
  });

  const url = `http://localhost:${PORT}${route}`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  // Wait for React to render
  await page.waitForSelector('#root > *', { timeout: 10000 });

  // Get the rendered HTML
  const html = await page.content();

  // Determine output path
  const outputPath = route === '/'
    ? join(DIST_DIR, 'index.html')
    : join(DIST_DIR, route.slice(1), 'index.html');

  // Create directory if needed
  const outputDir = dirname(outputPath);
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  writeFileSync(outputPath, html, 'utf-8');
  await page.close();
}

async function main() {
  console.log('\n🔍 Prerendering SPA for AI crawlers...\n');

  // Check dist exists
  if (!existsSync(join(DIST_DIR, 'index.html'))) {
    console.error('❌ frontend/dist/ not found. Run `npm run build` first.');
    process.exit(1);
  }

  const server = await startServer();
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let success = 0;
  let failed = 0;

  for (const route of ROUTES) {
    try {
      await prerenderRoute(browser, route);
      console.log(`  ✓ ${route}`);
      success++;
    } catch (err) {
      console.error(`  ✗ ${route} — ${err.message}`);
      failed++;
    }
  }

  await browser.close();
  server.close();

  console.log(`\n✅ Prerendered ${success}/${ROUTES.length} routes (${failed} failed)\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
