import { createIcons, ScanLine, Pencil, Undo2, Redo2, Trash2, Download, ArrowUpRight, FlaskConical, ChevronDown, ExternalLink } from 'lucide';
import './style.css';
import { createDrawing } from './drawing.mjs';
import { createResults, paintPixels } from './results.mjs';

createIcons({ icons: { ScanLine, Pencil, Undo2, Redo2, Trash2, Download, ArrowUpRight, FlaskConical, ChevronDown, ExternalLink } });
const worker = new Worker(new URL('./worker.mjs', import.meta.url), { type: 'module' });
const results = createResults(); results.reset();
let ready = false, revision = 0, displayedRevision = 0, activeStroke = false, timer, currentPixels = new Float32Array(784);
const status = document.querySelector('#status');
const request = () => { if (ready && currentPixels.some(p => p > 0.08)) worker.postMessage({ type: 'predict', revision, pixels: currentPixels }); };
const drawing = createDrawing(document.querySelector('#draw'), (pixels, drawingStroke) => {
  currentPixels = pixels; revision++; activeStroke = drawingStroke;
  paintPixels(document.querySelector('#normalized'), pixels);
  if (!pixels.some(p => p > 0.08)) { clearTimeout(timer); timer = undefined; displayedRevision = revision; results.reset(); }
  else if (!timer) timer = setTimeout(() => { timer = undefined; request(); }, 100);
});
paintPixels(document.querySelector('#normalized'), currentPixels);
const samples = document.querySelector('#sample-buttons');
for (let digit = 0; digit < 10; digit++) {
  const button = document.createElement('button'); button.textContent = digit; button.disabled = true;
  button.title = `숫자 ${digit}의 실제 MNIST 예시`; button.setAttribute('aria-label', button.title);
  button.addEventListener('click', () => worker.postMessage({ type: 'sample', digit }));
  samples.append(button);
}
document.querySelector('#prediction-number').setAttribute('aria-live', 'polite');
const fail = message => {
  ready = false; status.textContent = `데이터 오류: ${message}`;
  document.querySelector('#prediction-title').textContent = '데이터를 불러오지 못했어요';
  document.querySelector('#prediction-detail').textContent = '연결을 확인하고 페이지를 새로고침해 주세요.';
};
worker.onerror = event => fail(event.message || '비교 작업을 시작할 수 없습니다.');
worker.onmessage = ({ data }) => {
  switch (data.type) {
    case 'ready':
      ready = true; status.innerHTML = '<span class="status-dot"></span>3,000개 손글씨 · 준비 완료';
      samples.querySelectorAll('button').forEach(b => { b.disabled = false; }); request(); break;
    case 'sample': drawing.load(data.pixels); break;
    case 'result':
      if (data.revision === revision || (activeStroke && data.revision > displayedRevision)) {
        displayedRevision = data.revision; results.render(data);
      }
      break;
    case 'error': fail(data.message); break;
  }
};
