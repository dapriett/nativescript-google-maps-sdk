import { NgModule } from "@angular/core";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { Routes } from "@angular/router";
import { MapComponent } from "./map/map.component";

const routes: Routes = [
    { path: "", redirectTo: "map", pathMatch: 'full' },
    { path: "map", component: MapComponent, pathMatch: 'full' },
];

@NgModule({
    imports: [ NativeScriptRouterModule.forRoot(routes) ],
    exports: [ NativeScriptRouterModule ]
})
export class AppRoutingModule { }