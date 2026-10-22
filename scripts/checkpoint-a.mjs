import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('qa',{recursive:true});
const rate=Number(process.argv[2]||4);
const report={date:new Date().toISOString(),method:`Production build, Chrome headless, CDP ${rate}x CPU throttle, 8-second continuous forward scroll, RAF intervals measured after anchor-frame decode. Local lab results, not a device guarantee.`,runs:[]};
for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]) {
  // Fresh browser per viewport prevents a previous CDP throttle/session from
  // affecting the next sample; reset throttling explicitly before shutdown.
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:name==='mobile'?2:1});
  const page=await context.newPage();const errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  const cdp=await context.newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate',{rate});
  await page.goto('http://localhost:3000',{waitUntil:'load'});
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.frame==='0');
  await page.waitForFunction(()=>Number(document.querySelector('canvas')?.dataset.cached)>=17);
  await page.screenshot({path:`qa/hero-${name}-0.png`});
  const measurements=await page.evaluate(async()=>{
    const intervals=[],draw=[],longTasks=[];let previous=0,start=0;let maxCached=0;
    const observer=new PerformanceObserver(list=>longTasks.push(...list.getEntries().map(e=>e.duration)));
    observer.observe({type:'longtask',buffered:false});
    const distance=document.querySelector('.dish-section').offsetHeight-innerHeight;
    await new Promise(resolve=>requestAnimationFrame(function tick(now){
      if(!start)start=now;if(previous)intervals.push(now-previous);previous=now;
      const progress=Math.min(1,(now-start)/8000);window.scrollTo(0,progress*distance);
      const canvas=document.querySelector('canvas');draw.push(Number(canvas.dataset.drawMs));maxCached=Math.max(maxCached,Number(canvas.dataset.cached));
      if(progress<1)requestAnimationFrame(tick);else resolve();
    }));
    observer.disconnect();intervals.sort((a,b)=>a-b);draw.sort((a,b)=>a-b);
    const percentile=(values,p)=>values[Math.floor((values.length-1)*p)]||0;
    return {fps:1000/(intervals.reduce((a,b)=>a+b,0)/intervals.length),medianMs:percentile(intervals,.5),p95Ms:percentile(intervals,.95),p99Ms:percentile(intervals,.99),over25ms:intervals.filter(n=>n>25).length,totalFrames:intervals.length,maxCached,p95DrawMs:percentile(draw,.95),longTasks};
  });
  await page.waitForFunction(()=>document.querySelector('canvas')?.dataset.frame===String(innerWidth<768?95:127));
  await page.screenshot({path:`qa/hero-${name}-1.png`});
  await page.evaluate(()=>window.scrollTo(0,(document.querySelector('.dish-section').offsetHeight-innerHeight)/2));
  await page.waitForFunction(()=>Math.abs(Number(document.querySelector('canvas')?.dataset.frame)-(innerWidth<768?48:64))<=1);
  await page.screenshot({path:`qa/hero-${name}-05.png`});
  const checks=await page.evaluate(()=>({horizontalOverflow:document.documentElement.scrollWidth>innerWidth,canvas:{...document.querySelector('canvas').dataset},headingOpacity:getComputedStyle(document.querySelector('.headline-mask')).opacity}));
  report.runs.push({name,viewport:{width,height},cpuThrottle:rate,...measurements,checks,errors});
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
  await context.close();
  await browser.close();
}
report.targetFps=60;
// Allow normal 60 Hz timestamp rounding, not a lower rendering target.
report.passed=report.runs.every(run=>run.fps>=59&&run.p95Ms<=20);
await writeFile(rate===4?'qa/checkpoint-a.json':`qa/checkpoint-${rate}x.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if(!report.passed)process.exitCode=1;
