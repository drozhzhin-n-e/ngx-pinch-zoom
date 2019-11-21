import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BasicUsageComponent } from './basic-usage.component';
import { PinchZoomModule } from './pinch-zoom/pinch-zoom.module';

@NgModule({
  declarations: [
    AppComponent,
    BasicUsageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PinchZoomModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
