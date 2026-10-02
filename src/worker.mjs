import { createMatcher } from './matcher.mjs';

let matcher;
async function load() {
 try {
  const response = await fetch('/data/mnist-full.bin.gz');
  if (!response.ok) throw new Error(`데이터 요청 실패 (${response.status})`);
  const downloaded = new Uint8Array(await response.arrayBuffer());
  const compressed = downloaded[0] === 0x1f && downloaded[1] === 0x8b;
  const bytes = compressed
    ? new Uint8Array(await new Response(new Blob([downloaded]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer())
    : downloaded;
  matcher = createMatcher(bytes);
  self.postMessage({ type: 'ready', count: matcher.count });
} catch (error) {
  self.postMessage({ type: 'error', message: error.message });
 }
}
load();
self.onmessage = ({ data }) => {
  if (!matcher) return;
  const started = performance.now();
  if (data.type === 'sample') {
    self.postMessage({ type: 'sample', pixels: matcher.sample(data.digit), digit: data.digit });
  } else if (data.type === 'predict') {
    const result = matcher.predict(data.pixels);
    self.postMessage({ type: 'result', revision: data.revision, pixels: data.pixels, result, elapsed: Math.round(performance.now() - started) });
  }
};
