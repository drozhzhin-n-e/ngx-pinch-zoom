import {
    Component,
    HostBinding,
    ElementRef,
    HostListener,
    OnInit,
    ViewChild,
    Input,
    EventEmitter,
    Output
} from '@angular/core';

type EventType = 'swipe' | 'pinch' | 'horizontal-swipe' | 'vertical-swipe' | 'touchend';

@Component({
    selector: 'pinch-zoom, [pinch-zoom]',
    templateUrl: './pinch-zoom.component.html',
    styleUrls: ['./pinch-zoom.component.css']
})

export class PinchZoomComponent implements OnInit {

    i: number = 0;
    scale: number = 1;
    initialScale: number = 1;
    element;
    elementTarget;
    elementPosition;
    parentElement;
    eventType: EventType;
    startX: number;
    startY: number;
    moveX: number = 0;
    moveY: number = 0;
    initialMoveX: number = 0;
    initialMoveY: number = 0;
    moveXC: number;
    moveYC: number;
    lastTap = 0;
    draggingMode: boolean = false;
    distance: number;
    doubleTapTimeout;
    initialDistance: number;

    @Input('height') containerHeight: string;
    @Input('transition-duration') transitionDuration = 200;
    @Input('double-tap') doubleTap = true;
    @Input('double-tap-scale') doubleTapScale = 2;
    @Input('zoom-button') zoomButton = true;
    @Input('linear-horizontal-swipe') linearHorizontalSwipe = false;
    @Input('linear-vertical-swipe') linearVerticalSwipe = false;
    @Input('auto-zoom-out') autoZoomOut = false;
    @Input('limit-zoom') limitZoom: number;

    @Output() events: EventEmitter<any> = new EventEmitter<any>();

    @HostBinding('style.display') hostDisplay: string;
    @HostBinding('style.overflow') hostOverflow: string;
    @HostBinding('style.height') hostHeight: string;

    @ViewChild('content') contentElement: ElementRef;

    constructor(private elementRef: ElementRef) { }

    ngOnInit() {
        this.element = this.contentElement.nativeElement;
        this.parentElement = this.elementRef.nativeElement;
        this.elementTarget = this.element.querySelector('*').tagName;

        this.setBasicStyles();

        this.element.ondragstart = () => false;
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

    /*
     * Desktop listeners
     */

    @HostListener('mousedown', ['$event'])
    onMouseEnter(event: MouseEvent): void {
        this.getElementPosition();

        if (this.isDragging) {
            this.draggingMode = true;
        }
    }

    @HostListener('window:mousemove', ['$event'])
    onMouseMove(event: MouseEvent): void {
        if (this.draggingMode) {
            event.preventDefault();

            if (!this.eventType) {
                this.startX = event.clientX - this.elementPosition.left;
                this.startY = event.clientY - this.elementPosition.top;
            }

            this.eventType = 'swipe';
            this.events.emit({
                type: 'swipe',
                moveX: this.moveX,
                moveY: this.moveY
            });

            this.moveX = this.initialMoveX + ((event.clientX - this.elementPosition.left) - this.startX);
            this.moveY = this.initialMoveY + ((event.clientY - this.elementPosition.top) - this.startY);

            this.centeringImage();
            this.transformElement(0);
        }
    }

    @HostListener('window:mouseup', ['$event'])
    onMouseUp(event: MouseEvent): void {
        this.draggingMode = false;
        this.updateInitialValues();
        this.eventType = undefined;
    }


    /*
     * Mobile listeners
     */

    @HostListener('window:resize', ['$event'])
    onResize(event: Event): void {
        this.setImageWidth();
        this.transformElement(this.transitionDuration);
    }

    @HostListener('touchstart', ['$event'])
    touchstartHandler(event): void {
        this.getElementPosition();

        if (this.eventType === undefined) {
            this.getStartPosition(event);
        }

        this.events.emit({ type: 'touchstart' });
    }

    @HostListener('touchmove', ['$event'])
    touchmoveHandler(event): void {
        const touches = event.touches;

        // Swipe
        if (this.detectSwipe(touches) || this.eventType === 'swipe') {
            this.handleSwipe(event);
        }

        // Linear swipe
        if (this.detectLinearSwipe(touches) ||
            this.eventType === 'horizontal-swipe' ||
            this.eventType === 'vertical-swipe') {

            this.handleLinearSwipe(event);
        }

        // Pinch
        if ((touches.length === 2 && this.eventType === undefined) || 
            this.eventType === 'pinch') {

            this.handlePinch(event);
        }
    }

    @HostListener('touchend', ['$event'])
    touchendHandler(event): void {
        this.i = 0;
        this.draggingMode = false;
        const touches = event.touches;

        // Min scale
        if (this.scale < 1) {
            this.scale = 1;
        }

        // Auto Zoom Out
        if (this.autoZoomOut && this.eventType === 'pinch') {
            this.scale = 1;
        }

        // Emit event
        this.events.emit({ type: 'touchend' });

        // Double Tap
        if (this.doubleTapDetection() && this.eventType === undefined) {
            this.toggleZoom(event);
            this.events.emit({ type: 'double-tap' });
            return;
        }

        // Limit Zoom
        if (this.limitZoom && this.eventType === 'pinch') {
            this.handleLimitZoom();
        }

        // Align image
        if (this.eventType === 'pinch' || this.eventType === 'swipe') {
            this.alignImage();
        }

        // Update initial values
        if (this.eventType === 'pinch' ||
            this.eventType === 'swipe' ||
            this.eventType === 'horizontal-swipe' ||
            this.eventType === 'vertical-swipe') {

            this.updateInitialValues();
        }

        this.eventType = 'touchend';

        if (touches && touches.length === 0) {
            this.eventType = undefined;
        }
    }


    /*
     * Handlers
     */

    moveLeft(index: number, touches): number {
        return touches[index].clientX - this.elementPosition.left;
    }

    moveTop(index: number, touches): number {
        return touches[index].clientY - this.elementPosition.top;
    }

    handleSwipe(event): void {
        event.preventDefault();

        if (!this.eventType) {
            this.startX = event.touches[0].clientX - this.elementPosition.left;
            this.startY = event.touches[0].clientY - this.elementPosition.top;
        }

        this.eventType = 'swipe';
        this.events.emit({
            type: 'swipe',
            moveX: this.moveX,
            moveY: this.moveY
        });

        this.moveX = this.initialMoveX + (this.moveLeft(0, event.touches) - this.startX);
        this.moveY = this.initialMoveY + (this.moveTop(0, event.touches) - this.startY);

        this.transformElement(0);
    }

    handlePinch(event): void {
        event.preventDefault();

        const touches = event.touches;

        if (!this.eventType) {
            this.initialDistance = this.getDistance(touches);

            const moveLeft0 = this.moveLeft(0, touches);
            const moveLeft1 = this.moveLeft(1, touches);
            const moveTop0 = this.moveTop(0, touches);
            const moveTop1 = this.moveTop(1, touches);

            this.moveXC = ((moveLeft0 + moveLeft1) / 2) - this.initialMoveX;
            this.moveYC = ((moveTop0 + moveTop1) / 2) - this.initialMoveY;
        }

        this.eventType = 'pinch';
        this.distance = this.getDistance(touches);
        this.scale = this.initialScale * (this.distance / this.initialDistance);
        this.events.emit({ 
            type: 'pinch', 
            scale: this.scale 
        });

        this.moveX = this.initialMoveX - (((this.distance / this.initialDistance) * this.moveXC) - this.moveXC);
        this.moveY = this.initialMoveY - (((this.distance / this.initialDistance) * this.moveYC) - this.moveYC);

        this.transformElement(0);
    }

    handleLinearSwipe(event): void {
        if (this.linearVerticalSwipe) {
            event.preventDefault();
        }

        this.i++;

        if (this.i > 3) {
            this.eventType = this.getLinearSwipeType(event);
        }

        if (this.eventType === 'horizontal-swipe') {
            this.moveX = this.initialMoveX + ((event.touches[0].clientX - this.elementPosition.left) - this.startX);
            this.moveY = 0;
        }

        if (this.eventType === 'vertical-swipe') {
            this.moveX = 0;
            this.moveY = this.initialMoveY + ((event.touches[0].clientY - this.elementPosition.top) - this.startY);
        }

        if (this.eventType) {
            this.events.emit({
                type: this.eventType,
                moveX: this.moveX,
                moveY: this.moveY
            });
            this.transformElement(0);
        }
    }

    handleLimitZoom(): void {
        if (this.scale > this.limitZoom){
            const imageWidth = this.getImageWidth();
            const imageHeight = this.getImageHeight();
            const enlargedImageWidth = imageWidth * this.scale;
            const enlargedImageHeight = imageHeight * this.scale;

            const moveXRatio = this.moveX / (enlargedImageWidth - imageWidth);
            const moveYRatio = this.moveY / (enlargedImageHeight - imageHeight);

            this.scale = this.limitZoom;

            const newImageWidth = imageWidth * this.scale;
            const newImageHeight = imageHeight * this.scale;

            this.moveX = -Math.abs((moveXRatio * (newImageWidth - imageWidth)));
            this.moveY = -Math.abs((-moveYRatio * (newImageHeight - imageHeight)));

            this.centeringImage();
            this.transformElement(this.transitionDuration);
        }
    }


    detectSwipe(touches: TouchList): boolean {
        return touches.length === 1 && this.scale > 1 && !this.eventType;
    }

    detectLinearSwipe(touches: TouchList): boolean {
        return touches.length === 1 && this.scale === 1 && !this.eventType;
    }

    getLinearSwipeType(event): EventType {
        if (this.eventType !== 'horizontal-swipe' && this.eventType !== 'vertical-swipe') {
            const movementX = Math.abs(this.moveLeft(0, event.touches) - this.startX);
            const movementY = Math.abs(this.moveTop(0, event.touches) - this.startY);

            if ((movementY * 3) > movementX) {
                return this.linearVerticalSwipe ? 'vertical-swipe' : undefined;
            } else {
                return this.linearHorizontalSwipe ? 'horizontal-swipe' : undefined;
            }
        } else {
            return this.eventType;
        }
    }

    getDistance(touches: TouchList) {
        return Math.sqrt(Math.pow(touches[0].pageX - touches[1].pageX, 2) + Math.pow(touches[0].pageY - touches[1].pageY, 2));
    }

    getImageHeight(): number {
        return this.element.getElementsByTagName(this.elementTarget)[0].offsetHeight;
    }

    getImageWidth(): number {
        return this.element.getElementsByTagName(this.elementTarget)[0].offsetWidth;
    }

    getStartPosition(event): void {
        this.startX = event.touches[0].clientX - this.elementPosition.left;
        this.startY = event.touches[0].clientY - this.elementPosition.top;
    }

    setBasicStyles(): void {
        this.element.style.display = 'flex';
        this.element.style.height = '100%';
        this.element.style.alignItems = 'center';
        this.element.style.justifyContent = 'center';
        this.element.style.transformOrigin = '0 0';

        this.hostDisplay = 'block';
        this.hostOverflow = 'hidden';
        this.hostHeight = this.containerHeight;

        this.setImageWidth();
    }

    setImageWidth(): void {
        const imgElement = this.element.getElementsByTagName(this.elementTarget);

        if (imgElement.length) {
            imgElement[0].style.maxWidth = '100%';
            imgElement[0].style.maxHeight = '100%';
        }
    }

    transformElement(duration: number = 50) {
        this.element.style.transition = `all ${duration}ms`;
        this.element.style.transform = `
            matrix(${Number(this.scale)}, 0, 0, ${Number(this.scale)}, ${Number(this.moveX)}, ${Number(this.moveY)})`;
    }

    doubleTapDetection(): boolean {
        if (!this.doubleTap) {
            return false;
        }

        const currentTime = new Date().getTime();
        const tapLength = currentTime - this.lastTap;

        clearTimeout(this.doubleTapTimeout);

        if (tapLength < 300 && tapLength > 0) {
            return true;
        } else {
            this.doubleTapTimeout = setTimeout(() => {
                clearTimeout(this.doubleTapTimeout);
            }, 300);
        }
        this.lastTap = currentTime;
    }

    public toggleZoom(event: any = false): void {
        if (this.initialScale === 1) {

            if (event && event.changedTouches) {
                const changedTouches = event.changedTouches;

                this.scale = this.initialScale * this.doubleTapScale;
                this.moveX = this.initialMoveX - (changedTouches[0].clientX * (this.doubleTapScale - 1) - this.elementPosition.left);
                this.moveY = this.initialMoveY - (changedTouches[0].clientY * (this.doubleTapScale - 1) - this.elementPosition.top);
            } else {
                this.scale = this.initialScale * 2;
                this.moveX = this.initialMoveX - this.element.offsetWidth / 2;
                this.moveY = this.initialMoveY - this.element.offsetHeight / 2;
            }

            this.centeringImage();
            this.updateInitialValues();
            this.transformElement(this.transitionDuration);
            this.events.emit({ type: 'zoom-in' });
        } else {
            this.resetScale();
            this.events.emit({ type: 'zoom-out' });
        }
    }

    resetScale(): void {
        this.scale = 1;
        this.moveX = 0;
        this.moveY = 0;
        this.updateInitialValues();
        this.transformElement(this.transitionDuration);
    }

    updateInitialValues(): void {
        this.initialScale = this.scale;
        this.initialMoveX = this.moveX;
        this.initialMoveY = this.moveY;
    }

    centeringImage(): boolean {
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

    public alignImage(): void {
        const isMoveChanged = this.centeringImage();

        if (isMoveChanged) {
            this.updateInitialValues();
            this.transformElement(this.transitionDuration);
        }
    }

    transitionYRestriction(): void {
        const imgHeight = this.getImageHeight();

        if (imgHeight * this.scale < this.parentElement.offsetHeight) {
            this.moveY = (this.parentElement.offsetHeight - this.element.offsetHeight * this.scale) / 2;
        } else {
            const imgOffsetTop = ((imgHeight - this.element.offsetHeight) * this.scale) / 2;

            if (this.moveY > imgOffsetTop) {
                this.moveY = imgOffsetTop;
            } else if ((imgHeight * this.scale + Math.abs(imgOffsetTop) - this.parentElement.offsetHeight) + this.moveY < 0) {
                this.moveY = - (imgHeight * this.scale + Math.abs(imgOffsetTop) - this.parentElement.offsetHeight);
            }
        }
    }

    transitionXRestriction(): void {
        const imgWidth = this.getImageWidth();

        if (imgWidth * this.scale < this.parentElement.offsetWidth) {
            this.moveX = (this.parentElement.offsetWidth - this.element.offsetWidth * this.scale) / 2;
        } else {
            const imgOffsetLeft = ((imgWidth - this.element.offsetWidth) * this.scale) / 2;

            if (this.moveX > imgOffsetLeft) {
                this.moveX = imgOffsetLeft;
            } else if ((imgWidth * this.scale + Math.abs(imgOffsetLeft) - this.parentElement.offsetWidth) + this.moveX < 0) {
                this.moveX = - (imgWidth * this.scale + Math.abs(imgOffsetLeft) - this.parentElement.offsetWidth);
            }
        }
    }

    getElementPosition(): void {
        this.elementPosition = this.elementRef.nativeElement.getBoundingClientRect();
    }

    public setMoveX(value: number, transitionDuration: number = 200): void {
        this.moveX = value;
        this.transformElement(transitionDuration);
    }

    public setMoveY(value: number, transitionDuration: number = 200): void {
        this.moveY = value;
        this.transformElement(transitionDuration);
    }
}
