var vmModule = require("./main-view-model");
var observableModule = require("data/observable");
var mapsModule = require("nativescript-google-maps-sdk");

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
    var mapView = args.object;
    var gMap = mapView.gMap;

    console.log("Setting a marker...");

    if(mapView.android) {
        var markerOptions = new com.google.android.gms.maps.model.MarkerOptions();
        markerOptions.title("Sydney");
        markerOptions.snippet("Australia");
        var latLng = new com.google.android.gms.maps.model.LatLng(-33.86, 151.20);
        markerOptions.position(latLng);
        gMap.addMarker(markerOptions);
    }

    if (mapView.ios) {
        var marker = new mapsModule.Marker();
        marker.position = mapsModule.Position.positionFromLatLng(-33.86, 151.20);
        marker.title = "Sydney";
        marker.snippet = "Australia";
        marker.userData = { index : 1};
        mapView.addMarker(marker);
        
        var m1 = new mapsModule.Marker();
        m1.position = mapsModule.Position.positionFromLatLng(-35.86, 141.20);
        m1.title = "Canberra";
        m1.snippet = "Australia";
        m1.userData = { index : 2};
        mapView.addMarker(m1);
    }

    wait(1000).then(function() {
        var marker1 = mapView.findMarker(function(marker) { return marker.userData.index == 1; });
        marker1.position = mapsModule.Position.positionFromLatLng(-34.86, 151.20);
    }).then(function(){
        return wait(1000);
    }).then(function() {
        var marker1 = mapView.findMarker(function(marker) { return marker.userData.index == 1; });
        mapView.removeMarker(marker1);
    });
}

function onMarkerSelect(args) {
   console.log("Clicked on "+args.marker.title);  
}

function onCameraChanged(args) {
    console.log("Camera changed: "+JSON.stringify(args.camera));
}

exports.onMapReady = onMapReady;
exports.onMarkerSelect = onMarkerSelect;
exports.onCameraChanged = onCameraChanged;
