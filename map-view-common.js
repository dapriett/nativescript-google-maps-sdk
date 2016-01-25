var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var view_1 = require("ui/core/view");
var dependency_observable_1 = require("ui/core/dependency-observable");
var MAP_VIEW = "MapView";
function onMapPropertyChanged(data) {
    var mapView = data.object;
    if (!mapView._processingCameraEvent)
        mapView.updateCamera();
}
var MapView = (function (_super) {
    __extends(MapView, _super);
    function MapView() {
        _super.apply(this, arguments);
    }
    Object.defineProperty(MapView.prototype, "latitude", {
        get: function () {
            return this._getValue(MapView.latitudeProperty);
        },
        set: function (value) {
            this._setValue(MapView.latitudeProperty, parseFloat(value));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MapView.prototype, "longitude", {
        get: function () {
            return this._getValue(MapView.longitudeProperty);
        },
        set: function (value) {
            this._setValue(MapView.longitudeProperty, parseFloat(value));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MapView.prototype, "bearing", {
        get: function () {
            return this._getValue(MapView.bearingProperty);
        },
        set: function (value) {
            this._setValue(MapView.bearingProperty, parseFloat(value));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MapView.prototype, "zoom", {
        get: function () {
            return this._getValue(MapView.zoomProperty);
        },
        set: function (value) {
            this._setValue(MapView.zoomProperty, parseFloat(value));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MapView.prototype, "tilt", {
        get: function () {
            return this._getValue(MapView.tiltProperty);
        },
        set: function (value) {
            this._setValue(MapView.tiltProperty, parseFloat(value));
        },
        enumerable: true,
        configurable: true
    });
    MapView.prototype.notifyMapReady = function () {
        this.notify({ eventName: MapView.mapReadyEvent, object: this, gMap: this.gMap });
    };
    MapView.prototype.removeAllMarkers = function () {
        this.gMap.clear();
    };
    MapView.prototype.notifyMarkerEvent = function (eventName, marker) {
        var args = { eventName: eventName, object: this, marker: marker };
        this.notify(args);
    };
    MapView.prototype.notifyPositionEvent = function (eventName, position) {
        var args = { eventName: eventName, object: this, position: position };
        this.notify(args);
    };
    MapView.prototype.notifyCameraEvent = function (eventName, camera) {
        var args = { eventName: eventName, object: this, camera: camera };
        this.notify(args);
    };
    MapView.mapReadyEvent = "mapReady";
    MapView.markerSelectEvent = "markerSelect";
    MapView.coordinateTappedEvent = "coordinateTapped";
    MapView.cameraChangedEvent = "cameraChanged";
    MapView.latitudeProperty = new dependency_observable_1.Property("latitude", MAP_VIEW, new dependency_observable_1.PropertyMetadata(0, dependency_observable_1.PropertyMetadataSettings.None, onMapPropertyChanged));
    MapView.longitudeProperty = new dependency_observable_1.Property("longitude", MAP_VIEW, new dependency_observable_1.PropertyMetadata(0, dependency_observable_1.PropertyMetadataSettings.None, onMapPropertyChanged));
    MapView.bearingProperty = new dependency_observable_1.Property("bearing", MAP_VIEW, new dependency_observable_1.PropertyMetadata(0, dependency_observable_1.PropertyMetadataSettings.None, onMapPropertyChanged));
    MapView.zoomProperty = new dependency_observable_1.Property("zoom", MAP_VIEW, new dependency_observable_1.PropertyMetadata(0, dependency_observable_1.PropertyMetadataSettings.None, onMapPropertyChanged));
    MapView.tiltProperty = new dependency_observable_1.Property("tilt", MAP_VIEW, new dependency_observable_1.PropertyMetadata(0, dependency_observable_1.PropertyMetadataSettings.None, onMapPropertyChanged));
    return MapView;
})(view_1.View);
exports.MapView = MapView;
var Marker = (function () {
    function Marker() {
    }
    return Marker;
})();
exports.Marker = Marker;
var Position = (function () {
    function Position() {
    }
    return Position;
})();
exports.Position = Position;
