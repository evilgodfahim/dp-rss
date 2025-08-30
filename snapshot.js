import fs from 'fs';
import puppeteer from 'puppeteer';

const SOURCE_URL = 'https://www.dhakapost.com/opinion';
const OUTPUT_FILE = 'index.html';

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  await page.goto(SOURCE_URL, { waitUntil: 'networkidle2' });
  await page.waitForTimeout(5000); // extra wait for dynamic content

  // Inject base tag for proper resolution of relative URLs
  await page.evaluate(() => {
    const base = document.createElement('base');
    base.href = window.location.origin;
    document.head.prepend(base);
  });

  // Remove all <script> tags to make it static
  await page.evaluate(() => {
    document.querySelectorAll('script').forEach(s => s.remove());
  });

  const html = await page.content();
  await fs.promises.writeFile(OUTPUT_FILE, html, 'utf-8');

  console.log(`Snapshot saved to ${OUTPUT_FILE}`);
  await browser.close();
})();
