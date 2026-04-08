// Client-side card export. Uses html2canvas if available; otherwise falls back
// to a Canvas API drawing. The fallback ensures it works without an extra
// runtime dependency at minimum.

export async function exportNoteCard({ title, subtitle, body, themeId }) {
  try {
    const html2canvas = (await import('html2canvas')).default;
    const node = buildDomCard({ title, subtitle, body, themeId });
    document.body.appendChild(node);
    const canvas = await html2canvas(node, { backgroundColor: null, scale: 2 });
    document.body.removeChild(node);
    triggerDownload(canvas.toDataURL('image/png'), title);
  } catch (e) {
    // Fallback: native Canvas
    const dataUrl = drawCanvasFallback({ title, subtitle, body, themeId });
    triggerDownload(dataUrl, title);
  }
}

function triggerDownload(dataUrl, title) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${(title || 'note').replace(/[^a-z0-9-_]+/gi, '_')}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function themePalette(themeId) {
  switch (themeId) {
    case 'minimalistic-dark':
      return { bg: '#0F1117', fg: '#EDE8DF', accent: '#F5A623', font: '"DM Serif Display", Georgia, serif' };
    case 'funky':
      return { bg: '#FF2D87', fg: '#FFFDF5', accent: '#0033CC', font: '"Bebas Neue", Impact, sans-serif' };
    case 'retro':
      return { bg: '#F2E8D5', fg: '#2C1810', accent: '#C0392B', font: '"Playfair Display", Georgia, serif' };
    case 'minimalistic-light':
    default:
      return { bg: '#F5F0E8', fg: '#1A2744', accent: '#E8402A', font: '"DM Serif Display", Georgia, serif' };
  }
}

function buildDomCard({ title, subtitle, body, themeId }) {
  const p = themePalette(themeId);
  const card = document.createElement('div');
  Object.assign(card.style, {
    position: 'fixed',
    left: '-9999px',
    top: '0',
    width: '640px',
    padding: '56px 48px 48px',
    background: p.bg,
    color: p.fg,
    fontFamily: 'system-ui, sans-serif',
    boxSizing: 'border-box',
    borderRadius: '14px',
    border: `2px solid ${p.accent}`,
    boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
  });
  card.innerHTML = `
    <div style="font:600 11px/1 system-ui; letter-spacing:0.22em; text-transform:uppercase; color:${p.accent}; margin-bottom:18px;">
      WALL CALENDAR · NOTE
    </div>
    <div style="font:400 44px/1.05 ${p.font}; margin-bottom:8px;">${escapeHtml(title)}</div>
    <div style="font:500 13px/1 system-ui; opacity:0.7; letter-spacing:0.04em; margin-bottom:28px;">${escapeHtml(subtitle)}</div>
    <div style="font:400 17px/1.55 system-ui; white-space:pre-wrap; word-wrap:break-word; padding-top:18px; border-top:1px solid ${p.accent}55;">${escapeHtml(body)}</div>
  `;
  return card;
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function drawCanvasFallback({ title, subtitle, body, themeId }) {
  const p = themePalette(themeId);
  const W = 1280, H = 800;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');

  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = p.accent;
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, W - 48, H - 48);

  ctx.fillStyle = p.accent;
  ctx.font = '600 22px system-ui, sans-serif';
  ctx.fillText('WALL CALENDAR · NOTE', 80, 120);

  ctx.fillStyle = p.fg;
  ctx.font = `400 84px ${p.font}`;
  wrapText(ctx, title, 80, 220, W - 160, 92);

  ctx.font = '500 26px system-ui, sans-serif';
  ctx.fillText(subtitle, 80, 320);

  ctx.font = '400 30px system-ui, sans-serif';
  wrapText(ctx, body, 80, 400, W - 160, 42);

  return cv.toDataURL('image/png');
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = String(text || '').split(/\s+/);
  let line = '';
  for (const w of words) {
    const test = line + w + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = w + ' ';
      y += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, y);
}
