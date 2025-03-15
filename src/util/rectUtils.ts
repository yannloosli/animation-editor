/**
 * Utilitaires pour manipuler les objets Rect
 */

/**
 * Convertit un Rect avec x, y en Rect avec left, top
 */
export const convertRectToLeftTop = (rect: { x: number; y: number; width: number; height: number }): { left: number; top: number; width: number; height: number } => {
    return {
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height
    };
};

/**
 * Convertit un Rect avec left, top en Rect avec x, y
 */
export const convertRectToXY = (rect: { left: number; top: number; width: number; height: number }): { x: number; y: number; width: number; height: number } => {
    return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
    };
};

/**
 * Type étendu de Rect qui inclut à la fois les propriétés x, y et left, top
 */
export interface ExtendedRect {
    x: number;
    y: number;
    left: number;
    top: number;
    width: number;
    height: number;
}

/**
 * Crée un ExtendedRect à partir d'un Rect avec x, y
 */
export const createExtendedRectFromXY = (rect: { x: number; y: number; width: number; height: number }): ExtendedRect => {
    return {
        x: rect.x,
        y: rect.y,
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height
    };
};

/**
 * Crée un ExtendedRect à partir d'un Rect avec left, top
 */
export const createExtendedRectFromLeftTop = (rect: { left: number; top: number; width: number; height: number }): ExtendedRect => {
    return {
        x: rect.left,
        y: rect.top,
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height
    };
};

/**
 * Convertit un ExtendedRect en Rect standard
 */
export const convertExtendedRectToRect = (extendedRect: ExtendedRect): Rect => {
    return {
        x: extendedRect.x || extendedRect.left,
        y: extendedRect.y || extendedRect.top,
        width: extendedRect.width,
        height: extendedRect.height
    };
};

/**
 * Convertit un Rect standard en ExtendedRect
 * Utilise des assertions de type pour gérer les différents formats de rectangles
 */
export const convertRectToExtendedRect = (rect: Rect): ExtendedRect => {
    // Convertir d'abord en RectXY pour avoir accès aux propriétés x et y
    const rectXY = convertToRectXY(rect);

    return {
        x: rectXY.x,
        y: rectXY.y,
        left: rectXY.x,
        top: rectXY.y,
        width: rect.width,
        height: rect.height
    };
};

/**
 * Utilitaires pour la conversion entre différents formats de rectangles
 * Ces fonctions permettent de gérer les différences entre les formats de rectangles
 * utilisés dans l'application (x/y vs left/top)
 */

/**
 * Interface pour un rectangle avec les propriétés x, y, width, height
 */
export interface RectXY {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * Interface pour un rectangle avec les propriétés left, top, width, height
 */
export interface RectLeftTop {
    left: number;
    top: number;
    width: number;
    height: number;
}

/**
 * Type union pour les deux formats de rectangles
 */
export type Rect = RectXY | RectLeftTop;

/**
 * Vérifie si un rectangle utilise le format x/y
 * @param rect Rectangle à vérifier
 * @returns true si le rectangle utilise le format x/y, false sinon
 */
export const isRectXY = (rect: Rect): rect is RectXY => {
    return 'x' in rect && 'y' in rect;
};

/**
 * Vérifie si un rectangle utilise le format left/top
 * @param rect Rectangle à vérifier
 * @returns true si le rectangle utilise le format left/top, false sinon
 */
export const isRectLeftTop = (rect: Rect): rect is RectLeftTop => {
    return 'left' in rect && 'top' in rect;
};

/**
 * Convertit un rectangle au format x/y
 * @param rect Rectangle à convertir
 * @returns Rectangle au format x/y
 */
export const convertToRectXY = (rect: Rect): RectXY => {
    if (isRectXY(rect)) {
        return rect;
    }
    return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
    };
};

/**
 * Convertit un rectangle au format left/top
 * @param rect Rectangle à convertir
 * @returns Rectangle au format left/top
 */
export const convertToRectLeftTop = (rect: Rect): RectLeftTop => {
    if (isRectLeftTop(rect)) {
        return rect;
    }
    // Utiliser une assertion de type pour éviter les erreurs de typage
    const rectXY = rect as RectXY;
    return {
        left: rectXY.x,
        top: rectXY.y,
        width: rect.width,
        height: rect.height
    };
};

/**
 * Normalise un rectangle en s'assurant que width et height sont positifs
 * @param rect Rectangle à normaliser
 * @returns Rectangle normalisé
 */
export const normalizeRect = (rect: Rect): Rect => {
    if (isRectXY(rect)) {
        let { x, y, width, height } = rect;

        if (width < 0) {
            x += width;
            width = -width;
        }

        if (height < 0) {
            y += height;
            height = -height;
        }

        return { x, y, width, height };
    } else {
        let { left, top, width, height } = rect;

        if (width < 0) {
            left += width;
            width = -width;
        }

        if (height < 0) {
            top += height;
            height = -height;
        }

        return { left, top, width, height };
    }
};

/**
 * Vérifie si un point est à l'intérieur d'un rectangle
 * @param rect Rectangle à vérifier
 * @param x Coordonnée x du point
 * @param y Coordonnée y du point
 * @returns true si le point est à l'intérieur du rectangle, false sinon
 */
export const isPointInRect = (rect: Rect, x: number, y: number): boolean => {
    const rectXY = convertToRectXY(rect);
    return (
        x >= rectXY.x &&
        x <= rectXY.x + rectXY.width &&
        y >= rectXY.y &&
        y <= rectXY.y + rectXY.height
    );
};

/**
 * Vérifie si deux rectangles se chevauchent
 * @param rect1 Premier rectangle
 * @param rect2 Deuxième rectangle
 * @returns true si les rectangles se chevauchent, false sinon
 */
export const doRectsOverlap = (rect1: Rect, rect2: Rect): boolean => {
    const r1 = convertToRectXY(rect1);
    const r2 = convertToRectXY(rect2);

    return !(
        r1.x + r1.width < r2.x ||
        r2.x + r2.width < r1.x ||
        r1.y + r1.height < r2.y ||
        r2.y + r2.height < r1.y
    );
};

/**
 * Convertit un rectangle dans le format spécifié
 * @param rect Rectangle à convertir
 * @param targetFormat Format cible ('xy' ou 'lefttop')
 * @returns Rectangle converti
 */
export const convertRectFormat = (rect: Rect, targetFormat: 'xy' | 'lefttop'): RectXY | RectLeftTop => {
    if (targetFormat === 'xy') {
        return convertToRectXY(rect);
    } else {
        return convertToRectLeftTop(rect);
    }
}; 
