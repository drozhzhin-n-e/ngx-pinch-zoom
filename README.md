# Pinch zoom for Angular

The module provides opportunities for image zooming in, zooming out and positioning with use of gestures on a touch screen. 

Live demos and source code samples can be found on [home page](http://ivylab.space/pinch-zoom).

🔬️ Help make Pinch zoom better by [answering a few questions](https://docs.google.com/forms/d/e/1FAIpQLSfDW_yLcKTlRzhUy3PMAFMgmsmy9cNyeML8hQ8rOgM3PEIKGA/viewform?usp=sf_link).

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
| transition-duration | number       | 200     | Defines the speed of the animation of positioning and transforming.|
| limit-zoom       | number          | 3       | Limit the maximum available scale. |
| minScale         | number          | 0       | Limit the minimum acceptable scale. With a value of 1, it is recommended to use this parameter with `limitPan` |
| auto-zoom-out    | boolean         | false   | Automatic restoration of the original size of an image after its zooming in by two fingers.|
| double-tap       | boolean         | true    | Zooming in and zooming out of an image, depending on its current condition, with double tap.|
| disabled         | boolean         | false   | Disable zoom. |
| disablePan       | boolean         | false   | Turn off panning with one finger. |
| overflow         | "hidden", "visible" | "hidden" | `hidden` - the overflow is clipped, and the rest of the content will be invisible. `visible` - the overflow is not clipped. The content renders outside the element's box. |
| disableZoomControl | "disable", "never", "auto" | "auto" | Disable zoom controls. `auto` - Disable zoom controls on touch screen devices. `never` - show zoom controls on all devices. `disable` - disable zoom controls on all devices. |
| zoomControlScale | number          | 1       | Zoom factor when using zoom controls. |
| backgroundColor  | string          | "rgba(0,0,0,0.85)" | The background color of the container. |
| limitPan         | boolean         | false   | Stop panning when the edge of the image reaches the edge of the screen. |

## Methods

| name                    | description                                 |
|-------------------------|---------------------------------------------|
| toggleZoom()            | Image zooming in and out, depending on its current state. |
| destroy()               | Unsubscribe from mouse events and touches, as well as remove added styles from the DOM tree. |

## Events

| name             | type                      | description                                 |
|------------------|---------------------------|---------------------------------------------|
| touchstart       | {name: "touchstart"}      | One or more touch points are placed on the touch surface.|
| touchend         | {name: "touchend"}        | One or more touch points are removed from the touch surface.|
| pan              | {name: "pan", detail: {moveX: number, moveY: number}} | A user moves a zoomed image in any direction by a finger.|
| pinch            | {name: "pinch", detail: {scale: number}} | A user zooms an image in or out by two fingers.|
| double-tap       | {name: "double-tap"}      | Double touch, consisting of two quick taps.|
| zoom-in          | {name: "zoom-in"}         | Zoom-in event is opened, when an image is zoomed in by the button (zoom icon with "+") or by toggleZoom method.|
| zoom-out         | {name: "zoom-out"}        | Zoom-in event is opened, when an image is zoomed out by the button (zoom icon with "-") or by toggleZoom method.|


## Sponsors

Tested using Browserstack

[![Browserstack](http://crystalui.org/assets/img/browserstack-logo.png)](http://browserstack.com/)
