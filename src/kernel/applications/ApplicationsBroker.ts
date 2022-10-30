import { ShellApp } from "../../apps/shell";
import {
  bases,
  kernel,
  applications,
  modules,
  errors,
} from "@ludivine/runtime";
export class ApplicationsBroker
  extends bases.KernelElement
  implements applications.IApplicationsBroker
{
  constructor(readonly kernel: kernel.IKernel) {
    super("applications-broker", kernel);
    this.applications = new Map();
  }

  applications: Map<string, applications.IAppElement>;

  async initialize(): Promise<void> {
    await super.initialize();
  }

  async shutdown(): Promise<void> {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
    await super.shutdown();
  }

  async executeAndWait(app: applications.IAppElement): Promise<number> {
    return await app.execute();
  }

  async executeRootProcess(): Promise<number> {
    const shellApp = new ShellApp(this.kernel, this);

    const apps = [
      this.executeAndWait(shellApp),
      // this.launchApplication("shell-natural"),
    ];

    const rcs = await Promise.all(apps);
    return rcs.filter((item) => item > 0).length;
  }

  private readonly findApplicationDescriptor = async (
    name: string
  ): Promise<modules.IModuleApplicationDescriptor | undefined> => {
    const result = Array.from(this.kernel.modules.modules.values())
      .map((item) => item.definition.applications)
      .flat()
      .find((item) => item?.name === name);

    return result;
  };

  launchApplication = async (name: string): Promise<number> => {
    const descriptor = await this.findApplicationDescriptor(name);
    if (descriptor == null) {
      throw errors.BasicError.notFound(
        this.fullName,
        "launchApplication/descriptor",
        name
      );
    }

    const app: applications.IAppElement = descriptor.ctor(this.kernel, this);
    const key = app.fullName;
    this.applications.set(key, app);

    return await app
      .execute()
      .then((rc) => {
        this.applications.delete(key);
        return rc;
      })
      .catch((e) => {
        this.log.error("application failed", descriptor.name, e);
        this.applications.delete(key);
        throw errors.BasicError.badQuery(
          app.fullName,
          "application failed",
          descriptor.name
        );
      });
  };
}
