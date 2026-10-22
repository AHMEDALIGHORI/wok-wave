import { mkdir, writeFile } from "node:fs/promises";
import { site } from "../src/site.config.ts";
const text = [
  ...new Set(
    site.dishes.map((d) => d.chinese).join("") +
      site.menu.map((m) => m.chinese).join("") +
      site.chineseName +
      site.ui.menuChinese +
      site.ui.visitChinese,
  ),
].join("");
const css = await fetch(
  `https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@900&text=${encodeURIComponent(text)}&display=swap`,
  { headers: { "User-Agent": "Mozilla/5.0" } },
).then((r) => {
  if (!r.ok) throw new Error(`Font CSS: ${r.status}`);
  return r.text();
});
const url = css.match(/src:\s*url\(([^)]+)\)/)?.[1];
if (!url) throw new Error("Missing font URL");
const response = await fetch(url);
if (!response.ok) throw new Error(`Font download: ${response.status}`);
await mkdir(new URL("../src/app/fonts/", import.meta.url), { recursive: true });
await writeFile(
  new URL("../src/app/fonts/noto-sc-subset.woff2", import.meta.url),
  Buffer.from(await response.arrayBuffer()),
);
console.log(`Noto Sans SC 900 subset generated: ${text}`);
