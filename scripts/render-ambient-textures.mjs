// Bake the static decorative CSS treatment so animation only moves image textures.
import fs from 'node:fs';
import sharp from 'sharp';
import { chromium } from '@playwright/test';
const source=fs.readFileSync('public/art/synapse-knot.webp').toString('base64');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-gpu']});
try {
 const page=await browser.newPage({viewport:{width:780,height:780},deviceScaleFactor:1});
 for(const [name,light,filter] of [
  ['silver','radial-gradient(ellipse at 48% 42%, #ffffff5c, transparent 62%)','blur(22px) saturate(.25) brightness(1.65)'],
  ['ember','radial-gradient(ellipse at 45% 45%, #ff761c99, #d82c1730 50%, transparent 70%)','blur(26px) sepia(1) saturate(5) hue-rotate(-19deg) brightness(1.3)']
 ]) {
  await page.setContent(`<style>html,body{margin:0;background:transparent}div{position:absolute;inset:40px;background-image:${light},url(data:image/webp;base64,${source});background-size:cover;mask-image:radial-gradient(ellipse,#000 20%,#000c 42%,transparent 71%);filter:${filter}}</style><div></div>`);
  await page.locator('div').evaluate(async el=>{const matches=getComputedStyle(el).backgroundImage.match(/url\("?(data:[^"]+)"?\)/);if(matches){const img=new Image();img.src=matches[1];await img.decode();}});
  const pixels=await page.screenshot({omitBackground:true});
  await sharp(pixels).resize({width:512}).webp({quality:82,alphaQuality:80}).toFile(`public/art/ambient-${name}.webp`);
 }
} finally { await browser.close(); }
