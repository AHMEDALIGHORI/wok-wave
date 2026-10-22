export type FrameSet = { count: number; w: number; h: number };
type FrameHandle = { width: number; height: number; close: () => void };

/** Encoded WebPs stay small; decoded bitmaps have a strict sliding-window budget. */
export class FrameStore {
  readonly bitmaps = new Map<number, FrameHandle>();
  private pending = new Set<number>();
  private anchors = new Set<number>();
  private worker: Worker;
  private requests = new Map<number, (bitmap?: FrameHandle) => void>();
  private destroyed = false;
  private cursor = 0;
  private active = 0;
  private queue: number[] = [];
  private windowLoaded = document.readyState === "complete";
  private anchorsReady = false;
  private radius: number;
  readonly maxFrames: number;
  errorCount = 0;

  constructor(
    readonly dish: string,
    readonly folder: "d" | "m",
    readonly set: FrameSet,
    private onFirst: (percent: number) => void,
    private onChange: () => void,
    worker: Worker,
    private onPaint: (index: number, drawMs: number, width: number, height: number) => void,
  ) {
    const budget = (folder === "d" ? 224 : 64) * 1024 * 1024;
    this.maxFrames = Math.floor(budget / (set.w * set.h * 4));
    for (let i = 0; i < set.count; i += 8) this.anchors.add(i);
    this.anchors.add(set.count - 1);
    this.radius = Math.max(
      2,
      Math.min(6, Math.floor((this.maxFrames - this.anchors.size - 2) / 2)),
    );
    this.worker = worker;
    this.worker.postMessage({ type: "reset" });
    this.worker.onmessage = ({ data }) => {
      if (data.type === "progress") this.onFirst(data.percent);
      else if (data.type === "painted") this.onPaint(data.index, data.drawMs, data.width, data.height);
      else {
        this.requests.get(data.id)?.(
          data.type === "bitmap"
            ? {
                width: data.width,
                height: data.height,
                close: () =>
                  this.worker.postMessage({ type: "evict", id: data.id }),
              }
            : undefined,
        );
        this.requests.delete(data.id);
      }
    };
    this.worker.onerror = () => {
      this.errorCount++;
      this.onFirst(-1);
      for (const resolve of this.requests.values()) resolve();
      this.requests.clear();
    };
    window.addEventListener("load", this.onWindowLoad, { once: true });
  }
  private onWindowLoad = () => {
    this.windowLoaded = true;
    if (this.anchorsReady) {
      this.scheduleWindow();
      this.prefetch();
    }
  };
  async start() {
    await this.decode(0, true);
    if (this.destroyed) return;
    await this.decode(this.set.count - 1);
    for (const index of this.anchors)
      if (index !== 0 && index !== this.set.count - 1) await this.decode(index);
    this.anchorsReady = true;
    this.scheduleWindow();
    if (this.windowLoaded) this.prefetch();
  }
  private url(index: number) {
    return `/frames/${this.dish}/${this.folder}/${String(index + 1).padStart(4, "0")}.webp`;
  }
  private prefetch() {
    if (!this.destroyed)
      this.worker.postMessage({
        type: "prefetch",
        urls: Array.from({ length: this.set.count }, (_, i) => this.url(i)),
      });
  }
  private async decode(index: number, first = false) {
    if (this.destroyed || this.bitmaps.has(index) || this.pending.has(index))
      return;
    this.pending.add(index);
    try {
      // Never use resizeWidth/resizeHeight: Chromium can resize on the main thread.
      const bitmap = await new Promise<FrameHandle | undefined>((resolve) => {
        this.requests.set(index, resolve);
        this.worker.postMessage({
          type: "decode",
          id: index,
          url: this.url(index),
          first,
        });
      });
      if (!bitmap) throw new Error("Frame decode failed");
      if (this.destroyed) {
        bitmap.close();
        return;
      }
      this.bitmaps.set(index, bitmap);
      this.evict();
      if (first) this.onFirst(100);
      this.onChange();
    } catch (error) {
      if (!this.destroyed) {
        this.errorCount++;
        if (first) this.onFirst(-1);
      }
    } finally {
      this.pending.delete(index);
    }
  }
  seek(index: number) {
    const rounded = Math.max(
      0,
      Math.min(this.set.count - 1, Math.round(index)),
    );
    if (rounded === this.cursor) return;
    this.cursor = rounded;
    this.evict();
    this.scheduleWindow();
  }
  private scheduleWindow() {
    if (this.destroyed || !this.windowLoaded || !this.anchorsReady) return;
    const wanted = [];
    for (let distance = 0; distance <= this.radius; distance++)
      for (const index of distance
        ? [this.cursor + distance, this.cursor - distance]
        : [this.cursor]) {
        if (
          index >= 0 &&
          index < this.set.count &&
          !this.bitmaps.has(index) &&
          !this.pending.has(index)
        )
          wanted.push(index);
      }
    this.queue = wanted;
    this.pump();
  }
  private pump() {
    while (this.active < 2 && this.queue.length && !this.destroyed) {
      const index = this.queue.shift()!;
      this.active++;
      void this.decode(index).finally(() => {
        this.active--;
        this.pump();
      });
    }
  }
  private evict() {
    for (const [index, bitmap] of this.bitmaps)
      if (
        !this.anchors.has(index) &&
        Math.abs(index - this.cursor) > this.radius
      ) {
        bitmap.close();
        this.bitmaps.delete(index);
      }
  }
  paint(index: number, width: number, height: number, focalX: number) {
    this.worker.postMessage({ type: "paint", index, width, height, focalX });
  }
  nearest(index: number): [number, FrameHandle] | undefined {
    let best: number | undefined;
    let distance = Infinity;
    for (const key of this.bitmaps.keys())
      if (Math.abs(key - index) < distance) {
        best = key;
        distance = Math.abs(key - index);
      }
    return best === undefined ? undefined : [best, this.bitmaps.get(best)!];
  }
  dispose() {
    this.destroyed = true;
    window.removeEventListener("load", this.onWindowLoad);
    for (const resolve of this.requests.values()) resolve();
    this.requests.clear();
    for (const bitmap of this.bitmaps.values()) bitmap.close();
    this.bitmaps.clear();
    this.queue = [];
    this.worker.postMessage({ type: "reset" });
  }
}
