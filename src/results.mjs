import { overlap } from './pixels.mjs';

export function paintPixels(canvas, pixels) {
  const ctx = canvas.getContext('2d'), image = ctx.createImageData(28, 28);
  pixels.forEach((v, i) => { const c = Math.round(255 * (1 - v)); image.data.set([c, c, c, 255], i * 4); });
  ctx.putImageData(image, 0, 0);
}

export function createResults() {
  const ranking = document.querySelector('#ranking'), neighbors = document.querySelector('#neighbors');
  let input = new Float32Array(784), selected, result, mode = 'overlay';
  const compare = () => {
    if (!selected) return;
    const reference = selected.pixels, stats = overlap(input, reference);
    const ctx = document.querySelector('#comparison').getContext('2d'), image = ctx.createImageData(28, 28);
    input.forEach((v, i) => {
      const r = reference[i], a = v > 0.2, b = r > 0.2;
      let color = [255, 255, 255];
      if (a && b && mode === 'overlay') color = [23, 32, 35];
      else if (a && !b) color = [8, 127, 121];
      else if (b && !a) color = [205, 78, 107];
      else if (mode === 'difference' && Math.abs(v - r) > 0.15) color = v > r ? [8, 127, 121] : [205, 78, 107];
      image.data.set([...color, 255], i * 4);
    });
    ctx.putImageData(image, 0, 0);
    document.querySelector('#overlap-title').textContent = `숫자 ${selected.digit} 예시와 획 ${stats.percent}% 겹침`;
    document.querySelector('#overlap-detail').textContent = `두 이미지에 획이 있는 ${stats.shared + stats.inputOnly + stats.referenceOnly}개 픽셀 중 ${stats.shared}개가 겹쳐요. 내 획만 있는 곳은 ${stats.inputOnly}개, 예시에만 있는 곳은 ${stats.referenceOnly}개예요.`;
  };
  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => {
    mode = button.dataset.view;
    document.querySelectorAll('[data-view]').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
    compare();
  }));
  const fillRanks = values => {
    ranking.replaceChildren();
    values.forEach((item, index) => {
      const row = document.createElement('div'); row.className = `rank-row ${index === 0 && result ? 'best' : ''}`;
      row.innerHTML = `<strong>${item.digit}</strong><div class="track"><div class="fill" style="width:${item.score}%"></div></div><span>${result ? item.score.toFixed(0) + '%' : '—'}</span>`;
      ranking.append(row);
    });
  };
  return {
    reset() {
      result = undefined; selected = undefined;
      document.querySelector('#prediction-number').textContent = '—';
      document.querySelector('#prediction-title').textContent = '아직 빈 종이예요';
      document.querySelector('#prediction-detail').textContent = '손글씨를 기다리고 있어요.';
      document.querySelector('#vote-value').innerHTML = '—<span>/ 7</span>';
      document.querySelector('#overlap-title').textContent = '획의 위치를 비교해요';
      document.querySelector('#overlap-detail').textContent = '선택한 예시와의 픽셀 겹침이 표시됩니다.';
      document.querySelector('#latency').textContent = '실시간 비교';
      fillRanks(Array.from({ length: 10 }, (_, digit) => ({ digit, score: 0 })));
      neighbors.innerHTML = Array.from({ length: 6 }, () => '<div class="neighbor empty" aria-hidden="true">—</div>').join('');
      paintPixels(document.querySelector('#comparison'), new Float32Array(784));
    },
    render(message) {
      input = message.pixels; result = message.result;
      const votes = result.ranking.find(r => r.digit === result.prediction).votes;
      document.querySelector('#prediction-number').textContent = result.prediction;
      document.querySelector('#prediction-title').textContent = votes >= 5 ? `${result.prediction}에 가까워요` : '의견이 조금 갈려요';
      document.querySelector('#prediction-detail').textContent = `가까운 손글씨 7개 중 ${votes}개가 숫자 ${result.prediction}이에요.`;
      document.querySelector('#prediction-number').setAttribute('aria-label', `분류 결과 숫자 ${result.prediction}`);
      document.querySelector('#vote-value').innerHTML = `${votes}<span>/ 7</span>`;
      document.querySelector('#latency').textContent = `${message.elapsed} ms · ${result.count.toLocaleString()}개 비교`;
      fillRanks(result.ranking);
      neighbors.replaceChildren();
      result.neighbors.forEach((item, index) => {
        const button = document.createElement('button'); button.className = `neighbor ${index === 0 ? 'selected' : ''}`;
        button.setAttribute('aria-label', `숫자 ${item.digit} 예시, 모양 유사도 ${item.score.toFixed(0)}퍼센트`);
        button.setAttribute('aria-pressed', String(index === 0));
        button.innerHTML = `<canvas width="28" height="28"></canvas><strong>숫자 ${item.digit}</strong><span>${item.score.toFixed(0)}%</span>`;
        paintPixels(button.querySelector('canvas'), item.pixels);
        button.addEventListener('click', () => {
          selected = item;
          neighbors.querySelectorAll('button').forEach(b => { b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', String(b === button)); });
          compare();
        });
        neighbors.append(button);
      });
      selected = result.neighbors[0]; compare();
    },
  };
}
