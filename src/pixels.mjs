export function normalizePixels(input, size) {
  let left = size, top = size, right = -1, bottom = -1;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (input[y * size + x] > 0.08) {
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  const result = new Float32Array(784);
  if (right < left) return result;
  const width = right - left + 1, height = bottom - top + 1;
  const scale = 20 / Math.max(width, height);
  const w = Math.max(1, Math.round(width * scale)), h = Math.max(1, Math.round(height * scale));
  const ox = Math.floor((28 - w) / 2), oy = Math.floor((28 - h) / 2);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const xStart = left + x * width / w, xEnd = left + (x + 1) * width / w;
    const yStart = top + y * height / h, yEnd = top + (y + 1) * height / h;
    let sum = 0;
    for (let sy = Math.floor(yStart); sy < Math.ceil(yEnd); sy++) {
      for (let sx = Math.floor(xStart); sx < Math.ceil(xEnd); sx++) {
        const area = Math.max(0, Math.min(xEnd, sx + 1) - Math.max(xStart, sx))
          * Math.max(0, Math.min(yEnd, sy + 1) - Math.max(yStart, sy));
        sum += input[sy * size + sx] * area;
      }
    }
    result[(y + oy) * 28 + x + ox] = sum / ((xEnd - xStart) * (yEnd - yStart));
  }
  let mass = 0, mx = 0, my = 0;
  result.forEach((v, i) => { mass += v; mx += (i % 28) * v; my += Math.floor(i / 28) * v; });
  if (!mass) return result;
  const shiftX = Math.round(13.5 - mx / mass), shiftY = Math.round(13.5 - my / mass);
  const centered = new Float32Array(784);
  result.forEach((v, i) => {
    const x = i % 28 + shiftX, y = Math.floor(i / 28) + shiftY;
    if (x >= 0 && x < 28 && y >= 0 && y < 28) centered[y * 28 + x] = v;
  });
  return centered;
}

export function similarity(input, reference, distance) {
  let energy = 0;
  for (let i = 0; i < input.length; i++) energy += input[i] ** 2 + reference[i] ** 2;
  return energy ? Math.max(0, 1 - distance / Math.sqrt(energy)) * 100 : 0;
}

export function overlap(input, reference) {
  let shared = 0, inputOnly = 0, referenceOnly = 0;
  for (let i = 0; i < input.length; i++) {
    const a = input[i] > 0.2, b = reference[i] > 0.2;
    if (a && b) shared++;
    else if (a) inputOnly++;
    else if (b) referenceOnly++;
  }
  const union = shared + inputOnly + referenceOnly;
  return { shared, inputOnly, referenceOnly, percent: union ? Math.round(shared / union * 100) : 0 };
}
