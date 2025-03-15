import { addListener, removeListener } from "~/listener/addListener";
import { isKeyCodeOf } from "~/listener/keyboard";
import { requestAction } from "~/listener/requestAction";
import { getActionState } from "~/state/stateUtils";
import { addKeyframesToSelection, clearTimelineSelection } from "./timelineSelectionSlice";
import { removeKeyframes, setKeyframe } from "./timelineSlice";
import { TimelineKeyframe } from "./timelineTypes";

// Variable pour stocker les keyframes copiés
let copiedKeyframes: { [timelineId: string]: TimelineKeyframe[] } = {};

/**
 * Initialise les raccourcis clavier pour la timeline
 */
export const initTimelineKeyboardShortcuts = () => {
    // Supprimer les keyframes sélectionnés avec la touche Delete
    const deleteToken = addListener.keyboardOnce("Delete", "keydown", () => {
        const { timelineState, timelineSelectionState } = getActionState();

        // Pour chaque timeline avec des keyframes sélectionnés
        Object.keys(timelineSelectionState).forEach(timelineId => {
            const selection = timelineSelectionState[timelineId];
            if (!selection) return;

            const keyframeIds = Object.keys(selection.keyframes).filter(id => selection.keyframes[id]);
            if (keyframeIds.length === 0) return;

            requestAction({ history: true }, (params) => {
                params.dispatch(removeKeyframes({ timelineId, keyframeIds }));
                params.dispatch(clearTimelineSelection({ timelineId }));
                params.submitAction("Delete keyframes");
            });
        });
    });

    // Sélectionner tous les keyframes avec Ctrl+A
    const selectAllToken = addListener.repeated("keydown", { modifierKeys: ["Control"] }, (e) => {
        if (isKeyCodeOf("A", e.keyCode)) {
            e.preventDefault();

            const { timelineState, areaState } = getActionState();

            // Trouver la timeline active en fonction de l'area active
            const activeAreaId = Object.keys(areaState.areas.entities).find(areaId => {
                const area = areaState.areas.entities[areaId];
                return area && area.type === "timeline";
            });

            if (!activeAreaId) return;

            const activeArea = areaState.areas.entities[activeAreaId];
            if (!activeArea || !activeArea.state || !activeArea.state.compositionId) return;

            const compositionId = activeArea.state.compositionId;

            // Trouver les timelines associées à cette composition
            const timelineIds = Object.keys(timelineState.present).filter(timelineId => {
                // Logique pour déterminer si la timeline appartient à la composition active
                // Cette logique dépend de la structure de vos données
                return true; // Pour l'instant, on sélectionne toutes les timelines
            });

            // Pour chaque timeline, sélectionner tous les keyframes
            timelineIds.forEach(timelineId => {
                const timeline = timelineState.present[timelineId];
                if (!timeline) return;

                const keyframeIds = timeline.keyframes.map((keyframe: TimelineKeyframe) => keyframe.id);

                requestAction({ history: false }, (params) => {
                    params.dispatch(clearTimelineSelection({ timelineId }));
                    params.dispatch(addKeyframesToSelection({ timelineId, keyframeIds }));
                });
            });
        }
    });

    // Copier les keyframes sélectionnés avec Ctrl+C
    const copyToken = addListener.repeated("keydown", { modifierKeys: ["Control"] }, (e) => {
        if (isKeyCodeOf("C", e.keyCode)) {
            e.preventDefault();

            const { timelineState, timelineSelectionState } = getActionState();

            // Réinitialiser les keyframes copiés
            copiedKeyframes = {};

            // Pour chaque timeline avec des keyframes sélectionnés
            Object.keys(timelineSelectionState).forEach(timelineId => {
                const selection = timelineSelectionState[timelineId];
                if (!selection) return;

                const timeline = timelineState.present[timelineId];
                if (!timeline) return;

                // Filtrer les keyframes sélectionnés
                const selectedKeyframeIds = Object.keys(selection.keyframes).filter(id => selection.keyframes[id]);
                const selectedKeyframes = timeline.keyframes.filter((keyframe: TimelineKeyframe) => selectedKeyframeIds.includes(keyframe.id));

                if (selectedKeyframes.length > 0) {
                    // Stocker les keyframes copiés
                    copiedKeyframes[timelineId] = JSON.parse(JSON.stringify(selectedKeyframes));
                }
            });
        }
    });

    // Coller les keyframes copiés avec Ctrl+V
    const pasteToken = addListener.repeated("keydown", { modifierKeys: ["Control"] }, (e) => {
        if (isKeyCodeOf("V", e.keyCode)) {
            e.preventDefault();

            const { timelineState, areaState } = getActionState();

            // Vérifier s'il y a des keyframes copiés
            if (Object.keys(copiedKeyframes).length === 0) return;

            // Trouver la timeline active
            const activeAreaId = Object.keys(areaState.areas.entities).find(areaId => {
                const area = areaState.areas.entities[areaId];
                return area && area.type === "timeline";
            });

            if (!activeAreaId) return;

            const activeArea = areaState.areas.entities[activeAreaId];
            if (!activeArea || !activeArea.state || !activeArea.state.compositionId) return;

            requestAction({ history: true }, (params) => {
                // Pour chaque timeline avec des keyframes copiés
                Object.keys(copiedKeyframes).forEach(timelineId => {
                    const timeline = timelineState.present[timelineId];
                    if (!timeline) return;

                    // Calculer le décalage pour les nouveaux keyframes
                    // Par exemple, décaler de 10 frames
                    const indexOffset = 10;

                    // Coller les keyframes avec de nouveaux IDs et décalés
                    copiedKeyframes[timelineId].forEach((keyframe: TimelineKeyframe) => {
                        const newKeyframe: TimelineKeyframe = {
                            ...keyframe,
                            id: `${keyframe.id}_copy_${Date.now()}`, // Générer un nouvel ID unique
                            index: keyframe.index + indexOffset // Décaler l'index
                        };

                        params.dispatch(setKeyframe({ timelineId, keyframe: newKeyframe }));
                    });
                });

                params.submitAction("Paste keyframes");
            });
        }
    });

    // Retourner une fonction de nettoyage
    return () => {
        removeListener(deleteToken);
        removeListener(selectAllToken);
        removeListener(copyToken);
        removeListener(pasteToken);
    };
};

/**
 * Enregistre les raccourcis clavier pour la timeline
 * @returns Une fonction de nettoyage pour désinscrire les raccourcis clavier
 */
export const registerTimelineKeyboardShortcuts = (): (() => void) => {
    return initTimelineKeyboardShortcuts();
}; 
