import {ChangeDetectorRef, Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, Output, OnDestroy, SimpleChanges} from '@angular/core';

import {Properties} from './interfaces';
import {defaultProperties, backwardCompatibilityProperties} from './properties';
import {Touches} from './touches';
import {IvyPinch} from './ivypinch';


@Component({
	selector: 'pinch-zoom',
	templateUrl: './pinch-zoom.component.html',
    styleUrls: ['./pinch-zoom.component.css']
})

export class PinchZoomComponent implements OnDestroy {

    pinchZoom: any;
    _properties: Properties;

    get isZoomButton() {
        return this.properties["zoomButton"];
    }

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
    @Input('zoom-button') zoomButton = true;
    @Input('zoom-button-scale') zoomButtonScale = 2;
    @Input('auto-zoom-out') autoZoomOut = false;
    @Input('limit-zoom') limitZoom: number;
    @Input('disabled') disabled: boolean = false;

    @Output() events: EventEmitter<any> = new EventEmitter<any>();

    @HostBinding('style.display') hostDisplay: string = "block";
    @HostBinding('style.overflow') hostOverflow: string = "hidden";

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
        if (this.pinchZoom) {
            return this.pinchZoom.isDragging();
        }
    }

    get isDisabled() {
        if (this.properties) {
            return this.properties.disabled;
        }
    }

    get scale() {
        if (this.pinchZoom) {
            return this.pinchZoom.scale;
        }
    }

    constructor(private elementRef: ElementRef) {
        this.applyOptionsDefault(defaultProperties, {});
    }

    ngOnInit(){
        this.initPinchZoom();
    }

    ngOnChanges(changes) {
        let changedOptions = this.getProperties(changes);
        changedOptions = this.renameProperties(changedOptions);

        this.applyOptionsDefault(defaultProperties, changedOptions);
    }

    ngOnDestroy() {

    }

    initPinchZoom() {
        if (this.properties.disabled) {
            return;
        }

        this.properties.element = this.elementRef.nativeElement.querySelector('.pinch-zoom-content');
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
}