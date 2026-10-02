import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { createMatcher } from '../src/matcher.mjs';

test('real MNIST data yields all digit classes and exact reference similarity', async () => {
  const bytes = new Uint8Array(gunzipSync(await readFile('public/data/mnist-full.bin.gz')));
  const matcher = createMatcher(bytes);
  assert.equal(matcher.count, 60000);
  const pixels = Array.from(bytes.subarray(1, 785), v => v / 255);
  const result = matcher.predict(pixels);
  assert.equal(result.ranking.length, 10);
  assert.ok(result.ranking.find(r => r.digit === bytes[0]).score > 99.99);
  assert.ok(result.neighbors[0].distance < 0.0001);
  assert.equal(result.ranking.reduce((sum, r) => sum + r.votes, 0), 7);
  const votes = result.ranking.find(r => r.digit === result.prediction).votes;
  assert.equal(votes, Math.max(...result.ranking.map(r => r.votes)));
});
