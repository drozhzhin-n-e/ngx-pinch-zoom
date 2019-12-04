import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DemoTransitionDurationComponent } from './transition-duration.component';
import { DemoDoubleTapScaleComponent } from './double-tap-scale.component';
import { DemoZoomControlScaleComponent } from './zoom-control-scale.component';
import { DemoAutoZoomOutComponent } from './auto-zoom-out.component';
import { DemoLimitZoomComponent } from './limit-zoom.component';
import { DemoOverflowComponent } from './overflow.component';
import { DemoLimitPanComponent } from './limit-pan.component';
import { DemoMinScaleComponent } from './min-scale.component';


const routes: Routes = [
    { path: 'transition-duration', component: DemoTransitionDurationComponent },
    { path: 'double-tap-scale', component: DemoDoubleTapScaleComponent },
    { path: 'zoom-control-scale', component: DemoZoomControlScaleComponent },
    { path: 'auto-zoom-out', component: DemoAutoZoomOutComponent },
    { path: 'limit-zoom', component: DemoLimitZoomComponent },
    { path: 'overflow', component: DemoOverflowComponent },
    { path: 'limit-pan', component: DemoLimitPanComponent },
    { path: 'min-scale', component: DemoMinScaleComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DemoRoutingModule { }
