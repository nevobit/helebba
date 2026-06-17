import { withPrefix } from "@hlb/constant-definitions";
import { RouteOptions } from "fastify";
import { createContactRoute } from "./create";
import { updateContactRoute } from "./update";
import { deleteContactRoute } from "./delete";
import { softDeleteContactRoute } from "./soft-delete";
import { getContactByIdRoute } from "./get-by-id";
import { listContactsRoute } from "./list";


export const contactRoutes: RouteOptions[] = withPrefix('/contacts', [
    listContactsRoute,
    createContactRoute,
    updateContactRoute,
    deleteContactRoute,
    softDeleteContactRoute,
    getContactByIdRoute
]);
