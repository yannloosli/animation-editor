import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from './store';

// Hook typé pour useDispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Hook typé pour useSelector
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Hook pour accéder à une partie spécifique de l'état
export function useAppState<T>(selector: (state: RootState) => T): T {
    return useAppSelector(selector);
}

// Hook pour accéder à l'état des actions
export function useActionState<T>(selector: (state: RootState['actionState']) => T): T {
    return useAppSelector(state => selector(state.actionState));
}

// Hook pour accéder à l'état d'une composition
export function useCompositionState<T>(selector: (state: RootState['compositionState']['present']) => T): T {
    return useAppSelector(state => selector(state.compositionState.present));
}

// Hook pour accéder à l'état de sélection d'une composition
export function useCompositionSelectionState<T>(selector: (state: RootState['compositionSelectionState']['present']) => T): T {
    return useAppSelector(state => selector(state.compositionSelectionState.present));
}

// Hook pour accéder à l'état d'un flux
export function useFlowState<T>(selector: (state: RootState['flowState']['present']) => T): T {
    return useAppSelector(state => selector(state.flowState.present));
}

// Hook pour accéder à l'état de sélection d'un flux
export function useFlowSelectionState<T>(selector: (state: RootState['flowSelectionState']['present']) => T): T {
    return useAppSelector(state => selector(state.flowSelectionState.present));
}

// Hook pour accéder à l'état d'un projet
export function useProjectState<T>(selector: (state: RootState['project']['present']) => T): T {
    return useAppSelector(state => selector(state.project.present));
}

// Hook pour accéder à l'état d'une forme
export function useShapeState<T>(selector: (state: RootState['shapeState']['present']) => T): T {
    return useAppSelector(state => selector(state.shapeState.present));
}

// Hook pour accéder à l'état de sélection d'une forme
export function useShapeSelectionState<T>(selector: (state: RootState['shapeSelectionState']['present']) => T): T {
    return useAppSelector(state => selector(state.shapeSelectionState.present));
}

// Hook pour accéder à l'état d'une timeline
export function useTimelineState<T>(selector: (state: RootState['timelineState']['present']) => T): T {
    return useAppSelector(state => selector(state.timelineState.present));
}

// Hook pour accéder à l'état de sélection d'une timeline
export function useTimelineSelectionState<T>(selector: (state: RootState['timelineSelectionState']['present']) => T): T {
    return useAppSelector(state => selector(state.timelineSelectionState.present));
}

// Hook pour accéder à l'état d'un outil
export function useToolState<T>(selector: (state: RootState['tool']['state']) => T): T {
    return useAppSelector(state => selector(state.tool.state));
}

// Hook pour accéder à l'état d'une zone
export function useAreaState<T>(selector: (state: RootState['area']['state']) => T): T {
    return useAppSelector(state => selector(state.area.state));
}

// Hook pour accéder à l'état du menu contextuel
export function useContextMenuState<T>(selector: (state: RootState['contextMenu']['state']) => T): T {
    return useAppSelector(state => selector(state.contextMenu.state));
}

// Hook pour accéder à l'état de l'espace de travail
export function useWorkspaceState<T>(selector: (state: RootState['workspace']['state']) => T): T {
    return useAppSelector(state => selector(state.workspace.state));
}

// Hook pour accéder à l'état de la zone de timeline
export function useTimelineAreaState<T>(selector: (state: RootState['timelineArea']['state']) => T): T {
    return useAppSelector(state => selector(state.timelineArea.state));
} 
