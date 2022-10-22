import type { Handler } from "express";
export type EndpointRouteMethod = "GET" | "POST" | "ALL";
export interface IEndpointRoute {
  path: string;
  method: EndpointRouteMethod;
  handler: Handler;
}
