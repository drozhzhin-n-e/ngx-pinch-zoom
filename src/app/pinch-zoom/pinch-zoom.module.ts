import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PinchZoomComponent } from './pinch-zoom.component'; 

@NgModule({
    declarations: [
        PinchZoomComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        PinchZoomComponent
    ],
    entryComponents: [
        PinchZoomComponent
    ]
})
export class PinchZoomModule { }
