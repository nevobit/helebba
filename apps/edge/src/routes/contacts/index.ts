import { withPrefix } from "@hlb/constant-definitions";
import { RouteOptions } from "fastify";
import { createContactRoute } from "./create";

export const contactRoutes: RouteOptions[] = withPrefix('/contacts', [createContactRoute])