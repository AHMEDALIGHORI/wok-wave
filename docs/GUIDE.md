# WOK WAVE — Technical guide

[← Back to the animated README](../README.md)

A Next.js App Router restaurant template with four scroll-driven canvas sequences, a configurable menu, and a bold street-food visual identity. All restaurant content lives in `src/site.config.ts`.

## Run locally

Use Node.js 24 or newer (the asset scripts use native TypeScript stripping).

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For a production preview:

```sh
npm run build
npm run start
```

The supplied frame sequences and subset font are already generated. You do not need to regenerate them to run the site. Next's Google font build step needs internet access on a clean build.

## Rebrand in one file

Edit `src/site.config.ts`:

- `name`, `chineseName`, `tagline`, `description`, and `ui`: wordmark, editorial copy, labels and accessibility text.
- `colors`: brand palette, passed to the entire application as CSS custom properties. Tailwind v4 tokens are in the CSS `@theme`; there is no Tailwind JavaScript config.
- `currency`, `locale`, `menu[].price`, and `dishes[].price`: prices and formatting.
- `orderUrl`: your ordering provider or a WhatsApp deep link, for example `https://wa.me/15551234567?text=Hello%20I%27d%20like%20to%20order`.
- `bookingUrl`, `instagramUrl`, `mapUrl`, `address`, `hours`, `openingHours`: visit information and external actions.
- `url`: the real production origin. Metadata, the social poster and Restaurant JSON-LD use this value.
- `menu`: the 14 starter items, category membership, heat levels and vegetarian flags. The sample Mapo Tofu is deliberately a vegetarian mushroom version.
- `dishes`: source videos, headlines, prices, portion labels, frame-edge colours and ingredient anchors. `headlineLayout` selects the composition independently of the dish ID; `displaySize` and `mobileDisplaySize` set its type sizes.

The address, currency, prices, order/reservation links and social URL are **sample template data**. The footer identifies the demo. Replace them and the copyright line before publishing a real business. Ordering and booking are external links, not an invented checkout or reservation backend.

After changing Chinese copy, run `npm run fonts`. This requests only the characters used by the config from Google Fonts using `text=`, then hosts Noto Sans SC 900 with `next/font/local` and `preload: false`. Bricolage Grotesque, DM Sans and Caveat Brush use `next/font/google`.

## Replace or add a dish

### Menu-card photography

Every `menu` entry has an editable `image` URL. The four signature cards use their existing sequence posters. Ten other dishes use generated food photographs from `public/menu/`, with 1536×1024 PNG originals in `assets-src/menu/`. The exact prompts and generator are recorded in `assets-src/menu/generation-prompts.json`.

Replace an original PNG and run `node scripts/optimize-menu-images.mjs` to generate a 960-pixel-wide WebP at quality 82. Images load lazily with asynchronous decoding. The `hero` flag controls the signature badge independently of the image URL.

### Signature sequence assets

1. Put your video in `assets-src/videos/<dish-id>.mp4`.
2. Add or update a `dishes` entry in the config. Its `video` path is relative to this project root. The `id` is also its anchor and output directory.
3. Run `npm run frames`. Both the Windows-compatible npm entry point and `scripts/extract-frames.sh` invoke the same ffmpeg pipeline.
4. Copy the sampled `backdropStart` and `backdropEnd` values from `public/frames/payload-report.json` to the dish's config. These are independent of its nominal brand `color`.
5. Place callouts against the generated **exploded** poster, then run the screenshot QA.
6. Run `npm run fonts` if the dish introduces new Chinese characters.

```sh
npm run frames                        # every dish in the config
npm run frames -- xiaolongbao          # one dish, preserving other manifest entries
npm run frames -- --masks-only         # regenerate masks without re-encoding frames
sh scripts/extract-frames.sh           # POSIX entry point
```

`ffmpeg-static` supplies the local executable. Set `FFMPEG_PATH` to use a system build instead. The script copies first/last extracted frames into `public/posters/`; the original supplied stills are preserved in `assets/` and never substituted for matching sequence posters.

### Generated assets

| Directory | Purpose |
| --- | --- |
| `public/frames/<id>/d/0001.webp` | 16 fps, width 1920, desktop sequence |
| `public/frames/<id>/m/0001.webp` | 12 fps, width 960, mobile sequence |
| `public/frames/manifest.json` | Actual count, width and height for each set |
| `public/frames/payload-report.json` | Bytes, quality, fps and sampled backdrop colours |
| `public/posters/<id>.webp` | Exact desktop first frame |
| `public/posters/<id>-exploded.webp` | Exact desktop last frame |
| `public/posters/<id>-mobile.webp` | Exact mobile first frame |
| `public/posters/<id>-exploded-mobile.webp` | Exact mobile last frame |
| `public/masks/<id>-first.png` / `-last.png` | Small inverse alpha masks for ghost typography |

The pipeline starts at WebP quality 78 and reduces quality in steps of six only if desktop payload exceeds 9,000,000 bytes. It never silently lowers frame rate. All four supplied dishes fit at the initial settings:

| Dish | Desktop | Mobile | Frames (D / M) |
| --- | ---: | ---: | ---: |
| Xiaolongbao | 5.387 MB | 1.672 MB | 128 / 96 |
| Dan Dan Noodles | 4.505 MB | 1.499 MB | 128 / 96 |
| Peking Duck Bao | 6.634 MB | 2.171 MB | 128 / 96 |
| Kung Pao Chicken | 5.868 MB | 1.931 MB | 128 / 96 |

Sizes are decimal MB and exclude the small posters/masks. These are alternative device sets, not both downloaded by every visitor.

## Scroll engine

`ScrubCanvas` uses a canvas and decoded image bitmaps. It does **not** seek video playback.

- Each section is 400vh with a sticky 100dvh stage.
- Motion `useScroll({target, offset: ['start start', 'end end']})` supplies progress.
- The first frame holds from 0–0.06 and the last from 0.94–1. Between those holds, smoothstep maps progress to the sequence.
- A `current += (target - current) * 0.14` interpolation runs on Motion's shared requestAnimationFrame clock. The same callback drives Lenis, with `autoRaf: false`. There is no extra spring smoothing on scrub progress.
- A Web Worker fetches and calls `createImageBitmap` without resize options, retains the bitmaps and draws through `OffscreenCanvas`. The main thread sends changed frame commands from Motion's shared RAF; there is no second animation loop. Loading order is first, last, every eighth frame, then playhead gaps. Only anchors load before the window load event. Encoded gap frames are prefetched afterward. This requires a modern browser with worker-based OffscreenCanvas support.
- The closest decoded frame is always drawn while gaps are loading. The first/last/sparse anchors remain decoded; other decoded bitmaps are restricted to a small playhead window.
- Per-section decoded budgets are 224 MiB desktop and 64 MiB mobile; the actual frame count cap derives from decoded pixel dimensions. `ImageBitmap.close()` frees evicted frames. Sections more than three viewports away clear their bitmap/blob stores and abort outstanding downloads. Their idle drawing worker remains attached to the transferable canvas until unmount; returning creates a fresh cache.
- Other dish UIs mount within two viewports, with stable-height placeholders. Below-fold content uses browser rendering containment.
- The interactive menu mounts within one viewport, avoiding the cost of hydrating fourteen offscreen cards during first paint. Its full data is also present in the server-rendered Restaurant JSON-LD.
- Canvas resolution follows the rendered rectangle, caps DPR at 2, uses cover fitting and responds to resize. `focalX` controls the mobile crop.
- The last 100vh of each section is the handoff: fade out during its first 40%, fade the next stage in during its last 40%, counter-translating the stages so their edges do not slide. Two fixed, prepainted backdrop layers blend the sampled colours by opacity, avoiding a full-screen background-colour repaint on every frame.
- Reduced motion removes pinning, scrubbing, marquees and cursor motion. A media-aware `<picture>` chooses the exploded poster before hydration; ingredient labels remain visible and no sequence frames are requested.

The frame files are 16/12 fps source samples. A 60 Hz render loop is a separate metric; it does not invent extra food frames.

## Callout placement

Open `public/posters/<id>-exploded.webp` at its full dimensions. `targetX`/`targetY` are percentages of that source image; `x`/`y` are the label's desktop-stage percentages. Keep labels outside the food silhouette. The line conversion accounts for cover cropping and the stage's reserved top space. The `at` value is a 0–1 appearance threshold, normally 0.66–0.88. Labels use Motion springs.

On mobile, leaders disappear and labels form a compact list below the image. The crop and label spacing must be checked whenever source composition changes. The first/last chroma masks are approximate with non-flat footage; they affect decorative Chinese ghosts, not the legibility of the main headings.

## Suggested Flow asset workflow

The original brief recommends an assembled still and an exploded still, then Frames-to-Video using **Omni 1.1 Flash**, 8 seconds, 16:9, followed by a 1080p upscale. Treat model names as the brief's recommendation; availability depends on the provider.

Keep camera, light and backdrop fixed. Use a narrow central stack, ample left/right negative space, and no text or logos. Export clean footage so all branding remains HTML/CSS. Compare the first and last frames before extraction; do not stretch a non-16:9 source to force a target ratio.

## QA and audits

Run a production server in one terminal, then:

```sh
npm run typecheck
npm run qa
node scripts/lifecycle-qa.mjs
npm run benchmark
node scripts/checkpoint-a.mjs 2
npm run audit:mobile
```

- `qa/screenshots/`: all four sections at 0, 0.5 and 1 on 1440×900 and 390×844, handoffs, menu, visit, footer, 360px width, mobile navigation and reduced motion.
- `qa/functional-report.json`: frame endpoints, overflow, keyboard tabs, dialog dismissal, reduced-motion loading and JSON-LD checks.
- `qa/checkpoint-a.json`: production Chrome, 4× CPU throttling, eight-second continuous scroll. Includes actual RAF timing, bitmap counts, draw timing and errors.
- The benchmark exits nonzero when the 60 Hz performance gate fails (mean below 59 fps or p95 interval above 20 ms); that tolerance covers timer rounding, not a reduced frame-rate target.
- `qa/checkpoint-2x.json`: the same method at 2× CPU throttling; the factors are reported separately.
- `qa/lifecycle-report.json`: breakpoint resizing, far-offscreen cache recreation, DPR cap and live reduced-motion changes.
- `qa/lighthouse-mobile.json`: mobile Lighthouse results.
- `QA-REPORT.md`: final human-readable findings and explicit limits.

Run performance tools **one at a time**. Background browser tests and builds compete for CPU and distort results. Do not present a single local lab result as a guarantee for every phone. Test real hardware and the deployed origin too.

## Deploy to Vercel

1. Push this project, including `public/frames`, `public/posters`, `public/masks` and the generated font, to your repository.
2. Import it into Vercel as a Next.js project; choose Node.js 24.
3. Use `npm run build` and the default Next.js output settings. No environment variables are required.
4. Set the real origin and business links in the config before the production deployment.

No hosting account was connected or deployment performed as part of this local build. Do not run extraction during every Vercel build; generate and verify media before deployment. The source videos need not be served to visitors.

## Source-asset exceptions accepted by the owner

The supplied MP4s are eight-second, 24 fps, **1344×768** files, not 1920×1080 or exact 16:9. The extraction preserves their proportions (1920×1098 desktop and 960×548 mobile); upscaling does not add source detail. Dan Dan, duck bao and kung pao have visible generated-video watermarks in at least some frames. Kung pao has a visible horizon line. Backdrops vignette and change over time. The owner explicitly chose to keep this footage unchanged and document these differences. No watermark removal, recolouring or source-video editing was performed.

## Project map

```text
assets/                 Original user-supplied stills and videos
assets-src/videos/      Named input videos for the repeatable pipeline
src/site.config.ts      All editable restaurant data
src/app/                App Router, fonts, metadata, global styles
src/components/         Scrub engine, navigation, menu, visit and footer
src/lib/                Bitmap lifecycle and motion-preference hydration
public/                 Generated delivery assets and decoding worker
scripts/                Extraction, font subsetting and reproducible QA
qa/                     Measurements, reports and screenshots
```

See the [license note](../LICENSE-NOTE.md) before distributing this template or its media.
