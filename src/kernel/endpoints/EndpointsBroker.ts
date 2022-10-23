import { KernelElement } from "../../shared/bases/KernelElement";
import { Kernel } from "../kernel";
import { Handler } from "express";
import { IEndpoint } from "../../shared/endpoints/IEndpoint";
import { HttpEndpoint } from "./http/HttpEndpoint";
import {
  EndpointRouteMethod,
  IEndpointRoute,
} from "../../shared/endpoints/IEndpointRoute";
import { IEndpointsBroker } from "../../shared/endpoints/IEndpointsBroker";
export class EndpointsBroker extends KernelElement implements IEndpointsBroker {
  constructor(readonly kernel: Kernel) {
    super("endpoints-broker", kernel);
    this.endpoints = [new HttpEndpoint(kernel, this)];
    this.routes = [];
  }

  endpoints: IEndpoint[];
  routes: IEndpointRoute[];

  async initialize(): Promise<void> {
    await this.openEndpoints();
  }

  async shutdown(): Promise<void> {
    await this.closeEndpoints();
  }

  async openEndpoints(): Promise<void> {
    await Promise.all(
      this.endpoints.map(async (item) => await item.open(this.routes))
    );
  }

  async closeEndpoints(): Promise<void> {
    await Promise.all(this.endpoints.map(async (item) => await item.close()));
  }

  async registerRoute(
    method: EndpointRouteMethod,
    path: string,
    handler: Handler
  ): Promise<void> {
    this.routes.push({
      path,
      method,
      handler,
    });
  }

  async unregisterRoute(
    method: EndpointRouteMethod,
    path: string
  ): Promise<void> {
    this.routes = this.routes.filter(
      (item) => item.method !== method && item.path !== path
    );
  }
}
