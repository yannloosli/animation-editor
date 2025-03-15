import { ViewportRect } from '~/types/viewport';
import { Vec2 } from '~/util/math/vec2';

export const globalToWorkspacePosition = (
	globalPosition: Vec2,
	viewport: ViewportRect,
	scale: number,
	pan: Vec2,
): Vec2 => {
	let { x, y } = globalPosition;
	x -= viewport.x;
	y -= viewport.y;
	x /= scale;
	y /= scale;
	x -= pan.x / scale;
	y -= pan.y / scale;
	x -= viewport.width / 2 / scale;
	y -= viewport.height / 2 / scale;
	return Vec2.new(x, y);
};

// Fonction pour convertir les coordonnées du viewport en coordonnées globales
export function convertViewportToGlobal(viewport: ViewportRect, x: number, y: number) {
	return {
		x: x + viewport.x,
		y: y + viewport.y
	};
}

// Fonction pour convertir les coordonnées globales en coordonnées du viewport
export function convertGlobalToViewport(viewport: ViewportRect, x: number, y: number) {
	return {
		x: x - viewport.x,
		y: y - viewport.y
	};
}
