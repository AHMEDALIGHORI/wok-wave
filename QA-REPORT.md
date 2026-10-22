# Final QA report

Final functional verification on 22 October 2026 against the local production build at http://localhost:3000. Benchmark timestamps are retained in the individual JSON reports.

## Delivered

The complete four-dish website, responsive navigation, ingredient callouts, fourteen-item filterable menu, visit section, footer, reduced-motion presentation, SEO metadata, Restaurant structured data, configurable content, generated frame sets, extraction scripts and rebranding instructions are included. Original supplied assets are preserved.

`npm run build` and `npm run typecheck` passed. The final functional run passed all 12 checks and all 24 dish/viewport/scroll-position checks, with no console errors, frame errors or horizontal overflow. The checks and screenshots are reproducible with `npm run qa`; detailed results are in `qa/functional-report.json` and `qa/screenshots/`. Checks cover frame endpoints, keyboard-operated category tabs, mobile dialog dismissal, 360px layout, reduced-motion network behavior and fourteen structured menu entries. Additional screenshots cover three positions in each inter-dish handoff, menu, visit and footer; representative final desktop/mobile screenshots were visually inspected.

All six additional lifecycle checks passed: DPR capped at 2 on a DPR-3 device, returning after far-offscreen cache disposal, desktop-to-mobile and mobile-to-desktop resize, enabling reduced motion, and re-enabling the transferable canvas. See `qa/lifecycle-report.json`.

The final revision moves bitmap decoding and canvas drawing into a worker, batches Lenis before Motion's geometry reads, reuses section geometry for handoffs, blends prepainted backdrop layers, and avoids redundant React updates. Source frame rates and dimensions remain unchanged. All configuration fields are documented; headline composition, poster metadata and ingredient scaling now follow configurable dish data. Desktop information stickers and repositioned mobile hints improve readability over busy footage.

## Mobile Lighthouse

### Menu photography update — 22 October 2026

Ten new dish photographs were generated with the built-in image generation tool, visually reviewed and added to the existing four signature posters. All fourteen menu cards now have distinct images. The new 960-pixel WebP assets total 565.6 KiB and use lazy loading and asynchronous decoding. PNG originals and exact prompts are retained in `assets-src/menu/`.

The production build and type check pass. `node scripts/menu-images-qa.mjs` verifies all fourteen images load with distinct URLs and alt text, all six category tabs work, and no page errors or horizontal overflow occur at 1440×900 and 390×844. Desktop/mobile crops were visually inspected. Results are in `qa/menu-images-report.json`; screenshots end in `menu-photography.png`.

Direct `#menu` navigation exposed an existing preloader issue when the distant hero's download was disposed. The loader now releases when its hero is above the viewport, allowing the linked section to be used. The image audit covers direct menu entry; the full `npm run qa` suite was rerun and all 24 scene checks and 12 functional checks passed.

The Lighthouse and CPU benchmarks below predate this photography update and were not rerun for it.

### Prior performance snapshot

Final isolated local production audit:

| Metric | Result |
| --- | ---: |
| Performance | 93 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| Largest contentful paint | 3.2 seconds |
| Total blocking time | 40 milliseconds |
| Cumulative layout shift | 0 |

The requested 85+ mobile performance target was met in this run. The hero poster is the measured LCP element. The interactive menu now mounts as it approaches the viewport, cutting startup hydration work; its full structured data remains server-rendered. The raw audit is `qa/lighthouse-mobile.json`. Scores vary by machine, network and deployment; these are lab results, not a guarantee for every device.

## Outstanding performance limitation

The stricter sustained 60 fps target under 4× CPU throttling remains **unmet**. Results varied substantially: an earlier optimized run measured 51.3/45.2 fps desktop/mobile, while the final fresh-browser-per-viewport run measured **28.9/26.4 fps** with 83.3/83.4 ms p95 frame intervals. These measurements do not establish a reliable performance improvement under 4× throttling. Worker canvas drawing p95 was 0.2 ms, the maximum decoded cache was 25 frames, and neither final run recorded frame errors or horizontal overflow. See `qa/checkpoint-a.json`; run `npm run benchmark` to reproduce the eight-second continuous-scroll method. The command explicitly reports a failed performance gate when it misses the target.

A separate 2× CPU run measured **59.6 fps desktop and 59.9 fps mobile**, with 16.8 ms p95 intervals. See `qa/checkpoint-2x.json`. This is approximately the 60 Hz display cadence, but it does not establish a 4× pass. The original brief did not name a throttle factor; the stricter 4× test was introduced during implementation and remains explicitly reported. No overall 100% compliance claim is made.

## Accepted asset differences

The owner explicitly authorized keeping the supplied footage unchanged. Videos are eight seconds at 24 fps and 1344×768, rather than exact 16:9 or 1080p. Generated delivery frames retain source proportions. Visible generated-video watermarks occur in the noodles, duck and chicken footage; the chicken has a horizon line, and backdrops vary or vignette. No watermark removal, source recoloring or source-video editing was performed. Responsive cover fitting can crop the displayed composition.

All four desktop frame sets fit the 9 MB per-dish payload limit at quality 78 and 16 fps; mobile sets use 12 fps. Exact sizes are in `public/frames/payload-report.json` and README.md.

## Handoff

This is a local, ready-to-customize template. Business details, ordering links and reservation links are sample data in `src/site.config.ts`. No production hosting deployment or real ordering backend is included. Follow README.md for setup, asset replacement and Vercel deployment; consult LICENSE-NOTE.md before distributing the supplied media.
