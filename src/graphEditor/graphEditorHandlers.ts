import { dispatchToAreaState } from "~/area/state/areaSlice";
import { AreaType } from "~/constants";
import { constructGraphEditorContext, GraphEditorContext } from "~/graphEditor/graphEditorContext";
import { getGraphEditorTimelineTargetObject } from "~/graphEditor/graphEditorUtils";
import { isKeyDown } from "~/listener/keyboard";
import { createOperation } from "~/state/operation";
import { getActionState, getAreaActionState } from "~/state/stateUtils";
import { TimelineSelectionState } from "~/state/store-types";
import { setFields } from "~/timeline/timelineAreaSlice";
import { addKeyframesToSelection, clearTimelineSelection, toggleKeyframeSelection } from "~/timeline/timelineSelectionSlice";
import {
    applyControlPointShift,
    setControlPointShift,
    setIndexAndValueShift,
    setKeyframeControlPoint,
    setKeyframeReflectControlPoints,
    setNewControlPointShift,
    setYBounds,
    setYPan,
    submitIndexAndValueShift
} from "~/timeline/timelineSlice";
import { Timeline, TimelineKeyframe } from "~/timeline/timelineTypes";
import { getTimelineSelection } from "~/timeline/timelineUtils";
import { Rect } from "~/types/rect";
import { mouseDownMoveAction } from "~/util/action/mouseDownMoveAction";
import { isVecInRect, rectOfTwoVecs } from "~/util/math";
import { Vec2 } from "~/util/math/vec2";

const getYUpperLower = (viewport: Rect, mousePositionGlobal: Vec2): [number, number] => {
    const { y } = mousePositionGlobal;
    const buffer = 5;
    const yUpper = Math.max(0, viewport.y - (y - buffer));
    const yLower = Math.max(0, y + buffer - (viewport.y + viewport.height));
    return [yUpper, yLower];
};

const PAN_FAC = 0.0004;

export const graphEditorHandlers = {
    onMouseDown: (
        e: React.MouseEvent,
        options: {
            areaId: string;
            viewport: Rect;
        },
    ): void => {
        const { areaId, viewport } = options;
        const ctx = constructGraphEditorContext(Vec2.fromEvent(e as unknown as MouseEvent), areaId, viewport);

        const { timelines } = ctx;

        for (let ti = 0; ti < timelines.length; ti += 1) {
            const timeline = timelines[ti];

            const target = getGraphEditorTimelineTargetObject(
                timeline,
                ctx.mousePosition.viewport,
                ctx.normalToViewport,
            );

            switch (target.type) {
            case "keyframe": {
                if (isKeyDown("Alt")) {
                    graphEditorHandlers.onKeyframeAltMouseDown(
                        ctx,
                        timeline,
                        target.keyframeIndex,
                    );
                    return;
                }

                graphEditorHandlers.onKeyframeMouseDown(ctx, timeline, target.keyframeIndex);
                return;
            }

            case "control_point": {
                graphEditorHandlers.onControlPointMouseDown(
                    ctx,
                    timeline,
                    target.keyframeIndex,
                    target.which,
                );
                return;
            }
            }
        }

        /**
         * Did not select any entity on timeline.
         *
         * If user drags mouse, create a selection rect.
         *
         * If mouseup is fired without moving, clear selection.
         */
        const wasShiftDown = isKeyDown("Shift");
        mouseDownMoveAction(ctx.mousePosition.global, {
            translate: ctx.globalToNormal,
            keys: [],
            beforeMove: () => { },
            mouseMove: (params, { mousePosition, initialMousePosition }) => {
                const dragSelectRect = rectOfTwoVecs(
                    initialMousePosition.normal,
                    mousePosition.normal,
                );

                const action = dispatchToAreaState({
                    areaId: options.areaId,
                    action: setFields({ dragSelectRect }),
                });
                params.dispatch(action);
            },
            mouseUp: (params, hasMoved) => {
                if (!hasMoved) {
                    timelines.forEach(timeline => {
                        params.dispatch(clearTimelineSelection({ timelineId: timeline.id }));
                    });
                    params.submitAction("Clear timeline selection");
                    return;
                }

                const op = createOperation(params);

                if (!wasShiftDown) {
                    timelines.forEach(timeline => {
                        params.dispatch(clearTimelineSelection({ timelineId: timeline.id }));
                    });
                }

                const { dragSelectRect } = getAreaActionState<AreaType.Timeline>(ctx.areaId);

                timelines.forEach((timeline) => {
                    const keyframes = timeline.keyframes
                        .filter((k) => {
                            return isVecInRect(Vec2.new(k.index, k.value), dragSelectRect!);
                        })
                        .map((k) => k.id);
                    params.dispatch(addKeyframesToSelection({ timelineId: timeline.id, keyframeIds: keyframes }));
                });

                op.add(
                    dispatchToAreaState({
                        areaId: options.areaId,
                        action: setFields({ dragSelectRect: null }),
                    }),
                );
                op.submit();
                params.submitAction("Select keyframes");
            },
        });
    },

    onControlPointMouseDown: (
        ctx: GraphEditorContext,
        timeline: Timeline,
        keyframeIndex: number,
        direction: "left" | "right",
    ) => {
        const { timelines, viewport, yBounds, yFac } = ctx;

        const k = timeline.keyframes[keyframeIndex];

        // Whether or not the angle of the other control point of the keyframe should
        // be reflected according the the control point being moved.
        const shouldReflect = k.reflectControlPoints;
        let reflect = isKeyDown("Alt") ? !shouldReflect : shouldReflect;

        const timelineSelectionState: TimelineSelectionState = getActionState().timelineSelectionState;
        const timelineSelectedKeyframes = timelines.map<
            Array<{ index: number; keyframe: TimelineKeyframe }>
        >((timeline) => {
            const selection = timelineSelectionState[timeline.id];

            if (!selection) {
                return [];
            }

            return timeline.keyframes
                .map((keyframe, index) => ({ keyframe, index }))
                .filter((item) => selection.keyframes[item.keyframe.id]);
        });

        const altDownAtMouseDown = isKeyDown("Alt");

        const boundsDiff = Math.abs(yBounds[0] - yBounds[1]);

        let yPan = 0;

        mouseDownMoveAction(ctx.mousePosition.global, {
            baseDiff: (diff) => diff.modifyMultipleLayerProperties(ctx.propertyIds),
            keys: ["Shift"],
            translate: (vec) => ctx.globalToNormal(vec).addY(yPan),
            beforeMove: (params) => {
                const timelineSelectionState: TimelineSelectionState = getActionState().timelineSelectionState;
                const selected = timelineSelectionState[timeline.id]?.keyframes[k.id];
                if (!selected) {
                    if (!isKeyDown("Shift")) {
                        timelines.forEach(timeline => {
                            params.dispatch(clearTimelineSelection({ timelineId: timeline.id }));
                        });
                    }
                    params.dispatch(toggleKeyframeSelection({ timelineId: timeline.id, keyframeId: k.id }));
                }

                if (altDownAtMouseDown) {
                    timelineSelectedKeyframes.forEach((ids, timelineIndex) => {
                        const timeline = timelines[timelineIndex];
                        ids.forEach(({ keyframe, index }) => {
                            params.dispatch(setKeyframeReflectControlPoints({
                                timelineId: timeline.id,
                                keyframeIndex: index,
                                reflectControlPoints: !keyframe.reflectControlPoints,
                            }));
                        });
                    });
                }

                params.dispatch(setKeyframeReflectControlPoints({
                    timelineId: timeline.id,
                    keyframeIndex,
                    reflectControlPoints: reflect,
                }));
            },
            tickShouldUpdate: ({ mousePosition }) => {
                const [yUpper, yLower] = getYUpperLower(viewport, mousePosition.global);
                return !!(yUpper || yLower);
            },
            mouseMove: (params, { moveVector: _moveVector, mousePosition, keyDown, firstMove }) => {
                if (firstMove) {
                    timelines.forEach(t => {
                        params.dispatch(setYBounds({ timelineId: t.id, yBounds }));
                        params.dispatch(setYPan({ timelineId: t.id, yPan: 0 }));
                    });
                }

                const [yUpper, yLower] = getYUpperLower(viewport, mousePosition.global);

                if (yLower) {
                    yPan -= yLower * boundsDiff * PAN_FAC;
                } else if (yUpper) {
                    yPan += yUpper * boundsDiff * PAN_FAC;
                }

                if (yLower || yUpper) {
                    timelines.forEach(t => {
                        params.dispatch(setYPan({ timelineId: t.id, yPan }));
                    });
                }

                const moveVector = _moveVector.normal.copy();
                const { x: indexShift, y: valueShift } = moveVector;

                const indexDiff =
                    direction === "left"
                        ? timeline.keyframes[keyframeIndex].index -
                        timeline.keyframes[keyframeIndex - 1].index
                        : timeline.keyframes[keyframeIndex + 1].index -
                        timeline.keyframes[keyframeIndex].index;

                timelines.forEach(t => {
                    params.dispatch(setControlPointShift({
                        timelineId: t.id,
                        controlPointShift: {
                            indexDiff,
                            direction: direction,
                            indexShift,
                            valueShift,
                            yFac,
                            shiftDown: keyDown.Shift,
                        },
                    }));
                });
            },
            mouseUp: (params, hasMoved) => {
                const op = createOperation(params);

                timelines.forEach(({ id }) => {
                    op.add(setYBounds({ timelineId: id, yBounds: null }));
                    op.add(setYPan({ timelineId: id, yPan: 0 }));
                });

                if (!hasMoved) {
                    if (!altDownAtMouseDown) {
                        params.cancelAction();
                        return;
                    }

                    op.add(setKeyframeControlPoint({
                        timelineId: timeline.id,
                        keyframeIndex,
                        direction,
                        controlPoint: null,
                    }));
                    op.submit();
                    params.submitAction("Remove control point");
                    return;
                }

                const timelineSelectionState: TimelineSelectionState = getActionState().timelineSelectionState;
                timelines.forEach(({ id }) => {
                    op.add(applyControlPointShift({
                        timelineId: id,
                        selection: timelineSelectionState[id]
                    }));
                });

                op.submit();
                params.submitAction("Move control point");
            },
        });
    },

    onKeyframeAltMouseDown: (
        ctx: GraphEditorContext,
        timeline: Timeline,
        keyframeIndex: number,
    ) => {
        const { timelines, viewport, yBounds } = ctx;

        const k = timeline.keyframes[keyframeIndex];

        const boundsDiff = Math.abs(yBounds[0] - yBounds[1]);

        let yPan = 0;
        let direction!: "left" | "right";

        mouseDownMoveAction(ctx.mousePosition.global, {
            baseDiff: (diff) => diff.modifyMultipleLayerProperties(ctx.propertyIds),
            keys: ["Shift"],
            translate: (vec) => ctx.globalToNormal(vec).addY(yPan),
            beforeMove: (params) => {
                const op = createOperation(params);

                // Clear timeline selection and select only the keyframe we are
                // operating on.
                timelines.forEach(timeline => {
                    params.dispatch(clearTimelineSelection({ timelineId: timeline.id }));
                });
                params.dispatch(toggleKeyframeSelection({ timelineId: timeline.id, keyframeId: k.id }));

                // Lock yBounds and init pan for all timelines.
                //
                // In the future the yBound should be controll via Timeline's
                // area state.
                timelines.forEach(({ id }) => {
                    op.add(setYBounds({ timelineId: id, yBounds }), setYPan({ timelineId: id, yPan: 0 }));
                });

                // When creating control points, they are always initialized to reflect
                op.add(
                    setKeyframeReflectControlPoints({
                        timelineId: timeline.id,
                        keyframeIndex,
                        reflectControlPoints: true,
                    }),
                );

                op.submit();
            },
            tickShouldUpdate: ({ mousePosition }) => {
                const [yUpper, yLower] = getYUpperLower(viewport, mousePosition.global);
                return !!(yUpper || yLower);
            },
            mouseMove: (params, { moveVector: _moveVector, mousePosition, keyDown, firstMove }) => {
                const op = createOperation(params);

                if (firstMove) {
                    direction = _moveVector.global.x > 0 ? "right" : "left";
                }

                const [yUpper, yLower] = getYUpperLower(viewport, mousePosition.global);

                if (yLower) {
                    yPan -= yLower * boundsDiff * PAN_FAC;
                } else if (yUpper) {
                    yPan += yUpper * boundsDiff * PAN_FAC;
                }

                if (yLower || yUpper) {
                    op.add(...timelines.map((t) => setYPan({ timelineId: t.id, yPan })));
                }

                const moveVector = _moveVector.normal.copy();
                let { x: indexShift, y: valueShift } = moveVector;

                if (keyDown.Shift) {
                    valueShift = 0;
                }

                op.add(
                    setNewControlPointShift({
                        timelineId: timeline.id,
                        newControlPointShift: {
                            keyframeIndex: keyframeIndex,
                            direction,
                            indexShift,
                            valueShift,
                        },
                    }),
                );
                op.submit();
            },
            mouseUp: (params, hasMoved) => {
                const op = createOperation(params);

                if (!hasMoved) {
                    // Alt click on keyframe. Remove current control points.
                    op.add(
                        setKeyframeControlPoint({
                            timelineId: timeline.id,
                            keyframeIndex,
                            direction: "left",
                            controlPoint: null,
                        }),
                        setKeyframeControlPoint({
                            timelineId: timeline.id,
                            keyframeIndex,
                            direction: "right",
                            controlPoint: null,
                        }),
                    );
                    op.submit();
                    params.submitAction("Remove keyframe control points");
                    return;
                }

                timelines.forEach(({ id }) => {
                    op.add(setYBounds({ timelineId: id, yBounds: null }), setYPan({ timelineId: id, yPan: 0 }));
                });

                const timelineSelectionState: TimelineSelectionState = getActionState().timelineSelectionState;
                timelines.forEach(({ id }) => {
                    const selection = timelineSelectionState[id];
                    op.add(applyControlPointShift({ timelineId: id, selection }));
                });

                op.submit();
                params.submitAction("Create control points");
            },
        });
    },

    onKeyframeMouseDown: (
        ctx: GraphEditorContext,
        timeline: Timeline,
        keyframeIndex: number,
    ): void => {
        const { timelines, yBounds, yFac } = ctx;

        const selection = getTimelineSelection(timeline.id);
        const keyframe = timeline.keyframes[keyframeIndex];
        const additiveSelection = isKeyDown("Shift") || isKeyDown("Command");

        const boundsDiff = Math.abs(yBounds[0] - yBounds[1]);
        let yPan = 0;

        mouseDownMoveAction(ctx.mousePosition.global, {
            baseDiff: (diff) => diff.modifyMultipleLayerProperties(ctx.propertyIds),
            keys: ["Shift"],
            translate: (vec) => ctx.globalToNormal(vec).addY(yPan),
            beforeMove: (params) => {
                if (additiveSelection) {
                    params.dispatch(toggleKeyframeSelection({ timelineId: timeline.id, keyframeId: keyframe.id }));
                } else if (!selection.keyframes[keyframe.id]) {
                    timelines.forEach(({ id }) => {
                        params.dispatch(clearTimelineSelection({ timelineId: id }));
                    });
                    params.dispatch(toggleKeyframeSelection({ timelineId: timeline.id, keyframeId: keyframe.id }));
                }
            },
            tickShouldUpdate: ({ mousePosition }) => {
                const [yUpper, yLower] = getYUpperLower(ctx.viewport, mousePosition.global);
                return !!(yUpper || yLower);
            },
            mouseMove: (params, { moveVector: _moveVector, mousePosition, keyDown, firstMove }) => {
                if (firstMove) {
                    params.dispatch(
                        timelines.map((t) => setYBounds({ timelineId: t.id, yBounds })),
                    );
                    params.dispatch(timelines.map((t) => setYPan({ timelineId: t.id, yPan: 0 })));
                }

                const [yUpper, yLower] = getYUpperLower(ctx.viewport, mousePosition.global);

                if (yLower) {
                    yPan -= yLower * boundsDiff * PAN_FAC;
                } else if (yUpper) {
                    yPan += yUpper * boundsDiff * PAN_FAC;
                }

                if (yLower || yUpper) {
                    params.dispatch(timelines.map((t) => setYPan({ timelineId: t.id, yPan })));
                }

                const moveVector = _moveVector.normal.copy();

                if (keyDown.Shift) {
                    if (Math.abs(moveVector.x * yFac) > Math.abs(moveVector.y)) {
                        moveVector.y = 0;
                    } else {
                        moveVector.x = 0;
                    }
                }

                params.dispatch(
                    timelines.map((t) =>
                        setIndexAndValueShift({
                            timelineId: t.id,
                            indexShift: Math.round(moveVector.x),
                            valueShift: moveVector.y,
                        }),
                    ),
                );
            },
            mouseUp: (params, hasMoved) => {
                if (!hasMoved) {
                    params.submitAction("Select keyframe");
                    return;
                }

                const toDispatch: any[] = [];

                for (const { id } of timelines) {
                    toDispatch.push(
                        setYBounds({ timelineId: id, yBounds: null }),
                        setYPan({ timelineId: id, yPan: 0 }),
                        submitIndexAndValueShift({ timelineId: id, selection: getTimelineSelection(id) }),
                    );
                }

                params.dispatch(toDispatch);
                params.submitAction("Move selected keyframes", { allowIndexShift: true });
            },
        });
    },
};
