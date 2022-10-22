import { KernelElement } from "../bases/KernelElement";
import { Kernel } from "../kernel";
import type { Handler } from "express";
import { IEndpoint } from "./types/IEndpoint";
import { HttpEndpoint } from "./http/HttpEndpoint";
import { EndpointRouteMethod, IEndpointRoute } from "./types/IEndpointRoute";
export class EndpointsBroker extends KernelElement {
  constructor(readonly kernel: Kernel) {
    super("endpoints-broker", kernel);
    this.endpoints = [new HttpEndpoint(kernel, this)];
    this.routes = [];
  }

  endpoints: IEndpoint[];
  routes: IEndpointRoute[];

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
