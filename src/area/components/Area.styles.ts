import { cssVariables, cssZIndex } from "~/cssVariables";
import { StyleParams } from "~/util/stylesheets";

export default ({ css }: StyleParams) => ({
    area: css`
		position: absolute;
		background: ${cssVariables.gray800};
		border: 1px solid ${cssVariables.gray700};
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		z-index: ${cssZIndex.area.areaBase};

		&--raised {
			z-index: ${cssZIndex.area.areaRaised};
		}
	`,

    area__content: css`
		flex: 1;
		position: relative;
		overflow: hidden;
		background: ${cssVariables.gray800};
	`,

    area__corner: css`
		position: absolute;
		width: 10px;
		height: 10px;
		background: ${cssVariables.gray700};
		z-index: ${cssZIndex.area.areaBase};

		&--ne {
			top: 0;
			right: 0;
			cursor: ne-resize;
		}

		&--se {
			bottom: 0;
			right: 0;
			cursor: se-resize;
		}

		&--sw {
			bottom: 0;
			left: 0;
			cursor: sw-resize;
		}

		&--nw {
			top: 0;
			left: 0;
			cursor: nw-resize;
		}
	`,

    selectAreaButton: css`
		position: absolute;
		top: 4px;
		right: 4px;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: ${cssVariables.gray800};
		border: 1px solid ${cssVariables.gray700};
		border-radius: 4px;
		cursor: pointer;
		z-index: ${cssZIndex.area.areaBase};

		&:hover {
			background: ${cssVariables.gray700};
		}
	`,

    selectArea: css`
		position: absolute;
		top: -32px;
		left: -32px;
		padding: 36px;
		z-index: 15;
		background: transparent;
	`,

    selectArea__inner: css`
		border: 1px solid ${cssVariables.gray800};
		background: ${cssVariables.dark800};
	`,

    selectArea__item: css`
		color: white;
		border: none;
		border-radius: 4px;
		padding: 0 24px;
		background: ${cssVariables.dark800};
		display: block;
		width: 128px;
	`,
});
