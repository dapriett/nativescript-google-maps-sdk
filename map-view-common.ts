import {
    MapView, Position, Marker, Shape, Polyline, Polygon,
    Circle, Camera, MarkerEventData, ShapeEventData,
    CameraEventData, PositionEventData, Bounds, Style, UISettings
} from "./map-view";
import { View, Template } from "tns-core-modules/ui/core/view";
import { Image } from "tns-core-modules/ui/image";
import builder = require("ui/builder");
import frame = require("ui/frame");

import { Property, PropertyOptions } from "tns-core-modules/ui/core/properties";
import { Color } from "tns-core-modules/color";

function onMapPropertyChanged(mapView: MapViewBase, oldValue: number, newValue: number) {
    if (!mapView.processingCameraEvent) mapView.updateCamera();
}

function onPaddingPropertyChanged(mapView: MapViewBase, oldValue: number, newValue: number) {
    mapView.updatePadding();
}

function paddingValueConverter(value: any) {
    if (!Array.isArray(value)) {
        value = String(value).split(',').map(function(v) {
            return parseInt(v, 10);
        });
    }
    if (value.length === 4) {
        return value;
    } else {
        return [0, 0, 0, 0];
    }
}

export { Style as StyleBase };

export abstract class MapViewBase extends View implements MapView {

    protected _gMap: any;
    protected _markers: Array<MarkerBase> = new Array<MarkerBase>();
    protected _shapes: Array<ShapeBase> = new Array<ShapeBase>();
    public _processingCameraEvent: boolean;
    public latitude: number;
    public longitude: number;
    public bearing: number;
    public zoom: number;
    public tilt: number;
    public padding: number;

    public settings: UISettingsBase;
    public myLocationEnabled: boolean;

    public static mapReadyEvent: string = "mapReady";
    public static markerSelectEvent: string = "markerSelect";
    public static markerInfoWindowTappedEvent:string = "markerInfoWindowTapped";
    public static shapeSelectEvent: string = "shapeSelect";
    public static markerBeginDraggingEvent: string = "markerBeginDragging";
    public static markerEndDraggingEvent: string = "markerEndDragging";
    public static markerDragEvent: string = "markerDrag";
    public static coordinateTappedEvent: string = "coordinateTapped";
    public static coordinateLongPressEvent: string = "coordinateLongPress";
    public static cameraChangedEvent: string = "cameraChanged";

    public get gMap() {
        return this._gMap;
    }

    public get processingCameraEvent(): boolean {
        return this._processingCameraEvent;
    }

    public _getMarkerInfoWindowContent(marker: MarkerBase) {
        var view;

        if(marker && marker._infoWindowView) {
            view = marker._infoWindowView;
            //marker._infoWindowView = null;
            return view;
        }

        if (marker && marker.infoWindowTemplate) {
            var page = frame.topmost().currentPage;

            var pathIdx = marker.infoWindowTemplate.lastIndexOf("/") + 1;
            var path = (pathIdx > 0) ? marker.infoWindowTemplate.substr(0, pathIdx) : "";
            var name = (pathIdx > 0) ? marker.infoWindowTemplate.substr(pathIdx) : marker.infoWindowTemplate;

            view = builder.load({
                path: path,
                name: name,
                page: page
            });
        }

        if (!view) return null;

        marker._infoWindowView = view;

        view.bindingContext = marker;

        this._addView(view);
        view.onLoaded();

        return view;
    }

    public abstract findMarker(callback: (marker: Marker)=>boolean): Marker;

    public abstract addPolyline(shape: Polyline): void;

    public abstract addPolygon(shape: Polygon): void;

    public abstract addCircle(shape: Circle): void;

    public abstract removeShape(shape: Shape): void;

    public abstract findShape(callback: (shape: Shape) => boolean): Shape;

    public abstract setStyle(style: Style): boolean;

    public abstract updateCamera(): void;

    public abstract setViewport(b: Bounds, p?: number): void;

    public abstract updatePadding(): void;

    public abstract addMarker(marker: Marker): void;

    public abstract removeMarker(marker: Marker): void;

    public abstract removeAllMarkers(): void;

    public abstract removeAllShapes(): void;

    public abstract clear(): void;

    public removeAllPolylines() {
        this._shapes.forEach(shape => {
            if (shape.shape === 'polyline') {
                this.removeShape(shape);
            }
        });
    }

    public removeAllPolygons() {
        this._shapes.forEach(shape => {
            if (shape.shape === 'polygon') {
                this.removeShape(shape);
            }
        });
    }

    public removeAllCircles() {
        this._shapes.forEach(shape => {
            if (shape.shape === 'circle') {
                this.removeShape(shape);
            }
        });
    }

    notifyMapReady() {
        this.notify({ eventName: MapViewBase.mapReadyEvent, object: this, gMap: this.gMap });
    }

    notifyMarkerEvent(eventName: string, marker: Marker) {
        let args: MarkerEventData = { eventName: eventName, object: this, marker: marker };
        this.notify(args);
    }

    notifyShapeEvent(eventName: string, shape: Shape) {
        let args: ShapeEventData = { eventName: eventName, object: this, shape: shape };
        this.notify(args);
    }
    notifyMarkerTapped(marker: MarkerBase) {
        this.notifyMarkerEvent(MapViewBase.markerSelectEvent, marker);
    }
    notifyMarkerInfoWindowTapped(marker: MarkerBase) {
        this.notifyMarkerEvent(MapViewBase.markerInfoWindowTappedEvent, marker);
    }
    notifyShapeTapped(shape: ShapeBase) {
        this.notifyShapeEvent(MapViewBase.shapeSelectEvent, shape);
    }
    notifyMarkerBeginDragging(marker: MarkerBase) {
        this.notifyMarkerEvent(MapViewBase.markerBeginDraggingEvent, marker);
    }

    notifyMarkerEndDragging(marker: MarkerBase) {
        this.notifyMarkerEvent(MapViewBase.markerEndDraggingEvent, marker);
    }

    notifyMarkerDrag(marker: MarkerBase) {
        this.notifyMarkerEvent(MapViewBase.markerDragEvent, marker);
    }

    notifyPositionEvent(eventName: string, position: Position) {
        let args: PositionEventData = { eventName: eventName, object: this, position: position };
        this.notify(args);
    }

    notifyCameraEvent(eventName: string, camera: Camera) {
        let args: CameraEventData = { eventName: eventName, object: this, camera: camera };
        this.notify(args);
    }
}

export const latitudeProperty = new Property<MapViewBase, number>({ name: 'latitude', defaultValue: 0, valueChanged: onMapPropertyChanged });
latitudeProperty.register(MapViewBase);

export const longitudeProperty = new Property<MapViewBase, number>({ name: 'longitude', defaultValue: 0, valueChanged: onMapPropertyChanged });
longitudeProperty.register(MapViewBase);

export const bearingProperty = new Property<MapViewBase, number>({ name: 'bearing', defaultValue: 0, valueChanged: onMapPropertyChanged });
bearingProperty.register(MapViewBase);

export const zoomProperty = new Property<MapViewBase, number>({ name: 'zoom', defaultValue: 0, valueChanged: onMapPropertyChanged });
zoomProperty.register(MapViewBase);

export const tiltProperty = new Property<MapViewBase, number>({ name: 'tilt', defaultValue: 0, valueChanged: onMapPropertyChanged });
tiltProperty.register(MapViewBase);

export const paddingProperty = new Property<MapViewBase, number>(<PropertyOptions<MapViewBase, number>>{ name: 'padding', defaultValue: 0, valueChanged: onPaddingPropertyChanged, valueConverter: paddingValueConverter });
paddingProperty.register(MapViewBase);

export class UISettingsBase implements UISettings {
    compassEnabled: boolean;
    indoorLevelPickerEnabled: boolean;
    mapToolbarEnabled: boolean;
    myLocationButtonEnabled: boolean;
    rotateGesturesEnabled: boolean;
    scrollGesturesEnabled: boolean;
    tiltGesturesEnabled: boolean;
    zoomControlsEnabled: boolean;
    zoomGesturesEnabled: boolean;
}

export class PositionBase implements Position {
    public latitude: number;
    public longitude: number;
    public ios: any; /* CLLocationCoordinate2D */
    public android: any;
}

export class BoundsBase implements Bounds {
    public northeast: Position;
    public southwest: Position;
    public ios: any; /* GMSCoordinateBounds */
    public android: any;
}

export abstract class MarkerBase implements Marker {
    public _infoWindowView: any;
    public position: Position;
    public rotation: number;
    public anchor: Array<number>;
    public title: string;
    public snippet: string;
    public icon: Image|string;
    public alpha: number;
    public flat: boolean;
    public draggable: boolean;
    public visible: boolean;
    public zIndex: number;
    public abstract showInfoWindow(): void;
    public abstract isInfoWindowShown(): boolean;
    public infoWindowTemplate: string;
    public userData: any;
    public _map: any;
    public ios: any;
    public android: any;
}

export class ShapeBase implements Shape {
    public shape: string;
    public visible: boolean;
    public zIndex: number;
    public userData: any;
    public _map: any;
    public ios: any;
    public android: any;
    public clickable: boolean;
}

export abstract class PolylineBase extends ShapeBase implements Polyline {
    public shape: string = 'polyline';
    public _map: any;
    public _points: Array<PositionBase>;
    public width: number;
    public color: Color;
    public geodesic: boolean;

    addPoint(point: PositionBase): void {
        this._points.push(point);
        this.reloadPoints();
    }

    addPoints(points: PositionBase[]): void {
        this._points = this._points.concat(points);
        this.reloadPoints();
    }

    removePoint(point: PositionBase): void {
        var index = this._points.indexOf(point);
        if (index > -1) {
            this._points.splice(index, 1);
            this.reloadPoints();
        }
    }

    removeAllPoints(): void {
        this._points.length = 0;
        this.reloadPoints();
    }

    getPoints(): Array<PositionBase> {
        return this._points.slice();
    }

    public abstract reloadPoints(): void;
}

export abstract class PolygonBase extends ShapeBase implements Polygon {
    public shape: string = 'polygon';
    public _map: any;
    public _points: Array<PositionBase>;
    public strokeWidth: number;
    public strokeColor: Color;
    public fillColor: Color;

    addPoint(point: PositionBase): void {
        this._points.push(point);
        this.reloadPoints();
    }

    addPoints(points: PositionBase[]): void {
        this._points = this._points.concat(points);
        this.reloadPoints();
    }

    removePoint(point: PositionBase): void {
        var index = this._points.indexOf(point);
        if (index > -1) {
            this._points.splice(index, 1);
            this.reloadPoints();
        }
    }

    removeAllPoints(): void {
        this._points.length = 0;
        this.reloadPoints();
    }

    getPoints(): Array<PositionBase> {
        return this._points.slice();
    }

    public abstract reloadPoints(): void;
}

export class CircleBase extends ShapeBase implements Circle {
    public shape: string = 'circle';
    public center: Position;
    public _map: any;
    public radius: number;
    public strokeWidth: number;
    public strokeColor: Color;
    public fillColor: Color;
}