import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
    selector: '[pinch-zoom]'
})

export class PinchZoomDirective{

    elem: any;
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
     
    constructor(private elementRef: ElementRef){
        this.elem = this.elementRef.nativeElement;
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
            let imgHeight = this.getElemHeight();
            let imgWidth = this.getElemWidth();
            let imgOffsetTop = ((imgHeight - this.elem.offsetHeight) * this.scale) / 2;

            if (imgHeight * this.scale < window.innerHeight){
                this.moveY = (window.innerHeight - this.elem.offsetHeight * this.scale) / 2;

            } else if (imgWidth * this.scale < window.innerWidth) {
                this.moveX = (window.innerWidth - this.elem.offsetWidth * this.scale) / 2;
            } else if (this.eventType == 'swipe') {
                if (this.moveY > imgOffsetTop){
                    this.moveY = imgOffsetTop;
                } else if ((imgHeight * this.scale + Math.abs(imgOffsetTop) - window.innerHeight) + this.moveY < 0){
                    this.moveY = - (imgHeight * this.scale + Math.abs(imgOffsetTop) - window.innerHeight);
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

    getElemHeight(){
        return this.elem.getElementsByTagName("img")[0].offsetHeight;
    }

    getElemWidth(){
        return this.elem.getElementsByTagName("img")[0].offsetWidth;
    }

    transformElem(duration: any = 50){
        this.elem.style.transition = 'all '+ duration +'ms';
        this.elem.style.transform = 'matrix('+ Number(this.scale) +','+ 0 +','+ 0 +','+ Number(this.scale) +','+ Number(this.moveX) +','+ Number(this.moveY) +')';
    }
}