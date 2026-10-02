import KNN from 'ml-knn';
import { squaredEuclidean } from 'ml-distance-euclidean';
import { pixelAgreement, INK_THRESHOLD } from './pixels.mjs';

export const hammingDistance = (a, b) => squaredEuclidean(a, b);

export function createMatcher(bytes) {
  if (!bytes.length || bytes.length % 785) throw new Error('MNIST 데이터 크기가 올바르지 않습니다.');
  const count = bytes.length / 785, samples = [], labels = new Uint8Array(count);
  const binaryData = new Uint8Array(count * 784), binarySamples = [];
  const indicesByDigit = Array.from({ length: 10 }, () => []);
  for (let index = 0; index < count; index++) {
    const offset = index * 785, label = bytes[offset];
    if (label > 9) throw new Error('MNIST 숫자 라벨이 올바르지 않습니다.');
    labels[index] = label; indicesByDigit[label].push(index);
    samples.push(bytes.subarray(offset + 1, offset + 785));
    const binary = binaryData.subarray(index * 784, (index + 1) * 784);
    for (let pixel = 0; pixel < 784; pixel++) binary[pixel] = samples[index][pixel] / 255 > INK_THRESHOLD ? 1 : 0;
    binarySamples.push(binary);
  }
  if (indicesByDigit.some(indices => !indices.length)) throw new Error('MNIST 숫자 종류가 누락되었습니다.');
  return {
    count, labels,
    sample(digit) {
      const indices = indicesByDigit[digit], index = indices[Math.floor(Math.random() * indices.length)];
      return Array.from(samples[index], v => v / 255);
    },
    predict(pixels) {
      const input = Uint8Array.from(pixels, v => v > INK_THRESHOLD ? 1 : 0);
      const nearest = [], bestByDigit = Array(10).fill(undefined);
      for (let index = 0; index < count; index++) {
        const digit = labels[index], distance = hammingDistance(input, binarySamples[index]);
        const candidate = { index, digit, distance };
        if (!bestByDigit[digit] || distance < bestByDigit[digit].distance) bestByDigit[digit] = candidate;
        if (nearest.length < 7 || distance < nearest[6].distance) {
          const position = nearest.findIndex(n => distance < n.distance);
          nearest.splice(position < 0 ? nearest.length : position, 0, candidate);
          if (nearest.length > 7) nearest.pop();
        }
      }
      const votes = Array(10).fill(0);
      nearest.forEach(n => votes[n.digit]++);
      const score = n => pixelAgreement(n.distance);
      const ranking = bestByDigit.map(n => ({ digit: n.digit, distance: n.distance, score: score(n), votes: votes[n.digit], index: n.index })).sort((a, b) => b.score - a.score);
      const classifier = new KNN(nearest.map(n => Array.from(binarySamples[n.index])), nearest.map(n => n.digit), { k: 7, distance: hammingDistance });
      return {
        prediction: classifier.predict(Array.from(input)), ranking, count,
        neighbors: nearest.slice(0, 6).map(n => ({ index: n.index, digit: n.digit, distance: n.distance, score: score(n), pixels: Array.from(samples[n.index], v => v / 255) })),
      };
    },
  };
}
