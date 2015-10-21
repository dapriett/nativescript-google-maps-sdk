var view = require("ui/core/view");
var dObservable = require("ui/core/dependency-observable");
var proxy = require("ui/core/proxy");

var MapView = (function (_super) {
  global.__extends(MapView, _super);
  function MapView() {
    _super.call(this);
  }

  MapView.prototype.updateCamera = function() {

  }

  var properties = [ "latitude", "longitude", "bearing", "zoom", "tilt" ];
  properties.forEach(function( name ) {
    var property = new dObservable.Property(
        name,
        "MapView",
        new dObservable.PropertyMetadata(
            0,
            dObservable.PropertyMetadataSettings.None,
            function( data ) {
              data.object.updateCamera();
            }
        )
    );
    exports[ name + "Property" ] = property;

    Object.defineProperty( MapView.prototype, name, {
      get: function() {
        return this._getValue( property );
      },
      set: function( value ) {
        var intValue = parseFloat( value);
        this._setValue( property, value );
      }
    });
  });

  MapView.mapReadyEvent = "mapReady";

  return MapView;
})(view.View);


exports.MapView = MapView;