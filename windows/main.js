const { app, BrowserWindow, screen, Tray, Menu, ipcMain, nativeImage, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
  process.exit(0);
}

// Windows protocol registration for charmlet:// and luckydangle://
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('charmlet', process.execPath, [path.resolve(process.argv[1])]);
    app.setAsDefaultProtocolClient('luckydangle', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('charmlet');
  app.setAsDefaultProtocolClient('luckydangle');
}

let mainWindow = null;
let tray = null;

// Preferences storage
const prefsPath = path.join(app.getPath('userData'), 'charmlet-prefs.json');
let prefs = {
  charmId: 'clover',
  charmWidth: 90,
  ropeLength: 100,
  anchorX: 0.82,
  sound: true,
  onTop: true,
  visible: true,
};

try {
  if (fs.existsSync(prefsPath)) {
    const data = JSON.parse(fs.readFileSync(prefsPath, 'utf8'));
    prefs = { ...prefs, ...data };
  }
} catch (e) {
  console.error('Error reading preferences:', e);
}

function savePrefs() {
  try {
    fs.writeFileSync(prefsPath, JSON.stringify(prefs, null, 2), 'utf8');
  } catch (e) {
    console.error('Error saving preferences:', e);
  }
}

// Catalogue of 20 charms matching macOS exactly
const CHARMS = [
  { id: 'nazar', name: 'Nazar boncuğu' },
  { id: 'murugar', name: 'Murugar' },
  { id: 'karuppu', name: 'Karuppu' },
  { id: 'nimbu', name: 'Nimbu-mirchi' },
  { id: 'drishti', name: 'Drishti bommai' },
  { id: 'om', name: 'Om' },
  { id: 'ghanta', name: 'Ghanta' },
  { id: 'peacock', name: 'Peacock' },
  { id: 'elephant', name: 'Elephant' },
  { id: 'hamsa', name: 'Hamsa' },
  { id: 'panchang', name: 'Páncháng jié' },
  { id: 'horseshoe', name: 'Horseshoe' },
  { id: 'clover', name: 'Four-leaf clover' },
  { id: 'maneki', name: 'Maneki-neko' },
  { id: 'daruma', name: 'Daruma' },
  { id: 'scarab', name: 'Scarab' },
  { id: 'ladybug', name: 'Ladybug' },
  { id: 'dreamcatcher', name: 'Dreamcatcher' },
  { id: 'bamboo', name: 'Lucky bamboo' },
  { id: 'himmeli', name: 'Himmeli' },
];

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { x, y, width, height } = primaryDisplay.bounds;

  mainWindow = new BrowserWindow({
    x,
    y,
    width,
    height,
    frame: false,
    transparent: true,
    hasShadow: false,
    alwaysOnTop: prefs.onTop,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    focusable: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false,
      contextIsolation: false,
      nodeIntegration: false,
    },
  });

  // Start with mouse events ignored so clicks pass through immediately to whatever is underneath
  mainWindow.setIgnoreMouseEvents(true, { forward: true });

  const webRoot = path.join(__dirname, 'web');
  const charmHtml = path.join(webRoot, 'charm.html');
  const query = new URLSearchParams({
    charm: prefs.charmId,
    width: prefs.charmWidth.toString(),
    length: prefs.ropeLength.toString(),
    anchorX: prefs.anchorX.toString(),
    muted: prefs.sound ? '0' : '1',
  });

  mainWindow.loadURL(`file://${charmHtml}?${query.toString()}`);

  if (!prefs.visible) {
    mainWindow.hide();
  } else {
    mainWindow.showInactive();
  }

  // Handle display changes
  screen.on('display-metrics-changed', () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const disp = screen.getPrimaryDisplay();
    mainWindow.setBounds(disp.bounds);
  });
}

function handleUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    const action = url.hostname || url.pathname.replace(/^\/\//, '').split('/')[0];
    if (action === 'bless') {
      performBless();
    } else if (action === 'ritual') {
      performRitual();
    } else if (action === 'flick') {
      flickIt();
    } else if (action === 'charm') {
      const parts = url.pathname.split('/').filter(Boolean);
      const charmId = parts[parts.length - 1] || url.searchParams.get('id');
      if (charmId) selectCharm(charmId);
    }
  } catch (e) {
    console.error('Error handling URL:', rawUrl, e);
  }
}

app.on('second-instance', (event, commandLine) => {
  const url = commandLine.find(arg => arg.startsWith('charmlet://') || arg.startsWith('luckydangle://'));
  if (url) {
    handleUrl(url);
  }
});

function createTray() {
  let iconPath = path.join(__dirname, 'assets', 'Charmlet.ico');
  if (!fs.existsSync(iconPath)) {
    iconPath = path.join(__dirname, '..', 'assets', 'Charmlet.ico');
  }

  const trayIcon = nativeImage.createFromPath(iconPath);
  tray = new Tray(trayIcon);
  tray.setToolTip('Charmlet — Desktop Charm');

  updateTrayMenu();

  tray.on('double-click', () => {
    performRitual();
  });
}

function updateTrayMenu() {
  if (!tray) return;

  const currentCharm = CHARMS.find((c) => c.id === prefs.charmId) || CHARMS[12];

  const charmMenuItems = CHARMS.map((c) => ({
    label: c.name,
    type: 'radio',
    checked: c.id === prefs.charmId,
    click: () => selectCharm(c.id),
  }));

  const sizeMenuItems = [
    { label: 'Compact (90 px)', width: 90 },
    { label: 'Small (115 px)', width: 115 },
    { label: 'Medium (158 px)', width: 158 },
    { label: 'Large (200 px)', width: 200 },
  ].map((s) => ({
    label: s.label,
    type: 'radio',
    checked: Math.abs(prefs.charmWidth - s.width) < 14,
    click: () => selectSize(s.width),
  }));

  const lengthMenuItems = [
    { label: 'Compact (100 px)', length: 100 },
    { label: 'Short (140 px)', length: 140 },
    { label: 'Normal (170 px)', length: 170 },
    { label: 'Long (250 px)', length: 250 },
  ].map((l) => ({
    label: l.label,
    type: 'radio',
    checked: Math.abs(prefs.ropeLength - l.length) < 20,
    click: () => selectLength(l.length),
  }));

  const positionMenuItems = [
    { label: 'Far Left (15%)', anchorX: 0.15 },
    { label: 'Left (30%)', anchorX: 0.30 },
    { label: 'Center (50%)', anchorX: 0.50 },
    { label: 'Right (82%)', anchorX: 0.82 },
    { label: 'Far Right (92%)', anchorX: 0.92 },
  ].map((p) => ({
    label: p.label,
    type: 'radio',
    checked: Math.abs(prefs.anchorX - p.anchorX) < 0.05,
    click: () => selectPosition(p.anchorX),
  }));

  let openAtLogin = false;
  try {
    openAtLogin = app.getLoginItemSettings().openAtLogin;
  } catch (_) {}

  const contextMenu = Menu.buildFromTemplate([
    {
      label: currentCharm.name,
      enabled: false,
    },
    { type: 'separator' },
    {
      label: prefs.visible ? 'Hide Charm' : 'Show Charm',
      accelerator: 'Ctrl+Shift+D',
      click: () => toggleVisible(),
    },
    {
      label: 'Perform Ritual',
      accelerator: 'Ctrl+Shift+S',
      click: () => performRitual(),
    },
    {
      label: 'Flick It',
      accelerator: 'Ctrl+Shift+F',
      click: () => flickIt(),
    },
    { type: 'separator' },
    {
      label: 'Charm',
      submenu: [
        ...charmMenuItems,
        { type: 'separator' },
        { label: 'Next Charm', click: () => cycleCharm(1) },
        { label: 'Previous Charm', click: () => cycleCharm(-1) },
      ],
    },
    {
      label: 'Charm Size',
      submenu: sizeMenuItems,
    },
    {
      label: 'Rope Length',
      submenu: lengthMenuItems,
    },
    {
      label: 'Screen Position',
      submenu: positionMenuItems,
    },
    { type: 'separator' },
    {
      label: 'Sound Effects',
      type: 'checkbox',
      checked: prefs.sound,
      click: (item) => toggleSound(item.checked),
    },
    {
      label: 'Float on Top',
      type: 'checkbox',
      checked: prefs.onTop,
      click: (item) => toggleOnTop(item.checked),
    },
    {
      label: 'Launch at Startup',
      type: 'checkbox',
      checked: openAtLogin,
      click: (item) => {
        try {
          app.setLoginItemSettings({ openAtLogin: item.checked });
        } catch (_) {}
        updateTrayMenu();
      },
    },
    { type: 'separator' },
    {
      label: 'Exit Charmlet',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

function selectCharm(id) {
  prefs.charmId = id;
  savePrefs();
  mainWindow?.webContents.executeJavaScript(`window.charmlet?.setCharm('${id}')`);
  updateTrayMenu();
}

function cycleCharm(step) {
  const ids = CHARMS.map((c) => c.id);
  const idx = ids.indexOf(prefs.charmId);
  const nextId = ids[(idx + step + ids.length) % ids.length];
  selectCharm(nextId);
}

function selectSize(width) {
  prefs.charmWidth = width;
  savePrefs();
  mainWindow?.webContents.executeJavaScript(`window.charmlet?.setSize(${width})`);
  updateTrayMenu();
}

function selectLength(len) {
  prefs.ropeLength = len;
  savePrefs();
  mainWindow?.webContents.executeJavaScript(`window.charmlet?.setLength(${len})`);
  updateTrayMenu();
}

function selectPosition(anchorX) {
  prefs.anchorX = anchorX;
  savePrefs();
  mainWindow?.webContents.executeJavaScript(`window.charmlet?.setAnchor(${anchorX}, 0)`);
  updateTrayMenu();
}

function toggleSound(on) {
  prefs.sound = on;
  savePrefs();
  mainWindow?.webContents.executeJavaScript(`window.charmlet?.setSound(${on})`);
  updateTrayMenu();
}

function toggleOnTop(on) {
  prefs.onTop = on;
  savePrefs();
  mainWindow?.setAlwaysOnTop(on);
  updateTrayMenu();
}

function toggleVisible() {
  prefs.visible = !prefs.visible;
  savePrefs();
  if (prefs.visible) {
    mainWindow?.showInactive();
    mainWindow?.webContents.executeJavaScript(`window.charmlet?.setVisible(true)`);
  } else {
    mainWindow?.webContents.executeJavaScript(`window.charmlet?.setVisible(false)`);
    mainWindow?.hide();
  }
  updateTrayMenu();
}

function performRitual() {
  if (!prefs.visible) toggleVisible();
  mainWindow?.webContents.executeJavaScript(`window.charmlet?.ritual()`);
}

function flickIt() {
  if (!prefs.visible) toggleVisible();
  mainWindow?.webContents.executeJavaScript(`window.charmlet?.flick()`);
}

function performBless() {
  if (!prefs.visible) toggleVisible();
  mainWindow?.webContents.executeJavaScript(`window.charmlet?.bless()`);
}

ipcMain.on('set-ignore-mouse-events', (event, ignore, options) => {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.setIgnoreMouseEvents(ignore, options);
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  try {
    globalShortcut.register('CommandOrControl+Shift+D', () => toggleVisible());
    globalShortcut.register('CommandOrControl+Shift+S', () => performRitual());
    globalShortcut.register('CommandOrControl+Shift+F', () => flickIt());
  } catch (e) {
    console.error('Error registering global shortcuts:', e);
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', (e) => {
  // Never quit when window closes
  e.preventDefault();
});
