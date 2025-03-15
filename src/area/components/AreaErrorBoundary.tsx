import React from "react";
import { connect } from "react-redux";
import { cssVariables } from "~/cssVariables";
import { store } from "~/state/store-init";
import { ApplicationState } from "~/state/store-types";
import { AreaComponentProps } from "~/types/areaTypes";
import { compileStylesheetLabelled } from "~/util/stylesheets";

const s = compileStylesheetLabelled(({ css }) => ({
	header: css`
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 32px;
		background: ${cssVariables.gray500};
	`,

	container: css`
		position: absolute;
		top: 32px;
		left: 0;
		right: 0;
		bottom: 0;
		border: 1px solid #d23434;
		border-radius: 0 0 8px 8px;
		box-shadow: inset 0 0 12px #921313;
		background: ${cssVariables.dark500};
		padding: 24px;
	`,

	pre: css`
		font-family: ${cssVariables.fontMonospace};
		font-weight: 300;
		color: ${cssVariables.white500};
		margin: 0;
		font-size: 13px;
		line-height: 20px;
	`,
}));

interface OwnProps {
	component: React.ComponentType<AreaComponentProps<any>>;
	areaId: string;
	areaState: any;
	x: number;
	y: number;
	width: number;
	height: number;
}
interface StateProps {
	historyIndex: number;
}
type Props = OwnProps & StateProps;

interface State {
	errorAtHistoryIndex: number;
	error: Error | null;
}

class AreaErrorBoundaryComponent extends React.Component<Props, State> {
	public readonly state: State = {
		errorAtHistoryIndex: -1,
		error: null,
	};

	static getDerivedStateFromError(error: any): Partial<State> {
		const state = store.getState();
		// Utiliser un index par défaut si flowState n'est pas disponible
		const historyIndex = state.history?.index ?? -1;
		return {
			errorAtHistoryIndex: historyIndex,
			error,
		};
	}

	public componentDidUpdate(prevProps: Props, _prevState: State) {
		if (!this.state.error) {
			return;
		}

		const { props } = this;

		const tryAgain =
			props.historyIndex !== prevProps.historyIndex ||
			props.areaId !== prevProps.areaId ||
			props.areaState !== prevProps.areaState;

		if (tryAgain) {
			this.setState({
				error: null,
				errorAtHistoryIndex: -1,
			});
		}
	}

	public render() {
		const { error } = this.state;

		if (error) {
			const content = error?.stack || "Component encountered an error";

			return (
				<>
					<div className={s("header")} />
					<div className={s("container")}>
						<pre className={s("pre")}>{content}</pre>
					</div>
				</>
			);
		}

		const { component: Component, areaId, areaState, x, y, width, height } = this.props;

		return (
			<Component
				areaId={areaId}
				areaState={areaState}
				x={x}
				y={y}
				width={width}
				height={height}
			/>
		);
	}
}

const mapState = (state: ApplicationState): StateProps => ({
	// Utiliser l'index de l'historique global plutôt que celui de flowState
	historyIndex: state.history?.index ?? -1,
});

// Utiliser une approche avec un cast explicite pour éviter les erreurs de type
const ConnectedComponent = connect(mapState)(
	AreaErrorBoundaryComponent as any
) as any;

// Exporter avec le type correct
export const AreaErrorBoundary: React.ComponentType<OwnProps> = ConnectedComponent;
