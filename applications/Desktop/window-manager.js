function DWindowToJSON(el) {
  let $el = $(el);
  return {
    position: $el.position(),
    size: {
      width: $el.width(),
      height: $el.height()
    },
    href: $el.find('webview').attr('src')
  };
}

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
      let win = $(evt.target).parents('.dwindow')[0];
      let opts = DWindowToJSON(win);
      opts.position.left += 30;
      opts.position.top += 30;
      self.createWindow(opts);
    });

    win.$el.on('mousedown', '.title', function(evt) {
      let $win = $(evt.target).parents('.dwindow');
      $win.parent().children().each(function (n, it) {
        $(it).css('z-index', '');
      });
      $win.css('z-index', '1');
    });

  };

  this.toJSON = function() {
    let windows = [];
    self.$el.find('.dwindow').each(function (n, it) {
      windows.push(
        DWindowToJSON(it)
      );
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
        <span class="back">B</span>
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

  this.$el.on('click', '.back', function(evt) {
    let wv = self.$el.find('webview')[0];
    wv.goBack();
  });

  this.loadContentURL = function(url) {
    let ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:88.0) Gecko/20100101 Firefox/88.0';

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

    wv.addEventListener('console-message', function(evt) {
      console.log('Guest page logged a message:', evt.message);
    });

    wv.addEventListener('new-window', function(evt) {
      console.log('new window');
      wv.loadURL(evt.url);
    });

    wv.addEventListener('close', function(evt) {
      console.log('close window');
    });

    window.initActionCapture();
  };
}
