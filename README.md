# Pinch zoom for Angular 2

The module provides opportunities for image zooming in, zooming out and positioning with use of gestures on a touch screen. 

Live demos and source code samples can be found on [home page](http://crystalui.org/components/pinch-zoom).

## GIF demo

![demo](http://crystalui.org/assets/img/pinch-zoom-animated-example.gif)

## Installation

Install the npm package.

	npm i ngx-pinch-zoom

Import module:

	import { PinchZoomModule } from 'ngx-pinch-zoom';

	@NgModule({
	    imports: [ PinchZoomModule ]
	})

## Usage
For use, put your image inside the &lt;pinch-zoom&gt; container. Please, pay attention to the parameters of your viewport metatag. If you use Pinch Zoom, it is required to limit zooming of a web-page, by entering the following parameters: &lt;meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no"&gt;.

	<pinch-zoom>
	    <img src="path_to_image" /> 
	</pinch-zoom>

## Properties

| name             | type            | default | description                                 |
|------------------|-----------------|---------|---------------------------------------------|
| placement        | string          | auto    | Container height (in pixels or percentages).|
| transition-duration | number       | 200     | Defines the speed of the animation of positioning and transforming.|
| auto-zoom-out    | boolean         | false   | Automatic restoration of the original size of an image after its zooming in by two fingers.|

## Events

| name             | type                      | description                                 |
|------------------|---------------------------|---------------------------------------------|
| touchstart       | {type: "touchstart"}      | The touchstart event is fired when one or more touch points are placed on the touch surface.|
| touchend         | {type: "touchend"}        | The touchend event is fired when one or more touch points are removed from the touch surface.|
| swipe            | {type: "swipe", moveX: number, moveY: number} | Swipe event is opened, when a user shifts a zoomed image in any direction by a finger.|
| pinch            | {type: "pinch"}           | Pinch event is opened, when a user zooms an image in or out by two fingers.|

Perhaps you will be interested in the expanded properties, methods and events of the [commercial version](http://crystalui.org/components/pinch-zoom).

## Sponsors

We use Browserstack for cross-browser testing.

[![Browserstack](http://crystalui.org/assets/img/browserstack-logo.png)](http://browserstack.com/)
