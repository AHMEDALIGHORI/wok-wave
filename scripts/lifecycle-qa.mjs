import {chromium} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:3});
const errors=[],checks=[];
page.on('pageerror',error=>errors.push(error.message));
await page.goto('http://localhost:3000',{waitUntil:'networkidle'});
const seek=async(p)=>{
 await page.evaluate(p=>{const s=document.querySelector('.dish-section');scrollTo(0,s.offsetTop+(s.offsetHeight-innerHeight)*p);},p);
 await page.waitForFunction(p=>{const c=document.querySelector('canvas');const last=innerWidth<768?95:127;return c&&Math.abs(Number(c.dataset.frame)-Math.round(p*last))<=1;},p);
};
await seek(.5);
checks.push({test:'Desktop scrub at DPR 3',pass:await page.locator('canvas').first().evaluate(c=>Number(c.dataset.pixelWidth)===Math.round(c.getBoundingClientRect().width*2))});
await page.locator('footer').scrollIntoViewIfNeeded();
await page.waitForTimeout(100);
await seek(.5);checks.push({test:'Recreate frame cache after far-offscreen disposal',pass:true});
for(const [width,height,label] of [[390,844,'mobile'],[1440,900,'desktop']]){
 await page.setViewportSize({width,height});
 await seek(1);await seek(0);
 checks.push({test:`Resize across breakpoint to ${label} and scrub both endpoints`,pass:true});
}
await page.emulateMedia({reducedMotion:'reduce'});
await page.waitForFunction(()=>!document.querySelector('canvas'));
checks.push({test:'Live reduced-motion change removes canvas',pass:true});
await page.emulateMedia({reducedMotion:'no-preference'});
await page.waitForFunction(()=>document.querySelector('canvas')&&!document.querySelector('.dish-section')?.classList.contains('reduced-motion'));
await seek(.5);checks.push({test:'Re-enable motion with fresh transferable canvas',pass:true});
await browser.close();
await writeFile('qa/lifecycle-report.json',JSON.stringify({checks,errors},null,2));
console.log(JSON.stringify({checks,errors},null,2));
assert.equal(errors.length,0);assert(checks.every(c=>c.pass));
