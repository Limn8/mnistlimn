import mnist from 'mnist';
import { mkdir, writeFile } from 'node:fs/promises';
import { normalizePixels } from '../src/pixels.mjs';

await mkdir('public/data', { recursive: true });
const bytes = new Uint8Array(3000 * 785);
const heldOut = [];
for (let digit = 0; digit < 10; digit++) {
  const training = mnist[digit].set(0, 299);
  training.forEach((sample, i) => {
    const offset = (digit * 300 + i) * 785;
    bytes[offset] = digit;
    bytes.set(normalizePixels(sample.input, 28).map(v => Math.round(v * 255)), offset + 1);
  });
  heldOut.push(...mnist[digit].set(300, 339).map(sample => ({ label: digit, pixels: Array.from(normalizePixels(sample.input, 28)) })));
}
await writeFile('public/data/mnist.bin', bytes);
await writeFile('public/data/test.json', JSON.stringify(heldOut));
await writeFile('public/data/provenance.json', JSON.stringify({ source: 'https://github.com/cazala/mnist', package: 'mnist@1.1.0', samples: 3000, perDigit: 300, heldOut: 400, preprocessing: '20px bounding box, 28px canvas, center of mass', license: 'MIT (distribution package)' }, null, 2));
console.log('Prepared 3000 MNIST references and 400 disjoint evaluation examples.');
