import { useCallback } from "react";
import { requestAction } from "~/listener/requestAction";
import { Vec2 } from "~/util/math/vec2";

interface Vec2InputActionOptions {
    onChange: (value: Vec2, params: any) => void;
    onChangeEnd: (type: "relative" | "absolute", params: any) => void;
}

export function useVec2InputAction(options: Vec2InputActionOptions) {
    const { onChange, onChangeEnd } = options;

    const handleChange = useCallback(
        (value: Vec2) => {
            requestAction({ history: false }, (params) => {
                onChange(value, params);
            });
        },
        [onChange]
    );

    const handleChangeEnd = useCallback(
        (type: "relative" | "absolute") => {
            requestAction({ history: true }, (params) => {
                onChangeEnd(type, params);
            });
        },
        [onChangeEnd]
    );

    return {
        onChange: handleChange,
        onChangeEnd: handleChangeEnd,
    };
} 
