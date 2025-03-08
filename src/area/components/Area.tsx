import React from "react";
import { Dispatch } from "redux";
import { areaComponentRegistry } from "~/area/areaRegistry";
import styles from "~/area/components/Area.styles";
import { AreaErrorBoundary } from "~/area/components/AreaErrorBoundary";
import { useAreaKeyboardShortcuts } from "~/area/components/useAreaKeyboardShortcuts";
import { handleAreaDragFromCorner } from "~/area/handlers/areaDragFromCorner";
import { AreaIdContext } from "~/area/util/AreaIdContext";
import { EditIcon } from "~/components/icons/EditIcon";
import { PenIcon } from "~/components/icons/PenIcon";
import { AREA_BORDER_WIDTH, AreaType } from "~/constants";
import { openContextMenu } from "~/contextMenu/contextMenuSlice";
import { isKeyDown } from "~/listener/keyboard";
import { connectActionState, MapActionState } from "~/state/stateUtils";
import { CardinalDirection, IntercardinalDirection } from "~/types";
import { AreaComponentProps } from "~/types/areaTypes";
import { Vec2 } from "~/util/math/vec2";
import { compileStylesheetLabelled } from "~/util/stylesheets";

const s = compileStylesheetLabelled(styles);

const cornerDirections = {
	nw: ["n", "w"],
	ne: ["n", "e"],
	sw: ["s", "w"],
	se: ["s", "e"],
} as const;

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
	state: any;
	type: AreaType;
	raised: boolean;
	Component: React.ComponentType<AreaComponentProps<any>>;
}

interface DispatchProps {
	dispatch: Dispatch;
}

type Props = StateProps & OwnProps & DispatchProps;

const areaTypeOptions: Array<{ icon: React.ComponentType; type: AreaType; label: string }> = [
	{
		icon: PenIcon,
		type: AreaType.Project,
		label: "Project",
	},
	{
		icon: PenIcon,
		type: AreaType.Timeline,
		label: "Timeline",
	},
	{
		icon: PenIcon,
		type: AreaType.Workspace,
		label: "Workspace",
	},
	{
		icon: EditIcon,
		type: AreaType.FlowEditor,
		label: "Node Editor",
	},
	{
		icon: EditIcon,
		type: AreaType.History,
		label: "History",
	},
];

const typeToIndex = areaTypeOptions.reduce<{ [key: string]: number }>((obj, { type }, i) => {
	obj[type] = i;
	return obj;
}, {});

const getDirectionParts = (dir: string): [CardinalDirection, CardinalDirection] => {
	const parts = dir.split("") as [CardinalDirection, CardinalDirection];
	if (parts.length !== 2) {
		throw new Error(`Invalid direction: ${dir}`);
	}
	return parts;
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

	const openSelectArea = (_: React.MouseEvent) => {
		const pos = Vec2.new(viewport.left + 4, viewport.top + 4);
		dispatch(openContextMenu({
			name: "Area type",
			options: areaTypeOptions.map((option) => ({
				id: `area_type_${option.type}`,
				label: option.label,
				iconName: option.type === AreaType.FlowEditor ? 'edit' : 'pen',
			})),
			position: { x: pos.x, y: pos.y },
			customContextMenu: { id }
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

const mapStateToProps: MapActionState<StateProps, OwnProps> = (
	{ area: { joinPreview, areas } },
	{ id },
) => {
	const isEligibleForJoin = joinPreview && joinPreview.eligibleAreaIds.indexOf(id) !== -1;
	const isBeingJoined = joinPreview && joinPreview.areaId === id;

	const component = areaComponentRegistry[areas[id].type] as React.ComponentType<
		AreaComponentProps<any>
	>;

	return {
		type: areas[id].type,
		state: areas[id].state,
		raised: !!(isEligibleForJoin || isBeingJoined),
		Component: component,
	};
};

export const Area = connectActionState(mapStateToProps)(AreaComponent);
