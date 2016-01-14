declare module "nativescript-google-maps-sdk" {
    import { View } from "ui/core/view";
    import { Property } from "ui/core/dependency-observable";
    import { Image } from "ui/image";
    import { EventData } from "data/observable";
    
    export class MapView extends View {
        
        public static latitudeProperty : Property;
        public static longitudeProperty : Property;
        public static bearingProperty : Property;
        public static zoomProperty : Property;
        public static tiltProperty : Property;
        
        public latitude : number;
        public longitude : number;
        public zoom : number;
        public bearing : number;
        public tilt : number;
        
        public notifyMapReady() : void;
        
        public updateCamera() : void;
        
        public static mapReadyEvent : string;
        
        public ios : any; /* GMSMapView */
        
        public android : any; /* com.google.android.gms.maps.MapView */
        
        public gMap : any;
        
        public addMarker(marker : Marker) : void;
        
        public removeMarker(marker : Marker) : void;
        
        public removeAllMarkers() : void;
        
        public findMarker(callback : (marker: Marker) => boolean) : Marker;
        
        public notifyMarkerEvent(eventName: string, marker: Marker);
        
    }
    
    export class Position {
        public latitude : number;
        public longitude : number;
        public static positionFromLatLng(latitude: number, longitude: number) : Position;
        public ios : any; /* CLLocationCoordinate2D */
        public android : any;
    }
    
    export class Marker {
        public position : Position;
        public snippet : string;
        public title : string;
        public icon : Image;
        public userData : any;
        public _map : any;
        public ios: any;
    }
    
    export interface MarkerEventData extends EventData {
        marker : Marker;
    }
}