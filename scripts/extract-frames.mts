import {
  mkdir,
  readdir,
  stat,
  copyFile,
  writeFile,
  readFile,
  rm,
} from "node:fs/promises";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";
import ffmpegStatic from "ffmpeg-static";
import sharp from "sharp";
import { site } from "../src/site.config.ts";

const root = resolve(import.meta.dirname, "..");
const ffmpeg = process.env.FFMPEG_PATH || ffmpegStatic;
if (!ffmpeg) throw new Error("Install ffmpeg or set FFMPEG_PATH.");
const run = (args: string[]) => {
  const result = spawnSync(
    ffmpeg,
    ["-hide_banner", "-loglevel", "error", "-y", ...args],
    { encoding: "utf8" },
  );
  if (result.status !== 0)
    throw new Error(result.stderr || `ffmpeg exited ${result.status}`);
};
const output = join(root, "public", "frames");
const posters = join(root, "public", "posters");
const masks = join(root, "public", "masks");
await Promise.all([
  mkdir(output, { recursive: true }),
  mkdir(posters, { recursive: true }),
  mkdir(masks, { recursive: true }),
]);
const manifest: Record<string, unknown> = {};
const report: Record<string, unknown> = {};
const masksOnly = process.argv.includes("--masks-only");
const requested = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
// A partial run preserves other dishes' existing manifest entries.
try {
  Object.assign(
    manifest,
    JSON.parse(await readFile(join(output, "manifest.json"), "utf8")),
  );
} catch {}
try {
  Object.assign(
    report,
    JSON.parse(await readFile(join(output, "payload-report.json"), "utf8")),
  );
} catch {}
for (const dish of site.dishes.filter(
  (d) => !requested.length || requested.includes(d.id),
)) {
  const sets: Record<string, unknown> = masksOnly
    ? (manifest[dish.id] as Record<string, unknown>)
    : {};
  const sizes: Record<string, unknown> = masksOnly
    ? (report[dish.id] as Record<string, unknown>)
    : {};
  if (!masksOnly)
    for (const [name, folder, fps, width] of [
      ["desktop", "d", 16, 1920],
      ["mobile", "m", 12, 960],
    ] as const) {
      const dir = join(output, dish.id, folder);
      await mkdir(dir, { recursive: true });
      let quality = 78;
      let files: string[] = [];
      let bytes = 0;
      do {
        // Only remove generated numeric WebP frames from this dish's exact output directory.
        for (const file of await readdir(dir))
          if (/^\d{4}\.webp$/.test(file)) await rm(join(dir, file));
        run([
          "-i",
          resolve(root, dish.video),
          "-an",
          "-vf",
          `fps=${fps},scale=${width}:-2:flags=lanczos`,
          "-c:v",
          "libwebp",
          "-quality",
          String(quality),
          "-compression_level",
          "4",
          join(dir, "%04d.webp"),
        ]);
        files = (await readdir(dir))
          .filter((f) => /^\d{4}\.webp$/.test(f))
          .sort();
        bytes = (
          await Promise.all(files.map((f) => stat(join(dir, f))))
        ).reduce((sum, f) => sum + f.size, 0);
        if (name === "desktop" && bytes > 9_000_000) {
          console.log(
            `${dish.id}: q${quality} is ${(bytes / 1e6).toFixed(2)} MB; reducing quality by 6, preserving ${fps}fps.`,
          );
          quality -= 6;
          if (quality < 24)
            throw new Error(
              `${dish.id}: payload cannot fit budget; review footage instead of silently reducing fps.`,
            );
        } else break;
      } while (true);
      const meta = await sharp(join(dir, files[0])).metadata();
      sets[name] = { count: files.length, w: meta.width, h: meta.height };
      sizes[name] = {
        bytes,
        mb: Number((bytes / 1e6).toFixed(3)),
        fps,
        quality,
      };
      const suffix = name === "mobile" ? "-mobile" : "";
      await copyFile(
        join(dir, files[0]),
        join(posters, `${dish.id}${suffix}.webp`),
      );
      await copyFile(
        join(dir, files.at(-1)!),
        join(posters, `${dish.id}-exploded${suffix}.webp`),
      );
      console.log(
        `${dish.id} ${name}: ${files.length} frames, ${meta.width}×${meta.height}, q${quality}, ${(bytes / 1e6).toFixed(3)} MB`,
      );
    }
  // Sample background pixels from both left/right edges, away from the vignette's corners.
  const edge = async (file: string) => {
    const { data, info } = await sharp(file)
      .resize(200)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const channels = [[], [], []] as number[][];
    for (let y = Math.floor(info.height * 0.2); y < info.height * 0.8; y++)
      for (const x of [1, 2, info.width - 3, info.width - 2]) {
        for (let c = 0; c < 3; c++)
          channels[c].push(data[(y * info.width + x) * info.channels + c]);
      }
    return (
      "#" +
      channels
        .map((a) =>
          a
            .sort((a, b) => a - b)
            [Math.floor(a.length / 2)].toString(16)
            .padStart(2, "0"),
        )
        .join("")
    );
  };
  const start = await edge(join(posters, `${dish.id}.webp`));
  const end = await edge(join(posters, `${dish.id}-exploded.webp`));
  sizes.backdropStart = start;
  sizes.backdropEnd = end;
  // Chroma key + a morphological close. CSS uses the inverse to keep typography behind food.
  for (const [phase, color] of [
    ["first", start],
    ["last", end],
  ]) {
    const source = join(
      posters,
      `${dish.id}${phase === "last" ? "-exploded" : ""}.webp`,
    );
    const temp = join(masks, `${dish.id}-${phase}-key.png`);
    run([
      "-i",
      source,
      "-vf",
      `scale=640:-2,format=yuva444p,chromakey=0x${color.slice(1)}:0.045:0.015,format=yuva444p,alphaextract,dilation,erosion`,
      "-frames:v",
      "1",
      temp,
    ]);
    const { data, info } = await sharp(temp)
      .removeAlpha()
      .greyscale()
      .threshold(90)
      .raw()
      .toBuffer({ resolveWithObject: true });
    const rgba = Buffer.alloc(info.width * info.height * 4);
    for (let i = 0; i < data.length; i++) {
      rgba[i * 4] = 255;
      rgba[i * 4 + 1] = 255;
      rgba[i * 4 + 2] = 255;
      rgba[i * 4 + 3] = 255 - data[i];
    }
    await sharp(rgba, {
      raw: { width: info.width, height: info.height, channels: 4 },
    })
      .png()
      .toFile(join(masks, `${dish.id}-${phase}.png`));
    await rm(temp);
  }
  manifest[dish.id] = sets;
  report[dish.id] = sizes;
  await writeFile(
    join(output, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  await writeFile(
    join(output, "payload-report.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
}
console.log(
  "Done. Frame manifest, payload report, matching posters and inverse masks written to public/.",
);
