import { MapView as IMapView, Position as IPosition, Marker as IMarker, Shape as IShape, Polyline as IPolyline, Polygon as IPolygon, Circle as ICircle, Camera, MarkerEventData, CameraEventData, PositionEventData } from ".";
import { View } from "ui/core/view";
import { Image } from "ui/image";

import { Property, PropertyChangeData, PropertyMetadata, PropertyMetadataSettings } from "ui/core/dependency-observable";

//let CAMERA_PROPERTIES : String[] = ["latitude", "longitude", "bearing", "zoom", "tilt", "padding"];

let MAP_VIEW: string = "MapView";

function onMapPropertyChanged(data: PropertyChangeData) {
    let mapView = <MapView>data.object;
    if (!mapView._processingCameraEvent) mapView.updateCamera();
}

function onPaddingPropertyChanged(data: PropertyChangeData) {
    let mapView = <MapView>data.object;
    mapView.updatePadding();
}

export abstract class MapView extends View implements IMapView {

    public gMap: any;

    public static mapReadyEvent: string = "mapReady";
    public static markerSelectEvent: string = "markerSelect";
    public static markerBeginDraggingEvent: string = "markerBeginDragging";
    public static markerEndDraggingEvent: string = "markerEndDragging";
    public static markerDragEvent: string = "markerDrag";
    public static coordinateTappedEvent: string = "coordinateTapped";
    public static cameraChangedEvent: string = "cameraChanged";

    public static latitudeProperty = new Property("latitude", MAP_VIEW, new PropertyMetadata(0, PropertyMetadataSettings.None, onMapPropertyChanged));
    public static longitudeProperty = new Property("longitude", MAP_VIEW, new PropertyMetadata(0, PropertyMetadataSettings.None, onMapPropertyChanged));
    public static bearingProperty = new Property("bearing", MAP_VIEW, new PropertyMetadata(0, PropertyMetadataSettings.None, onMapPropertyChanged));
    public static zoomProperty = new Property("zoom", MAP_VIEW, new PropertyMetadata(0, PropertyMetadataSettings.None, onMapPropertyChanged));
    public static tiltProperty = new Property("tilt", MAP_VIEW, new PropertyMetadata(0, PropertyMetadataSettings.None, onMapPropertyChanged));
    public static paddingProperty = new Property("padding", MAP_VIEW, new PropertyMetadata(0, PropertyMetadataSettings.None, onPaddingPropertyChanged));

    get latitude() {
        return this._getValue(MapView.latitudeProperty);
    }

    set latitude(value: any) {
        this._setValue(MapView.latitudeProperty, parseFloat(value));
    }

    get longitude() {
        return this._getValue(MapView.longitudeProperty);
    }

    set longitude(value: any) {
        this._setValue(MapView.longitudeProperty, parseFloat(value));
    }

    get bearing() {
        return this._getValue(MapView.bearingProperty);
    }

    set bearing(value: any) {
        this._setValue(MapView.bearingProperty, parseFloat(value));
    }

    get zoom() {
        return this._getValue(MapView.zoomProperty);
    }

    set zoom(value: any) {
        this._setValue(MapView.zoomProperty, parseFloat(value));
    }

    get tilt() {
        return this._getValue(MapView.tiltProperty);
    }

    set tilt(value: any) {
        this._setValue(MapView.tiltProperty, parseFloat(value));
    }

    get padding() {
        return this._getValue(MapView.paddingProperty);
    }

    set padding(value: any) {
        this._setValue(MapView.paddingProperty, this._transformPadding(value));
    }

    private _transformPadding(value) {
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

    public abstract updateCamera(): void;

    public abstract updatePadding(): void;

    notifyMapReady() {
        this.notify({ eventName: MapView.mapReadyEvent, object: this, gMap: this.gMap });
    }

    public abstract addMarker(marker: IMarker): void;

    public abstract removeMarker(marker: IMarker): void;

    public abstract removeAllMarkers(): void;

    public abstract addPolyline(shape: Polyline): void;

    public abstract addPolygon(shape: Polygon): void;

    public abstract addCircle(shape: Circle): void;

    public abstract removeShape(shape: Shape): void;

    public abstract removeAllShapes(): void;

    protected _shapes: Array<IShape>;

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

    public abstract clear(): void;

    notifyMarkerEvent(eventName: string, marker: IMarker) {
        let args: MarkerEventData = { eventName: eventName, object: this, marker: marker };
        this.notify(args);
    }

    notifyMarkerTapped(marker: Marker) {
        this.notifyMarkerEvent(MapView.markerSelectEvent, marker);
    }

    notifyMarkerBeginDragging(marker: Marker) {
        this.notifyMarkerEvent(MapView.markerBeginDraggingEvent, marker);
    }

    notifyMarkerEndDragging(marker: Marker) {
        this.notifyMarkerEvent(MapView.markerEndDraggingEvent, marker);
    }

    notifyMarkerDrag(marker: Marker) {
        this.notifyMarkerEvent(MapView.markerDragEvent, marker);
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

export class Position implements IPosition {
    public latitude: number;
    public longitude: number;
}

export class Marker implements IMarker {
    public position: IPosition;
    public snippet: string;
    public title: string;
    public icon: Image;
    public userData: any;
    public _map: any;
}

export class Shape implements IShape {
    public shape: string;
    public userData: any;
}

export class Polyline extends Shape implements IPolyline {
    public shape: string = 'polyline';
    public _map: any;
}

export class Polygon extends Shape implements IPolygon {
    public shape: string = 'polygon';
    public _map: any;
}

export class Circle extends Shape implements ICircle {
    public shape: string = 'circle';
    public center: IPosition;
    public _map: any;
}
