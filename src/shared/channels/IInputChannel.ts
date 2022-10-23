import { IKernelElement } from "../kernel/IKernelElement";

export interface IChannelInputResult {
  sender: IInputChannel;
  raw: string;
}

export interface IInputChannel extends IKernelElement {
  opened: boolean;
  open: () => Promise<void>;
  close: () => Promise<void>;
}
