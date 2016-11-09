var vmModule = require("./main-view-model");
var observableModule = require("data/observable");
var mapsModule = require("nativescript-google-maps-sdk");
var Image = require("ui/image").Image;
var imageSource = require("image-source");
var Color = require("color").Color;
var style = require('./map-style.json');

function wait(milliSeconds) {
    return new Promise(function(resolve, reject) {
        setTimeout(function(){
           resolve(milliSeconds);
        }, milliSeconds);
    });
}

function pageLoaded(args) {
    var page = args.object;
    page.bindingContext = vmModule.mainViewModel;
}
exports.pageLoaded = pageLoaded;



function onMapReady(args) {
    console.log("onMapReady");

    var mapView = args.object;

    console.log("Setting a marker...");

    var marker = new mapsModule.Marker();
    marker.position = mapsModule.Position.positionFromLatLng(-33.86, 151.20);
    marker.title = "Sydney";
    marker.snippet = "Australia";
    marker.userData = {index: 1};
    mapView.addMarker(marker);

    var circle = new mapsModule.Circle();
    circle.center = mapsModule.Position.positionFromLatLng(-33.42, 151.32);
    circle.visible = true;
    circle.radius = 5000;
    circle.fillColor = new Color('#99ff8800');
    circle.strokeColor = new Color('#99ff0000');
    circle.strokeWidth = 2;
    mapView.addCircle(circle);

    var polyline = new mapsModule.Polyline();
    var point = mapsModule.Position.positionFromLatLng(-32.89, 151.44);
    polyline.addPoints([
        mapsModule.Position.positionFromLatLng(-33.86, 151.20),
        point,
        mapsModule.Position.positionFromLatLng(-33.42, 151.32)
    ]);
    polyline.visible = true;
    polyline.width = 8;
    polyline.color = new Color('#DD00b3fd');
    polyline.geodesic = true;
    mapView.addPolyline(polyline);

    var polygon = new mapsModule.Polygon();
    polygon.addPoints([
        mapsModule.Position.positionFromLatLng(-33.86, 151.20),
        mapsModule.Position.positionFromLatLng(-33.89, 151.40),
        mapsModule.Position.positionFromLatLng(-34.22, 151.32)
    ]);
    polygon.visible = true;
    polygon.fillColor = new Color('#9970d0a0');
    polygon.strokeColor = new Color('#9900d0a0');
    polygon.strokeWidth = 5;
    mapView.addPolygon(polygon);

    marker = new mapsModule.Marker();
    marker.position = mapsModule.Position.positionFromLatLng(-33.42, 151.32);
    marker.title = "Gosford";
    marker.snippet = "Australia";
    // var icon = new Image();
    // icon.imageSource = imageSource.fromResource('icon');
    // marker.icon = icon;
    marker.icon = 'icon';
    marker.alpha = 0.6;
    marker.flat = true;
    marker.anchor = [0.5, 0.5];
    marker.draggable = true;
    marker.visible = false;
    marker.userData = {index: 2};
    mapView.addMarker(marker);

    wait(3000).then(function () {
        var marker = mapView.findMarker(function (marker) {
            return marker.userData.index === 2;
        });
        console.log("Moving marker...", marker.userData);
        marker.position = mapsModule.Position.positionFromLatLng(-33.33, 151.08);
        marker.rotation = 45;
        console.log("Removing Point from polyline...", polyline, point);
        polyline.removePoint(point);
        return wait(3000);
    }).then(function () {
        vmModule.mainViewModel.set("zoom", 9);
        console.log("Zooming in...", vmModule.mainViewModel);
        return wait(3000);
    }).then(function () {
        polyline.addPoint(mapsModule.Position.positionFromLatLng(-33.33, 151.08));
        console.log("Adding point to Polyline...", polyline);
        vmModule.mainViewModel.set("padding", [30, 60, 40, 40]);
        return wait(3000);
    }).then(function () {
        polygon.addPoint(mapsModule.Position.positionFromLatLng(-34.22, 151.20));
        console.log("Adding point to Polygon...", polygon);
        return wait(3000);
    }).then(function () {
        var marker = mapView.findMarker(function (marker) {
            return marker.userData.index === 2;
        });
        marker.visible = true;
        return wait(3000);
    }).then(function () {
        var marker = mapView.findMarker(function (marker) {
            return marker.userData.index === 2;
        });
        // marker.position = mapsModule.Position.positionFromLatLng(-32.89,151.44);
        marker.anchor = [1, 1];
        marker.alpha = 0.8;
        return wait(3000);
    }).then(function () {
        console.log("Changing to dark mode...");
        mapView.setStyle(style);
        return wait(3000);
    }).then(function () {
        var marker = mapView.findMarker(function (marker) {
            return marker.userData.index === 1;
        });
        console.log("Removing marker...", marker.userData);
        mapView.removeMarker(marker);
        return wait(9000);
    }).then(function () {
        console.log("Removing all circles...");
        mapView.removeAllCircles();
        console.log("Removing all polylines...");
        mapView.removeAllPolylines();
        console.log("Removing all polygons...");
        mapView.removeAllPolygons();
    }).then(function () {
        var marker = new mapsModule.Marker();
        marker.position = mapsModule.Position.positionFromLatLng(mapView.latitude, mapView.longitude);
        marker.title = "All Done";
        marker.snippet = "Enjoy!";
        mapView.addMarker(marker);
        marker.showInfoWindow();
    }).catch(function (error) {
        console.log(error);
    });
}

function onCoordinateTapped(args) {
    console.log("Coordinate Tapped, Lat: " + args.position.latitude + ", Lon: " + args.position.longitude, args);
}

function onMarkerEvent(args) {
   console.log("Marker Event: '" + args.eventName
                + "' triggered on: " + args.marker.title
                + ", Lat: " + args.marker.position.latitude + ", Lon: " + args.marker.position.longitude, args);
}

var lastCamera = null;
function onCameraChanged(args) {
    console.log("Camera changed: "+JSON.stringify(args.camera), JSON.stringify(args.camera) === lastCamera);
    lastCamera = JSON.stringify(args.camera);
}

exports.onMapReady = onMapReady;
exports.onCoordinateTapped = onCoordinateTapped;
exports.onMarkerEvent = onMarkerEvent;
exports.onCameraChanged = onCameraChanged;
