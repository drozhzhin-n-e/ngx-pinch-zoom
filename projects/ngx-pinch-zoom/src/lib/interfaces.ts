export interface Properties {
    element?: HTMLElement;
    doubleTap?: boolean;
    doubleTapScale?: number;
    zoomControlScale?: number;
    transitionDuration?: number;
    autoZoomOut?: boolean;
    limitZoom?: number | string | 'original image size';
    disablePan?: boolean;
    limitPan?: boolean;
    minPanScale?: number;
    minScale?: number;
    listeners?: 'auto' | 'mouse and touch';
    wheel?: boolean;
    fullImage?: {
        path: string;
        minScale?: number;
    };
    autoHeight?: boolean;
    wheelZoomFactor?: number;
    draggableImage?: boolean;
    draggableOnPinch?: boolean;
}
