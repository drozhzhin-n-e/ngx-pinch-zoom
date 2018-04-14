import { Component, HostBinding, ElementRef, HostListener, OnInit, ViewChild, Input } from '@angular/core';

@Component({
    selector: 'pinch-zoom, [pinch-zoom]',
    templateUrl: './pinch-zoom.component.html'
})

export class PinchZoomComponent {

    elem: any;
    parentElem: any;
    eventType: any;

    scale: any = 1;
    initialScale: any = 1;

    startX: any;
    startY: any;

    moveX: any = 0;
    moveY: any = 0;
    initialMoveX: any = 0;
    initialMoveY: any = 0;

    moveXC: any;
    moveYC: any;

    distance: any;
    initialDistance: any;

    tagName: string;

    @Input('height') containerHeight: string;

    @HostBinding('style.display') hostDisplay:string;
    @HostBinding('style.overflow') hostOverflow:string;
    @HostBinding('style.height') hostHeight:string;

    @ViewChild('content') contentEl: ElementRef;
     
    constructor(private elementRef: ElementRef){
        this.tagName = this.elementRef.nativeElement.tagName.toLowerCase();
    }

    ngOnInit() {
        this.elem = this.contentEl.nativeElement;
        this.parentElem = this.elem.parentNode;

        this.setBasicStyles();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.transformElem(200); 
    }

    @HostListener('touchstart', ['$event'])
    touchstartHandler(event) {
        this.elem.style.transformOrigin = '0 0';
    }

    @HostListener('touchmove', ['$event'])
    touchmoveHandler(event) {
        let touches = event.touches;

        // Swipe
        if (touches.length === 1 && this.scale > 1 && !this.eventType || this.eventType == 'swipe'){
            event.preventDefault();

            if (!this.eventType){
                this.startX = event.touches[0].pageX;
                this.startY = event.touches[0].pageY;
            }

            this.eventType = 'swipe';

            this.moveX = this.initialMoveX + (event.touches[0].pageX - this.startX);
            this.moveY = this.initialMoveY + (event.touches[0].pageY - this.startY);

            this.transformElem(0);
        }

        // Pinch
        if (touches.length === 2 && !this.eventType || this.eventType == 'pinch'){
            event.preventDefault();

            if (!this.eventType){
                this.initialDistance = this.getDistance(touches);

                this.moveXC = ((event.touches[0].pageX + event.touches[1].pageX) / 2) - this.initialMoveX;
                this.moveYC = ((event.touches[0].pageY + event.touches[1].pageY) / 2) - this.initialMoveY;
            }

            this.eventType = 'pinch';
            this.distance = this.getDistance(touches);
            this.scale = this.initialScale * (this.distance / this.initialDistance);

            this.moveX = this.initialMoveX - (((this.distance / this.initialDistance) * this.moveXC) - this.moveXC);
            this.moveY = this.initialMoveY - (((this.distance / this.initialDistance) * this.moveYC) - this.moveYC);

            this.transformElem(0);
        }
    }

    @HostListener('touchend', ['$event'])
    touchendHandler(event) {
        let touches = event.touches;
        let img = this.elem.getElementsByTagName("img")[0];
        
        if (this.scale < 1){
            this.scale = 1;
        }

        if (this.moveY > 0){
            this.moveY = 0;
        } 

        if (img && this.scale > 1){
            let imgHeight = this.getImageHeight();
            let imgWidth = this.getImageWidth();
            let imgOffsetTop = ((imgHeight - this.elem.offsetHeight) * this.scale) / 2;

            if (imgHeight * this.scale < this.parentElem.offsetHeight){
                this.moveY = (this.parentElem.offsetHeight - this.elem.offsetHeight * this.scale) / 2;

            } else if (imgWidth * this.scale < this.parentElem.offsetWidth) {
                this.moveX = (this.parentElem.offsetWidth - this.elem.offsetWidth * this.scale) / 2;
            } else if (this.eventType == 'swipe') {
                if (this.moveY > imgOffsetTop){
                    this.moveY = imgOffsetTop;
                } else if ((imgHeight * this.scale + Math.abs(imgOffsetTop) - this.parentElem.offsetHeight) + this.moveY < 0){
                    this.moveY = - (imgHeight * this.scale + Math.abs(imgOffsetTop) - this.parentElem.offsetHeight);
                }
            }
        }

        if (this.moveX > 0){
            this.moveX = 0;
        } else if (this.moveX < this.elem.offsetWidth * (1 - this.scale)) {
            this.moveX = this.elem.offsetWidth * (1 - this.scale);
        }

        this.initialScale = this.scale;
        this.initialMoveX = this.moveX;
        this.initialMoveY = this.moveY;

        this.transformElem(200); 

        this.eventType = 'touchend';        
        if (touches.length == 0){
            this.eventType = '';
        }
    }

    getDistance(touches: any){
        return Math.sqrt( Math.pow(touches[0].pageX - touches[1].pageX, 2) + Math.pow(touches[0].pageY - touches[1].pageY, 2));
    }

    getImageHeight(){
        return this.elem.getElementsByTagName("img")[0].offsetHeight;
    }

    getImageWidth(){
        return this.elem.getElementsByTagName("img")[0].offsetWidth;
    }

    setBasicStyles():void {
        this.elem.style.display = "flex";
        this.elem.style.height = "100%";
        this.elem.style.alignItems = "center";
        this.elem.style.justifyContent = "center";

        this.hostDisplay = "block";
        this.hostOverflow = "hidden";
        this.hostHeight = this.containerHeight;

        this.setImageWidth();
    }

    setImageWidth():void {
        let imgElem = this.elem.getElementsByTagName("img");

        if (imgElem.length){
            imgElem[0].style.maxWidth = '100%';
            imgElem[0].style.maxHeight = '100%';
        }
    }

    transformElem(duration: any = 50){
        this.elem.style.transition = 'all '+ duration +'ms';
        this.elem.style.transform = 'matrix('+ Number(this.scale) +','+ 0 +','+ 0 +','+ Number(this.scale) +','+ Number(this.moveX) +','+ Number(this.moveY) +')';
    }
}