import "~/util/math/expressions";

import React, { useEffect, useRef, useState } from "react";
import { Dispatch } from "redux";
import { areaComponentRegistry } from "~/area/areaRegistry";
import { AreaComponent } from "~/area/components/Area";
import AreaRootStyles from "~/area/components/AreaRoot.styles";
import { AreaRowSeparators } from "~/area/components/AreaRowSeparators";
import { AreaToOpenPreview } from "~/area/components/AreaToOpenPreview";
import { JoinAreaPreview } from "~/area/components/JoinAreaPreview";
import { AreaReducerState } from "~/area/state/areaReducer";
import { computeAreaToViewport } from "~/area/util/areaToViewport";
import { _setAreaViewport, getAreaRootViewport } from "~/area/util/getAreaViewport";
import { connectActionState, MapActionState } from "~/state/stateUtils";
import { compileStylesheetLabelled } from "~/util/stylesheets";

const s = compileStylesheetLabelled(AreaRootStyles);

interface StateProps {
	layout: AreaReducerState["layout"];
	rootId: string;
	joinPreview: AreaReducerState["joinPreview"];
	areas: AreaReducerState["areas"];
}

interface DispatchProps {
	dispatch: Dispatch;
}

type Props = StateProps & DispatchProps;

const AreaRootComponent: React.FC<Props> = (props) => {
	const { joinPreview, areas, dispatch } = props;

	const viewportMapRef = useRef<{ [areaId: string]: Rect }>({});

	const [viewport, setViewport] = useState(getAreaRootViewport());

	useEffect(() => {
		const fn = () => setViewport(getAreaRootViewport());
		window.addEventListener("resize", fn);
		return () => window.removeEventListener("resize", fn);
	});

	{
		const newMap =
			(viewport && computeAreaToViewport(props.layout, props.rootId, viewport)) || {};

		const map = viewportMapRef.current;

		const keys = Object.keys(newMap);
		const rectKeys: Array<keyof Rect> = ["height", "left", "top", "width"];
		viewportMapRef.current = keys.reduce<{ [areaId: string]: Rect }>((obj, key) => {
			const a = map[key];
			const b = newMap[key];

			let shouldUpdate = !a;

			if (!shouldUpdate) {
				for (let i = 0; i < rectKeys.length; i += 1) {
					const k = rectKeys[i];
					if (a[k] !== b[k]) {
						shouldUpdate = true;
						break;
					}
				}
			}

			obj[key] = shouldUpdate ? b : a;
			return obj;
		}, {});
	}

	const areaToViewport = viewportMapRef.current;
	_setAreaViewport(areaToViewport);

	return (
		<div data-area-root>
			{viewport &&
				Object.keys(props.layout).map((id) => {
					const layout = props.layout[id];

					if (layout.type === "area_row") {
						return (
							<AreaRowSeparators
								key={id}
								areaToViewport={areaToViewport}
								row={layout}
							/>
						);
					}

					const area = areas[id];
					return (
						<AreaComponent
							key={id}
							viewport={areaToViewport[id]}
							id={id}
							state={area.state}
							type={area.type}
							raised={joinPreview?.eligibleAreaIds.includes(id) || false}
							Component={areaComponentRegistry[area.type]}
							dispatch={dispatch}
						/>
					);
				})}
			{joinPreview && joinPreview.areaId && (
				<JoinAreaPreview areaToViewport={areaToViewport} />
			)}
			<AreaToOpenPreview areaToViewport={areaToViewport} />
			<div className={s("cursorCapture", { active: !!joinPreview })} />
		</div>
	) as React.ReactElement;
};

const mapStateToProps: MapActionState<StateProps & DispatchProps> = ({ area }, dispatch) => ({
	joinPreview: area.joinPreview,
	layout: area.layout,
	rootId: area.rootId,
	areas: area.areas,
	dispatch: dispatch as Dispatch,
});

export const AreaRoot = connectActionState(mapStateToProps)(AreaRootComponent);
