import { store, storeRTK } from "./store-init";
import { ApplicationState } from "./store-types";

// Fonction pour tester la synchronisation
export const testStoreSync = () => {
    console.log("=== Test de synchronisation des stores ===");

    // Test 1 : Action de l'ancien store vers RTK
    console.log("\nTest 1 : Action de l'ancien store vers RTK");
    const oldAction = { type: "TEST_OLD_ACTION", payload: "test" };
    store.dispatch(oldAction);
    console.log("État RTK après action ancienne:", storeRTK.getState());

    // Test 2 : Action de RTK vers l'ancien store
    console.log("\nTest 2 : Action de RTK vers l'ancien store");
    const rtkAction = { type: "toolkit/TEST_RTK_ACTION", payload: "test" };
    storeRTK.dispatch(rtkAction);
    console.log("État ancien après action RTK:", store.getState());

    // Test 3 : Vérification de la synchronisation
    console.log("\nTest 3 : Vérification de la synchronisation");
    const oldState = store.getState();
    const rtkState = storeRTK.getState();
    
    // Comparer chaque partie de l'état
    (Object.keys(oldState) as Array<keyof ApplicationState>).forEach(key => {
        const oldValue = oldState[key];
        const rtkValue = rtkState[key];
        console.log(`\nComparaison de ${key}:`, {
            oldValue,
            rtkValue,
            areEqual: JSON.stringify(oldValue) === JSON.stringify(rtkValue)
        });
    });

    console.log("\nÉtats synchronisés:", JSON.stringify(oldState) === JSON.stringify(rtkState));
}; 
