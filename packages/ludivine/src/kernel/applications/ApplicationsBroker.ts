import { ShellApp } from "../../apps/shell";
import { IAppElement } from "../../shared/bases/AppElement";
import { KernelElement } from "../../shared/bases/KernelElement";
import { IKernel } from "../../shared/kernel/IKernel";

export class ApplicationsBroker extends KernelElement {
  constructor(readonly kernel: IKernel) {
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

  async executeAndWait(app: IAppElement): Promise<number> {
    return await app.execute();
  }

  async executeRootProcess(): Promise<number> {
    const shellApp = new ShellApp(this.kernel, this);
    const rc = await this.executeAndWait(shellApp);
    return rc;
  }
}
