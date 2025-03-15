import { addLayerToSelection, clearCompositionSelection } from "~/composition/compositionSelectionSlice";
import { createLayer, setEllipseCenter, setEllipseRadius } from "~/composition/compositionSlice";
import { AreaType } from "~/constants";
import { getActionState, getAreaActionState } from "~/state/stateUtils";
import { LayerType } from "~/types";
import { mouseDownMoveAction } from "~/util/action/mouseDownMoveAction";
import { createMapNumberId } from "~/util/mapUtils";
import { Vec2 } from "~/util/math/vec2";

export const ellipseToolHandlers = {
    onMouseDown: (e: React.MouseEvent<Element, MouseEvent>, areaId: string, viewport: { x: number; y: number; width: number; height: number }) => {
        const { compositionId } = getAreaActionState<AreaType.Workspace>(areaId);
        const { compositionState } = getActionState();

        console.log("[ELLIPSE] Starting onMouseDown with:", {
            compositionId,
            areaId,
            mouseX: e.clientX,
            mouseY: e.clientY,
            compositionState
        });

        const viewportVec = Vec2.new(viewport.x, viewport.y);
        const initialPos = Vec2.fromEvent(e.nativeEvent).sub(viewportVec);
        let createdLayerId: string | null = null;

        mouseDownMoveAction(e, {
            keys: ["Shift"],
            beforeMove: (params) => {
                const expectedLayerId = createMapNumberId(compositionState.layers);
                console.log("[ELLIPSE] beforeMove:", {
                    expectedLayerId,
                    initialPos: initialPos.toString(),
                    compositionState
                });

                console.log("[ELLIPSE] Dispatching create layer");
                const createAction = createLayer({
                    compositionId,
                    type: LayerType.Ellipse
                });
                console.log("[ELLIPSE] Create action:", createAction);
                params.dispatch(createAction);

                console.log("[ELLIPSE] Dispatching clear selection");
                params.dispatch(clearCompositionSelection(compositionId));

                console.log("[ELLIPSE] Dispatching add to selection");
                params.dispatch(addLayerToSelection(compositionId, expectedLayerId));

                createdLayerId = expectedLayerId;

                console.log("[ELLIPSE] Setting ellipse center:", {
                    initialPos: initialPos.toString(),
                    x: initialPos.x,
                    y: initialPos.y
                });
                const centerAction = setEllipseCenter({ layerId: expectedLayerId, center: initialPos });
                console.log("[ELLIPSE] Center action:", centerAction);
                params.dispatch(centerAction);
            },
            mouseMove: (params, { mousePosition, keyDown }) => {
                if (!createdLayerId) {
                    console.log("[ELLIPSE] No createdLayerId in mouseMove");
                    return;
                }

                const currentPos = mousePosition.normal;
                const diff = currentPos.sub(initialPos);
                let radius = Math.sqrt(diff.x * diff.x + diff.y * diff.y);

                if (keyDown.Shift) {
                    radius = Math.round(radius);
                }

                console.log("[ELLIPSE] Setting radius:", {
                    radius,
                    diff: diff.toString(),
                    currentPos: currentPos.toString()
                });
                const radiusAction = setEllipseRadius({ layerId: createdLayerId, radius });
                console.log("[ELLIPSE] Radius action:", radiusAction);
                params.dispatch(radiusAction);
            },
            mouseUp: (params, hasMoved) => {
                console.log("[ELLIPSE] mouseUp:", { hasMoved, createdLayerId });

                if (!hasMoved) {
                    if (createdLayerId) {
                        console.log("[ELLIPSE] Setting default radius");
                        const defaultRadiusAction = setEllipseRadius({ layerId: createdLayerId, radius: 50 });
                        console.log("[ELLIPSE] Default radius action:", defaultRadiusAction);
                        params.dispatch(defaultRadiusAction);
                    }
                }

                console.log("[ELLIPSE] Submitting action");
                params.submitAction(hasMoved ? "Create and resize ellipse" : "Create ellipse");
            }
        });
    }
}; 
