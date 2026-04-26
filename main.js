const { app, BrowserWindow, session } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 950,
    minWidth: 900,
    minHeight: 600,
    title: 'TwitterWide',
    backgroundColor: '#0f1419',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true,
    },
  });

  win.loadFile('index.html');
}

const CHROME_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

app.whenReady().then(() => {
  const ses = session.defaultSession;

  // User-Agent を Chrome に偽装（Electronと判定されてログインが弾かれるのを防ぐ）
  ses.setUserAgent(CHROME_UA);

  // セキュリティヘッダーを除去してwebviewで正常に動作させる
  ses.webRequest.onHeadersReceived((details, callback) => {
    const headers = { ...details.responseHeaders };
    const drop = ['x-frame-options', 'content-security-policy', 'content-security-policy-report-only'];
    for (const key of Object.keys(headers)) {
      if (drop.includes(key.toLowerCase())) delete headers[key];
    }
    callback({ responseHeaders: headers });
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
