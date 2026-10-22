import {chromium} from '@playwright/test';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import path from 'node:path';
import ffmpeg from 'ffmpeg-static';

const root='qa/video-capture';
await mkdir(root,{recursive:true});
const report={source:'http://localhost:3000',method:'Real-time Chrome CDP screencast. Original capture timestamps preserved; encoded to constant 30 fps for editing. No synthetic food frames or performance claims.',clips:[],errors:[]};
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--hide-scrollbars']});
async function encode(args){
  await new Promise((resolve,reject)=>{
    const child=spawn(ffmpeg,['-hide_banner','-loglevel','error','-y',...args],{stdio:'inherit'});
    child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(`ffmpeg exit ${code}`)));
  });
}
async function scroll(page,target,duration){
  await page.evaluate(({target,duration})=>new Promise(resolve=>{
    const from=scrollY,start=performance.now();
    function step(time){const t=Math.min(1,(time-start)/duration);const eased=t*t*(3-2*t);scrollTo(0,from+(target-from)*eased);if(t<1)requestAnimationFrame(step);else resolve();}
    requestAnimationFrame(step);
  }),{target,duration});
}
async function capture(name,viewport,prepare,perform){
  const context=await browser.newContext({viewport,deviceScaleFactor:1});
  const page=await context.newPage();
  page.on('pageerror',e=>report.errors.push({name,error:e.message}));
  await page.goto('http://localhost:3000',{waitUntil:'networkidle'});
  await page.locator('.preloader').waitFor({state:'hidden',timeout:30000});
  await prepare(page);
  await page.waitForTimeout(500);
  const session=await context.newCDPSession(page);
  const frames=[];
  session.on('Page.screencastFrame',event=>{
    frames.push({data:event.data,time:event.metadata.timestamp});
    void session.send('Page.screencastFrameAck',{sessionId:event.sessionId}).catch(()=>{});
  });
  await session.send('Page.startScreencast',{format:'jpeg',quality:92,maxWidth:viewport.width,maxHeight:viewport.height,everyNthFrame:1});
  const start=Date.now();
  await page.waitForTimeout(700);
  await perform(page);
  await page.waitForTimeout(1100);
  await session.send('Page.stopScreencast');
  const elapsed=(Date.now()-start)/1000;
  await page.screenshot({path:`${root}/${name}-final.png`});
  await context.close();
  if(frames.length<20)throw new Error(`Too few frames: ${name}`);
  const dir=`${root}/${name}`;await mkdir(dir,{recursive:true});
  const concat=['ffconcat version 1.0'];
  for(let i=0;i<frames.length;i++){
    const filename=`${String(i).padStart(5,'0')}.jpg`;
    await writeFile(`${dir}/${filename}`,Buffer.from(frames[i].data,'base64'));
    concat.push(`file '${filename}'`);
    const duration=i<frames.length-1?Math.max(.001,frames[i+1].time-frames[i].time):Math.max(1/30,elapsed-(frames[i].time-frames[0].time));
    concat.push(`duration ${duration.toFixed(6)}`);
  }
  concat.push(`file '${String(frames.length-1).padStart(5,'0')}.jpg'`);
  await writeFile(`${dir}/frames.ffconcat`,concat.join('\n'));
  await encode(['-safe','0','-f','concat','-i',`${dir}/frames.ffconcat`,'-t',elapsed.toFixed(3),'-vf','fps=30,format=yuv420p','-c:v','libx264','-preset','fast','-crf','17','-movflags','+faststart',`${root}/${name}.mp4`]);
  report.clips.push({name,viewport,seconds:elapsed,frames:frames.length});
  await writeFile(`${root}/capture-report.json`,JSON.stringify(report,null,2));
  console.log(`Recorded ${name}: ${elapsed.toFixed(1)}s / ${frames.length} captured frames`);
}
async function prepareDish(page,id){
  await page.evaluate(id=>scrollTo(0,document.getElementById(id).offsetTop),id);
  await page.waitForFunction(id=>Number(document.querySelector(`#${id} canvas`)?.dataset.frame)===0,id,{timeout:30000});
  await page.waitForLoadState('networkidle');
}
async function animateDish(page,id,duration){
  const end=await page.evaluate(id=>{const s=document.getElementById(id);return s.offsetTop+(s.offsetHeight-innerHeight)*.94;},id);
  await scroll(page,end,duration);
}
async function prepareMenu(page){
  await page.evaluate(()=>scrollTo(0,document.getElementById('menu').offsetTop));
  await page.locator('.menu-card').first().waitFor();
  for(const img of await page.locator('.menu-card img').all())await img.evaluate(async img=>{img.loading='eager';await img.decode();});
  await page.evaluate(()=>scrollTo(0,document.getElementById('menu').offsetTop));
}
try{
  for(const id of ['xiaolongbao','dandannoodles','pekingduckbao','kungpaochicken']){
    await capture(id,{width:1920,height:1080},page=>prepareDish(page,id),page=>animateDish(page,id,5200));
  }
  await capture('menu',{width:1920,height:1080},prepareMenu,async page=>{
    const end=await page.evaluate(()=>{const s=document.getElementById('menu');return s.offsetTop+s.offsetHeight-innerHeight+30;});
    await scroll(page,end,5600);
  });
  await capture('mobile-dish',{width:390,height:844},page=>prepareDish(page,'xiaolongbao'),page=>animateDish(page,'xiaolongbao',6000));
  await capture('mobile-menu',{width:390,height:844},async page=>{
    await prepareMenu(page);await page.locator('.menu-card').nth(4).evaluate(c=>scrollTo(0,scrollY+c.getBoundingClientRect().top-105));
  },async page=>{
    const end=await page.locator('.menu-card').last().evaluate(c=>scrollY+c.getBoundingClientRect().bottom-innerHeight+30);
    await scroll(page,end,6000);
  });
}finally{await browser.close();}
if(report.errors.length)throw new Error(JSON.stringify(report.errors));
