var $ = jQuery = require("./libs/jquery/jquery.js");
var $ui = require("./libs/jquery/jquery-ui.js");

function DWorkspace(opts) {
  let self = this;
  this.$el = $('<div class="dworkspace"></div>');
  $('.ddesktop').append(this.$el);

  this.createWindow = function(opts) {
    let win = new DWindow(opts);
    this.$el.append(win.$el);

    win.$el.resizable({
      containment: 'parent'
    });

    win.$el.draggable({
      handle:'.title'
    });

    win.$el.on('click', '.close', function(evt) {
      win.$el.remove();
    });

    win.$el.on('click', '.clone', function(evt) {
      self.createWindow();
    });

  };
}

function DWindow(opts) {
  let self = this;
  this.$el = $(`
    <div class="dwindow">
      <div class="header">
        <span class="close">X</span>
        <span class="clone">C</span>
        <span class="title">untitled</span>
        <span class="address"><input type="text"/></span>
      </div>
      <div class="content">
      </div>
    </div>
  `);

  this.$el.on('change', '.address', function(evt) {
    let val = $(evt.target).val();
    self.loadContentURL(val);
  });

  this.loadContentURL = function(url) {
    let ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36';
    let wv = document.createElement('webview');

    wv.addEventListener('did-start-loading', function() {
    });

    wv.addEventListener('did-stop-loading', function() {
    });

    self.$el.find('.content').html(wv);
  };
}
