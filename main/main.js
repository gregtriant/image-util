/* eslint-disable @typescript-eslint/no-unused-vars */
import { app, BrowserWindow, dialog } from 'electron';
import path, { join } from 'path';
import { fileURLToPath } from 'url';
import serve from 'electron-serve';
import { ipcMain } from 'electron';
import { readImagesAndVideos, compressFiles, compressFile, replaceOriginalsWithCompressed, copyRestToOutput } from './file-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('directory-name 👉️', __dirname);

const appServe = app.isPackaged ? serve({ directory: join(__dirname, '../vite-out') }) : null;

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1300,
        height: 900,
        icon: path.join(__dirname, '..', 'public/images/icon.png'),

        webPreferences: {
            preload: path.join(__dirname, 'preload.mjs'),
            nodeIntegration: true, // Make sure to enable nodeIntegration for Next.js
            contextIsolation: true,
            contentSecurityPolicy: "script-src 'self' https://api-free.deepl.com/v2/*",
        },
    });

    if (app.isPackaged) {
        console.log('>> App is packaged!!!');
        appServe(mainWindow).then(() => {
            mainWindow.loadURL('app://-');
        });
    } else {
        mainWindow.loadURL('http://localhost:5000');
        mainWindow.webContents.openDevTools();
        mainWindow.webContents.on('did-fail-load', (e, code, desc) => {
            mainWindow.webContents.reloadIgnoringCache();
        });
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', () => {
    createWindow();
});

app.on('window-all-closed', () => {
    // eslint-disable-next-line no-undef
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// ------------------ Main process Listeners ----------------------- //
ipcMain.on('folder-selected', async (event, dir) => {
    // console.log(dir);
    const res = readImagesAndVideos(dir);
    console.log(res);
    event.reply('folder-selected-result', res);
});

ipcMain.on('folder-selected-compressed', async (event, dir) => {
    // console.log(dir);
    const res = readImagesAndVideos(dir);
    console.log(res);
    event.reply('folder-selected-compressed-result', res);
});

ipcMain.on('compress-files', async (event, args) => {
    // console.log(dir);
    const {dir, files} = args;
    const res = compressFiles(dir, files);
    event.reply('compress-files-result', res);
});

ipcMain.on('compress-file', async (event, args) => {
    // console.log(dir);
    const {dir, outputDir, file, index} = args;
    const res = compressFile(dir, outputDir, file.name);
    if (res) {
        const reply = {
            success: true,
            filename: file.name,
            index: index
        }
        event.reply('compress-file-result', reply);
    } else {
        event.reply('compress-file-result', false);
    }
});

ipcMain.on('replace-originals-with-compressed', async (event, dir) => {
    console.log(dir);
    const res = replaceOriginalsWithCompressed(dir);
    console.log(res);
    event.reply('replace-originals-with-compressed-result', res);
});

ipcMain.on('open-select-directory', async (event, args) => {
    // args is "input" or "output"
    const dir = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });
    // console.log(dir);
    const reply = {
        type: args,
        path: '',
    }
    if (dir.filePaths.length > 0) {
        reply.path = dir.filePaths[0];
    }
    event.reply('open-select-directory-result', reply);
});

ipcMain.on('copy-rest-to-output', async (event, args) => {
    const { inputDir, outputDir } = args;
    const reply = copyRestToOutput(inputDir, outputDir);
    event.reply('copy-rest-to-output-result', reply);
});