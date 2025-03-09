export interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface SerializableVec2 {
    x: number;
    y: number;
}

export interface Line {
    start: SerializableVec2;
    end: SerializableVec2;
}

export interface CubicBezier {
    p0: SerializableVec2;
    p1: SerializableVec2;
    p2: SerializableVec2;
    p3: SerializableVec2;
} 
