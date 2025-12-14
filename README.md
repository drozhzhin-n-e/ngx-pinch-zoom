# Note

This Project has been forked to be updated to work with Angular versions 19 and 20.

# Pinch zoom for Angular

The module provides opportunities for image zooming in, zooming out and positioning with use of gestures on a touch screen.

## Installation

Install the npm package.

```
npm i @meddv/ngx-pinch-zoom
```

Import module:

```ts
import { PinchZoomComponent } from '@meddv/ngx-pinch-zoom';

@NgModule({
    imports: [ PinchZoomComponent ]
})
```

## Usage

For use, put your image inside the &lt;pinch-zoom&gt; container. Please, pay attention to the parameters of your viewport metatag. If you use Pinch Zoom, it is required to limit zooming of a web-page, by entering the following parameters: &lt;meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no"&gt;.

```html
<pinch-zoom>
    <img src="path_to_image" />
</pinch-zoom>
```

## Properties

| name                | type                          | default               | description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------- | ----------------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| transition-duration | number                        | 200                   | Defines the speed of the animation of positioning and transforming.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| limit-zoom          | number, "original image size" | "original image size" | Limit the maximum available scale. By default, the maximum scale is calculated based on the original image size.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| minScale            | number                        | 0                     | Limit the minimum acceptable scale. With a value of 1, it is recommended to use this parameter with `limitPan`                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| auto-zoom-out       | boolean                       | false                 | Automatic restoration of the original size of an image after its zooming in by two fingers.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| double-tap          | boolean                       | true                  | Zooming in and zooming out of an image, depending on its current condition, with double tap.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| disabled            | boolean                       | false                 | Disable zoom.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| disablePan          | boolean                       | false                 | Turn off panning with one finger.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| overflow            | "hidden", "visible"           | "hidden"              | `hidden` - the overflow is clipped, and the rest of the content will be invisible. `visible` - the overflow is not clipped. The content renders outside the element's box.                                                                                                                                                                                                                                                                                                                                                                                                   |
| disableZoomControl  | "disable", "never", "auto"    | "auto"                | Disable zoom controls. `auto` - Disable zoom controls on touch screen devices. `never` - show zoom controls on all devices. `disable` - disable zoom controls on all devices.                                                                                                                                                                                                                                                                                                                                                                                                |
| zoomControlScale    | number                        | 1                     | Zoom factor when using zoom controls.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| backgroundColor     | string                        | "rgba(0,0,0,0.85)"    | The background color of the container.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| limitPan            | boolean                       | false                 | Stop panning when the edge of the image reaches the edge of the screen.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| minPanScale         | number                        | 1.0001                | Minimum zoom at which panning is enabled.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| listeners           | "auto", "mouse and touch"     | "mouse and touch"     | By default, subscriptions are made for mouse and touch screen events. The value `auto` means that the subscription will be only for touch events or only for mouse events, depending on the type of screen.                                                                                                                                                                                                                                                                                                                                                                  |
| wheel               | boolean                       | true                  | Scale with the mouse wheel.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| wheelZoomFactor     | number                        | 0.2                   | Zoom factor when zoomed in with the mouse wheel.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| autoHeight          | boolean                       | false                 | Calculate the height of the container based on the `width` and `height` attributes of the image. By default, the width of the container is 100%, and the height is determined after the image information is loaded - this may cause a delay in determining the height of the container. If you want the container to initially have dimensions corresponding to the dimensions of the image, then specify the attributes `width` and `height` for the `<img>` tag. When setting the property value to `true`, a subscription to the window resize listener will be created. |
| draggableImage      | boolean                       | false                 | Sets the attribute `draggable` to the `<img>` tag.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| draggableOnPinch    | boolean                       | false                 | When set to `true` content can be moved around while touching or pinching with two fingers.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

## Outputs

| name        | description                                    |
| ----------- | ---------------------------------------------- |
| zoomChanged | Emits current `scale: number` if it's changed. |

## Methods

| name                   | description                                                                                  |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| toggleZoom()           | Image zooming in and out, depending on its current state.                                    |
| zoomIn(value: number)  | Zoom in by `value`, respects `limit-zoom` option. Returns `scale: number`.                   |
| zoomOut(value: number) | Zoom out by `value`, respects `minScale` option. Returns `scale: number`.                    |
| destroy()              | Unsubscribe from mouse events and touches, as well as remove added styles from the DOM tree. |

## Contributor services

Contact us over our Issue Tracker.
