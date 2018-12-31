const L = require('leaflet');
const corslite = require('@mapbox/corslite');

if (L.TrackDrawer === undefined) {
  throw new Error('Cannot find module "L.TrackDrawer"');
}

L.TrackDrawer.Track.include({
  _createFileLoader() {
    this._fileLoader = L.FileLayer.fileLoader(null, {
      addToMap: false,
      fileSizeLimit: this.options.fileSizeLimit || 1024,
      formats: this.options.fileFormat || ['.geojson', '.json', '.kml', '.gpx'],
    });
  },

  createFileLoaderControl() {
    this._fileLoaderController = L.Control.fileLayerLoad({
      addToMap: false,
      fileSizeLimit: this.options.fileSizeLimit || 1024,
      formats: this.options.fileFormat || ['.geojson', '.json', '.kml', '.gpx'],
    }).addTo(this._map);

    this._fileLoaderController.loader.on('data:loaded', (event) => {
      this._dataLoadedHandler(event.layer);
    });

    return this._fileLoaderController;
  },

  async _dataLoadedHandler(layer) {
    if (this._fireEvents) {
      this.fire('TrackDrawer:start', {});
    }

    const oldValue = this._fireEvents;
    this._fireEvents = false;
    this.clean();

    const layers = layer.getLayers();
    let lastMarker;
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < layers.length; i += 1) {
      if (layers[i] instanceof L.Polyline) {
        const latlngs = layers[i].getLatLngs();
        if (lastMarker === undefined) {
          lastMarker = L.TrackDrawer.node(latlngs[0]);
          await this.addNode(lastMarker);
        }

        lastMarker = L.TrackDrawer.node(latlngs[latlngs.length - 1], {
          type: 'stopover',
        });
        await this.addNode(lastMarker, (n1, n2, cb) => {
          cb(null, latlngs);
        });
      }
    }
    /* eslint-enable no-await-in-loop */

    this._fireEvents = oldValue;
    if (this._fireEvents) this.fire('TrackDrawer:done', {});
  },

  loadFile(file) {
    return new Promise((resolve, reject) => {
      this._fileLoader.on('data:loaded', (event) => {
        this._dataLoadedHandler(event.layer);
        this._fileLoader.off();
        resolve();
      });
      this._fileLoader.on('data:error', (error) => {
        this._fileLoader.off();
        reject(error);
      });

      this._fileLoader.load(file);
    });
  },

  loadUrl(url, useProxy = true) {
    const filename = url.split('/').pop();
    const ext = filename.split('.').pop();

    const proxiedUrl = useProxy ? `fetch.php?url=${url}` : url;

    return new Promise((resolve, reject) => {
      corslite(
        proxiedUrl,
        (err, resp) => {
          if (!err) {
            try {
              this._fileLoader.on('data:loaded', (event) => {
                this._dataLoadedHandler(event.layer);
                this._fileLoader.off();
                resolve();
              });
              this._fileLoader.on('data:error', (error) => {
                this._fileLoader.off();
                reject(error);
              });
              this._fileLoader.loadData(resp.responseText, filename, ext);
              resolve();
            } catch (ex) {
              reject(ex);
            }
          } else {
            try {
              const data = JSON.parse(err.responseText);
              reject(new Error(data.error));
            } catch (ex) {
              reject(ex);
            }
          }
        },
        false,
      );
    });
  },
});

L.TrackDrawer.Track.addInitHook('_createFileLoader');
