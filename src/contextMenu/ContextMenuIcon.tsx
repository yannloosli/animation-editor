import React from 'react';
import { EditIcon } from '~/components/icons/EditIcon';
import { PenIcon } from '~/components/icons/PenIcon';

interface Props {
    iconName?: string;
}

export const ContextMenuIcon: React.FC<Props> = ({ iconName }) => {
    if (!iconName) return null;

    switch (iconName) {
        case 'edit':
            return <EditIcon />;
        case 'pen':
            return <PenIcon />;
        default:
            return null;
    }
}; 
