import { IKernelElement } from "../kernel/IKernelElement";
import {
  IComputeSourceCode,
  IComputeExecuteResult,
  IComputeProjectCode,
} from "./IComputeRuntime";

export interface IComputeBroker extends IKernelElement {
  executeSource: (
    runtime: string,
    source: IComputeSourceCode
  ) => Promise<IComputeExecuteResult>;

  executeProject: (
    runtime: string,
    project: IComputeProjectCode
  ) => Promise<IComputeExecuteResult>;
}
