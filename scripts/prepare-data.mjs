import { mkdir, writeFile } from 'node:fs/promises';
import { gunzipSync, gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { normalizePixels } from '../src/pixels.mjs';

const origin = 'https://storage.googleapis.com/cvdf-datasets/mnist/';
async function download(name) {
  const response = await fetch(origin + name);
  if (!response.ok) throw new Error(`Download failed: ${name} (${response.status})`);
  const compressed = Buffer.from(await response.arrayBuffer());
  console.log(`${name}: ${compressed.length} bytes`);
  return { bytes: gunzipSync(compressed), sha256: createHash('sha256').update(compressed).digest('hex') };
}
function parse(images, labels, expected) {
  if (images.readUInt32BE(0) !== 2051 || labels.readUInt32BE(0) !== 2049
    || images.readUInt32BE(4) !== expected || labels.readUInt32BE(4) !== expected
    || images.readUInt32BE(8) !== 28 || images.readUInt32BE(12) !== 28
    || images.length !== 16 + expected * 784 || labels.length !== 8 + expected
    || labels.subarray(8).some(label => label > 9)) throw new Error('Invalid MNIST IDX data');
  return { count: expected, images: images.subarray(16), labels: labels.subarray(8) };
}
const names = ['train-images-idx3-ubyte.gz', 'train-labels-idx1-ubyte.gz', 't10k-images-idx3-ubyte.gz', 't10k-labels-idx1-ubyte.gz'];
const sources = await Promise.all(names.map(download));
const train = parse(sources[0].bytes, sources[1].bytes, 60000);
const test = parse(sources[2].bytes, sources[3].bytes, 10000);
const bytes = new Uint8Array(train.count * 785), counts = Array(10).fill(0);
for (let index = 0; index < train.count; index++) {
  const label = train.labels[index]; counts[label]++;
  bytes[index * 785] = label;
  const pixels = Array.from(train.images.subarray(index * 784, (index + 1) * 784), v => v / 255);
  bytes.set(normalizePixels(pixels, 28).map(v => Math.round(v * 255)), index * 785 + 1);
}
const heldOut = [], testCounts = Array(10).fill(0);
for (let index = 0; index < test.count; index++) {
  const label = test.labels[index];
  if (testCounts[label] >= 40) continue;
  testCounts[label]++;
  const pixels = Array.from(test.images.subarray(index * 784, (index + 1) * 784), v => v / 255);
  heldOut.push({ label, pixels: Array.from(normalizePixels(pixels, 28)) });
}
await mkdir('public/data', { recursive: true });
await writeFile('public/data/mnist-full.bin.gz', gzipSync(bytes, { level: 9 }));
await writeFile('public/data/test.json', JSON.stringify(heldOut));
await writeFile('public/data/provenance.json', JSON.stringify({ source: 'https://github.com/cvdfoundation/mnist', samples: train.count, perDigit: counts, testPool: test.count, heldOut: heldOut.length, preprocessing: 'area resampling, 20px bounding box, 28px canvas, center of mass', sources: names.map((name, i) => ({ url: origin + name, sha256: sources[i].sha256 })) }, null, 2));
console.log(`Prepared ${train.count} training examples; counts: ${counts.join(', ')}; held-out: ${heldOut.length}.`);
