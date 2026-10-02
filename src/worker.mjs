import { createMatcher } from './matcher.mjs';

let matcher;
async function load() {
 try {
  const response = await fetch('/data/mnist.bin');
  if (!response.ok) throw new Error(`데이터 요청 실패 (${response.status})`);
  matcher = createMatcher(new Uint8Array(await response.arrayBuffer()));
  self.postMessage({ type: 'ready', count: matcher.samples.length });
} catch (error) {
  self.postMessage({ type: 'error', message: error.message });
 }
}
load();
self.onmessage = ({ data }) => {
  if (!matcher) return;
  const started = performance.now();
  if (data.type === 'sample') {
    const index = data.digit * 300 + 240 + Math.floor(Math.random() * 60);
    self.postMessage({ type: 'sample', pixels: matcher.samples[index], digit: data.digit });
  } else if (data.type === 'predict') {
    const result = matcher.predict(data.pixels);
    self.postMessage({ type: 'result', revision: data.revision, pixels: data.pixels, result, elapsed: Math.round(performance.now() - started) });
  }
};
