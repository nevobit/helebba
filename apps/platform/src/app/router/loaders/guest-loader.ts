import { useSession } from "@/shared";
import { redirect } from "react-router-dom";

export function guestLoader() {
    const isAuth = useSession.getState().isAuthenticated();
    if (isAuth) throw redirect("/");
    return null;
}
