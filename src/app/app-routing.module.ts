import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { BasicUsageComponent } from './basic-usage.component';


const routes: Routes = [
	{ 
        path: '', 
        component: BasicUsageComponent
    },
    { 
        path: 'demo', 
        loadChildren: './demo/demo.module#DemoModule'
    },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
