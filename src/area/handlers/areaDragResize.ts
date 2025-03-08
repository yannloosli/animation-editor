import { setRowSizes } from "~/area/state/areaSlice";
import { computeAreaRowToMinSize } from "~/area/util/areaRowToMinSize";
import { computeAreaToViewport } from "~/area/util/areaToViewport";
import { getAreaRootViewport } from "~/area/util/getAreaViewport";
import { AREA_MIN_CONTENT_WIDTH } from "~/constants";
import { store } from "~/state/store-init";
import { AreaRowLayout } from "~/types/areaTypes";
import { capToRange, interpolate } from "~/util/math";
import { Vec2 } from "~/util/math/vec2";

export const handleDragAreaResize = (
	_e: React.MouseEvent,
	row: AreaRowLayout,
	horizontal: boolean,
	areaIndex: number, // 1 is the first separator
) => {
	try {
		const areaState = store.getState().area.state;
		const areaToViewport = computeAreaToViewport(
			areaState.layout,
			areaState.rootId,
			getAreaRootViewport(),
		);

		const getMinSize = (id: string) => {
			const layout = areaState.layout[id];

			if (layout.type === "area") {
				return 1;
			}

			const minSize = rowToMinSize[layout.id];
			return horizontal ? minSize.width : minSize.height;
		};

		const rowToMinSize = computeAreaRowToMinSize(areaState.rootId, areaState.layout);

		const a0 = row.areas[areaIndex - 1];
		const a1 = row.areas[areaIndex];

		const v0 = areaToViewport[a0.id];
		const v1 = areaToViewport[a1.id];

		const m0 = getMinSize(a0.id);
		const m1 = getMinSize(a1.id);

		const sizeToShare = a0.size + a1.size;

		const sharedViewport = {
			width: horizontal ? v0.width + v1.width : v0.width,
			height: !horizontal ? v0.height + v1.height : v0.height,
			left: v0.left,
			top: v0.top,
		};

		const viewportSize = horizontal ? sharedViewport.width : sharedViewport.height;
		const tMin0 = (AREA_MIN_CONTENT_WIDTH * m0) / viewportSize;
		const tMin1 = (AREA_MIN_CONTENT_WIDTH * m1) / viewportSize;

		if (tMin0 + tMin1 >= 0.99) {
			// There's basically no space available to resize
			return;
		}

		const onMouseMove = (e: MouseEvent) => {
			const vec = Vec2.fromEvent(e);

			const t0 = horizontal ? sharedViewport.left : sharedViewport.top;
			const t1 = horizontal
				? sharedViewport.left + sharedViewport.width
				: sharedViewport.top + sharedViewport.height;

			const val = horizontal ? vec.x : vec.y;
			const t = capToRange(tMin0, 1 - tMin1, (val - t0) / (t1 - t0));

			const sizes = [t, 1 - t].map((v) => interpolate(0, sizeToShare, v));

			const rowAreas = row.areas.map((x) => x.size);
			rowAreas[areaIndex - 1] = sizes[0];
			rowAreas[areaIndex] = sizes[1];

			store.dispatch(setRowSizes({
				rowId: row.id,
				sizes: rowAreas
			}));
		};

		const onMouseUp = () => {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		};

		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);
	} catch (error) {
		console.error("Error in handleDragAreaResize:", error);
	}
};
