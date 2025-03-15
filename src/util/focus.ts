export const elementHasKeyboardFocus = () => {
    console.log('elementHasKeyboardFocus appelé');

    if (!document.activeElement) {
        console.log('Pas d\'élément actif');
        return false;
    }

    const hasFocus = document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA";
    console.log('Élément actif:', document.activeElement.tagName, 'hasFocus:', hasFocus);

    return hasFocus;
};

export const clearElementFocus = () => {
    console.log('clearElementFocus appelé');

    if (document.activeElement && (document.activeElement as HTMLInputElement).blur) {
        console.log('Suppression du focus de:', document.activeElement.tagName);
        (document.activeElement as HTMLInputElement).blur();
    }
};
