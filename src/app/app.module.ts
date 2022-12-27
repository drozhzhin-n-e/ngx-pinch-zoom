import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { PinchZoomModule } from '../../projects/ngx-pinch-zoom/src/public-api';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// import { PinchZoomModule } from 'ngx-pinch-zoom';

@NgModule({
  declarations: [
    AppComponent
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
