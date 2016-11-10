declare module "nativescript-google-maps-sdk" {
    import { View } from "ui/core/view";
    import { Property } from "ui/core/dependency-observable";
    import { Image } from "ui/image";
    import { Color } from "color";
    import { EventData } from "data/observable";

    export class Camera {
        public latitude: number;
        public longitude: number;
        public zoom: number;
        public bearing: number;
        public tilt: number;
    }

    export class MapView extends View {

        public static latitudeProperty: Property;
        public static longitudeProperty: Property;
        public static bearingProperty: Property;
        public static zoomProperty: Property;
        public static tiltProperty: Property;
        public static paddingProperty: Property;

        public latitude: number;
        public longitude: number;
        public zoom: number;
        public bearing: number;
        public tilt: number;
        public padding: Array<number>;

        public notifyMapReady(): void;

        public updateCamera(): void;

        public updatePadding(): void;

        public static mapReadyEvent: string;
        public static markerSelectEvent: string;
        public static markerInfoWindowTapEvent:string;
        public static shapeSelectEvent: string;
        public static markerBeginDraggingEvent: string;
        public static markerEndDraggingEvent: string;
        public static markerDragEvent: string;
        public static coordinateTappedEvent: string;
        public static coordinateLongPressEvent: string;
        public static cameraChangedEvent: string;

        public ios: any; /* GMSMapView */

        public android: any; /* com.google.android.gms.maps.MapView */

        public gMap: any;

        public addMarker(marker: Marker): void;

        public removeMarker(marker: Marker): void;

        public removeAllMarkers(): void;

        public findMarker(callback: (marker: Marker) => boolean): Marker;

        public notifyMarkerEvent(eventName: string, marker: Marker);

        public addPolyline(shape: Polyline): void;

        public addPolygon(shape: Polygon): void;

        public addCircle(shape: Circle): void;

        public removeShape(shape: Shape): void;

        public removeAllShapes(): void;

        public findShape(callback: (shape: Shape) => boolean): Shape;

        public clear(): void;

        public setStyle(style: Style): boolean;
    }

    export class Position {
        public latitude: number;
        public longitude: number;
        public static positionFromLatLng(latitude: number, longitude: number): Position;
        public ios: any; /* CLLocationCoordinate2D */
        public android: any;
    }

    export class Marker {
        public position: Position;
        public rotation: number;
        public anchor: Array<number>;
        public title: string;
        public snippet: string;
        public icon: Image;
        public alpha: number;
        public flat: boolean;
        public draggable: boolean;
        public visible: boolean;
        public zIndex: number;
        public showInfoWindow(): void;
        public userData: any;
        public _map: any;
        public ios: any;
        public android: any;
    }

    export class Shape {
        public shape: string;
        public visible: boolean;
        public zIndex: number;
        public userData: any;
        public _map: any;
        public ios: any;
        public android: any;
    }

    export class Polyline extends Shape {
        public points: Array<Position>;
        public width: number;
        public color: Color;
        public geodesic: boolean;
        public addPoint(shape: Position): void;
        public addPoints(shapes: Position[]): void;
        public removePoint(shape: Position): void;
        public removeAllPoints(): void;
        public getPoints(): Array<Position>;
    }

    export class Polygon extends Shape {
        public points: Array<Position>;
        public strokeWidth: number;
        public strokeColor: Color;
        public fillColor: Color;
        public addPoint(shape: Position): void;
        public addPoints(shapes: Position[]): void;
        public removePoint(shape: Position): void;
        public removeAllPoints(): void;
        public getPoints(): Array<Position>;
    }

    export class Circle extends Shape {
        public center: Position;
        public radius: number;
        public strokeWidth: number;
        public strokeColor: Color;
        public fillColor: Color;
    }

    export class Style extends Array<StyleElement> {
        public center: Position;
        public radius: number;
        public strokeWidth: number;
        public strokeColor: Color;
        public fillColor: Color;
    }

    export class StyleElement {
        public featureType?: StyleFeatureType;
        public elementType?: StyleElementType;
        public stylers: Array<StyleStylers>;
    }

    export type StyleElementType = "all" | "administrative" | "administrative.country" | "administrative.land_parcel" |
        "administrative.locality" | "administrative.neighborhoodadministrative.province" | "landscape" |
        "landscape.man_made" | "landscape.natural" | "landscape.natural.landcover" | "landscape.natural.terrain" |
        "poi" | "poi.attraction" | "poi.business" | "poi.government" | "poi.medical" | "poi.park" |
        "poi.place_of_worship" | "poi.school" | "poi.sports_complex" | "road" | "road.arterial" | "road.highway" |
        "road.highway.controlled_access" | "road.local" | "transit" | "transit.line" | "transit.station" |
        "transit.station.airport" | "transit.station.bus" | "transit.station.rail" | "water";

    export type StyleFeatureType = "all" | "geometry" | "geometry.fill" | "geometry.stroke" | "labels" | "labels.icon" |
        "labels.text" | "labels.text.fill" | "labels.text.stroke";

    export type StyleVisibility = "on" | "off" | "simplified";

    export class StyleStylers {
        public hue?: string;
        public lightness?: number;
        public saturation?: number;
        public gamma?: number;
        public invert_lightness: boolean;
        public visibility: StyleVisibility;
        public color?: string;
        public weight: number;
    }

    export interface MarkerEventData extends EventData {
        marker: Marker;
    }

    export interface ShapeEventData extends EventData {
        shape: Shape;
    }

    export interface CameraEventData extends EventData {
        camera: Camera;
    }

    export interface PositionEventData extends EventData {
        position: Position;
    }
}
