import {mkdir,writeFile,readFile,copyFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import sharp from 'sharp';
import ffmpeg from 'ffmpeg-static';

const root='qa/video-capture';
const out='showcase';
await mkdir(out,{recursive:true});
const report=JSON.parse(await readFile(`${root}/capture-report.json`,'utf8'));
async function encode(args){
  await new Promise((resolve,reject)=>{
    const child=spawn(ffmpeg,['-hide_banner','-loglevel','error','-y',...args],{stdio:'inherit'});
    child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(`ffmpeg exit ${code}`)));
  });
}
const wrap=body=>`<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">${body}</svg>`;
const card=(closing=false)=>wrap(`
<defs><pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#fff6e5" stroke-opacity=".08"/></pattern></defs>
<rect width="1920" height="1080" fill="#e10f2b"/><rect width="1920" height="1080" fill="url(#grid)"/>
<g fill="#fff6e5" font-family="Arial,Helvetica,sans-serif">
<text x="120" y="150" font-size="26" font-weight="700" letter-spacing="8">CHINESE STREET FOOD · WEBSITE WALKTHROUGH</text>
<text x="98" y="495" font-size="230" font-weight="900" letter-spacing="-16">WOK WAVE</text>
<text x="120" y="620" font-size="64" font-weight="700">${closing?'Big flavour. Zero chill.':'Big flavour. Bigger motion.'}</text>
<text x="120" y="705" font-size="31">${closing?'Four signature dishes. A photo-rich menu. Made for every screen.':'Four dishes. One scroll. A whole lot of personality.'}</text>
<path d="M120 890H1800" stroke="#fff6e5" stroke-opacity=".4"/>
<text x="120" y="957" font-size="23" letter-spacing="5">${closing?'WOK WAVE / RESTAURANT WEBSITE TEMPLATE':'DESKTOP + MOBILE / REAL WEBSITE CAPTURE'}</text></g>
<g transform="translate(1645 510) rotate(12)"><circle r="154" fill="#111"/><circle cy="-10" r="150" fill="#b6ff3b" stroke="#111" stroke-width="5"/>
<g fill="#111" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-weight="900"><text y="-62" font-size="28">${closing?'STAY':'SCROLL TO'}</text><text y="-4" font-size="57">${closing?'HUNGRY':'SPILL'}</text><path d="M0 30V87M-30 57 0 87 30 57" fill="none" stroke="#111" stroke-width="12" stroke-linejoin="round"/></g></g>`);
const mobile=wrap(`<rect width="1920" height="1080" fill="#fff6e5"/>
<g font-family="Arial,Helvetica,sans-serif"><text x="110" y="160" fill="#e10f2b" font-size="30" font-weight="700" letter-spacing="5">WOK WAVE / ON THE GO</text>
<g fill="#111" font-size="88" font-weight="900" letter-spacing="-4"><text x="103" y="372">BIG FLAVOUR.</text><text x="103" y="480">SMALL SCREEN.</text></g>
<text x="110" y="585" fill="#111" font-size="32">From the first scroll to the last bite.</text>
<g fill="#111" font-size="29"><text x="110" y="700">Scroll-driven food animation</text><text x="110" y="754">A photo for every menu item</text><text x="110" y="808">Responsive from top to bottom</text></g>
<rect x="110" y="890" width="280" height="64" rx="32" fill="#b6ff3b" stroke="#111" stroke-width="3"/><text x="250" y="931" fill="#111" font-size="23" font-weight="700" text-anchor="middle">MADE FOR MOBILE ↗</text></g>
<rect x="961" y="121" width="408" height="862" rx="22" fill="#111"/><rect x="1401" y="121" width="408" height="862" rx="22" fill="#111"/>`);
for(const [name,svg] of [['opening',card()],['closing',card(true)],['mobile-layout',mobile]]){
  await writeFile(`${root}/${name}.svg`,svg);
  await sharp(Buffer.from(svg)).png().toFile(`${root}/${name}.png`);
}
await copyFile(`${root}/opening.png`,`${out}/WOK-WAVE-video-cover.png`);
const common=['-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-an','-movflags','+faststart'];
const ordered=[];
for(const [name,seconds] of [['opening',2.5],['closing',3]]){
  const filter=`scale=1980:1114,crop=1920:1080,fps=30,setsar=1,fade=t=in:st=0:d=0.25,fade=t=out:st=${seconds-.25}:d=0.25`;
  await encode(['-loop','1','-framerate','30','-i',`${root}/${name}.png`,'-t',String(seconds),'-vf',filter,...common,`${root}/${name}-edit.mp4`]);
}
ordered.push('opening-edit.mp4');
for(const name of ['xiaolongbao','dandannoodles','pekingduckbao','kungpaochicken','menu']){
  const seconds=report.clips.find(c=>c.name===name).seconds;
  await encode(['-i',`${root}/${name}.mp4`,'-vf',`fps=30,setsar=1,fade=t=in:st=0:d=0.18,fade=t=out:st=${(seconds-.18).toFixed(3)}:d=0.18`,...common,`${root}/${name}-edit.mp4`]);
  ordered.push(`${name}-edit.mp4`);console.log(`Edited ${name}`);
}
const mobileSeconds=Math.min(...report.clips.filter(c=>c.name.startsWith('mobile-')).map(c=>c.seconds));
await encode(['-loop','1','-framerate','30','-i',`${root}/mobile-layout.png`,'-i',`${root}/mobile-dish.mp4`,'-i',`${root}/mobile-menu.mp4`,'-filter_complex',`[0:v][1:v]overlay=970:130:shortest=1[a];[a][2:v]overlay=1410:130:shortest=1,fps=30,setsar=1,fade=t=in:st=0:d=0.2,fade=t=out:st=${(mobileSeconds-.2).toFixed(3)}:d=0.2[v]`,'-map','[v]','-t',String(mobileSeconds),...common,`${root}/mobile-edit.mp4`]);
ordered.push('mobile-edit.mp4','closing-edit.mp4');
await writeFile(`${root}/edit.ffconcat`,'ffconcat version 1.0\n'+ordered.map(name=>`file '${name}'`).join('\n'));
await encode(['-safe','0','-f','concat','-i',`${root}/edit.ffconcat`,'-c','copy','-movflags','+faststart','-metadata','title=WOK WAVE | Website Showcase','-metadata','comment=Real-time website capture, edited with title cards and fades. Silent.','showcase/WOK-WAVE-website-showcase-1080p.mp4']);
await copyFile(`${root}/capture-report.json`,`${out}/capture-report.json`);
await writeFile(`${out}/README.md`,'# WOK WAVE — Website showcase\n\n`WOK-WAVE-website-showcase-1080p.mp4` is a silent 1920×1080, 30 fps H.264 walkthrough of the local website. It contains branded title cards, all four scroll-driven dish scenes, the photo menu, and a two-screen mobile showcase.\n\nBrowser frames were captured in real time with Chrome CDP. Original frame timestamps are preserved before conversion to a constant delivery frame rate. Title cards and short fades were added during editing; this is not a performance benchmark. Supplied signature media and its visible watermarks remain unchanged.\n\nRecreate with the production site running at localhost:3000:\n\n```sh\nnode scripts/record-showcase.mjs\nnode scripts/edit-showcase.mjs\n```\n\nRaw captures are stored in ignored `qa/video-capture/`. No music, narration or external media was added.\n');
console.log('Finished showcase/WOK-WAVE-website-showcase-1080p.mp4');
