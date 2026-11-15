// Render the original sculpture shader once for software-graphics and no-JS visitors.
// Run from the repository root with: node scripts/render-sculpture.mjs
import fs from "node:fs";
import ts from "typescript";
import sharp from "sharp";
import { chromium } from "@playwright/test";
const source = fs.readFileSync("components/experience/Sculpture.tsx", "utf8");
const geometry = ts.transpile(
  source.slice(
    source.search(/const vertex\s*=/),
    source.indexOf("export function Sculpture"),
  ),
  { target: ts.ScriptTarget.ES2020 },
);
const helpers = ts.transpile(
  fs.readFileSync("lib/graphics.ts", "utf8").replace(/export /g, ""),
  { target: ts.ScriptTarget.ES2020 },
);
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_EXECUTABLE_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox", "--enable-unsafe-swiftshader"],
});
try {
  const page = await browser.newPage();
  await page.setContent('<canvas width="1400" height="1400"></canvas>');
  const data = await page.evaluate(
    helpers +
      "\n" +
      geometry +
      `\n(()=>{
 const c=document.querySelector('canvas'),gl=c.getContext('webgl',{alpha:true,antialias:true,preserveDrawingBuffer:true});
 const program=createProgram(gl,vertex,fragment);gl.useProgram(program);const geo=mesh();
 for(const [name,data] of [['position',geo.positions],['normal',geo.normals]]){const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);const a=gl.getAttribLocation(program,name);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,0,0);}
 gl.enable(gl.DEPTH_TEST);gl.viewport(0,0,c.width,c.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 gl.uniform1f(gl.getUniformLocation(program,'time'),4.5);gl.uniform1f(gl.getUniformLocation(program,'aspect'),1);gl.uniform2f(gl.getUniformLocation(program,'pointer'),.1,-.1);gl.drawArrays(gl.TRIANGLES,0,geo.positions.length/3);return c.toDataURL('image/png');})()`,
  );
  fs.mkdirSync("public/art", { recursive: true });
  const result = await sharp(Buffer.from(data.split(",")[1], "base64"))
    .webp({ quality: 88 })
    .toFile("public/art/synapse-knot.webp");
  console.log(
    `Rendered original sculpture: ${result.width}×${result.height}, ${result.size} bytes.`,
  );
} finally {
  await browser.close();
}
