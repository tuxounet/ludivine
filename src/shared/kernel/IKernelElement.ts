import { IKernel } from "./IKernel";

export interface IKernelElement {
  readonly fullName: string;
  readonly kernel: IKernel;
  initialize: () => Promise<void>;
  shutdown: () => Promise<void>;
}
