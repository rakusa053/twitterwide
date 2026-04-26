const { ipcRenderer } = require('electron');

let isReceivingSync = false;

window.addEventListener('scroll', () => {
  if (isReceivingSync) return;
  ipcRenderer.sendToHost('scroll', window.scrollY);
}, { passive: true });

ipcRenderer.on('do-scroll', (_event, y) => {
  isReceivingSync = true;
  window.scrollTo({ top: y, behavior: 'instant' });
  setTimeout(() => { isReceivingSync = false; }, 120);
});
