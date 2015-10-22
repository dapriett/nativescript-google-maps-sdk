NativeScript plugin for Google Maps SDK
================

This is a cross-platform (iOS & Android) Nativescript plugin for the [Google Maps API](https://developers.google.com/maps/)

[![NPM version][npm-image]][npm-url] [![Dependency status][david-dm-image]][david-dm-url]
[npm-url]: https://npmjs.org/package/nativescript-google-maps-sdk
[npm-image]: http://img.shields.io/npm/v/nativescript-google-maps-sdk.svg
[david-dm-url]:https://david-dm.org/dapriett/nativescript-google-maps-sdk
[david-dm-image]:https://david-dm.org/dapriett/nativescript-google-maps-sdk.svg

Installation
===

## Install the plugin using the NativeScript CLI tooling

```
tns plugin add nativescript-google-maps-sdk
```

Setup Google Maps API
===
 
If you haven't already, go to the [Google Developers Console](https://console.developers.google.com), create a project, and enable the `Google Maps Android API` and `Google Maps SDK for iOS` APIs.  Then under credentials, create an API key.

## Setup Android API Key

First copy over the template string resource files for Android

```
cp -r node_modules/nativescript-google-maps-sdk/platforms/android/res/values app/App_Resources/Android/
```

Next modify the file at `app/App_Resources/Android/values/nativescript_google_maps_api.xml`, replace `PUT_API_KEY_HERE` with your api key.

## Setup iOS API Key

In the main script of your app `app.js`, use the following to add the API key (providing your key in place of `PUT_API_KEY_HERE`)

```
if(application.ios) {
  GMSServices.provideAPIKey("PUT_API_KEY_HERE");
}
```

##  Adding the MapView

Modify your view by adding the namespace `xmlns:maps="nativescript-google-maps-sdk"` to your page, then using the `<maps:mapView />` tag to create the MapView.

```
 <!-- /app/main-page.xml -->
 <Page 
	xmlns="http://www.nativescript.org/tns.xsd"
	xmlns:maps="nativescript-google-maps-sdk"
	>
  <GridLayout>
    <maps:mapView latitude="{{ latitude }}" longitude="{{ latitude }}" 
    								zoom="{{ zoom }}" bearing="{{ bearing }}" 
    								tilt="{{ tilt }}" mapReady="OnMapReady" />
  </GridLayout>
</Page>
```

The following properties `latitude`, `latitude`, `zoom`, `bearing`, and `tilt` are available to you for adjusting camera view.

You can also use the `mapReady` event to listen for when the google map is ready, then add custom code to modify the maps for adding markers, etc.

The property `gMap` gives you access to the raw platform Map Object - see their SDK references for how to use them ( [iOS](https://developers.google.com/maps/documentation/ios-sdk/reference/interface_g_m_s_map_view) | [Android](https://developers.google.com/android/reference/com/google/android/gms/maps/GoogleMap) )

```
//  /app/main-page.js

function OnMapReady(args) {
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
		var position = CLLocationCoordinate2DMake(-33.86, 151.20);
		var marker = GMSMarker.markerWithPosition(position)
		marker.title = "Sydney";
		marker.snippet = "Australia";
		marker.map = gMap;
    }
}
exports.OnMapReady = OnMapReady;
```
