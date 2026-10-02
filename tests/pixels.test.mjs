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
