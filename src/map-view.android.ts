import { Application, AndroidApplication, Image, Color } from "@nativescript/core";
import { Point } from "@nativescript/core/ui/core/view";
import { ImageSource } from "@nativescript/core/image-source";

import {
    MapViewBase, BoundsBase, CircleBase, MarkerBase,
    PolygonBase, PolylineBase, ProjectionBase, PositionBase,
    ShapeBase, VisibleRegionBase, StyleBase, UISettingsBase,
    latitudeProperty, getColorHue, longitudeProperty,
    bearingProperty, zoomProperty, tiltProperty,
} from "./map-view-common";

import {IndoorLevel} from "./map-view"; // TODO to be implemented

export * from "./map-view-common";

declare const com: any;
declare const android: any;

export class MapView extends MapViewBase {

    protected _markers: Array<Marker> = new Array<Marker>();
    public _context: any;
    private _pendingCameraUpdate: boolean;

    onLoaded(): void {

        super.onLoaded();
        Application.android.on(AndroidApplication.activityPausedEvent, this.onActivityPaused, this);
        Application.android.on(AndroidApplication.activityResumedEvent, this.onActivityResumed, this);
        Application.android.on(AndroidApplication.saveActivityStateEvent, this.onActivitySaveInstanceState, this);
        Application.android.on(AndroidApplication.activityDestroyedEvent, this.onActivityDestroyed, this);
    }

    onUnloaded(): void {

        super.onUnloaded();
        Application.android.off(AndroidApplication.activityPausedEvent, this.onActivityPaused, this);
        Application.android.off(AndroidApplication.activityResumedEvent, this.onActivityResumed, this);
        Application.android.off(AndroidApplication.saveActivityStateEvent, this.onActivitySaveInstanceState, this);
        Application.android.off(AndroidApplication.activityDestroyedEvent, this.onActivityDestroyed, this);
    }

    public disposeNativeView(): void {

        if(this.nativeView){
            this.nativeView.onDestroy();
        }
        if(this._gMap){
            this._gMap.setMyLocationEnabled(false);
            this._gMap.clear();

            // Check if this is can be an alternative position for the removed code
        }

        /*
         * Temporary fix for issue #422
         * Problem: Markers are not showing after view load
         * Caused by: this._markers === undefined due to this method being called when the view is loaded
         * Hypotesis: recent updates in nativescript core libraries may have changed the view lifecycle sequence.
         * Possible long term fix:
         *  1) identify the caller of this.disposeNativeView();
         *  2) identify any change in the view lifecycle sequence - view was disposed prior of being loaded up, in the past version?
         *  3) once previous points have been clarified, check if the commented code is still required;
         *  4) if point 3 is affirmative, then adapt the commented logic to the new view lifecycle
         *
         * Note: probably this code is releasing the objects from memory. It's needed after view disposal, but not when
         *       loading the view for sure. In the iOS counterpart a GC() is called.

         this._context = undefined;
         this._gMap    = undefined;
         this._markers = undefined;
         this._shapes  = undefined;

         */

        super.disposeNativeView();
    }

    private onActivityPaused(args: any) {
        if (!this.nativeView || this._context != args.activity) return;
        this.nativeView.onPause();
    }

    private onActivityResumed(args: any) {
        if (!this.nativeView || this._context != args.activity) return;
        this.nativeView.onResume();
    }

    private onActivitySaveInstanceState(args: any) {
        if (!this.nativeView || this._context != args.activity) return;
        this.nativeView.onSaveInstanceState(args.bundle);
    }

    private onActivityDestroyed(args: any) {
        if (!this.nativeView || this._context != args.activity) return;
        this.nativeView.onDestroy();
    }

    public createNativeView(): any {

        const cameraPosition = this._createCameraPosition();

        let options = new com.google.android.gms.maps.GoogleMapOptions();
        if (cameraPosition) options = options.camera(cameraPosition);
        this.nativeView = new com.google.android.gms.maps.MapView(this._context, options);
        this.nativeView.onCreate(null);
        this.nativeView.onResume();

        const that = new WeakRef(this);

        const mapReadyCallback = new com.google.android.gms.maps.OnMapReadyCallback({
            onMapReady: (gMap) => {
                const owner = that.get();
                owner._gMap = gMap;
                owner.setMinZoomMaxZoom();
                owner.updatePadding();
                if (owner._pendingCameraUpdate) {
                    owner.updateCamera();
                }

                gMap.setOnMapClickListener(new com.google.android.gms.maps.GoogleMap.OnMapClickListener({
                    onMapClick: (gmsPoint) => {

                        const position: Position = new Position(gmsPoint);
                        owner.notifyPositionEvent(MapViewBase.coordinateTappedEvent, position);
                    }
                }));

                gMap.setOnMapLongClickListener(new com.google.android.gms.maps.GoogleMap.OnMapLongClickListener({
                    onMapLongClick: (gmsPoint) => {
                        const position: Position = new Position(gmsPoint);
                        owner.notifyPositionEvent(MapViewBase.coordinateLongPressEvent, position);
                    }
                }));

                gMap.setOnMarkerClickListener(new com.google.android.gms.maps.GoogleMap.OnMarkerClickListener({
                    onMarkerClick: (gmsMarker) => {
                        const marker: Marker = owner.findMarker((marker: Marker) => marker.android.getId() === gmsMarker.getId());
                        owner.notifyMarkerTapped(marker);

                        return false;
                    }
                }));

                gMap.setOnInfoWindowClickListener(new com.google.android.gms.maps.GoogleMap.OnInfoWindowClickListener({
                    onInfoWindowClick: (gmsMarker) => {
                        const marker = owner.findMarker((marker: Marker) => marker.android.getId() === gmsMarker.getId());
                        owner.notifyMarkerInfoWindowTapped(marker);

                        return false;
                    }
                }));

                gMap.setOnInfoWindowCloseListener(new com.google.android.gms.maps.GoogleMap.OnInfoWindowCloseListener({
                    onInfoWindowClose: (gmsMarker) => {
                        const marker = owner.findMarker((marker: Marker) => marker.android.getId() === gmsMarker.getId());
                        owner.notifyMarkerInfoWindowClosed(marker);

                        return false;
                    }
                }));

                gMap.setOnMyLocationButtonClickListener(new com.google.android.gms.maps.GoogleMap.OnMyLocationButtonClickListener({
                    onMyLocationButtonClick: () => {
                        owner.notifyMyLocationTapped();

                        return false;
                    },
                }));

                gMap.setOnIndoorStateChangeListener(new com.google.android.gms.maps.GoogleMap.OnIndoorStateChangeListener({
                    onIndoorBuildingFocused: () => {
                        const buildingFocused = gMap.getFocusedBuilding();
                        let data = null;
                        if (buildingFocused) {
                            const levels = [];
                            let count = 0;
                            while (count < buildingFocused.getLevels().size()) {
                                levels.push(
                                    {
                                        name: buildingFocused.getLevels().get(count).getName(),
                                        shortName: buildingFocused.getLevels().get(count).getShortName(),
                                    }
                                );
                                count += 1;
                            }
                            data = {
                                defaultLevelIndex: buildingFocused.getDefaultLevelIndex(),
                                levels: levels,
                                isUnderground: buildingFocused.isUnderground(),
                            };

                        }
                        owner.notifyBuildingFocusedEvent(data);

                        return false;
                    },
                    onIndoorLevelActivated: (gmsIndoorBuilding) => {
                        const level = gmsIndoorBuilding.getLevels().get(gmsIndoorBuilding.getActiveLevelIndex());
                        owner.notifyIndoorLevelActivatedEvent({
                            name: level.getName(),
                            shortName: level.getShortName(),
                        });

                        return false;
                    }
                }));

                // Add checks for backwards capability to earlier SDK versions
                if (gMap.setOnCircleClickListener) {
                    gMap.setOnCircleClickListener(new com.google.android.gms.maps.GoogleMap.OnCircleClickListener({
                        onCircleClick: (gmsCircle) => {
                            const shape: ShapeBase = owner.findShape((shape: ShapeBase) => shape.android.getId() === gmsCircle.getId());
                            if (shape) {
                                owner.notifyShapeTapped(shape);
                            }
                            return false;
                        }
                    }));
                }

                if (gMap.setOnPolylineClickListener) {
                    gMap.setOnPolylineClickListener(new com.google.android.gms.maps.GoogleMap.OnPolylineClickListener({
                        onPolylineClick: (gmsPolyline) => {
                            const shape: ShapeBase = owner.findShape((shape: ShapeBase) => shape.android.getId() === gmsPolyline.getId());
                            if (shape) {
                                owner.notifyShapeTapped(shape);
                            }
                            return false;
                        }
                    }));
                }

                if (gMap.setOnPolygonClickListener) {
                    gMap.setOnPolygonClickListener(new com.google.android.gms.maps.GoogleMap.OnPolygonClickListener({
                        onPolygonClick: (gmsPolygon) => {
                            const shape: ShapeBase = owner.findShape((shape: ShapeBase) => shape.android.getId() === gmsPolygon.getId());
                            if (shape) {
                                owner.notifyShapeTapped(shape);
                            }
                            return false;
                        }
                    }));
                }

                gMap.setOnMarkerDragListener(new com.google.android.gms.maps.GoogleMap.OnMarkerDragListener({
                    onMarkerDrag: (gmsMarker) => {
                        const marker: Marker = owner.findMarker((marker: Marker) => marker.android.getId() === gmsMarker.getId());
                        owner.notifyMarkerDrag(marker);
                    },
                    onMarkerDragEnd: (gmsMarker) => {
                        const marker: Marker = owner.findMarker((marker: Marker) => marker.android.getId() === gmsMarker.getId());
                        owner.notifyMarkerEndDragging(marker);
                    },
                    onMarkerDragStart: (gmsMarker) => {
                        const marker: Marker = owner.findMarker((marker: Marker) => marker.android.getId() === gmsMarker.getId());
                        owner.notifyMarkerBeginDragging(marker);
                    }
                }));

                const cameraChangeHandler = (cameraPosition) => {
                    owner._processingCameraEvent = true;

                    let cameraChanged = false;
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
                    if (owner.tilt != cameraPosition.tilt) {
                        cameraChanged = true;
                        tiltProperty.nativeValueChange(owner, cameraPosition.tilt);
                    }

                    if (cameraChanged) {
                        owner.notifyCameraEvent(MapViewBase.cameraChangedEvent, {
                            latitude: cameraPosition.target.latitude,
                            longitude: cameraPosition.target.longitude,
                            zoom: cameraPosition.zoom,
                            bearing: cameraPosition.bearing,
                            tilt: cameraPosition.tilt
                        });
                    }

                    owner._processingCameraEvent = false;

                }

                // If newer SDK version, use onCameraIdle
                if (gMap.setOnCameraIdleListener) {
                    gMap.setOnCameraIdleListener(new com.google.android.gms.maps.GoogleMap.OnCameraIdleListener({
                        onCameraIdle: () => cameraChangeHandler(gMap.getCameraPosition())
                    }));
                } else if (gMap.setOnCameraChangeListener) {
                    gMap.setOnCameraChangeListener(new com.google.android.gms.maps.GoogleMap.OnCameraChangeListener({
                        onCameraChange: cameraChangeHandler
                    }));
                }

                if (gMap.setOnCameraMoveListener) {
                    gMap.setOnCameraMoveListener(new com.google.android.gms.maps.GoogleMap.OnCameraMoveListener({
                        onCameraMove: () => {
                            const cameraPosition = gMap.getCameraPosition();
                            owner.notifyCameraEvent(MapViewBase.cameraMoveEvent, {
                                latitude: cameraPosition.target.latitude,
                                longitude: cameraPosition.target.longitude,
                                zoom: cameraPosition.zoom,
                                bearing: cameraPosition.bearing,
                                tilt: cameraPosition.tilt
                            });
                        }
                    }));
                }

                gMap.setInfoWindowAdapter(new com.google.android.gms.maps.GoogleMap.InfoWindowAdapter({

                    getInfoWindow: function (gmsMarker) {
                        return null;
                    },

                    getInfoContents: function (gmsMarker) {
                        const marker: Marker = owner.findMarker((marker: Marker) => marker.android.getId() === gmsMarker.getId());
                        const content = owner._getMarkerInfoWindowContent(marker);
                        return (content) ? content.android : null;
                    }
                }));

                owner.notifyMapReady();
            }
        });

        this.nativeView.getMapAsync(mapReadyCallback);

        return this.nativeView;
    }

    private _createCameraPosition() {
        const cpBuilder = new com.google.android.gms.maps.model.CameraPosition.Builder();
        let update = false;

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
    }

    updateCamera() {
        const cameraPosition = this._createCameraPosition();
        if (!cameraPosition) return;

        if (!this.gMap) {
            this._pendingCameraUpdate = true;
            return;
        }

        this._pendingCameraUpdate = false;

        const cameraUpdate = com.google.android.gms.maps.CameraUpdateFactory.newCameraPosition(cameraPosition);
        if (this.mapAnimationsEnabled) {
            this.gMap.animateCamera(cameraUpdate);
        } else {
            this.gMap.moveCamera(cameraUpdate);
        }
    }

    setViewport(bounds: Bounds, padding?: number) {
        const p = padding || 0;
        const cameraUpdate = com.google.android.gms.maps.CameraUpdateFactory.newLatLngBounds(bounds.android, p);
        if (!this.gMap) {
            this._pendingCameraUpdate = true
            return;
        }

        this._pendingCameraUpdate = false;
        if (this.mapAnimationsEnabled) {
            this.gMap.animateCamera(cameraUpdate);
        } else {
            this.gMap.moveCamera(cameraUpdate);
        }
    }

    updatePadding() {
        if (this.padding && this.gMap) {
            this.gMap.setPadding(
                this.padding[2] || 0,
                this.padding[0] || 0,
                this.padding[3] || 0,
                this.padding[1] || 0
            );
        }
    }

    get android(): never {
        throw new Error('Now use instance.nativeView instead of instance.android');
    }

    get gMap() {
        return this._gMap;
    }

    get projection(): Projection {
        return (this._gMap) ? new Projection(this._gMap.getProjection()) : null;
    }

    get settings(): UISettings {
        return (this._gMap) ? new UISettings(this._gMap.getUiSettings()) : null;
    }

    get myLocationEnabled(): boolean {
        return (this._gMap) ? this._gMap.isMyLocationEnabled() : false;
    }

    set myLocationEnabled(value: boolean) {
        if (this._gMap) this._gMap.setMyLocationEnabled(value);
    }

    setMinZoomMaxZoom() {
        if (this.gMap) {
            this.gMap.setMinZoomPreference(this.minZoom);
            this.gMap.setMaxZoomPreference(this.maxZoom);
        }
    }

    addMarker(...markers: Marker[]) {
        if(!markers || !this._markers || !this.gMap) return null;
        markers.forEach(marker => {
            marker.android = this.gMap.addMarker(marker.android);
            this._markers.push(marker);
        });
    }

    removeMarker(...markers: Marker[]) {
        if(!markers || !this._markers || !this.gMap) return null;
        markers.forEach(marker => {
            this._unloadInfoWindowContent(marker);
            marker.android.remove();
            this._markers.splice(this._markers.indexOf(marker), 1);
        });
    }

    removeAllMarkers() {
        if(!this._markers || !this.gMap || !this._markers.length) return null;
        this._markers.forEach(marker => {
            this._unloadInfoWindowContent(marker);
            marker.android.remove();
        });
        this._markers = [];
    }

    findMarker(callback: (marker: Marker) => boolean): Marker {
        if(!this._markers) return null;
        return this._markers.find(callback);
    }

    addPolyline(shape: Polyline) {
        if(!this.gMap) return null;
        shape.loadPoints();
        shape.android = this.gMap.addPolyline(shape.android);
        this._shapes.push(shape);
    }

    addPolygon(shape: Polygon) {
        if(!this.gMap) return null;
        shape.loadPoints();
        shape.loadHoles();
        shape.android = this.gMap.addPolygon(shape.android);
        this._shapes.push(shape);
    }

    addCircle(shape: Circle) {
        if(!this._shapes || !this.gMap) return null;
        shape.android = this.gMap.addCircle(shape.android);
        this._shapes.push(shape);
    }

    removeShape(shape: ShapeBase) {
        if(!this._shapes) return null;
        shape.android.remove();
        this._shapes.splice(this._shapes.indexOf(shape), 1);
    }

    removeAllShapes() {
        if(!this._shapes) return null;
        this._shapes.forEach(shape => {
            shape.android.remove();
        });
        this._shapes = [];
    }

    setStyle(style: StyleBase): boolean {
        if(!this.gMap) return null;
        const styleOptions = new com.google.android.gms.maps.model.MapStyleOptions(JSON.stringify(style));
        return this.gMap.setMapStyle(styleOptions);
    }

    findShape(callback: (shape: ShapeBase) => boolean): ShapeBase {
        if(!this._shapes) return null;
        return this._shapes.find(callback);
    }

    clear() {
        this._markers = [];
        this._shapes = [];
        this.gMap.clear();
    }

}

export class UISettings extends UISettingsBase {
    private _android: any;

    get android() {
        return this._android;
    }

    constructor(android: any) {
        super();
        this._android = android;
    }

    get compassEnabled(): boolean {
        return this._android.isCompassEnabled();
    }

    set compassEnabled(value: boolean) {
        this._android.setCompassEnabled(value);
    }

    get indoorLevelPickerEnabled(): boolean {
        return this._android.isIndoorLevelPickerEnabled();
    }

    set indoorLevelPickerEnabled(value: boolean) {
        this._android.setIndoorLevelPickerEnabled(value);
    }

    get mapToolbarEnabled(): boolean {
        return this._android.isMapToolbarEnabled();
    }

    set mapToolbarEnabled(value: boolean) {
        this._android.setMapToolbarEnabled(value);
    }

    get myLocationButtonEnabled(): boolean {
        return this._android.isMyLocationButtonEnabled();
    }

    set myLocationButtonEnabled(value: boolean) {
        this._android.setMyLocationButtonEnabled(value);
    }

    get rotateGesturesEnabled(): boolean {
        return this._android.isRotateGesturesEnabled();
    }

    set rotateGesturesEnabled(value: boolean) {
        this._android.setRotateGesturesEnabled(value);
    }

    get scrollGesturesEnabled(): boolean {
        return this._android.isScrollGesturesEnabled();
    }

    set scrollGesturesEnabled(value: boolean) {
        this._android.setScrollGesturesEnabled(value);
    }

    get tiltGesturesEnabled(): boolean {
        return this._android.isTiltGesturesEnabled();
    }

    set tiltGesturesEnabled(value: boolean) {
        this._android.setTiltGesturesEnabled(value);
    }

    get zoomControlsEnabled(): boolean {
        return this._android.isZoomControlsEnabled();
    }

    set zoomControlsEnabled(value: boolean) {
        this._android.setZoomControlsEnabled(value);
    }

    get zoomGesturesEnabled(): boolean {
        return this._android.isZoomGesturesEnabled();
    }

    set zoomGesturesEnabled(value: boolean) {
        this._android.setZoomGesturesEnabled(value);
    }
}

export class Projection extends ProjectionBase {
    private _android: any; /* GMSProjection */
    get android() {
        return this._android;
    }

    get visibleRegion(): VisibleRegion {
        return new VisibleRegion(this.android.getVisibleRegion());
    }

    fromScreenLocation(point: Point) {
        const latLng = this.android.fromScreenLocation(new android.graphics.Point(point.x, point.y));
        return new Position(latLng);
    }

    toScreenLocation(position: Position) {
        const point = this.android.toScreenLocation(position.android);
        return {
            x: point.x,
            y: point.y
        };
    }

    constructor(android: any) {
        super();
        this._android = android;
    }
}

export class VisibleRegion extends VisibleRegionBase {
    private _android: any;
    get android() {
        return this._android;
    }

    get nearLeft(): Position {
        return new Position(this.android.nearLeft);
    }

    get nearRight(): Position {
        return new Position(this.android.nearRight);
    }

    get farLeft(): Position {
        return new Position(this.android.farLeft);
    }

    get farRight(): Position {
        return new Position(this.android.farRight);
    }

    get bounds(): Bounds {
        return new Bounds(this.android.latLngBounds);
    }

    constructor(android: any) {
        super();
        this._android = android;
    }
}

export class Position extends PositionBase {

    private _android: any;

    get android() {
        return this._android;
    }

    get latitude() {
        return this._android.latitude;
    }

    set latitude(latitude: number) {
        this._android = new com.google.android.gms.maps.model.LatLng(parseFloat("" + latitude), this.longitude);
    }

    get longitude() {
        return this._android.longitude;
    }

    set longitude(longitude: number) {
        this._android = new com.google.android.gms.maps.model.LatLng(this.latitude, parseFloat("" + longitude));
    }

    constructor(android?: any) {
        super();
        this._android = android || new com.google.android.gms.maps.model.LatLng(0, 0);
    }

    public static positionFromLatLng(latitude: number, longitude: number): Position {
        const position: Position = new Position();
        position.latitude = latitude;
        position.longitude = longitude;
        return position;
    }
}

export class Bounds extends BoundsBase {
    private _android: any;
    get android() {
        return this._android;
    }

    get southwest() {
        return new Position(this.android.southwest);
    }

    get northeast() {
        return new Position(this.android.northeast);
    }

    constructor(android: any) {
        super();
        this._android = android;
    }

    public static fromCoordinates(southwest: Position, northeast: Position): Bounds {
        return new Bounds(new com.google.android.gms.maps.model.LatLngBounds(southwest.android, northeast.android));
    }
}

    type ImageOrString = Image | string;

export class Marker extends MarkerBase {

    private _android: any;
    private _color: number;
    private _icon: Image;
    private _isMarker = false;

    static CLASS = 'com.google.android.gms.maps.model.Marker';

    constructor() {
        super();
        this.android = new com.google.android.gms.maps.model.MarkerOptions();
    }


    get position() {
        return new Position(this._android.getPosition());
    }

    set position(value: Position) {
        if (this._isMarker) {
            this._android.setPosition(value.android);
        } else {
            this._android.position(value.android);
        }
    }

    get rotation() {
        return this._android.getRotation();
    }

    set rotation(value: number) {
        if (this._isMarker) {
            this._android.setRotation(value);
        } else {
            this._android.rotation(value);
        }
    }

    get zIndex() {
        return this._android.getZIndex();
    }

    set zIndex(value: number) {
        if (this._isMarker) {
            this._android.setZIndex(value);
        } else {
            this._android.zIndex(value);
        }
    }

    get title() {
        return this._android.getTitle();
    }

    set title(title: string) {
        if (this._isMarker) {
            this._android.setTitle(title);
        } else {
            this._android.title(title);
        }
    }

    get snippet() {
        return this._android.getSnippet();
    }

    set snippet(snippet: string) {
        if (this._isMarker) {
            this._android.setSnippet(snippet);
        } else {
            this._android.snippet(snippet);
        }
    }

    showInfoWindow(): void {
        if (this._isMarker) {
            this.android.showInfoWindow();
        }
    }

    isInfoWindowShown(): boolean {
        return (this._isMarker) ? this.android.showInfoWindow() : false;
    }

    hideInfoWindow(): void {
        if (this._isMarker) {
            this.android.hideInfoWindow();
        }
    }

    get color() {
        return this._color;
    }

    set color(value: Color | string | number) {
        value = getColorHue(value);

        this._color = value;

        const androidIcon = (value) ? com.google.android.gms.maps.model.BitmapDescriptorFactory.defaultMarker(value) : null;
        if (this._isMarker) {
            this._android.setIcon(androidIcon);
        } else {
            this._android.icon(androidIcon);
        }
    }

    get icon() {
        return this._icon;
    }

    /**
     * Set the Marker icon
     * @param value string(resource name), or an Image.
     * @default if null, the default marker will be used.
     */
    set icon(value: Image | string) {

        if (typeof value === 'string') {

            ImageSource.fromResource(String(value)).then((imgResource) => {

                const tmpIcon       = new Image();
                tmpIcon.imageSource = imgResource;
                this._icon          = tmpIcon;

            }).catch(err => {
                console.error(`Couldn't load the image resource, using the default one. (${err})`);
            });
        }
        else if (value instanceof Image) {

            this._icon = value;
        }

        const androidIcon = (value) ? com.google.android.gms.maps.model.BitmapDescriptorFactory.fromBitmap(this._icon.imageSource.android) : null;

        if (this._isMarker) {
            this._android.setIcon(androidIcon);
        } else {
            this._android.icon(androidIcon);
        }
    }


    get alpha() {
        return this._android.getAlpha();
    }

    set alpha(value: number) {
        if (this._isMarker) {
            this._android.setAlpha(value);
        } else {
            this._android.alpha(value);
        }
    }

    get flat() {
        return this._android.isFlat();
    }

    set flat(value: boolean) {
        if (this._isMarker) {
            this._android.setFlat(value);
        } else {
            this._android.flat(value);
        }
    }

    get anchor() {
        return [this._android.getAnchorU(), this._android.getAnchorV()];
    }

    set anchor(value: Array<number>) {
        if (this._isMarker) {
            this._android.setAnchor(value[0], value[1]);
        } else {
            this._android.anchor(value[0], value[1]);
        }
    }

    get draggable() {
        return this._android.isDraggable();
    }

    set draggable(value: boolean) {
        if (this._isMarker) {
            this._android.setDraggable(value);
        } else {
            this._android.draggable(value);
        }
    }

    get visible() {
        return this._android.isVisible();
    }

    set visible(value: boolean) {
        if (this._isMarker) {
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
        this._isMarker = android.getClass().getName() === Marker.CLASS;
    }
}


export class Polyline extends PolylineBase {
    private _android: any;
    private _color: Color;
    private _isReal = false;

    static CLASS = 'com.google.android.gms.maps.model.Polyline';

    constructor() {
        super();
        this.android = new com.google.android.gms.maps.model.PolylineOptions();
        this._points = new Array<Position>();
    }

    get clickable() {
        return this._android.isClickable();
    }

    set clickable(value: boolean) {
        if (this._isReal) {
            this._android.setClickable(value);
        } else {
            this._android.clickable(value);
        }
    }

    get zIndex() {
        return this._android.getZIndex();
    }

    set zIndex(value: number) {
        if (this._isReal) {
            this._android.setZIndex(value);
        } else {
            this._android.zIndex(value);
        }
    }

    get visible() {
        return this._android.isVisible();
    }

    set visible(value: boolean) {
        if (this._isReal) {
            this._android.setVisible(value);
        } else {
            this._android.visible(value);
        }
    }

    loadPoints(): void {
        if (!this._isReal) {
            this._points.forEach((point: Position) => {
                this._android.add(point.android);
            });
        }
    }

    reloadPoints(): void {
        if (this._isReal) {
            const points = new java.util.ArrayList();
            this._points.forEach((point: Position) => {
                points.add(point.android);
            });
            this._android.setPoints(points);
        }
    }

    get width() {
        return this._android.getStrokeWidth();
    }

    set width(value: number) {
        if (this._isReal) {
            this._android.setWidth(value);
        } else {
            this._android.width(value);
        }
    }

    get color() {
        return this._color;
    }

    set color(value: Color) {
        this._color = value;
        if (this._isReal) {
            this._android.setColor(value.android);
        } else {
            this._android.color(value.android);
        }
    }

    get geodesic() {
        return this._android.isGeodesic();
    }

    set geodesic(value: boolean) {
        if (this._isReal) {
            this._android.setGeodesic(value);
        } else {
            this._android.geodesic(value);
        }
    }

    get android() {
        return this._android;
    }

    set android(android) {
        this._android = android;
        this._isReal = android.getClass().getName() === Polyline.CLASS;
    }
}

export class Polygon extends PolygonBase {
    private _android: any;
    private _strokeColor: Color;
    private _fillColor: Color;
    private _isReal = false;

    static CLASS = 'com.google.android.gms.maps.model.Polygon';

    constructor() {
        super();
        this.android = new com.google.android.gms.maps.model.PolygonOptions();
        this._points = [];
        this._holes = [];
    }

    get clickable() {
        return this._android.isClickable();
    }

    set clickable(value: boolean) {
        if (this._isReal) {
            this._android.setClickable(value);
        } else {
            this._android.clickable(value);
        }
    }

    get zIndex() {
        return this._android.getZIndex();
    }

    set zIndex(value: number) {
        if (this._isReal) {
            this._android.setZIndex(value);
        } else {
            this._android.zIndex(value);
        }
    }

    get visible() {
        return this._android.isVisible();
    }

    set visible(value: boolean) {
        if (this._isReal) {
            this._android.setVisible(value);
        } else {
            this._android.visible(value);
        }
    }

    loadPoints(): void {
        if (!this._isReal) {
            this._points.forEach((point: Position) => {
                this._android.add(point.android);
            });
        }
    }

    loadHoles(): void {
        if (!this._isReal) {
            this._holes.forEach((hole: Position[]) => {
                const points = new java.util.ArrayList();
                hole.forEach((point: Position) => {
                    points.add(point.android);
                });
                this._android.addHole(points);
            });
        }
    }

    reloadPoints(): void {
        if (this._isReal) {
            const points = new java.util.ArrayList();
            this._points.forEach((point: Position) => {
                points.add(point.android);
            });
            this._android.setPoints(points);
        }
    }

    reloadHoles(): void {
        if (this._isReal) {
            const holes = new java.util.ArrayList();
            this._holes.forEach((hole) => {
                const points = new java.util.ArrayList();
                hole.forEach((point) => {
                    points.add(point.android);
                });
                holes.add(points);
            });
            this._android.setHoles(holes);
        }
    }

    get strokeWidth() {
        return this._android.getStrokeWidth();
    }

    set strokeWidth(value: number) {
        if (this._isReal) {
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
        if (this._isReal) {
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
        if (this._isReal) {
            this._android.setFillColor(value.android);
        } else {
            this._android.fillColor(value.android);
        }
    }

    get android() {
        return this._android;
    }

    set android(android) {
        this._android = android;
        this._isReal = android.getClass().getName() === Polygon.CLASS;
    }
}

export class Circle extends CircleBase {
    private _android: any;
    private _center: Position;
    private _strokeColor: Color;
    private _fillColor: Color;
    private _isReal = false;

    static CLASS = 'com.google.android.gms.maps.model.Circle';

    constructor() {
        super();
        this.android = new com.google.android.gms.maps.model.CircleOptions();
    }

    get clickable() {
        return this._android.isClickable();
    }

    set clickable(value: boolean) {
        if (this._isReal) {
            this._android.setClickable(value);
        } else {
            this._android.clickable(value);
        }
    }

    get zIndex() {
        return this._android.getZIndex();
    }

    set zIndex(value: number) {
        if (this._isReal) {
            this._android.setZIndex(value);
        } else {
            this._android.zIndex(value);
        }
    }

    get visible() {
        return this._android.isVisible();
    }

    set visible(value: boolean) {
        if (this._isReal) {
            this._android.setVisible(value);
        } else {
            this._android.visible(value);
        }
    }

    get center() {
        return this._center;
    }

    set center(value: Position) {
        this._center = value;
        if (this._isReal) {
            this._android.setCenter(value.android);
        } else {
            this._android.center(value.android);
        }
    }

    get radius() {
        return this._android.getRadius();
    }

    set radius(value: number) {
        if (this._isReal) {
            this._android.setRadius(value);
        } else {
            this._android.radius(value);
        }
    }

    get strokeWidth() {
        return this._android.getStrokeWidth();
    }

    set strokeWidth(value: number) {
        if (this._isReal) {
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
        if (this._isReal) {
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
        if (this._isReal) {
            this._android.setFillColor(value.android);
        } else {
            this._android.fillColor(value.android);
        }
    }

    get android() {
        return this._android;
    }

    set android(android) {
        this._android = android;
        this._isReal = android.getClass().getName() === Circle.CLASS;
    }
}
