import React from "react";
import { useSelector } from "react-redux";
import ProjectStyles from "~/project/Project.styles";
import { ProjectComp } from "~/project/ProjectComp";
import { createProjectContextMenu } from "~/project/projectContextMenu";
import { RootState } from "~/state/store-init";
import { Vec2 } from "~/util/math/vec2";
import { compileStylesheetLabelled } from "~/util/stylesheets";

const s = compileStylesheetLabelled(ProjectStyles);

export const Project: React.FC = () => {
	const compositionIds = useSelector((state: RootState) => 
		Object.keys((state.project.present as any).compositions)
	);

	const onRightClick = (e: React.MouseEvent<HTMLDivElement>) => {
		createProjectContextMenu(Vec2.fromEvent(e as unknown as MouseEvent), {});
	};

	return (
		<div
			className={s("container")}
			onContextMenu={(e) => {
				e.preventDefault();
				onRightClick(e);
			}}
		>
			<div className={s("header")} />
			<div className={s("compWrapper")}>
				{compositionIds.map((compositionId) => (
					<ProjectComp key={compositionId} compositionId={compositionId} />
				))}
			</div>
		</div>
	);
};
