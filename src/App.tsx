import React, { useEffect } from "react";
import { AreaRoot } from "~/area/components/AreaRoot";
import { registerCompositionKeyboardShortcuts } from "~/composition/compositionShortcutsHandler";
import { CustomContextMenu } from "~/contextMenu/CustomContextMenu";
import { NormalContextMenu } from "~/contextMenu/normal/NormalContextMenu";
import { addListener, removeListener } from "~/listener/addListener";
import { isKeyCodeOf } from "~/listener/keyboard";
import { DragCompositionPreview } from "~/project/DragCompositionPreview";
import { registerTimelineKeyboardShortcuts } from "~/timeline/timelineShortcutsHandler";
import { Toolbar } from "~/toolbar/Toolbar";

export const App: React.FC = () => {
	useEffect(() => {
		const token = addListener.repeated("keydown", { modifierKeys: ["Command"] }, (e) => {
			if (isKeyCodeOf("S", e.keyCode)) {
				e.preventDefault();
				(window as any).saveActionState();
				console.log("Saved!");
			}
		});
		
		// Enregistrer les raccourcis clavier de la timeline
		const cleanupTimelineShortcuts = registerTimelineKeyboardShortcuts();
		
		// Enregistrer les raccourcis clavier des compositions
		const cleanupCompositionShortcuts = registerCompositionKeyboardShortcuts();
		
		return () => {
			removeListener(token);
			cleanupTimelineShortcuts();
			cleanupCompositionShortcuts();
		};
	}, []);

	return (
		<>
			<NormalContextMenu />
			<CustomContextMenu />
			<Toolbar />
			<AreaRoot />
			<DragCompositionPreview />
		</>
	);
};
