import { debounce } from 'lodash';
import * as PIXI from "pixi.js";
import ReactDOM from "react-dom";
import { ErrorBoundary } from 'react-error-boundary';
import { Provider } from "react-redux";
import { DiffType } from "~/diff/diffs";
import "~/globals";
import { sendDiffsToSubscribers } from "~/listener/diffListener";
import { getActionState } from "~/state/stateUtils";
import { store } from "~/state/store-init";
import { testStoreSync } from "~/state/store-sync-test";
import "~/state/undoRedo";
import { App } from "./App";

// If unsafe-eval is present in CSP, this can be used to fix that.

// import { install } from "@pixi/unsafe-eval";
// install(PIXI);

PIXI.utils.skipHello();

const ErrorFallback = ({ error }: { error: Error }) => (
    <div role="alert">
        <p>Une erreur est survenue :</p>
        <pre>{error.message}</pre>
    </div>
);

ReactDOM.render(
    <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Provider store={store}>
            <App />
        </Provider>
    </ErrorBoundary>,
    document.getElementById("root")
);

// Disable right click context menu
document.addEventListener("contextmenu", (e) => e.preventDefault(), false);

const handleResize = debounce(() => {
    requestAnimationFrame(() => {
        sendDiffsToSubscribers(getActionState(), [{ type: DiffType.ResizeAreas }]);
    });
}, 100);

window.addEventListener("resize", handleResize);

// Exposer la fonction de test dans la console
(window as any).testStoreSync = testStoreSync;
