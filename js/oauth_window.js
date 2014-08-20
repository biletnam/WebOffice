OAuthWindow = (function() {

  /**
   * Creates a oAuth dialog given a set of parameters.
   *
   *    var oauth = new OAuthWindow(
   *      elementContainer,
   *      'https://accounts.google.com/o/oauth2/auth',
   *      {
   *        response_type: 'code',
   *        client_id: 'xxx',
   *        scope: 'https://www.googleapis.com/auth/calendar',
   *        redirect_uri: 'xxx',
   *        state: 'foobar',
   *        access_type: 'offline',
   *        approval_prompt: 'force'
   *      }
   *    );
   *
   *    oauth.oncomplete = function(evt) {
   *      if (evt.detail.code) {
   *        // success
   *      }
   *    };
   *
   *    oauth.onabort = function() {
   *      // oauth was aborted
   *    };
   *
   *
   */

  function OAuthWindow(container, server, location, params) {
    if (!params.redirect_uri) {
      throw new Error(
        'must provide params.redirect_uri so oauth flow can complete'
      );
    }

    this.params = {};
    for (var key in params) {
      this.params[key] = params[key];
    }

    this._element = container;

    this.target = location;

    this._handleUserTriggeredClose =
      this._handleUserTriggeredClose.bind(this);
  }

  OAuthWindow.prototype = {
    /*__proto__: Calendar.View.prototype,*/

    get element() {
      return this._element;
    },

    get isOpen() {
      return !!this.browserFrame;
    },

    selectors: {
      browserTitle: '.url_name',
      browerCancelButton: '.fa.fa-times.cancel',
      browserContainer: '.modal-body'
    },

    get browserContainer() {
      return this._findElement('browserContainer', this.element);
    },

    get browserTitle() {
      return this._findElement('browserTitle', this.element);
    },

    get browerCancelButton() {
      return this._findElement('browerCancelButton', this.element);
    },

    _findElement: function(name, all, element) {
      if (typeof(all) === 'object') {
        element = all;
        all = false;
      }

      element = element || document;

      var cacheName;
      var selector;

      if (typeof(all) === 'undefined') {
        all = false;
      }

      if (name in this.selectors) {
        cacheName = '_' + name + 'Element';
        selector = this.selectors[name];

        if (!this[cacheName]) {
          if (all) {
            this[cacheName] = element.querySelectorAll(selector);
          } else {
            this[cacheName] = element.querySelector(selector);
          }
        }

        return this[cacheName];
      }

      return null;
    },
    _handleFinalRedirect: function(url) {
      this.close();

      if (this.oncomplete) {
        var params;

        // find query string
        var queryStringIdx = url.indexOf('?');
        if (queryStringIdx !== -1) {
          params = QueryString.parse(url.slice(queryStringIdx + 1));
          console.log(params)
        }

        this.oncomplete(params || {});
      }
    },

    cancel: function(event) {
      if (event) {
        event.preventDefault();
      }

      window.back();
    },
    _handleLocationChange: function(url) {
      this.browserTitle.textContent = url;
    },

    _handleUserTriggeredClose: function() {
      // close the oauth flow
      this.close();

      // trigger an event so others can cleanup
      this.onabort && this.onabort();
    },

    handleEvent: function(event) {
      switch (event.type) {
        case 'mozbrowserlocationchange':
          var url = event.detail;
          if (url.indexOf(this.params.redirect_uri) === 0) {
            return this._handleFinalRedirect(url);
          }
          this._handleLocationChange(url);
          break;
      }
    },

    open: function() {
      if (this.browserFrame) {
        throw new Error('attempting to open frame while another is open');
      }

      // add the active class
      /*this.element.classList.add(Calendar.View.ACTIVE);*/

      // handle cancel events
      this.browerCancelButton.addEventListener(
        'click', this._handleUserTriggeredClose
      );

      // setup browser iframe
      var iframe = this.browserFrame =
        document.createElement('iframe');

      iframe.setAttribute('mozbrowser', true);
      iframe.setAttribute('src', this.target);
      iframe.setAttribute('width', '100%');
      iframe.setAttribute('height', '100%');
      iframe.setAttribute('frameborder', '1');
      iframe.setAttribute('scrolling', 'no');

      this.browserContainer.appendChild(iframe);

      iframe.addEventListener('mozbrowserlocationchange', this);
    },

    close: function() {
      if (!this.isOpen)
        return;

      this.browserFrame.removeEventListener(
        'mozbrowserlocationchange', this
      );

      this.browerCancelButton.removeEventListener(
        'click', this._handleUserTriggeredClose
      );

      /*this.element.classList.remove(Calendar.View.ACTIVE);*/

      this.browserFrame.parentNode.removeChild(
        this.browserFrame
      );

      this.browserFrame = undefined;
    }
  };

  return OAuthWindow;
}());

QueryString = (function() {
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.

  // Query String Utilities
  var QueryString = {};


  // If obj.hasOwnProperty has been overridden, then calling
  // obj.hasOwnProperty(prop) will break.
  // See: https://github.com/joyent/node/issues/1707
  function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }


  function charCode(c) {
    return c.charCodeAt(0);
  }


  // a safe fast alternative to decodeURIComponent
  QueryString.unescapeBuffer = function(s, decodeSpaces) {
    var out = new Buffer(s.length);
    var state = 'CHAR'; // states: CHAR, HEX0, HEX1
    var n, m, hexchar;

    for (var inIndex = 0, outIndex = 0; inIndex <= s.length; inIndex++) {
      var c = s.charCodeAt(inIndex);
      switch (state) {
        case 'CHAR':
          switch (c) {
            case charCode('%'):
              n = 0;
              m = 0;
              state = 'HEX0';
              break;
            case charCode('+'):
              if (decodeSpaces) c = charCode(' ');
              // pass thru
            default:
              out[outIndex++] = c;
              break;
          }
          break;

        case 'HEX0':
          state = 'HEX1';
          hexchar = c;
          if (charCode('0') <= c && c <= charCode('9')) {
            n = c - charCode('0');
          } else if (charCode('a') <= c && c <= charCode('f')) {
            n = c - charCode('a') + 10;
          } else if (charCode('A') <= c && c <= charCode('F')) {
            n = c - charCode('A') + 10;
          } else {
            out[outIndex++] = charCode('%');
            out[outIndex++] = c;
            state = 'CHAR';
            break;
          }
          break;

        case 'HEX1':
          state = 'CHAR';
          if (charCode('0') <= c && c <= charCode('9')) {
            m = c - charCode('0');
          } else if (charCode('a') <= c && c <= charCode('f')) {
            m = c - charCode('a') + 10;
          } else if (charCode('A') <= c && c <= charCode('F')) {
            m = c - charCode('A') + 10;
          } else {
            out[outIndex++] = charCode('%');
            out[outIndex++] = hexchar;
            out[outIndex++] = c;
            break;
          }
          out[outIndex++] = 16 * n + m;
          break;
      }
    }

    // TODO support returning arbitrary buffers.

    return out.slice(0, outIndex - 1);
  };


  QueryString.unescape = function(s, decodeSpaces) {
    return QueryString.unescapeBuffer(s, decodeSpaces).toString();
  };


  QueryString.escape = function(str) {
    return encodeURIComponent(str);
  };

  var stringifyPrimitive = function(v) {
    switch (typeof v) {
      case 'string':
        return v;

      case 'boolean':
        return v ? 'true' : 'false';

      case 'number':
        return isFinite(v) ? v : '';

      default:
        return '';
    }
  };


  QueryString.stringify = QueryString.encode = function(obj, sep, eq, name) {
    sep = sep || '&';
    eq = eq || '=';
    if (obj === null) {
      obj = undefined;
    }

    if (typeof obj === 'object') {
      return Object.keys(obj).map(function(k) {
        var ks = QueryString.escape(stringifyPrimitive(k)) + eq;
        if (Array.isArray(obj[k])) {
          return obj[k].map(function(v) {
            return ks + QueryString.escape(stringifyPrimitive(v));
          }).join(sep);
        } else {
          return ks + QueryString.escape(stringifyPrimitive(obj[k]));
        }
      }).join(sep);

    }

    if (!name) return '';
    return QueryString.escape(stringifyPrimitive(name)) + eq +
           QueryString.escape(stringifyPrimitive(obj));
  };

  // Parse a key=val string.
  QueryString.parse = QueryString.decode = function(qs, sep, eq, options) {
    sep = sep || '&';
    eq = eq || '=';
    var obj = {};

    if (typeof qs !== 'string' || qs.length === 0) {
      return obj;
    }

    var regexp = /\+/g;
    qs = qs.split(sep);

    var maxKeys = 1000;
    if (options && typeof options.maxKeys === 'number') {
      maxKeys = options.maxKeys;
    }

    var len = qs.length;
    // maxKeys <= 0 means that we should not limit keys count
    if (maxKeys > 0 && len > maxKeys) {
      len = maxKeys;
    }

    for (var i = 0; i < len; ++i) {
      var x = qs[i].replace(regexp, '%20'),
          idx = x.indexOf(eq),
          kstr, vstr, k, v;

      if (idx >= 0) {
        kstr = x.substr(0, idx);
        vstr = x.substr(idx + 1);
      } else {
        kstr = x;
        vstr = '';
      }

      try {
        k = decodeURIComponent(kstr);
        v = decodeURIComponent(vstr);
      } catch (e) {
        k = QueryString.unescape(kstr, true);
        v = QueryString.unescape(vstr, true);
      }

      if (!hasOwnProperty(obj, k)) {
        obj[k] = v;
      } else if (Array.isArray(obj[k])) {
        obj[k].push(v);
      } else {
        obj[k] = [obj[k], v];
      }
    }

    return obj;
  };

  return QueryString;
}());

