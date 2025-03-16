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


                const createAction = createLayer({
                    compositionId,
                    type: LayerType.Ellipse
                });

                params.dispatch(createAction);


                params.dispatch(clearCompositionSelection(compositionId));


                params.dispatch(addLayerToSelection(compositionId, expectedLayerId));

                createdLayerId = expectedLayerId;

                console.log("[ELLIPSE] Setting ellipse center:", {
                    initialPos: initialPos.toString(),
                    x: initialPos.x,
                    y: initialPos.y
                });
                const centerAction = setEllipseCenter({ layerId: expectedLayerId, center: initialPos });

                params.dispatch(centerAction);
            },
            mouseMove: (params, { mousePosition, keyDown }) => {
                if (!createdLayerId) {

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

                params.dispatch(radiusAction);
            },
            mouseUp: (params, hasMoved) => {


                if (!hasMoved) {
                    if (createdLayerId) {

                        const defaultRadiusAction = setEllipseRadius({ layerId: createdLayerId, radius: 50 });

                        params.dispatch(defaultRadiusAction);
                    }
                }


                params.submitAction(hasMoved ? "Create and resize ellipse" : "Create ellipse");
            }
        });
    }
}; 
