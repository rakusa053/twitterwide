const STORAGE_KEYS = ['url0', 'url1', 'url2', 'syncScroll'];

// 保存済み設定を読み込む
chrome.storage.local.get(STORAGE_KEYS, (data) => {
  for (let i = 0; i < 3; i++) {
    const input = document.getElementById(`url${i}`);
    if (data[`url${i}`]) input.value = data[`url${i}`];
  }
  document.getElementById('syncScroll').checked = data.syncScroll === true;
});

// プリセット選択でURLを自動入力
for (let i = 0; i < 3; i++) {
  const select = document.getElementById(`preset${i}`);
  const input = document.getElementById(`url${i}`);
  select.addEventListener('change', () => {
    if (select.value && select.value !== 'custom') {
      input.value = select.value;
    }
    select.value = '';
  });
}

document.getElementById('launch').addEventListener('click', () => {
  const urls = [0, 1, 2].map(i => {
    const val = document.getElementById(`url${i}`).value.trim();
    return val || 'https://x.com/home';
  });
  const syncScroll = document.getElementById('syncScroll').checked;

  chrome.storage.local.set({ url0: urls[0], url1: urls[1], url2: urls[2], syncScroll });

  chrome.runtime.sendMessage({
    type: 'LAUNCH',
    urls,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    syncScroll
  });

  window.close();
});
