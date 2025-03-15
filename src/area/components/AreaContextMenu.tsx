import { useDispatch } from 'react-redux';
import { openAreaAtPreview, showAreaToOpenPreview } from '~/area/handlers/handleAreaToOpen';
import { AreaType } from '~/constants';
import { openContextMenu } from '~/contextMenu/contextMenuSlice';
import { Vec2 } from '~/util/math/vec2';

// Fonction pour gérer la sélection d'une option du menu contextuel
const handleOptionSelect = (optionId: string, position: Vec2) => {
    // Déterminer le type de zone à créer
    let areaType: AreaType;
    switch (optionId) {
        case 'area-workspace':
            areaType = AreaType.Workspace;
            break;
        case 'area-timeline':
            areaType = AreaType.Timeline;
            break;
        case 'area-flow':
            areaType = AreaType.FlowEditor;
            break;
        case 'area-history':
            areaType = AreaType.History;
            break;
        case 'area-project':
            areaType = AreaType.Project;
            break;
        default:
            areaType = AreaType.Workspace;
    }
    
    // Afficher la prévisualisation de la zone
    showAreaToOpenPreview(position, areaType);
    
    // Attendre un court instant pour que l'utilisateur puisse voir la prévisualisation
    setTimeout(() => {
        // Ouvrir la zone
        openAreaAtPreview();
    }, 100);
};

/**
 * Ouvre le menu contextuel pour créer une nouvelle zone
 * @param position Position du clic
 */
export const openAreaContextMenu = (position: Vec2) => {
    const dispatch = useDispatch();
    
    // Créer les options du menu contextuel
    const options = [
        {
            id: 'area-workspace',
            label: 'Espace de travail',
            iconName: 'workspace'
        },
        {
            id: 'area-timeline',
            label: 'Timeline',
            iconName: 'timeline'
        },
        {
            id: 'area-flow',
            label: 'Éditeur de flux',
            iconName: 'flow'
        },
        {
            id: 'area-history',
            label: 'Historique',
            iconName: 'history'
        },
        {
            id: 'area-project',
            label: 'Projet',
            iconName: 'project'
        }
    ];
    
    // Ouvrir le menu contextuel
    dispatch(openContextMenu({
        name: 'Créer une zone',
        position: { x: position.x, y: position.y },
        options,
        customContextMenu: {
            onSelect: (optionId: string) => handleOptionSelect(optionId, position)
        }
    }));
}; 
