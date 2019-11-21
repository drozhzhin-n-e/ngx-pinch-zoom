import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DemoTransitionDurationComponent } from './transition-duration.component';
import { DemoDoubleTapScaleComponent } from './double-tap-scale.component';
import { DemoZoomButtonScaleComponent } from './zoom-button-scale.component';
import { DemoAutoZoomOutComponent } from './auto-zoom-out.component';
import { DemoLimitZoomComponent } from './limit-zoom.component';


const routes: Routes = [
    { path: 'transition-duration', component: DemoTransitionDurationComponent },
    { path: 'double-tap-scale', component: DemoDoubleTapScaleComponent },
    { path: 'zoom-button-scale', component: DemoZoomButtonScaleComponent },
    { path: 'auto-zoom-out', component: DemoAutoZoomOutComponent },
    { path: 'limit-zoom', component: DemoLimitZoomComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class DemoRoutingModule { }
