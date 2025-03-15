import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { DEFAULT_CONTEXT_MENU_WIDTH } from "~/constants";
import { ContextMenuIcon } from "~/contextMenu/ContextMenuIcon";
import { ContextMenuState, closeContextMenu, handleContextMenuOptionSelect } from "~/contextMenu/contextMenuSlice";
import styles from "~/contextMenu/normal/NormalContextMenu.styles";
import type { ApplicationState } from "~/state/store-types";
import { Vec2 } from "~/util/math/vec2";
import { compileStylesheet } from "~/util/stylesheets";

console.log("[DEBUG] NormalContextMenu - Module chargé");

const s = compileStylesheet(styles);

const CLOSE_MENU_BUFFER = 100;
const REDUCE_STACK_BUFFER = 64;

interface StateProps {
    contextMenu: ContextMenuState;
}

interface DispatchProps {
    dispatch: Dispatch;
}

type Props = StateProps & DispatchProps;

interface Rect {
    x: number;
    y: number;
    width: number;
    height: number;
}

const NormalContextMenuComponent: React.FC<Props> = ({ contextMenu, dispatch }) => {
	console.log("[DEBUG] NormalContextMenu - Props reçues:", contextMenu);

	const [menuRect, setMenuRect] = useState<Rect | null>(null);
	const [optionRects, setOptionRects] = useState<Rect[]>([]);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		console.log("[DEBUG] NormalContextMenu - useEffect triggered, isOpen:", contextMenu.isOpen);
		if (!contextMenu.isOpen || !menuRef.current) {
			setMenuRect(null);
			setOptionRects([]);
			return;
		}

		const menuElement = menuRef.current;
		const menuBounds = menuElement.getBoundingClientRect();
		console.log("[DEBUG] NormalContextMenu - Menu bounds:", menuBounds);
		const newMenuRect: Rect = {
			x: menuBounds.left,
			y: menuBounds.top,
			width: menuBounds.width,
			height: menuBounds.height
		};

		const newOptionRects: Rect[] = Array.from(menuElement.children).map((child) => {
			const bounds = child.getBoundingClientRect();
			return {
				x: bounds.left,
				y: bounds.top,
				width: bounds.width,
				height: bounds.height
			};
		});

		setMenuRect(newMenuRect);
		setOptionRects(newOptionRects);
	}, [contextMenu.isOpen]);

	const onMouseMove = (e: React.MouseEvent) => {
		const vec = Vec2.new(e.clientX, e.clientY);
		const { x, y } = vec;

		if (!menuRect) {
			return;
		}

		if (
			x < menuRect.x - CLOSE_MENU_BUFFER ||
			x > menuRect.x + menuRect.width + CLOSE_MENU_BUFFER ||
			y < menuRect.y - CLOSE_MENU_BUFFER ||
			y > menuRect.y + menuRect.height + CLOSE_MENU_BUFFER
		) {
			dispatch(closeContextMenu());
		}
	};

	if (!contextMenu.isOpen) {
		console.log("[DEBUG] NormalContextMenu - Menu non affiché car isOpen est false");
		return null;
	}

	console.log("[DEBUG] NormalContextMenu - Rendu du menu avec options:", contextMenu.options);

	return (
		<div
			ref={menuRef}
			className={s("container")}
			style={{
				left: contextMenu.position.x,
				top: contextMenu.position.y,
				width: DEFAULT_CONTEXT_MENU_WIDTH
			}}
			onMouseMove={onMouseMove}
		>
			<div className={s("name")}>{contextMenu.name}</div>
			<div className={s("separator")} />
			{contextMenu.options.map((option, index) => (
				<div
					key={option.id}
					className={s("option", { eligible: true })}
					onClick={() => dispatch(handleContextMenuOptionSelect({ optionId: option.id }))}
				>
					<i className={s("option__icon")}>
						<ContextMenuIcon iconName={option.iconName} />
					</i>
					<div className={s("option__label")}>{option.label}</div>
				</div>
			))}
		</div>
	);
};

const mapStateToProps = (state: ApplicationState): StateProps => {
	console.log("[DEBUG] NormalContextMenu - mapStateToProps appelé avec state complet:", state);
	console.log("[DEBUG] NormalContextMenu - contextMenu dans state:", state.contextMenu);
	const contextMenuState = state.contextMenu.action ? state.contextMenu.action.state : state.contextMenu.state;
	console.log("[DEBUG] NormalContextMenu - État du menu contextuel utilisé:", contextMenuState);
	return {
		contextMenu: contextMenuState
	};
};

export const NormalContextMenu = connect(mapStateToProps)(NormalContextMenuComponent);
