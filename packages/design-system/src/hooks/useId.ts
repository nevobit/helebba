import * as React from "react";

let serverHandoffComplete = false;
let idCounter = 0;

export function useId(prefix = "ds-") {
    const reactId = (React as unknown as { useId?: () => string }).useId?.();
    const [id, setId] = React.useState<string | undefined>(serverHandoffComplete ? `${prefix}${++idCounter}` : undefined);
    React.useEffect(() => {
        if (id == null) setId(`${prefix}${++idCounter}`);
    }, [id, prefix]);

    React.useEffect(() => {
        if (!serverHandoffComplete) serverHandoffComplete = true;
    }, []);

    return reactId ?? id!;
}
