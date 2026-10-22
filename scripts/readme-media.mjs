import { chromium } from '@playwright/test';
import { mkdir, copyFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';

// Capture the actual app, sampling settled scroll positions for documentation.
// This is a walkthrough, not a recording of real-time performance.
const baseUrl = process.env.README_URL || 'http://localhost:3000';
const ids = ['xiaolongbao', 'dandannoodles', 'pekingduckbao', 'kungpaochicken'];
await mkdir('docs/media', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const manifest = { source: baseUrl, method: 'Settled scroll-position screenshots, encoded at 10 fps; not a performance benchmark.', animations: [] };
try {
  for (const [name, width, height, outputWidth, dishes, steps] of [
    ['desktop', 1440, 900, 800, ids, 24],
    ['mobile', 390, 844, 312, ['xiaolongbao'], 36],
  ]) {
    const dir = `qa/readme-capture/${name}`;
    await mkdir(dir, { recursive: true });
    const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    let index = 0;
    for (const id of dishes) {
      for (let step = 0; step <= steps; step++) {
        const p = step / steps;
        await page.evaluate(({ id, p }) => {
          const section = document.getElementById(id);
          scrollTo(0, section.offsetTop + (section.offsetHeight - innerHeight) * p);
        }, { id, p });
        await page.waitForFunction(({ id, p }) => {
          const t = Math.max(0, Math.min(1, (p - .06) / .88));
          const target = Math.round(t * t * (3 - 2 * t) * (innerWidth < 768 ? 95 : 127));
          const frame = document.querySelector(`#${id} canvas`)?.dataset.frame;
          return frame !== undefined && Math.abs(Number(frame) - target) <= 1;
        }, { id, p }, { timeout: 30000 });
        await page.waitForTimeout(step === 0 || step === steps ? 500 : 50);
        const path = `${dir}/${String(index++).padStart(4, '0')}.png`;
        await page.screenshot({ path });
        if (step === 0 && id === ids[0]) await copyFile(path, `docs/media/${name}-still.png`);
        if (step === steps) {
          for (let hold = 0; hold < 9; hold++) await copyFile(path, `${dir}/${String(index++).padStart(4, '0')}.png`);
        }
      }
      console.log(`Captured ${name}: ${id}`);
    }
    await context.close();
    const filter = `fps=10,scale=${outputWidth}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=stats_mode=diff[p];[s1][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle`;
    const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', '10', '-i', `${dir}/%04d.png`, '-frames:v', String(index), '-filter_complex', filter, '-loop', '0', `docs/media/${name}-tour.gif`], { stdio: 'inherit' });
    if (result.status !== 0) throw new Error(`GIF encoding failed: ${name}`);
    manifest.animations.push({ name, frames: index, fps: 10, seconds: index / 10, width: outputWidth });
  }
} finally {
  await browser.close();
}
await writeFile('docs/media/capture.json', JSON.stringify(manifest, null, 2) + '\n');
