import {
    MapViewBase, BoundsBase, CircleBase,
    MarkerBase, PolygonBase, PolylineBase,
    PositionBase, ShapeBase, latitudeProperty,
    longitudeProperty, bearingProperty, zoomProperty,
    tiltProperty, StyleBase
} from "./map-view-common";
import { Image } from "tns-core-modules/ui/image";
import { Color } from "tns-core-modules/color";
import * as imageSource from 'tns-core-modules/image-source';

declare class GMSMapViewDelegate extends NSObject {};
declare class GMSCameraPosition extends NSObject {
    target: any;
    bearing: any;
    zoom: any;
    viewingAngle: any;
    public static cameraWithLatitudeLongitudeZoomBearingViewingAngle(...params: any[]): GMSCameraPosition;
};
declare class GMSMapView extends NSObject {
    public static mapWithFrameCamera(...params: any[]): GMSMapView;
};
declare class GMSMarker extends NSObject {};
declare class GMSOverlay extends NSObject {};
declare class GMSMapStyle extends NSObject {
    public static styleWithJSONStringError(input: string): GMSMapStyle;
};
declare class GMSCoordinateBounds extends NSObject {
    public static alloc(): GMSCoordinateBounds;
    public initWithCoordinateCoordinate(...params: any[]): GMSCoordinateBounds
};
declare class GMSPolyline extends NSObject {};
declare class GMSPolygon extends NSObject {};
declare class GMSCircle extends NSObject {};
declare class GMSMutablePath extends NSObject {
    public static new(): GMSMutablePath
    public addCoordinate(...params: any[]): void
};
declare function UIEdgeInsetsMake(...params: any[]): any;

class MapViewDelegateImpl extends NSObject implements GMSMapViewDelegate {

    public static ObjCProtocols = [GMSMapViewDelegate];

    private _owner: WeakRef<MapView>;

    public static initWithOwner(owner: WeakRef<MapView>): MapViewDelegateImpl {
        let handler = <MapViewDelegateImpl>MapViewDelegateImpl.new();
        handler._owner = owner;
        return handler;
    }

    public mapViewIdleAtCameraPosition(mapView: GMSMapView, cameraPosition: GMSCameraPosition): void {
        let owner = this._owner.get();
        if (owner) {

            owner._processingCameraEvent = true;

            let cameraChanged: boolean = false;
            if (owner.latitude != cameraPosition.target.latitude) {
                cameraChanged = true;
                latitudeProperty.nativeValueChange(owner, cameraPosition.target.latitude);
            }
            if (owner.longitude != cameraPosition.target.longitude) {
                cameraChanged = true;
                longitudeProperty.nativeValueChange(owner, cameraPosition.target.longitude);
            }
            if (owner.bearing != cameraPosition.bearing) {
                cameraChanged = true;
                bearingProperty.nativeValueChange(owner, cameraPosition.bearing);
            }
            if (owner.zoom != cameraPosition.zoom) {
                cameraChanged = true;
                zoomProperty.nativeValueChange(owner, cameraPosition.zoom);
            }
            if (owner.tilt != cameraPosition.viewingAngle) {
                cameraChanged = true;
                tiltProperty.nativeValueChange(owner, cameraPosition.viewingAngle);
            }

            if (cameraChanged) {
                owner.notifyCameraEvent(MapViewBase.cameraChangedEvent, {
                    latitude: cameraPosition.target.latitude,
                    longitude: cameraPosition.target.longitude,
                    zoom: cameraPosition.zoom,
                    bearing: cameraPosition.bearing,
                    tilt: cameraPosition.viewingAngle
                });
            }

            owner._processingCameraEvent = false;
        }
    }

    public mapViewDidTapAtCoordinate(mapView: GMSMapView, coordinate: CLLocationCoordinate2D): void {
        let owner = this._owner.get();
        if (owner) {
            let position: Position = Position.positionFromLatLng(coordinate.latitude, coordinate.longitude);
            owner.notifyPositionEvent(MapViewBase.coordinateTappedEvent, position);
        }
    }

    public mapViewDidLongPressAtCoordinate(mapView: GMSMapView, coordinate: CLLocationCoordinate2D): void {
        let owner = this._owner.get();
        if (owner) {
            let position: Position = Position.positionFromLatLng(coordinate.latitude, coordinate.longitude);
            owner.notifyPositionEvent(MapViewBase.coordinateLongPressEvent, position);
        }
    }

    public mapViewDidTapMarker(mapView: GMSMapView, gmsMarker: GMSMarker): void {
        let owner = this._owner.get();
        if (owner) {
            let marker: Marker = owner.findMarker((marker: Marker) => marker.ios == gmsMarker);
            owner.notifyMarkerTapped(marker);
        }
    }

    public mapViewDidTapOverlay(mapView: GMSMapView, gmsOverlay: GMSOverlay): void {
        let owner = this._owner.get();
        if (owner) {
            let shape: ShapeBase = owner.findShape((shape: ShapeBase) => shape.ios == gmsOverlay);
            if (shape) {
                owner.notifyShapeTapped(shape);
            }
        }
    }
    public mapViewDidBeginDraggingMarker(mapView: GMSMapView, gmsMarker: GMSMarker): void {
        let owner = this._owner.get();
        if (owner) {
            let marker: Marker = owner.findMarker((marker: Marker) => marker.ios == gmsMarker);
            owner.notifyMarkerBeginDragging(marker);
        }
    }

    public mapViewDidEndDraggingMarker(mapView: GMSMapView, gmsMarker: GMSMarker): void {
        let owner = this._owner.get();
        if (owner) {
            let marker: Marker = owner.findMarker((marker: Marker) => marker.ios == gmsMarker);
            owner.notifyMarkerEndDragging(marker);
        }
    }

    public mapViewDidDragMarker(mapView: GMSMapView, gmsMarker: GMSMarker): void {
        let owner = this._owner.get();
        if (owner) {
            let marker: Marker = owner.findMarker((marker: Marker) => marker.ios == gmsMarker);
            owner.notifyMarkerDrag(marker);
        }
    }

    public mapViewDidTapInfoWindowOfMarker(mapView: GMSMapView, gmsMarker: GMSMarker): void {
        var owner = this._owner.get();
        if (owner) {
            var marker = owner.findMarker(function (marker) { return marker.ios == gmsMarker; });
            owner.notifyMarkerInfoWindowTapped(marker);
        }
    }
}


export class MapView extends MapViewBase {

    protected _markers: Array<Marker> = new Array<Marker>();
    private _pendingCameraUpdate: boolean;
    private _pendingPaddingUpdate: boolean;

    public createNativeView() {
        return GMSMapView.mapWithFrameCamera(CGRectZero, this._createCameraPosition());
    }

    public initNativeView() {
        this.nativeView = this.createNativeView();

        this.nativeView.delegate = MapViewDelegateImpl.initWithOwner(new WeakRef(this));

        setTimeout(function(){
            if(this._pendingCameraUpdate){
                this.updateCamera();
                this._pendingCameraUpdate = false;
            }
            if(this._pendingPaddingUpdate){
                this.updatePadding();
                this._pendingPaddingUpdate = false;
            }
            this.notifyMapReady();
        }.bind(this), 0);
    }

    private _createCameraPosition() {
        return GMSCameraPosition.cameraWithLatitudeLongitudeZoomBearingViewingAngle(
            this.latitude,
            this.longitude,
            this.zoom,
            this.bearing,
            this.tilt
        );
    }

    updateCamera() {
        if(!this.gMap){
            this._pendingCameraUpdate = true;
            return;
        }
        this.nativeView.animateToCameraPosition(this._createCameraPosition());
    }

    setViewport(bounds: Bounds, padding?: number) {
        var p = UIEdgeInsetsMake(padding, padding, padding, padding) || this.gMap.padding;
        let cameraPosition = this.nativeView.cameraForBoundsInsets(bounds.ios, p);
        this.nativeView.animateToCameraPosition(cameraPosition);
    }

    updatePadding() {
        if(!this.gMap){
            this._pendingPaddingUpdate = true;
            return;
        }
        if (this.padding) {
            this.gMap.padding = UIEdgeInsetsMake(
                this.padding[0] || 0,
                this.padding[2] || 0,
                this.padding[1] || 0,
                this.padding[3] || 0
            );
        }
    }

    get ios(): never {
        throw new Error('Now use instance.nativeView instead of instance.ios');
    }

    get gMap() {
        return this.nativeView;
    }

    addMarker(marker: Marker) {
        marker.ios.map = this.gMap;
        this._markers.push(marker);
    }

    removeMarker(marker: Marker) {
        marker.ios.map = null;
        this._markers.splice(this._markers.indexOf(marker), 1);
    }

    removeAllMarkers() {
        this._markers.forEach(marker => {
            marker.ios.map = null;
        });
        this._markers = [];
    }

    findMarker(callback: (marker: Marker) => boolean): Marker {
        return this._markers.find(callback);
    }

    addPolyline(shape: Polyline) {
        shape.loadPoints();
        shape.ios.map = this.gMap;
        this._shapes.push(shape);
    }

    addPolygon(shape: Polygon) {
        shape.ios.map = this.gMap;
        this._shapes.push(shape);
    }

    addCircle(shape: Circle) {
        shape.ios.map = this.gMap;
        this._shapes.push(shape);
    }

    removeShape(shape: ShapeBase) {
        shape.ios.map = null;
        this._shapes.splice(this._shapes.indexOf(shape), 1);
    }

    removeAllShapes() {
        this._shapes.forEach(shape => {
            shape.ios.map = null;
        });
        this._shapes = [];
    }

    findShape(callback: (shape: ShapeBase) => boolean): ShapeBase {
        return this._shapes.find(callback);
    }

    clear() {
        this._markers = [];
        this.nativeView.clear();
    }

    setStyle(style: StyleBase) {
        try {
            this.nativeView.mapStyle = GMSMapStyle.styleWithJSONStringError(JSON.stringify(style));
            return true;
        } catch(err) {
            return false;
        }
    }
}

export class Bounds extends BoundsBase {
    private _ios: any; /* GMSCoordinateBounds */
    private _north: Position;
    private _south: Position;
    get ios() {
        return this._ios;
    }

    get southwest() {
        return this._south;
    }

    set southwest(southwest:Position) {
        this._south = southwest.ios;
        if(this.northeast) {
            this._ios = GMSCoordinateBounds.alloc().initWithCoordinateCoordinate(this.southwest, this.northeast);
        }
    }

    get northeast() {
        return this._north;
    }

    set northeast(northeast:Position) {
        this._north = northeast.ios;
        if(this.southwest) {
            this._ios = GMSCoordinateBounds.alloc().initWithCoordinateCoordinate(this.southwest, this.northeast);
        }
    }

    constructor() {
        super();
        // this._ios = GMSCoordinateBounds.alloc().initWithCoordinateCoordinate(new Position(), new Position());
    }
}

export class Position extends PositionBase {
    private _ios: any; /* CLLocationCoordinate2D */
    get ios() {
        return this._ios;
    }

    get latitude() {
        return this._ios.latitude;
    }

    set latitude(latitude) {
        this._ios = CLLocationCoordinate2DMake(latitude, this.longitude);
    }

    get longitude() {
        return this._ios.longitude;
    }

    set longitude(longitude) {
        this._ios = CLLocationCoordinate2DMake(this.latitude, longitude);
    }

    constructor(ios?:CLLocationCoordinate2D) {
        super();
        this._ios = ios || CLLocationCoordinate2DMake(0, 0);
    }

    public static positionFromLatLng(latitude: number, longitude: number): Position {
        let position: Position = new Position();
        position.latitude = latitude;
        position.longitude = longitude;
        return position;
    }
}

export class Marker extends MarkerBase {
    private _ios: any;
    private _icon: Image;
    private _alpha = 1;
    private _visible = true;

    constructor() {
        super();
        this._ios = GMSMarker.new();
    }

    get position() {
        return new Position(this._ios.position);
    }

    set position(position: Position) {
        this._ios.position = position.ios;
    }

    get rotation() {
        return this._ios.rotation;
    }

    set rotation(value: number) {
        this._ios.rotation = value;
    }

    get zIndex() {
        return this._ios.zIndex;
    }

    set zIndex(value: number) {
        this._ios.zIndex = value;
    }

    get title() {
        return this._ios.title;
    }

    set title(title) {
        this._ios.title = title;
    }

    get snippet() {
        return this._ios.snippet;
    }

    set snippet(snippet) {
        this._ios.snippet = snippet;
    }

    showInfoWindow(): void {
        this._ios.map.selectedMarker = this._ios;
    }

    get icon() {
        return this._icon;
    }

    set icon(value: Image) {
        if (typeof value === 'string') {
            var tempIcon = new Image();
            tempIcon.imageSource = imageSource.fromResource(String(value));
            value = tempIcon;
        }
        this._icon = value;
        this._ios.icon = this._icon.ios.image;
    }

    get alpha() {
        return this._alpha;
    }

    set alpha(value: number) {
        this._alpha = value;
        if(this._visible) this._ios.opacity = value;
    }

    get visible() {
        return this._visible;
    }

    set visible(value: boolean) {
        this._visible = value;
        this._ios.opacity = (this._visible) ? this._alpha : 0;
    }

    get flat() {
        return this._ios.flat;
    }

    set flat(value: boolean) {
        this._ios.flat = value;
    }

    get anchor() {
        return [this._ios.groundAnchor.x, this._ios.groundAnchor.y];
    }

    set anchor(value: Array<number>) {
        this._ios.groundAnchor = CGPointMake(value[0], value[1]);
    }

    get draggable() {
        return this._ios.draggable;
    }

    set draggable(value: boolean) {
        this._ios.draggable = value;
    }

    get ios() {
        return this._ios;
    }
}

export class Polyline extends PolylineBase {
    private _ios: any;
    private _color: Color;

    constructor() {
        super();
        this._ios = GMSPolyline.new();
        this._points = [];
    }

    get clickable() {
        return this._ios.tappable;
    }

    set clickable(value: boolean) {
        this._ios.tappable = value;
    }

    get zIndex() {
        return this._ios.zIndex;
    }

    set zIndex(value: number) {
        this._ios.zIndex = value;
    }

    loadPoints(): void {
        var points = GMSMutablePath.new();
        this._points.forEach(function(point) {
            points.addCoordinate(point.ios);
        }.bind(this));
        this._ios.path = points;
    }

    reloadPoints(): void {
        this.loadPoints();
    }

    get width() {
        return this._ios.strokeWidth;
    }

    set width(value: number) {
        this._ios.strokeWidth = value;
    }

    get color() {
        return this._color;
    }

    set color(value: Color) {
        this._color = value;
        this._ios.strokeColor = value.ios;
    }

    get geodesic() {
        return this._ios.geodesic;
    }

    set geodesic(value: boolean) {
        this._ios.geodesic = value;
    }

    get ios() {
        return this._ios;
    }
}

export class Polygon extends PolygonBase {
    private _ios: any;
    private _strokeColor: Color;
    private _fillColor: Color;

    constructor() {
        super();
        this._ios = GMSPolygon.new();
        this._points = [];
    }

    get clickable() {
        return this._ios.tappable;
    }

    set clickable(value: boolean) {
        this._ios.tappable = value;
    }

    get zIndex() {
        return this._ios.zIndex;
    }

    set zIndex(value: number) {
        this._ios.zIndex = value;
    }



    loadPoints(): void {
        var points = GMSMutablePath.new();
        this._points.forEach(function(point) {
            points.addCoordinate(point.ios);
        }.bind(this));
        this._ios.path = points;
    }

    reloadPoints(): void {
        this.loadPoints();
    }

    get strokeWidth() {
        return this._ios.strokeWidth;
    }

    set strokeWidth(value: number) {
        this._ios.strokeWidth = value;
    }

    get strokeColor() {
        return this._strokeColor;
    }

    set strokeColor(value: Color) {
        this._strokeColor = value;
        this._ios.strokeColor = value.ios;
    }

    get fillColor() {
        return this._fillColor;
    }

    set fillColor(value: Color) {
        this._fillColor = value;
        this._ios.fillColor = value.ios;
    }

    get ios() {
        return this._ios;
    }
}

export class Circle extends CircleBase {
    private _ios: any;
    private _center: Position;
    private _strokeColor: Color;
    private _fillColor: Color;

    constructor() {
        super();
        this._ios = GMSCircle.new();
    }

    get clickable() {
        return this._ios.tappable;
    }

    set clickable(value: boolean) {
        this._ios.tappable = value;
    }

    get zIndex() {
        return this._ios.zIndex;
    }

    set zIndex(value: number) {
        this._ios.zIndex = value;
    }

    get center() {
        return this._center;
    }

    set center(value: Position) {
        this._center = value;
        this._ios.position = value.ios;
    }

    get radius() {
        return this._ios.radius;
    }

    set radius(value: number) {
        this._ios.radius = value;
    }

    get strokeWidth() {
        return this._ios.strokeWidth;
    }

    set strokeWidth(value: number) {
        this._ios.strokeWidth = value;
    }

    get strokeColor() {
        return this._strokeColor;
    }

    set strokeColor(value: Color) {
        this._strokeColor = value;
        this._ios.strokeColor = value.ios;
    }

    get fillColor() {
        return this._fillColor;
    }

    set fillColor(value: Color) {
        this._fillColor = value;
        this._ios.fillColor = value.ios;
    }

    get ios() {
        return this._ios;
    }
}
