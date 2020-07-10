import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BasicUsageComponent } from './basic-usage.component';


const routes: Routes = [
	{
        path: '',
        component: BasicUsageComponent
    },
    {
        path: 'demo',
        loadChildren: () => import('./demo/demo.module').then(m => m.DemoModule)
    },
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule { }
