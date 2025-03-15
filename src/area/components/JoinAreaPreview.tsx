import React from "react";
import { useSelector } from "react-redux";
import styles from "~/area/components/JoinAreaPreview.styles";
import { handleJoinAreaClick } from "~/area/handlers/handleJoinAreaClick";
import { selectJoinPreview } from "~/area/state/areaSelectors";
import { ArrowBoldDownIcon } from "~/components/icons/ArrowBoldDownIcon";
import { RootState } from "~/state/store-init";
import { compileStylesheet } from "~/util/stylesheets";

const s = compileStylesheet(styles);

interface Props {
	areaToViewport: { [areaId: string]: Rect };
}

export const JoinAreaPreview: React.FC<Props> = (props) => {
	const { areaToViewport } = props;
	
	// Utiliser le nouveau sélecteur
	const joinPreview = useSelector((state: RootState) => selectJoinPreview(state));
	
	if (!joinPreview || !joinPreview.areaId) {
		return null;
	}
	
	const viewport = areaToViewport[joinPreview.areaId];
	if (!viewport) {
		return null;
	}
	
	const direction = joinPreview.movingInDirection;
	if (!direction) {
		return null;
	}

	const arrowWidth = Math.min(256, Math.min(viewport.width, viewport.height) * 0.75);

	// Gestionnaire de clic pour fusionner les zones
	const handleClick = () => {
		if (joinPreview.areaId && joinPreview.movingInDirection) {
			handleJoinAreaClick(joinPreview.areaId, joinPreview.movingInDirection);
		}
	};

	return (
		<div style={{ ...viewport }} className={s("container")}>
			<div
				className={s("arrowContainer", {
					[direction]: true,
				})}
				onClick={handleClick}
				title="Cliquer pour fusionner les zones"
			>
				<div
					className={s("arrow", { [direction]: true })}
					style={{ width: arrowWidth, height: arrowWidth }}
				>
					<ArrowBoldDownIcon style={{ width: arrowWidth, height: arrowWidth }} />
				</div>
			</div>
		</div>
	);
};
