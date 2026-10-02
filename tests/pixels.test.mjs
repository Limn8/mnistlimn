import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizePixels, similarity, overlap } from '../src/pixels.mjs';

test('blank input stays blank', () => {
  const input = new Float32Array(784);
  const result = normalizePixels(input, 28);
  assert.equal(result.some(Boolean), false);
});
test('a translated stroke normalizes to the same center', () => {
  const a = new Float32Array(784);
  const b = new Float32Array(784);
  for (let y = 3; y < 19; y++) { a[y * 28 + 4] = 1; b[(y + 3) * 28 + 12] = 1; }
  assert.deepEqual(normalizePixels(a, 28), normalizePixels(b, 28));
});
test('similarity is perfect for identical ink and zero for disjoint ink', () => {
  assert.equal(similarity([1, 0], [1, 0], 0), 100);
  assert.equal(similarity([1, 0], [0, 1], Math.sqrt(2)), 0);
});
test('pixel overlap identifies shared and unmatched strokes', () => {
  assert.deepEqual(overlap([1, 1, 0], [1, 0, 1]), { shared: 1, inputOnly: 1, referenceOnly: 1, percent: 33 });
});
test('area downsampling retains a thin stroke between sampling points', () => {
  const input = new Float32Array(10000);
  for (let y = 10; y < 90; y++) input[y * 100 + 49] = 1;
  for (let x = 10; x < 90; x++) input[10 * 100 + x] = input[89 * 100 + x] = 1;
  const result = normalizePixels(input, 100);
  assert.ok(result.every(Number.isFinite));
  assert.ok(Array.from(result).filter(v => v > 0.1).length > 40);
});
