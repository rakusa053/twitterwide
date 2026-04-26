// Twitter はメインのスクロールが <html> ではなく内部要素にある場合がある
// 両方をケアする
function getScrollTarget() {
  // Twitter SPA のメインスクロール領域
  const main = document.querySelector('[data-testid="primaryColumn"]');
  return main || document.documentElement;
}

let isReceivingSync = false;

window.addEventListener('scroll', () => {
  if (isReceivingSync) return;
  chrome.runtime.sendMessage({
    type: 'SCROLL_EVENT',
    scrollY: window.scrollY
  }).catch(() => {});
}, { passive: true });

// Twitterの内部スクロール要素もケア
document.addEventListener('scroll', (e) => {
  if (isReceivingSync) return;
  const target = e.target;
  if (target && target !== document && target.scrollTop > 0) {
    chrome.runtime.sendMessage({
      type: 'SCROLL_EVENT',
      scrollY: target.scrollTop
    }).catch(() => {});
  }
}, { passive: true, capture: true });

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SYNC_SCROLL') {
    isReceivingSync = true;
    window.scrollTo({ top: message.scrollY, behavior: 'instant' });

    // 内部スクロール要素にも適用
    const inner = document.querySelector('[data-testid="primaryColumn"]');
    if (inner) inner.scrollTop = message.scrollY;

    setTimeout(() => { isReceivingSync = false; }, 100);
  }
});
