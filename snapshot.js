import fs from 'fs';
import puppeteer from 'puppeteer';

const SOURCE_URL = 'https://www.dhakapost.com/opinion';
const OUTPUT_FILE = 'index.html';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Go to the page and wait for network idle
  await page.goto(SOURCE_URL, { waitUntil: 'networkidle2' });

  // Extra wait to allow dynamic content to load
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Inject <base> so relative URLs resolve correctly
  await page.evaluate(() => {
    const base = document.createElement('base');
    base.href = window.location.origin;
    document.head.prepend(base);
  });

  // Remove all <script> tags to make page static
  await page.evaluate(() => {
    document.querySelectorAll('script').forEach(s => s.remove());
  });

  // Save the page content as index.html
  const html = await page.content();
  await fs.promises.writeFile(OUTPUT_FILE, html, 'utf-8');

  console.log(`Snapshot saved to ${OUTPUT_FILE}`);
  await browser.close();
})();
