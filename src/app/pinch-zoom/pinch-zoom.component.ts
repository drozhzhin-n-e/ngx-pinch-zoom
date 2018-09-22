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

@Component({
    selector: 'pinch-zoom, [pinch-zoom]',
    templateUrl: './pinch-zoom.component.html',
    styleUrls: ['./pinch-zoom.component.css']
})

export class PinchZoomComponent implements OnInit {

    i = 0;

    scale = 1;
    initialScale = 1;

    _id: any;
    element: any;
    elementTarget: any;
    elementPosition: any;
    parentElement: any;
    eventType: any;

    startX: number;
    startY: number;
    startClientX: number;
    startClientY: number;

    moveX: any = 0;
    moveY: any = 0;
    initialMoveX: any = 0;
    initialMoveY: any = 0;
    moveXC: number;
    moveYC: number;

    lastTap = 0;
    draggingMode = false;

    distance: number;
    doubleTapTimeout: any;
    initialDistance: number;

    @Input() containerHeight: string;
    @Input() transitionDuration = 200;
    @Input() doubleTap = true;
    @Input() zoomButton = true;
    @Input() linearHorizontalSwipe = false;
    @Input() linearVerticalSwipe = false;
    @Input() autoZoomOut = false;
    @Input()
    set id(value: any) {
        this._id = value;
    }
    get id() {
        return this._id;
    }

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

    get isMobile() {
        let check = false;
        navigator.maxTouchPoints ? check = true : check = false;
        return check;
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
        this.eventType = '';
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
    touchstartHandler(event: any): void {
        this.getElementPosition();

        if (!this.eventType) {
            this.startX = event.touches[0].clientX - this.elementPosition.left;
            this.startY = event.touches[0].clientY - this.elementPosition.top;

            this.startClientX = event.touches[0].clientX - this.elementPosition.left;
            this.startClientY = event.touches[0].clientY - this.elementPosition.top;
        }

        this.events.emit({ type: 'touchstart' });
    }

    @HostListener('touchmove', ['$event'])
    touchmoveHandler(event: any): void {
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
        if (touches.length === 2 && !this.eventType || this.eventType === 'pinch') {
            this.handlePinch(event);
        }
    }

    @HostListener('touchend', ['$event'])
    touchendHandler(event: any): void {
        this.i = 0;
        this.draggingMode = false;
        const touches = event.touches;

        if (this.scale < 1) {
            this.scale = 1;
        }

        // Auto Zoom Out
        if (this.autoZoomOut && this.eventType === 'pinch') {
            this.scale = 1;
        }

        this.events.emit({ type: 'touchend' });

        // Double Tap
        if (this.doubleTapDetection() && !this.eventType) {
            this.toggleZoom(event);
            this.events.emit({ type: 'double-tap' });
            return;
        }

        if (this.eventType === 'pinch' || this.eventType === 'swipe') {
            this.alignImage();
        }

        if (this.eventType === 'pinch' ||
            this.eventType === 'swipe' ||
            this.eventType === 'horizontal-swipe' ||
            this.eventType === 'vertical-swipe') {
            this.updateInitialValues();
        }

        this.eventType = 'touchend';

        if (touches && touches.length === 0) {
            this.eventType = '';
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

    handleSwipe(event: any): void {
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

    handlePinch(event: any): void {
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
        this.events.emit({ type: 'pinch' });
        this.distance = this.getDistance(touches);
        this.scale = this.initialScale * (this.distance / this.initialDistance);

        this.moveX = this.initialMoveX - (((this.distance / this.initialDistance) * this.moveXC) - this.moveXC);
        this.moveY = this.initialMoveY - (((this.distance / this.initialDistance) * this.moveYC) - this.moveYC);

        this.transformElement(0);
    }

    handleLinearSwipe(event: any): void {
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


    detectSwipe(touches: any): boolean {
        return touches.length === 1 && this.scale > 1 && !this.eventType;
    }

    detectLinearSwipe(touches: TouchList): boolean {
        return touches.length === 1 && this.scale === 1 && !this.eventType;
    }

    getLinearSwipeType(event: any): string {
        if (this.eventType !== 'horizontal-swipe' && this.eventType !== 'vertical-swipe') {
            const movementX = Math.abs(this.moveLeft(0, event.touches) - this.startClientX);
            const movementY = Math.abs(this.moveTop(1, event.touches) - this.startClientY);

            if ((movementY * 3) > movementX) {
                return this.linearVerticalSwipe ? 'vertical-swipe' : '';
            } else {
                return this.linearHorizontalSwipe ? 'horizontal-swipe' : '';
            }
        } else {
            return this.eventType;
        }
    }

    getDistance(touches: any) {
        return Math.sqrt(Math.pow(touches[0].pageX - touches[1].pageX, 2) + Math.pow(touches[0].pageY - touches[1].pageY, 2));
    }

    getImageHeight(): any {
        return this.element.getElementsByTagName(this.elementTarget)[0].offsetHeight;
    }

    getImageWidth(): any {
        return this.element.getElementsByTagName(this.elementTarget)[0].offsetWidth;
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

    transformElement(duration: any = 50) {
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

                this.scale = this.initialScale * 2;
                this.moveX = this.initialMoveX - (changedTouches[0].clientX - this.elementPosition.left);
                this.moveY = this.initialMoveY - (changedTouches[0].clientY - this.elementPosition.top);
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

    public setMoveX(value: number, transitionDuration: number = 200) {
        this.moveX = value;
        this.transformElement(transitionDuration);
    }

    public setMoveY(value: number, transitionDuration: number = 200) {
        this.moveY = value;
        this.transformElement(transitionDuration);
    }
}
