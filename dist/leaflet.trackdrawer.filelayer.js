(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(_dereq_,module,exports){
function corslite(url, callback, cors) {
    var sent = false;

    if (typeof window.XMLHttpRequest === 'undefined') {
        return callback(Error('Browser not supported'));
    }

    if (typeof cors === 'undefined') {
        var m = url.match(/^\s*https?:\/\/[^\/]*/);
        cors = m && (m[0] !== location.protocol + '//' + location.hostname +
                (location.port ? ':' + location.port : ''));
    }

    var x = new window.XMLHttpRequest();

    function isSuccessful(status) {
        return status >= 200 && status < 300 || status === 304;
    }

    if (cors && !('withCredentials' in x)) {
        // IE8-9
        x = new window.XDomainRequest();

        // Ensure callback is never called synchronously, i.e., before
        // x.send() returns (this has been observed in the wild).
        // See https://github.com/mapbox/mapbox.js/issues/472
        var original = callback;
        callback = function() {
            if (sent) {
                original.apply(this, arguments);
            } else {
                var that = this, args = arguments;
                setTimeout(function() {
                    original.apply(that, args);
                }, 0);
            }
        }
    }

    function loaded() {
        if (
            // XDomainRequest
            x.status === undefined ||
            // modern browsers
            isSuccessful(x.status)) callback.call(x, null, x);
        else callback.call(x, x, null);
    }

    // Both `onreadystatechange` and `onload` can fire. `onreadystatechange`
    // has [been supported for longer](http://stackoverflow.com/a/9181508/229001).
    if ('onload' in x) {
        x.onload = loaded;
    } else {
        x.onreadystatechange = function readystate() {
            if (x.readyState === 4) {
                loaded();
            }
        };
    }

    // Call the callback with the XMLHttpRequest object as an error and prevent
    // it from ever being called again by reassigning it to `noop`
    x.onerror = function error(evt) {
        // XDomainRequest provides no evt parameter
        callback.call(this, evt || true, null);
        callback = function() { };
    };

    // IE9 must have onprogress be set to a unique function.
    x.onprogress = function() { };

    x.ontimeout = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    x.onabort = function(evt) {
        callback.call(this, evt, null);
        callback = function() { };
    };

    // GET is the only supported HTTP Verb by XDomainRequest and is the
    // only one supported here.
    x.open('GET', url, true);

    // Send the request. Sending data is not supported.
    x.send(null);
    sent = true;

    return x;
}

if (typeof module !== 'undefined') module.exports = corslite;

},{}],2:[function(_dereq_,module,exports){
(function (global){
"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var corslite = _dereq_('@mapbox/corslite');

if (L.TrackDrawer === undefined) {
  throw new Error('Cannot find module "L.TrackDrawer"');
}

L.TrackDrawer.Track.include({
  _createFileLoader: function _createFileLoader() {
    this._fileLoader = L.FileLayer.fileLoader(null, {
      addToMap: false,
      fileSizeLimit: this.options.fileSizeLimit || 1024,
      formats: this.options.fileFormat || ['.geojson', '.json', '.kml', '.gpx']
    });
  },
  createFileLoaderControl: function createFileLoaderControl() {
    var _this = this;

    this._fileLoaderController = L.Control.fileLayerLoad({
      addToMap: false,
      fileSizeLimit: this.options.fileSizeLimit || 1024,
      formats: this.options.fileFormat || ['.geojson', '.json', '.kml', '.gpx']
    }).addTo(this._map);

    this._fileLoaderController.loader.on('data:loaded', function (event) {
      _this._dataLoadedHandler(event.layer);
    });

    return this._fileLoaderController;
  },
  _dataLoadedHandler: function () {
    var _dataLoadedHandler2 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2(layer) {
      var _this2 = this;

      var oldValue, layers, lastMarker, i;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              if (this._fireEvents) {
                this.fire('TrackDrawer:start', {});
              }

              oldValue = this._fireEvents;
              this._fireEvents = false;
              this.clean();
              layers = layer.getLayers();
              i = 0;

            case 6:
              if (!(i < layers.length)) {
                _context2.next = 12;
                break;
              }

              if (!(layers[i] instanceof L.Polyline)) {
                _context2.next = 9;
                break;
              }

              return _context2.delegateYield(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee() {
                var latlngs;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        latlngs = layers[i].getLatLngs();

                        if (!(lastMarker === undefined)) {
                          _context.next = 5;
                          break;
                        }

                        lastMarker = L.TrackDrawer.node(latlngs[0]);
                        _context.next = 5;
                        return _this2.addNode(lastMarker, undefined, true);

                      case 5:
                        lastMarker = L.TrackDrawer.node(latlngs[latlngs.length - 1], {
                          type: 'stopover'
                        });
                        _context.next = 8;
                        return _this2.addNode(lastMarker, function (n1, n2, cb) {
                          cb(null, latlngs);
                        }, true);

                      case 8:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee, this);
              })(), "t0", 9);

            case 9:
              i += 1;
              _context2.next = 6;
              break;

            case 12:
              /* eslint-enable no-await-in-loop */
              this._fireEvents = oldValue;
              if (this._fireEvents) this.fire('TrackDrawer:done', {});

            case 14:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));

    function _dataLoadedHandler(_x) {
      return _dataLoadedHandler2.apply(this, arguments);
    }

    return _dataLoadedHandler;
  }(),
  loadFile: function loadFile(file) {
    var _this3 = this;

    return new Promise(function (resolve, reject) {
      _this3._fileLoader.on('data:loaded',
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee3(event) {
          return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
              switch (_context3.prev = _context3.next) {
                case 0:
                  _context3.next = 2;
                  return _this3._dataLoadedHandler(event.layer);

                case 2:
                  _this3._fileLoader.off();

                  resolve();

                case 4:
                case "end":
                  return _context3.stop();
              }
            }
          }, _callee3, this);
        }));

        return function (_x2) {
          return _ref.apply(this, arguments);
        };
      }());

      _this3._fileLoader.on('data:error', function (error) {
        _this3._fileLoader.off();

        reject(error.error);
      });

      _this3._fileLoader.load(file);
    });
  },
  loadUrl: function loadUrl(url) {
    var _this4 = this;

    var useProxy = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var filename = url.split('/').pop();
    var ext = filename.split('.').pop();
    var proxiedUrl = useProxy ? "fetch.php?url=".concat(url) : url;
    return new Promise(function (resolve, reject) {
      corslite(proxiedUrl, function (err, resp) {
        if (!err) {
          try {
            _this4._fileLoader.on('data:loaded',
            /*#__PURE__*/
            function () {
              var _ref2 = _asyncToGenerator(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee4(event) {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        _context4.next = 2;
                        return _this4._dataLoadedHandler(event.layer);

                      case 2:
                        _this4._fileLoader.off();

                        resolve();

                      case 4:
                      case "end":
                        return _context4.stop();
                    }
                  }
                }, _callee4, this);
              }));

              return function (_x3) {
                return _ref2.apply(this, arguments);
              };
            }());

            _this4._fileLoader.on('data:error', function (error) {
              _this4._fileLoader.off();

              reject(error.error);
            });

            _this4._fileLoader.loadData(resp.responseText, filename, ext);
          } catch (ex) {
            reject(ex);
          }
        } else if (err.responseText) {
          try {
            // Check if response is JSON
            var data = JSON.parse(err.responseText);
            reject(new Error(data.error));
          } catch (ex) {
            reject(new Error(err.statusText));
          }
        } else if (err.statusText) {
          reject(new Error(err.statusText));
        } else {
          reject(new Error(err));
        }
      }, false);
    });
  }
});
L.TrackDrawer.Track.addInitHook('_createFileLoader');

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"@mapbox/corslite":1}]},{},[2]);
