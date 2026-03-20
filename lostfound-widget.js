/*!
 * 新莊國小 失物招領 浮動元件
 * 使用方式：在任何頁面 </body> 前加入
 * <script src="lostfound-widget.js"></script>
 */
(function() {
'use strict';

// ── 設定區（可自行修改）──────────────────────────────────────────
const CONFIG = {
  fullPageUrl:  'https://issac-sjps.github.io/Sjps-LostAndFound/',  // 完整頁面網址
  pickupInfo:   '學務處（行政樓一樓）週一至週五 07:30–16:30',
  maxItems:     6,   // 浮動視窗最多顯示幾筆
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
  width: 64px; height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF6B35, #FF9A6C);
  color: #fff; border: none; cursor: pointer;
  box-shadow: 0 4px 20px rgba(255,107,53,.50);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 1px;
  transition: transform .2s, box-shadow .2s;
  outline: none;
}
#lf-fab:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(255,107,53,.6); }
#lf-fab-icon { font-size: 24px; line-height: 1; }
#lf-fab-text { font-size: 9px; font-weight: 700; letter-spacing: .3px; white-space: nowrap; }
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
  bottom: 104px; left: ${CONFIG.fabLeft};
  z-index: 99998;
  width: 300px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 40px rgba(0,0,0,.18);
  overflow: hidden;
  transform: scale(.88) translateY(16px);
  opacity: 0; pointer-events: none;
  transition: all .25s cubic-bezier(.34,1.56,.64,1);
}
#lf-panel.open { transform: scale(1) translateY(0); opacity: 1; pointer-events: auto; }

#lf-head {
  background: linear-gradient(135deg, #FF6B35, #FF8E53);
  padding: 13px 14px 11px;
  display: flex; align-items: center; justify-content: space-between;
}
#lf-head-title { color: #fff; font-weight: 900; font-size: .92rem; display: flex; align-items: center; gap: 5px; }
#lf-head-close {
  background: rgba(255,255,255,.25); border: none; color: #fff;
  width: 26px; height: 26px; border-radius: 50%; cursor: pointer;
  font-size: .95rem; display: flex; align-items: center; justify-content: center;
}
#lf-head-close:hover { background: rgba(255,255,255,.4); }

#lf-notice {
  background: #4ECDC4; color: #fff;
  font-size: .7rem; font-weight: 700;
  padding: 5px 12px; text-align: center; line-height: 1.4;
}

#lf-list { max-height: 300px; overflow-y: auto; padding: 6px 0; }
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

#lf-empty { text-align: center; padding: 32px 16px; color: #bbb; font-size: .82rem; }
#lf-empty-icon { font-size: 36px; margin-bottom: 6px; }
#lf-loading { text-align: center; padding: 28px; color: #ccc; font-size: .82rem; }

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
  <button id="lf-fab" title="失物招領">
    <span id="lf-badge">0</span>
    <span id="lf-fab-icon">🎒</span>
    <span id="lf-fab-text">失物招領</span>
  </button>

  <div id="lf-panel">
    <div id="lf-head">
      <div id="lf-head-title">🎒 新莊國小 失物招領</div>
      <button id="lf-head-close" title="關閉">✕</button>
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

function open()  { isOpen = true;  document.getElementById('lf-panel').classList.add('open'); }
function close() { isOpen = false; document.getElementById('lf-panel').classList.remove('open'); }

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
  el.innerHTML = items.map(item => {
    const thumb = item.imageBase64
      ? `<div class="lf-thumb"><img src="${item.imageBase64}" loading="lazy" alt=""/></div>`
      : `<div class="lf-thumb">${item.emoji || '📦'}</div>`;
    const d = item.foundDate ? new Date(item.foundDate + 'T00:00:00') : null;
    const dateStr = d ? `${d.getMonth()+1}/${d.getDate()} 拾獲` : '';
    return `<div class="lf-item">
      ${thumb}
      <div class="lf-info">
        <span class="lf-cat lf-cat-${esc(item.category)}">${esc(item.category)}</span>
        <div class="lf-name">${esc(item.name)}</div>
        <div class="lf-meta">📍${esc(item.foundLocation)}&nbsp; ${dateStr}</div>
      </div>
    </div>`;
  }).join('');
}

function updateBadge(count) {
  const badge = document.getElementById('lf-badge');
  badge.textContent = count;
  badge.classList.toggle('show', count > 0);
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
