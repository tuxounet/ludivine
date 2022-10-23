import { IKernelElement } from "../../kernel/IKernelElement";
import { ILogLine } from "./ILogLine";

export interface ILogTarget extends IKernelElement {
  appendLog: (line: ILogLine) => void;
}
