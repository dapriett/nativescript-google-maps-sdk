var common = require("./map-view-common");

require("utils/module-merge").merge(common, module.exports);

var MapView = (function (_super) {
  global.__extends(MapView, _super);
  function MapView() {
    _super.apply(this, arguments);
    this._ios = GMSMapView.mapWithFrameCamera(CGRectZero, this._createCameraPosition());
  }

  MapView.prototype.onLoaded = function () {
    _super.prototype.onLoaded.apply(this, arguments);
    this.notifyMapReady();
  }

  Object.defineProperty(MapView.prototype, "ios", {
    get: function () {
      return this._ios;
    }
  });

  Object.defineProperty(MapView.prototype, "gMap", {
    get: function () {
      return this._ios;
    },
    enumerable: true,
    configurable: true
  });

  MapView.prototype.updateCamera = function() {
    if(!this.ios) return;
    var cameraUpdate = GMSCameraUpdate.setCamera(this._createCameraPosition());
    this.ios.moveCamera(cameraUpdate);
  };

  MapView.prototype._createCameraPosition = function() {
    return GMSCameraPosition.cameraWithLatitudeLongitudeZoomBearingViewingAngle(
        this.latitude,
        this.longitude,
        this.zoom,
        this.bearing,
        this.tilt
    );
  };

  return MapView;
})(common.MapView);

exports.MapView = MapView;