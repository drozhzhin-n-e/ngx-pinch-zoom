import { NgModule } from '@angular/core';

import { DemoRoutingModule } from './demo-routing.module';
import { PinchZoomModule } from './../pinch-zoom/pinch-zoom.module';
import { DemoTransitionDurationComponent } from './transition-duration.component';
import { DemoDoubleTapScaleComponent } from './double-tap-scale.component';
import { DemoZoomButtonScaleComponent } from './zoom-button-scale.component';
import { DemoAutoZoomOutComponent } from './auto-zoom-out.component';
import { DemoLimitZoomComponent } from './limit-zoom.component';

@NgModule({
  declarations: [
    DemoTransitionDurationComponent,
    DemoDoubleTapScaleComponent,
    DemoZoomButtonScaleComponent,
    DemoAutoZoomOutComponent,
    DemoLimitZoomComponent
  ],
  imports: [
    DemoRoutingModule,
    PinchZoomModule
  ]
})
export class DemoModule { }
