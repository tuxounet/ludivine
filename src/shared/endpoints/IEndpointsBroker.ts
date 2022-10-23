import { EndpointRouteMethod } from "./IEndpointRoute";
import type { Handler } from "express";
export interface IEndpointsBroker {
  registerRoute: (
    method: EndpointRouteMethod,
    path: string,
    handler: Handler
  ) => Promise<void>;
}
