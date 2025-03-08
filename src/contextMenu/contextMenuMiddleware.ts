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
            handler(action.payload.optionId);
        }
    }
    return next(action);
}; 
