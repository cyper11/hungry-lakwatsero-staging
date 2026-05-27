import puppeteer from 'puppeteer';
import { spawn } from 'child_process';

(async () => {
  console.log('Starting dev server...');
  const devProcess = spawn('npm.cmd', ['run', 'dev', '--', '--port', '3005', '--strictPort'], { shell: true });

  await new Promise(r => setTimeout(r, 4000));

  console.log('Server started. Launching puppeteer...');
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

  console.log('Navigating to page...');
  try {
    await page.goto('http://localhost:3005', { waitUntil: 'networkidle0' });
    console.log('Page loaded.');
  } catch (err) {
    console.error('Goto error:', err);
  }

  await browser.close();
  devProcess.kill();
  console.log('Done.');
  process.exit(0);
})();
