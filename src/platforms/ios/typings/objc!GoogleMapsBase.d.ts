
declare class GMSCoordinateBounds extends NSObject {

	static alloc(): GMSCoordinateBounds; // inherited from NSObject

	static new(): GMSCoordinateBounds; // inherited from NSObject

	readonly northEast: CLLocationCoordinate2D;

	readonly southWest: CLLocationCoordinate2D;

	readonly valid: boolean;

	constructor(o: { coordinate: CLLocationCoordinate2D; coordinate2: CLLocationCoordinate2D; });

	constructor(o: { path: GMSPath; });

	constructor(o: { region: GMSVisibleRegion; });

	containsCoordinate(coordinate: CLLocationCoordinate2D): boolean;

	includingBounds(other: GMSCoordinateBounds): GMSCoordinateBounds;

	includingCoordinate(coordinate: CLLocationCoordinate2D): GMSCoordinateBounds;

	includingPath(path: GMSPath): GMSCoordinateBounds;

	initWithCoordinateCoordinate(coord1: CLLocationCoordinate2D, coord2: CLLocationCoordinate2D): this;

	initWithPath(path: GMSPath): this;

	initWithRegion(region: GMSVisibleRegion): this;

	intersectsBounds(other: GMSCoordinateBounds): boolean;
}
