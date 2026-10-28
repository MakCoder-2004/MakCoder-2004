import { chromium } from 'playwright';
import { existsSync } from 'node:fs';

export async function launchBrowser() {
  const candidate = process.env.CHROME_PATH || [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  ].find(existsSync);
  return chromium.launch({ headless: true, ...(candidate ? { executablePath: candidate } : {}) });
}
