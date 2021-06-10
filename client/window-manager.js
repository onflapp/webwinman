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
      containment: 'parent',
      start: function(evt, ui) {
        self.$el.find('.content').hide();
      },
      stop: function(evt, ui) {
        self.$el.find('.content').show();
      }
    });

    win.$el.draggable({
      handle:'.title',
      start: function(evt, ui) {
        self.$el.find('.content').hide();
      },
      stop: function(evt, ui) {
        self.$el.find('.content').show();
      }
    });

    win.$el.on('click', '.close', function(evt) {
      win.$el.remove();
    });

    win.$el.on('click', '.clone', function(evt) {
      self.createWindow();
    });

  };

  this.toJSON = function() {
    let windows = [];
    self.$el.find('.dwindow').each(function (n, it) {
      windows.push({
        position: $(it).position(),
        size: {
          width: $(it).width(),
          height: $(it).height()
        },
        href: $(it).find('webview').attr('src')
      });
    });

    return windows;
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

  if (opts) {
    if (opts['size']) {
      this.$el.width(opts.size.width);
      this.$el.height(opts.size.height);
    }
    if (opts['position']) {
      this.$el.offset(opts.position);
    }
    if (opts['href']) {
      requestAnimationFrame(function() {
        self.loadContentURL(opts.href);
      });
    }
  }

  this.$el.on('change', '.address', function(evt) {
    let val = $(evt.target).val();
    self.loadContentURL(val);
  });

  this.loadContentURL = function(url) {
    let ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36';

    self.$el.find('.content').html(`
      <webview useragent="${ua}" src="${url}"></webview>
    `);

    let wv = self.$el.find('webview')[0];
    
    wv.addEventListener('did-start-loading', function() {
      self.$el.find('.address input').val(wv.src);
      self.$el.find('.title').html('loading...');
    });

    wv.addEventListener('did-stop-loading', function(evt) {
      self.$el.find('.title').html(wv.getTitle());
    });

  };
}
