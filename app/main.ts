import { BrowserWindow, Notification as ENotification, Menu, Tray, app, clipboard, ipcMain, shell } from 'electron';
import * as path from 'path';
import * as url from 'url';
import packageJson from '../package.json';
import { loadRecords, saveRecords } from './lib/storage.js';
import { processUrl } from './lib/vault.js';
import { verifyAddress, verifyXpub } from './lib/verify-address.js';

if (process.platform != 'win32') {
    const AutoLaunch = require('auto-launch');

    let autoLaunch = new AutoLaunch({
        name: 'Branta',
        path: app.getPath('exe'),
        isHidden: true
    });

    autoLaunch.isEnabled().then((_isEnabled: boolean) => {
        autoLaunch.enable();
    });

    if (process.defaultApp) {
        if (process.argv.length >= 2) {
          app.setAsDefaultProtocolClient('branta', process.execPath, [path.resolve(process.argv[1])]);
        }
    } else {
        app.setAsDefaultProtocolClient('branta');
    }
}

let mainWindow: any;

function kickoffClipboard() {
    let previousText: string | null = null;

    setInterval(() => {
        const currentText = clipboard.readText();
        if (currentText != previousText) {
            previousText = currentText;
            mainWindow.webContents.send('clipboard-updated', currentText);
        }
    }, 300);
}

function openUrl(url: string) {
    shell.openExternal(url);
}

let isForceQuit = false;

function forceQuit() {
    isForceQuit = true;
    app.quit();
}

function getByPlatform(options: any, defaultValue = undefined) {
    switch (process.platform) {
        case 'win32':
            return options.windows ?? defaultValue;
        case 'darwin':
            return options.macos ?? defaultValue;
        case 'linux':
            return options.linux ?? defaultValue;
        default:
            return defaultValue;
    }
}

function getTrayIcon() {
    let file;
    switch (process.platform) {
        case 'win32':
            file = 'icon.ico';
            break;
        case 'darwin':
            file = 'tray-mac.png';
            break;
        default:
            file = 'icon.png';
            break;
    }

    return getIcon(file);
}

function getIcon(file: string) {
    return process.env['APP_DEV'] ? path.join(__dirname, 'resources', file) : path.join(process.resourcesPath, file);
}

function createWindow() {
    const icon = getIcon('icon.png');

    mainWindow = new BrowserWindow({
        title: 'Branta',
        width: 700,
        minWidth: 700,
        height: 620,
        minHeight: 620,
        show: false,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#1b1b1b',
            symbolColor: '#ffffff',
            height: getByPlatform({
                linux: 40,
            })
        },
        autoHideMenuBar: true,
        backgroundColor: '#1b1b1b',
        icon,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
        }
    });

    var splash = new BrowserWindow({
        width: 691,
        height: 483,
        transparent: true,
        frame: false,
        alwaysOnTop: true,
        show: false
    });

    splash.loadFile('./resources/splash.html');

    splash.show();

    if (process.env['APP_DEV']) {
        mainWindow.loadURL('http://localhost:4200');
    } else {
        mainWindow.loadURL(
            url.format({
                pathname: path.join(__dirname, `../../dist/branta/browser/index.html`),
                protocol: 'file:',
                slashes: true
            })
        );
    }

    ipcMain.handle('show-notification', (_event, title, body) => {
        new ENotification({
            title,
            body,
            icon
        }).show();
    });

    ipcMain.handle('verify-address', (_event, wallets, address) => {
        return verifyAddress(wallets, address);
    });

    ipcMain.handle('verify-xpub', (_event, xpub) => {
        return verifyXpub(xpub);
    });

    ipcMain.handle('store-data', async (_event, name, data) => {
        saveRecords(name, data);
        return true;
    });

    ipcMain.handle('retrieve-data', async (_event, name) => {
        return loadRecords(name);
    });

    ipcMain.handle('open-url', async (_event, url) => openUrl(url));

    mainWindow.on('closed', function() {
        mainWindow = null;
    });

    mainWindow.on('close', (event: any) => {
        if (process.platform == 'linux') {
            app.quit();
            return;
        }

        if (!isForceQuit) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    mainWindow.webContents.once('dom-ready', () => {
        splash.close();

        if (!process.argv.includes('headless')) {
            mainWindow.show();
            processUrl(mainWindow, process.argv);
        }

        kickoffClipboard();
    });

    if (process.platform != 'linux') {
        let tray = new Tray(getTrayIcon());

        const contextMenu = Menu.buildFromTemplate([
            { label: 'Open', type: 'normal', click: () => mainWindow.show() },
            { label: 'Help', type: 'normal', click: () => openUrl('https://docs.branta.pro') },
            { label: '', type: 'separator' },
            { label: 'Quit', type: 'normal', click: forceQuit },
            { label: `Version ${packageJson.version}`, type: 'normal', enabled: false }
        ]);

        tray.setToolTip(packageJson.productName);
        tray.setContextMenu(contextMenu);

        tray.on('click', () => {
            mainWindow.show();
        });
    }
}

app.setAppUserModelId('Branta');

const gotTheLock = app.requestSingleInstanceLock();

if (process.platform == 'linux' ||
   process.platform === 'darwin') {
    app.on('open-url', (event, url) => {
        processUrl(mainWindow, [url]);
    });
}

if (!gotTheLock) {
    isForceQuit = true;
    app.quit();
} else {
    app.on('second-instance', (_event, _commandLine, _workingDirectory) => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.show();
            mainWindow.focus();
            processUrl(mainWindow, _commandLine);
        }
    });

    app.on('ready', createWindow);

    app.on('window-all-closed', function() {
        if (process.platform !== 'darwin') app.quit();
    });

    app.on('activate', function() {
        if (mainWindow === null) {
          createWindow();
        }
        else if (process.platform == 'darwin') {
          mainWindow.show();
        }
    });

    app.on('before-quit', (e) => {
        if (process.platform === 'darwin') {
            app.quit();
        }
    });
}
