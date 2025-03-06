import React, { useRef } from "react";
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
import { store } from "~/state/store-init";
import styles from "~/toolbar/Toolbar.styles";
import { setOpenGroupIndex, setTool, ToolState } from "~/toolbar/toolSlice";
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
type Props = StateProps;

const ToolbarComponent: React.FC<Props> = (props) => {
	const onGroupItemClick = useRef<((tool: Tool) => void) | null>(null);
	const group = useRef<HTMLDivElement>(null);
	const cleanupRef = useRef<(() => void) | null>(null);

	const onItemClick = (tool: Tool) => {
		store.dispatch(setTool({ tool }));
	};

	const onGroupClick = (index: number) => {
		console.log('Opening group:', index);
		store.dispatch(setOpenGroupIndex({ index }));
		console.log('Dispatched setOpenGroupIndex with index:', index);

		// Nettoyer le listener précédent s'il existe
		if (cleanupRef.current) {
			cleanupRef.current();
		}

		onGroupItemClick.current = (tool: Tool) => {
			store.dispatch(setTool({ tool }));
			store.dispatch(setOpenGroupIndex({ index: -1 }));
		};

		const handleClickOutside = (e: MouseEvent) => {
			if (
				group.current !== e.target &&
				!group.current?.contains(e.target as HTMLDivElement)
			) {
				store.dispatch(setOpenGroupIndex({ index: -1 }));
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		cleanupRef.current = () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	};

	return (
		<div className={s("container")}>
			<div className={s("dragArea", { left: true })} />
			<div className={s("list")}>
				{toolGroups.map((tools, i) => {
					const active = props.toolState.selected === props.toolState.selectedInGroup[i];
					console.log('Rendering group:', i, 'openGroupIndex:', props.toolState.openGroupIndex);
					return (
						<div key={i} className={s("group", { active })}>
							<button
								className={s("group__visibleTool")}
								onMouseDown={() => onItemClick(props.toolState.selectedInGroup[i])}
							>
								{toolToIconMap[props.toolState.selectedInGroup[i]]()}
							</button>
							<button
								className={s("group__openDropdown", { active })}
								onMouseDown={(e) => {
									e.preventDefault();
									e.stopPropagation();
									onGroupClick(i);
								}}
							/>

							{props.toolState.openGroupIndex === i && (
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

export const Toolbar = connectActionState<StateProps>(({ tool }) => ({ toolState: tool }))(
	ToolbarComponent,
);
