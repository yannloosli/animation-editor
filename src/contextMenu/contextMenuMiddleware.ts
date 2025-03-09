import { Middleware } from 'redux';
import { ApplicationState } from '~/state/store-types';
import { handleContextMenuOptionSelect } from './contextMenuSlice';

type ContextMenuHandler = (optionId: string) => void;
const contextMenuHandlers = new Map<string, ContextMenuHandler>();

export const registerContextMenuHandler = (optionId: string, handler: ContextMenuHandler) => {
    console.log('Registering context menu handler for:', optionId);
    contextMenuHandlers.set(optionId, handler);
    console.log('Current handlers:', Array.from(contextMenuHandlers.keys()));
};

export const contextMenuMiddleware: Middleware<{}, ApplicationState> = store => next => action => {
    if (handleContextMenuOptionSelect.match(action)) {
        console.log('Context menu option selected:', action.payload.optionId);
        const handler = contextMenuHandlers.get(action.payload.optionId);
        if (handler) {
            const state = store.getState();
            console.log('Full application state:', {
                area: state.area,
                contextMenu: state.contextMenu
            });
            const contextMenuState = state.contextMenu;
            console.log('Full context menu state:', contextMenuState);
            
            // Utiliser l'état de l'action en cours s'il existe, sinon utiliser l'état normal
            const currentState = contextMenuState.action ? contextMenuState.action.state : contextMenuState.state;
            console.log('Current context menu state:', currentState);
            
            if (currentState && currentState.areaId) {
                console.log('Found areaId:', currentState.areaId);
                handler(action.payload.optionId);
                const result = next(action);
                console.log('State after handler execution:', store.getState().area);
                return result;
            } else {
                console.log('No customContextMenu found in state before executing handler');
                console.log('Full context menu state:', contextMenuState);
            }
        } else {
            console.log('No handler found for:', action.payload.optionId);
            console.log('Available handlers:', Array.from(contextMenuHandlers.keys()));
        }
    }
    return next(action);
}; 
