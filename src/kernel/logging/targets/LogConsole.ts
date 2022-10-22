import { KernelElement } from "../../bases/KernelElement";
import { Kernel } from "../../kernel";
import { ILogTarget } from "../types/ILogTarget";
import { LogLevels } from "../types/LogLevels";

export class LogTargetConsole extends KernelElement implements ILogTarget {
  constructor(readonly kernel: Kernel, parent: KernelElement) {
    super("log-target-console", parent);
  }

  appendLog(level: LogLevels, ...parts: string[]): void {
    throw new Error("Method not implemented.");
  }
}
