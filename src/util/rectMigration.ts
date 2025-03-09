import { Rect as MathRect } from "./math/types";

export interface LegacyRect {
    left: number;
    top: number;
    width: number;
    height: number;
}

export function legacyRectToMathRect(rect: LegacyRect): MathRect {
    return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
    };
}

export function mathRectToLegacyRect(rect: MathRect): LegacyRect {
    return {
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height
    };
} 
