import { Handler } from "express";
import { bases, kernel, endpoints } from "@tuxounet/ludivine-shared";
import { HttpEndpoint } from "./http/HttpEndpoint";
export class EndpointsBroker
  extends bases.KernelElement
  implements endpoints.IEndpointsBroker
{
  constructor(readonly kernel: kernel.IKernel) {
    super("endpoints-broker", kernel);
    this.endpoints = [new HttpEndpoint(kernel, this)];
    this.routes = [];
  }

  endpoints: endpoints.IEndpoint[];
  routes: endpoints.IEndpointRoute[];

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
    method: endpoints.EndpointRouteMethod,
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
    method: endpoints.EndpointRouteMethod,
    path: string
  ): Promise<void> {
    this.routes = this.routes.filter(
      (item) => item.method !== method && item.path !== path
    );
  }
}
