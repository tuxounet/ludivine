import { IEndpointsBroker } from "../endpoints/IEndpointsBroker";
import { ILogBroker } from "../logging/ILogBroker";
import { IMessagingBroker } from "../messaging/IMessagingBroker";
import { IStorageBroker } from "../storage/IStorageBroker";

export interface IKernel {
  started: boolean;
  logging: ILogBroker;
  storage: IStorageBroker;
  endpoints: IEndpointsBroker;
  messaging: IMessagingBroker;
  readonly fullName: string;
  initialize: () => Promise<void>;
  shutdown: () => Promise<void>;
}
