import { TIMELINE_LAYER_HEIGHT, TIMELINE_TRACK_START_END_X_MARGIN } from "~/constants";
import { getActionState } from "~/state/stateUtils";
import { timelineNormalToGlobalX } from "~/timeline/timelineUtils";
import { getTimelineTrackYPositions } from "~/trackEditor/trackEditorUtils";
import { ViewportRect, viewportRectToRect } from '~/types/viewport';
import { valueWithinMargin, valueWithinRange } from "~/util/math";
import { Vec2 } from '~/util/math/vec2';

interface Options {
    compositionId: string;
    viewBounds: [number, number];
    viewport: ViewportRect;
    panY: number;
}

export const useTrackEditorCanvasCursor = (
    canvasRef: React.RefObject<HTMLCanvasElement>,
    options: Options,
): ((e: React.MouseEvent) => void) => {
    const onMouseMove = (e: React.MouseEvent) => {
        const canvasEl = canvasRef.current;
        if (!canvasEl) {
            return;
        }

        const { compositionId, viewport, viewBounds, panY } = options;
        const rect = viewportRectToRect(viewport);
        const mousePos = Vec2.fromEvent(e as unknown as MouseEvent);

        const { compositionState } = getActionState();
        const composition = compositionState.compositions[compositionId];

        if (!composition) {
            return;
        }

        const yPosMap = getTimelineTrackYPositions(composition.id, compositionState, panY);

        for (let i = 0; i < composition.layers.length; i += 1) {
            const layerId = composition.layers[i];
            const yPos = yPosMap.layer[layerId];

            if (!valueWithinRange(mousePos.y - rect.y, yPos, yPos + TIMELINE_LAYER_HEIGHT)) {
                continue;
            }

            const layer = compositionState.layers[layerId];

            const startX = timelineNormalToGlobalX(
                layer.index,
                viewBounds,
                rect,
                composition.length
            );
            if (valueWithinMargin(mousePos.x, startX, TIMELINE_TRACK_START_END_X_MARGIN)) {
                canvasEl.style.cursor = "ew-resize";
                return;
            }

            const endX = timelineNormalToGlobalX(
                layer.index + layer.length,
                viewBounds,
                rect,
                composition.length
            );
            if (valueWithinMargin(mousePos.x, endX, TIMELINE_TRACK_START_END_X_MARGIN)) {
                canvasEl.style.cursor = "ew-resize";
                return;
            }
        }

        canvasEl.style.cursor = "";
    };

    return onMouseMove;
};
