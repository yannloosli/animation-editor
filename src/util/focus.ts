export const elementHasKeyboardFocus = () => {


    if (!document.activeElement) {

        return false;
    }

    const hasFocus = document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA";


    return hasFocus;
};

export const clearElementFocus = () => {


    if (document.activeElement && (document.activeElement as HTMLInputElement).blur) {

        (document.activeElement as HTMLInputElement).blur();
    }
};
