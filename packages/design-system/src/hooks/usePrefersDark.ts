import { useEffect, useState } from "react";
import { isWeb } from "../utils/platform";

export const usePrefersDark = () => {
    const [preferred, setPreferred] = useState(false);
    useEffect(() => {
        if (!isWeb) return;
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => setPreferred(media.matches);
        handler();
        media.addEventListener("change", handler);
        return () => media.removeEventListener("change", handler);
    }, []);
    return preferred;
};
