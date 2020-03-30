import {ChangeDetectorRef, Component, ElementRef, HostBinding, HostListener, Input, OnDestroy, SimpleChanges} from '@angular/core';

import {Properties} from './interfaces';
import {defaultProperties, backwardCompatibilityProperties} from './properties';
import {Touches} from './touches';
import {IvyPinch} from './ivypinch';

@Component({
	selector: 'pinch-zoom, [pinch-zoom]',
    exportAs: 'pinchZoom',
    templateUrl: './pinch-zoom.component.html',
    styleUrls: ['./pinch-zoom.component.sass']
})

export class PinchZoomComponent implements OnDestroy {

    pinchZoom: any;
    _properties: Properties;

    @Input('properties') set properties(value: Properties) {
        if (value) {
            this._properties = value;
        }
    }
    get properties() {
        return this._properties;
    }

    @Input('transition-duration') transitionDuration = 200;
    @Input('double-tap') doubleTap = true;
    @Input('double-tap-scale') doubleTapScale = 2;
    @Input('auto-zoom-out') autoZoomOut = false;
    @Input('limit-zoom') limitZoom: number | "original image size";
    @Input('disabled') disabled: boolean = false;
    @Input() disablePan: boolean;
    @Input() overflow: "hidden" | "visible";
    @Input() zoomControlScale: number = 1;
    @Input() disableZoomControl: "disable" | "never" | "auto";
    @Input() backgroundColor: string = "rgba(0,0,0,0.85)";
    @Input() limitPan: boolean;
    @Input() minPanScale: number = 1.0001;
    @Input() minScale: number = 0;
    @Input() listeners: 'auto' | 'mouse and touch' = 'mouse and touch';
    @Input() wheel: boolean = true;
    @Input() autoHeight: boolean = false;
    @Input() wheelZoomFactor: number = 0.2;
    @Input() draggableImage: boolean = false;

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
        var mq = function(query) {
            return window.matchMedia(query).matches;
        }

        if (('ontouchstart' in window)) {
            return true;
        }

        // include the 'heartz' as a way to have a non matching MQ to help terminate the join
        // https://git.io/vznFH
        var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
        return mq(query);
    }

    get isDragging() {
        return this.pinchZoom.isDragging();
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

    constructor(private elementRef: ElementRef) {
        this.applyOptionsDefault(defaultProperties, {});
    }

    ngOnInit(){
        this.initPinchZoom();
        
        /* Calls the method until the image size is available */
        this.pollLimitZoom();
    }

    ngOnChanges(changes) {
        let changedOptions = this.getProperties(changes);
        changedOptions = this.renameProperties(changedOptions);

        this.applyOptionsDefault(defaultProperties, changedOptions);
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

    getProperties(changes){
        let properties = {};

        for (var prop in changes) {
            if (prop !== 'properties'){
                properties[prop] = changes[prop].currentValue;
            }
            if (prop === 'properties'){
                properties = changes[prop].currentValue;
            }
        }
        return properties;
    }

    renameProperties(options: Properties) {
        for (var prop in options) {
            if (backwardCompatibilityProperties[prop]) {
                options[backwardCompatibilityProperties[prop]] = options[prop];
                delete options[prop];
            }
        }

        return options;
    }

    applyOptionsDefault(defaultOptions, options): void {
        this.properties = Object.assign({}, defaultOptions, options);
    }

    toggleZoom() {
        this.pinchZoom.toggleZoom();
    }

    isControl() {
        if (this.isDisabled) {
            return false;
        }

        if (this.properties['disableZoomControl'] === "disable") {
            return false;
        }

        if (this.isTouchScreen && this.properties['disableZoomControl'] === "auto") {
            return false;
        }

        return true;
    }

    pollLimitZoom() {
        this.pinchZoom.pollLimitZoom();
    }

    destroy() {
        this.pinchZoom.destroy();
    }
}