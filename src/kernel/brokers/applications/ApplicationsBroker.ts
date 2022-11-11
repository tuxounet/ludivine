import { ShellApp } from "../../../apps/shell";
import {
  bases,
  applications,
  modules,
  errors,
  sessions,
  messaging,
} from "@ludivine/runtime";
import type { kernel } from "@ludivine/runtime";

export class ApplicationsBroker
  extends bases.KernelElement
  implements applications.IApplicationsBroker
{
  constructor(readonly kernel: kernel.IKernel) {
    super("applications", kernel);
    this.applications = new Map();
    this.sessions = this.kernel.container.get("sessions");
    this.modules = this.kernel.container.get("modules");
    this.messaging = this.kernel.container.get("messaging");
  }

  readonly sessions: sessions.ISessionsBroker;
  readonly modules: modules.IModulesBroker;
  readonly messaging: messaging.IMessagingBroker;

  readonly applications: Map<string, applications.IAppElement>;

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

  async executeRootProcess(): Promise<number> {
    const sessionId = await this.sessions.begin();
    const session = await this.sessions.get(sessionId);

    const shellApp = new ShellApp(session);
    this.applications.set(shellApp.fullName, shellApp);

    const apps = [shellApp.execute()];

    const rcs = await Promise.all(apps);
    return rcs.filter((item) => item > 0).length;
  }

  private readonly findApplicationDescriptor = async (
    name: string
  ): Promise<modules.IModuleApplicationDescriptor | undefined> => {
    const result = Array.from(this.modules.modules.values())
      .map((item) => item.definition.applications)
      .flat()
      .find((item) => item?.name === name);

    return result;
  };

  launchApplication = async (
    sessionId: string,
    name: string
  ): Promise<number> => {
    const session = await this.sessions.get(sessionId);

    const descriptor = await this.findApplicationDescriptor(name);
    if (descriptor == null) {
      throw errors.BasicError.notFound(
        this.fullName,
        "launchApplication/descriptor",
        name
      );
    }

    const app: applications.IAppElement = descriptor.ctor(session);
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
