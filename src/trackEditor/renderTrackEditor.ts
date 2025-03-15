import { CompositionSelectionState } from "~/composition/compositionSelectionSlice";
import { CompositionState } from "~/composition/compositionSlice";
import { Composition, Property } from "~/composition/compositionTypes";
import { compSelectionFromState } from "~/composition/util/compSelectionUtils";
import {
    TIMELINE_BETWEEN_LAYERS,
    TIMELINE_LAYER_HEIGHT,
    TIMELINE_TRACK_KEYFRAME_HEIGHT,
} from "~/constants";
import { cssVariables } from "~/cssVariables";
import { createGraphEditorNormalToViewportX } from "~/graphEditor/renderGraphEditor";
import { TimelineSelectionState } from "~/timeline/timelineSelectionSlice";
import { TimelineState } from "~/timeline/timelineSlice";
import { LayerType } from "~/types";
import { renderRect } from "~/util/canvas/renderPrimitives";

interface RenderTimelineOptions {
    ctx: Ctx;
    viewportWidth: number;
    viewportHeight: number;
    panY: number;
    viewBounds: [number, number];
    composition: Composition;
    compositionSelectionState: CompositionSelectionState;
    compositionState: CompositionState;
    timelines: TimelineState;
    timelineSelection: TimelineSelectionState;
    trackDragSelectRect: Rect | null;
}

export const renderTracks = (options: RenderTimelineOptions) => {
    const {
        ctx,
        compositionState,
        composition,
        compositionSelectionState,
        viewBounds,
        viewportWidth,
        viewportHeight,
        timelines,
        panY,
    } = options;

    const compositionSelection = compSelectionFromState(composition.id, compositionSelectionState);

    ctx.clearRect(0, 0, viewportWidth, viewportHeight);
    renderRect(
        ctx,
        { left: 0, top: 0, width: viewportWidth, height: viewportHeight },
        { fillColor: cssVariables.dark500 },
    );

    const toTimelineX = createGraphEditorNormalToViewportX({
        compositionLength: composition.length,
        viewBounds,
        width: viewportWidth,
    });

    let yIndex = 0;

    const getY = (): number =>
        yIndex * (TIMELINE_LAYER_HEIGHT + TIMELINE_BETWEEN_LAYERS) + 1 - panY;

    const renderEdge = (fillColor: string) => {
        const x0 = toTimelineX(0);
        const x1 = toTimelineX(composition.length);

        if (x0 > 0) {
            renderRect(
                ctx,
                { left: 0, top: getY(), width: x0, height: TIMELINE_LAYER_HEIGHT },
                { fillColor },
            );
        }
        if (x1 < viewportWidth) {
            renderRect(
                ctx,
                {
                    left: x1,
                    top: getY(),
                    width: viewportWidth - x1,
                    height: TIMELINE_LAYER_HEIGHT,
                },
                { fillColor },
            );
        }
    };

    for (let i = 0; i < composition.layers.length; i += 1) {
        const layerId = composition.layers[i];
        const layer = compositionState.layers[layerId];
        const selected = compositionSelection.layers[layerId];

        const rect: Rect = {
            left: 0,
            top: getY(),
            width: viewportWidth,
            height: TIMELINE_LAYER_HEIGHT,
        };

        renderRect(
            ctx,
            rect,
            { fillColor: selected ? cssVariables.dark700 : cssVariables.dark600 },
        );
        renderEdge(selected ? cssVariables.dark500 : cssVariables.dark400);

        const { index: layerIndex, length: layerLength } = layer;

        if (layer.type === LayerType.Composition) {
            const compositionId = compositionState.compositionLayerIdToComposition[layer.id];
            const composition = compositionState.compositions[compositionId];
            const x0 = toTimelineX(layer.playbackStartsAtIndex);
            const x1 = toTimelineX(layer.playbackStartsAtIndex + composition.length);
            const left = x0;
            const width = x1 - x0;
            const compositionRect: Rect = {
                left: left,
                top: getY(),
                width: width,
                height: TIMELINE_LAYER_HEIGHT,
            };
            renderRect(
                ctx,
                compositionRect,
                { fillColor: selected ? cssVariables.gray600 : cssVariables.gray500 },
            );
        }

        // Render layer bar
        const x0 = toTimelineX(layerIndex);
        const x1 = toTimelineX(layerIndex + layerLength);

        const left = x0;
        const width = x1 - x0;

        const layerRect: Rect = {
            left: left,
            top: getY(),
            width: width,
            height: TIMELINE_LAYER_HEIGHT,
        };

        renderRect(
            ctx,
            layerRect,
            { fillColor: selected ? cssVariables.light300 : cssVariables.gray700 },
        );

        // Render layer properties
        const renderProperty = (propertyId: string) => {
            const property = compositionState.properties[propertyId];

            if (property.type === "compound" && property.separated) {
                for (const propertyId of property.properties) {
                    renderProperty(propertyId);
                }
                return;
            }

            yIndex++;

            const selected = compositionSelection.properties[propertyId];

            const propertyRect: Rect = {
                left: 0,
                top: getY(),
                width: viewportWidth,
                height: TIMELINE_LAYER_HEIGHT,
            };

            renderRect(
                ctx,
                propertyRect,
                { fillColor: selected ? cssVariables.dark700 : cssVariables.dark600 },
            );
            renderEdge(selected ? cssVariables.dark500 : cssVariables.dark400);

            if (property.type === "group") {
                let { collapsed, properties } = property;

                if (property.viewProperties.length) {
                    properties = property.viewProperties;
                    collapsed = false;
                }

                if (!collapsed) {
                    for (let j = 0; j < properties.length; j += 1) {
                        renderProperty(properties[j]);
                    }
                }
                return;
            }

            const renderTimeline = (timelineId: string) => {
                const timeline = timelines[timelineId];

                for (let j = 0; j < timeline.keyframes.length; j += 1) {
                    const k = timeline.keyframes[j];

                    const x = toTimelineX(layerIndex + k.index);
                    const y = getY() + TIMELINE_LAYER_HEIGHT / 2;

                    const selected = options.timelineSelection[timeline.id]?.keyframes[k.id];

                    const W = TIMELINE_TRACK_KEYFRAME_HEIGHT / 2;

                    ctx.beginPath();
                    ctx.moveTo(x, y - W);

                    const traceHalf = (hasControlPoint: boolean, fac: number) => {
                        const W = (fac * TIMELINE_TRACK_KEYFRAME_HEIGHT) / 2;
                        const O = fac * 1;
                        const C = fac * 1.5;

                        if (hasControlPoint) {
                            ctx.lineTo(x + W, y - W);
                            ctx.lineTo(x + W, y - W + C);
                            ctx.lineTo(x + O, y - O);
                            ctx.lineTo(x + O, y + O);
                            ctx.lineTo(x + W, y + W - C);
                            ctx.lineTo(x + W, y + W);
                            ctx.lineTo(x, y + W);
                        } else {
                            ctx.lineTo(x + W, y);
                            ctx.lineTo(x, y + W);
                        }
                    };

                    traceHalf(!!k.controlPointRight, 1);
                    traceHalf(!!k.controlPointLeft, -1);

                    ctx.fillStyle = selected ? cssVariables.primary500 : cssVariables.light500;
                    ctx.fill();
                    ctx.closePath();
                }
            };

            if (property.type === "compound") {
                for (const propertyId of property.properties) {
                    const { timelineId } = compositionState.properties[propertyId] as Property;

                    if (!timelineId) {
                        continue;
                    }

                    renderTimeline(timelineId);
                }

                // const { timelineId } = compositionState.properties[
                // 	property.properties[0]
                // ] as Property;
                // renderTimeline(timelineId);
                return;
            }

            if (!property.timelineId) {
                return;
            }

            renderTimeline(property.timelineId);
        };

        let { collapsed, properties } = layer;
        if (layer.viewProperties.length) {
            collapsed = false;
            properties = layer.viewProperties;
        }

        if (!collapsed) {
            for (let j = 0; j < properties.length; j += 1) {
                renderProperty(properties[j]);
            }
        }

        yIndex++;
    }

    if (options.trackDragSelectRect) {
        const x0 = toTimelineX(options.trackDragSelectRect.left);
        const x1 = toTimelineX(
            options.trackDragSelectRect.left + options.trackDragSelectRect.width,
        );

        const left = x0;
        const width = x1 - x0;

        const top = options.trackDragSelectRect.top;
        const height = options.trackDragSelectRect.height;

        renderRect(
            ctx,
            { top, left, width, height },
            {
                strokeColor: "red",
                strokeWidth: 1,
                fillColor: "rgba(255, 0, 0, .1)",
            },
        );
    }

    /* 	const mouseX = mousePos.x;
        const mouseY = mousePos.y;
    
        if (mouseX >= rect.x && mouseX <= rect.x + rect.width && mouseY >= rect.y && mouseY <= rect.y + rect.height) {
            // ... existing code ...
        } */
};
