import fs from "node:fs";
import { execFileSync } from "node:child_process";
const dirs = execFileSync("npm", ["ls", "--omit=dev", "--all", "--parseable"], {
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .filter((dir) => dir.includes("node_modules/"));
const records = [];
for (const dir of [...new Set(dirs)]) {
  const p = JSON.parse(fs.readFileSync(dir + "/package.json", "utf8"));
  const files = fs
    .readdirSync(dir)
    .filter(
      (f) =>
        /^(licen[cs]e|notice|copying)(\.|$)/i.test(f) &&
        fs.statSync(dir + "/" + f).isFile(),
    );
  if (files.length)
    records.push({
      name: p.name,
      version: p.version,
      license: p.license ?? "See retained notice",
      files: files.map((name) => ({
        name,
        text: fs.readFileSync(dir + "/" + name, "utf8"),
      })),
    });
}
const text = [
  "SYNDROME — third-party software notices",
  "Production dependency notices retained from the installed npm distributions. This is a conservative superset; not every listed dependency is sent to the visitor. It does not license original project work or third-party assets. Offline Stim/PyMatching packages retain their own distribution notices.",
  ...records
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      (r) =>
        `\n${"=".repeat(72)}\n${r.name} ${r.version} (${typeof r.license === "string" ? r.license : JSON.stringify(r.license)})\n${r.files.map((f) => `\n--- ${f.name} ---\n${f.text}`).join("\n")}`,
    ),
].join("\n");
fs.writeFileSync("public/THIRD-PARTY-NOTICES.txt", text);
console.log(
  `Retained notices for ${records.length} production packages (${Buffer.byteLength(text)} bytes), outside the critical rendering path.`,
);
