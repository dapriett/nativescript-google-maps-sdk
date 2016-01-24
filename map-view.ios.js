var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var map_view_common_1 = require("./map-view-common");
var MapViewDelegateImpl = (function (_super) {
    __extends(MapViewDelegateImpl, _super);
    function MapViewDelegateImpl() {
        _super.apply(this, arguments);
    }
    MapViewDelegateImpl.initWithOwner = function (owner) {
        var handler = MapViewDelegateImpl.new();
        handler._owner = owner;
        return handler;
    };
    MapViewDelegateImpl.prototype.mapViewIdleAtCameraPosition = function (mapView, cameraPosition) {
        var owner = this._owner.get();
        if (owner) {
            owner._processingCameraEvent = true;
            var cameraChanged = false;
            if (owner.latitude != cameraPosition.target.latitude) {
                cameraChanged = true;
                owner._onPropertyChangedFromNative(map_view_common_1.MapView.latitudeProperty, cameraPosition.target.latitude);
            }
            if (owner.longitude != cameraPosition.target.longitude) {
                cameraChanged = true;
                owner._onPropertyChangedFromNative(map_view_common_1.MapView.longitudeProperty, cameraPosition.target.longitude);
            }
            if (owner.bearing != cameraPosition.bearing) {
                cameraChanged = true;
                owner._onPropertyChangedFromNative(map_view_common_1.MapView.bearingProperty, cameraPosition.bearing);
            }
            if (owner.zoom != cameraPosition.zoom) {
                cameraChanged = true;
                owner._onPropertyChangedFromNative(map_view_common_1.MapView.zoomProperty, cameraPosition.zoom);
            }
            if (owner.tilt != cameraPosition.viewingAngle) {
                cameraChanged = true;
                owner._onPropertyChangedFromNative(map_view_common_1.MapView.tiltProperty, cameraPosition.viewingAngle);
            }
            if (cameraChanged) {
                owner.notifyCameraEvent(map_view_common_1.MapView.cameraChangedEvent, {
                    latitude: cameraPosition.target.latitude,
                    longitude: cameraPosition.target.longitude,
                    zoom: cameraPosition.zoom,
                    bearing: cameraPosition.bearing,
                    tilt: cameraPosition.viewingAngle
                });
            }
            owner._processingCameraEvent = false;
        }
    };
    MapViewDelegateImpl.prototype.mapViewDidTapMarker = function (mapView, gmsMarker) {
        var owner = this._owner.get();
        if (owner) {
            var marker = owner.findMarker(function (marker) { return marker.ios == gmsMarker; });
            owner.notifyMarkerTapped(marker);
        }
    };
    MapViewDelegateImpl.ObjCProtocols = [GMSMapViewDelegate];
    return MapViewDelegateImpl;
})(NSObject);
var MapView = (function (_super) {
    __extends(MapView, _super);
    function MapView() {
        _super.call(this);
        this._markers = [];
        this._ios = GMSMapView.mapWithFrameCamera(CGRectZero, this._createCameraPosition());
    }
    MapView.prototype.onLoaded = function () {
        _super.prototype.onLoaded.call(this);
        this.notifyMapReady();
        this._ios.delegate = this._delegate = MapViewDelegateImpl.initWithOwner(new WeakRef(this));
    };
    MapView.prototype._createCameraPosition = function () {
        return GMSCameraPosition.cameraWithLatitudeLongitudeZoomBearingViewingAngle(this.latitude, this.longitude, this.zoom, this.bearing, this.tilt);
    };
    MapView.prototype.updateCamera = function () {
        this.ios.animateToCameraPosition(this._createCameraPosition());
    };
    Object.defineProperty(MapView.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        set: function (value) {
            console.warn('Cannot set value from outside this class');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MapView.prototype, "gMap", {
        get: function () {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });
    MapView.prototype.addMarker = function (marker) {
        marker.ios.map = this.gMap;
        this._markers.push(marker);
    };
    MapView.prototype.removeMarker = function (marker) {
        marker.ios.map = null;
        this._markers.splice(this._markers.indexOf(marker), 1);
    };
    MapView.prototype.removeAllMarkers = function () {
        this._markers = [];
        this.ios.clear();
    };
    MapView.prototype.findMarker = function (callback) {
        return this._markers.find(callback);
    };
    MapView.prototype.notifyMarkerTapped = function (marker) {
        this.notifyMarkerEvent(map_view_common_1.MapView.markerSelectEvent, marker);
    };
    return MapView;
})(map_view_common_1.MapView);
exports.MapView = MapView;
var Position = (function (_super) {
    __extends(Position, _super);
    function Position() {
        _super.call(this);
        this._ios = CLLocationCoordinate2DMake(0, 0);
    }
    Object.defineProperty(Position.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Position.prototype, "latitude", {
        get: function () {
            return this._ios.latitude;
        },
        set: function (latitude) {
            this._ios = CLLocationCoordinate2DMake(latitude, this.longitude);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Position.prototype, "longitude", {
        get: function () {
            return this._ios.latitude;
        },
        set: function (longitude) {
            this._ios = CLLocationCoordinate2DMake(this.latitude, longitude);
        },
        enumerable: true,
        configurable: true
    });
    Position.positionFromLatLng = function (latitude, longitude) {
        var position = new Position();
        position.latitude = latitude;
        position.longitude = longitude;
        return position;
    };
    return Position;
})(map_view_common_1.Position);
exports.Position = Position;
var Marker = (function (_super) {
    __extends(Marker, _super);
    function Marker() {
        _super.call(this);
        this._ios = GMSMarker.new();
    }
    Object.defineProperty(Marker.prototype, "title", {
        get: function () {
            return this._ios.title;
        },
        set: function (title) {
            this._ios.title = title;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marker.prototype, "snippet", {
        get: function () {
            return this._ios.snippet;
        },
        set: function (snippet) {
            this._ios.snippet = snippet;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marker.prototype, "position", {
        get: function () {
            return this._position;
        },
        set: function (position) {
            this._position = position;
            this._ios.position = position.ios;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marker.prototype, "icon", {
        get: function () {
            return this._icon;
        },
        set: function (icon) {
            this._icon = icon;
            this._ios.icon = icon.ios.image;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marker.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });
    return Marker;
})(map_view_common_1.Marker);
exports.Marker = Marker;
