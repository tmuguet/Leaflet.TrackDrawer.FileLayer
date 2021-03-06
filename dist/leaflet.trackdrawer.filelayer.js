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

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var L = (typeof window !== "undefined" ? window['L'] : typeof global !== "undefined" ? global['L'] : null);

var corslite = _dereq_('@mapbox/corslite');

if (L.TrackDrawer === undefined) {
  throw new Error('Cannot find module "L.TrackDrawer"');
}

function split(polyline) {
  var distance = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
  if (distance <= 0) throw new Error('`distance` must be positive');
  var latlngs = polyline.getLatLngs();
  if (latlngs.length === 0) return [[]];
  var result = [];

  if (Array.isArray(latlngs[0])) {
    for (var j = 0; j < latlngs.length; j += 1) {
      result = result.concat(split(latlngs[j], distance));
    }

    return result;
  }

  var tmp = latlngs.splice(0, 1);

  while (latlngs.length > 0) {
    var _latlngs$splice = latlngs.splice(0, 1),
        _latlngs$splice2 = _slicedToArray(_latlngs$splice, 1),
        latlng = _latlngs$splice2[0];

    tmp.push(latlng);

    if (L.latLng(latlng).distanceTo(L.latLng(tmp[0])) > 100) {
      result.push(L.polyline(tmp));
      tmp = [latlng];
    }
  }

  result.push(L.polyline(tmp));
  return result;
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

      var insertWaypoints,
          oldValue,
          layers,
          lastMarker,
          i,
          _args3 = arguments;
      return regeneratorRuntime.wrap(function _callee2$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              insertWaypoints = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : false;

              this._fireStart();

              oldValue = this._fireEvents;
              this._fireEvents = false;
              this.clean();
              layers = layer.getLayers();
              i = 0;

            case 7:
              if (!(i < layers.length)) {
                _context3.next = 13;
                break;
              }

              if (!(layers[i] instanceof L.Polyline)) {
                _context3.next = 10;
                break;
              }

              return _context3.delegateYield(
              /*#__PURE__*/
              regeneratorRuntime.mark(function _callee() {
                var polylines, latlngs, _loop, j;

                return regeneratorRuntime.wrap(function _callee$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        polylines = insertWaypoints ? split(layers[i], insertWaypoints) : [layers[i]];
                        latlngs = polylines.map(function (l) {
                          return l.getLatLngs();
                        });
                        _loop =
                        /*#__PURE__*/
                        regeneratorRuntime.mark(function _loop(j) {
                          return regeneratorRuntime.wrap(function _loop$(_context) {
                            while (1) {
                              switch (_context.prev = _context.next) {
                                case 0:
                                  if (!(lastMarker === undefined)) {
                                    _context.next = 4;
                                    break;
                                  }

                                  lastMarker = L.TrackDrawer.node(latlngs[j][0]);
                                  _context.next = 4;
                                  return _this2.addNode(lastMarker, undefined, true);

                                case 4:
                                  lastMarker = L.TrackDrawer.node(latlngs[j][latlngs[j].length - 1], {
                                    type: j === latlngs.length - 1 ? 'stopover' : 'waypoint'
                                  });
                                  _context.next = 7;
                                  return _this2.addNode(lastMarker, function (n1, n2, cb) {
                                    cb(null, latlngs[j]);
                                  }, true);

                                case 7:
                                case "end":
                                  return _context.stop();
                              }
                            }
                          }, _loop);
                        });
                        j = 0;

                      case 4:
                        if (!(j < latlngs.length)) {
                          _context2.next = 9;
                          break;
                        }

                        return _context2.delegateYield(_loop(j), "t0", 6);

                      case 6:
                        j += 1;
                        _context2.next = 4;
                        break;

                      case 9:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee);
              })(), "t0", 10);

            case 10:
              i += 1;
              _context3.next = 7;
              break;

            case 13:
              /* eslint-enable no-await-in-loop */
              this._fireEvents = oldValue;

              this._fireDone();

            case 15:
            case "end":
              return _context3.stop();
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

    var insertWaypoints = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    return new Promise(function (resolve, reject) {
      _this3._fileLoader.on('data:loaded',
      /*#__PURE__*/
      function () {
        var _ref = _asyncToGenerator(
        /*#__PURE__*/
        regeneratorRuntime.mark(function _callee3(event) {
          return regeneratorRuntime.wrap(function _callee3$(_context4) {
            while (1) {
              switch (_context4.prev = _context4.next) {
                case 0:
                  _context4.next = 2;
                  return _this3._dataLoadedHandler(event.layer, insertWaypoints);

                case 2:
                  _this3._fileLoader.off();

                  resolve();

                case 4:
                case "end":
                  return _context4.stop();
              }
            }
          }, _callee3);
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
    var insertWaypoints = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var filename = url.split('/').pop();
    var ext = filename.split('.').pop();
    var proxiedUrl = useProxy ? "fetch.php?url=".concat(encodeURI(url)) : url;
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
                return regeneratorRuntime.wrap(function _callee4$(_context5) {
                  while (1) {
                    switch (_context5.prev = _context5.next) {
                      case 0:
                        _context5.next = 2;
                        return _this4._dataLoadedHandler(event.layer, insertWaypoints);

                      case 2:
                        _this4._fileLoader.off();

                        resolve();

                      case 4:
                      case "end":
                        return _context5.stop();
                    }
                  }
                }, _callee4);
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
