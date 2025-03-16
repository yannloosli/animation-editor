import { Middleware } from 'redux';
import { ApplicationState } from '~/state/store-types';
import { handleContextMenuOptionSelect } from './contextMenuSlice';

type ContextMenuHandler = (optionId: string) => void;
const contextMenuHandlers = new Map<string, ContextMenuHandler>();

export const registerContextMenuHandler = (optionId: string, handler: ContextMenuHandler) => {

    contextMenuHandlers.set(optionId, handler);

};

export const contextMenuMiddleware: Middleware<{}, ApplicationState> = store => next => action => {
    if (handleContextMenuOptionSelect.match(action)) {

        const handler = contextMenuHandlers.get(action.payload.optionId);
        if (handler) {
            const state = store.getState();
            console.log('Full application state:', {
                area: state.area,
                contextMenu: state.contextMenu
            });
            const contextMenuState = state.contextMenu;


            // Utiliser l'état de l'action en cours s'il existe, sinon utiliser l'état normal
            const currentState = contextMenuState.action ? contextMenuState.action.state : contextMenuState.state;


            if (currentState && currentState.areaId) {

                handler(action.payload.optionId);
                const result = next(action);

                return result;
            } else {


            }
        } else {


        }
    }
    return next(action);
}; 
