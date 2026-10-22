// Fetch, decode and draw off the main thread; FrameStore controls the bitmap budget.
const blobs = new Map();
const downloads = new Map();
const bitmaps = new Map();
let canvas, context;
let generation = 0;
let downloadsController = new AbortController();
async function fetchBlob(url, first) {
  if (blobs.has(url)) return blobs.get(url);
  if (downloads.has(url)) return downloads.get(url);
  const work = (async () => {
    const response = await fetch(url, {
      priority: first ? "high" : "low",
      signal: downloadsController.signal,
    });
    if (!response.ok)
      throw new Error(`Frame request failed (${response.status})`);
    let blob;
    if (first && response.body) {
      const total = Number(response.headers.get("content-length"));
      const chunks = [];
      let bytes = 0;
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        bytes += value.byteLength;
        if (total)
          self.postMessage({
            type: "progress",
            percent: Math.min(95, Math.round((bytes / total) * 95)),
          });
      }
      blob = new Blob(chunks, { type: "image/webp" });
    } else blob = await response.blob();
    blobs.set(url, blob);
    return blob;
  })();
  downloads.set(url, work);
  try {
    return await work;
  } finally {
    downloads.delete(url);
  }
}
self.onmessage = async ({ data }) => {
  if (data.type === "canvas") {
    canvas = data.canvas;
    context = canvas.getContext("2d", { alpha: false });
  } else if (data.type === "reset") {
    generation++;
    downloadsController.abort();
    downloadsController = new AbortController();
    for (const bitmap of bitmaps.values()) bitmap.close();
    bitmaps.clear();
    blobs.clear();
    downloads.clear();
  } else if (data.type === "evict") {
    bitmaps.get(data.id)?.close();
    bitmaps.delete(data.id);
  } else if (data.type === "paint") {
    const bitmap = bitmaps.get(data.index);
    if (!bitmap || !context) return;
    const start = performance.now();
    if (canvas.width !== data.width) canvas.width = data.width;
    if (canvas.height !== data.height) canvas.height = data.height;
    const scale = Math.max(
      data.width / bitmap.width,
      data.height / bitmap.height,
    );
    const w = bitmap.width * scale,
      h = bitmap.height * scale;
    context.drawImage(
      bitmap,
      (data.width - w) * data.focalX,
      (data.height - h) / 2,
      w,
      h,
    );
    self.postMessage({
      type: "painted",
      index: data.index,
      drawMs: performance.now() - start,
      width: canvas.width,
      height: canvas.height,
    });
  } else if (data.type === "decode") {
    const currentGeneration = generation;
    try {
      const blob = await fetchBlob(data.url, data.first);
      if (currentGeneration !== generation) return;
      const bitmap = await createImageBitmap(blob);
      if (currentGeneration !== generation) {
        bitmap.close();
        return;
      }
      bitmaps.set(data.id, bitmap);
      self.postMessage({
        type: "bitmap",
        id: data.id,
        width: bitmap.width,
        height: bitmap.height,
      });
    } catch (error) {
      if (currentGeneration === generation)
        self.postMessage({
          type: "error",
          id: data.id,
          message: String(error),
        });
    }
  } else if (data.type === "prefetch") {
    // Encoded bytes, unlike decoded bitmaps, fit comfortably in the payload budget.
    const queue = [...data.urls];
    const currentGeneration = generation;
    const fill = async () => {
      while (queue.length && currentGeneration === generation) {
        try {
          await fetchBlob(queue.shift(), false);
        } catch {}
      }
    };
    await Promise.all([fill(), fill()]);
  }
};
