import { setRowSizes } from "~/area/state/areaSlice";
import { computeAreaRowToMinSize } from "~/area/util/areaRowToMinSize";
import { computeAreaToViewport } from "~/area/util/areaToViewport";
import { getAreaRootViewport } from "~/area/util/getAreaViewport";
import { AREA_MIN_CONTENT_WIDTH } from "~/constants";
import { store } from "~/state/store-init";
import { AreaRowLayout } from "~/types/areaTypes";
import { capToRange, interpolate } from "~/util/math";
import { Vec2 } from "~/util/math/vec2";

export const handleDragAreaResize = (
    _e: React.MouseEvent,
    row: AreaRowLayout,
    horizontal: boolean,
    areaIndex: number, // 1 is the first separator
) => {
    try {
        // Empêcher le comportement par défaut pour éviter les sélections de texte
        _e.preventDefault();
        _e.stopPropagation();

        // Vérifier que l'ID de rangée est valide
        if (!row || !row.id) {
            console.error("ID de rangée invalide:", row ? row.id : null);
            return;
        }

        // Convertir l'ID en chaîne de caractères si ce n'est pas déjà le cas
        const rowId = String(row.id);


        // Obtenir l'état complet du store
        const storeState = store.getState();
        console.log("Structure du store:", {
            storeExists: !!storeState,
            storeKeys: storeState ? Object.keys(storeState) : [],
            hasArea: storeState && 'area' in storeState,
            areaKeys: storeState && 'area' in storeState ? Object.keys(storeState.area) : []
        });

        // Accéder à l'état de area de manière sécurisée
        let areaState;
        if (storeState && 'area' in storeState) {
            if ('state' in storeState.area) {
                areaState = storeState.area.state;

            } else {
                areaState = storeState.area;

            }
        }

        if (!areaState || !areaState.layout || !areaState.rootId) {
            console.error("État des zones non disponible", {
                areaStateExists: !!areaState,
                hasLayout: areaState && 'layout' in areaState,
                hasRootId: areaState && 'rootId' in areaState
            });
            return;
        }

        // Vérifier que la rangée existe dans le layout
        if (!areaState.layout[rowId]) {
            console.error(`La rangée ${rowId} n'existe pas dans le layout`);

            return;
        }

        const areaToViewport = computeAreaToViewport(
            areaState.layout,
            areaState.rootId,
            getAreaRootViewport(),
        );

        const getMinSize = (id: string) => {
            const layout = areaState.layout[id];

            if (!layout) {
                console.warn(`Layout non trouvé pour l'area ${id}`);
                return 1;
            }

            if (layout.type === "area") {
                return 1;
            }

            const minSize = rowToMinSize[layout.id];
            if (!minSize) {
                console.warn(`Taille minimale non trouvée pour la rangée ${layout.id}`);
                return 1;
            }

            return horizontal ? minSize.width : minSize.height;
        };

        const rowToMinSize = computeAreaRowToMinSize(areaState.rootId, areaState.layout);

        // Vérifier que les zones existent
        if (areaIndex <= 0 || areaIndex >= row.areas.length) {
            console.error(`Index de zone invalide: ${areaIndex}`);
            return;
        }

        const a0 = row.areas[areaIndex - 1];
        const a1 = row.areas[areaIndex];

        if (!a0 || !a1) {
            console.error("Zones adjacentes non trouvées");
            return;
        }

        const v0 = areaToViewport[a0.id];
        const v1 = areaToViewport[a1.id];

        if (!v0 || !v1) {
            console.error("Viewports des zones non trouvés");
            return;
        }

        const m0 = getMinSize(a0.id);
        const m1 = getMinSize(a1.id);

        const sizeToShare = a0.size + a1.size;

        // Créer un viewport partagé avec les coordonnées correctes
        const sharedViewport = {
            width: horizontal ? v0.width + v1.width : v0.width,
            height: !horizontal ? v0.height + v1.height : v0.height,
            x: v0.x,
            y: v0.y,
        };

        const viewportSize = horizontal ? sharedViewport.width : sharedViewport.height;
        const tMin0 = (AREA_MIN_CONTENT_WIDTH * m0) / viewportSize;
        const tMin1 = (AREA_MIN_CONTENT_WIDTH * m1) / viewportSize;

        if (tMin0 + tMin1 >= 0.99) {
            // Il n'y a pratiquement pas d'espace disponible pour redimensionner
            console.warn("Espace insuffisant pour redimensionner");
            return;
        }

        // Capturer la position initiale de la souris
        const initialMousePos = Vec2.fromEvent(_e.nativeEvent);

        // Calculer les tailles initiales pour éviter les sauts
        const initialSizes = [...row.areas.map(a => a.size)];

        const onMouseMove = (e: MouseEvent) => {
            try {
                const vec = Vec2.fromEvent(e);

                // Vérifier que la rangée existe toujours dans le layout
                const currentStoreState = store.getState();
                let currentState;

                if (currentStoreState && 'area' in currentStoreState) {
                    if ('state' in currentStoreState.area) {
                        currentState = currentStoreState.area.state;
                    } else {
                        currentState = currentStoreState.area;
                    }
                }

                if (!currentState || !currentState.layout || !currentState.layout[rowId]) {
                    console.warn(`La rangée ${rowId} n'existe plus dans le layout`);
                    onMouseUp(); // Arrêter le redimensionnement
                    return;
                }

                const t0 = horizontal ? sharedViewport.x : sharedViewport.y;
                const t1 = horizontal
                    ? sharedViewport.x + sharedViewport.width
                    : sharedViewport.y + sharedViewport.height;

                const val = horizontal ? vec.x : vec.y;
                const t = capToRange(tMin0, 1 - tMin1, (val - t0) / (t1 - t0));

                // S'assurer que t est valide
                if (isNaN(t) || t < 0 || t > 1) {
                    console.warn("Valeur de t invalide:", t);
                    return;
                }

                // Copier les tailles initiales
                const sizes = [...initialSizes];
                if (!Array.isArray(sizes) || sizes.length === 0) {
                    console.error("Tableau de tailles invalide:", sizes);
                    return;
                }

                // Calculer les nouvelles tailles uniquement pour les deux zones concernées
                const newSizes = [t, 1 - t].map((v) => interpolate(0, sizeToShare, v));

                // Vérifier que les indices sont valides
                if (areaIndex - 1 < 0 || areaIndex >= sizes.length) {
                    console.error("Indices de zones invalides:", { areaIndex, sizesLength: sizes.length });
                    return;
                }

                sizes[areaIndex - 1] = newSizes[0];
                sizes[areaIndex] = newSizes[1];

                // Vérification approfondie des tailles
                if (sizes.some(size => isNaN(size) || size <= 0)) {
                    console.error("Tailles invalides calculées:", sizes);
                    return;
                }

                // Vérifier que la somme des tailles est proche de la somme originale
                const originalSum = initialSizes.reduce((sum, size) => sum + size, 0);
                const newSum = sizes.reduce((sum, size) => sum + size, 0);

                if (Math.abs(originalSum - newSum) > 0.1) {
                    console.warn("Différence de somme trop importante:", { originalSum, newSum });
                    // Normaliser les tailles
                    const factor = originalSum / newSum;
                    for (let i = 0; i < sizes.length; i++) {
                        sizes[i] *= factor;
                    }
                }

                // Vérifier une dernière fois que l'ID de rangée existe
                if (!currentState.layout[rowId]) {
                    console.warn(`La rangée ${rowId} n'existe plus dans le layout avant dispatch`);
                    return;
                }

                // Afficher des informations de débogage
                console.log("Dispatch setRowSizes:", {
                    rowId: rowId,
                    rowIdType: typeof rowId,
                    rowExists: !!currentState.layout[rowId],
                    sizes
                });

                store.dispatch(setRowSizes({
                    rowId: rowId,
                    sizes: sizes
                }));
            } catch (error) {
                console.error("Erreur dans onMouseMove:", error);
            }
        };

        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        // Définir le style du curseur pour toute la page pendant le redimensionnement
        document.body.style.cursor = horizontal ? 'ew-resize' : 'ns-resize';
        document.body.style.userSelect = 'none'; // Empêcher la sélection de texte

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    } catch (error) {
        console.error("Erreur dans handleDragAreaResize:", error);
        // Réinitialiser les styles en cas d'erreur
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }
};
