import React from "react";
import { useDispatch } from "react-redux";
import { dispatchToAreaState } from "~/area/state/areaSlice";
import { toggleGraphEditorOpen } from "~/timeline/timelineAreaSlice";
import { compileStylesheetLabelled } from "~/util/stylesheets";
import TimelineHeaderStyles from "./TimelineHeader.styles";

const s = compileStylesheetLabelled(TimelineHeaderStyles);

interface OwnProps {
	areaId: string;
}

export const TimelineHeader: React.FC<OwnProps> = (props) => {
	const { areaId } = props;
	const dispatch = useDispatch();

	const onGraphEditorToggleClick = () => {
		dispatch(dispatchToAreaState({
			areaId,
			action: toggleGraphEditorOpen(),
		}));
	};

	return (
		<div className={s("header")}>
			<div className={s("labelWrapper")}>
				<div className={s("label")} style={{ width: 102, paddingLeft: 3 }}>
					Name
				</div>
				<div className={s("label")} style={{ width: 48 }}>
					Graph
				</div>
				<div className={s("label")} style={{ width: 98, paddingLeft: 3 }}>
					Parent
				</div>
			</div>
			<button
				className={s("graphEditorToggle")}
				onMouseDown={(e) => e.stopPropagation()}
				onClick={onGraphEditorToggleClick}
			>
				Graph Editor
			</button>
		</div>
	);
};
