const {app, BrowserWindow, webContents, ipcMain, session} = require('electron');
const path = require('path');
const express = require('express');
const server = express();
const port = 5000;

let mainWindow = null;

function makeServer() {
  server.get('/', (req, res) => {
    res.send('Hello World!');
  });
}

function makeSingleInstance() {
  if (process.mas) return;

  app.requestSingleInstanceLock();

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  })
}

function createDisplay() {
  const windowOptions = {
    width: 1080,
    minWidth: 680,
    height: 840,
    title: app.getName(),
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true
    }
    /*
    webPreferences: {
      nodeIntegration: false,
      enableRemoteModule: false,
      worldSafeExecuteJavaScript: true,
      contextIsolation: true,
      webviewTag: true
    }
    */
  };

  mainWindow = new BrowserWindow(windowOptions);
  mainWindow.loadURL('http://localhost:3000/applications/Desktop/index.html');

  mainWindow.webContents.on('will-navigate', function(e, url) {
    console.log('xxxxxxxxxxxxx');
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function initialize () {
  makeSingleInstance();
  makeServer();

  app.on('ready', () => {
    createDisplay();
  });

  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('activate', () => {
    if (mainWindow === null) {
      createDisplay();
    }
  });

  ipcMain.on('init-action-capture', function (evt, arg) {
    for (let wc of webContents.getAllWebContents()) {
      wc.on('will-navigate', function(evt, url) {
        console.log(url);
        //evt.preventDefault();
      });
    }
  });

  server.listen(port, () => {
    console.log('[DisplayServer] http://localhost:' + port);
  });
}


module.exports = {
  name: 'DisplayServer',
  start: function() {
    initialize();
  }
};
