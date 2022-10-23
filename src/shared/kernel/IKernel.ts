import { IEndpointsBroker } from "../endpoints/IEndpointsBroker";
import { ILogBroker } from "../logging/ILogBroker";
import { IStorageBroker } from "../storage/IStorageBroker";

export interface IKernel {
  logging: ILogBroker;
  storage: IStorageBroker;
  endpoints: IEndpointsBroker;
  readonly fullName: string;
  initialize: () => Promise<void>;
  shutdown: () => Promise<void>;
}
