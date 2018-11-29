describe('Main', () => {
  let map;

  beforeEach(() => {
    map = L.map('map', {
      center: L.latLng(44.96777356135154, 6.06822967529297),
      zoom: 13,
    });
  });

  afterEach(async () => {
    sinon.restore();
    await map.removeAsPromise();
  });

  describe('Initialization', () => {
    it('constructor should correctly initialize structures', () => {
      const track = L.TrackDrawer.track().addTo(map);
      expect(track._fileLoader).to.be.not.null;
      const control = track.createFileLoaderControl();
      expect(control.loader).to.be.not.null;
    });
  });
});
