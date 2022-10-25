import { EndpointRouteMethod } from "./IEndpointRoute";
import type { Handler } from "express";
import { IKernelElement } from "../kernel/IKernelElement";
export interface IEndpointsBroker extends IKernelElement {
  registerRoute: (
    method: EndpointRouteMethod,
    path: string,
    handler: Handler
  ) => Promise<void>;
}
