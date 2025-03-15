import { isKeyDown } from "~/listener/keyboard";
import { requestAction } from "~/listener/requestAction";
import { onPanStart } from "~/shared/viewport/viewportWheelHandlers";
import { Vec2 } from "~/util/math/vec2";
import { setPan, setScale } from "./workspaceSlice";

export const workspaceHandlers = {
	setPan: (pan: Vec2) => setPan(pan),
	setScale: (scale: number) => setScale(scale),
	onWheel: (event: WheelEvent) => {
		// Empêcher le comportement par défaut
		event.preventDefault();

		// Calculer le nouveau zoom
		const delta = -event.deltaY;
		const zoomFactor = 1 + (delta / 1000);
		
		// Dispatch l'action pour mettre à jour le zoom
		return setScale(zoomFactor);
	},
	onPanStart: (areaId: string, e: React.MouseEvent) => onPanStart(areaId, e),
	onZoomClick: (e: React.MouseEvent, areaId: string) => {
		e.stopPropagation();
		const fac = isKeyDown("Alt") ? 0.5 : 2;
		
		requestAction({ history: true }, (params) => {
			const scaleAction = setScale(fac);
			params.dispatch(scaleAction);
			params.submitAction("Zoom");
		});
	}
};
