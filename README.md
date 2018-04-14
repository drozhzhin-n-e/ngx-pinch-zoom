## Demo
http://crystalui.org/components/pinch-zoom/live (use mobile device)

![alt text](http://crystalui.org/assets/img/qr-pinch-zoom.png)

![demo](src/assets/pinch-zoom-animated-example.gif)

## Installation

Install the npm package.

    npm i ngx-pinch-zoom
        
Import module:

    import { PinchZoomComponent } from 'ngx-pinch-zoom/components';
     
    @NgModule({
        declarations: [ PinchZoomComponent ]
    })

## Usage
    
    <pinch-zoom height="100%">
        <img src="path_to_image" /> 
    </pinch-zoom>

## Properties

| name             | type                                | description                                                               |
|------------------|-------------------------------------|---------------------------------------------------------------------------|
| height           | string                              | Container height (in pixels or percentages).                              |