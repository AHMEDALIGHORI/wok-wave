import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true});
await mkdir('qa/screenshots',{recursive:true});
const report={viewports:[],checks:[],errors:[]};
for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1});
  const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  await page.goto('http://localhost:3000',{waitUntil:'networkidle'});
  const ids=await page.locator('.dish-section').evaluateAll(nodes=>nodes.map(n=>n.id));
  for(const id of ids)for(const p of [0,.5,1]){
    await page.evaluate(({id,p})=>{const node=document.getElementById(id);scrollTo(0,node.offsetTop+(node.offsetHeight-innerHeight)*p);},{id,p});
    await page.waitForFunction(({id,p})=>{const c=document.querySelector(`#${id} canvas`);const count=innerWidth<768?96:128;const target=Math.round(p*(count-1));return c?.dataset.frame!==undefined&&Math.abs(Number(c.dataset.frame)-target)<=1;},{id,p},{timeout:30000});
    await page.waitForTimeout(450); // let callout springs settle for screenshot comparison
    await page.screenshot({path:`qa/screenshots/${name}-${id}-${p}.png`});
    const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
    report.viewports.push({name,id,p,horizontalOverflow:overflow,canvas:await page.locator(`#${id} canvas`).evaluate(c=>({...c.dataset}))});
  }
  for(const n of [1,2,3])for(const p of [.2,.5,.8]){
    await page.evaluate(({n,p})=>scrollTo(0,document.querySelectorAll('.dish-section')[n].offsetTop-innerHeight*(1-p)),{n,p});
    await page.waitForTimeout(250);
    await page.screenshot({path:`qa/screenshots/${name}-handoff-${n}-${p}.png`});
  }
  await page.evaluate(()=>scrollTo(0,document.getElementById('menu').offsetTop));
  await page.getByRole('tab',{name:/Dumplings/}).waitFor({state:'visible'});
  await page.waitForTimeout(350);
  await page.screenshot({path:`qa/screenshots/${name}-menu.png`});
  await page.getByRole('tab',{name:/Dumplings/}).click();
  report.checks.push({name,test:'Dumpling category',pass:await page.locator('.menu-card').count()===3});
  await page.getByRole('tab',{name:/Dumplings/}).press('ArrowRight');
  report.checks.push({name,test:'Arrow key changes tab',pass:await page.getByRole('tab',{name:/Noodles/}).getAttribute('aria-selected')==='true'});
  await page.getByRole('tab',{name:/Noodles/}).press('Home');
  report.checks.push({name,test:'Home restores all 14 items',pass:await page.locator('.menu-card').count()===14});
  await page.locator('#visit').scrollIntoViewIfNeeded();await page.screenshot({path:`qa/screenshots/${name}-visit.png`});
  await page.locator('footer').scrollIntoViewIfNeeded();await page.screenshot({path:`qa/screenshots/${name}-footer.png`});
  if(name==='mobile'){
    await page.getByRole('button',{name:'Open navigation'}).click();
    report.checks.push({name,test:'Mobile menu opens',pass:await page.locator('dialog').evaluate(d=>d.open)});
    await page.screenshot({path:'qa/screenshots/mobile-navigation.png'});
    await page.keyboard.press('Escape');report.checks.push({name,test:'Escape closes dialog',pass:await page.locator('dialog').evaluate(d=>!d.open)});
    await page.setViewportSize({width:360,height:800});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(500);await page.screenshot({path:'qa/screenshots/mobile-360.png'});
    report.checks.push({name,test:'360px no horizontal overflow',pass:await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth)});
  }
  await context.close();
}
const reduced=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
const page=await reduced.newPage();const frames=[];page.on('request',request=>{if(/\/frames\/.+\.webp/.test(request.url()))frames.push(request.url());});
await page.goto('http://localhost:3000',{waitUntil:'networkidle'});
report.checks.push({test:'Reduced motion: no frame requests',pass:frames.length===0,count:frames.length});
report.checks.push({test:'Reduced motion: no pinned stages',pass:await page.locator('.dish-stage').evaluateAll(nodes=>nodes.every(n=>getComputedStyle(n).position==='relative'))});
await page.screenshot({path:'qa/screenshots/reduced-motion.png'});
report.checks.push({test:'JSON-LD valid restaurant and 14 menu entries',pass:await page.locator('script[type="application/ld+json"]').evaluate(n=>{const data=JSON.parse(n.textContent);return data['@type']==='Restaurant'&&data.hasMenu.hasMenuSection.reduce((n,c)=>n+c.hasMenuItem.length,0)===14;})});
await browser.close();await writeFile('qa/functional-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
if(report.errors.length||report.checks.some(c=>!c.pass)||report.viewports.some(v=>v.horizontalOverflow))process.exitCode=1;
