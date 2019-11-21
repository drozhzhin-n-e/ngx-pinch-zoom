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
| auto-zoom-out    | boolean         | false   | Automatic restoration of the original size of an image after its zooming in by two fingers.|
| double-tap       | boolean         | true    | Zooming in and zooming out of an image, depending on its current condition, with double tap.|
| zoom-button      | boolean         | true    | Show the button for zooming in or zooming out of an image (available in desktop mode).|
| disabled | boolean    | false   | Disable zoom.|

## Methods

| name                    | description                                 |
|-------------------------|---------------------------------------------|
| toggleZoom()            | Image zooming in and out, depending on its current state. |
| alignImage()            | Ranging the elements by pressing them to the edge of the parental element. |

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
