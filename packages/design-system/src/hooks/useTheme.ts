import { useCallback, useEffect, useState } from "react";
import { isWeb } from "../utils/platform";

export type Theme = "light" | "dark";

export const useTheme = () => {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (!isWeb) return "light";
        return (document.documentElement.getAttribute("data-theme") as Theme) || "light";
    });

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t);
        if (isWeb) document.documentElement.setAttribute("data-theme", t);
    }, []);

    useEffect(() => {
        if (!isWeb) return;
        const current = document.documentElement.getAttribute("data-theme");
        if (!current) document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    return { theme, setTheme };
};
