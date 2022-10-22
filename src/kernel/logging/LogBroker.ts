import { KernelElement } from "../bases/KernelElement";
import { Kernel } from "../kernel";
import { LogTargetConsole } from "./targets/LogConsole";
import { LogTargetFIle } from "./targets/LogFile";
import { ILogTarget } from "./types/ILogTarget";

export class LogBroker extends KernelElement {
  constructor(readonly kernel: Kernel) {
    super("logs", kernel);
    this.targets = [
      new LogTargetFIle(kernel, this),
      new LogTargetConsole(kernel, this),
    ];
  }

  targets: ILogTarget[];
}
