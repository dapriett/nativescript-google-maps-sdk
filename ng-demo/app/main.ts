// this import should be first in order to load some required settings (like globals and reflect-metadata)
import { platformNativeScriptDynamic } from "nativescript-angular/platform";
var application = require("application");

declare const GMSServices: any;

import { AppModule } from "./app.module";

if(application.ios) {
    GMSServices.provideAPIKey("AIzaSyAtRVvG3Be3xXiZFR7xp-K-9hy4nZ4hMFs");
}

platformNativeScriptDynamic().bootstrapModule(AppModule);
