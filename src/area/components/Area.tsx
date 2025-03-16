import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { areaComponentRegistry } from "~/area/areaRegistry";
import styles from "~/area/components/Area.styles";
import { AreaErrorBoundary } from "~/area/components/AreaErrorBoundary";
import { useAreaKeyboardShortcuts } from "~/area/components/useAreaKeyboardShortcuts";
import { handleAreaDragFromCorner } from "~/area/handlers/areaDragFromCorner";
import { getAreaById } from "~/area/state/areaSelectors";
import { AreaIdContext } from "~/area/util/AreaIdContext";
import { EditIcon } from "~/components/icons/EditIcon";
import { AREA_BORDER_WIDTH, AreaType } from "~/constants";
import { openContextMenu } from "~/contextMenu/contextMenuSlice";
import { isKeyDown } from "~/listener/keyboard";
import { RootState } from "~/state/store-init";
import { IntercardinalDirection } from "~/types";
import { Vec2 } from "~/util/math/vec2";
import { compileStylesheetLabelled } from "~/util/stylesheets";

const s = compileStylesheetLabelled(styles);

const cornerDirections = {
	ne: ["n", "e"],
	se: ["s", "e"],
	sw: ["s", "w"],
	nw: ["n", "w"],
} as const;

const areaTypeOptions = Object.values(AreaType).map(type => ({
	id: `area-type-${type}`,
	label: type,
	iconName: type === AreaType.FlowEditor ? 'edit' : 'pen'
}));

interface OwnProps {
	id: string;
	viewport: {
		y: number;
		x: number;
		width: number;
		height: number;
	};
}

export const Area: React.FC<OwnProps> = (props) => {
	const { viewport, id } = props;
	const dispatch = useDispatch();
	const [hoveredCorners, setHoveredCorners] = useState<Set<string>>(new Set());

	// Log pour le débogage
	

	// Utiliser les nouveaux sélecteurs
	const area = useSelector((state: RootState) => getAreaById(id)(state));
	
	// Log pour le débogage
	
	
	// Vérifier si les données essentielles sont disponibles
	if (!area) {
		console.error(`Area ${id} n'existe pas dans le store`);
		return null;
	}
	
	// Utiliser un type par défaut si area existe mais que son type est manquant
	const areaType = area.type || AreaType.Workspace;
	useAreaKeyboardShortcuts(id, areaType, viewport);

	// Gérer les changements d'état de la touche Alt
	React.useEffect(() => {
		const handleKeyChange = (e: KeyboardEvent) => {
			if (e.key === "Alt" && hoveredCorners.size > 0) {
				setHoveredCorners(new Set(hoveredCorners));
			}
		};

		window.addEventListener("keydown", handleKeyChange);
		window.addEventListener("keyup", handleKeyChange);

		return () => {
			window.removeEventListener("keydown", handleKeyChange);
			window.removeEventListener("keyup", handleKeyChange);
		};
	}, [hoveredCorners]);

	// Typage explicite du composant avec vérification
	const areaTypeKey = area.type as keyof typeof areaComponentRegistry;
	const Component = areaComponentRegistry[areaTypeKey];
	
	if (!Component) {
		console.error(`Aucun composant enregistré pour le type d'area: ${area.type}`);
		return null;
	}

	const openSelectArea = (e: React.MouseEvent) => {
		e.preventDefault();
		const pos = Vec2.new(viewport.x + 4, viewport.y + 4);
		dispatch(openContextMenu({
			name: "Area type",
			options: areaTypeOptions,
			position: { x: pos.x, y: pos.y },
			areaId: id
		}));
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		const pos = Vec2.new(e.clientX, e.clientY);
		dispatch(openContextMenu({
			name: "Area Actions",
			options: [
				{
					id: "area_copy",
					label: "Copy",
					iconName: "edit"
				},
				{
					id: "area_paste",
					label: "Paste",
					iconName: "edit"
				},
				{
					id: "area_delete",
					label: "Delete",
					iconName: "edit"
				}
			],
			position: { x: pos.x, y: pos.y }
		}));
	};

	return (
		<AreaIdContext.Provider value={id}>
			<div
				className={s("area", { raised: false })}
				style={{
					left: viewport.x,
					top: viewport.y,
					width: viewport.width,
					height: viewport.height
				}}
				data-area-id={id}
				data-area-type={area.type}
				onContextMenu={handleContextMenu}
			>
				<div className={s("area__content")}>
					<AreaErrorBoundary
						component={Component}
						areaId={id}
						areaState={area.state}
						x={viewport.x + AREA_BORDER_WIDTH}
						y={viewport.y + AREA_BORDER_WIDTH}
						width={viewport.width - AREA_BORDER_WIDTH * 2}
						height={viewport.height - AREA_BORDER_WIDTH * 2}
					/>
				</div>
				{Object.entries(cornerDirections).map(([dir]) => (
					<div
						key={dir}
						className={s("area__corner", { [dir]: true })}
						style={{
							cursor: hoveredCorners.has(dir) && isKeyDown("Alt") ? "alias" : "crosshair"
						}}
						onMouseDown={(e) => {
							handleAreaDragFromCorner(e, dir as IntercardinalDirection, id, viewport);
						}}
						onMouseEnter={() => {
							const newHoveredCorners = new Set(hoveredCorners);
							newHoveredCorners.add(dir);
							setHoveredCorners(newHoveredCorners);
						}}
						onMouseLeave={() => {
							const newHoveredCorners = new Set(hoveredCorners);
							newHoveredCorners.delete(dir);
							setHoveredCorners(newHoveredCorners);
						}}
					/>
				))}
				<div className={s("selectAreaButton")} onClick={openSelectArea}>
					<EditIcon />
				</div>
			</div>
		</AreaIdContext.Provider>
	);
};

// Export supplémentaire pour la compatibilité
export const AreaComponent = Area;
