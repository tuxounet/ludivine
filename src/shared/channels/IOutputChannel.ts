import { IKernelElement } from "../kernel/IKernelElement";
import { IOutputMessage } from "./IOutputMessage";

export interface IOutputChannel extends IKernelElement {
  opened: boolean;
  output: (message: IOutputMessage) => Promise<void>;
  open: () => Promise<void>;
  close: () => Promise<void>;
}
