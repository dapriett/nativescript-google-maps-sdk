import {
    MapViewBase, BoundsBase, CircleBase,
    MarkerBase, PolygonBase, PolylineBase, ProjectionBase,
    PositionBase, ShapeBase, latitudeProperty, VisibleRegionBase,
    longitudeProperty, bearingProperty, zoomProperty,
    tiltProperty, StyleBase, UISettingsBase, getColorHue
} from "./map-view-common";
import { GC, layout } from "@nativescript/core/utils"
import { Image, Color, ImageSource } from "@nativescript/core";
import { Point } from "@nativescript/core/ui/core/view";

export * from "./map-view-common";

declare function UIEdgeInsetsMake(...params: any[]): any;

@NativeClass()
class IndoorDisplayDelegateImpl extends NSObject implements GMSIndoorDisplayDelegate {

    public static ObjCProtocols = [GMSIndoorDisplayDelegate];

    private _owner: WeakRef<MapView>;

    public static initWithOwner(owner: WeakRef<MapView>): IndoorDisplayDelegateImpl {
        let handler = <IndoorDisplayDelegateImpl>IndoorDisplayDelegateImpl.new();
        handler._owner = owner;
        return handler;
    }

    public didChangeActiveBuilding(indoorBuilding: GMSIndoorBuilding): void {
        let owner = this._owner.get();
        if (owner) {
            let data = null;
            if (indoorBuilding) {
                const levels = [];
                let count = 0;

                while (count < indoorBuilding.levels.count) {
                    levels.push(
                        {
                            name: indoorBuilding.levels[count].name,
                            shortName: indoorBuilding.levels[count].shortName,
                        }
                    );
                    count += 1;
                }

                data = {
                    defaultLevelIndex: indoorBuilding.defaultLevelIndex,
                    levels: levels,
                    isUnderground: indoorBuilding.underground,
                };
            }
            owner.notifyBuildingFocusedEvent(data);
        }
    }

    public didChangeActiveLevel(activateLevel: GMSIndoorLevel): void {
        let owner = this._owner.get();
        if (owner) {
            let data = null;
            if (activateLevel) {
                data = {
                    name: activateLevel.name,
                    shortName: activateLevel.shortName,
                };
            }
            owner.notifyIndoorLevelActivatedEvent(data);
        }
    }
}

@NativeClass()
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

    public mapViewDidChangeCameraPosition(mapView: GMSMapView, cameraPosition: GMSCameraPosition) {
        let owner = this._owner.get();
        owner.notifyCameraEvent(MapViewBase.cameraMoveEvent, {
            latitude: cameraPosition.target.latitude,
            longitude: cameraPosition.target.longitude,
            zoom: cameraPosition.zoom,
            bearing: cameraPosition.bearing,
            tilt: cameraPosition.viewingAngle
        });
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

    public mapViewDidTapMarker(mapView: GMSMapView, gmsMarker: GMSMarker): boolean {
        const owner = this._owner.get();
        if (owner) {
            let marker: Marker = owner.findMarker((marker: Marker) => marker.ios == gmsMarker);
            if (marker) {
                owner.notifyMarkerTapped(marker);
            }
        }
        return false;
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
        let owner = this._owner.get();
        if (owner) {
            let marker: Marker = owner.findMarker((marker: Marker) => marker.ios == gmsMarker);
            owner.notifyMarkerInfoWindowTapped(marker);
        }
    }

    public mapViewDidCloseInfoWindowOfMarker(mapView: GMSMapView, gmsMarker: GMSMarker): void {
        let owner = this._owner.get();
        if (owner) {
            let marker: Marker = owner.findMarker((marker: Marker) => marker.ios == gmsMarker);
            owner.notifyMarkerInfoWindowClosed(marker);
        }
    }

    public didTapMyLocationButtonForMapView(mapView: GMSMapView): boolean {
        const owner = this._owner.get();
        
        if (owner) {
            owner.notifyMyLocationTapped();
            // Should return false in order to center the map on user position
            return false;
        }
        return true;
    }

    public mapViewMarkerInfoWindow(mapView: GMSMapView, gmsMarker: GMSMarker): UIView {
        return null;
    }

    public mapViewMarkerInfoContents(mapView: GMSMapView, gmsMarker: GMSMarker): UIView {
        let owner = this._owner.get();
        if (!owner) return null;
        let marker: Marker = owner.findMarker((marker: Marker) => marker.ios == gmsMarker);
        var content = owner._getMarkerInfoWindowContent(marker);
        if (content) {
            let width = Number(content.width);
            if (Number.isNaN(width)) width = null;
            let height = Number(content.height);
            if (Number.isNaN(height)) height = null;

            if (!height || !width) {
                const bounds: CGRect = UIScreen.mainScreen.bounds;
                width = width || (bounds.size.width * .7);
                height = height || (bounds.size.height * .4);
            }

            this._layoutRootView(content, CGRectMake(0, 0, width, height))
            return content.ios;
        }

        return null;
    }

    /*
        Replacement for _layoutRootView method removed in NativeScript 6
    */
    private _layoutRootView(rootView, parentBounds) {
        if (!rootView || !parentBounds) {
            return;
        }

        const size = parentBounds.size;
        const width = layout.toDevicePixels(size.width);
        const height = layout.toDevicePixels(size.height);

        const widthSpec = layout.makeMeasureSpec(width, layout.EXACTLY);
        const heightSpec = layout.makeMeasureSpec(height, layout.EXACTLY);

        rootView.measure(widthSpec, heightSpec);

        const origin = parentBounds.origin;
        const left = origin.x;
        const top = origin.y;

        rootView.layout(left, top, width, height);
    }
}



export class MapView extends MapViewBase {

    protected _markers: Array<Marker> = new Array<Marker>();

    public _delegate: MapViewDelegateImpl;
    private _indoorDelegate:IndoorDisplayDelegateImpl;

    constructor() {
        super();

        this.nativeView = GMSMapView.mapWithFrameCamera(CGRectZero, this._createCameraPosition());
        this._delegate = MapViewDelegateImpl.initWithOwner(new WeakRef(this));
        this._indoorDelegate = IndoorDisplayDelegateImpl.initWithOwner(new WeakRef(this));
        this.updatePadding();
    }

    public onLoaded() {
        super.onLoaded();
        this.nativeView.delegate = this._delegate;
        this.nativeView.indoorDisplay.delegate = this._indoorDelegate;
        this.notifyMapReady();
    }

    public onUnloaded() {
        this.nativeView.delegate = null;
        this.nativeView.indoorDisplay.delegate = null;
        super.onUnloaded();
    }

    public disposeNativeView() {
        this._markers = null;
        this._delegate = null;
        this._indoorDelegate=null;
        super.disposeNativeView();
        GC();
    };

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
        if (this.mapAnimationsEnabled) {
            this.nativeView.animateToCameraPosition(this._createCameraPosition());
        } else {
            this.nativeView.camera = this._createCameraPosition();
        }
    }

    setViewport(bounds: Bounds, padding?: number) {
        var p = UIEdgeInsetsMake(padding, padding, padding, padding) || this.gMap.padding;
        let cameraPosition = this.nativeView.cameraForBoundsInsets(bounds.ios, p);

        if (this.mapAnimationsEnabled) {
            this.nativeView.animateToCameraPosition(cameraPosition);
        } else {
            this.nativeView.camera = cameraPosition;
        }
    }

    updatePadding() {
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

    get projection(): Projection {
        return new Projection(this.nativeView.projection);
    }

    get settings(): UISettings {
        return (this.nativeView) ? new UISettings(this.nativeView.settings) : null;
    }

    get myLocationEnabled(): boolean {
        return (this.nativeView) ? this.nativeView.myLocationEnabled : false;
    }

    set myLocationEnabled(value: boolean) {
        if (this.nativeView) this.nativeView.myLocationEnabled = value;
    }

    setMinZoomMaxZoom() {
        this.gMap.setMinZoomMaxZoom(this.minZoom, this.maxZoom);
    }

    addMarker(...markers: Marker[]) {
        if(!markers || !this._markers || !this.gMap) return null;
        markers.forEach(marker => {
            marker.ios.map = this.gMap;
            this._markers.push(marker);
        });
    }

    removeMarker(...markers: Marker[]) {
        if(!markers || !this._markers || !this.gMap) return null;
        markers.forEach(marker => {
            this._unloadInfoWindowContent(marker);
            marker.ios.map = null;
            this._markers.splice(this._markers.indexOf(marker), 1);
        });
    }

    removeAllMarkers() {
        if(!this._markers) return null;
        this._markers.forEach(marker => {
            this._unloadInfoWindowContent(marker);
            marker.ios.map = null;
        });
        this._markers = [];
    }

    findMarker(callback: (marker: Marker) => boolean): Marker {
        if(!this._markers) return null;
        return this._markers.find(callback);
    }

    addPolyline(shape: Polyline) {
        if(!this._shapes) return null;
        shape.loadPoints();
        shape.ios.map = this.gMap;
        this._shapes.push(shape);
    }

    addPolygon(shape: Polygon) {
        if(!this._shapes) return null;
        shape.ios.map = this.gMap;
        this._shapes.push(shape);
    }

    addCircle(shape: Circle) {
        if(!this._shapes) return null;
        shape.ios.map = this.gMap;
        this._shapes.push(shape);
    }

    removeShape(shape: ShapeBase) {
        if(!this._shapes) return null;
        shape.ios.map = null;
        this._shapes.splice(this._shapes.indexOf(shape), 1);
    }

    removeAllShapes() {
        if(!this._shapes) return null;
        this._shapes.forEach(shape => {
            shape.ios.map = null;
        });
        this._shapes = [];
    }

    findShape(callback: (shape: ShapeBase) => boolean): ShapeBase {
        if(!this._shapes) return null;
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
        } catch (err) {
            return false;
        }
    }
}

export class UISettings implements UISettingsBase {
    private _ios: any;

    get ios() {
        return this._ios;
    }

    constructor(ios: any) {
        this._ios = ios;
    }

    get compassEnabled(): boolean {
        return this._ios.compassButton;
    }

    set compassEnabled(value: boolean) {
        this._ios.compassButton = value;
    }

    get indoorLevelPickerEnabled(): boolean {
        return this._ios.indoorPicker;
    }

    set indoorLevelPickerEnabled(value: boolean) {
        this._ios.indoorPicker = value;
    }

    get mapToolbarEnabled(): boolean {
        return false;
    }

    set mapToolbarEnabled(value: boolean) {
        if (value) console.warn("Map toolbar not available on iOS");
    }

    get myLocationButtonEnabled(): boolean {
        return this._ios.myLocationButton;
    }

    set myLocationButtonEnabled(value: boolean) {
        this._ios.myLocationButton = value;
    }

    get rotateGesturesEnabled(): boolean {
        return this._ios.rotateGestures;
    }

    set rotateGesturesEnabled(value: boolean) {
        this._ios.rotateGestures = value;
    }

    get scrollGesturesEnabled(): boolean {
        return this._ios.scrollGestures;
    }

    set scrollGesturesEnabled(value: boolean) {
        this._ios.scrollGestures = value;
    }

    get tiltGesturesEnabled(): boolean {
        return this._ios.tiltGestures;
    }

    set tiltGesturesEnabled(value: boolean) {
        this._ios.tiltGestures = value;
    }

    get zoomControlsEnabled(): boolean {
        return false;
    }

    set zoomControlsEnabled(value: boolean) {
        if (value) console.warn("Zoom controls not available on iOS");
    }

    get zoomGesturesEnabled(): boolean {
        return this._ios.zoomGestures;
    }

    set zoomGesturesEnabled(value: boolean) {
        this._ios.zoomGestures = value;
    }
}

export class Projection extends ProjectionBase {
    private _ios: any; /* GMSProjection */
    get ios() {
        return this._ios;
    }

    get visibleRegion(): VisibleRegion {
        return new VisibleRegion(this.ios.visibleRegion());
    }

    fromScreenLocation(point: Point) {
        var location = this.ios.coordinateForPoint(CGPointMake(point.x, point.y));
        return new Position(location);
    }

    toScreenLocation(position: Position) {
        var cgPoint = this.ios.pointForCoordinate(position.ios);
        return {
            x: cgPoint.x,
            y: cgPoint.y
        };
    }

    constructor(ios: any) {
        super();
        this._ios = ios;
    }
}

export class VisibleRegion extends VisibleRegionBase {
    private _ios: any; /* GMSVisibleRegion */
    get ios() {
        return this._ios;
    }

    get nearLeft(): Position {
        return new Position(this.ios.nearLeft);
    }

    get nearRight(): Position {
        return new Position(this.ios.nearRight);
    }

    get farLeft(): Position {
        return new Position(this.ios.farLeft);
    }

    get farRight(): Position {
        return new Position(this.ios.farRight);
    }

    get bounds(): Bounds {
        return new Bounds(GMSCoordinateBounds.alloc().initWithRegion(this.ios));
    }

    constructor(ios: any) {
        super();
        this._ios = ios;
    }
}

export class Bounds extends BoundsBase {
    private _ios: GMSCoordinateBounds;
    get ios() {
        return this._ios;
    }

    get southwest() {
        return new Position(this.ios.southWest);
    }

    get northeast() {
        return new Position(this._ios.northEast);
    }

    constructor(ios: GMSCoordinateBounds) {
        super();
        this._ios = ios;
    }

    public static fromCoordinates(southwest: Position, northeast: Position): Bounds {
        return new Bounds(GMSCoordinateBounds.alloc().initWithCoordinateCoordinate(southwest.ios, northeast.ios));
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

    constructor(ios?: CLLocationCoordinate2D) {
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
    private _color: number;
    private _icon: Image;
    private _alpha = 1;
    private _visible = true;

    private static cachedColorIcons: { [hue: number]: any } = {}

    private static getIconForColor(hue: number) {
        const hueKey = hue.toFixed(8);
        if (!Marker.cachedColorIcons[hueKey]) {
            const icon = GMSMarker.markerImageWithColor(UIColor.colorWithHueSaturationBrightnessAlpha(hue, 1, 1, 1));
            Marker.cachedColorIcons[hueKey] = icon;
        }
        return Marker.cachedColorIcons[hueKey];
    }

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

    isInfoWindowShown(): boolean {
        return this._ios.map.selectedMarker == this._ios;
    }

    hideInfoWindow(): void {
        this._ios.map.selectedMarker = null;
    }

    get color() {
        return this._color;
    }

    set color(value: Color | string | number) {
        value = getColorHue(value);

        this._color = value;
        if (this._color) {
            this._ios.icon = Marker.getIconForColor(this._color / 360);
        } else {
            this._ios.icon = null;
        }
    }

    get icon() {
        return this._icon;
    }

    set icon(value: Image | string) {
        if (typeof value === 'string') {
            var tempIcon = new Image();
            tempIcon.imageSource = ImageSource.fromResourceSync(String(value));
            value = tempIcon;
        }
        this._icon = value;
        this._ios.icon = (value) ? this._icon.imageSource.ios : null;
    }

    get alpha() {
        return this._alpha;
    }

    set alpha(value: number) {
        this._alpha = value;
        if (this._visible) this._ios.opacity = value;
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
        this._points.forEach(function (point) {
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
        this._holes = [];
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
        this._points.forEach((point: Position) => {
            points.addCoordinate(point.ios);
        });
        this._ios.path = points;
    }

    loadHoles(): void {
        var holes = [];
        this._holes.forEach((hole: Position[]) => {
            var points = GMSMutablePath.new();
            hole.forEach((point: Position) => {
                points.addCoordinate(point.ios);
            });
            holes.push(points);
        });
        this._ios.holes = holes;
    }

    reloadPoints(): void {
        this.loadPoints();
    }

    reloadHoles(): void {
        this.loadHoles();
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
