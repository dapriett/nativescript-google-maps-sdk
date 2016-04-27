declare module "nativescript-google-maps-sdk" {
    import { View } from "ui/core/view";
    import { Property } from "ui/core/dependency-observable";
    import { Image } from "ui/image";
    import { Color } from "color";
    import { EventData } from "data/observable";

    export class Camera {
        public latitude : number;
        public longitude : number;
        public zoom : number;
        public bearing : number;
        public tilt : number;
    }

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
        public static markerSelectEvent : string;
        public static coordinateTappedEvent : string;
        public static cameraChangedEvent : string;

        public ios : any; /* GMSMapView */

        public android : any; /* com.google.android.gms.maps.MapView */

        public gMap : any;

        public addMarker(marker : Marker) : void;

        public removeMarker(marker : Marker) : void;

        public removeAllMarkers() : void;

        // public addCircle(shape: Shape): void;

        public addCircle(shape: Circle): void;

        public removeShape(shape: Shape): void;

        public removeAllShapes(): void;

        public clear() : void;

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
        public rotation : number;
        public title : string;
        public snippet : string;
        public icon : Image;
        public alpha : number;
        public flat : boolean;
        public draggable : boolean;
        public visible : boolean;
        public userData : any;
        public _map : any;
        public ios: any;
        public android: any;
    }

    export class Shape {
        public visible: boolean;
        public userData: any;
        public _map: any;
        public ios: any;
        public android: any;
    }

    export class Circle extends Shape {
        public center: Position;
        public radius: number;
        public strokeWidth: number;
        public strokeColor: Color;
        public fillColor: Color;
        public zIndex: number;
    }

    export interface MarkerEventData extends EventData {
        marker : Marker;
    }

    export interface CameraEventData extends EventData {
        camera : Camera;
    }

    export interface PositionEventData extends EventData {
        position : Position;
    }
}
