import { IKernelElement } from "../kernel/IKernelElement";
import { ILogLine } from "./types/ILogLine";

export interface ILogBroker extends IKernelElement {
  output: (line: ILogLine) => void;
}
