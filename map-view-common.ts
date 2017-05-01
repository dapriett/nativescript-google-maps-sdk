import {
    MapView as IMapView, Position as IPosition, Marker as IMarker,
    Shape as IShape, Polyline as IPolyline, Polygon as IPolygon,
    Circle as ICircle, Camera, MarkerEventData, ShapeEventData,
    CameraEventData, PositionEventData, Bounds as IBounds
} from ".";
import { View } from "tns-core-modules/ui/core/view";
import { Image } from "tns-core-modules/ui/image";

import { Property, PropertyOptions } from "tns-core-modules/ui/core/properties";

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


export abstract class MapViewBase extends View implements IMapView {

    protected _gMap: any;
    protected _markers: Array<MarkerBase> = new Array<MarkerBase>();
    protected _shapes: Array<ShapeBase> = new Array<ShapeBase>();
    protected _processingCameraEvent: boolean;
    public latitude: number;
    public longitude: number;
    public bearing: number;
    public zoom: number;
    public tilt: number;
    public padding: number;

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

    public abstract updateCamera(): void;

    public abstract setViewport(b: IBounds, p?: number): void;

    public abstract updatePadding(): void;

    public abstract addMarker(marker: IMarker): void;

    public abstract removeMarker(marker: IMarker): void;

    public abstract removeAllMarkers(): void;

    public abstract addPolyline(shape: PolylineBase): void;

    public abstract addPolygon(shape: PolygonBase): void;

    public abstract addCircle(shape: CircleBase): void;

    public abstract removeShape(shape: ShapeBase): void;

    public abstract removeAllShapes(): void;

    public abstract clear(): void;

    public abstract setStyle(style: any): void;

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

    notifyMarkerEvent(eventName: string, marker: IMarker) {
        let args: MarkerEventData = { eventName: eventName, object: this, marker: marker };
        this.notify(args);
    }

    notifyShapeEvent(eventName: string, shape: IShape) {
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

    notifyPositionEvent(eventName: string, position: IPosition) {
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

export class PositionBase implements IPosition {
    public latitude: number;
    public longitude: number;
}

export class BoundsBase implements IBounds {
    public northeast: PositionBase;
    public southwest: PositionBase;
}

export class MarkerBase implements IMarker {
    public position: IPosition;
    public snippet: string;
    public title: string;
    public icon: Image;
    public userData: any;
    public _map: any;
}

export class ShapeBase implements IShape {
    public shape: string;
    public userData: any;
    public clickable: boolean;
}

export abstract class PolylineBase extends ShapeBase implements IPolyline {
    public shape: string = 'polyline';
    public _map: any;
    public _points: Array<PositionBase>;

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

export abstract class PolygonBase extends ShapeBase implements IPolygon {
    public shape: string = 'polygon';
    public _map: any;
    public _points: Array<PositionBase>;

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

export class CircleBase extends ShapeBase implements ICircle {
    public shape: string = 'circle';
    public center: IPosition;
    public _map: any;
}
