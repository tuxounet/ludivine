import { IKernelElement } from "../kernel/IKernelElement";

export interface IChannelsBroker extends IKernelElement {
  broadcast: (message: string) => Promise<void>;
}
