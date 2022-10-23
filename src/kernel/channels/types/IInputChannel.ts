import { IKernelElement } from "../../bases/KernelElement";

export interface IChannelInputResult {
  sender: IInputChannel;
  raw: string;
}

export interface IInputChannel extends IKernelElement {
  opened: boolean;
  open: () => Promise<void>;
  close: () => Promise<void>;
}
