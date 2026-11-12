/*!
 * 失物招領 浮動按鈕（連結版 v2）- 2026-11-12
 * 膠囊形設計，符合 WCAG 2.x AAA：
 * - 對比：白字 #fff / 深棕 #7c2d12 約 9.9:1（AAA 需 7:1）；懸停 #431407 約 17:1
 * - 目標尺寸：高 56px（AAA 2.5.5 需 44px）
 * - 焦點：3px 白線 + 3px 深色外環，任何背景都清楚（2.4.7 / 2.4.13）
 * - 連結名稱含可見文字（2.5.3）：aria-label="失物招領（另開新視窗）"
 * - 另開新視窗提示為可見文字（2.4.9 / 3.2.5）
 * - 尊重 prefers-reduced-motion
 */
(function() {
  'use strict';

  var PAGE_URL = 'https://issac-sjps.github.io/Sjps-LostAndFound/';

  function init() {
    if (document.getElementById('lf-link-fab')) return;

    // 移除舊版 widget，避免兩顆鈕
    var oldRoot = document.getElementById('lf-widget-root');
    if (oldRoot && oldRoot.parentNode) oldRoot.parentNode.removeChild(oldRoot);

    var style = document.createElement('style');
    style.textContent =
      '#lf-link-fab {' +
      ' position: fixed !important; bottom: 10%; left: 2.5%; z-index: 99999;' +
      ' display: inline-flex !important; align-items: center; gap: 12px;' +
      ' min-height: 56px; box-sizing: border-box; padding: 6px 22px 6px 6px;' +
      ' background: #7c2d12 !important; color: #fff !important;' +
      ' border: 2px solid #fff; border-radius: 999px;' +
      ' text-decoration: none !important; cursor: pointer;' +
      ' box-shadow: 0 6px 18px rgba(67,20,7,.4), 0 1px 3px rgba(0,0,0,.25);' +
      " font-family: 'Noto Sans TC', 'Microsoft JhengHei', sans-serif;" +
      ' transition: background-color .2s, transform .2s, box-shadow .2s;' +
      '}' +
      /* 擋掉學校站對 target=_blank 自動加的文字或圖示 */
      '#lf-link-fab::before, #lf-link-fab::after { content: none !important; display: none !important; }' +
      /* 蓋過全站 a:hover 黃底規則，確保對比 */
      '#lf-link-fab:hover, #lf-link-fab:focus {' +
      ' background: #431407 !important; color: #fff !important;' +
      ' box-shadow: 0 8px 22px rgba(67,20,7,.5), 0 1px 3px rgba(0,0,0,.3);' +
      '}' +
      '#lf-link-fab:hover { transform: translateY(-2px); }' +
      '#lf-link-fab:focus { outline: 3px solid #fff !important; outline-offset: 0;' +
      ' box-shadow: 0 0 0 6px #431407, 0 8px 22px rgba(67,20,7,.5); }' +
      '#lf-link-fab:focus:not(:focus-visible) { outline: none !important; box-shadow: 0 6px 18px rgba(67,20,7,.4); }' +
      '#lf-link-fab:focus-visible { outline: 3px solid #fff !important;' +
      ' box-shadow: 0 0 0 6px #431407, 0 8px 22px rgba(67,20,7,.5); }' +
      '#lf-link-fab-icon {' +
      ' flex: 0 0 44px; width: 44px; height: 44px; border-radius: 50%;' +
      ' background: #fff; color: #7c2d12; display: flex; align-items: center; justify-content: center;' +
      '}' +
      '#lf-link-fab-icon svg { width: 24px; height: 24px; display: block; }' +
      '#lf-link-fab-labels { display: flex; flex-direction: column; line-height: 1.2; text-align: left; }' +
      '#lf-link-fab-text { font-size: 17px; font-weight: 700; letter-spacing: 1px; white-space: nowrap; color: #fff; }' +
      '#lf-link-fab-sub { font-size: 13px; font-weight: 400; white-space: nowrap; color: #fff; margin-top: 2px; }' +
      '@media (prefers-reduced-motion: reduce) { #lf-link-fab { transition: none; } #lf-link-fab:hover { transform: none; } }' +
      '@media (max-width: 480px) { #lf-link-fab { left: 12px; bottom: 16px; } }';
    document.head.appendChild(style);

    var a = document.createElement('a');
    a.id = 'lf-link-fab';
    a.href = PAGE_URL;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', '失物招領（另開新視窗）');
    a.title = '失物招領（另開新視窗）';
    a.innerHTML =
      '<span id="lf-link-fab-icon" aria-hidden="true">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" focusable="false">' +
          '<circle cx="10.5" cy="10.5" r="6.5"></circle><line x1="15.5" y1="15.5" x2="21" y2="21"></line>' +
        '</svg>' +
      '</span>' +
      '<span id="lf-link-fab-labels" aria-hidden="true">' +
        '<span id="lf-link-fab-text">失物招領</span>' +
        '<span id="lf-link-fab-sub">另開新視窗</span>' +
      '</span>';
    document.body.appendChild(a);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
