const { ipcRenderer } = require('electron');

window.initActionCapture = function() {
  ipcRenderer.send('init-action-capture', '');
};
