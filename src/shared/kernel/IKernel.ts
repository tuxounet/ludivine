import { ILogBroker } from "../logging/ILogBroker";
import { IKernelElement } from "./IKernelElement";

export interface IKernel {
  logging: ILogBroker;
  readonly fullName: string;
  initialize: () => Promise<void>;
  shutdown: () => Promise<void>;
}
