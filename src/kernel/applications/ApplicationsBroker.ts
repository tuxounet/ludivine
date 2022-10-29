import { ShellApp } from "../../apps/shell";
import { applications, kernel } from "@ludivine/types";
import { bases } from "@ludivine/abstractions";
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

  async executeAndWait(app: applications.IAppElement): Promise<number> {
    return await app.execute();
  }

  async executeRootProcess(): Promise<number> {
    const shellApp = new ShellApp(this.kernel, this);
    const rc = await this.executeAndWait(shellApp);
    return rc;
  }
}
