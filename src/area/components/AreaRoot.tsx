import "~/util/math/expressions";

import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AreaComponent } from "~/area/components/Area";
import { openAreaContextMenu } from "~/area/components/AreaContextMenu";
import AreaRootStyles from "~/area/components/AreaRoot.styles";
import { AreaRowSeparators } from "~/area/components/AreaRowSeparators";
import { AreaToOpenPreview } from "~/area/components/AreaToOpenPreview";
import { JoinAreaPreview } from "~/area/components/JoinAreaPreview";
import { selectAreaLayout, selectAreas, selectJoinPreview, selectRootId } from "~/area/state/areaSelectors";
import { computeAreaToViewport } from "~/area/util/areaToViewport";
import { _setAreaViewport, getAreaRootViewport } from "~/area/util/getAreaViewport";
import { RootState } from "~/state/store-init";
import { Vec2 } from "~/util/math/vec2";
import { compileStylesheetLabelled } from "~/util/stylesheets";

const s = compileStylesheetLabelled(AreaRootStyles);

export const AreaRoot: React.FC = () => {
	const dispatch = useDispatch();
	
	// Utiliser les nouveaux sélecteurs
	const layout = useSelector((state: RootState) => selectAreaLayout(state));
	const rootId = useSelector((state: RootState) => selectRootId(state));
	const joinPreview = useSelector((state: RootState) => selectJoinPreview(state));
	const areas = useSelector((state: RootState) => selectAreas(state));

	// Logs pour le débogage
	
	
	

	const viewportMapRef = useRef<{ [areaId: string]: Rect }>({});

	const [viewport, setViewport] = useState(getAreaRootViewport());

	useEffect(() => {
		const fn = () => setViewport(getAreaRootViewport());
		window.addEventListener("resize", fn);
		return () => window.removeEventListener("resize", fn);
	}, []);

	// Calculer les viewports des areas
	if (viewport && rootId) {
		const newMap = computeAreaToViewport(layout, rootId, viewport) || {};

		const map = viewportMapRef.current;

		const keys = Object.keys(newMap);
		const rectKeys: Array<keyof Rect> = ["height", "x", "y", "width"];
		viewportMapRef.current = keys.reduce<{ [areaId: string]: Rect }>((obj, key) => {
			const a = map[key];
			const b = newMap[key];

			let shouldUpdate = !a;

			if (!shouldUpdate) {
				for (let i = 0; i < rectKeys.length; i += 1) {
					const k = rectKeys[i];
					if (a[k] !== b[k]) {
						shouldUpdate = true;
						break;
					}
				}
			}

			obj[key] = shouldUpdate ? b : a;
			return obj;
		}, {});
	}

	const areaToViewport = viewportMapRef.current;
	_setAreaViewport(areaToViewport);

	// Gestionnaire pour le clic droit sur l'arrière-plan
	const handleContextMenu = (e: React.MouseEvent) => {
		// Vérifier si le clic est sur l'arrière-plan et non sur une zone
		const target = e.target as HTMLElement;
		if (target.getAttribute('data-area-root') !== null) {
			e.preventDefault();
			const position = Vec2.new(e.clientX, e.clientY);
			openAreaContextMenu(position);
		}
	};

	// Si les données essentielles ne sont pas disponibles, afficher un message d'erreur
	if (!layout || !rootId) {
		return <div>Erreur: Données manquantes pour afficher les zones</div>;
	}

	return (
		<div data-area-root onContextMenu={handleContextMenu}>
			{viewport &&
				Object.keys(layout).map((id) => {
					const layoutItem = layout[id];

					if (layoutItem.type === "area_row") {
						return (
							<AreaRowSeparators
								key={id}
								areaToViewport={areaToViewport}
								row={layoutItem}
							/>
						);
					}

					const area = areas[id];
					if (!area) return null;

					const viewportRect = areaToViewport[id];
					if (!viewportRect) return null;

					return (
						<AreaComponent
							key={id}
							id={id}
							viewport={viewportRect}
						/>
					);
				})}

			<div className={s("cursorCapture")} />
			<JoinAreaPreview areaToViewport={areaToViewport} />
			<AreaToOpenPreview areaToViewport={areaToViewport} />
		</div>
	);
};
