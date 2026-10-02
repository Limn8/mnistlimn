import { readFile, writeFile } from 'node:fs/promises';
import { createMatcher } from '../src/matcher.mjs';

const matcher = createMatcher(new Uint8Array(await readFile('public/data/mnist.bin')));
const examples = JSON.parse(await readFile('public/data/test.json', 'utf8'));
const confusion = Array.from({ length: 10 }, () => Array(10).fill(0));
let correct = 0, voteConsistency = true;
const started = performance.now();
for (const example of examples) {
  const result = matcher.predict(example.pixels);
  confusion[example.label][result.prediction]++;
  if (result.prediction === example.label) correct++;
  const predictionVotes = result.ranking.find(r => r.digit === result.prediction).votes;
  if (predictionVotes !== Math.max(...result.ranking.map(r => r.votes))) voteConsistency = false;
}
const report = { count: examples.length, correct, accuracy: correct / examples.length, meanMs: (performance.now() - started) / examples.length, voteConsistency, confusion };
await writeFile('public/data/evaluation.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
if (report.accuracy < 0.85 || !voteConsistency) process.exitCode = 1;
