$(function () {
  window.workspace = new DWorkspace();

  $('body').on('click', '.create-window', function() {
    window.workspace.createWindow();
  });

});
