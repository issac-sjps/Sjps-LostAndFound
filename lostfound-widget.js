/*!
 * 失物招領 浮動元件
 * 使用方式：在任何頁面 </body> 前加入
 * <script src="lostfound-widget.js"></script>
 */
(function() {
'use strict';

// ── 設定區（可自行修改）──────────────────────────────────────────
const CONFIG = {
  fullPageUrl:  'https://issac-sjps.github.io/Sjps-LostAndFound/',  // 完整頁面網址
  pickupInfo:   '學務處（行政樓一樓）週一至週五 07:30–16:30',
  maxItems:     999, // 顯示全部
  fabBottom:    '10%',
  fabLeft:      '2.5%',
};

// ── Firebase 設定 ────────────────────────────────────────────────
const FB = {
  apiKey:            "AIzaSyAbRPDqG92GguA05UGXE5IuDIW7b7gjN6k",
  projectId:         "sjps-lostandfound",
  appId:             "1:57366181323:web:30a5b6f0a59468f949324e"
};

// ── 避免重複載入 ─────────────────────────────────────────────────
if (document.getElementById('lf-widget-root')) return;

// ════════════════════════════════════════════
// 1. 注入 CSS（scoped，不影響校網原有樣式）
// ════════════════════════════════════════════
const CSS = `
#lf-widget-root * { box-sizing: border-box; margin: 0; padding: 0; }
#lf-widget-root { font-family: 'Noto Sans TC', 'Microsoft JhengHei', sans-serif; }

/* 浮動按鈕 */
#lf-fab {
  position: fixed;
  bottom: ${CONFIG.fabBottom}; left: ${CONFIG.fabLeft};
  z-index: 99999;
  width: 68px; height: 68px;
  border-radius: 50%;
  background: #FF6B35;
  color: #fff; border: none; cursor: pointer;
  box-shadow: 0 4px 16px rgba(255,107,53,.50);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 2px;
  transition: transform .2s, box-shadow .2s;
  outline: none;
}
#lf-fab:hover { background: #E05520; box-shadow: 0 6px 24px rgba(255,107,53,.6); }
#lf-fab-icon { font-size: 26px; line-height: 1; }
#lf-fab-text { font-size: 11px; font-weight: 600; letter-spacing: 1px; white-space: nowrap; }
#lf-badge {
  position: absolute; top: -4px; right: -4px;
  background: #FF4757; color: #fff; border-radius: 50%;
  width: 22px; height: 22px; font-size: 11px; font-weight: 700;
  display: none; align-items: center; justify-content: center;
  border: 2px solid #fff; font-family: sans-serif;
}
#lf-badge.show { display: flex; }

/* 浮動視窗 */
#lf-panel {
  position: fixed;
  bottom: calc(10% + 80px); left: ${CONFIG.fabLeft};
  z-index: 99998;
  width: 340px;
  height: 480px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,.18);
  border: 1px solid #ffd0ba;
  overflow: hidden;
  display: none;
  flex-direction: column;
  transform: scale(.88) translateY(16px);
  opacity: 0; pointer-events: none;
  transition: transform .25s cubic-bezier(.34,1.56,.64,1), opacity .25s;
  font-family: sans-serif;
}
#lf-panel.open { display: flex; transform: scale(1) translateY(0); opacity: 1; pointer-events: auto; }

#lf-lightbox{display:none;position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:999999;align-items:center;justify-content:center;flex-direction:column;}
#lf-lightbox.open{display:flex;}
#lf-lb-viewport{position:relative;flex:1;width:100%;overflow:hidden;display:flex;align-items:center;justify-content:center;cursor:grab;}
#lf-lb-viewport.dragging{cursor:grabbing;}
#lf-lb-img-wrap{transform-origin:center center;user-select:none;touch-action:none;}
#lf-lb-img-wrap img{display:block;max-width:90vw;max-height:80vh;border-radius:8px;object-fit:contain;pointer-events:none;-webkit-user-drag:none;}
#lf-lb-toolbar{display:flex;align-items:center;gap:8px;padding:10px 16px;background:rgba(255,255,255,.08);border-radius:100px;margin-bottom:12px;flex-shrink:0;}
.lf-lb-btn{background:rgba(255,255,255,.15);border:none;color:#fff;width:36px;height:36px;border-radius:50%;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;font-weight:700;transition:background .15s;}
.lf-lb-btn:hover{background:rgba(255,255,255,.3);}
#lf-lb-zoom-label{color:rgba(255,255,255,.7);font-size:.82rem;min-width:42px;text-align:center;font-family:sans-serif;}
@media(min-width:701px){ #lf-panel{ height: calc(75vh - 80px); } }
@media(max-width:700px){ #lf-panel{ width: calc(100vw - 16px); height: calc(75vh - 80px); } }

#lf-head {
  background: #FF6B35;
  padding: 12px 16px;
  display: flex; align-items: center; gap: 10px; flex-shrink: 0;
}
#lf-head-title { color: #fff; font-weight: 900; font-size: .92rem; display: flex; align-items: center; gap: 5px; }
#lf-head-close {
  background: rgba(255,255,255,.25); border: none; color: #fff;
  width: 26px; height: 26px; border-radius: 50%; cursor: pointer;
  font-size: .95rem; display: flex; align-items: center; justify-content: center;
}
#lf-head-close:hover { background: rgba(255,255,255,.4); }

#lf-notice {
  background: #FF6B35; color: #fff;
  font-size: .7rem; font-weight: 700;
  padding: 5px 12px; text-align: center; line-height: 1.4;
}

#lf-list { flex: 1; overflow-y: auto; padding: 8px; background: #f5f4ff; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-content: start; scroll-behavior: smooth; }
#lf-list::-webkit-scrollbar { width: 4px; }
#lf-list::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }

.lf-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; transition: background .15s;
}
.lf-item:hover { background: #FFF8EF; }
.lf-thumb {
  width: 46px; height: 46px; border-radius: 10px; flex-shrink: 0;
  overflow: hidden;
  background: linear-gradient(135deg,#FFF0E8,#FFDFC8);
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}
.lf-thumb img { width: 100%; height: 100%; object-fit: cover; }
.lf-info { flex: 1; min-width: 0; }
.lf-cat {
  display: inline-block; font-size: .62rem; font-weight: 700;
  padding: 1px 6px; border-radius: 100px; margin-bottom: 2px;
}
.lf-name { font-size: .85rem; font-weight: 700; color: #2D2D2D; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lf-meta { font-size: .7rem; color: #999; margin-top: 1px; }

.lf-cat-文具{background:#FFF3CD;color:#B8860B} .lf-cat-衣物{background:#D1ECF1;color:#0C6C78}
.lf-cat-水壺{background:#D4EDDA;color:#155724} .lf-cat-書包{background:#F8D7DA;color:#721C24}
.lf-cat-3C{background:#E2D9F3;color:#4B2C82}   .lf-cat-其他{background:#E8E0D8;color:#5A5A5A}
.lf-cat-餐具{background:#FFE8CC;color:#A0522D}

#lf-empty { text-align: center; padding: 32px 16px; color: #bbb; font-size: .82rem; grid-column: 1/-1; }
#lf-empty-icon { font-size: 36px; margin-bottom: 6px; }
#lf-loading { text-align: center; padding: 28px; color: #ccc; font-size: .82rem; grid-column: 1/-1; }

#lf-footer { border-top: 1px solid #F0EAE2; padding: 10px 12px 12px; }
#lf-btn-all {
  display: block; width: 100%;
  background: #FF6B35; color: #fff; border: none;
  border-radius: 10px; padding: 9px;
  font-size: .82rem; font-weight: 800;
  font-family: 'Noto Sans TC','Microsoft JhengHei',sans-serif;
  cursor: pointer; text-decoration: none; text-align: center;
  transition: background .15s;
}
#lf-btn-all:hover { background: #E05520; color: #fff; }

#lf-st {
  display: flex; align-items: center; gap: 4px;
  font-size: .68rem; color: #bbb; padding: 4px 12px 0;
  justify-content: flex-end;
}
#lf-dot { width: 6px; height: 6px; border-radius: 50%; background: #ddd; flex-shrink: 0; }
#lf-dot.ok { background: #06D6A0; }
`;

const styleEl = document.createElement('style');
styleEl.textContent = CSS;
document.head.appendChild(styleEl);

// ════════════════════════════════════════════
// 2. 建立 HTML 結構
// ════════════════════════════════════════════
const root = document.createElement('div');
root.id = 'lf-widget-root';
root.innerHTML = `
  <span id="lf-dot-badge" style="position:fixed;bottom:calc(10% + 58px);left:calc(2.5% - 6px);width:12px;height:12px;background:#4ade80;border-radius:50%;border:2px solid #fff;z-index:99999;display:none;"></span>
  <button id="lf-fab" title="失物招領">
    <span id="lf-badge"></span>
    <span id="lf-fab-icon">🔍</span>
    <span id="lf-fab-text">失物招領</span>
  </button>

  <div id="lf-panel">
    <div id="lf-head">
      <div id="lf-head-av" style="width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">🔍</div>
      <div style="flex:1;">
        <div id="lf-head-title" style="font-size:14px;font-weight:600;color:#fff;">失物招領</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.85);margin-top:1px;"><span style="color:#4ade80;">●</span> 即時同步</div>
      </div>
      <div style="display:flex;align-items:center;gap:4px;margin-right:6px;">
        <button onclick="lfSetSize(13)" style="background:rgba(255,255,255,0.2);border:none;color:white;width:24px;height:24px;border-radius:4px;cursor:pointer;font-size:11px;font-family:sans-serif;">小</button>
        <button onclick="lfSetSize(15)" style="background:rgba(255,255,255,0.2);border:none;color:white;width:24px;height:24px;border-radius:4px;cursor:pointer;font-size:12px;font-family:sans-serif;">中</button>
        <button onclick="lfSetSize(17)" style="background:rgba(255,255,255,0.2);border:none;color:white;width:24px;height:24px;border-radius:4px;cursor:pointer;font-size:13px;font-family:sans-serif;">大</button>
      </div>
      <button id="lf-fs-btn" onclick="lfFullscreen()" style="background:rgba(255,255,255,0.2);border:none;color:white;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;" title="放大">⛶</button>
      <button id="lf-head-close" title="關閉" style="background:rgba(255,255,255,0.2);border:none;color:white;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">✕</button>
    </div>
    <div id="lf-notice">📍 ${CONFIG.pickupInfo}</div>
    <div id="lf-list"><div id="lf-loading">⏳ 載入中…</div></div>
    <div id="lf-st"><span id="lf-dot"></span><span id="lf-st-text">連線中</span></div>
    <div id="lf-footer">
      <a id="lf-btn-all" href="${CONFIG.fullPageUrl}" target="_blank">📋 查看全部失物 →</a>
    </div>
  </div>
`;
document.body.appendChild(root);

  // Lightbox
  const lb = document.createElement('div');
  lb.id = 'lf-lightbox';
  lb.innerHTML = '<div id="lf-lb-toolbar">' + '<button class="lf-lb-btn" onclick="lfZoom(-0.25)">－</button>' + '<span id="lf-lb-zoom-label">100%</span>' + '<button class="lf-lb-btn" onclick="lfZoom(0.25)">＋</button>' + '<button class="lf-lb-btn" style="font-size:.72rem;width:auto;padding:0 10px;border-radius:12px;" onclick="lfZoomReset()">重置</button>' + '<span style="width:1px;height:20px;background:rgba(255,255,255,.25);margin:0 4px;display:inline-block;"></span>' + '<button class="lf-lb-btn" onclick="lfCloseLightbox()">✕</button>' + '</div>' + '<div id="lf-lb-viewport">' + '<div id="lf-lb-img-wrap"><img id="lf-lightbox-img" src="" alt=""/></div>' + '</div>';
  document.body.appendChild(lb);

// ════════════════════════════════════════════
// 3. Panel 開關邏輯
// ════════════════════════════════════════════
let isOpen = false;

document.getElementById('lf-fab').addEventListener('click', () => {
  isOpen ? close() : open();
});
document.getElementById('lf-head-close').addEventListener('click', close);

document.addEventListener('click', e => {
  if (!isOpen) return;
  const panel = document.getElementById('lf-panel');
  const fab   = document.getElementById('lf-fab');
  if (!panel.contains(e.target) && !fab.contains(e.target)) close();
});

function open()  {
  isOpen = true;
  document.getElementById('lf-panel').classList.add('open');
  document.getElementById('lf-dot-badge').style.display = 'none';
}
function close() {
  isOpen = false;
  document.getElementById('lf-panel').classList.remove('open');
}

window.lfSetSize = function(size) {
  document.querySelectorAll('.lf-name,.lf-meta,.lf-cat').forEach(el => el.style.fontSize = size + 'px');
  document.getElementById('lf-notice').style.fontSize = size + 'px';
  window._lfSize = size;
};

var _lfFullscreen = false;
window.lfFullscreen = function() {
  var win  = document.getElementById('lf-panel');
  var btn  = document.getElementById('lf-fs-btn');
  var list = document.getElementById('lf-list');
  _lfFullscreen = !_lfFullscreen;
  if (_lfFullscreen) {
    win.style.top    = '2%';
    win.style.left   = '2%';
    win.style.right  = '2%';
    win.style.bottom = '5%';
    win.style.width  = 'auto';
    win.style.height = 'auto';
    win.style.zIndex = '999999';
    win.style.borderRadius = '16px';
    btn.textContent = '⊡';
    btn.title = '縮小';
    // 放大後改 4 欄，充分利用空間
    if (list) list.style.gridTemplateColumns = 'repeat(4, 1fr)';
  } else {
    win.style.top = ''; win.style.left = ''; win.style.right = '';
    win.style.bottom = ''; win.style.width = ''; win.style.height = '';
    win.style.zIndex = ''; win.style.borderRadius = '';
    btn.textContent = '⛶';
    btn.title = '放大';
    // 恢復 2 欄
    if (list) list.style.gridTemplateColumns = '';
  }
};

// ════════════════════════════════════════════
// 4. 動態載入 Firebase（避免與校網其他 JS 衝突）
// ════════════════════════════════════════════
function loadScript(src) {
  return new Promise(res => {
    const s = document.createElement('script');
    s.type = 'module';
    s.src = src;
    s.onload = res;
    document.head.appendChild(s);
  });
}

// 使用 ESM + dynamic import 避免全域污染
// Expose config for use in renderItems
window.lfConfig = CONFIG;

// ── Lightbox state ──────────────────────────────────────────────
let _lbScale = 1, _lbX = 0, _lbY = 0;
let _lbDragging = false, _lbStartX = 0, _lbStartY = 0, _lbDragX = 0, _lbDragY = 0;

function _lbApply() {
  const wrap = document.getElementById('lf-lb-img-wrap');
  const lbl  = document.getElementById('lf-lb-zoom-label');
  if (wrap) wrap.style.transform = `translate(${_lbX}px,${_lbY}px) scale(${_lbScale})`;
  if (lbl)  lbl.textContent = Math.round(_lbScale * 100) + '%';
}

window.lfZoom = delta => {
  _lbScale = Math.min(5, Math.max(0.5, _lbScale + delta));
  _lbApply();
};
window.lfZoomReset = () => {
  _lbScale = 1; _lbX = 0; _lbY = 0; _lbApply();
};

window.lfShowImg = (src, alt) => {
  const lb  = document.getElementById('lf-lightbox');
  const img = document.getElementById('lf-lightbox-img');
  img.src = src; img.alt = alt || '';
  _lbScale = 1; _lbX = 0; _lbY = 0; _lbApply();
  lb.classList.add('open');
  // ✅ 只隱藏 panel 底下不需要，body overflow 不動
  // 不關閉 lf-panel！
};

window.lfCloseLightbox = () => {
  document.getElementById('lf-lightbox').classList.remove('open');
  // ✅ 不動 body.overflow，panel 保持開著
};

// Keyboard: Esc 只關 lightbox，不關 panel
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const lb = document.getElementById('lf-lightbox');
    if (lb && lb.classList.contains('open')) {
      lfCloseLightbox(); e.stopPropagation();
    }
  }
});

// Scroll to zoom on viewport
document.addEventListener('wheel', e => {
  const vp = document.getElementById('lf-lb-viewport');
  if (vp && vp.contains(e.target)) {
    e.preventDefault();
    lfZoom(e.deltaY < 0 ? 0.15 : -0.15);
  }
}, { passive: false });

// Click backdrop (the viewport itself) to close
document.addEventListener('click', e => {
  const lb = document.getElementById('lf-lightbox');
  const vp = document.getElementById('lf-lb-viewport');
  const wrap = document.getElementById('lf-lb-img-wrap');
  if (lb && lb.classList.contains('open') && vp && e.target === vp) {
    lfCloseLightbox();
  }
});

// Drag to pan
document.addEventListener('mousedown', e => {
  const vp = document.getElementById('lf-lb-viewport');
  if (!vp || !vp.contains(e.target)) return;
  _lbDragging = true; _lbStartX = e.clientX - _lbX; _lbStartY = e.clientY - _lbY;
  vp.classList.add('dragging');
});
document.addEventListener('mousemove', e => {
  if (!_lbDragging) return;
  _lbX = e.clientX - _lbStartX; _lbY = e.clientY - _lbStartY; _lbApply();
});
document.addEventListener('mouseup', () => {
  _lbDragging = false;
  const vp = document.getElementById('lf-lb-viewport');
  if (vp) vp.classList.remove('dragging');
});

// Touch support
document.addEventListener('touchstart', e => {
  const vp = document.getElementById('lf-lb-viewport');
  if (!vp || !vp.contains(e.target) || e.touches.length !== 1) return;
  _lbDragging = true;
  _lbStartX = e.touches[0].clientX - _lbX;
  _lbStartY = e.touches[0].clientY - _lbY;
}, { passive: true });
document.addEventListener('touchmove', e => {
  if (!_lbDragging || e.touches.length !== 1) return;
  _lbX = e.touches[0].clientX - _lbStartX;
  _lbY = e.touches[0].clientY - _lbStartY;
  _lbApply();
}, { passive: true });
document.addEventListener('touchend', () => { _lbDragging = false; });

const initFirebase = async () => {
  try {
    const { initializeApp, getApps } = await import('https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js');
    const { getFirestore, collection, query, orderBy, onSnapshot } =
      await import('https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js');

    // 避免重複初始化
    const apps = getApps();
    const app  = apps.length ? apps[0] : initializeApp(FB);
    const db   = getFirestore(app);

    // 只用 orderBy，不加 where，不需要複合索引
    // 過濾「待認領」和限制筆數在前端做
    const q = query(
      collection(db, 'items'),
      orderBy('createdAt', 'desc')
    );

    onSnapshot(q,
      snap => {
        const items = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(i => i.status === '待認領')
          .slice(0, CONFIG.maxItems);
        renderItems(items);
        updateBadge(items.length);
        setStatus(true, `已連線 · ${items.length} 件待認領`);
      },
      err => {
        console.warn('[失物招領元件]', err);
        setStatus(false, '連線失敗');
        document.getElementById('lf-list').innerHTML =
          '<div id="lf-empty"><div id="lf-empty-icon">⚠️</div>暫時無法載入</div>';
      }
    );
  } catch(e) {
    console.warn('[失物招領元件] Firebase 載入失敗', e);
  }
};

// ════════════════════════════════════════════
// 5. 渲染列表
// ════════════════════════════════════════════
function renderItems(items) {
  const el = document.getElementById('lf-list');
  if (!items.length) {
    el.innerHTML = '<div id="lf-empty"><div id="lf-empty-icon">🎉</div>目前沒有待領失物</div>';
    return;
  }
  const placeholder = `<svg width="100%" height="100%" viewBox="0 0 48 48"><rect width="48" height="48" fill="#F0EAE2"/><path d="M10 32l9-12 6 8 4-5 7 9H10z" fill="#D4C8C0"/><circle cx="34" cy="16" r="5" fill="#D4C8C0"/></svg>`;
  el.innerHTML = items.map(item => {
    const hasImg = !!item.imageBase64;
    const thumb = hasImg
      ? `<div class="lf-thumb" onclick="event.stopPropagation();lfShowImg('${item.imageBase64.replace(/'/g,"\'")}','${esc(item.name)}')"><img src="${item.imageBase64}" loading="lazy" alt=""/></div>`
      : `<div class="lf-thumb">${placeholder}</div>`;
    const d = item.foundDate ? new Date(item.foundDate + 'T00:00:00') : null;
    const dateStr = d ? `${d.getMonth()+1}/${d.getDate()}` : '';
    return `<div class="lf-item" onclick="window.open('${window.lfConfig ? window.lfConfig.fullPageUrl : ''}','_blank')">
      ${thumb}
      <div class="lf-info">
        <span class="lf-cat lf-cat-${esc(item.category)}">${esc(item.category)}</span>
        <div class="lf-name">${esc(item.name)}</div>
        <div class="lf-meta">📍${esc(item.foundLocation)}</div>
        <div class="lf-meta">📅${dateStr}</div>
      </div>
    </div>`;
  }).join('');
}

function updateBadge(count) {
  const dot = document.getElementById('lf-dot-badge');
  if (dot) dot.style.display = count > 0 ? 'block' : 'none';
}

function setStatus(ok, text) {
  document.getElementById('lf-dot').className = ok ? 'ok' : '';
  document.getElementById('lf-st-text').textContent = text;
}

function esc(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ════════════════════════════════════════════
// 6. 啟動
// ════════════════════════════════════════════
initFirebase();

})(); // end IIFE
