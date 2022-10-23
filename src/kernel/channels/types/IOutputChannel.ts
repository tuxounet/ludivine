import { IKernelElement } from "../../bases/KernelElement";

export interface IOutputChannel extends IKernelElement {
  opened: boolean;
  output: (message: string) => Promise<void>;
  open: () => Promise<void>;
  close: () => Promise<void>;
}
