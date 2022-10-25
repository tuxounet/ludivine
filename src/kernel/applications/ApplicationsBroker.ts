import { ShellApp } from "../../apps/shell";

import { bases, kernel } from "@ludivine/shared";

export class ApplicationsBroker extends bases.KernelElement {
  constructor(readonly kernel: kernel.IKernel) {
    super("applications-broker", kernel);
  }

  async initialize(): Promise<void> {}

  async shutdown(): Promise<void> {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  }

  async executeAndWait(app: bases.IAppElement): Promise<number> {
    return await app.execute();
  }

  async executeRootProcess(): Promise<number> {
    const shellApp = new ShellApp(this.kernel, this);
    const rc = await this.executeAndWait(shellApp);
    return rc;
  }
}
