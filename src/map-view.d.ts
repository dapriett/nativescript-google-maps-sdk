import { Point } from "@nativescript/core/ui/core/view";
import { Property, View, Image, Color, EventData } from "@nativescript/core";

export class IndoorLevel {
    public name: string;
    public shortName: string;
}

export class IndoorBuilding {
    public defaultLevelIndex: number;
    public levels: IndoorLevel[];
    public isUnderground: boolean;
}

export class Camera {
    public latitude: number;
    public longitude: number;
    public zoom: number;
    public bearing: number;
    public tilt: number;
}

export class MapView extends View {

    public latitude: number;
    public longitude: number;
    public zoom: number;
    public minZoom: number;
    public maxZoom: number;
    public bearing: number;
    public tilt: number;
    public padding: number[];
    public mapAnimationsEnabled: boolean;

    public notifyMapReady(): void;

    public updateCamera(): void;

    public setViewport(bounds: Bounds, padding?: number): void;

    public updatePadding(): void;

    public static mapReadyEvent: string;
    public static myLocationTappedEvent: string;
    public static coordinateTappedEvent: string;
    public static coordinateLongPressEvent: string;
    public static markerSelectEvent: string;
    public static markerBeginDraggingEvent: string;
    public static markerEndDraggingEvent: string;
    public static markerDragEvent: string;
    public static markerInfoWindowTappedEvent: string;
    public static markerInfoWindowClosedEvent: string;
    public static shapeSelectEvent: string;
    public static cameraChangedEvent: string;
    public static cameraMoveEvent: string;
    public static indoorBuildingFocusedEvent: string;
    public static indoorLevelActivatedEvent: string;

    public nativeView: any; /* GMSMapView | com.google.android.gms.maps.MapView */

    public gMap: any;

    public settings: UISettings;

    public projection: Projection;

    public myLocationEnabled: boolean;

    public setMinZoomMaxZoom(): void;

    public addMarker(...markers: Marker[]): void;

    public removeMarker(...markers: Marker[]): void;

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

export const latitudeProperty: Property<MapView, number>;
export const longitudeProperty: Property<MapView, number>;
export const bearingProperty: Property<MapView, number>;
export const zoomProperty: Property<MapView, number>;
export const tiltProperty: Property<MapView, number>;
export const paddingProperty: Property<MapView, number | number[]>;

export class UISettings {
    // Whether the compass is enabled/disabled.
    compassEnabled(): boolean;
    compassEnabled(value: boolean): boolean;
    // Whether the indoor level picker is enabled/disabled.
    indoorLevelPickerEnabled: boolean;
    // Whether the indoor level picker is enabled/disabled.
    mapToolbarEnabled: boolean;
    // Whether the my-location button is enabled/disabled.
    myLocationButtonEnabled: boolean;
    // Whether rotate gestures are enabled/disabled.
    rotateGesturesEnabled: boolean;
    // Whether scroll gestures are enabled/disabled.
    scrollGesturesEnabled: boolean;
    // Whether tilt gestures are enabled/disabled.
    tiltGesturesEnabled: boolean;
    // Whether the zoom controls are enabled/disabled.
    zoomControlsEnabled: boolean;
    // Whether zoom gestures are enabled/disabled
    zoomGesturesEnabled: boolean;
}

export class Projection {
    public visibleRegion: VisibleRegion;
    public fromScreenLocation(point: Point): Position;
    public toScreenLocation(position: Position): Point;
    public ios: any; /* GMSProjection */
    public android: any;
}

export class VisibleRegion {
    public nearLeft: Position;
    public nearRight: Position;
    public farLeft: Position;
    public farRight: Position;
    public bounds: Bounds;
}

export class Position {
    public latitude: number;
    public longitude: number;
    public static positionFromLatLng(latitude: number, longitude: number): Position;
    public ios: any; /* CLLocationCoordinate2D */
    public android: any;
}

export class Bounds {
    public northeast: Position;
    public southwest: Position;
    public ios: any; /* GMSCoordinateBounds */
    public android: any;
    public static fromCoordinates(southwest: Position, northeast: Position): Bounds;
}

export class Marker {
    public position: Position;
    public rotation: number;
    public anchor: Array<number>;
    public title: string;
    public snippet: string;
    public color: Color | string | number; /* Default Icon color - either Color, string color name, string color hex, or number hue (0-360) */
    public icon: Image | string;
    public alpha: number;
    public flat: boolean;
    public draggable: boolean;
    public visible: boolean;
    public zIndex: number;
    public showInfoWindow(): void;
    public isInfoWindowShown(): boolean;
    public infoWindowTemplate: string;
    public hideInfoWindow(): void;
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
    public clickable: boolean;
}

export class Polyline extends Shape {
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
    public strokeWidth: number;
    public strokeColor: Color;
    public fillColor: Color;
    public addPoint(shape: Position): void;
    public addPoints(shapes: Position[]): void;
    public removePoint(shape: Position): void;
    public removeAllPoints(): void;
    public addHole(hole: Position[]): void;
    public addHoles(hole: Position[][]): void;
    public removeHole(hole: Position[]): void;
    public removeAllHoles(): void;
    public getPoints(): Array<Position>;
    public getHoles(): Array<Array<Position>>;
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

export interface BuildingFocusedEventData extends EventData {
    indoorBuilding: IndoorBuilding;
}

export interface IndoorLevelActivatedEventData extends EventData {
    activateLevel: IndoorLevel;
}
