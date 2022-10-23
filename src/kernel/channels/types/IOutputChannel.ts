import { IKernelElement } from "../../bases/KernelElement";
import { IOutputMessage } from "./IOutputMessage";

export interface IOutputChannel extends IKernelElement {
  opened: boolean;
  output: (message: IOutputMessage) => Promise<void>;
  open: () => Promise<void>;
  close: () => Promise<void>;
}
