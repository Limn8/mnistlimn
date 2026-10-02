import KNN from 'ml-knn';
import { euclidean } from 'ml-distance-euclidean';
import { similarity } from './pixels.mjs';

export function createMatcher(bytes) {
  if (bytes.length !== 3000 * 785) throw new Error('MNIST 데이터 크기가 올바르지 않습니다.');
  const samples = [], labels = [];
  for (let offset = 0; offset < bytes.length; offset += 785) {
    labels.push(bytes[offset]);
    samples.push(Array.from(bytes.subarray(offset + 1, offset + 785), v => v / 255));
  }
  const classifier = new KNN(samples, labels, { k: 7, distance: euclidean });
  return {
    samples, labels,
    predict(pixels) {
      const nearest = samples.map((sample, index) => {
        const distance = euclidean(pixels, sample);
        return { index, digit: labels[index], distance, score: similarity(pixels, sample, distance) };
      }).sort((a, b) => a.distance - b.distance);
      const votes = Array(10).fill(0);
      nearest.slice(0, 7).forEach(n => votes[n.digit]++);
      const ranking = Array.from({ length: 10 }, (_, digit) => {
        const best = nearest.find(n => n.digit === digit);
        return { digit, score: best.score, votes: votes[digit], index: best.index };
      }).sort((a, b) => b.score - a.score);
      return { prediction: classifier.predict(Array.from(pixels)), ranking, neighbors: nearest.slice(0, 6).map(n => ({ ...n, pixels: samples[n.index] })) };
    },
  };
}
