/*!
 * 失物招領 浮動按鈕（連結版）- 2026-11-12
 * 取代 lostfound-widget.js 的站內面板：點按鈕直接開新視窗到獨立頁面
 * https://issac-sjps.github.io/Sjps-LostAndFound/
 *
 * 為什麼換成連結版：
 * - 站內面板帶來的無障礙負擔全部消失：字級鈕 aria-pressed（人工檢測第 12 項）、
 *   面板五顆鈕 44px（2.5.5）、面板鍵盤操作與焦點管理（GN1210100E），在學校站都不存在了。
 * - 獨立頁面在 GitHub Pages，不在學校站這次人工檢測範圍內。
 * - 浮動鈕外觀、位置、大小與原 widget 完全相同（68×68、左下、深棕 #7c2d12）。
 *
 * 仍保留的無障礙要求：
 * - 連結名稱含「（另開新視窗）」：aria-label="失物招領（另開新視窗）"（2.4.9 / 3.2.5，第 8 項規則）。
 * - 浮動鈕 68×68，已過 2.5.5 的 44px。
 * - 這是原生 <a>，鍵盤 Tab 到、Enter 開新視窗，不需額外 JS。
 *
 * 注意：
 * - 拿掉未讀件數紅色徽章（要 Firebase 才有數字）。想留徽章再跟我說。
 * - 主 CSS 的懸停黃底規則（a:hover）會讓按鈕懸停時變黃底黑字，與全站一致，是預期的。
 *
 * 外觀修正（2026-11-12 使用者回報：按鈕圖案不好看，與 AI客服同一問題）：
 * - 可見內容只有圖示 +「失物招領」四個字，「（另開新視窗）」只放在 aria-label 裡
 *   （螢幕閱讀器會報讀，畫面上不顯示），不再擠在 68px 圓圈裡換行溢出。
 * - 2026-11-12 11:10 使用者再回報：字被圓圈底緣砍頭，比原本凸出去還難看。
 *   原因就是字太長 + overflow:hidden 把它切掉。治本方法是「（另開新視窗）」
 *   根本不要顯示（見下），不是把它改小。overflow:hidden 已拿掉，內容裝得下，
 *   不會再有砍頭；就算以後字稍長，也只會凸出去，不會被切掉。
 *
 * 白字對比（2026-11-12 使用者問：白字有過 7:1 嗎）：
 * - 底色 #7c2d12，白字 = 9.37:1，過 AAA，底色不用改。
 * - color 用 #fff !important，確保主 CSS 的 a { color } 蓋不掉白字。
 * - 「（另開新視窗）」可不可以不顯示？可以。2.4.9 / 3.2.5 接受「圖示＋無障礙名稱」
 *   的形式：畫面只留圖示＋「失物招領」，aria-label 寫「失物招領（另開新視窗）」，
 *   螢幕閱讀器照樣報讀，人工檢測第 8 項一樣過。想留可見小字也可以（約 8px），
 *   但 68px 圓圈裡還是擠、難讀，不建議。
 *
 * 上傳方式（二選一）：
 * (a) 最省事：把這個檔案內容覆蓋掉 GitHub Pages 上的 lostfound-widget.js，
 *     檔名不變，學校站的 script 標籤不用改，清除快取後自動生效。
 * (b) 上傳到學校 upload/85/style/，再把萬用欄位裡的 script src 改指新檔。
 * 若新舊兩個 script 同時載入，本檔會自動移除舊 widget 的 #lf-widget-root，避免出現兩顆鈕。
 */
(function() {
  'use strict';

  var PAGE_URL = 'https://issac-sjps.github.io/Sjps-LostAndFound/';

  function init() {
    // 避免重複建立
    if (document.getElementById('lf-link-fab')) return;

    // 若舊版 widget 也載入了，移除它（避免出現兩顆浮動鈕）
    var oldRoot = document.getElementById('lf-widget-root');
    if (oldRoot && oldRoot.parentNode) oldRoot.parentNode.removeChild(oldRoot);

    // 注入最小 CSS（只管這顆鈕，不影響校網其他樣式）
    var style = document.createElement('style');
    style.textContent =
      '#lf-link-fab {' +
      ' position: fixed; bottom: 10%; left: 2.5%; z-index: 99999;' +
      ' width: 68px; height: 68px; border-radius: 50%;' +
      ' background: #7c2d12; color: #fff !important; text-decoration: none;' +
      ' display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;' +
      ' box-shadow: 0 4px 16px rgba(124,45,18,.45); cursor: pointer;' +
      " font-family: 'Noto Sans TC', 'Microsoft JhengHei', sans-serif;" +
      '}' +
      '#lf-link-fab:hover { background: #4a1a0b; }' +
      '#lf-link-fab-icon { font-size: 26px; line-height: 1; flex-shrink: 0; }' +
      '#lf-link-fab-text { font-size: 11px; font-weight: 600; letter-spacing: 1px; white-space: nowrap; line-height: 1; }';
    document.head.appendChild(style);

    // 建立連結鈕（原生 <a>，鍵盤可用）
    // 可見內容只有圖示 +「失物招領」；「（另開新視窗）」只在 aria-label，不顯示。
    var a = document.createElement('a');
    a.id = 'lf-link-fab';
    a.href = PAGE_URL;
    a.target = '_blank';
    a.rel = 'noopener';
    a.setAttribute('aria-label', '失物招領（另開新視窗）');
    a.title = '失物招領（另開新視窗）';
    a.innerHTML =
      '<span aria-hidden="true" id="lf-link-fab-icon">\uD83D\uDD0D</span>' +
      '<span aria-hidden="true" id="lf-link-fab-text">失物招領</span>';
    document.body.appendChild(a);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
