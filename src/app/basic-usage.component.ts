import { Component } from '@angular/core';

@Component({
  selector: 'basic-usage',
  templateUrl: './basic-usage.component.html'
})
export class BasicUsageComponent {
	handlePinchZoomEvents(event){
		console.log(event);
	}
}
