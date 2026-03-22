import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1440, height: 900 });
await page.goto('http://localhost:5175', { waitUntil: 'networkidle' });
await page.waitForTimeout(1000);

// Digita o código de acesso
await page.fill('input[type="password"], input[placeholder*="código"]', '007REALS');
await page.click('button:has-text("Acessar")');
await page.waitForTimeout(3000);

await page.screenshot({ path: './dash-logado.png', fullPage: false });
console.log('screenshot do dashboard salvo em dash-logado.png');
await browser.close();
