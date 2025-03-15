import { Vec2 } from "~/util/math/vec2";

/**
 * Type pour le composant TimelineScrubber
 */
export interface TimelineScrubberProps {
    compositionId: string;
    viewportRight: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    viewBounds: [number, number];
}

/**
 * Type pour le composant TrackEditor
 */
export interface TrackEditorProps {
    panY: number;
    viewBounds: [number, number];
    compositionId: string;
    viewport: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    timelineAreaId: string;
    trackDragSelectRect: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;
}

/**
 * Type pour le composant TimelineLayerList
 */
export interface TimelineLayerListProps {
    compositionId: string;
    moveLayers: {
        layerId: string;
        type: "above" | "below" | "invalid";
    } | null;
    panY: number;
}

/**
 * Type pour le composant TimelineLayerParentPickWhipPreview
 */
export interface TimelineLayerParentPickWhipPreviewProps {
    pickWhipLayerParent: {
        fromId: string;
        to: Vec2;
    } | null;
    viewport: {
        left: number;
        top: number;
        width: number;
        height: number;
    };
    compositionId: string;
    panY: number;
}

/**
 * Type pour le composant GraphEditor
 */
export interface GraphEditorProps {
    areaId: string;
    compositionId: string;
    viewport: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
} 
