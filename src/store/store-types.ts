import { Area } from './areaSlice';

// Type intermédiaire pour la compatibilité
type CompatibleAreaState = {
    ids: string[];
    entities: Record<string, Area>;
    temporaryAction: any | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
};

// Type pour l'état des actions
export type ActionState = CompatibleAreaState;

// Type pour l'état de l'application
export type ApplicationState = {
    actionState: ActionState;
    // ... autres états
};

// ... reste du code ... 
