import { ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, SimpleChanges } from '@angular/core';

import { Properties } from './interfaces';
import { defaultProperties, backwardCompatibilityProperties } from './properties';
import { IvyPinch } from './ivypinch';

interface ComponentProperties extends Properties {
    disabled?: boolean;
    overflow?: 'hidden' | 'visible';
    disableZoomControl?: 'disable' | 'never' | 'auto';
    backgroundColor?: string;
}

export const _defaultComponentProperties: ComponentProperties = {
    overflow: 'hidden',
    disableZoomControl: 'auto',
    backgroundColor: 'rgba(0,0,0,0.85)',
};

type PropertyName = keyof ComponentProperties;

@Component({
    selector: 'pinch-zoom, [pinch-zoom]',
    exportAs: 'pinchZoom',
    templateUrl: './pinch-zoom.component.html',
    styleUrls: ['./pinch-zoom.component.sass'],
})
export class PinchZoomComponent implements OnDestroy {
    pinchZoom: any;
    _properties!: ComponentProperties;
    defaultComponentProperties!: ComponentProperties;
    zoomControlPositionClass: string | undefined;
    _transitionDuration!: number;
    _doubleTap!: boolean;
    _doubleTapScale!: number;
    _autoZoomOut!: boolean;
    _limitZoom!: number | 'original image size';

    @Input('properties') set properties(value: ComponentProperties) {
        if (value) {
            this._properties = value;
        }
    }

    get properties() {
        return this._properties;
    }

    // transitionDuration
    @Input('transition-duration') set transitionDurationBackwardCompatibility(value: number) {
        if (value) {
            this._transitionDuration = value;
        }
    }

    @Input('transitionDuration') set transitionDuration(value: number) {
        if (value) {
            this._transitionDuration = value;
        }
    }

    get transitionDuration() {
        return this._transitionDuration;
    }

    // doubleTap
    @Input('double-tap') set doubleTapBackwardCompatibility(value: boolean) {
        if (value) {
            this._doubleTap = value;
        }
    }

    @Input('doubleTap') set doubleTap(value: boolean) {
        if (value) {
            this._doubleTap = value;
        }
    }

    get doubleTap() {
        return this._doubleTap;
    }

    // doubleTapScale
    @Input('double-tap-scale') set doubleTapScaleBackwardCompatibility(value: number) {
        if (value) {
            this._doubleTapScale = value;
        }
    }

    @Input('doubleTapScale') set doubleTapScale(value: number) {
        if (value) {
            this._doubleTapScale = value;
        }
    }

    get doubleTapScale() {
        return this._doubleTapScale;
    }

    // autoZoomOut
    @Input('auto-zoom-out') set autoZoomOutBackwardCompatibility(value: boolean) {
        if (value) {
            this._autoZoomOut = value;
        }
    }

    @Input('autoZoomOut') set autoZoomOut(value: boolean) {
        if (value) {
            this._autoZoomOut = value;
        }
    }

    get autoZoomOut() {
        return this._autoZoomOut;
    }

    // limitZoom
    @Input('limit-zoom') set limitZoomBackwardCompatibility(value: number | 'original image size') {
        if (value) {
            this._limitZoom = value;
        }
    }

    @Input('limitZoom') set limitZoom(value: number | 'original image size') {
        if (value) {
            this._limitZoom = value;
        }
    }

    get limitZoom() {
        return this._limitZoom;
    }

    @Input() disabled!: boolean;
    @Input() disablePan!: boolean;
    @Input() overflow!: 'hidden' | 'visible';
    @Input() zoomControlScale!: number;
    @Input() disableZoomControl!: 'disable' | 'never' | 'auto';
    @Input() backgroundColor!: string;
    @Input() limitPan!: boolean;
    @Input() minPanScale!: number;
    @Input() minScale!: number;
    @Input() listeners!: 'auto' | 'mouse and touch';
    @Input() wheel!: boolean;
    @Input() autoHeight!: boolean;
    @Input() wheelZoomFactor!: number;
    @Input() draggableImage!: boolean;

    @HostBinding('style.overflow')
    get hostOverflow() {
        return this.properties['overflow'];
    }

    @HostBinding('style.background-color')
    get hostBackgroundColor() {
        return this.properties['backgroundColor'];
    }

    get isTouchScreen() {
        var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
        var mq = function (query: any) {
            return window.matchMedia(query).matches;
        };

        if ('ontouchstart' in window) {
            return true;
        }

        // include the 'heartz' as a way to have a non matching MQ to help terminate the join
        // https://git.io/vznFH
        var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
        return mq(query);
    }

    get isDragging() {
        return this.pinchZoom ? this.pinchZoom.isDragging() : undefined;
    }

    get isDisabled() {
        return this.properties['disabled'];
    }

    get scale() {
        return this.pinchZoom.scale;
    }

    get isZoomedIn() {
        return this.scale > 1;
    }

    get scaleLevel() {
        return Math.round(this.scale / this._zoomControlScale);
    }

    get maxScale() {
        return this.pinchZoom.maxScale;
    }

    get isZoomLimitReached() {
        return this.scale >= this.maxScale;
    }

    get _zoomControlScale() {
        return this.getPropertiesValue('zoomControlScale');
    }

    constructor(private elementRef: ElementRef) {
        this.defaultComponentProperties = this.getDefaultComponentProperties();
        this.applyPropertiesDefault(this.defaultComponentProperties, {});
    }

    ngOnInit() {
        this.initPinchZoom();

        /* Calls the method until the image size is available */
        this.detectLimitZoom();
    }

    ngOnChanges(changes: SimpleChanges) {
        let changedProperties = this.getProperties(changes);
        changedProperties = this.renameProperties(changedProperties);

        this.applyPropertiesDefault(this.defaultComponentProperties, changedProperties);
    }

    ngOnDestroy() {
        this.destroy();
    }

    initPinchZoom() {
        if (this.properties['disabled']) {
            return;
        }

        this.properties['element'] = this.elementRef.nativeElement.querySelector('.pinch-zoom-content');
        this.pinchZoom = new IvyPinch(this.properties);
    }

    getProperties(changes: SimpleChanges) {
        let properties: any = {};

        for (var prop in changes) {
            if (prop !== 'properties') {
                properties[prop] = changes[prop].currentValue;
            }
            if (prop === 'properties') {
                properties = changes[prop].currentValue;
            }
        }
        return properties;
    }

    renameProperties(properties: any) {
        for (var prop in properties) {
            if (backwardCompatibilityProperties[prop]) {
                properties[backwardCompatibilityProperties[prop]] = properties[prop];
                delete properties[prop];
            }
        }

        return properties;
    }

    applyPropertiesDefault(defaultProperties: ComponentProperties, properties: ComponentProperties): void {
        this.properties = Object.assign({}, defaultProperties, properties);
    }

    toggleZoom() {
        this.pinchZoom.toggleZoom();
    }

    isControl() {
        if (this.isDisabled) {
            return false;
        }

        if (this.properties['disableZoomControl'] === 'disable') {
            return false;
        }

        if (this.isTouchScreen && this.properties['disableZoomControl'] === 'auto') {
            return false;
        }

        return true;
    }

    detectLimitZoom() {
        if (this.pinchZoom) {
            this.pinchZoom.detectLimitZoom();
        }
    }

    destroy() {
        if (this.pinchZoom) this.pinchZoom.destroy();
    }

    getPropertiesValue(propertyName: PropertyName) {
        if (this.properties && this.properties[propertyName]) {
            return this.properties[propertyName];
        } else {
            return this.defaultComponentProperties[propertyName];
        }
    }

    getDefaultComponentProperties() {
        return { ...defaultProperties, ..._defaultComponentProperties };
    }
}
