import { useRef } from "react";
import { NumberInput } from "~/components/common/NumberInput";
import {
    CompositionState,
    setCompositionDimension,
    setCompositionLength
} from "~/composition/compositionSlice";
import { cssVariables } from "~/cssVariables";
import { requestAction, RequestActionParams } from "~/listener/requestAction";
import { compileStylesheetLabelled } from "~/util/stylesheets";
import { WorkspaceAreaState } from "./workspaceTypes";

const FOOTER_HEIGHT = 24;

const s = compileStylesheetLabelled(({ css }) => ({
	footer: css`
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: ${FOOTER_HEIGHT}px;
		background: blue;
		display: flex;
		background: ${cssVariables.dark600};
		align-items: center;
	`,

	dimensionLabel: css`
		color: ${cssVariables.light500};
		font-family: ${cssVariables.fontFamily};
		font-size: 11px;
		line-height: 16px;
		pointer-events: none;
		margin-right: 4px;
		margin-left: 8px;

		&:first-of-type {
			margin-left: 24px;
		}
	`,
}));

interface Props {
	areaState: WorkspaceAreaState;
	compositionState: CompositionState;
}

export const WorkspaceFooter: React.FC<Props> = (props) => {
	const { areaState, compositionState } = props;
	const composition = compositionState.compositions[areaState.compositionId];

	if (!composition) {
		return (
			<div className="workspace-footer">
				<div className="workspace-footer__dimensions">
					<span>No composition selected</span>
				</div>
			</div>
		);
	}

	const { width, height, length } = composition;

	const paramsRef = useRef<RequestActionParams | null>(null);
	const onValueChangeFn = useRef<((value: number) => void) | null>(null);
	const onValueChangeEndFn = useRef<(() => void) | null>(null);

	const onValueChange = (which: "width" | "height" | "length", value: number) => {
		if (onValueChangeFn.current) {
			onValueChangeFn.current(value);
			return;
		}

		requestAction({ history: true }, (params) => {
			paramsRef.current = params;

			onValueChangeFn.current = (value) => {
				params.dispatch(
					which === "length"
						? setCompositionLength({ compositionId: areaState.compositionId, value })
						: setCompositionDimension({ compositionId: areaState.compositionId, which, value }),
				);
				paramsRef.current?.performDiff((diff) => diff.compositionDimensions(areaState.compositionId));
			};
			onValueChangeFn.current(value);

			onValueChangeEndFn.current = () => {
				paramsRef.current?.addDiff((diff) => diff.compositionDimensions(areaState.compositionId));
				if (which === "length") {
					paramsRef.current?.submitAction("Update composition length");
				} else {
					paramsRef.current?.submitAction("Update composition dimensions");
				}
			};
		});
	};

	const onValueChangeEnd = () => {
		onValueChangeEndFn.current?.();

		paramsRef.current = null;
		onValueChangeFn.current = null;
		onValueChangeEndFn.current = null;
	};

	return (
		<div className={s("footer")}>
			<div className={s("dimensionLabel")}>Width</div>
			<NumberInput
				min={1}
				onChange={(value) => onValueChange("width", value)}
				onChangeEnd={onValueChangeEnd}
				value={width}
			/>
			<div className={s("dimensionLabel")}>Height</div>
			<NumberInput
				min={1}
				onChange={(value) => onValueChange("height", value)}
				onChangeEnd={onValueChangeEnd}
				value={height}
			/>
			<div className={s("dimensionLabel")}>Length</div>
			<NumberInput
				min={1}
				onChange={(value) => onValueChange("length", value)}
				onChangeEnd={onValueChangeEnd}
				value={length}
			/>
		</div>
	);
};
