import { IKernelElement } from "../kernel/IKernelElement";
import { LogLevels } from "./types/LogLevels";

export interface ILogBroker extends IKernelElement {
  output: (level: LogLevels, line: string) => void;
}
