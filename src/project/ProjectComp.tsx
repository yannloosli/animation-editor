import React from "react";
import { useSelector } from "react-redux";
import { OpenInAreaIcon } from "~/components/icons/OpenInAreaIcon";
import { dragProjectComp } from "~/project/composition/handlers/dragProjectComp";
import { dragProjectTimelineToArea } from "~/project/composition/handlers/dragProjectTimelineToArea";
import { dragProjectWorkspaceToArea } from "~/project/composition/handlers/dragProjectWorkspaceToArea";
import ProjectCompStyles from "~/project/ProjectComp.styles";
import { ProjectCompLayerName } from "~/project/ProjectCompName";
import { createProjectContextMenu } from "~/project/projectContextMenu";
import { RootState } from "~/state/store-init";
import { Vec2 } from "~/util/math/vec2";
import { compileStylesheetLabelled } from "~/util/stylesheets";

const s = compileStylesheetLabelled(ProjectCompStyles);

interface Props {
	compositionId: string;
}

export const ProjectComp: React.FC<Props> = ({ compositionId }) => {
	const composition = useSelector((state: RootState) => 
		(state.project.present as any).compositions[compositionId]
	);

	if (!composition) {
		return null;
	}

	const onMouseDown = (e: React.MouseEvent) => {
		dragProjectComp(e, compositionId);
	};

	const onRightClick = (e: React.MouseEvent) => {
		e.preventDefault();
		createProjectContextMenu(Vec2.fromEvent(e), { compositionId });
	};

	return (
		<div
			className={s("container")}
			onMouseDown={onMouseDown}
			onContextMenu={onRightClick}
		>
			<ProjectCompLayerName compositionId={compositionId} key={compositionId} />
			<div
				title="Open Workspace in area"
				className={s("openInArea", { active: true })}
				onMouseDown={(e: React.MouseEvent) => dragProjectWorkspaceToArea(e, { compositionId })}
			>
				<OpenInAreaIcon />
			</div>
			<div
				title="Open Timeline in area"
				className={s("openInArea", { active: true })}
				onMouseDown={(e: React.MouseEvent) => dragProjectTimelineToArea(e, { compositionId })}
			>
				<OpenInAreaIcon />
			</div>
		</div>
	);
};
