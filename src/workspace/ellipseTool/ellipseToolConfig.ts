import { Vec2 } from "~/util/math/vec2";

export interface EllipseToolConfig {
    center: Vec2;
    radius: Vec2;
    rotation: number;
}

export const defaultEllipseToolConfig: EllipseToolConfig = {
    center: Vec2.new(0, 0),
    radius: Vec2.new(50, 50),
    rotation: 0
}; 
