import { store } from '~/state/store-init';
import { Vec2 } from '~/util/math/vec2';
import {
    clearTimelineSelection,
    toggleKeyframeSelection
} from './timelineSelectionSlice';
import {
    applyControlPointShift,
    setControlPointShift,
    setDragSelectRect,
    setIndexAndValueShift,
    submitDragSelectRect,
    submitIndexAndValueShift
} from './timelineSlice';

/**
 * Gestionnaire d'événement pour le clic sur un keyframe
 */
export const handleKeyframeMouseDown = (
    timelineId: string,
    keyframeId: string,
    e: MouseEvent,
    additiveSelection: boolean
) => {
    const state = store.getState();
    const timeline = state.timelineState.present[timelineId];
    const selection = state.timelineSelectionState.present[timelineId] || { keyframes: {} };

    // Si on clique sur un keyframe non sélectionné sans maintenir Shift, on efface la sélection actuelle
    if (!additiveSelection && !selection.keyframes[keyframeId]) {
        store.dispatch(clearTimelineSelection({ timelineId }));
    }

    // Ajouter ou retirer le keyframe de la sélection
    store.dispatch(toggleKeyframeSelection({ timelineId, keyframeId }));

    // Initialiser le déplacement
    const startPos = Vec2.fromEvent(e);
    let lastPos = Vec2.new(startPos.x, startPos.y);

    const handleMouseMove = (e: MouseEvent) => {
        const currentPos = Vec2.fromEvent(e);
        const delta = currentPos.sub(lastPos);

        // Calculer les décalages d'index et de valeur
        const indexShift = delta.x / 10; // Ajuster selon l'échelle de la timeline
        const valueShift = delta.y / 10; // Ajuster selon l'échelle de la timeline

        // Mettre à jour l'état avec les décalages
        store.dispatch(setIndexAndValueShift({
            timelineId,
            indexShift,
            valueShift
        }));

        lastPos = currentPos;
    };

    const handleMouseUp = () => {
        // Appliquer définitivement les décalages
        store.dispatch(submitIndexAndValueShift({
            timelineId,
            selection
        }));

        // Nettoyer les écouteurs d'événements
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
};

/**
 * Gestionnaire d'événement pour le clic sur un point de contrôle
 */
export const handleControlPointMouseDown = (
    timelineId: string,
    keyframeIndex: number,
    direction: 'left' | 'right',
    e: MouseEvent
) => {
    const state = store.getState();
    const timeline = state.timelineState.present[timelineId];

    // Initialiser le déplacement du point de contrôle
    const startPos = Vec2.fromEvent(e);
    let lastPos = Vec2.new(startPos.x, startPos.y);

    const handleMouseMove = (e: MouseEvent) => {
        const currentPos = Vec2.fromEvent(e);
        const delta = currentPos.sub(lastPos);

        // Calculer les décalages pour le point de contrôle
        const indexShift = delta.x / 10; // Ajuster selon l'échelle
        const valueShift = delta.y / 10; // Ajuster selon l'échelle

        // Mettre à jour l'état avec les décalages du point de contrôle
        store.dispatch(setControlPointShift({
            timelineId,
            controlPointShift: {
                indexDiff: keyframeIndex,
                direction,
                indexShift,
                valueShift,
                yFac: 1, // Facteur d'échelle vertical
                shiftDown: e.shiftKey // Si Shift est enfoncé, comportement spécial
            }
        }));

        lastPos = currentPos;
    };

    const handleMouseUp = () => {
        // Appliquer définitivement les décalages du point de contrôle
        store.dispatch(applyControlPointShift({
            timelineId,
            selection: undefined
        }));

        // Nettoyer les écouteurs d'événements
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
};

/**
 * Gestionnaire d'événement pour le clic sur l'arrière-plan de la timeline
 */
export const handleTimelineBackgroundMouseDown = (
    timelineId: string,
    e: MouseEvent,
    options: {
        viewBounds: [number, number];
        viewport: Rect;
    }
) => {
    // Si on clique avec le bouton droit, on ne fait rien (géré par le menu contextuel)
    if (e.button === 2) return;

    // Effacer la sélection actuelle si Shift n'est pas enfoncé
    if (!e.shiftKey) {
        store.dispatch(clearTimelineSelection({ timelineId }));
    }

    // Initialiser le rectangle de sélection
    const startPos = Vec2.fromEvent(e);
    const initialRect: Rect = {
        x: startPos.x,
        y: startPos.y,
        width: 0,
        height: 0
    };

    // Mettre à jour le rectangle de sélection dans l'état
    store.dispatch(setDragSelectRect({
        timelineId,
        rect: initialRect
    }));

    const handleMouseMove = (e: MouseEvent) => {
        const currentPos = Vec2.fromEvent(e);

        // Calculer le nouveau rectangle de sélection
        const rect: Rect = {
            x: Math.min(startPos.x, currentPos.x),
            y: Math.min(startPos.y, currentPos.y),
            width: Math.abs(currentPos.x - startPos.x),
            height: Math.abs(currentPos.y - startPos.y)
        };

        // Mettre à jour le rectangle de sélection dans l'état
        store.dispatch(setDragSelectRect({
            timelineId,
            rect
        }));
    };

    const handleMouseUp = () => {
        // Soumettre le rectangle de sélection pour sélectionner les keyframes
        store.dispatch(submitDragSelectRect({
            timelineId,
            additiveSelection: e.shiftKey
        }));

        // Nettoyer les écouteurs d'événements
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}; 
