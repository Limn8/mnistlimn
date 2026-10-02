import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createMatcher } from '../src/matcher.mjs';

test('real MNIST data yields all digit classes and exact reference similarity', async () => {
  const bytes = new Uint8Array(await readFile('public/data/mnist.bin'));
  const matcher = createMatcher(bytes);
  const result = matcher.predict(matcher.samples[1500]);
  assert.equal(result.ranking.length, 10);
  assert.equal(result.ranking.find(r => r.digit === 5).score, 100);
  assert.equal(result.neighbors[0].distance, 0);
  assert.equal(result.ranking.reduce((sum, r) => sum + r.votes, 0), 7);
  const votes = result.ranking.find(r => r.digit === result.prediction).votes;
  assert.equal(votes, Math.max(...result.ranking.map(r => r.votes)));
});
