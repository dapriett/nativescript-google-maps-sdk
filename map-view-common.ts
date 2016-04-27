import { MapView as IMapView, Position as IPosition, Marker as IMarker, Shape as IShape, Circle as ICircle, Camera, MarkerEventData, CameraEventData, PositionEventData } from "nativescript-google-maps-sdk";
import { View } from "ui/core/view";
import { Image } from "ui/image";

import { Property, PropertyChangeData, PropertyMetadata, PropertyMetadataSettings } from "ui/core/dependency-observable";

//let CAMERA_PROPERTIES : String[] = ["latitude", "longitude", "bearing", "zoom", "tilt"];

let MAP_VIEW : string = "MapView";

function onMapPropertyChanged(data: PropertyChangeData) {
    let mapView = <MapView>data.object;
    if (!mapView._processingCameraEvent) mapView.updateCamera();
}

export abstract class MapView extends View implements IMapView {
    
    public gMap : any;
    
    public static mapReadyEvent: string = "mapReady";
    public static markerSelectEvent: string = "markerSelect";
    public static coordinateTappedEvent : string = "coordinateTapped";
    public static cameraChangedEvent : string = "cameraChanged";
        
    public static latitudeProperty = new Property("latitude", MAP_VIEW, new PropertyMetadata(0, PropertyMetadataSettings.None, onMapPropertyChanged));
    public static longitudeProperty = new Property("longitude", MAP_VIEW, new PropertyMetadata(0, PropertyMetadataSettings.None, onMapPropertyChanged));
    public static bearingProperty = new Property("bearing", MAP_VIEW, new PropertyMetadata(0, PropertyMetadataSettings.None, onMapPropertyChanged));
    public static zoomProperty = new Property("zoom", MAP_VIEW, new PropertyMetadata(0, PropertyMetadataSettings.None, onMapPropertyChanged));
    public static tiltProperty = new Property("tilt", MAP_VIEW, new PropertyMetadata(0, PropertyMetadataSettings.None, onMapPropertyChanged));
    
    get latitude() {
        return this._getValue(MapView.latitudeProperty);
    }
    
    set latitude(value : any) {
        this._setValue(MapView.latitudeProperty, parseFloat(value));
    }
    
    get longitude() {
        return this._getValue(MapView.longitudeProperty);
    }
    
    set longitude(value : any) {
        this._setValue(MapView.longitudeProperty, parseFloat(value));
    } 
    
    get bearing() {
        return this._getValue(MapView.bearingProperty);
    }
    
    set bearing(value : any) {
        this._setValue(MapView.bearingProperty, parseFloat(value));
    }
    
    get zoom() {
        return this._getValue(MapView.zoomProperty);
    }
    
    set zoom(value : any) {
        this._setValue(MapView.zoomProperty, parseFloat(value));
    }
    
    get tilt() {
        return this._getValue(MapView.tiltProperty);
    }
    
    set tilt(value : any) {
        this._setValue(MapView.tiltProperty, parseFloat(value));
    }
    
    public abstract updateCamera() : void;
    
    notifyMapReady() {
        this.notify({ eventName: MapView.mapReadyEvent, object: this, gMap: this.gMap});
    }
    
    public abstract addMarker(marker: IMarker): void;
    
    public abstract removeMarker(marker: IMarker): void;

    public abstract removeAllMarkers(): void;

    public abstract addCircle(shape: Circle): void;

    public abstract removeShape(shape: Shape): void;

    public abstract removeAllShapes(): void;

    public abstract clear(): void;
    
    notifyMarkerEvent(eventName : string, marker: IMarker) {
        let args : MarkerEventData = {eventName : eventName, object: this, marker: marker };
        this.notify(args);
    }
    
    notifyPositionEvent(eventName: string, position: IPosition) {
        let args : PositionEventData = {eventName: eventName, object: this, position: position};
        this.notify(args);
    }
    
    notifyCameraEvent(eventName: string, camera: Camera) {
        let args : CameraEventData = {eventName: eventName, object: this, camera: camera};
        this.notify(args);
    }
}

export class Marker implements IMarker {
    public position : IPosition;
    public snippet : string;
    public title : string;
    public icon : Image;
    public userData : any;
    public _map: any;
}

export class Position implements IPosition {
    public latitude: number;
    public longitude: number;
}

export class Shape implements IShape {
}

export class Circle implements ICircle {
    public center: IPosition;
    public userData: any;
    public _map: any;
}
