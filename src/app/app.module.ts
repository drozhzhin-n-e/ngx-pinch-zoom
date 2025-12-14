import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {PinchZoomComponent} from "ngx-pinch-zoom";

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, AppRoutingModule, PinchZoomComponent],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
