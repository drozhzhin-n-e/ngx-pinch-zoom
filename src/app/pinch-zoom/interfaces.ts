export interface Properties {
    "transition-duration"?: number;
    "double-tap"?: boolean;
    "double-tap-scale"?: number;
    "auto-zoom-out"?: boolean;
    "limit-zoom"?: number;
    "disabled"?: number;
    "element"?: string;
    "disablePan"?: boolean;
    "overflow"?: "hidden" | "visible";
    "disableZoomControl"?: "disable" | "never" | "auto";
    "zoomControlScale"?: number;
    "backgroundColor"?: string;
    "limitPan"?: boolean;
    "minScale"?: number;
    eventHandler?: any;
}