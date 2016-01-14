import { MapView as IMapView, Position as IPosition, Marker as IMarker, MarkerEventData } from "nativescript-google-maps-sdk";
import { View } from "ui/core/view";
import { Image } from "ui/image";

import { Property, PropertyChangeData, PropertyMetadata, PropertyMetadataSettings } from "ui/core/dependency-observable";

//let CAMERA_PROPERTIES : String[] = ["latitude", "longitude", "bearing", "zoom", "tilt"];

let MAP_VIEW : string = "MapView";

function onMapPropertyChanged(data: PropertyChangeData) {
    let mapView = <MapView>data.object;
    mapView.updateCamera();
}

export class MapView extends View implements IMapView {
    
    public gMap : any;
    
    public static mapReadyEvent: string = "mapReady";
    public static markerSelectEvent: string = "markerSelect";
    
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
    
    public updateCamera() : void {
        //Leave it upto the child classes.
    }
    
    notifyMapReady() {
        this.notify({ eventName: MapView.mapReadyEvent, object: this, gMap: this.gMap});
    }
    
    addMarker(marker: IMarker) {
    }
    
    removeMarker(marker: IMarker) {
    }
    
    removeAllMarkers() {
        this.gMap.clear();
    }
    
    notifyMarkerEvent(eventName : string, marker: IMarker) {
        let args : MarkerEventData = {eventName : eventName, object: this, marker: marker };
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