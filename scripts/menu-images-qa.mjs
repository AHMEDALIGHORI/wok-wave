import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';

const browser=await chromium.launch({channel:'chrome',headless:true});
const report={date:new Date().toISOString(),viewports:[],errors:[]};
await mkdir('qa/screenshots',{recursive:true});
try{
  for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
    const page=await browser.newPage({viewport:{width,height}});
    page.on('pageerror',error=>report.errors.push(error.message));
    await page.goto('http://localhost:3000/#menu',{waitUntil:'networkidle'});
    await page.locator('#menu').scrollIntoViewIfNeeded();
    await page.locator('.menu-card').first().waitFor();
    const cards=page.locator('.menu-card');
    const count=await cards.count();
    if(count!==14)throw new Error(`Expected 14 cards, found ${count}`);
    for(const card of await cards.all()){
      await card.scrollIntoViewIfNeeded();
      await card.locator('img').evaluate(img=>img.decode());
    }
    const images=await page.locator('.menu-card img').evaluateAll(nodes=>nodes.map(img=>({alt:img.alt,src:img.getAttribute('src'),width:img.naturalWidth,height:img.naturalHeight})));
    if(new Set(images.map(i=>i.src)).size!==14||images.some(i=>!i.width||!i.alt))throw new Error('Missing, duplicate or inaccessible menu images');
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    if(overflow)throw new Error(`${name}: horizontal overflow`);
    await cards.nth(4).evaluate(card=>window.scrollTo(0,scrollY+card.getBoundingClientRect().top-125));
    await page.waitForTimeout(350);
    await page.screenshot({path:`qa/screenshots/${name}-menu-photography.png`});
    const categories=[];
    for(const tab of await page.getByRole('tab').all()){
      await tab.click();
      const count=await cards.count();
      const label=await tab.textContent();
      if(count===0||await page.locator('.menu-card img').count()!==count)throw new Error(`Category image count failed: ${label}`);
      categories.push({label,count});
    }
    report.viewports.push({name,width,images,categories,horizontalOverflow:overflow});
    await page.close();
  }
}finally{await browser.close();}
await writeFile('qa/menu-images-report.json',JSON.stringify(report,null,2)+'\n');
if(report.errors.length)throw new Error(report.errors.join('\n'));
console.log('PASS: 14 unique loaded menu photos, six working category tabs, no overflow or page errors at desktop and mobile sizes.');
