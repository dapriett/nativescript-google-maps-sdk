var vmModule = require("./main-view-model");
var observableModule = require("data/observable");
var mapsModule = require("nativescript-google-maps-sdk");
var Image = require("ui/image").Image;
var imageSource = require("image-source");
var Color = require("color").Color;

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
    marker.userData = { index : 1};
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
    polyline.addPoint(mapsModule.Position.positionFromLatLng(-33.86, 151.20));
    var point = mapsModule.Position.positionFromLatLng(-32.89,151.44);
    polyline.addPoint(point);
    polyline.addPoint(mapsModule.Position.positionFromLatLng(-33.42, 151.32));
    polyline.visible = true;
    polyline.width = 8;
    polyline.color = new Color('#DD00b3fd');
    polyline.geodesic = true;
    mapView.addPolyline(polyline);

    marker = new mapsModule.Marker();
    marker.position = mapsModule.Position.positionFromLatLng(-33.42, 151.32);
    marker.title = "Gosford";
    marker.snippet = "Australia";
    // var icon = new Image();
    // icon.imageSource = imageSource.fromResource('icon');
    // marker.icon = icon;
    marker.icon = 'icon';
    marker.alpha = 0.8;
    marker.flat = true;
    marker.draggable = true;
    marker.visible = false;
    marker.userData = { index : 2};
    mapView.addMarker(marker);

    wait(3000).then(function() {
        var marker2 = mapView.findMarker(function(marker) { return marker.userData.index === 2; });
        console.log("Moving marker...", marker2.userData);
        marker2.position = mapsModule.Position.positionFromLatLng(-33.33,151.08);
        marker2.rotation = 45;
        polyline.removePoint(point);
        return wait(3000);
    }).then(function() {
        vmModule.mainViewModel.set("zoom", 10);
        console.log("Zooming in...", vmModule.mainViewModel);
        return wait(3000);
    }).then(function() {
        polyline.addPoint(mapsModule.Position.positionFromLatLng(-33.33,151.08));
        console.log("Adding point to Polyline...", polyline);
        return wait(3000);
    }).then(function() {
        var marker2 = mapView.findMarker(function(marker) { return marker.userData.index === 2; });
        marker2.visible = true;
        return wait(3000);
    }).then(function() {
        var marker2 = mapView.findMarker(function(marker) { return marker.userData.index === 2; });
        marker.position = mapsModule.Position.positionFromLatLng(-32.89,151.44);
        return wait(3000);
    }).then(function() {
        var marker1 = mapView.findMarker(function(marker) { return marker.userData.index === 1; });
        console.log("Removing marker...", marker1.userData);
        mapView.removeMarker(marker1);
        return wait(3000);
    }).then(function() {
        console.log("Removing all markers...");
        mapView.removeAllMarkers();
    }).catch(function(error){
      console.log(error);
    });

}

function onMarkerSelect(args) {
   console.log("Clicked on "+args.marker.title);
}

var lastCamera = null;
function onCameraChanged(args) {
    console.log("Camera changed: "+JSON.stringify(args.camera), JSON.stringify(args.camera) === lastCamera);
    lastCamera = JSON.stringify(args.camera); 
}

exports.onMapReady = onMapReady;
exports.onMarkerSelect = onMarkerSelect;
exports.onCameraChanged = onCameraChanged;
