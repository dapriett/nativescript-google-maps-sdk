import { MapView as MapViewCommon, Position as PositionBase, Marker as MarkerBase } from "./map-view-common";
import { Image } from "ui/image";

class MapViewDelegateImpl extends NSObject implements GMSMapViewDelegate {

    public static ObjCProtocols = [GMSMapViewDelegate];
    
    private _owner: WeakRef<MapView>;

    public static initWithOwner(owner: WeakRef<MapView>): MapViewDelegateImpl {
        let handler = <MapViewDelegateImpl>MapViewDelegateImpl.new();
        handler._owner = owner;
        return handler;
    }

    public mapViewIdleAtCameraPosition(mapView: GMSMapView, cameraPosition : GMSCameraPosition) : void {
        let owner = this._owner.get();
        if (owner) {
            
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
            if (owner.tilt != cameraPosition.viewingAngle) {
                cameraChanged = true;
                owner._onPropertyChangedFromNative(MapViewCommon.tiltProperty, cameraPosition.viewingAngle);    
            }
            owner.notifyCameraEvent(MapViewCommon.cameraChangedEvent, {latitude: cameraPosition.target.latitude, longitude: cameraPosition.target.longitude
                , zoom: cameraPosition.zoom, bearing: cameraPosition.bearing, tilt: cameraPosition.viewingAngle});
        }
    }
    
    public mapViewDidTapMarker(mapView: GMSMapView, gmsMarker: GMSMarker) : void {
        let owner = this._owner.get();
        if (owner) {
            let marker: Marker = owner.findMarker((marker: Marker) => marker.ios == gmsMarker);
            owner.notifyMarkerTapped(marker);
        }
    }
}


export class MapView extends MapViewCommon {
    
    private _ios: any;
    private _delegate : any;
    private _markers : Array<Marker>;
    
    constructor() {
        super();
        this._markers = [];
        this._ios = GMSMapView.mapWithFrameCamera(CGRectZero, this._createCameraPosition());
    }
    
    onLoaded() {
        super.onLoaded();
        this.notifyMapReady();
        this._ios.delegate = this._delegate = MapViewDelegateImpl.initWithOwner(new WeakRef(this));
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
        this.ios.animateToCameraPosition(this._createCameraPosition());
    }
    
    get ios() {
        return this._ios;
    }
    
    get gMap() {
        return this._ios;
    }
    
    set ios(value : any) {
        console.warn('Cannot set value from outside this class');
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
        this._markers = [];
        this.ios.clear();
    }
    
    public findMarker(callback : (marker: Marker) => boolean) : Marker {
        return this._markers.find(callback);
    }
    
    public notifyMarkerTapped(marker : Marker) {
        this.notifyMarkerEvent(MapViewCommon.markerSelectEvent, marker);
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
        return this._ios.latitude;
    }
    
    set longitude(longitude) {
        this._ios = CLLocationCoordinate2DMake(this.latitude, longitude);
    }
    
    constructor() {
        super();
        this._ios = CLLocationCoordinate2DMake(0, 0);
    }
    
    public static positionFromLatLng(latitude: number, longitude: number) : Position {
        let position: Position = new Position();
        position.latitude = latitude;
        position.longitude = longitude;
        return position;
    }
}

export class Marker extends MarkerBase {
    private _ios : any;
    private _position: Position;
    private _icon: Image;
    
    constructor() {
        super();
        this._ios = GMSMarker.new();
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
    
    get position() {
        return this._position;
    }
    
    set position(position: Position) {
        this._position = position;
        this._ios.position = position.ios;
    }
    
    get icon() {
        return this._icon;
    }
    
    set icon(icon : Image) {
        this._icon = icon;
        this._ios.icon = icon.ios;
    }
    
    get ios() {
        return this._ios;
    }
}