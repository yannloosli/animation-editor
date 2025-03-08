import { AreaType } from "~/constants";
import { SerializableContextMenuOption } from "~/contextMenu/contextMenuSlice";

interface AreaContextMenuProps {
    id: string;
}

interface AreaContextMenuResult {
    options: SerializableContextMenuOption[];
    id: string;
}

export const AreaContextMenu = ({ id }: AreaContextMenuProps): AreaContextMenuResult => {
    const options: SerializableContextMenuOption[] = Object.values(AreaType).map(type => ({
        id: `area_type_${type}`,
        label: type,
        default: type === AreaType.Workspace
    }));

    return { options, id };
}; 
