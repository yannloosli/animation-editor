import React, { useRef } from "react";
import { Dispatch } from "redux";
import { ConvertAnchorIcon } from "~/components/icons/ConvertAnchorIcon";
import { EllipseIcon } from "~/components/icons/EllipseIcon";
import { FillIcon } from "~/components/icons/FillIcon";
import { IntersectionIcon } from "~/components/icons/IntersectionIcon";
import { PenIcon } from "~/components/icons/PenIcon";
import { PolygonIcon } from "~/components/icons/PolygonIcon";
import { RectangleIcon } from "~/components/icons/RectangleIcon";
import { SelectionIcon } from "~/components/icons/SelectionIcon";
import { Tool, toolGroups, toolToKey, toolToLabel } from "~/constants";
import { connectActionState } from "~/state/stateUtils";
import { ActionState } from "~/state/store-types";
import styles from "~/toolbar/Toolbar.styles";
import { initialState, setOpenGroupIndex, setTool, ToolState } from "~/toolbar/toolSlice";
import { compileStylesheetLabelled } from "~/util/stylesheets";

const s = compileStylesheetLabelled(styles);

export const toolToIconMap: Record<Tool, () => JSX.Element> = {
	[Tool.move]: SelectionIcon,
	[Tool.pen]: PenIcon,
	[Tool.editVertex]: ConvertAnchorIcon,
	[Tool.rectangle]: RectangleIcon,
	[Tool.ellipse]: EllipseIcon,
	[Tool.polygon]: PolygonIcon,
	[Tool.fill]: FillIcon,
	[Tool.intersection]: IntersectionIcon,
};

interface StateProps {
	toolState: ToolState;
}

interface DispatchProps {
	dispatch: Dispatch;
}

type Props = StateProps & DispatchProps;

const ToolbarComponent: React.FC<Props> = ({ toolState, dispatch }) => {
	console.log('[DEBUG] ToolbarComponent - Props:', { toolState });
	if (!toolState) {
		console.error('Toolbar received undefined toolState');
		return null;
	}

	const onGroupItemClick = useRef<((tool: Tool) => void) | null>(null);
	const group = useRef<HTMLDivElement>(null);
	const cleanupRef = useRef<(() => void) | null>(null);

	const onItemClick = (tool: Tool) => {
		console.log('[DEBUG] Toolbar onItemClick - Setting tool:', tool);
		dispatch(setTool({ tool }));
	};

	const onGroupClick = (index: number) => {
		console.log('[DEBUG] Toolbar onGroupClick - Setting openGroupIndex:', index);
		dispatch(setOpenGroupIndex({ index }));

		// Nettoyer le listener précédent s'il existe
		if (cleanupRef.current) {
			cleanupRef.current();
		}

		onGroupItemClick.current = (tool: Tool) => {
			console.log('[DEBUG] Toolbar onGroupItemClick - Setting tool and closing group:', { tool, index: -1 });
			dispatch(setTool({ tool }));
			dispatch(setOpenGroupIndex({ index: -1 }));
		};

		const handleClickOutside = (e: MouseEvent) => {
			if (
				group.current !== e.target &&
				!group.current?.contains(e.target as HTMLDivElement)
			) {
				dispatch(setOpenGroupIndex({ index: -1 }));
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		cleanupRef.current = () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	};

	console.log('[DEBUG] Toolbar render - State:', {
		selected: toolState.selected,
		selectedInGroup: toolState.selectedInGroup,
		openGroupIndex: toolState.openGroupIndex,
		toolGroups
	});

	return (
		<div className={s("container")}>
			<div className={s("dragArea", { left: true })} />
			<div className={s("list")}>
				{toolGroups.map((tools, i) => {
					const selectedTool = toolState.selectedInGroup[i];
					console.log('[DEBUG] Toolbar render - Group:', { 
						index: i, 
						tools, 
						selectedTool,
						icon: toolToIconMap[selectedTool]
					});
					const active = toolState.selected === selectedTool;
					return (
						<div key={i} className={s("group", { active })}>
							<button
								className={s("group__visibleTool")}
								onMouseDown={() => onItemClick(selectedTool)}
							>
								{toolToIconMap[selectedTool]()}
							</button>
							<button
								className={s("group__openDropdown", { active })}
								onMouseDown={(e) => {
									e.preventDefault();
									e.stopPropagation();
									onGroupClick(i);
								}}
							/>

							{toolState.openGroupIndex === i && (
								<div
									ref={group}
									className={s("dropdown")}
									data-tool-dropdown-index={i}
								>
									{tools.map(({ tool }) => (
										<button
											key={tool}
											className={s("item")}
											onMouseDown={(e) => {
												e.preventDefault();
												e.stopPropagation();
												if (
													typeof onGroupItemClick.current === "function"
												) {
													onGroupItemClick.current(tool);
												}
											}}
										>
											<div className={s("icon")}>{toolToIconMap[tool]()}</div>
											<span className={s("label")}>
												<div>{toolToLabel[tool]}</div>
												{toolToKey[tool] && (
													<div className={s("label__key")}>
														{toolToKey[tool]}
													</div>
												)}
											</span>
										</button>
									))}
								</div>
							)}
						</div>
					);
				})}
			</div>
			<div
				className={s("dragArea", { right: true })}
				onClick={() => console.log('Drag area ??')}
			/>
		</div>
	);
};

const mapStateToProps = (state: ActionState): StateProps => {
	console.log('[DEBUG] Toolbar mapStateToProps - Full state:', JSON.stringify(state, null, 2));
	console.log('[DEBUG] Toolbar mapStateToProps - Tool state:', state.tool);

	// Utiliser l'état initial si l'état est undefined
	const toolState = state.tool?.state || initialState;
	console.log('[DEBUG] Toolbar mapStateToProps - Using toolState:', toolState);

	return { toolState };
};

export const Toolbar = connectActionState(mapStateToProps)(ToolbarComponent);
