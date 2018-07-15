import { Component, HostBinding, ElementRef, HostListener, OnInit, ViewChild, Input, EventEmitter, Output } from '@angular/core';

@Component({
    selector: 'pinch-zoom, [pinch-zoom]',
    templateUrl: './pinch-zoom.component.html',
    styleUrls: ['./pinch-zoom.component.css']
})

export class PinchZoomComponent {

    i: number = 0;
    _id: any;
    element: any;
    elementPosition: any;
    parentElement: any;
    eventType: any;

    scale: number = 1;
    initialScale: number = 1;

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

    distance: number;
    initialDistance: number;
    draggingMode: boolean = false;
    doubleTapTimeout: any;
    lastTap: number = 0;

    @Input('height') containerHeight: string;
    @Input('transition-duration') transitionDuration: number = 200;
    @Input('auto-zoom-out') autoZoomOut: boolean = false;
    @Input('id') set id(value: any) {
        this._id = value;
    }
    get id(){
        return this._id;
    }
    
    @Output() events: EventEmitter<any> = new EventEmitter<any>();

    @HostBinding('style.display') hostDisplay:string;
    @HostBinding('style.overflow') hostOverflow:string;
    @HostBinding('style.height') hostHeight:string;

    @ViewChild('content') contentElement: ElementRef;

    get isMobile() {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor);
        return check;
    };

    get isDragging(){
        let imgHeight = this.getImageHeight();
        let imgWidth = this.getImageWidth();

        if (this.scale > 1) {
            return imgHeight * this.scale > this.parentElement.offsetHeight || imgWidth * this.scale > this.parentElement.offsetWidth;
        }
        if (this.scale === 1) {
            return imgHeight > this.parentElement.offsetHeight || imgWidth > this.parentElement.offsetWidth;
        }
    }

    constructor(private elementRef: ElementRef){
    }

    ngOnInit() {
        this.element = this.contentElement.nativeElement;
        this.parentElement = this.elementRef.nativeElement;
        this.setBasicStyles();
    }


    /*
     * Mobile listeners
     */

    @HostListener('window:resize', ['$event'])
    onResize(event:Event) {
        this.setImageWidth();
        this.transformElement(this.transitionDuration); 
    }

    @HostListener('touchstart', ['$event'])
    touchstartHandler(event:any) {
        this.getElementPosition();

        if (!this.eventType){
            this.startX = event.touches[0].clientX - this.elementPosition.left;
            this.startY = event.touches[0].clientY - this.elementPosition.top;
            this.startClientX = event.touches[0].clientX - this.elementPosition.left;
            this.startClientY = event.touches[0].clientY - this.elementPosition.top;
        }

        this.events.emit({type: 'touchstart'});
    }

    @HostListener('touchmove', ['$event'])
    touchmoveHandler(event:any) {
        let touches = event.touches;

        // Swipe
        if (this.detectSwipe(touches) || this.eventType == 'swipe'){
            this.handleSwipe(event);
        }

        // Pinch
        if (touches.length === 2 && !this.eventType || this.eventType == 'pinch'){
            this.handlePinch(event);
        }
    }

    @HostListener('touchend', ['$event'])
    touchendHandler(event:any) {
        this.i = 0;
        this.draggingMode = false;
        let touches = event.touches;

        if (this.scale < 1){
            this.scale = 1;
        }

        // Auto Zoom Out
        if (this.autoZoomOut && this.eventType === 'pinch'){
            this.scale = 1;
        }

        this.events.emit({type: 'touchend'});

        if (this.eventType === 'pinch' || this.eventType === 'swipe'){
            this.alignImage();
        }

        if (this.eventType === 'pinch' || 
            this.eventType === 'swipe' ||
            this.eventType === 'horizontal-swipe' ||
            this.eventType === 'vertical-swipe'){
            this.updateInitialValues();
        }

        this.eventType = 'touchend';

        if (touches && touches.length == 0){
            this.eventType = '';
        }
    }


    /*
     * Handlers
     */

    handleSwipe(event:any){
        event.preventDefault();

        if (!this.eventType){
            this.startX = event.touches[0].clientX - this.elementPosition.left;
            this.startY = event.touches[0].clientY - this.elementPosition.top;
        }

        this.eventType = 'swipe';
        this.events.emit({
            type: 'swipe',
            moveX: this.moveX,
            moveY: this.moveY
        });

        this.moveX = this.initialMoveX + ((event.touches[0].clientX - this.elementPosition.left) - this.startX);
        this.moveY = this.initialMoveY + ((event.touches[0].clientY - this.elementPosition.top) - this.startY);

        this.transformElement(0);
    }

    handlePinch(event:any){
        event.preventDefault();

        let touches = event.touches;

        if (!this.eventType){
            this.initialDistance = this.getDistance(touches);
            this.moveXC = (((event.touches[0].clientX - this.elementPosition.left) + (event.touches[1].clientX - this.elementPosition.left)) / 2) - this.initialMoveX;
            this.moveYC = (((event.touches[0].clientY - this.elementPosition.top) + (event.touches[1].clientY - this.elementPosition.top)) / 2) - this.initialMoveY;
        }

        this.eventType = 'pinch';
        this.events.emit({type: 'pinch'});
        this.distance = this.getDistance(touches);
        this.scale = this.initialScale * (this.distance / this.initialDistance);
        this.moveX = this.initialMoveX - (((this.distance / this.initialDistance) * this.moveXC) - this.moveXC);
        this.moveY = this.initialMoveY - (((this.distance / this.initialDistance) * this.moveYC) - this.moveYC);

        this.transformElement(0);
    }


    detectSwipe(touches:any){
        return touches.length === 1 && this.scale > 1 && !this.eventType;
    }

    getDistance(touches: any){
        return Math.sqrt( Math.pow(touches[0].pageX - touches[1].pageX, 2) + Math.pow(touches[0].pageY - touches[1].pageY, 2));
    }

    getImageHeight(){
        return this.element.getElementsByTagName("img")[0].offsetHeight;
    }

    getImageWidth(){
        return this.element.getElementsByTagName("img")[0].offsetWidth;
    }

    setBasicStyles():void {
        this.element.style.display = "flex";
        this.element.style.height = "100%";
        this.element.style.alignItems = "center";
        this.element.style.justifyContent = "center";
        this.element.style.transformOrigin = '0 0';
        this.hostDisplay = "block";
        this.hostOverflow = "hidden";
        this.hostHeight = this.containerHeight;

        this.setImageWidth();
    }

    setImageWidth():void {
        let imgElement = this.element.getElementsByTagName("img");

        if (imgElement.length){
            imgElement[0].style.maxWidth = '100%';
            imgElement[0].style.maxHeight = '100%';
        }
    }

    transformElement(duration: any = 50){
        this.element.style.transition = 'all '+ duration +'ms';
        this.element.style.transform = 'matrix('+ Number(this.scale) +','+ 0 +','+ 0 +','+ Number(this.scale) +','+ Number(this.moveX) +','+ Number(this.moveY) +')';
    }

    resetScale():void {
        this.scale = 1;
        this.moveX = 0;
        this.moveY = 0;
        this.updateInitialValues();
        this.transformElement(this.transitionDuration);
    }

    updateInitialValues():void {
        this.initialScale = this.scale;
        this.initialMoveX = this.moveX;
        this.initialMoveY = this.moveY;
    }

    centeringImage():boolean {
        let img = this.element.getElementsByTagName("img")[0];
        const initialMoveX = this.moveX;
        const initialMoveY = this.moveY;

        if (this.moveY > 0){
            this.moveY = 0;
        }
        if (this.moveX > 0){
            this.moveX = 0;
        }

        if (img){
            this.transitionYRestriction();
            this.transitionXRestriction();
        }
        if (img && this.scale < 1){
            if (this.moveX < this.element.offsetWidth * (1 - this.scale)) {
                this.moveX = this.element.offsetWidth * (1 - this.scale);
            }
        }

        return initialMoveX != this.moveX || initialMoveY != this.moveY;
    }

    public alignImage():void {
        let isMoveChanged = this.centeringImage();

        if (isMoveChanged){
            this.updateInitialValues();
            this.transformElement(this.transitionDuration);
        }
    }

    transitionYRestriction():void {
        let imgHeight = this.getImageHeight();

        if (imgHeight * this.scale < this.parentElement.offsetHeight){
            this.moveY = (this.parentElement.offsetHeight - this.element.offsetHeight * this.scale) / 2;
        } else {
            let imgOffsetTop = ((imgHeight - this.element.offsetHeight) * this.scale) / 2;

            if (this.moveY > imgOffsetTop){
                this.moveY = imgOffsetTop;
            } else if ((imgHeight * this.scale + Math.abs(imgOffsetTop) - this.parentElement.offsetHeight) + this.moveY < 0){
                this.moveY = - (imgHeight * this.scale + Math.abs(imgOffsetTop) - this.parentElement.offsetHeight);
            }
        }
    }

    transitionXRestriction():void {
        let imgWidth = this.getImageWidth();

        if (imgWidth * this.scale < this.parentElement.offsetWidth) {
            this.moveX = (this.parentElement.offsetWidth - this.element.offsetWidth * this.scale) / 2;
        } else {
            let imgOffsetLeft = ((imgWidth - this.element.offsetWidth) * this.scale) / 2;

            if (this.moveX > imgOffsetLeft){
                this.moveX = imgOffsetLeft;
            } else if ((imgWidth * this.scale + Math.abs(imgOffsetLeft) - this.parentElement.offsetWidth) + this.moveX < 0){
                this.moveX = - (imgWidth * this.scale + Math.abs(imgOffsetLeft) - this.parentElement.offsetWidth);
            }
        }
    }

    getElementPosition():void {
        this.elementPosition = this.elementRef.nativeElement.getBoundingClientRect();
    }
}