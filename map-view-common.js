var view = require("ui/core/view");
var dObservable = require("ui/core/dependency-observable");
var proxy = require("ui/core/proxy");

var MAPVIEW = "MapView";
var CAMERA_PROPERTIES = [ "latitude", "longitude", "bearing", "zoom", "tilt" ];

var MapView = (function (_super) {
  global.__extends(MapView, _super);
  function MapView() {
    _super.call(this);
  }

  MapView.prototype.updateCamera = function() {

  };

  MapView.prototype.notifyMapReady = function() {
    this.notify({
      eventName: MapView.mapReadyEvent,
      object: this,
      gMap: this.gMap
    });
  };

  MapView.mapReadyEvent = "mapReady";

  var onCameraPropertiesChanged = function(data) {
    var mapView = data.object;
    mapView.updateCamera(data);
  }

  CAMERA_PROPERTIES.forEach(function( name ) {
    var metadata = new dObservable.PropertyMetadata(0, dObservable.PropertyMetadataSettings.None, onCameraPropertiesChanged);
    var property = new dObservable.Property(name, MAPVIEW, metadata);
    exports[ name + "Property" ] = property;

    Object.defineProperty( MapView.prototype, name, {
      get: function() {
        return this._getValue( property );
      },
      set: function( value ) {
        var parsedValue = parseFloat( value);
        this._setValue( property, parsedValue );
      }
    });
  });

  return MapView;
})(view.View);


exports.MapView = MapView;