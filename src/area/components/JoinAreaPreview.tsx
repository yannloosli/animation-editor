import React from "react";
import { useSelector } from "react-redux";
import styles from "~/area/components/JoinAreaPreview.styles";
import { ArrowBoldDownIcon } from "~/components/icons/ArrowBoldDownIcon";
import { RootState } from "~/state/store-init";
import { compileStylesheet } from "~/util/stylesheets";

const s = compileStylesheet(styles);

interface Props {
	areaToViewport: { [areaId: string]: Rect };
}

export const JoinAreaPreview: React.FC<Props> = props => {
	const { areaToViewport } = props;
	const joinPreview = useSelector((state: RootState) => state.area.state.joinPreview);

	if (!joinPreview || !joinPreview.areaId || !joinPreview.movingInDirection) {
		console.log('No preview to show - missing data');
		return null;
	}

	const viewport = areaToViewport[joinPreview.areaId];
	if (!viewport) {
		console.log('No viewport found for area:', joinPreview.areaId);
		return null;
	}

	const arrowWidth = Math.min(256, Math.min(viewport.width, viewport.height) * 0.75);
	return (
		<div style={{ ...viewport }} className={s("container")}>
			<div
				className={s("arrowContainer", {
					[joinPreview.movingInDirection]: true,
				})}
			>
				<div
					className={s("arrow", { [joinPreview.movingInDirection]: true })}
					style={{ width: arrowWidth, height: arrowWidth }}
				>
					<ArrowBoldDownIcon style={{ width: arrowWidth, height: arrowWidth }} />
				</div>
			</div>
		</div>
	);
};
