import {readFile,mkdir,stat} from 'node:fs/promises';
import sharp from 'sharp';

const {images}=JSON.parse(await readFile('assets-src/menu/generation-prompts.json','utf8'));
await mkdir('public/menu',{recursive:true});
let total=0;
for(const {id} of images){
  const output=`public/menu/${id}.webp`;
  await sharp(`assets-src/menu/${id}.png`).resize({width:960,withoutEnlargement:true}).webp({quality:82,effort:6}).toFile(output);
  const {size}=await stat(output);total+=size;
  console.log(`${id}: ${(size/1024).toFixed(1)} KiB`);
}
console.log(`Total: ${(total/1024).toFixed(1)} KiB for ${images.length} images`);
