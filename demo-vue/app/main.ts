import Vue from 'nativescript-vue';
import App from './components/App.vue';
import { isIOS } from "tns-core-modules/platform";
import { MapView } from "nativescript-google-maps-sdk";

(<any>Vue).registerElement('MapView', () => MapView);

// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production');

declare const GMSServices: any;

if (isIOS) {
  GMSServices.provideAPIKey("AIzaSyAtRVvG3Be3xXiZFR7xp-K-9hy4nZ4hMFs");
}

new Vue({
  render: h => h('frame', [h(App)])
}).$start();
