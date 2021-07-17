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

module.exports = {
  name: 'ProcessServer',
  start: function() {
    server.listen(port, function() {
      console.log('[ProcessServer] ws://localhost:' + port);
    });
  }
};
