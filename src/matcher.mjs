import KNN from 'ml-knn';
import { squaredEuclidean } from 'ml-distance-euclidean';
import { similarity } from './pixels.mjs';

export function createMatcher(bytes) {
  if (!bytes.length || bytes.length % 785) throw new Error('MNIST 데이터 크기가 올바르지 않습니다.');
  const count = bytes.length / 785, samples = [], labels = new Uint8Array(count);
  const indicesByDigit = Array.from({ length: 10 }, () => []);
  for (let index = 0; index < count; index++) {
    const offset = index * 785, label = bytes[offset];
    if (label > 9) throw new Error('MNIST 숫자 라벨이 올바르지 않습니다.');
    labels[index] = label; indicesByDigit[label].push(index);
    samples.push(bytes.subarray(offset + 1, offset + 785));
  }
  if (indicesByDigit.some(indices => !indices.length)) throw new Error('MNIST 숫자 종류가 누락되었습니다.');
  return {
    count, labels,
    sample(digit) {
      const indices = indicesByDigit[digit], index = indices[Math.floor(Math.random() * indices.length)];
      return Array.from(samples[index], v => v / 255);
    },
    predict(pixels) {
      const input = Float32Array.from(pixels, v => v * 255);
      const nearest = [], bestByDigit = Array(10).fill(undefined);
      for (let index = 0; index < count; index++) {
        const digit = labels[index], distanceSquared = squaredEuclidean(input, samples[index]);
        const candidate = { index, digit, distanceSquared };
        if (!bestByDigit[digit] || distanceSquared < bestByDigit[digit].distanceSquared) bestByDigit[digit] = candidate;
        if (nearest.length < 7 || distanceSquared < nearest[6].distanceSquared) {
          const position = nearest.findIndex(n => distanceSquared < n.distanceSquared);
          nearest.splice(position < 0 ? nearest.length : position, 0, candidate);
          if (nearest.length > 7) nearest.pop();
        }
      }
      const votes = Array(10).fill(0);
      nearest.forEach(n => votes[n.digit]++);
      const score = n => similarity(input, samples[n.index], Math.sqrt(n.distanceSquared));
      const ranking = bestByDigit.map(n => ({ digit: n.digit, score: score(n), votes: votes[n.digit], index: n.index })).sort((a, b) => b.score - a.score);
      const classifier = new KNN(nearest.map(n => Array.from(samples[n.index])), nearest.map(n => n.digit), { k: 7 });
      return {
        prediction: classifier.predict(Array.from(input)), ranking, count,
        neighbors: nearest.slice(0, 6).map(n => ({ index: n.index, digit: n.digit, distance: Math.sqrt(n.distanceSquared) / 255, score: score(n), pixels: Array.from(samples[n.index], v => v / 255) })),
      };
    },
  };
}
