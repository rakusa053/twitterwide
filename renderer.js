const path = require('path');

const webviews = [
  document.getElementById('wv0'),
  document.getElementById('wv1'),
  document.getElementById('wv2'),
];
const urlBars = [
  document.getElementById('urlBar0'),
  document.getElementById('urlBar1'),
  document.getElementById('urlBar2'),
];

const preloadPath = `file://${path.join(__dirname, 'webview-preload.js')}`;

// 各webviewにpreloadを設定
webviews.forEach((wv, i) => {
  wv.setAttribute('preload', preloadPath);

  // URLバーをナビゲーションに同期 & ログイン完了を検出
  wv.addEventListener('did-navigate', (e) => {
    urlBars[i].value = e.url;
    // ログイン後にホームへ遷移したら他のパネルを自動リロード
    if (/x\.com\/(home|i\/timeline)|twitter\.com\/(home|i\/timeline)/.test(e.url)) {
      webviews.forEach((other, j) => {
        if (j !== i) other.reload();
      });
    }
  });
  wv.addEventListener('did-navigate-in-page', (e) => {
    urlBars[i].value = e.url;
  });

  // スクロールイベント受信
  wv.addEventListener('ipc-message', (e) => {
    if (e.channel !== 'scroll') return;
    if (!document.getElementById('syncToggle').checked) return;

    const scrollY = e.args[0];
    webviews.forEach((other, j) => {
      if (j !== i) {
        other.send('do-scroll', scrollY);
      }
    });
  });
});

// URLバー: Enterキーでナビゲート
urlBars.forEach((bar, i) => {
  bar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') navigateTo(i, bar.value);
  });
});

// → ボタン
document.querySelectorAll('.go-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const i = parseInt(btn.dataset.col);
    navigateTo(i, urlBars[i].value);
  });
});

// 個別更新ボタン
document.querySelectorAll('.reload-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    webviews[parseInt(btn.dataset.col)].reload();
  });
});

// 全て更新
document.getElementById('reloadAll').addEventListener('click', () => {
  webviews.forEach((wv) => wv.reload());
});

function navigateTo(index, url) {
  let target = url.trim();
  if (!target.startsWith('http')) target = 'https://' + target;
  webviews[index].src = target;
  urlBars[index].value = target;
}
