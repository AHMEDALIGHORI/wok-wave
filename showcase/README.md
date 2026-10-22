# WOK WAVE — Website showcase

`WOK-WAVE-website-showcase-1080p.mp4` is a silent 1920×1080, 30 fps H.264 walkthrough of the local website. It contains branded title cards, all four scroll-driven dish scenes, the photo menu, and a two-screen mobile showcase.

Browser frames were captured in real time with Chrome CDP. Original frame timestamps are preserved before conversion to a constant delivery frame rate. Title cards and short fades were added during editing; this is not a performance benchmark. Supplied signature media and its visible watermarks remain unchanged.

Recreate with the production site running at localhost:3000:

```sh
node scripts/record-showcase.mjs
node scripts/edit-showcase.mjs
```

Raw captures are stored in ignored `qa/video-capture/`. No music, narration or external media was added.
