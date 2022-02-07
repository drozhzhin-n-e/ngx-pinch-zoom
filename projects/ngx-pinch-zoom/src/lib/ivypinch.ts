import { Touches } from './touches';
import { Properties } from './interfaces';
import { defaultProperties } from './properties';

type PropertyName = keyof Properties;

export class IvyPinch {
    properties: Properties = defaultProperties;
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
    maxScale!: number;
    defaultMaxScale: number = 3;

    // Minimum scale at which panning works
    get minPanScale() {
        return this.getPropertiesValue('minPanScale');
    }

    get fullImage() {
        return this.properties.fullImage;
    }

    constructor(properties: any) {
        this.element = properties.element;

        if (!this.element) {
            return;
        }

        this.elementTarget = this.element.querySelector('*').tagName;
        this.parentElement = this.element.parentElement;
        this.properties = Object.assign({}, defaultProperties, properties);
        this.detectLimitZoom();

        this.touches = new Touches({
            element: properties.element,
            listeners: properties.listeners,
            resize: properties.autoHeight,
            mouseListeners: {
                mousedown: 'handleMousedown',
                mouseup: 'handleMouseup',
                wheel: 'handleWheel',
            },
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

        if (this.properties.wheel) {
            this.touches.on('wheel', this.handleWheel);
        }

        if (this.properties.doubleTap) {
            this.touches.on('double-tap', this.handleDoubleTap);
        }

        if (this.properties.autoHeight) {
            this.touches.on('resize', this.handleResize);
        }
    }

    /* Touchstart */

    handleTouchstart = (event: any) => {
        this.touches.addEventListeners('mousemove', 'handleMousemove');
        this.getElementPosition();

        if (this.eventType === undefined) {
            this.getTouchstartPosition(event);
        }
    };

    /* Touchend */

    handleTouchend = (event: any) => {
        /* touchend */
        if (event.type === 'touchend') {
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
            if (this.eventType === 'pinch' || (this.eventType === 'pan' && this.scale > this.minPanScale)) {
                this.alignImage();
            }

            // Update initial values
            if (
                this.eventType === 'pinch' ||
                this.eventType === 'pan' ||
                this.eventType === 'horizontal-swipe' ||
                this.eventType === 'vertical-swipe'
            ) {
                this.updateInitialValues();
            }

            this.eventType = 'touchend';

            if (touches && touches.length === 0) {
                this.eventType = undefined;
            }
        }

        /* mouseup */
        if (event.type === 'mouseup') {
            this.draggingMode = false;
            this.updateInitialValues();
            this.eventType = undefined;
        }

        this.touches.removeEventListeners('mousemove', 'handleMousemove');
    };

    /*
     * Handlers
     */

    handlePan = (event: any) => {
        if (this.scale < this.minPanScale || this.properties.disablePan) {
            return;
        }

        event.preventDefault();
        const { clientX, clientY } = this.getClientPosition(event);

        if (!this.eventType) {
            this.startX = clientX - this.elementPosition.left;
            this.startY = clientY - this.elementPosition.top;
        }

        this.eventType = 'pan';
        this.moveX = this.initialMoveX + (this.moveLeft(event, 0) - this.startX);
        this.moveY = this.initialMoveY + (this.moveTop(event, 0) - this.startY);

        if (this.properties.limitPan) {
            this.limitPanY();
            this.limitPanX();
        }

        /* mousemove */
        if (event.type === 'mousemove' && this.scale > this.minPanScale) {
            this.centeringImage();
        }

        this.transformElement(0);
    };

    handleDoubleTap = (event: any) => {
        this.toggleZoom(event);
        return;
    };

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

                this.moveXC = (moveLeft0 + moveLeft1) / 2 - this.initialMoveX;
                this.moveYC = (moveTop0 + moveTop1) / 2 - this.initialMoveY;
            }

            this.eventType = 'pinch';
            this.distance = this.getDistance(touches);
            this.scale = this.initialScale * (this.distance / this.initialDistance);
            this.moveX = this.initialMoveX - ((this.distance / this.initialDistance) * this.moveXC - this.moveXC);
            this.moveY = this.initialMoveY - ((this.distance / this.initialDistance) * this.moveYC - this.moveYC);

            this.handleLimitZoom();

            if (this.properties.limitPan) {
                this.limitPanY();
                this.limitPanX();
            }

            this.transformElement(0);
        }
    };

    handleWheel = (event: any) => {
        event.preventDefault();

        let wheelZoomFactor = this.properties.wheelZoomFactor || 0;
        let zoomFactor = event.deltaY < 0 ? wheelZoomFactor : -wheelZoomFactor;
        let newScale = this.initialScale + zoomFactor;

        /* Round value */
        if (newScale < 1 + wheelZoomFactor) {
            newScale = 1;
        } else if (newScale < this.maxScale && newScale > this.maxScale - wheelZoomFactor) {
            newScale = this.maxScale;
        }

        if (newScale < 1 || newScale > this.maxScale) {
            return;
        }

        if (newScale === this.scale) {
            return;
        }

        this.getElementPosition();
        this.scale = newScale;

        /* Get cursor position over image */
        let xCenter = event.clientX - this.elementPosition.left - this.initialMoveX;
        let yCenter = event.clientY - this.elementPosition.top - this.initialMoveY;

        this.setZoom({
            scale: newScale,
            center: [xCenter, yCenter],
        });
    };

    handleResize = (_event: any) => {
        this.setAutoHeight();
    };

    handleLimitZoom() {
        const limitZoom = this.maxScale;
        const minScale = this.properties.minScale || 0;

        if (this.scale > limitZoom || this.scale <= minScale) {
            const imageWidth = this.getImageWidth();
            const imageHeight = this.getImageHeight();
            const enlargedImageWidth = imageWidth * this.scale;
            const enlargedImageHeight = imageHeight * this.scale;
            const moveXRatio = this.moveX / (enlargedImageWidth - imageWidth);
            const moveYRatio = this.moveY / (enlargedImageHeight - imageHeight);

            if (this.scale > limitZoom) {
                this.scale = limitZoom;
            }

            if (this.scale <= minScale) {
                this.scale = minScale;
            }

            const newImageWidth = imageWidth * this.scale;
            const newImageHeight = imageHeight * this.scale;

            this.moveX = -Math.abs(moveXRatio * (newImageWidth - imageWidth));
            this.moveY = -Math.abs(-moveYRatio * (newImageHeight - imageHeight));
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
            this.limitPanY();
            this.limitPanX();
        }
        if (img && this.scale < 1) {
            if (this.moveX < this.element.offsetWidth * (1 - this.scale)) {
                this.moveX = this.element.offsetWidth * (1 - this.scale);
            }
        }

        return initialMoveX !== this.moveX || initialMoveY !== this.moveY;
    }

    limitPanY() {
        const imgHeight = this.getImageHeight();
        const scaledImgHeight = imgHeight * this.scale;
        const parentHeight = this.parentElement.offsetHeight;
        const elementHeight = this.element.offsetHeight;

        if (scaledImgHeight < parentHeight) {
            this.moveY = (parentHeight - elementHeight * this.scale) / 2;
        } else {
            const imgOffsetTop = ((imgHeight - elementHeight) * this.scale) / 2;

            if (this.moveY > imgOffsetTop) {
                this.moveY = imgOffsetTop;
            } else if (scaledImgHeight + Math.abs(imgOffsetTop) - parentHeight + this.moveY < 0) {
                this.moveY = -(scaledImgHeight + Math.abs(imgOffsetTop) - parentHeight);
            }
        }
    }

    limitPanX() {
        const imgWidth = this.getImageWidth();
        const scaledImgWidth = imgWidth * this.scale;
        const parentWidth = this.parentElement.offsetWidth;
        const elementWidth = this.element.offsetWidth;

        if (scaledImgWidth < parentWidth) {
            this.moveX = (parentWidth - elementWidth * this.scale) / 2;
        } else {
            const imgOffsetLeft = ((imgWidth - elementWidth) * this.scale) / 2;

            if (this.moveX > imgOffsetLeft) {
                this.moveX = imgOffsetLeft;
            } else if (scaledImgWidth + Math.abs(imgOffsetLeft) - parentWidth + this.moveX < 0) {
                this.moveX = -(imgWidth * this.scale + Math.abs(imgOffsetLeft) - parentWidth);
            }
        }
    }

    setBasicStyles() {
        this.element.style.display = 'flex';
        this.element.style.alignItems = 'center';
        this.element.style.justifyContent = 'center';
        this.element.style.transformOrigin = '0 0';
        this.setImageSize();
        this.setDraggableImage();
    }

    removeBasicStyles() {
        this.element.style.display = '';
        this.element.style.alignItems = '';
        this.element.style.justifyContent = '';
        this.element.style.transformOrigin = '';
        this.removeImageSize();
        this.removeDraggableImage();
    }

    setDraggableImage() {
        const imgElement = this.getImageElement();

        if (imgElement) {
            imgElement.draggable = this.properties.draggableImage;
        }
    }

    removeDraggableImage() {
        const imgElement = this.getImageElement();

        if (imgElement) {
            imgElement.draggable = true;
        }
    }

    setImageSize() {
        const imgElement = this.element.getElementsByTagName(this.elementTarget);

        if (imgElement.length) {
            imgElement[0].style.maxWidth = '100%';
            imgElement[0].style.maxHeight = '100%';

            this.setAutoHeight();
        }
    }

    setAutoHeight() {
        const imgElement = this.element.getElementsByTagName(this.elementTarget);

        if (!this.properties.autoHeight || !imgElement.length) {
            return;
        }

        const imgNaturalWidth = imgElement[0].getAttribute('width');
        const imgNaturalHeight = imgElement[0].getAttribute('height');
        const sizeRatio = imgNaturalWidth / imgNaturalHeight;
        const parentWidth = this.parentElement.offsetWidth;

        imgElement[0].style.maxHeight = parentWidth / sizeRatio + 'px';
    }

    removeImageSize() {
        const imgElement = this.element.getElementsByTagName(this.elementTarget);

        if (imgElement.length) {
            imgElement[0].style.maxWidth = '';
            imgElement[0].style.maxHeight = '';
        }
    }

    getElementPosition() {
        this.elementPosition = this.element.parentElement.getBoundingClientRect();
    }

    getTouchstartPosition(event: any) {
        const { clientX, clientY } = this.getClientPosition(event);

        this.startX = clientX - this.elementPosition.left;
        this.startY = clientY - this.elementPosition.top;
    }

    getClientPosition(event: any, index: number = 0) {
        let clientX;
        let clientY;

        if (event.type === 'touchstart' || event.type === 'touchmove') {
            clientX = event.touches[index].clientX;
            clientY = event.touches[index].clientY;
        }
        if (event.type === 'mousedown' || event.type === 'mousemove') {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        return {
            clientX,
            clientY,
        };
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
        const img = this.element.getElementsByTagName(this.elementTarget)[0];
        return img.offsetHeight;
    }

    getImageWidth() {
        const img = this.element.getElementsByTagName(this.elementTarget)[0];
        return img.offsetWidth;
    }

    transformElement(duration: any) {
        this.element.style.transition = 'all ' + duration + 'ms';
        this.element.style.transform =
            'matrix(' + Number(this.scale) + ', 0, 0, ' + Number(this.scale) + ', ' + Number(this.moveX) + ', ' + Number(this.moveY) + ')';
    }

    isTouchScreen() {
        const prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');

        if ('ontouchstart' in window) {
            return true;
        }

        // include the 'heartz' as a way to have a non matching MQ to help terminate the join
        // https://git.io/vznFH
        const query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
        return this.getMatchMedia(query);
    }

    getMatchMedia(query: any) {
        return window.matchMedia(query).matches;
    }

    isDragging() {
        if (this.properties.disablePan) {
            return false;
        }

        const imgHeight = this.getImageHeight();
        const imgWidth = this.getImageWidth();

        if (this.scale > 1) {
            return imgHeight * this.scale > this.parentElement.offsetHeight || imgWidth * this.scale > this.parentElement.offsetWidth;
        }
        if (this.scale === 1) {
            return imgHeight > this.parentElement.offsetHeight || imgWidth > this.parentElement.offsetWidth;
        }

        return undefined;
    }

    detectLimitZoom() {
        this.maxScale = this.defaultMaxScale;

        if (this.properties.limitZoom === 'original image size' && this.elementTarget === 'IMG') {
            // We are waiting for the element with the image to be available
            this.pollLimitZoomForOriginalImage();
        }
    }

    pollLimitZoomForOriginalImage() {
        let poll = setInterval(() => {
            let maxScaleForOriginalImage = this.getMaxScaleForOriginalImage();
            if (typeof maxScaleForOriginalImage === 'number') {
                this.maxScale = maxScaleForOriginalImage;
                clearInterval(poll);
            }
        }, 10);
    }

    getMaxScaleForOriginalImage() {
        let maxScale!: number;
        let img = this.element.getElementsByTagName('img')[0];

        if (img.naturalWidth && img.offsetWidth) {
            maxScale = img.naturalWidth / img.offsetWidth;
        }

        return maxScale;
    }

    getImageElement() {
        const imgElement = this.element.getElementsByTagName(this.elementTarget);

        if (imgElement.length) {
            return imgElement[0];
        }
    }

    toggleZoom(event: any = false) {
        if (this.initialScale === 1) {
            if (event && event.changedTouches) {
                if (this.properties.doubleTapScale === undefined) {
                    return;
                }

                const changedTouches = event.changedTouches;
                this.scale = this.initialScale * this.properties.doubleTapScale;
                this.moveX =
                    this.initialMoveX - (changedTouches[0].clientX - this.elementPosition.left) * (this.properties.doubleTapScale - 1);
                this.moveY =
                    this.initialMoveY - (changedTouches[0].clientY - this.elementPosition.top) * (this.properties.doubleTapScale - 1);
            } else {
                let zoomControlScale = this.properties.zoomControlScale || 0;
                this.scale = this.initialScale * (zoomControlScale + 1);
                this.moveX = this.initialMoveX - (this.element.offsetWidth * (this.scale - 1)) / 2;
                this.moveY = this.initialMoveY - (this.element.offsetHeight * (this.scale - 1)) / 2;
            }

            this.centeringImage();
            this.updateInitialValues();
            this.transformElement(this.properties.transitionDuration);
        } else {
            this.resetScale();
        }
    }

    setZoom(properties: { scale: number; center?: number[] }) {
        this.scale = properties.scale;

        let xCenter;
        let yCenter;
        let visibleAreaWidth = this.element.offsetWidth;
        let visibleAreaHeight = this.element.offsetHeight;
        let scalingPercent = (visibleAreaWidth * this.scale) / (visibleAreaWidth * this.initialScale);

        if (properties.center) {
            xCenter = properties.center[0];
            yCenter = properties.center[1];
        } else {
            xCenter = visibleAreaWidth / 2 - this.initialMoveX;
            yCenter = visibleAreaHeight / 2 - this.initialMoveY;
        }

        this.moveX = this.initialMoveX - (scalingPercent * xCenter - xCenter);
        this.moveY = this.initialMoveY - (scalingPercent * yCenter - yCenter);

        this.centeringImage();
        this.updateInitialValues();
        this.transformElement(this.properties.transitionDuration);
    }

    alignImage() {
        const isMoveChanged = this.centeringImage();

        if (isMoveChanged) {
            this.updateInitialValues();
            this.transformElement(this.properties.transitionDuration);
        }
    }

    destroy() {
        this.removeBasicStyles();
        this.touches.destroy();
    }

    getPropertiesValue(propertyName: PropertyName) {
        if (this.properties && this.properties[propertyName]) {
            return this.properties[propertyName];
        } else {
            return defaultProperties[propertyName];
        }
    }
}
