import application = require("application");

import common = require("./map-view-common");

import { MapView as MapViewCommon, Position as PositionBase, Marker as MarkerBase, Circle as CircleBase } from "./map-view-common";
import { Image } from "ui/image";
import { Color } from "color";
import imageSource = require("image-source");

export class MapView extends MapViewCommon {

    private _android: any;
    private _markers: Array<Marker>;
    private _shapes: Array<Shape>;

    constructor() {
        super();
        this._markers = [];
        this._shapes = [];
    }

    onLoaded() {
        super.onLoaded();

        application.android.on(application.AndroidApplication.activityPausedEvent, this.onActivityPaused, this);
        application.android.on(application.AndroidApplication.activityResumedEvent, this.onActivityResumed, this);
        application.android.on(application.AndroidApplication.saveActivityStateEvent, this.onActivitySaveInstanceState, this);
        application.android.on(application.AndroidApplication.activityDestroyedEvent, this.onActivityDestroyed, this);
    }

    private onUnloaded() {
        super.onUnloaded();

        application.android.off(application.AndroidApplication.activityPausedEvent, this.onActivityPaused, this);
        application.android.off(application.AndroidApplication.activityResumedEvent, this.onActivityResumed, this);
        application.android.off(application.AndroidApplication.saveActivityStateEvent, this.onActivitySaveInstanceState, this);
        application.android.off(application.AndroidApplication.activityDestroyedEvent, this.onActivityDestroyed, this);
    }

    private _createCameraPosition() {
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

    updateCamera() {
      var cameraPosition = this._createCameraPosition();
      if(!cameraPosition) return;

      if(!this.gMap) {
        this._pendingCameraUpdate = true
        return;
      }

      this._pendingCameraUpdate = false;

      var cameraUpdate = com.google.android.gms.maps.CameraUpdateFactory.newCameraPosition(cameraPosition);
      this.gMap.moveCamera(cameraUpdate);
    }

    get android() {
        return this._android;
    }

    get gMap() {
        return this._gMap;
    }

    set android(value : any) {
        console.warn('Cannot set value from outside this class');
    }

    addMarker(marker: Marker) {
        marker.android = this.gMap.addMarker(marker.android);
        this._markers.push(marker);
    }

    removeMarker(marker: Marker) {
        marker.android.remove();
        this._markers.splice(this._markers.indexOf(marker), 1);
    }

    removeAllMarkers() {
        this._markers.forEach(marker => {
            marker.android.remove();
        });
        this._markers = [];
    }

    addCircle(shape: Circle) {
        shape.android = this.gMap.addCircle(shape.android);
        this._shapes.push(shape);
    }

    removeShape(shape: Shape) {
        shape.android.remove();
        this._shapes.splice(this._shapes.indexOf(shape), 1);
    }

    removeAllShapes() {
        this._shapes.forEach(shape => {
          shape.android.remove();
        });
        this._shapes = [];
    }

    clear() {
        this._markers = [];
        this._shapes = [];
        this.gMap.clear();
    }

    public findMarker(callback : (marker: Marker) => boolean) : Marker {
        return this._markers.find(callback);
    }

    public notifyMarkerTapped(marker : Marker) {
        this.notifyMarkerEvent(MapViewCommon.markerSelectEvent, marker);
    }


    private onActivityPaused(args) {
      if(!this.android || this._context != args.activity) return;
      this.android.onPause();
    }

    private onActivityResumed(args) {
      if(!this.android || this._context != args.activity) return;
      this.android.onResume();
    }

    private onActivitySaveInstanceState(args) {
      if(!this.android || this._context != args.activity) return;
      this.android.onSaveInstanceState(args.bundle);
    }

    private onActivityDestroyed(args) {
      if(!this.android || this._context != args.activity) return;
      this.android.onDestroy();
    }

    private _createUI() {
      var that = new WeakRef(this);

      var cameraPosition = this._createCameraPosition();

      var options = new com.google.android.gms.maps.GoogleMapOptions();
      if(cameraPosition) options = options.camera(cameraPosition);

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
            onMarkerClick: function(gmsMarker) {

              let marker: Marker = owner.findMarker((marker: Marker) => marker.android.getId() === gmsMarker.getId());
              owner.notifyMarkerTapped(marker);

              return false;
            }
          }));

          gMap.setOnCameraChangeListener(new com.google.android.gms.maps.GoogleMap.OnCameraChangeListener({
            onCameraChange: function(cameraPosition) {

              owner._processingCameraEvent = true;

              let cameraChanged : boolean = false;
              if (owner.latitude != cameraPosition.target.latitude) {
                cameraChanged = true;
                owner._onPropertyChangedFromNative(MapViewCommon.latitudeProperty, cameraPosition.target.latitude);
              }
              if (owner.longitude != cameraPosition.target.longitude) {
                cameraChanged = true;
                owner._onPropertyChangedFromNative(MapViewCommon.longitudeProperty, cameraPosition.target.longitude);
              }
              if (owner.bearing != cameraPosition.bearing) {
                cameraChanged = true;
                owner._onPropertyChangedFromNative(MapViewCommon.bearingProperty, cameraPosition.bearing);
              }
              if (owner.zoom != cameraPosition.zoom) {
                cameraChanged = true;
                owner._onPropertyChangedFromNative(MapViewCommon.zoomProperty, cameraPosition.zoom);
              }
              if (owner.tilt != cameraPosition.tilt) {
                cameraChanged = true;
                owner._onPropertyChangedFromNative(MapViewCommon.tiltProperty, cameraPosition.tilt);
              }

              if (cameraChanged) {
                owner.notifyCameraEvent(MapViewCommon.cameraChangedEvent, {
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
    }

}

export class Position extends PositionBase {
    private _android: any; /* CLLocationCoordinate2D */
    get android() {
        return this._android;
    }

    get latitude() {
        return this._android.latitude;
    }

    set latitude(latitude) {
        this._android = new com.google.android.gms.maps.model.LatLng(latitude, this.longitude);
    }

    get longitude() {
        return this._android.latitude;
    }

    set longitude(longitude) {
        this._android = new com.google.android.gms.maps.model.LatLng(this.latitude, longitude);
    }

    constructor() {
        super();
        this._android = new com.google.android.gms.maps.model.LatLng(0, 0);
    }

    public static positionFromLatLng(latitude: number, longitude: number) : Position {
        let position: Position = new Position();
        position.latitude = latitude;
        position.longitude = longitude;
        return position;
    }
}

export class Marker extends MarkerBase {
    private _android : any;
    private _position: Position;
    private _icon: Image;
    private _isMarker : boolean = false;

    static MARKER_CLASS = 'com.google.android.gms.maps.model.Marker';

    constructor() {
        super();
        this.android = new com.google.android.gms.maps.model.MarkerOptions();
    }


    get position() {
        return this._position;
    }

    set position(position: Position) {
        this._position = position;
        if(this._isMarker) {
          this._android.setPosition(position.android);
        } else {
          this._android.position(position.android);
        }
    }

    get rotation() {
        return this._android.getRotation();
    }

    set rotation(rotation: number) {
        if(this._isMarker) {
          this._android.setRotation(rotation);
        } else {
          this._android.rotation(rotation);
        }
    }

    get title() {
        return this._android.getTitle();
    }

    set title(title : string) {
        if(this._isMarker) {
          this._android.setTitle(title);
        } else {
          this._android.title(title);
        }
    }

    get snippet() {
        return this._android.getSnippet();
    }

    set snippet(snippet : string) {
        if(this._isMarker) {
          this._android.setSnippet(snippet);
        } else {
          this._android.snippet(snippet);
        }
    }

    get icon() {
        return this._icon;
    }

    set icon(icon : Image) {
        if(typeof icon === 'string') {
          var tempIcon = new Image();
          tempIcon.imageSource = imageSource.fromResource(String(icon));
          icon = tempIcon;
        }
        this._icon = icon;
        var androidIcon = com.google.android.gms.maps.model.BitmapDescriptorFactory.fromBitmap(icon.imageSource.android);
        if(this._isMarker) {
          this._android.setIcon(androidIcon);
        } else {
          this._android.icon(androidIcon);
        }
    }

    get alpha() {
        return this._android.getAlpha();
    }

    set alpha(alpha : number) {
        if(this._isMarker) {
          this._android.setAlpha(alpha);
        } else {
          this._android.alpha(alpha);
        }
    }

    get flat() {
        return this._android.isFlat();
    }

    set flat(flat : boolean) {
        if(this._isMarker) {
          this._android.setFlat(flat);
        } else {
          this._android.flat(flat);
        }
    }

    get flat() {
        return this._android.isFlat();
    }

    set flat(flat : boolean) {
        if(this._isMarker) {
          this._android.setFlat(flat);
        } else {
          this._android.flat(flat);
        }
    }

    get draggable() {
        return this._android.isDraggable();
    }

    set draggable(draggable : boolean) {
        if(this._isMarker) {
          this._android.setDraggable(draggable);
        } else {
          this._android.draggable(draggable);
        }
    }

    get visible() {
        return this._android.isVisible();
    }

    set visible(visible : boolean) {
        if(this._isMarker) {
          this._android.setVisible(visible);
        } else {
          this._android.visible(visible);
        }
    }

    set icon(icon : string) {
        var markerBitmap = imageSource.fromResource(string);
    }

    get android() {
        return this._android;
    }

    set android(android) {
        this._android = android;
        this._isMarker = android.getClass().getName() === Marker.MARKER_CLASS;
    }
}

export class Circle extends CircleBase {
    private _android: any;
    private _center: Position;
    private _strokeColor: Color;
    private _fillColor: Color;
    private _isCircle: boolean = false;

    static CIRCLE_CLASS = 'com.google.android.gms.maps.model.Circle';

    constructor() {
        super();
        this.android = new com.google.android.gms.maps.model.CircleOptions();
    }

    get center() {
        return this._center;
    }

    set center(value: Position) {
        this._center = value;
        if (this._isCircle) {
            this._android.setCenter(value.android);
        } else {
            this._android.center(value.android);
        }
    }

    get radius() {
        return this._android.getRadius();
    }

    set radius(value: number) {
        if (this._isCircle) {
            this._android.setRadius(value);
        } else {
            this._android.radius(value);
        }
    }

    get strokeWidth() {
        return this._android.getStrokeWidth();
    }

    set strokeWidth(value: number) {
        if (this._isCircle) {
            this._android.setStrokeWidth(value);
        } else {
            this._android.strokeWidth(value);
        }
    }

    get strokeColor() {
        return this._strokeColor;
    }

    set strokeColor(value: Color) {
        this._strokeColor = value;
        if (this._isCircle) {
            this._android.setStrokeColor(value.android);
        } else {
            this._android.strokeColor(value.android);
        }
    }

    get fillColor() {
        return this._fillColor;
    }

    set fillColor(value: Color) {
        this._fillColor = value;
        if (this._isCircle) {
            this._android.setFillColor(value.android);
        } else {
            this._android.fillColor(value.android);
        }
    }

    get zIndex() {
        return this._android.getZIndex();
    }

    set zIndex(value: number) {
        if (this._isCircle) {
            this._android.setZIndex(value);
        } else {
            this._android.zIndex(value);
        }
    }

    get visible() {
        return this._android.isVisible();
    }

    set visible(value: boolean) {
        if (this._isCircle) {
            this._android.setVisible(value);
        } else {
            this._android.visible(value);
        }
    }

    get android() {
        return this._android;
    }

    set android(android) {
        this._android = android;
        this._isCircle = android.getClass().getName() === Circle.CIRCLE_CLASS;
    }
}
