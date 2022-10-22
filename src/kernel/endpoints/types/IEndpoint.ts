import { IEndpointRoute } from "./IEndpointRoute";

export interface IEndpoint {
  name: string;

  open: (routes: IEndpointRoute[]) => Promise<void>;
  close: () => Promise<void>;
}
