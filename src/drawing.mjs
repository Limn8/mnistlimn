import { normalizePixels } from './pixels.mjs';

export function createDrawing(canvas, onChange) {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const undo = document.querySelector('#undo'), redo = document.querySelector('#redo');
  const history = [], future = [];
  let drawing = false, previous, snapshot, width = 18;
  const reset = () => { context.fillStyle = '#ffffff'; context.fillRect(0, 0, 336, 336); };
  reset();
  const emit = () => {
    const raw = context.getImageData(0, 0, 336, 336).data;
    const pixels = new Float32Array(336 * 336);
    for (let i = 0; i < pixels.length; i++) pixels[i] = 1 - raw[i * 4] / 255;
    undo.disabled = history.length === 0; redo.disabled = future.length === 0;
    document.querySelector('#canvas-hint').style.display = pixels.some(p => p > 0.08) ? 'none' : 'flex';
    onChange(normalizePixels(pixels, 336), drawing);
  };
  const point = event => {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * 336 / rect.width, y: (event.clientY - rect.top) * 336 / rect.height };
  };
  canvas.addEventListener('pointerdown', event => {
    if (event.button !== 0 || drawing) return;
    drawing = true;
    canvas.setPointerCapture(event.pointerId);
    snapshot = context.getImageData(0, 0, 336, 336);
    previous = point(event);
    context.fillStyle = '#172023'; context.strokeStyle = '#172023';
    context.lineWidth = width; context.lineCap = 'round'; context.lineJoin = 'round';
    context.beginPath(); context.arc(previous.x, previous.y, width / 2, 0, Math.PI * 2); context.fill();
    emit();
  });
  canvas.addEventListener('pointermove', event => {
    if (!drawing) return;
    const current = point(event);
    context.beginPath(); context.moveTo(previous.x, previous.y); context.lineTo(current.x, current.y); context.stroke();
    previous = current;
    emit();
  });
  const finish = () => {
    if (!drawing) return;
    drawing = false; history.push(snapshot); future.length = 0; emit();
  };
  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', finish);
  canvas.addEventListener('lostpointercapture', finish);
  undo.addEventListener('click', () => {
    if (!history.length) return;
    future.push(context.getImageData(0, 0, 336, 336));
    context.putImageData(history.pop(), 0, 0); emit();
  });
  redo.addEventListener('click', () => {
    if (!future.length) return;
    history.push(context.getImageData(0, 0, 336, 336));
    context.putImageData(future.pop(), 0, 0); emit();
  });
  document.querySelector('#clear').addEventListener('click', () => {
    history.push(context.getImageData(0, 0, 336, 336)); future.length = 0; reset(); emit();
  });
  document.querySelector('#width').addEventListener('input', event => {
    width = Number(event.target.value); document.querySelector('#width-value').value = width;
  });
  document.querySelector('#save').addEventListener('click', () => {
    const link = document.createElement('a'); link.download = 'digit-lab-handwriting.png'; link.href = canvas.toDataURL('image/png'); link.click();
  });
  return {
    load(pixels) {
      history.push(context.getImageData(0, 0, 336, 336)); future.length = 0;
      const tiny = document.createElement('canvas'); tiny.width = 28; tiny.height = 28;
      const ctx = tiny.getContext('2d'), image = ctx.createImageData(28, 28);
      pixels.forEach((v, i) => { const shade = Math.round(255 * (1 - v)); image.data.set([shade, shade, shade, 255], i * 4); });
      ctx.putImageData(image, 0, 0);
      reset(); context.imageSmoothingEnabled = true; context.drawImage(tiny, 0, 0, 336, 336); emit();
    },
  };
}
