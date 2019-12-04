import { NgModule } from '@angular/core';

import { DemoRoutingModule } from './demo-routing.module';
import { PinchZoomModule } from './../pinch-zoom/pinch-zoom.module';
import { DemoTransitionDurationComponent } from './transition-duration.component';
import { DemoDoubleTapScaleComponent } from './double-tap-scale.component';
import { DemoZoomControlScaleComponent } from './zoom-control-scale.component';
import { DemoAutoZoomOutComponent } from './auto-zoom-out.component';
import { DemoLimitZoomComponent } from './limit-zoom.component';
import { DemoOverflowComponent } from './overflow.component';
import { DemoLimitPanComponent } from './limit-pan.component';
import { DemoMinScaleComponent } from './min-scale.component';


@NgModule({
  declarations: [
    DemoTransitionDurationComponent,
    DemoDoubleTapScaleComponent,
    DemoZoomControlScaleComponent,
    DemoAutoZoomOutComponent,
    DemoLimitZoomComponent,
    DemoOverflowComponent,
    DemoLimitPanComponent,
    DemoMinScaleComponent
  ],
  imports: [
    DemoRoutingModule,
    PinchZoomModule
  ]
})
export class DemoModule { }
