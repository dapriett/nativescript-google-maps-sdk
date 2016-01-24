var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var application = require("application");
var map_view_common_1 = require("./map-view-common");
var image_1 = require("ui/image");
var imageSource = require("image-source");
var MapView = (function (_super) {
    __extends(MapView, _super);
    function MapView() {
        _super.call(this);
        this._markers = [];
    }
    MapView.prototype.onLoaded = function () {
        _super.prototype.onLoaded.call(this);
        application.android.on(application.AndroidApplication.activityPausedEvent, this.onActivityPaused, this);
        application.android.on(application.AndroidApplication.activityResumedEvent, this.onActivityResumed, this);
        application.android.on(application.AndroidApplication.saveActivityStateEvent, this.onActivitySaveInstanceState, this);
        application.android.on(application.AndroidApplication.activityDestroyedEvent, this.onActivityDestroyed, this);
    };
    MapView.prototype.onUnloaded = function () {
        _super.prototype.onUnloaded.call(this);
        application.android.off(application.AndroidApplication.activityPausedEvent, this.onActivityPaused, this);
        application.android.off(application.AndroidApplication.activityResumedEvent, this.onActivityResumed, this);
        application.android.off(application.AndroidApplication.saveActivityStateEvent, this.onActivitySaveInstanceState, this);
        application.android.off(application.AndroidApplication.activityDestroyedEvent, this.onActivityDestroyed, this);
    };
    MapView.prototype._createCameraPosition = function () {
        var cpBuilder = new com.google.android.gms.maps.model.CameraPosition.Builder();
        var update = false;
        if (!isNaN(this.latitude) && !isNaN(this.longitude)) {
            update = true;
            cpBuilder.target(new com.google.android.gms.maps.model.LatLng(this.latitude, this.longitude));
        }
        if (!isNaN(this.bearing)) {
            update = true;
            cpBuilder.bearing(this.bearing);
        }
        if (!isNaN(this.zoom)) {
            update = true;
            cpBuilder.zoom(this.zoom);
        }
        if (!isNaN(this.tilt)) {
            update = true;
            cpBuilder.tilt(this.tilt);
        }
        return (update) ? cpBuilder.build() : null;
    };
    MapView.prototype.updateCamera = function () {
        var cameraPosition = this._createCameraPosition();
        if (!cameraPosition)
            return;
        if (!this.gMap) {
            this._pendingCameraUpdate = true;
            return;
        }
        this._pendingCameraUpdate = false;
        var cameraUpdate = com.google.android.gms.maps.CameraUpdateFactory.newCameraPosition(cameraPosition);
        this.gMap.moveCamera(cameraUpdate);
    };
    Object.defineProperty(MapView.prototype, "android", {
        get: function () {
            return this._android;
        },
        set: function (value) {
            console.warn('Cannot set value from outside this class');
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
    MapView.prototype.addMarker = function (marker) {
        marker.android = this.gMap.addMarker(marker.android);
        this._markers.push(marker);
    };
    MapView.prototype.removeMarker = function (marker) {
        marker.android.remove();
        this._markers.splice(this._markers.indexOf(marker), 1);
    };
    MapView.prototype.removeAllMarkers = function () {
        this._markers = [];
        this.android.clear();
    };
    MapView.prototype.findMarker = function (callback) {
        return this._markers.find(callback);
    };
    MapView.prototype.notifyMarkerTapped = function (marker) {
        this.notifyMarkerEvent(map_view_common_1.MapView.markerSelectEvent, marker);
    };
    MapView.prototype.onActivityPaused = function (args) {
        if (!this.android || this._context != args.activity)
            return;
        this.android.onPause();
    };
    MapView.prototype.onActivityResumed = function (args) {
        if (!this.android || this._context != args.activity)
            return;
        this.android.onResume();
    };
    MapView.prototype.onActivitySaveInstanceState = function (args) {
        if (!this.android || this._context != args.activity)
            return;
        this.android.onSaveInstanceState(args.bundle);
    };
    MapView.prototype.onActivityDestroyed = function (args) {
        if (!this.android || this._context != args.activity)
            return;
        this.android.onDestroy();
    };
    MapView.prototype._createUI = function () {
        var that = new WeakRef(this);
        var cameraPosition = this._createCameraPosition();
        var options = new com.google.android.gms.maps.GoogleMapOptions();
        if (cameraPosition)
            options = options.camera(cameraPosition);
        this._android = new com.google.android.gms.maps.MapView(this._context, options);
        this._android.onCreate(null);
        this._android.onResume();
        var mapReadyCallback = new com.google.android.gms.maps.OnMapReadyCallback({
            onMapReady: function (gMap) {
                var owner = that.get();
                owner._gMap = gMap;
                if (owner._pendingCameraUpdate) {
                    owner.updateCamera();
                }
                gMap.setOnMarkerClickListener(new com.google.android.gms.maps.GoogleMap.OnMarkerClickListener({
                    onMarkerClick: function (gmsMarker) {
                        var marker = owner.findMarker(function (marker) { return marker.android.getId() === gmsMarker.getId(); });
                        owner.notifyMarkerTapped(marker);
                        return false;
                    }
                }));
                gMap.setOnCameraChangeListener(new com.google.android.gms.maps.GoogleMap.OnCameraChangeListener({
                    onCameraChange: function (cameraPosition) {
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
                        if (owner.tilt != cameraPosition.tilt) {
                            cameraChanged = true;
                            owner._onPropertyChangedFromNative(map_view_common_1.MapView.tiltProperty, cameraPosition.tilt);
                        }
                        if (cameraChanged) {
                            owner.notifyCameraEvent(map_view_common_1.MapView.cameraChangedEvent, {
                                latitude: cameraPosition.target.latitude,
                                longitude: cameraPosition.target.longitude,
                                zoom: cameraPosition.zoom,
                                bearing: cameraPosition.bearing,
                                tilt: cameraPosition.tilt
                            });
                        }
                        owner._processingCameraEvent = false;
                    }
                }));
                owner.notifyMapReady();
            }
        });
        this._android.getMapAsync(mapReadyCallback);
    };
    return MapView;
})(map_view_common_1.MapView);
exports.MapView = MapView;
var Position = (function (_super) {
    __extends(Position, _super);
    function Position() {
        _super.call(this);
        this._android = new com.google.android.gms.maps.model.LatLng(0, 0);
    }
    Object.defineProperty(Position.prototype, "android", {
        get: function () {
            return this._android;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Position.prototype, "latitude", {
        get: function () {
            return this._android.latitude;
        },
        set: function (latitude) {
            this._android = new com.google.android.gms.maps.model.LatLng(latitude, this.longitude);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Position.prototype, "longitude", {
        get: function () {
            return this._android.latitude;
        },
        set: function (longitude) {
            this._android = new com.google.android.gms.maps.model.LatLng(this.latitude, longitude);
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
        this._isMarker = false;
        this.android = new com.google.android.gms.maps.model.MarkerOptions();
    }
    Object.defineProperty(Marker.prototype, "position", {
        get: function () {
            return this._position;
        },
        set: function (position) {
            this._position = position;
            if (this._isMarker) {
                this._android.setPosition(position.android);
            }
            else {
                this._android.position(position.android);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marker.prototype, "rotation", {
        get: function () {
            return this._android.getRotation();
        },
        set: function (rotation) {
            if (this._isMarker) {
                this._android.setRotation(rotation);
            }
            else {
                this._android.rotation(rotation);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marker.prototype, "title", {
        get: function () {
            return this._android.getTitle();
        },
        set: function (title) {
            if (this._isMarker) {
                this._android.setTitle(title);
            }
            else {
                this._android.title(title);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marker.prototype, "snippet", {
        get: function () {
            return this._android.getSnippet();
        },
        set: function (snippet) {
            if (this._isMarker) {
                this._android.setSnippet(snippet);
            }
            else {
                this._android.snippet(snippet);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marker.prototype, "icon", {
        get: function () {
            return this._icon;
        },
        set: function (icon) {
            if (typeof icon === 'string') {
                icon = new image_1.Image();
                icon.imageSource = imageSource.fromResource(String(icon));
            }
            this._icon = icon;
            var androidIcon = com.google.android.gms.maps.model.BitmapDescriptorFactory.fromBitmap(icon.imageSource.android);
            if (this._isMarker) {
                this._android.setIcon(androidIcon);
            }
            else {
                this._android.icon(androidIcon);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marker.prototype, "alpha", {
        get: function () {
            return this._android.getAlpha();
        },
        set: function (alpha) {
            if (this._isMarker) {
                this._android.setAlpha(alpha);
            }
            else {
                this._android.alpha(alpha);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marker.prototype, "flat", {
        get: function () {
            return this._android.isFlat();
        },
        set: function (flat) {
            if (this._isMarker) {
                this._android.setFlat(flat);
            }
            else {
                this._android.flat(flat);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marker.prototype, "draggable", {
        get: function () {
            return this._android.isDraggable();
        },
        set: function (draggable) {
            if (this._isMarker) {
                this._android.setDraggable(draggable);
            }
            else {
                this._android.draggable(draggable);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marker.prototype, "visible", {
        get: function () {
            return this._android.isVisible();
        },
        set: function (visible) {
            if (this._isMarker) {
                this._android.setVisible(visible);
            }
            else {
                this._android.visible(visible);
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Marker.prototype, "android", {
        get: function () {
            return this._android;
        },
        set: function (android) {
            this._android = android;
            this._isMarker = android.getClass().getName() === Marker.MARKER_CLASS;
        },
        enumerable: true,
        configurable: true
    });
    Marker.MARKER_CLASS = 'com.google.android.gms.maps.model.Marker';
    return Marker;
})(map_view_common_1.Marker);
exports.Marker = Marker;
