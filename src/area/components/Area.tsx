import React from "react";
import { Dispatch } from "redux";
import { areaComponentRegistry } from "~/area/areaRegistry";
import styles from "~/area/components/Area.styles";
import { AreaErrorBoundary } from "~/area/components/AreaErrorBoundary";
import { useAreaKeyboardShortcuts } from "~/area/components/useAreaKeyboardShortcuts";
import { handleAreaDragFromCorner } from "~/area/handlers/areaDragFromCorner";
import { AreaIdContext } from "~/area/util/AreaIdContext";
import { EditIcon } from "~/components/icons/EditIcon";
import { AREA_BORDER_WIDTH, AreaType } from "~/constants";
import { openContextMenu } from "~/contextMenu/contextMenuSlice";
import { isKeyDown } from "~/listener/keyboard";
import { connectActionState, MapActionState } from "~/state/stateUtils";
import { IntercardinalDirection } from "~/types";
import { AreaComponentProps } from "~/types/areaTypes";
import { Vec2 } from "~/util/math/vec2";
import { compileStylesheetLabelled } from "~/util/stylesheets";

const s = compileStylesheetLabelled(styles);

const cornerDirections = {
	ne: ["n", "e"],
	se: ["s", "e"],
	sw: ["s", "w"],
	nw: ["n", "w"],
} as const;

const areaTypeOptions = Object.values(AreaType).map(type => {
	const option = {
		id: `area-type-${type}`,
		label: type,
		iconName: type === AreaType.FlowEditor ? 'edit' : 'pen'
	};
	console.log('Creating area type option:', option);
	return option;
});

interface OwnProps {
	id: string;
	viewport: {
		top: number;
		left: number;
		width: number;
		height: number;
	};
}

interface StateProps {
	type: AreaType;
	state: any;
	raised: boolean;
	Component: React.ComponentType<AreaComponentProps<any>>;
}

type Props = OwnProps & StateProps & { dispatch: Dispatch };

const mapState: MapActionState<StateProps, OwnProps> = (state, ownProps) => {
	const area = state.area.areas[ownProps.id];
	return {
		type: area.type,
		state: area.state,
		raised: false,
		Component: areaComponentRegistry[area.type],
	};
};

export const AreaComponent: React.FC<Props> = (props) => {
	const { viewport, id, state, type, raised, Component, dispatch } = props;
	const [hoveredCorners, setHoveredCorners] = React.useState<Set<string>>(new Set());

	useAreaKeyboardShortcuts(id, type, viewport);

	// Gérer les changements d'état de la touche Alt
	React.useEffect(() => {
		const handleKeyChange = (e: KeyboardEvent) => {
			if (e.key === "Alt" && hoveredCorners.size > 0) {
				// Force un re-render pour mettre à jour le curseur
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

	const openSelectArea = (e: React.MouseEvent) => {
		e.preventDefault();
		const pos = Vec2.new(viewport.left + 4, viewport.top + 4);
		console.log('Opening area type menu with options:', areaTypeOptions);
		console.log('Area ID:', id);
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
				className={s("area", { raised })}
				style={viewport}
				data-area-id={id}
				data-area-type={type}
				onContextMenu={handleContextMenu}
			>
				<div className={s("area__content")}>
					<AreaErrorBoundary
						component={Component}
						areaId={id}
						areaState={state}
						left={viewport.left + AREA_BORDER_WIDTH}
						top={viewport.top + AREA_BORDER_WIDTH}
						width={viewport.width - AREA_BORDER_WIDTH * 2}
						height={viewport.height - AREA_BORDER_WIDTH * 2}
					/>
				</div>
				{Object.entries(cornerDirections).map(([dir, parts]) => (
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
	) as React.ReactElement;
};

export const Area = connectActionState(mapState)(AreaComponent);
