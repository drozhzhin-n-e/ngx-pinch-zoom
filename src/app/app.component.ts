import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
	myProperties = {
		"double-tap-scale": 3
	}
	
	handlePinchZoomEvents(event){
		console.log(event);
	}
}
