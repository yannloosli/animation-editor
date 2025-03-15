import type { MouseEvent as ReactMouseEvent } from "react";
import { Rect } from "./rect";

export interface ViewportRect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export type ViewportMouseEvent = ReactMouseEvent<Element, MouseEvent>;

export function rectToViewportRect(rect: Rect): ViewportRect {
    return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height
    };
}

export function viewportRectToRect(viewport: ViewportRect): Rect {
    return {
        x: viewport.x,
        y: viewport.y,
        width: viewport.width,
        height: viewport.height
    };
} 
