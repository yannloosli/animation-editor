import { Middleware } from 'redux';
import { ApplicationState } from '~/state/store-types';
import { Vec2 } from '~/util/math/vec2';
import {
    addKeyframesToSelection,
    clearTimelineSelection
} from './timelineSelectionSlice';
import {
    applyControlPointShift,
    setControlPointShift,
    setDragSelectRect,
    setKeyframeControlPoint,
    submitDragSelectRect,
    submitIndexAndValueShift
} from './timelineSlice';
import { Timeline, TimelineKeyframe, TimelineKeyframeControlPoint } from './timelineTypes';

/**
 * Vérifie si un keyframe est dans un rectangle de sélection
 */
const isKeyframeInRect = (keyframe: TimelineKeyframe, rect: Rect, yPan: number): boolean => {
    const keyframePos = Vec2.new(keyframe.index, keyframe.value + yPan);
    return (
        keyframePos.x >= rect.x &&
        keyframePos.x <= rect.x + rect.width &&
        keyframePos.y >= rect.y &&
        keyframePos.y <= rect.y + rect.height
    );
};

/**
 * Applique les modifications aux points de contrôle d'un keyframe
 */
const applyControlPointShiftToKeyframe = (
    keyframe: TimelineKeyframe,
    controlPointShift: Timeline['_controlPointShift'],
    keyframeIndex: number
): TimelineKeyframe => {
    if (!controlPointShift || controlPointShift.indexDiff !== keyframeIndex) {
        return keyframe;
    }

    const { direction, indexShift, valueShift, yFac, shiftDown } = controlPointShift;
    const newKeyframe = { ...keyframe };

    // Récupérer le point de contrôle à modifier
    const controlPoint = direction === 'right'
        ? keyframe.controlPointRight
        : keyframe.controlPointLeft;

    if (!controlPoint) return keyframe;

    // Créer un nouveau point de contrôle avec les décalages appliqués
    const newControlPoint: TimelineKeyframeControlPoint = {
        ...controlPoint,
        tx: controlPoint.tx + indexShift,
        value: controlPoint.value + valueShift * yFac,
        relativeToDistance: controlPoint.relativeToDistance
    };

    // Appliquer le nouveau point de contrôle
    if (direction === 'right') {
        newKeyframe.controlPointRight = newControlPoint;

        // Si reflectControlPoints est activé, mettre à jour le point de contrôle gauche
        if (keyframe.reflectControlPoints && keyframe.controlPointLeft) {
            newKeyframe.controlPointLeft = {
                ...keyframe.controlPointLeft,
                tx: keyframe.controlPointLeft.tx,
                value: shiftDown ? keyframe.controlPointLeft.value : -newControlPoint.value,
                relativeToDistance: keyframe.controlPointLeft.relativeToDistance
            };
        }
    } else {
        newKeyframe.controlPointLeft = newControlPoint;

        // Si reflectControlPoints est activé, mettre à jour le point de contrôle droit
        if (keyframe.reflectControlPoints && keyframe.controlPointRight) {
            newKeyframe.controlPointRight = {
                ...keyframe.controlPointRight,
                tx: keyframe.controlPointRight.tx,
                value: shiftDown ? keyframe.controlPointRight.value : -newControlPoint.value,
                relativeToDistance: keyframe.controlPointRight.relativeToDistance
            };
        }
    }

    return newKeyframe;
};

/**
 * Middleware pour gérer les actions complexes de la timeline
 */
export const timelineMiddleware: Middleware<{}, ApplicationState> = store => next => action => {
    // Exécuter l'action normalement
    const result = next(action);

    // Traiter les actions spécifiques après leur exécution
    if (submitDragSelectRect.match(action)) {
        const { timelineId, additiveSelection } = action.payload;
        const state = store.getState();
        const timeline = state.timelineState.present[timelineId];

        if (timeline && timeline._dragSelectRect) {
            const rect = timeline._dragSelectRect;
            const keyframesInRect = timeline.keyframes
                .filter(keyframe => isKeyframeInRect(keyframe, rect, timeline._yPan))
                .map(keyframe => keyframe.id);

            if (!additiveSelection) {
                store.dispatch(clearTimelineSelection({ timelineId }));
            }

            if (keyframesInRect.length > 0) {
                store.dispatch(addKeyframesToSelection({ timelineId, keyframeIds: keyframesInRect }));
            }

            // Nettoyer le rectangle de sélection
            store.dispatch(setDragSelectRect({ timelineId, rect: null }));
        }
    }
    else if (applyControlPointShift.match(action)) {
        const { timelineId, selection } = action.payload;
        const state = store.getState();
        const timeline = state.timelineState.present[timelineId];

        if (timeline && timeline._controlPointShift) {
            const controlPointShift = timeline._controlPointShift;
            const keyframeIndex = controlPointShift.indexDiff;

            // Trouver le keyframe à modifier
            const keyframeToModify = timeline.keyframes[keyframeIndex];

            if (keyframeToModify) {
                // Appliquer les modifications au point de contrôle
                const updatedKeyframe = applyControlPointShiftToKeyframe(
                    keyframeToModify,
                    controlPointShift,
                    keyframeIndex
                );

                // Mettre à jour le point de contrôle dans le keyframe
                if (controlPointShift.direction === 'right') {
                    store.dispatch(setKeyframeControlPoint({
                        timelineId,
                        keyframeIndex,
                        direction: 'right',
                        controlPoint: updatedKeyframe.controlPointRight
                    }));

                    // Si reflectControlPoints est activé, mettre à jour le point de contrôle gauche
                    if (updatedKeyframe.reflectControlPoints && updatedKeyframe.controlPointLeft) {
                        store.dispatch(setKeyframeControlPoint({
                            timelineId,
                            keyframeIndex,
                            direction: 'left',
                            controlPoint: updatedKeyframe.controlPointLeft
                        }));
                    }
                } else {
                    store.dispatch(setKeyframeControlPoint({
                        timelineId,
                        keyframeIndex,
                        direction: 'left',
                        controlPoint: updatedKeyframe.controlPointLeft
                    }));

                    // Si reflectControlPoints est activé, mettre à jour le point de contrôle droit
                    if (updatedKeyframe.reflectControlPoints && updatedKeyframe.controlPointRight) {
                        store.dispatch(setKeyframeControlPoint({
                            timelineId,
                            keyframeIndex,
                            direction: 'right',
                            controlPoint: updatedKeyframe.controlPointRight
                        }));
                    }
                }
            }

            // Réinitialiser le décalage du point de contrôle
            store.dispatch(setControlPointShift({
                timelineId,
                controlPointShift: null
            }));
        }
    }
    else if (submitIndexAndValueShift.match(action)) {
        const { timelineId, selection } = action.payload;
        const state = store.getState();

        // Réinitialiser les décalages après les avoir appliqués
        store.dispatch(setControlPointShift({
            timelineId,
            controlPointShift: null
        }));
    }

    return result;
};

/**
 * Enregistre le middleware timeline dans le store
 */
export const registerTimelineMiddleware = (middlewares: Middleware[]) => {
    middlewares.push(timelineMiddleware);
    return middlewares;
}; 
