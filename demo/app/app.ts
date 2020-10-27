import {Application} from "@nativescript/core";

declare var GMSServices: any;
if(Application.ios) {
  GMSServices.provideAPIKey("AIzaSyAtRVvG3Be3xXiZFR7xp-K-9hy4nZ4hMFs");
}

Application.run({ moduleName: "main-page" });

/*
 Do not place any code after the application has been started as it will not
 be executed on iOS.
 */
