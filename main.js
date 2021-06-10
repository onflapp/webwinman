const {app, BrowserWindow} = require('electron');
const path = require('path');

let mainWindow = null;

//app.userAgentFallback = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36';

function procserver() {
  const WebSocketServer = require('websocket').server;
  const http = require('http');
  const Pty = require("node-pty");
  const port = 4000;

  let server = http.createServer();

  let wsServer = new WebSocketServer({
    httpServer: server
  });

  wsServer.on('request', function(request) {
    console.log('req');
    let connection = request.accept(null, request.origin);
    let ptty = Pty.spawn("bash", [], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: process.env.PWD,
      env: process.env
    });

    ptty.on('exit', function(code, signal) {
      console.log('process exit');
    });

    ptty.on('data', function(data) {
      connection.send(data);
    });

    connection.on('message', function(message) {
      let str = message.utf8Data;
      let i = str.indexOf('^[[');
      if (i != -1) {
        let a = str.match(/\^\[\[(\d+),(\d+)/);
        ptty.resize(Number.parseInt(a[1]), Number.parseInt(a[2]));
        str = str.replace(a[0], '');
      }

      if (str) {
        ptty.write(str);
      }
    });

    connection.on('close', function(reasonCode, description) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
  });

  server.listen(port, function() {
    console.log('Server is listening on port ' + port);
  });
}

function webserver() {
  const express = require('express');
  const app = express();
  const port = 3000;

  app.get('/', (req, res) => {
    res.send('Hello World!');
  });

  app.use('/', express.static(__dirname));

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  })
}

function initialize () {
  makeSingleInstance();

  function createWindow () {
    const windowOptions = {
      width: 1080,
      minWidth: 680,
      height: 840,
      title: app.getName(),
      webPreferences: {
        nodeIntegration: true,
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
    mainWindow.loadURL(path.join('file://', __dirname, '/client/index.html'));

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.on('ready', () => {
    createWindow();
  });

  app.on('window-all-closed', () => {
    app.quit();
  });

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
}

// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance () {
  if (process.mas) return;

  app.requestSingleInstanceLock();

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  })
}

initialize();
webserver();
procserver();
