import {Touches} from './touches';

export interface IvyPinchProperties {
    element: string;
    key?: string;
    doubleTap?: boolean;
    doubleTapScale?: number;
    zoomButtonScale?: number;
    transitionDuration?: number;
    autoZoomOut?: boolean;
    limitZoom?: number;
}

export const IvyPinchDefaultProperties = {
    doubleTap: true,
    doubleTapScale: 2,
    transitionDuration: 200,
    limitZoom: 3
}

export class IvyPinch { 
    properties: IvyPinchProperties;
    touches: any;
    element: any;
    elementTarget: any;
    parentElement: any;
    i: number = 0;
    public scale: number = 1;
    initialScale: number = 1;
    elementPosition: any;
    eventType: any;
    startX: number = 0;
    startY: number = 0;
    moveX: number = 0;
    moveY: number = 0;
    initialMoveX: number = 0;
    initialMoveY: number = 0;
    moveXC: number = 0;
    moveYC: number = 0;
    lastTap: number = 0;
    draggingMode: boolean = false;
    distance: number = 0;
    doubleTapTimeout: number = 0;
    initialDistance: number = 0;
    events: any = {};

    constructor(properties: any) {
        this.element = properties.element;
        this.elementTarget = this.element.querySelector('*').tagName;
        this.parentElement = this.element.parentElement;
        this.properties = Object.assign({}, IvyPinchDefaultProperties, properties);

        this.touches = new Touches({
            element: properties.element
        }); 


        /* Init */
        this.setBasicStyles();

        /*
         * Listeners
         */

        this.touches.on('touchstart', this.handleTouchstart);
        this.touches.on('touchend', this.handleTouchend);
        this.touches.on('mousedown', this.handleTouchstart);
        this.touches.on('mouseup', this.handleTouchend);
        this.touches.on('pan', this.handlePan);
        this.touches.on('mousemove', this.handlePan);
        this.touches.on('pinch', this.handlePinch);

        if (this.properties.doubleTap){
            this.touches.on('double-tap', this.handleDoubleTap);
        }


        /* Touchmove */

        //this.element.addEventListener("touchmove", this.handleTouchmove, false);
    }   


    /* Custom events */

    emitEvent(properties: any){
        this.events[properties.name] = new CustomEvent(properties.name, {
            'detail': properties.detail
        });
        this.element.dispatchEvent(this.events[properties.name]);
    }


    /* Touchstart */

    handleTouchstart = (event: any) => {
        this.getElementPosition();

        if (this.eventType === undefined) {
            this.getTouchstartPosition(event);
        }
    }


    /* Touchend */

    handleTouchend = (event: any) => {

        /* touchend */
        if (event.type === "touchend") {
            this.i = 0;
            this.draggingMode = false;
            const touches = event.touches;

            // Min scale
            if (this.scale < 1) {
                this.scale = 1;
            }

            // Auto Zoom Out
            if (this.properties.autoZoomOut && this.eventType === 'pinch') {
                this.scale = 1;
            }

            // Align image
            if (this.eventType === 'pinch' || this.eventType === 'pan') {
                this.alignImage();
            }

            // Update initial values
            if (this.eventType === 'pinch' ||
                this.eventType === 'pan' ||
                this.eventType === 'horizontal-swipe' ||
                this.eventType === 'vertical-swipe') {

                this.updateInitialValues();
            }

            this.eventType = 'touchend';

            if (touches && touches.length === 0) {
                this.eventType = undefined;
            }
        }

        /* mouseup */
        if (event.type === "mouseup") {
            this.draggingMode = false;
            this.updateInitialValues();
            this.eventType = undefined;
        }
    }


    /*
     * Handlers
     */

    handlePan = (event: any) => {
        if (this.scale <= 1) {
            return;
        }

        event.preventDefault();
        const {clientX, clientY} = this.getClientPosition(event);

        if (!this.eventType) {
            this.startX = clientX - this.elementPosition.left;
            this.startY = clientY - this.elementPosition.top;
        }

        this.eventType = 'pan';
        this.moveX = this.initialMoveX + (this.moveLeft(event, 0) - this.startX);
        this.moveY = this.initialMoveY + (this.moveTop(event, 0) - this.startY);

        /* mousemove */
        if (event.type === "mousemove") {
            this.centeringImage();
        }

        this.emitEvent({name: 'pan', detail: { moveX: this.moveX, moveY: this.moveY }});
        this.transformElement(0);
    }

    handleDoubleTap = (event: any) => {
        this.emitEvent({name: 'double-tap'});
        this.toggleZoom(event);
        return;
    }

    handlePinch = (event: any) => {
        event.preventDefault();

        if (this.eventType === undefined || this.eventType === 'pinch') {
            const touches = event.touches;

            if (!this.eventType) {
                this.initialDistance = this.getDistance(touches);

                const moveLeft0 = this.moveLeft(event, 0);
                const moveLeft1 = this.moveLeft(event, 1);
                const moveTop0 = this.moveTop(event, 0);
                const moveTop1 = this.moveTop(event, 1);

                this.moveXC = ((moveLeft0 + moveLeft1) / 2) - this.initialMoveX;
                this.moveYC = ((moveTop0 + moveTop1) / 2) - this.initialMoveY;
            }

            this.eventType = 'pinch';
            this.distance = this.getDistance(touches);
            this.scale = this.initialScale * (this.distance / this.initialDistance);
            this.moveX = this.initialMoveX - (((this.distance / this.initialDistance) * this.moveXC) - this.moveXC);
            this.moveY = this.initialMoveY - (((this.distance / this.initialDistance) * this.moveYC) - this.moveYC);

            this.handleLimitZoom();

            this.emitEvent({name: 'pinch', detail: { scale: this.scale }});
            this.transformElement(0);
        }
    }

    handleLimitZoom(): void {
        if (this.properties.limitZoom === undefined){
            return;
        }

        if (this.scale > this.properties.limitZoom){
            const imageWidth = this.getImageWidth();
            const imageHeight = this.getImageHeight();
            const enlargedImageWidth = imageWidth * this.scale;
            const enlargedImageHeight = imageHeight * this.scale;

            const moveXRatio = this.moveX / (enlargedImageWidth - imageWidth);
            const moveYRatio = this.moveY / (enlargedImageHeight - imageHeight);

            this.scale = this.properties.limitZoom;

            const newImageWidth = imageWidth * this.scale;
            const newImageHeight = imageHeight * this.scale;

            this.moveX = -Math.abs((moveXRatio * (newImageWidth - imageWidth)));
            this.moveY = -Math.abs((-moveYRatio * (newImageHeight - imageHeight)));

            this.transformElement(this.properties.transitionDuration);
        }
    }

    moveLeft(event: any, index: number = 0) {
        const clientX = this.getClientPosition(event, index).clientX;
        return clientX - this.elementPosition.left;
    }

    moveTop(event: any, index: number = 0) {
        const clientY = this.getClientPosition(event, index).clientY;
        return clientY - this.elementPosition.top;
    }


    /*
     * Detection
     */

    centeringImage() {
        const img = this.element.getElementsByTagName(this.elementTarget)[0];
        const initialMoveX = this.moveX;
        const initialMoveY = this.moveY;

        if (this.moveY > 0) {
            this.moveY = 0;
        }
        if (this.moveX > 0) {
            this.moveX = 0;
        }

        if (img) {
            this.transitionYRestriction();
            this.transitionXRestriction();
        }
        if (img && this.scale < 1) {
            if (this.moveX < this.element.offsetWidth * (1 - this.scale)) {
                this.moveX = this.element.offsetWidth * (1 - this.scale);
            }
        }

        return initialMoveX !== this.moveX || initialMoveY !== this.moveY;
    }

    transitionYRestriction() {
        const imgHeight = this.getImageHeight();

        if (imgHeight * this.scale < this.parentElement.offsetHeight) {
            this.moveY = (this.parentElement.offsetHeight - this.element.offsetHeight * this.scale) / 2;
        } else {
            const imgOffsetTop = ((imgHeight - this.element.offsetHeight) * this.scale) / 2;

            if (this.moveY > imgOffsetTop) {
                this.moveY = imgOffsetTop;
            } else if ((imgHeight * this.scale + Math.abs(imgOffsetTop) - this.parentElement.offsetHeight) + this.moveY < 0) {
                this.moveY = -(imgHeight * this.scale + Math.abs(imgOffsetTop) - this.parentElement.offsetHeight);
            }
        }
    }

    transitionXRestriction() {
        const imgWidth = this.getImageWidth();

        if (imgWidth * this.scale < this.parentElement.offsetWidth) {
            this.moveX = (this.parentElement.offsetWidth - this.element.offsetWidth * this.scale) / 2;
        } else {
            const imgOffsetLeft = ((imgWidth - this.element.offsetWidth) * this.scale) / 2;

            if (this.moveX > imgOffsetLeft) {
                this.moveX = imgOffsetLeft;
            } else if ((imgWidth * this.scale + Math.abs(imgOffsetLeft) - this.parentElement.offsetWidth) + this.moveX < 0) {
                this.moveX = -(imgWidth * this.scale + Math.abs(imgOffsetLeft) - this.parentElement.offsetWidth);
            }
        }
    }

    setBasicStyles() {
        this.element.style.display = 'flex';
        this.element.style.alignItems = 'center';
        this.element.style.justifyContent = 'center';
        this.element.style.transformOrigin = '0 0';

        this.setImageWidth();
    }

    setImageWidth() {
        const imgElement = this.element.getElementsByTagName(this.elementTarget);

        if (imgElement.length) {
            imgElement[0].style.maxWidth = '100%';
            imgElement[0].style.maxHeight = '100%';
        }
    }

    getElementPosition() {
        this.elementPosition = this.element.parentElement.getBoundingClientRect();
    }

    getTouchstartPosition(event: any) {
        const {clientX, clientY} = this.getClientPosition(event);

        this.startX = clientX - this.elementPosition.left;
        this.startY = clientY - this.elementPosition.top;
    }

    getClientPosition(event: any, index: number = 0) {
        let clientX;
        let clientY;

        if (event.type === "touchstart" || event.type === "touchmove") {
            clientX = event.touches[index].clientX;
            clientY = event.touches[index].clientY;
        }
        if (event.type === "mousedown" || event.type === "mousemove") {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        return {clientX, clientY};
    }

    resetScale() {
        this.scale = 1;
        this.moveX = 0;
        this.moveY = 0;
        this.updateInitialValues();
        this.transformElement(this.properties.transitionDuration);
    }

    updateInitialValues() {
        this.initialScale = this.scale;
        this.initialMoveX = this.moveX;
        this.initialMoveY = this.moveY;
    }

    getDistance(touches: any) {
        return Math.sqrt(Math.pow(touches[0].pageX - touches[1].pageX, 2) + Math.pow(touches[0].pageY - touches[1].pageY, 2));
    }

    getImageHeight() {
        return this.element.offsetHeight;
    }

    getImageWidth() {
        return this.element.offsetWidth;
    }

    transformElement(duration: any) {
        this.element.style.transition = "all "+duration+"ms";
        this.element.style.transform = "matrix("+Number(this.scale)+", 0, 0, "+Number(this.scale)+", "+Number(this.moveX)+", "+Number(this.moveY)+")";
    }

    isTouchScreen() {
        const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');

        if (('ontouchstart' in window)) {
            return true;
        }

        // include the 'heartz' as a way to have a non matching MQ to help terminate the join
        // https://git.io/vznFH
        const query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
        return this.getMatchMedia(query);
    }

    getMatchMedia(query: any){
        return window.matchMedia(query).matches;
    }

    isDragging() {
        const imgHeight = this.getImageHeight();
        const imgWidth = this.getImageWidth();

        if (this.scale > 1) {
            return imgHeight * this.scale > this.parentElement.offsetHeight ||
                imgWidth * this.scale > this.parentElement.offsetWidth;
        }
        if (this.scale === 1) {
            return imgHeight > this.parentElement.offsetHeight ||
                imgWidth > this.parentElement.offsetWidth;
        }
    }


    /* Public properties and methods */

    public toggleZoom(event: any = false) {
        if (this.initialScale === 1) {
            if (event && event.changedTouches) {
                if (this.properties.doubleTapScale === undefined){
                    return;
                }

                const changedTouches = event.changedTouches;
                this.scale = this.initialScale * this.properties.doubleTapScale;
                this.moveX = this.initialMoveX - (changedTouches[0].clientX - this.elementPosition.left) * (this.properties.doubleTapScale - 1);
                this.moveY = this.initialMoveY - (changedTouches[0].clientY - this.elementPosition.top) * (this.properties.doubleTapScale - 1);
            } else {
                this.scale = this.initialScale * this.properties.zoomButtonScale;
                this.moveX = this.initialMoveX - this.element.offsetWidth * (this.scale - 1) / 2;
                this.moveY = this.initialMoveY - this.element.offsetHeight * (this.scale - 1) / 2;
            }

            this.centeringImage();
            this.updateInitialValues();
            this.emitEvent({name: 'zoom-in'});
            this.transformElement(this.properties.transitionDuration);
        } else {
            this.emitEvent({name: 'zoom-out'});
            this.resetScale();
        }
    }

    public alignImage() {
        const isMoveChanged = this.centeringImage();

        if (isMoveChanged) {
            this.updateInitialValues();
            this.transformElement(this.properties.transitionDuration);
        }
    }
}