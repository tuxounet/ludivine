import { KernelElement } from "../../bases/KernelElement";
import { Kernel } from "../../kernel";
import { ILogTarget } from "../types/ILogTarget";
import { LogLevels } from "../types/LogLevels";

export class LogTargetFIle extends KernelElement implements ILogTarget {
  constructor(readonly kernel: Kernel, parent: KernelElement) {
    super("log-target-file", parent);
  }

  appendLog(level: LogLevels, ...parts: string[]): void {
    throw new Error("Method not implemented.");
  }
}
