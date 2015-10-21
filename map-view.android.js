var application = require("application");
var common = require("./map-view-common");
require("utils/module-merge").merge(common, module.exports);

var MapView = (function (_super) {
  __extends(MapView, _super);
  function MapView() {
    _super.apply(this, arguments);
  }

  Object.defineProperty(MapView.prototype, "android", {
    get: function () {
      return this._android;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(MapView.prototype, "gMap", {
    get: function () {
      return this._gMap;
    },
    enumerable: true,
    configurable: true
  });

  MapView.prototype.onActivityPaused = function (args) {
    if(!this.android || this._context != args.activity) return;
    this.android.onPause();
  }

  MapView.prototype.onActivityResumed = function (args) {
    if(!this.android || this._context != args.activity) return;
    this.android.onResume();
  }

  MapView.prototype.onActivitySaveInstanceState = function (args) {
    if(!this.android || this._context != args.activity) return;
    this.android.onSaveInstanceState(args.bundle);
  }

  MapView.prototype.onActivityDestroyed = function (args) {
    if(!this.android || this._context != args.activity) return;
    this.android.onDestroy();
  }

  MapView.prototype.onLoaded = function () {
    _super.prototype.onLoaded.apply(this, arguments);

    application.android.on(application.AndroidApplication.activityPausedEvent, this.onActivityPaused, this);
    application.android.on(application.AndroidApplication.activityResumedEvent, this.onActivityResumed, this);
    application.android.on(application.AndroidApplication.saveActivityStateEvent, this.onActivitySaveInstanceState, this);
    application.android.on(application.AndroidApplication.activityDestroyedEvent, this.onActivityDestroyed, this);

  }

  MapView.prototype.onUnloaded = function () {
    _super.prototype.onUnloaded.apply(this, arguments);

    application.android.off(application.AndroidApplication.activityPausedEvent, this.onActivityPaused, this);
    application.android.off(application.AndroidApplication.activityResumedEvent, this.onActivityResumed, this);
    application.android.off(application.AndroidApplication.saveActivityStateEvent, this.onActivitySaveInstanceState, this);
    application.android.off(application.AndroidApplication.activityDestroyedEvent, this.onActivityDestroyed, this);
  }

  MapView.prototype._createUI = function () {
    var that = new WeakRef(this);

    var cameraPosition = this._createCameraPosition();

    var options = new com.google.android.gms.maps.GoogleMapOptions();
    if(cameraPosition) options = options.camera(cameraPosition);

    this._android = new com.google.android.gms.maps.MapView(this._context, options);

    this._android.onCreate(null);
    this._android.onResume();

    var mapReadyCallback = new com.google.android.gms.maps.OnMapReadyCallback({
      onMapReady: function (gMap) {
        that.get()._gMap = gMap;
        that.get()._emit(MapView.mapReadyEvent);
      }
    });

    this._android.getMapAsync(mapReadyCallback);
  };

  MapView.prototype._createCameraPosition = function() {
    var cpBuilder = new com.google.android.gms.maps.model.CameraPosition.Builder();
    var update = false;

    if(!isNaN(this.latitude) && !isNaN(this.longitude)) {
      update = true;
      cpBuilder.target(new com.google.android.gms.maps.model.LatLng(this.latitude, this.longitude));
    }

    if(!isNaN(this.bearing)) {
      update = true;
      cpBuilder.bearing(this.bearing);
    }

    if(!isNaN(this.zoom)) {
      update = true;
      cpBuilder.zoom(this.zoom);
    }

    if(!isNaN(this.tilt)) {
      update = true;
      cpBuilder.tilt(this.tilt);
    }

    return (update) ? cpBuilder.build() : null;
  }

  MapView.prototype.updateCamera = function() {
    var cameraPosition = this._createCameraPosition();
    if(!this._gMap || !cameraPosition) return;

    var cameraUpdate = com.google.android.gms.maps.CameraUpdateFactory.newCameraPosition(cameraPosition);
    this.gMap.moveCamera(cameraUpdate);
  }


  return MapView;
})(common.MapView);
exports.MapView = MapView;