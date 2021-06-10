function SaveWorkspace() {
  let cfg = window.workspace.toJSON();
  if (cfg) {
    localStorage.setItem('workspace', JSON.stringify(cfg));
  }
}

function RestoreWorkspace() {
  let cfg = localStorage.getItem('workspace');
  if (cfg) {
    cfg = JSON.parse(cfg);
    $(cfg).each(function(n, it) {
      window.workspace.createWindow(it);
    });
  }
}

$(function () {
  window.workspace = new DWorkspace();
  RestoreWorkspace();

  $('body').on('click', '.create-window', function() {
    window.workspace.createWindow();
  });

  $('body').on('resizestop', '.dwindow', function(evt, ui) {
    SaveWorkspace();
  });

  $('body').on('dragstop', '.dwindow', function(evt, ui) {
    SaveWorkspace();
  });
});
