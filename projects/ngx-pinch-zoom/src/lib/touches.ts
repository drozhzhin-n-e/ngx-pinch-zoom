export interface Properties {
    element: HTMLElement;
    listeners?: 'auto' | 'mouse and touch';
    touchListeners?: TouchListeners;
    mouseListeners?: MouseListeners;
    otherListeners?: OtherListeners;
    resize?: boolean;
}

export type EventType =
    | undefined
    | 'touchstart'
    | 'touchend'
    | 'touchmove'
    | 'mousedown'
    | 'mouseup'
    | 'mousemove'
    | 'pan'
    | 'pinch'
    | 'horizontal-swipe'
    | 'vertical-swipe'
    | 'tap'
    | 'longtap'
    | 'wheel'
    | 'double-tap'
    | 'resize';
export type TouchHandler ='handleTouchstart' | 'handleTouchmove' | 'handleTouchend';
export type MouseHandler = 'handleMousedown' | 'handleMousemove' | 'handleMouseup' | 'handleWheel';
export type OtherHandler = 'handleResize';

export type TouchListeners = Partial<Record<'touchstart' | 'touchmove' | 'touchend', TouchHandler>>;
export type MouseListeners = Partial<Record<'mousedown' | 'mousemove' | 'mouseup' | 'wheel', MouseHandler>>;
export type OtherListeners = Partial<Record<'resize', OtherHandler>>;

export class Touches {
    private properties: Properties;
    private element: HTMLElement;
    private elementPosition: DOMRect;
    private eventType: EventType = undefined;
    private handlers: TouchListeners | MouseListeners | OtherListeners = {};
    private startX = 0;
    private startY = 0;
    private lastTap = 0;
    private doubleTapTimeout: number;
    private doubleTapMinTimeout = 300;
    private tapMinTimeout = 200;
    private touchstartTime = 0;
    private i: number = 0;
    private isMousedown = false;

    private _touchListeners: Record<'touchstart' | 'touchmove' | 'touchend', TouchHandler> = {
        touchstart: 'handleTouchstart',
        touchmove: 'handleTouchmove',
        touchend: 'handleTouchend',
    };
    private _mouseListeners: Record<'mousedown' | 'mousemove' | 'mouseup' | 'wheel', MouseHandler> = {
        mousedown: 'handleMousedown',
        mousemove: 'handleMousemove',
        mouseup: 'handleMouseup',
        wheel: 'handleWheel',
    };
    private _otherListeners: Record<'resize', OtherHandler> = {
        resize: 'handleResize',
    };

    private get touchListeners(): TouchListeners {
        return this.properties.touchListeners ? this.properties.touchListeners : this._touchListeners;
    }

    private get mouseListeners(): MouseListeners {
        return this.properties.mouseListeners ? this.properties.mouseListeners : this._mouseListeners;
    }

    private get otherListeners(): OtherListeners {
        return this.properties.otherListeners ? this.properties.otherListeners : this._otherListeners;
    }

    constructor(properties: Properties) {
        this.properties = properties;
        this.element = this.properties.element;
        this.elementPosition = this.getElementPosition();

        this.toggleEventListeners('addEventListener');
    }

    public destroy(): void {
        this.toggleEventListeners('removeEventListener');
    }

    private toggleEventListeners(action: 'addEventListener' | 'removeEventListener'): void {
        let listeners: TouchListeners | MouseListeners | OtherListeners;

        if (this.properties.listeners === 'mouse and touch') {
            listeners = Object.assign(this.touchListeners, this.mouseListeners);
        } else {
            listeners = this.detectTouchScreen() ? this.touchListeners : this.mouseListeners;
        }

        if (this.properties.resize) {
            listeners = Object.assign(listeners, this.otherListeners);
        }

        for (const listener in listeners) {
            const handler = listeners[listener];

            // Window
            if (listener === 'resize') {
                if (action === 'addEventListener') {
                    window.addEventListener(listener, this[handler], false);
                }
                if (action === 'removeEventListener') {
                    window.removeEventListener(listener, this[handler], false);
                }
                // Document
            } else if (listener === 'mouseup' || listener === 'mousemove') {
                if (action === 'addEventListener') {
                    document.addEventListener(listener, this[handler], false);
                }
                if (action === 'removeEventListener') {
                    document.removeEventListener(listener, this[handler], false);
                }
                // Element
            } else {
                if (action === 'addEventListener') {
                    this.element.addEventListener(listener, this[handler], false);
                }
                if (action === 'removeEventListener') {
                    this.element.removeEventListener(listener, this[handler], false);
                }
            }
        }
    }

    public addEventListeners(listener: string): void {
        const handler: MouseHandler = this._mouseListeners[listener];
        window.addEventListener(listener, this[handler], false);
    }

    public removeEventListeners(listener: string): void {
        const handler: MouseHandler = this._mouseListeners[listener];
        window.removeEventListener(listener, this[handler], false);
    }

    /*
     * Listeners
     */

    /* Touchstart */

    private handleTouchstart = (event: TouchEvent): void => {
        this.elementPosition = this.getElementPosition();
        this.touchstartTime = new Date().getTime();

        if (this.eventType === undefined) {
            this.getTouchstartPosition(event);
        }

        this.runHandler('touchstart', event);
    };

    /* Touchmove */

    private handleTouchmove = (event: TouchEvent): void => {
        const touches = event.touches;

        // Pan
        if (this.detectPan(touches)) {
            this.runHandler('pan', event);
        }

        // Pinch
        if (this.detectPinch(event)) {
            this.runHandler('pinch', event);
        }
    };

    private handleLinearSwipe(event: any): void {
        //event.preventDefault();

        this.i++;

        if (this.i > 3) {
            this.eventType = this.getLinearSwipeType(event);
        }

        if (this.eventType === 'horizontal-swipe') {
            this.runHandler('horizontal-swipe', event);
        }

        if (this.eventType === 'vertical-swipe') {
            this.runHandler('vertical-swipe', event);
        }
    }

    /* Touchend */

    private handleTouchend = (event: TouchEvent): void => {
        const touches = event.touches;

        // Double Tap
        if (this.detectDoubleTap()) {
            this.runHandler('double-tap', event);
        }

        // Tap
        this.detectTap();

        this.runHandler('touchend', event);
        this.eventType = 'touchend';

        if (touches && touches.length === 0) {
            this.eventType = undefined;
            this.i = 0;
        }
    };

    /* Mousedown */

    private handleMousedown = (event: MouseEvent): void => {
        this.isMousedown = true;
        this.elementPosition = this.getElementPosition();
        this.touchstartTime = new Date().getTime();

        if (this.eventType === undefined) {
            this.getMousedownPosition(event);
        }

        this.runHandler('mousedown', event);
    };

    /* Mousemove */

    private handleMousemove = (event: MouseEvent): void => {
        //event.preventDefault();

        if (!this.isMousedown) {
            return;
        }

        // Pan
        this.runHandler('pan', event);

        // Linear swipe
        switch (this.detectLinearSwipe(event)) {
            case 'horizontal-swipe':
                // FIXME: looks like an error
                // @ts-ignore
                event.swipeType = 'horizontal-swipe';
                this.runHandler('horizontal-swipe', event);
                break;
            case 'vertical-swipe':
                // FIXME: looks like an error
                // @ts-ignore
                event.swipeType = 'vertical-swipe';
                this.runHandler('vertical-swipe', event);
                break;
        }

        // Linear swipe
        if (
            this.detectLinearSwipe(event) ||
            this.eventType === 'horizontal-swipe' ||
            this.eventType === 'vertical-swipe'
        ) {
            this.handleLinearSwipe(event);
        }
    };

    /* Mouseup */

    private handleMouseup = (event: MouseEvent): void => {
        // Tap
        this.detectTap();

        this.isMousedown = false;
        this.runHandler('mouseup', event);
        this.eventType = undefined;
        this.i = 0;
    };

    /* Wheel */

    private handleWheel = (event: WheelEvent): void => {
        this.runHandler('wheel', event);
    };

    /* Resize */

    private handleResize = (event: Event): void => {
        this.runHandler('resize', event);
    };

    private runHandler(eventName: EventType, event: unknown):void {
        if (this.handlers[eventName]) {
            this.handlers[eventName](event);
        }
    }

    /*
     * Detection
     */

    private detectPan(touches: TouchList): boolean {
        return (touches.length === 1 && !this.eventType) || this.eventType === 'pan';
    }

    private detectDoubleTap(): boolean {
        if (this.eventType != undefined) {
            return;
        }

        const currentTime = new Date().getTime();
        const tapLength = currentTime - this.lastTap;

        window.clearTimeout(this.doubleTapTimeout);

        if (tapLength < this.doubleTapMinTimeout && tapLength > 0) {
            return true;
        } else {
            this.doubleTapTimeout = window.setTimeout(() => {
                window.clearTimeout(this.doubleTapTimeout);
            }, this.doubleTapMinTimeout);
        }
        this.lastTap = currentTime;

        return undefined;
    }

    private detectTap(): void {
        if (this.eventType != undefined) {
            return;
        }

        const currentTime = new Date().getTime();
        const tapLength = currentTime - this.touchstartTime;

        if (tapLength > 0) {
            if (tapLength < this.tapMinTimeout) {
                this.runHandler('tap', {});
            } else {
                this.runHandler('longtap', {});
            }
        }
    }

    private detectPinch(event: TouchEvent): boolean {
        const touches = event.touches;
        return (touches.length === 2 && this.eventType === undefined) || this.eventType === 'pinch';
    }

    private detectLinearSwipe(event: MouseEvent | TouchEvent): 'vertical-swipe' | 'horizontal-swipe' {
        const touches = (event as TouchEvent).touches;

        if (touches) {
            if (
                (touches.length === 1 && !this.eventType) ||
                this.eventType === 'horizontal-swipe' ||
                this.eventType === 'vertical-swipe'
            ) {
                return this.getLinearSwipeType(event);
            }
        } else {
            if (!this.eventType || this.eventType === 'horizontal-swipe' || this.eventType === 'vertical-swipe') {
                return this.getLinearSwipeType(event);
            }
        }

        return undefined;
    }

    private getLinearSwipeType(event: TouchEvent | MouseEvent): 'vertical-swipe' | 'horizontal-swipe' {
        if (this.eventType !== 'horizontal-swipe' && this.eventType !== 'vertical-swipe') {
            const movementX = Math.abs(this.moveLeft(0, event) - this.startX);
            const movementY = Math.abs(this.moveTop(0, event) - this.startY);

            if (movementY * 3 > movementX) {
                return 'vertical-swipe';
            } else {
                return 'horizontal-swipe';
            }
        } else {
            return this.eventType;
        }
    }

    private getElementPosition(): DOMRect {
        return this.element.getBoundingClientRect();
    }

    private getTouchstartPosition(event: TouchEvent): void {
        this.startX = event.touches[0].clientX - this.elementPosition.left;
        this.startY = event.touches[0].clientY - this.elementPosition.top;
    }

    private getMousedownPosition(event: MouseEvent): void {
        this.startX = event.clientX - this.elementPosition.left;
        this.startY = event.clientY - this.elementPosition.top;
    }

    private moveLeft(index: number, event: TouchEvent | MouseEvent): number {
        const touches = (event as TouchEvent).touches;

        if (touches) {
            return touches[index].clientX - this.elementPosition.left;
        } else {
            return (event as MouseEvent).clientX - this.elementPosition.left;
        }
    }

    private moveTop(index: number, event: TouchEvent | MouseEvent): number {
        const touches = (event as TouchEvent).touches;

        if (touches) {
            return touches[index].clientY - this.elementPosition.top;
        } else {
            return (event as MouseEvent).clientY - this.elementPosition.top;
        }
    }

    private detectTouchScreen(): boolean {
        const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
        const mq = (query: string): boolean => {
            return window.matchMedia(query).matches;
        };

        if ('ontouchstart' in window) {
            return true;
        }

        // include the 'heartz' as a way to have a non matching MQ to help terminate the join
        // https://git.io/vznFH
        const query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
        return mq(query);
    }

    /* Public properties and methods */
    public on(event: EventType, handler: (event: Event) => void): void {
        if (event) {
            this.handlers[event] = handler;
        }
    }
}
