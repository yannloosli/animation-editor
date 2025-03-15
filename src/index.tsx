import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { App } from "~/App";
import { initContextMenu } from "~/contextMenu/initContextMenu";
import { store } from "~/state/store-init";

// Initialiser les handlers du menu contextuel
initContextMenu();

const root = createRoot(document.getElementById("root")!);
root.render(
    <Provider store={store}>
        <App />
    </Provider>
); 
