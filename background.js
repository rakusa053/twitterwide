// 管理対象のウィンドウIDリスト
let managedWindowIds = [];
let scrollSyncEnabled = true;
// スクロール同期の無限ループを防ぐフラグ (tabId -> timestamp)
const recentSyncMap = new Map();
const SYNC_COOLDOWN_MS = 80;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'LAUNCH') {
    launchWindows(message.urls, message.screenWidth, message.screenHeight, message.syncScroll);
    sendResponse({ ok: true });
  }

  if (message.type === 'SCROLL_EVENT') {
    if (!scrollSyncEnabled) return;
    const tabId = sender.tab?.id;
    if (!tabId) return;

    // このタブが最近同期先として動かされた場合は無視（ループ防止）
    const lastSynced = recentSyncMap.get(tabId);
    if (lastSynced && Date.now() - lastSynced < SYNC_COOLDOWN_MS) return;

    syncScrollToOthers(tabId, message.scrollY);
  }

  if (message.type === 'SET_SYNC') {
    scrollSyncEnabled = message.enabled;
  }
});

async function launchWindows(urls, screenW, screenH, syncScroll) {
  scrollSyncEnabled = syncScroll;

  // 既存の管理ウィンドウを閉じる
  for (const winId of managedWindowIds) {
    try { await chrome.windows.remove(winId); } catch (_) {}
  }
  managedWindowIds = [];
  recentSyncMap.clear();

  const colWidth = Math.floor(screenW / 3);

  for (let i = 0; i < 3; i++) {
    const url = urls[i]?.trim() || 'https://x.com/home';
    const win = await chrome.windows.create({
      url,
      left: colWidth * i,
      top: 0,
      width: colWidth,
      height: screenH,
      type: 'normal'
    });
    managedWindowIds.push(win.id);
  }
}

async function syncScrollToOthers(senderTabId, scrollY) {
  const targetTabIds = [];

  for (const winId of managedWindowIds) {
    let tabs;
    try {
      tabs = await chrome.tabs.query({ windowId: winId });
    } catch (_) { continue; }

    for (const tab of tabs) {
      if (tab.id !== senderTabId) {
        targetTabIds.push(tab.id);
      }
    }
  }

  for (const tabId of targetTabIds) {
    recentSyncMap.set(tabId, Date.now());
    chrome.tabs.sendMessage(tabId, { type: 'SYNC_SCROLL', scrollY }).catch(() => {});
  }
}
